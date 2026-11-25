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
    assert.equal(api.tokensFor(30, st), 300 + 30 * 80);
});
