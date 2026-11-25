const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');

const source = readFileSync(join(__dirname, '..', 'index.js'), 'utf8');

function load({ lang = '', extensionSettings = {} } = {}) {
    const hook = {};
    const sandbox = {
        __TBD_TEST__: hook,
        SillyTavern: { getContext: () => ({ extensionSettings, saveSettingsDebounced() {} }) },
        localStorage: { getItem: k => (k === 'language' ? lang : null) },
        navigator: { language: 'en-US' },
        Event: class { constructor(type, o) { this.type = type; Object.assign(this, o); } },
        document: { getElementById: () => null },
        jQuery: () => { throw new Error('init should not run in tests'); },
    };
    sandbox.globalThis = sandbox;
    vm.runInNewContext(source, sandbox);
    return { api: hook.api, extensionSettings };
}

// Same numbers every time, so tests are stable.
function seeded(seed = 1) {
    let s = seed;
    return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

test('every seed is different enough and respects length', () => {
    const { api } = load();
    const seeds = api.rollSeeds(30, { length: 'short' }, seeded(7));
    assert.equal(seeds.length, 30);
    for (const s of seeds) {
        assert.ok(s.syllables >= 1 && s.syllables <= 2);
        assert.ok(s.start && s.texture && s.spark);
    }
    const combos = new Set(seeds.map(s => `${s.start}|${s.texture}|${s.spark}`));
    assert.ok(combos.size > 25, 'seeds should rarely repeat');
});

test('must-contain drops the forced start letter', () => {
    const { api } = load();
    const seeds = api.rollSeeds(10, { mustContain: 'ren' }, seeded(3));
    assert.ok(seeds.every(s => s.start === undefined));
});

test('prompt carries seeds, avoid list and note language', () => {
    const { api } = load();
    const form = { target: 'person', vibe: 'custom', customVibe: 'foggy harbor', gender: 'feminine', length: 'any', mustContain: '' };
    const seeds = api.rollSeeds(3, form, seeded(5));
    const msgs = api.buildMessages(form, seeds, { lang: 'ko', avoid: ['Elara', 'Brindle'] });
    const user = msgs[1].content;
    assert.match(user, /Invent 3 original names/);
    assert.match(user, /foggy harbor/);
    assert.match(user, /Gender feel: feminine/);
    assert.match(user, /Do NOT use these names.*Elara, Brindle/);
    assert.match(user, /in Korean/);
    assert.match(user, /1\. starts with/);
    assert.match(user, /3\. starts with/);
});

test('gender is left out for non-person targets', () => {
    const { api } = load();
    const form = { target: 'place', vibe: 'fantasy', gender: 'masculine', length: 'any', mustContain: '' };
    const msgs = api.buildMessages(form, api.rollSeeds(1, form, seeded(2)), {});
    assert.doesNotMatch(msgs[1].content, /Gender feel/);
});

test('reads a JSON answer, even wrapped in thinking and code fences', () => {
    const { api } = load();
    const raw = '<think>hmm [not this]</think>\n```json\n[{"name":"Brindlecote","note":"cozy hedge"},{"name":"Harrowick","meaning":"old ford town"}]\n```';
    const out = api.parseNames(raw);
    assert.deepEqual([...out.map(n => n.name)], ['Brindlecote', 'Harrowick']);
    assert.equal(out[1].note, 'old ford town');
});

test('falls back to numbered lines when JSON is broken', () => {
    const { api } = load();
    const raw = '1. **Tamsell** — salt and bells\n2. Corvane: crow-dark\n- Pellow - soft pillow sound';
    const out = api.parseNames(raw);
    assert.deepEqual([...out.map(n => n.name)], ['Tamsell', 'Corvane', 'Pellow']);
});

test('filter removes avoided and repeated names, ignoring case', () => {
    const { api } = load();
    const out = api.filterNames(
        [{ name: 'Elara' }, { name: 'Quillon' }, { name: 'quillon' }, { name: 'Marrow' }],
        ['elara'],
    );
    assert.deepEqual([...out.map(n => n.name)], ['Quillon', 'Marrow']);
});

test('history is remembered, capped, and feeds the avoid list', () => {
    const { api } = load();
    const st = api.settings();
    st.historySize = 10;
    api.rememberNames(Array.from({ length: 15 }, (_, i) => `Name${i}`), st);
    assert.equal(st.history.length, 10);
    assert.equal(st.history[0], 'Name5');
    assert.ok(api.avoidList(st).includes('Name14'));
    st.rememberHistory = false;
    assert.ok(!api.avoidList(st).includes('Name14'));
    assert.ok(api.avoidList(st).includes('Elara'), 'clichés are always avoided');
});

test('own ban list splits on commas and new lines', () => {
    const { api } = load();
    const st = api.settings();
    st.banList = 'Foo, Bar\nBaz';
    const avoid = api.avoidList(st);
    for (const n of ['Foo', 'Bar', 'Baz']) assert.ok(avoid.includes(n));
});

test('settings fill defaults and clamp the count', () => {
    const extensionSettings = { tbd_names: { count: 99, theme: 'nope' } };
    const { api } = load({ extensionSettings });
    const st = api.settings();
    assert.equal(st.count, 30);
    assert.equal(st.theme, 'st');
    assert.equal(st.form.target, 'person');
    assert.equal(st.effects, true);
});

test('language: English by default, Korean when SillyTavern is Korean', () => {
    assert.equal(load({ lang: '' }).api.detectLang('auto'), 'en');
    assert.equal(load({ lang: 'ko-kr' }).api.detectLang('auto'), 'ko');
    assert.equal(load({ lang: 'ko-kr' }).api.detectLang('en'), 'en');
});

test('English and Korean have the same text keys', () => {
    const { api } = load();
    const keys = o => Object.keys(o).sort();
    assert.deepEqual(keys(api.STRINGS.ko), keys(api.STRINGS.en));
    for (const k of ['t', 'v', 'g', 'l', 'th']) assert.deepEqual(keys(api.STRINGS.ko[k]), keys(api.STRINGS.en[k]));
    assert.deepEqual(keys(api.STRINGS.en.th), [...api.THEMES].sort());
});

test('token budget grows with big batches', () => {
    const { api } = load();
    const st = api.settings();
    st.maxTokens = 1000;
    assert.equal(api.tokensFor(5, st), 1000);
    assert.equal(api.tokensFor(30, st), 300 + 30 * 100);
});

test('sound choice goes in the prompt and replaces the random texture', () => {
    const { api } = load();
    const form = { target: 'person', vibe: 'fantasy', gender: 'any', length: 'any', sound: 'hard', mustContain: '' };
    const user = api.buildMessages(form, api.rollSeeds(4, form, seeded(9)), {})[1].content;
    assert.match(user, /Sound: hard and firm/);
    assert.match(user, /not by the letters/);
    assert.doesNotMatch(user, /\d+ syllables?, [a-z-]+ sound/);
    const plain = api.buildMessages({ ...form, sound: 'any' }, api.rollSeeds(2, form, seeded(9)), {})[1].content;
    assert.doesNotMatch(plain, /Sound:/);
});

test('reshape prompt names the source, the direction and the avoid list', () => {
    const { api } = load();
    assert.deepEqual([...api.REFINE_MODES], ['soft', 'hard', 'sharp', 'bright', 'dark', 'shorter', 'longer']);
    const form = { target: 'place', vibe: 'gothic', gender: 'any', length: 'any', sound: 'any', mustContain: '' };
    const msgs = api.buildRefineMessages({ name: 'Dorwick' }, 'bright', form, { lang: 'ko', avoid: ['Dorwick', 'Tirken'] });
    const user = msgs[1].content;
    assert.match(user, /"Dorwick"/);
    assert.match(user, /Make 3 new variants/);
    assert.match(user, /front vowels/);
    assert.match(user, /Do NOT use these names.*Dorwick, Tirken/);
    assert.match(user, /in Korean/);
});

test('reshape prompt asks for real sound changes and can ask for just one', () => {
    const { api } = load();
    const form = { target: 'person', vibe: 'fantasy', gender: 'any', length: 'any', sound: 'any', mustContain: '' };
    const user = api.buildRefineMessages({ name: 'Brinet' }, 'hard', form, { count: 1 })[1].content;
    assert.match(user, /Make 1 new variant that/);
    assert.match(user, /not just by gluing a letter/);
    assert.match(user, /easy to pronounce/);
    assert.match(user, /pull the other way/);
    assert.match(user, /well-known real or mythological name/);
});

test('places get place rules, kind and setting-fitting seeds', () => {
    const { api } = load();
    const form = { target: 'place', vibe: 'scifi', kind: 'planet', kindText: '', gender: 'any', length: 'any', sound: 'any', mustContain: '' };
    const seeds = api.rollSeeds(20, form, seeded(4));
    for (const s of seeds) assert.ok(api.SPARKS.scifi.includes(s.spark), `sci-fi seed should be sci-fi: ${s.spark}`);
    assert.ok(!seeds.some(s => ['-wyn', '-ia', '-el'].includes(s.ending)), 'places never get person endings');
    const user = api.buildMessages(form, seeds.slice(0, 3), {})[1].content;
    assert.match(user, /specifically a planet, moon or space station/);
    assert.match(user, /not like a person's first name/);
    assert.match(user, /tech or corporate roots/);
    assert.match(user, /setting and what is being named come first/);
    assert.match(user, /plain existing English word/);
});

test('custom kind and "other" use the typed text', () => {
    const { api } = load();
    assert.match(api.targetText({ target: 'place', kind: 'custom', kindText: 'a lake where a dragon sleeps' }), /specifically: "a lake where a dragon sleeps"/);
    assert.match(api.targetText({ target: 'other', kindText: 'a pirate ship' }), /"a pirate ship"/);
    assert.equal(api.targetText({ target: 'shop', kind: 'nope' }), 'a shop or business');
});

test('shops and items get a shape and may use real words', () => {
    const { api } = load();
    const form = { target: 'shop', vibe: 'cozy', kind: 'bakery', gender: 'any', length: 'any', sound: 'any', mustContain: '' };
    const seeds = api.rollSeeds(5, form, seeded(6));
    assert.ok(seeds.every(s => s.shape && !s.ending));
    const user = api.buildMessages(form, seeds, {})[1].content;
    assert.match(user, /shape: /);
    assert.match(user, /main word starts with/);
    assert.match(user, /may use real words/);
    assert.doesNotMatch(user, /plain existing English word/);
});

test('reading is asked for only when on, and is read back', () => {
    const { api } = load();
    const form = { target: 'person', vibe: 'fantasy', gender: 'any', length: 'any', sound: 'any', mustContain: '' };
    const seeds = api.rollSeeds(2, form, seeded(1));
    assert.match(api.buildMessages(form, seeds, { lang: 'ko', reading: true })[1].content, /Korean Hangul/);
    assert.match(api.buildMessages(form, seeds, { lang: 'en', reading: true })[1].content, /stressed syllable in capitals/);
    assert.doesNotMatch(api.buildMessages(form, seeds, { lang: 'ko' })[1].content, /"read"/);
    assert.match(api.buildRefineMessages({ name: 'Quilla' }, 'soft', form, { lang: 'ko', reading: true })[1].content, /"read"/);
    const out = api.parseNames('[{"name":"Quilla","read":"퀼라","note":"x"},{"name":"Aren","note":"y"}]');
    assert.equal(out[0].read, '퀼라');
    assert.equal(out[1].read, '');
    const lines = api.parseNames('1. Quilla (KWIL-uh) — soft');
    assert.equal(lines[0].name, 'Quilla');
    assert.equal(lines[0].read, 'KWIL-uh');
    assert.ok(api.settings().showReading, 'reading is on by default');
});

test('kind labels exist in both languages for every kind', () => {
    const { api } = load();
    for (const [target, keys] of Object.entries(api.KINDS)) {
        for (const lang of ['en', 'ko']) assert.deepEqual(Object.keys(api.STRINGS[lang].k[target]).sort(), [...keys].sort(), `${lang} ${target}`);
    }
});
