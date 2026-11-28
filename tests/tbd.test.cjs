const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');

const source = readFileSync(join(__dirname, '..', 'index.js'), 'utf8');

function load({ lang = '', extensionSettings = {}, fetch } = {}) {
    const hook = {};
    const sandbox = {
        __TBD_TEST__: hook,
        SillyTavern: { getContext: () => ({ extensionSettings, saveSettingsDebounced() {} }) },
        localStorage: { getItem: k => (k === 'language' ? lang : null) },
        navigator: { language: 'en-US' },
        Event: class { constructor(type, o) { this.type = type; Object.assign(this, o); } },
        document: { getElementById: () => null },
        jQuery: () => { throw new Error('init should not run in tests'); },
        URLSearchParams,
        fetch,
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
    assert.match(user, /may use real words/);
    assert.match(user, /single bare everyday word/);
    assert.ok(seeds.every(s => s.shape), 'places get a shape too');
    assert.ok(seeds.some(s => /real word/.test(s.shape)) && seeds.some(s => /invented/.test(s.shape)), 'mix of real-word and invented shapes');
    const person = api.buildMessages({ ...form, target: 'person' }, api.rollSeeds(1, { ...form, target: 'person' }, seeded(2)), {})[1].content;
    assert.match(person, /plain existing English word/);
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

test('old kinds carry over to the new everyday lists', () => {
    const { api } = load();
    assert.equal(api.normalizeKind('place', 'castle'), 'fort');
    assert.equal(api.normalizeKind('shop', 'smithy'), 'weapons');
    assert.equal(api.normalizeKind('item', 'potion'), 'medicine');
    assert.equal(api.normalizeKind('item', 'device'), 'device');
    assert.equal(api.normalizeKind('item', 'staff'), 'any');
    assert.equal(api.normalizeKind('person', 'city'), 'any');
    assert.ok(!api.KINDS.item.includes('potion') && !api.KINDS.item.includes('staff'), 'no fantasy-only item kinds left');
});

test('the details box goes into the prompt', () => {
    const { api } = load();
    assert.match(api.targetText({ target: 'item', kind: 'device', kindText: 'a half-broken military drone' }),
        /specifically an electronic device or gadget\. Details from the user: "a half-broken military drone"/);
    // No kind picked: the details say what the thing itself is.
    assert.match(api.targetText({ target: 'place', kind: 'any', kindText: 'an abandoned subway station' }), /a place, namely: "an abandoned subway station" \(the name is for this exact thing/);
    assert.match(api.targetText({ target: 'item', kind: 'any', kindText: '빵' }), /an item or object, namely: "빵"/);
    assert.equal(api.targetText({ target: 'shop', kind: 'bar', kindText: '  ' }), 'a shop or business, specifically a bar or pub');
});

test('one batch does not repeat an ending', () => {
    const { api } = load();
    const form = { target: 'place', vibe: 'scifi', kind: 'any', length: 'any', sound: 'any', mustContain: '' };
    for (let k = 1; k < 30; k++) {
        const ends = api.rollSeeds(8, form, seeded(k)).map(s => s.ending).filter(Boolean);
        assert.equal(new Set(ends).size, ends.length, `seed ${k}: ${ends}`);
    }
    assert.match(api.buildMessages(form, api.rollSeeds(3, form, seeded(1)), {})[1].content, /no two names may share the same ending/);
});

test('person name shape: plain given name stays the old way', () => {
    const { api } = load();
    assert.equal(api.nameShape({ target: 'person', parts: ['given'], extras: [] }), null);
    assert.equal(api.nameShape({ target: 'place', parts: ['given', 'family'] }), null);
    assert.equal(api.nameShape({ target: 'person', parts: [], extras: [] }), null, 'nothing picked falls back to a given name');
    const s = api.nameShape({ target: 'person', parts: ['family', 'given'], extras: ['codename', 'title'], fixedFamily: ' Holloway ' });
    assert.deepEqual([...s.roles], ['title', 'given', 'family', 'codename']);
    assert.equal(s.fixed, 'Holloway');
    assert.equal(api.nameShape({ target: 'person', parts: ['family'], fixedFamily: 'Holloway' }).fixed, '', 'only a kept family name leaves nothing to make');
});

test('full-name prompt lists the parts and asks for parts JSON', () => {
    const { api } = load();
    const form = { target: 'person', vibe: 'medieval', gender: 'feminine', length: 'any', sound: 'any', mustContain: '', parts: ['given', 'family'], extras: ['epithet'], fixedFamily: '' };
    const seeds = api.rollSeeds(4, form, seeded(3));
    assert.ok(seeds.every(s => s.family), 'family style seeds');
    assert.equal(new Set(seeds.map(s => s.family)).size, 4, 'no repeated family style in one batch');
    const user = api.buildMessages(form, seeds, { lang: 'ko', reading: true })[1].content;
    assert.match(user, /full names for a person/);
    assert.match(user, /- given: given \(first\) name/);
    assert.match(user, /- epithet:/);
    assert.match(user, /given name: starts with/);
    assert.match(user, /family name: /);
    assert.match(user, /"parts": \{"given": "\.\.\.", "family": "\.\.\.", "epithet": "\.\.\."\}/);
    assert.match(user, /whole full name, with a space/);
    assert.match(user, /No two family names may be the same/);
    assert.match(user, /spread the given-name endings out/);
    assert.match(user, /Family names, epithets and titles may use real words/);
    const fixed = api.buildMessages({ ...form, fixedFamily: 'Holloway' }, api.rollSeeds(2, { ...form, fixedFamily: 'Holloway' }, seeded(3)), {})[1].content;
    assert.match(fixed, /always exactly "Holloway"/);
    assert.doesNotMatch(fixed, /family name: from/);
});

test('parts answers become pieces in order, with a kept family name', () => {
    const { api } = load();
    const form = { target: 'person', parts: ['given', 'middle', 'family'], extras: ['title', 'codename', 'alias'], fixedFamily: 'Holloway' };
    const raw = '[{"parts":{"codename":"\\"Nightjar\\"","given":"Mira","middle":"Aldous","family":"Wrong","title":"Captain","alias":"Wren"},"read":"캡틴 미라 올더스 할로웨이","note":"x"}]';
    const [r] = api.applyShape(api.parseNames(raw), form);
    assert.equal(r.name, 'Captain Mira Aldous Holloway "Nightjar" (Wren)');
    assert.deepEqual([...r.pieces.map(p => p.role)], ['title', 'given', 'middle', 'family', 'codename', 'alias']);
    assert.equal(r.pieces[3].fixed, true);
    assert.equal(r.pieces[4].text, 'Nightjar');
    assert.deepEqual([...api.memoryNames(r)], ['Mira', 'Aldous', 'Nightjar', 'Wren'], 'no title, no kept family name');
    // A banned part knocks the whole name out; a plain answer still passes.
    assert.equal(api.filterNames([r], ['aldous']).length, 0);
    const plain = api.applyShape(api.parseNames('[{"name":"Mira Holloway","note":"y"}]'), form);
    assert.equal(plain[0].name, 'Mira Holloway');
    assert.equal(plain[0].pieces, undefined);
});

test('swapping one part asks for that part only', () => {
    const { api } = load();
    const src = { name: 'Mira Holloway', pieces: [{ role: 'given', text: 'Mira' }, { role: 'family', text: 'Holloway' }] };
    const user = api.buildPieceMessages(src, 'given', { vibe: 'cozy', gender: 'feminine' }, { reading: true, lang: 'en', avoid: ['Lyra'] })[1].content;
    assert.match(user, /Replace only its given part, now "Mira"/);
    assert.match(user, /given "Mira", family "Holloway"/);
    assert.match(user, /Gender feel: feminine/);
    assert.match(user, /Lyra/);
    assert.match(user, /"name" is the new part only/);
    const fam = api.buildPieceMessages(src, 'family', { vibe: 'cozy', gender: 'feminine' }, {})[1].content;
    assert.doesNotMatch(fam, /Gender feel/);
});

test('part labels exist in both languages', () => {
    const { api } = load();
    for (const lang of ['en', 'ko']) {
        const L = api.STRINGS[lang];
        assert.deepEqual(Object.keys(L.pc).sort(), ['family', 'given', 'middle']);
        assert.equal(Object.keys(L.ex).length, 8);
        for (const k of ['parts', 'extras', 'fixedFamily', 'fixedFamilyPh', 'copyPiece', 'rerollPiece', 'rerollingPiece', 'pieceRerolled']) assert.ok(L[k], `${lang}.${k}`);
    }
});

test('v0.1.9: person seeds follow the setting', () => {
    const { api } = load();
    const fantasyOnly = ['-wyn', '-ith', '-ond', '-ock', '-ane'];
    for (const vibe of ['scifi', 'modern', 'cozy']) {
        const form = { target: 'person', vibe, length: 'any', sound: 'any', mustContain: '' };
        const seeds = api.rollSeeds(40, form, seeded(9));
        assert.ok(!seeds.some(s => fantasyOnly.includes(s.ending)), `${vibe} got a fantasy ending`);
        if (vibe !== 'cozy') assert.ok(!seeds.some(s => ['old-fashioned', 'earthy'].includes(s.texture)), `${vibe} got an old texture`);
    }
    const custom = api.rollSeeds(20, { target: 'person', vibe: 'custom', customVibe: '1920s noir' }, seeded(2));
    assert.ok(custom.every(s => !s.spark && !s.ending), 'a typed vibe gets no inspiration word and no ending');
    const sf = { target: 'person', vibe: 'scifi', length: 'any', sound: 'any', mustContain: '' };
    const user = api.buildMessages(sf, api.rollSeeds(3, sf, seeded(1)), {})[1].content;
    assert.match(user, /Never like fantasy elves/);
    assert.match(user, /Setting \/ vibe: sci-fi \/ cyberpunk \(future technology, space travel, corporations, code\)/, 'no "neon" pushed by the vibe line');
    assert.doesNotMatch(api.buildMessages(sf, [], {})[0].content, /fantasy/);
});

test('v0.1.9: part examples follow the setting', () => {
    const { api } = load();
    const form = { target: 'person', vibe: 'scifi', gender: 'any', length: 'any', sound: 'any', mustContain: '', parts: ['given'], extras: ['title', 'epithet'] };
    const user = api.buildMessages(form, api.rollSeeds(2, form, seeded(3)), {})[1].content;
    assert.match(user, /- title: title or honorific \(like Dr\., Commander/);
    assert.doesNotMatch(user, /Sir, Lady|the Grey/);
    const old = api.buildMessages({ ...form, vibe: 'medieval' }, api.rollSeeds(2, { ...form, vibe: 'medieval' }, seeded(3)), {})[1].content;
    assert.match(old, /Sir, Lady/);
    const src = { name: 'Kade "Static"', pieces: [{ role: 'given', text: 'Kade' }, { role: 'codename', text: 'Static' }] };
    const piece = api.buildPieceMessages(src, 'codename', { vibe: 'scifi' }, {})[1].content;
    assert.match(piece, /like Static, Vex-9/);
    assert.match(piece, /Never like fantasy elves/);
});

test('v0.1.9: details and batches keep inspiration words in check', () => {
    const { api } = load();
    const bread = { target: 'item', vibe: 'modern', kind: 'any', kindText: '빵', length: 'short', sound: 'any', mustContain: '' };
    const seeds = api.rollSeeds(5, bread, seeded(4));
    assert.ok(seeds.every(s => !s.spark), 'typed details drop the inspiration word');
    assert.ok(!seeds.some(s => /the … of|epithet/.test(s.shape)), 'no old-world shapes in a modern setting');
    const user = api.buildMessages(bread, seeds, {})[1].content;
    assert.doesNotMatch(user, /inspiration: "/);
    assert.match(user, /plain word for this kind of thing/);
    assert.match(user, /ignore it if it doesn't fit/);
    assert.match(user, /same idea or image/);
    for (let k = 1; k < 20; k++) {
        const sparks = api.rollSeeds(8, { target: 'shop', vibe: 'scifi' }, seeded(k)).map(s => s.spark);
        assert.equal(new Set(sparks).size, sparks.length, `seed ${k}: repeated inspiration word`);
    }
});

test('v0.1.9: extras fold is closed by default', () => {
    const { api } = load();
    assert.equal(api.settings().extrasOpen, false);
});

test('v0.1.10: plain-word names are marked, and left out only when asked', () => {
    const { api, extensionSettings } = load();
    assert.equal(api.settings().wordNames, 'mark', 'mark by default');
    assert.equal(api.WORD_NAMES.get('wren'), '굴뚝새');
    const person = { target: 'person' };
    assert.deepEqual([...api.wordHits({ name: 'Wren', form: person }).map(w => w.word)], ['wren']);
    assert.equal(api.wordHits({ name: 'Wrenna', form: person }).length, 0, 'only exact words');
    assert.equal(api.wordHits({ name: 'Ox', form: { target: 'item' } }).length, 0, 'items may use real words');
    const full = { name: 'Ash Stone', pieces: [{ role: 'given', text: 'Ash' }, { role: 'family', text: 'Stone' }], form: person };
    assert.deepEqual([...api.wordHits(full).map(w => w.word)], ['ash'], 'family names may be words');
    const list = [{ name: 'Wren', note: '' }, { name: 'Voreth', note: '' }];
    assert.equal(api.keepNames(list, [], person).length, 2, 'marking keeps them');
    extensionSettings.tbd_names.wordNames = 'filter';
    assert.deepEqual([...api.keepNames(list, [], person).map(n => n.name)], ['Voreth']);
    extensionSettings.tbd_names.wordNames = 'nonsense';
    assert.equal(api.settings().wordNames, 'mark');
    for (const lang of ['en', 'ko']) {
        const L = api.STRINGS[lang];
        assert.ok(L.sWords && L.sWordOpts.mark && L.sWordOpts.filter && L.wordTip);
        assert.ok(L.wordTag([{ word: 'wren', ko: '굴뚝새' }]).length);
    }
});

test('v0.1.11: a cut-off answer keeps its finished names and never shows JSON as a name', () => {
    const { api } = load();
    const raw = '<think>hmm</think>[{"parts": {"given": "Parith", "family": "Marlfield"}, "read": "페리스 말필드", "note": "토속적인 {이름}."}, {"parts": {"given": "Delvor", "family": "Chandler"}, "read": "델보르 챈들러", "note": "a \\"quoted\\" note"}, {"parts": {"given": "Joth';
    assert.equal(api.answerCut(raw), true);
    const form = { target: 'person', parts: ['given', 'family'], extras: [] };
    const names = api.applyShape(api.parseNames(raw), form);
    assert.deepEqual([...names.map(n => n.name)], ['Parith Marlfield', 'Delvor Chandler']);
    assert.equal(names[0].note, '토속적인 {이름}.');
    // Even with no finished object, no JSON bit becomes a name.
    assert.equal(api.parseNames('[{"parts": {"given": "Jo').length, 0);
    assert.equal(api.answerCut('[{"name":"Aren","note":"x"}]'), false);
    assert.equal(api.answerCut('1. Aren — x'), false);
    assert.equal(api.parseNames('1. Aren — soft').length, 1, 'plain line answers still work');
    assert.ok(!api.looksLikeName('[{"parts') && api.looksLikeName('Aren'));
});

test('v0.1.11: max tokens default 2000, old default moves once, junk history is cleaned', () => {
    const fresh = load();
    assert.equal(fresh.api.settings().maxTokens, 2000);
    const old = load({ extensionSettings: { tbd_names: { maxTokens: 1000, history: ['Aren', '[{"parts', 'Mira'] } } });
    const st = old.api.settings();
    assert.equal(st.maxTokens, 2000);
    assert.deepEqual([...st.history], ['Aren', 'Mira']);
    st.maxTokens = 1000; // chosen again by the user after the move: stays
    assert.equal(old.api.settings().maxTokens, 1000);
    const own = load({ extensionSettings: { tbd_names: { maxTokens: 1500 } } });
    assert.equal(own.api.settings().maxTokens, 1500, 'a typed number stays');
    old.api.rememberNames(['{bad', 'Voreth'], st);
    assert.ok(!st.history.includes('{bad') && st.history.includes('Voreth'));
});

test('v0.1.12: past names list shows newest first, escaped, and the insert button is gone', () => {
    const { api } = load();
    const st = api.settings();
    st.history = ['Aldric', 'Bo<b>x', 'Corveth'];
    const L = api.STRINGS.ko;
    const html = api.historyHtml(st, L);
    assert.ok(html.indexOf('Corveth') < html.indexOf('Aldric'));
    assert.ok(!html.includes('<b>') && html.includes('Bo&lt;b&gt;x'));
    assert.ok(html.includes('data-i="2"'));
    st.history = [];
    assert.ok(api.historyHtml(st, L).includes(L.sHistoryEmpty));
    for (const lang of ['en', 'ko']) {
        const S = api.STRINGS[lang];
        assert.ok(S.sHistoryShow.includes('{n}') && S.sHistoryRemove);
        assert.equal(S.insert, undefined);
    }
    assert.equal(api.insertAtCursor, undefined);
});

test('v0.1.13: "like this" words steer the prompt, drop random nudges, and never come back as the name', () => {
    const { api } = load();
    const form = { target: 'person', vibe: 'fantasy', length: 'any', sound: 'any', likeText: 'Elric, Aldous ,, Elric', likeMode: 'sound', parts: ['given'], extras: [] };
    assert.deepEqual([...api.likeWords(form)], ['Elric', 'Aldous']);
    const seeds = api.rollSeeds(5, form);
    for (const s of seeds) assert.ok(!s.start && !s.ending && !s.texture && !s.spark && !s.syllables);
    const feelSeeds = api.rollSeeds(5, { ...form, likeMode: 'feel' });
    for (const s of feelSeeds) assert.ok(!s.start && !s.ending && !s.spark && s.syllables);
    const msg = api.buildMessages(form, seeds, { lang: 'en' })[1].content;
    assert.ok(msg.includes('sound like "Elric", "Aldous"') && msg.includes('Never use those words themselves'));
    assert.ok(!msg.includes('Do NOT use these names or close variants: Elric'));
    const feel = api.buildMessages({ ...form, likeMode: 'feel' }, feelSeeds, { lang: 'en' })[1].content;
    assert.ok(feel.includes('same feel as'));
    // Empty box: nothing changes.
    const plain = { ...form, likeText: '  ' };
    assert.equal(api.likeRule(plain, 'name'), '');
    assert.ok(api.rollSeeds(3, plain).every(s => s.start && s.syllables));
    // Exact copies are dropped, near ones kept.
    const kept = api.keepNames([{ name: 'elric' }, { name: 'Elrin' }, { name: 'Bran Elric', pieces: [{ role: 'given', text: 'Elric' }, { role: 'family', text: 'Bran' }] }], [], form);
    assert.deepEqual([...kept.map(n => n.name)], ['Elrin']);
    // Full names: the rule is about the given name.
    const shaped = { ...form, parts: ['given', 'family'] };
    assert.ok(api.buildMessages(shaped, api.rollSeeds(2, shaped), { lang: 'en' })[1].content.includes('Make each given name sound like'));
    for (const lang of ['en', 'ko']) {
        const L = api.STRINGS[lang];
        assert.ok(L.like && L.likePh && L.likeMode && L.likeModes.sound && L.likeModes.feel);
    }
});

test('v0.1.14: empty answers get their own message, and the preset can stay home', async () => {
    const { api, extensionSettings } = load();
    const L = api.STRINGS.ko;
    assert.equal(api.answerEmpty(''), true);
    assert.equal(api.answerEmpty('<think>long thought</think>\n  '), true);
    assert.equal(api.answerEmpty('<think>thinking that never ended'), true);
    assert.equal(api.answerEmpty('Sure! Here are some names.'), false);
    assert.ok(api.failText('<think>x</think>', L).includes(L.thinkFail));
    assert.ok(api.failText('', L).includes(L.emptyFail));
    assert.ok(api.failText('<think>never closed', L).includes(L.thinkFail));
    assert.ok(api.failText('[{"name": "Ab', L).includes(L.cutFail));
    assert.ok(api.failText('I can help with that.', L).includes(L.parseFail));
    for (const lang of ['en', 'ko']) {
        const S = api.STRINGS[lang];
        assert.ok(S.emptyFail && S.thinkFail && S.showRaw && S.hideRaw && S.rawEmpty && S.sPreset && S.sPresetHint);
    }
    // v0.1.15: off by default, and a saved "on" from v0.1.14 moves to off once; a later choice stays.
    assert.equal(api.settings().sendPreset, false);
    const old = load({ extensionSettings: { tbd_names: { sendPreset: true } } });
    assert.equal(old.api.settings().sendPreset, false);
    old.extensionSettings.tbd_names.sendPreset = true;
    assert.equal(old.api.settings().sendPreset, true);
});

test('v0.1.14: profile requests pass the preset choice and keep separate thinking for "see the answer"', async () => {
    const calls = [];
    const hook = {};
    const ctxObj = {
        extensionSettings: {},
        saveSettingsDebounced() {},
        ConnectionManagerRequestService: { sendRequest: async (id, msgs, max, o) => { calls.push(o); return { content: '', reasoning: 'hmm, names…' }; } },
    };
    const sandbox = {
        __TBD_TEST__: hook, SillyTavern: { getContext: () => ctxObj },
        localStorage: { getItem: () => null }, navigator: { language: 'en-US' },
        document: { getElementById: () => null }, jQuery: () => { throw new Error('no init'); },
    };
    sandbox.globalThis = sandbox;
    vm.runInNewContext(source, sandbox);
    const api = hook.api;
    const raw = await api.requestLLM([], { profileId: 'p1', maxTokens: 100, sendPreset: false });
    assert.equal(calls[0].includePreset, false);
    assert.equal(calls[0].includeInstruct, true);
    assert.ok(raw.includes('hmm, names'));
    assert.equal(api.answerEmpty(raw), true);
    assert.equal(api.parseNames(raw).length, 0);
    await api.requestLLM([], { profileId: 'p1', maxTokens: 100 });
    assert.equal(calls[1].includePreset, false);
    await api.requestLLM([], { profileId: 'p1', maxTokens: 100, sendPreset: true });
    assert.equal(calls[2].includePreset, true);
});

test('v0.1.16: sound-alike words beat the vibe, allow shared endings and say what to keep', () => {
    const { api } = load();
    const form = { target: 'person', vibe: 'medieval', gender: 'any', length: 'short', sound: 'any', likeText: 'Morvane', likeMode: 'sound', parts: ['given'], extras: [] };
    const msg = api.buildMessages(form, api.rollSeeds(5, form), { lang: 'en' })[1].content;
    assert.ok(msg.includes('follow them even if they don\'t match the setting'));
    assert.ok(!msg.includes('The setting and what is being named come first'));
    assert.ok(!msg.includes('share the same ending'));
    assert.ok(msg.includes('Go by ear') && !msg.includes('e.g. "'));
    // Full name: given endings may match, family names still may not repeat.
    const shaped = { ...form, parts: ['given', 'family'] };
    const full = api.buildMessages(shaped, api.rollSeeds(3, shaped), { lang: 'en' })[1].content;
    assert.ok(!full.includes('share the same ending') && full.includes('no two family names may be the same'));
    // Feel mode keeps the ending rule but the like words still come before the vibe.
    const feel = api.buildMessages({ ...form, likeMode: 'feel' }, api.rollSeeds(3, { ...form, likeMode: 'feel' }), { lang: 'en' })[1].content;
    assert.ok(feel.includes('share the same ending') && feel.includes('follow them even if'));
    // Empty box: unchanged.
    const plain = api.buildMessages({ ...form, likeText: '' }, api.rollSeeds(3, { ...form, likeText: '' }), { lang: 'en' })[1].content;
    assert.ok(plain.includes('The setting and what is being named come first') && plain.includes('share the same ending'));
});

test('v0.1.17: with only the given name on, no family name is asked for', () => {
    const { api } = load();
    const form = { target: 'person', vibe: 'medieval', gender: 'any', length: 'any', sound: 'any', parts: ['given'], extras: [] };
    const msg = api.buildMessages(form, api.rollSeeds(3, form), { lang: 'en' })[1].content;
    assert.ok(!msg.includes('optionally with a family name'));
    assert.ok(msg.includes('Give only the given name, with no family name after it.'));
    // Family on: the full-name rules take over, no "given only" line.
    const full = api.buildMessages({ ...form, parts: ['given', 'family'] }, api.rollSeeds(3, { ...form, parts: ['given', 'family'] }), { lang: 'en' })[1].content;
    assert.ok(!full.includes('Give only the given name'));
    // Places are untouched.
    const place = api.buildMessages({ ...form, target: 'place' }, api.rollSeeds(3, { ...form, target: 'place' }), { lang: 'en' })[1].content;
    assert.ok(!place.includes('Give only the given name'));
});

test('v0.1.18: thinking effort is sent only when picked, and sound-alike asks less', async () => {
    const calls = [];
    const hook = {};
    const ctxObj = {
        extensionSettings: {}, saveSettingsDebounced() {},
        ConnectionManagerRequestService: { sendRequest: async (...a) => { calls.push(a); return { content: '[]' }; } },
    };
    const sb = { __TBD_TEST__: hook, SillyTavern: { getContext: () => ctxObj }, localStorage: { getItem: () => null }, navigator: { language: 'en' }, Event: class {}, document: { getElementById: () => null }, jQuery: () => { throw new Error('no init'); } };
    sb.globalThis = sb;
    vm.runInNewContext(source, sb);
    const api = hook.api;
    assert.equal(api.settings().reasoning, 'default');
    await api.requestLLM([{ role: 'user', content: 'x' }], { profileId: 'p', maxTokens: 100 });
    assert.deepEqual({ ...calls[0][4] }, {});
    await api.requestLLM([{ role: 'user', content: 'x' }], { profileId: 'p', maxTokens: 100, reasoning: 'low' });
    assert.equal(calls[1][4].reasoning_effort, 'low');
    // A bad saved value falls back to default.
    ctxObj.extensionSettings.tbd_names.reasoning = 'banana';
    assert.equal(api.settings().reasoning, 'default');
    // Each sound-alike name gets its own part to echo; no inspiration rules or same-idea rule then.
    const form = { target: 'person', vibe: 'medieval', gender: 'any', length: 'any', sound: 'any', likeText: 'Morvane', likeMode: 'sound', parts: ['given'], extras: [] };
    const seeds = api.rollSeeds(5, form);
    assert.equal(new Set(seeds.map(x => x.likeFocus)).size, 5);
    const msg = api.buildMessages(form, seeds, { lang: 'en' })[1].content;
    assert.ok(msg.includes('mostly in its ending') && !msg.includes('inspiration') && !msg.includes('same idea or image') && !msg.includes('same last word'));
    // Feel mode: no focus line.
    assert.ok(api.rollSeeds(3, { ...form, likeMode: 'feel' }).every(x => !x.likeFocus));
    for (const lang of ['en', 'ko']) {
        const L = api.STRINGS[lang];
        assert.ok(L.sThink && L.sThinkHint && Object.keys(L.sThinkOpts).length === 5);
    }
});

test('v0.1.19: max response tokens go up to 65000', () => {
    const { api, extensionSettings } = load({ extensionSettings: { tbd_names: { maxTokens: 40000 } } });
    assert.equal(api.tokensFor(5, api.settings()), 40000);
    extensionSettings.tbd_names.maxTokens = 999999;
    assert.equal(api.tokensFor(5, api.settings()), 65000);
});

test('v0.1.21: real-names choice changes the prompt and the seeds', () => {
    const { api } = load();
    const base = { target: 'person', vibe: 'medieval', gender: 'any', length: 'any', sound: 'any', parts: ['given'], extras: [] };
    // Default: invented only, said plainly; no "real" field asked for.
    const inv = api.buildMessages(base, api.rollSeeds(3, base, seeded(2)), { lang: 'en' })[1].content;
    assert.match(inv, /Invent 3 original names/);
    assert.match(inv, /don't hand back names that real people commonly have/);
    assert.ok(!inv.includes('"real"'));
    // Real names only: asks for names (not "invent original"), drops the plain-word rule, asks which are real.
    const only = { ...base, realNames: 'only' };
    const seeds = api.rollSeeds(5, only, seeded(4));
    assert.ok(seeds.every(s => !s.ending && !s.texture && !s.spark && s.start));
    const msg = api.buildMessages(only, seeds, { lang: 'en' })[1].content;
    assert.match(msg, /Give 5 names/);
    assert.match(msg, /Use real given names that people actually use/);
    assert.ok(!msg.includes('plain existing English word'));
    assert.match(msg, /"real": false/);
    // Full name: applies to given/middle/family, not to a kept family name or extras.
    const full = { ...base, realNames: 'near', parts: ['given', 'family'], extras: ['epithet'], fixedFamily: 'Holloway' };
    assert.deepEqual([...api.realRoles(full)], ['given']);
    const full2 = { ...full, fixedFamily: '' };
    assert.deepEqual([...api.realRoles(full2)], ['given', 'family']);
    const m2 = api.buildMessages(full2, api.rollSeeds(2, full2, seeded(1)), { lang: 'en' })[1].content;
    assert.match(m2, /Base the given and family names on real names/);
    assert.match(m2, /"real": \["\.\.\."\]/);
    // Not for places.
    assert.equal(api.realMode({ target: 'place', realNames: 'only' }), 'invented');
    assert.deepEqual([...api.realRule({ target: 'place', realNames: 'only' })], []);
    // No example names in the real-name lines (models copy examples).
    for (const mode of ['invented', 'near', 'mix', 'only']) {
        for (const line of api.realRule({ ...full2, realNames: mode })) assert.ok(!/[A-Z][a-z]+ →|like "[A-Z]/.test(line), line);
    }
});

test('v0.1.21: "real" marks come through, and keep real names past the word filter', () => {
    const { api } = load();
    const one = api.parseNames('[{"name":"Rose","note":"n","real":true},{"name":"Wren","note":"n","real":false}]');
    assert.equal(one[0].real, true);
    assert.equal(one[1].real, undefined);
    const st = { wordNames: 'filter' };
    const only = { target: 'person', realNames: 'only' };
    assert.deepEqual([...api.keepNames(one, [], only, st).map(n => n.name)], ['Rose']);
    // Invented mode: the word filter wins as before.
    assert.deepEqual([...api.keepNames(one, [], { target: 'person' }, st).map(n => n.name)], []);
    // Full names: a list marks just those parts.
    const form = { target: 'person', realNames: 'mix', parts: ['given', 'family'], extras: [] };
    const shaped = api.applyShape(api.parseNames('[{"parts":{"given":"Agnes","family":"Torvel"},"note":"n","real":["given"]}]'), form);
    assert.equal(shaped[0].real, true);
    assert.deepEqual([...shaped[0].pieces.map(p => !!p.real)], [true, false]);
    const none = api.applyShape(api.parseNames('[{"parts":{"given":"Ysmel","family":"Torvel"},"note":"n","real":[]}]'), form);
    assert.equal(none[0].real, undefined);
});

test('v0.1.21: AI favorites stay with "real names only", marked instead', () => {
    const { api } = load();
    assert.ok(api.avoidList({ banList: 'Brindle', rememberHistory: false, history: [] }, { target: 'person', realNames: 'mix' }).includes('Luna'));
    const av = api.avoidList({ banList: 'Brindle', rememberHistory: false, history: [] }, { target: 'person', realNames: 'only' });
    assert.ok(!av.includes('Luna') && av.includes('Brindle'));
    assert.ok(api.clicheHit({ name: 'Luna' }));
    assert.ok(!api.clicheHit({ name: 'Agnes' }));
});

test('v0.1.21: nicknames are asked for only when on, and shown under the name', () => {
    const { api, extensionSettings } = load({ lang: 'ko' });
    const st = api.settings();
    assert.equal(st.nicknames, false);
    const form = { target: 'person', vibe: 'fantasy', parts: ['given'], extras: [] };
    assert.equal(api.nickOn(form, st), false);
    st.nicknames = true;
    assert.equal(api.nickOn(form, st), true);
    assert.equal(api.nickOn({ target: 'place' }, st), false);
    assert.equal(api.nickOn({ ...form, parts: [], extras: ['codename'] }, st), false);
    const msg = api.buildMessages(form, api.rollSeeds(2, form, seeded(3)), { lang: 'en', nicks: true })[1].content;
    assert.match(msg, /"nicks": 2 or 3 short nicknames/);
    assert.match(msg, /"nicks": \["\.\.\.", "\.\.\."\]/);
    // Cleaned: no JSON bits, not the name itself, no repeats, at most 3.
    assert.deepEqual([...api.cleanNicks(['Mimi', 'mimi', 'Mirabel', '{x}', 'Ree', 'Bel', 'Ra'], 'Mirabel')], ['Mimi', 'Ree', 'Bel']);
    const parsed = api.parseNames('[{"name":"Mirabel","note":"n","nicks":["Mira","Belle"]}]');
    assert.deepEqual([...parsed[0].nicks], ['Mira', 'Belle']);
    api.setResults([{ ...parsed[0], real: true, form }]);
    const html = api.resultsHtml();
    assert.match(html, /애칭:/);
    assert.match(html, /class="tbd-nick" data-n="1"[^>]*>Belle</);
    assert.match(html, />실제</);
    // Turned off: not shown.
    extensionSettings.tbd_names.nicknames = false;
    assert.ok(!api.resultsHtml().includes('tbd-nick'));
});

test('v0.1.21: one swapped part follows the real-names choice', () => {
    const { api } = load();
    const src = { name: 'Agnes Torvel', pieces: [{ role: 'given', text: 'Agnes' }, { role: 'family', text: 'Torvel' }] };
    const form = { target: 'person', vibe: 'medieval', realNames: 'only', parts: ['given', 'family'], extras: [] };
    const msg = api.buildPieceMessages(src, 'given', form, { lang: 'en', nicks: true })[1].content;
    assert.match(msg, /Use a real name that people actually use/);
    assert.match(msg, /"real": false/);
    assert.match(msg, /"nicks"/);
    const fam = api.buildPieceMessages(src, 'family', { ...form, realNames: 'invented' }, { lang: 'en', nicks: true })[1].content;
    assert.ok(!fam.includes('"real"') && !fam.includes('"nicks"'));
    assert.match(fam, /Invent it/);
    // Refine in a real mode doesn't forbid landing near a real name.
    const ref = api.buildRefineMessages({ name: 'Agnes' }, 'soft', { target: 'person', vibe: 'medieval', realNames: 'near' }, { lang: 'en' })[1].content;
    assert.ok(!ref.includes('Bridget') && ref.includes('"real": false'));
});

test('v0.1.22: myth, game, Lovecraftian and weird vibes have their own seeds and rules', () => {
    const { api } = load();
    for (const vibe of ['myth', 'game', 'cosmic', 'weird']) {
        assert.ok(api.STRINGS.en.v[vibe] && api.STRINGS.ko.v[vibe], `${vibe} has labels`);
        assert.ok(api.SPARKS[vibe].length >= 20, `${vibe} has inspiration words`);
        assert.ok(api.FAMILY_STYLES[vibe], `${vibe} has family styles`);
        const seeds = api.rollSeeds(10, { target: 'person', vibe, length: 'any', sound: 'any', mustContain: '' }, seeded(5));
        assert.ok(seeds.every(s => api.SPARKS[vibe].includes(s.spark)), `${vibe} sparks come from its own list`);
        const user = api.buildMessages({ target: 'person', vibe, gender: 'any', length: 'any', sound: 'any', mustContain: '' }, seeds.slice(0, 2), {})[1].content;
        assert.ok(!/Setting \/ vibe: any/.test(user), `${vibe} has a vibe line`);
    }
    assert.equal(api.STRINGS.ko.v.cosmic, '러브크래프트풍');
    assert.equal(api.STRINGS.en.v.cosmic, 'Lovecraftian');
    // Lovecraftian: don't reuse canon; beings may sound alien.
    const other = api.buildMessages({ target: 'other', vibe: 'cosmic', length: 'any', sound: 'any', mustContain: '' }, [{}], {})[1].content;
    assert.match(other, /Lovecraft's own stories/);
    assert.match(other, /alien/);
    // Weird stays sayable, and weird places get no pushed ending.
    const weird = api.buildMessages({ target: 'place', vibe: 'weird', length: 'any', sound: 'any', mustContain: '' }, [{}], {})[1].content;
    assert.match(weird, /sayable aloud/);
    assert.ok(api.rollSeeds(10, { target: 'place', vibe: 'weird' }, seeded(6)).every(s => !s.ending));
    // Game items can get loot shapes; myth items the old epithet shapes.
    const gameShapes = new Set(api.rollSeeds(40, { target: 'item', vibe: 'game' }, seeded(7)).map(s => s.shape));
    assert.ok([...gameShapes].some(s => /legendary|loot/.test(s)));
    const mythShapes = new Set(api.rollSeeds(40, { target: 'item', vibe: 'myth' }, seeded(8)).map(s => s.shape));
    assert.ok(mythShapes.has('"the … of …"'));
});

test('v0.1.22: game favorites and Lovecraft names are marked, not avoided', () => {
    const { api } = load();
    assert.ok(api.clicheHit({ name: 'Shadowfang' }));
    assert.ok(!api.avoidList(api.settings(), { target: 'item' }).includes('Shadowfang'));
    assert.ok(api.canonHit({ name: 'Innsmouth' }) && api.canonHit({ name: "r'lyeh" }));
    assert.ok(!api.canonHit({ name: 'Innsmoor' }));
    const form = { target: 'place', vibe: 'cosmic' };
    api.setResults([{ name: 'Arkham', note: 'n', form }, { name: 'Bloodmoon', note: 'n', form }]);
    const html = api.resultsHtml();
    assert.match(html, />Lovecraft</);
    assert.match(html, />AI favorite</);
});

test('v0.1.23: Lovecraftian people are eldritch when invented, old-town folk with real names', () => {
    const { api } = load();
    const base = { target: 'person', vibe: 'cosmic', gender: 'any', length: 'any', sound: 'any', mustContain: '', parts: ['given', 'family'], extras: [] };
    const inv = api.buildMessages({ ...base, realNames: 'invented' }, api.rollSeeds(2, base, seeded(3)), {})[1].content;
    assert.match(inv, /eldritch/);
    assert.ok(!/coastal town/.test(inv));
    const near = { ...base, realNames: 'near' };
    const folk = api.buildMessages(near, api.rollSeeds(2, near, seeded(3)), {})[1].content;
    assert.match(folk, /New England coastal town/);
    assert.ok(!/eldritch/.test(folk));
    // Family-name seeds follow the same switch.
    assert.ok(api.rollSeeds(6, near, seeded(4)).every(s => api.FAMILY_STYLES.cosmicFolk.includes(s.family)));
    assert.ok(api.rollSeeds(6, { ...base, realNames: 'invented' }, seeded(4)).every(s => api.FAMILY_STYLES.cosmic.includes(s.family)));
});

test('v0.1.23: "real" gets a meaning per vibe; cozy is 포근한', () => {
    const { api } = load();
    const rule = vibe => api.realRule({ target: 'person', vibe, realNames: 'only' }).join(' ');
    assert.match(rule('myth'), /actual myths/);
    assert.match(rule('weird'), /rare and sound strange/);
    assert.match(rule('game'), /video game/);
    assert.ok(!/Here/.test(rule('medieval')));
    assert.match(api.realPieceRule({ target: 'person', vibe: 'weird', realNames: 'near', parts: ['given'] }, 'given'), /rare and sound strange/);
    assert.equal(api.STRINGS.ko.v.cozy, '포근한');
});

test('v0.1.23: less-used conditions fold, and the fold shows what was changed', () => {
    const { api, extensionSettings } = load({ lang: 'ko' });
    api.settings();
    const form = { target: 'person', vibe: 'fantasy', length: 'short', sound: 'hard', mustContain: '', likeText: 'Elric', likeMode: 'sound', realNames: 'mix', parts: ['given'], extras: [] };
    const fold = api.moreFoldHtml(form);
    assert.match(fold, /조건 더 보기/);
    assert.match(fold, /소리 느낌: 단단하게 · 비슷하게: Elric · 실제 이름도 섞기/);
    const html = api.formHtml(form);
    assert.match(html, /id="tbd_more" hidden/);
    // Still in the page (just hidden), so the form keeps reading them.
    for (const id of ['tbd_sound', 'tbd_must', 'tbd_like', 'tbd_likemode', 'tbd_realnames']) assert.ok(html.includes(`id="${id}"`), id);
    extensionSettings.tbd_names.moreOpen = true;
    assert.ok(!/id="tbd_more" hidden/.test(api.formHtml(form)));
    assert.ok(!/tbd-fold-sum/.test(api.moreFoldHtml(form)), 'open: no summary');
    // Nothing changed: no summary either.
    assert.ok(!/tbd-fold-sum/.test(api.moreFoldHtml({ target: 'place', length: 'any', sound: 'any' })));
});

test('v0.1.24: name check looks up the full name, each name part, and the Korean reading in Korean', () => {
    const { api } = load();
    const plain = api.checkTargets({ name: 'Vistra', read: '비스트라' }, 'en');
    assert.deepEqual([...plain.map(t => `${t.wiki}:${t.role}:${t.text}`)], ['en:full:Vistra']);
    const ko = api.checkTargets({ name: 'Vistra', read: '비스트라' }, 'ko');
    assert.deepEqual([...ko.map(t => `${t.wiki}:${t.text}`)], ['en:Vistra', 'ko:비스트라']);
    // A reading in capital letters (English panel) is never sent to Korean Wikipedia.
    assert.equal(api.checkTargets({ name: 'Vistra', read: 'VIS-tra' }, 'ko').length, 1);
    const full = { name: 'Sir Rolan "Ash" Varrow', read: '롤란 배로', pieces: [
        { role: 'title', text: 'Sir' }, { role: 'given', text: 'Rolan' }, { role: 'family', text: 'Varrow' }, { role: 'codename', text: 'Ash' }] };
    assert.deepEqual([...api.checkTargets(full, 'ko').map(t => `${t.wiki}:${t.role}:${t.text}`)],
        ['en:full:Rolan Varrow', 'en:given:Rolan', 'en:family:Varrow', 'ko:full:롤란 배로']);
    // A kept family name is the user's own choice, so it isn't checked by itself.
    const kept = { name: 'Rolan Holloway', pieces: [{ role: 'given', text: 'Rolan' }, { role: 'family', text: 'Holloway', fixed: true }] };
    assert.deepEqual([...api.checkTargets(kept, 'en').map(t => t.text)], ['Rolan Holloway', 'Rolan']);
});

const WIKI = { batchcomplete: true, query: {
    normalized: [{ from: 'rolan', to: 'Rolan' }],
    redirects: [{ from: 'Rolan', to: 'Roland (name)' }],
    pages: [
        { ns: 0, title: 'Vistra', missing: true },
        { pageid: 1, ns: 0, title: 'Vistra Corp', fullurl: 'https://en.wikipedia.org/wiki/Vistra_Corp', pageprops: { 'wikibase-shortdesc': 'American power company' } },
        { pageid: 2, ns: 0, title: 'Roland (name)', fullurl: 'https://en.wikipedia.org/wiki/Roland_(name)', extract: 'Roland is a masculine given name.' },
        { pageid: 3, ns: 0, title: 'Mira', fullurl: 'https://en.wikipedia.org/wiki/Mira', pageprops: { disambiguation: '' } },
    ],
} };

test('v0.1.24: Wikipedia answers become hit / several pages / name page / nothing', () => {
    const { api } = load();
    const out = api.readWikiAnswer(WIKI, ['Vistra', 'Vistra Corp', 'rolan', 'Mira', 'Nobody']);
    assert.equal(out.get('Vistra'), null);
    assert.equal(out.get('Nobody'), null);
    assert.equal(out.get('Vistra Corp').kind, 'hit');
    assert.equal(out.get('Vistra Corp').desc, 'American power company');
    assert.equal(out.get('rolan').kind, 'name', 'followed the normalize + redirect steps');
    assert.equal(out.get('Mira').kind, 'many');
});

test('v0.1.24: lookups are cached, batched, and keyless', async () => {
    const calls = [];
    const fetch = async url => { calls.push(String(url)); return { ok: true, json: async () => WIKI }; };
    const { api } = load({ fetch });
    const first = await api.wikiLookup('en', ['Vistra Corp', 'Mira', 'Mira']);
    assert.equal(calls.length, 1);
    assert.match(calls[0], /^https:\/\/en\.wikipedia\.org\/w\/api\.php\?/);
    assert.match(calls[0], /origin=\*/);
    assert.match(decodeURIComponent(calls[0].replace(/\+/g, ' ')), /titles=Vistra Corp\|Mira/);
    assert.equal(first.get('Mira').kind, 'many');
    await api.wikiLookup('en', ['Mira']);
    assert.equal(calls.length, 1, 'second time comes from the cache');
    const bad = load({ fetch: async () => ({ ok: false, status: 503 }) });
    await assert.rejects(bad.api.wikiLookup('en', ['X']));
});

test('v0.1.24: the check line shows parts, Korean wiki, Google and the AI button; auto check hides clean results', () => {
    const { api } = load({ lang: 'ko' });
    const hit = { kind: 'hit', title: 'Vistra Corp', desc: '미국 전력 회사', url: 'https://en.wikipedia.org/wiki/Vistra_Corp' };
    const r = { name: 'Rolan Varrow', pieces: [{ role: 'given', text: 'Rolan' }, { role: 'family', text: 'Varrow' }],
        check: { state: 'done', items: [
            { role: 'full', wiki: 'en', text: 'Rolan Varrow', hit: null },
            { role: 'given', wiki: 'en', text: 'Rolan', hit: { kind: 'name', title: 'Roland (name)', url: 'u' } },
            { role: 'family', wiki: 'en', text: 'Varrow', hit },
            { role: 'full', wiki: 'ko', text: '롤란 배로', hit: null },
        ] } };
    const html = api.checkHtml(r);
    assert.match(html, /전체<\/span> ✓ 없음/);
    assert.match(html, /이름<\/span> ℹ <a[^>]*>이름 문서/);
    assert.match(html, /성<\/span> ⚠ <a[^>]*>Vistra Corp<\/a> — 미국 전력 회사/);
    assert.match(html, /한국어 위키<\/span> ✓ 없음/);
    assert.match(html, /google\.com\/search\?q=%22Rolan%20Varrow%22/);
    assert.match(html, /AI에게도 묻기/);
    assert.ok(api.checkWarns(r.check));
    // Auto check: nothing worth a ⚠ → nothing shown. A name page alone isn't a warning.
    const quiet = { name: 'Rolan', check: { state: 'done', quiet: true, items: [{ role: 'full', wiki: 'en', text: 'Rolan', hit: { kind: 'name', url: 'u' } }] } };
    assert.equal(api.checkHtml(quiet), '');
    quiet.check.items[0].hit = hit;
    assert.match(api.checkHtml(quiet), /⚠/);
    assert.equal(api.checkHtml({ name: 'X', check: { state: 'fail', hidden: true } }), '');
    assert.match(api.checkHtml({ name: 'X', check: { state: 'fail' } }), /위키백과에 연결하지 못했어요/);
    const single = api.checkHtml({ name: 'X', check: { state: 'done', items: [{ role: 'full', wiki: 'en', text: 'X', hit: null }] } });
    assert.match(single, /위키백과<\/span> ✓ 없음/);
});

test('v0.1.24: 🔎 button on every name, AI check asks plainly, "real" tooltip points to 🔎, auto check off by default', () => {
    const { api } = load({ lang: 'ko' });
    const st = api.settings();
    assert.equal(st.autoCheck, false);
    api.setResults([{ name: 'Vistra', note: 'n' }]);
    assert.match(api.resultsHtml(), /tbd-check-btn/);
    const msg = api.buildCheckMessages('Vistra', 'ko')[1].content;
    assert.match(msg, /"Vistra"/);
    assert.match(msg, /in Korean/);
    assert.match(msg, /brand/);
    assert.match(api.STRINGS.ko.realTip, /🔎/);
    assert.match(api.STRINGS.en.sCheckHint, /not a legal trademark check/);
});

test('v0.2.0: every Cache root makes sayable people and places, and says what each fragment means', () => {
    const { api } = load();
    for (const root of api.CACHE_ROOTS) {
        const R = api.CACHE[root];
        for (const k of ['head', 'masc', 'fem', 'placeHead', 'placeTail']) assert.ok(R[k].length >= 4, `${root}.${k}`);
        for (const f of [...R.head, ...R.placeHead]) assert.ok(f.en && f.ko, `${root}: ${f.t} has a meaning`);
        // Endings may have no meaning, but then neither language has one (no category slipped into the meaning).
        for (const f of [...R.masc, ...R.fem, ...R.placeTail]) assert.ok(!!f.en === !!f.ko && !/^(town|water|forest|hill|field|fort|coast)/.test(f.ko), `${root}: ${f.t}`);
        const people = api.cacheNames({ target: 'person', method: 'cache', roots: [root], parts: ['given'] }, 8, [], seeded(11));
        const places = api.cacheNames({ target: 'place', method: 'cache', roots: [root] }, 8, [], seeded(12));
        assert.equal(people.length, 8);
        assert.equal(places.length, 8);
        for (const n of [...people, ...places]) {
            assert.ok(n.cache && n.root === root && n.frags?.length >= 2, n.name);
            assert.ok(api.sayable(n.name), n.name);
            assert.match(n.name, /^[A-Z]/);
        }
        assert.equal(new Set(people.map(n => n.name)).size, 8, 'no repeats in one batch');
    }
});

test('v0.2.0: noble houses, monks and saints, family names per root', () => {
    const { api } = load();
    const rnd = seeded(21);
    const noble = api.cacheOne({ target: 'person', parts: ['given', 'family'], gender: 'masculine' }, 'germanic', 'noble', rnd);
    assert.deepEqual([...noble.pieces.map(p => p.role)], ['given', 'particle', 'family']);
    assert.equal(noble.pieces[1].text, 'von');
    assert.ok(noble.pieces[1].fixed, 'the particle has no swap button');
    const kept = api.cacheOne({ target: 'person', parts: ['given', 'family'], fixedFamily: 'Holloway' }, 'norman', 'noble', rnd);
    assert.match(kept.name, / de Holloway$/);
    const monk = api.cacheOne({ target: 'person', parts: ['given', 'family'], gender: 'feminine' }, 'latin', 'religious', rnd);
    assert.deepEqual([...monk.pieces.map(p => p.role)], ['title', 'given', 'origin']);
    assert.ok(['Soror', 'Sancta'].includes(monk.pieces[0].text));
    assert.match(monk.pieces[2].text, /^(de |d')/);
    // "de" before a vowel becomes d'.
    for (let i = 0; i < 40; i++) {
        const n = api.cacheOne({ target: 'person', parts: ['given', 'family'] }, 'norman', 'noble', rnd);
        assert.ok(!/\bde [AEIOUY]/.test(n.name), n.name);
    }
    const daughter = api.cacheFamilyBranch('norse', 'patron', 'f', rnd);
    assert.match(daughter.text, /dottir$/);
    assert.match(api.cacheFamilyBranch('norse', 'patron', 'm', rnd).text, /son$/);
    assert.match(api.cacheFamilyBranch('celtic', 'patron', 'm', rnd).text, /^(Mac|O')/);
    assert.equal(api.glue('Wulf', 'frith'), 'Wulfrith');
});

test('v0.2.0: Cache follows place kind, length, sound, letters and the avoid list', () => {
    const { api } = load();
    const water = api.cacheNames({ target: 'place', method: 'cache', roots: ['oldenglish'], kind: 'water' }, 10, [], seeded(31));
    const waterTails = new Set(api.CACHE.oldenglish.placeTail.filter(f => f.cats?.includes('water')).map(f => f.t));
    for (const n of water) assert.ok(n.frags.some(f => waterTails.has(f.t)), n.name);
    const must = api.cacheNames({ target: 'person', method: 'cache', roots: ['oldenglish'], parts: ['given'], mustContain: 'win' }, 5, [], seeded(32));
    assert.ok(must.every(n => n.name.toLowerCase().includes('win')));
    const short = api.cacheNames({ target: 'person', method: 'cache', roots: ['norse'], parts: ['given'], length: 'short' }, 5, [], seeded(33));
    assert.ok(short.every(n => (n.name.toLowerCase().match(/[aeiouy]+/g) || []).length <= 2), short.map(n => n.name).join());
    const first = api.cacheNames({ target: 'place', method: 'cache', roots: ['celtic'] }, 3, [], seeded(34));
    const again = api.cacheNames({ target: 'place', method: 'cache', roots: ['celtic'] }, 3, first.map(n => n.name), seeded(34));
    assert.ok(again.every(n => !first.some(f => f.name === n.name)));
    // Two roots take turns.
    const both = api.cacheNames({ target: 'place', method: 'cache', roots: ['latin', 'norse'] }, 4, [], seeded(35));
    assert.deepEqual([...new Set(both.map(n => n.root))].sort(), ['latin', 'norse']);
    assert.ok(api.soundScore('Lilwen', 'soft') > api.soundScore('Gattbek', 'soft'));
});

test('v0.2.0: swapping one part stays in the cache; ✨ gets the roots instead of the hidden vibe', () => {
    const { api } = load();
    const form = { target: 'person', method: 'cache', roots: ['oldenglish'], ckinds: ['noble'], parts: ['given', 'family'] };
    const src = api.cacheOne(form, 'oldenglish', 'noble', seeded(41));
    const k = src.pieces.findIndex(p => p.role === 'family');
    const next = api.cachePiece(src, k, form, [], seeded(42));
    assert.ok(next && next.text !== src.pieces[k].text && next.frags?.length);
    assert.equal(api.cachePiece(src, src.pieces.findIndex(p => p.role === 'particle'), form), null);
    const ai = api.aiForm({ ...form, vibe: 'cosmic', realNames: 'only', likeText: 'Elric' }, src);
    assert.equal(ai.vibe, 'custom');
    assert.match(ai.customVibe, /Old English name roots/);
    assert.equal(ai.realNames, 'invented');
    assert.equal(ai.likeText, '');
    assert.equal(ai.target, 'other', 'a full name goes as one whole name');
    assert.equal(api.aiForm({ ...form, parts: ['given'] }, { name: 'Edwin' }).target, 'person');
    const notCache = { target: 'shop', method: 'cache' };
    assert.equal(api.isCache(notCache), false);
    assert.equal(api.aiForm(notCache, {}), notCache);
});

test('v0.2.0: the form shows AI / Cache for people and places, roots and kinds in Cache mode, and the fragments line', () => {
    const { api } = load({ lang: 'ko' });
    api.settings();
    const cache = api.formHtml({ target: 'person', method: 'cache', roots: ['latin'], ckinds: ['common'], parts: ['given'], extras: [] });
    assert.match(cache, /tbd-form tbd-cache/);
    assert.match(cache, /data-chip="method" data-v="cache" aria-pressed="true"/);
    assert.match(cache, /data-chip="root" data-v="latin" aria-pressed="true"/);
    assert.match(cache, /수도원·성인/);
    assert.match(cache, /class="tbd-ai-only">분위기/);
    const place = api.formHtml({ target: 'place', method: 'cache', roots: ['latin'] });
    assert.ok(!/data-chip="ckind"/.test(place), 'places use the kind select instead');
    const shop = api.formHtml({ target: 'shop', method: 'cache' });
    assert.ok(!/data-chip="method"/.test(shop) && !/tbd-cache/.test(shop));
    const n = api.cacheNames({ target: 'place', method: 'cache', roots: ['oldenglish'] }, 1, [], seeded(51))[0];
    const line = api.fragsHtml(n).replace(/<[^>]+>/g, '');
    assert.match(line, /^fragments: \S+ .+ \+ \S+ .+ · 옛 영어$/);
    api.setResults([{ ...n, form: { target: 'place', method: 'cache' } }]);
    assert.match(api.resultsHtml(), /ARCHIVE/);
    assert.equal(api.fragsHtml({ name: 'X' }), '');
});

test('v0.2.1: picked roots reach the AI per name, and "Any" changes nothing', () => {
    const { api } = load();
    const base = { target: 'person', vibe: 'medieval', parts: ['given', 'family'], extras: [], method: 'ai' };
    // Nothing picked: same prompt as before, with the vibe endings still in the seeds.
    assert.deepEqual([...api.aiRoots(base)], []);
    const plain = api.rollSeeds(20, base, seeded(3));
    assert.ok(plain.every(s => !s.root));
    assert.ok(plain.some(s => s.ending) && plain.some(s => s.family));
    const plainText = api.buildMessages(base, plain)[1].content;
    assert.ok(!/Name roots/.test(plainText));
    assert.match(plainText, /Don't claim a real meaning/);

    const form = { ...base, aiRoots: ['celtic', 'norse'] };
    const seeds = api.rollSeeds(6, form, seeded(3));
    assert.deepEqual([...new Set(seeds.map(s => s.root))].sort(), ['celtic', 'norse'], 'roots take turns');
    assert.ok(seeds.every(s => !s.ending), 'vibe endings would argue with the roots');
    // v0.2.15: no vibe family styles, only the plain kinds in turn.
    assert.ok(seeds.every(s => /^from (a |looks )/.test(s.family)), 'only plain family kinds with roots');
    assert.ok(seeds.every(s => s.syllables), 'syllable count stays');
    const text = api.buildMessages(form, seeds)[1].content;
    assert.match(text, /Name roots: build each name from Celtic or Norse name elements .*each name below says which\. Family names follow/);
    assert.match(text, /name roots: they decide the sounds/);
    assert.match(text, /1\. given name: (Welsh|Irish|Scottish Gaelic|Norse) roots, /);
    assert.match(text, /Don't state what the name means or where it comes from/);
    assert.ok(!/Don't claim a real meaning/.test(text));
});

test('v0.2.1: when another choice says the opposite, the roots stay home', () => {
    const { api } = load();
    const form = { target: 'person', vibe: 'fantasy', parts: ['given'], extras: [], method: 'ai', aiRoots: ['latin'] };
    assert.equal(api.aiRootsOff(form), '');
    const like = { ...form, likeText: 'Elric' };
    assert.equal(api.aiRootsOff(like), 'like');
    assert.ok(!/Name roots/.test(api.buildMessages(like, api.rollSeeds(3, like, seeded(2)))[1].content));
    const cosmic = { ...form, vibe: 'cosmic' };
    assert.equal(api.aiRootsOff(cosmic), 'cosmic');
    assert.equal(api.aiRootsOff({ ...cosmic, realNames: 'near' }), '', 'old-town folk can have roots');
    assert.equal(api.aiRootsOff({ ...cosmic, target: 'place' }), '', 'cosmic places can');
    // Shops, items and Cache mode never take AI roots.
    assert.deepEqual([...api.aiRoots({ ...form, target: 'shop' })], []);
    assert.deepEqual([...api.aiRoots({ ...form, method: 'cache' })], []);
    // Places drop the English-style landscape ending line, which would fight a Germanic or Latin root.
    const place = { target: 'place', vibe: 'fantasy', method: 'ai', aiRoots: ['germanic'] };
    const placeText = api.buildMessages(place, api.rollSeeds(3, place, seeded(4)))[1].content;
    assert.ok(!/-holm, -mere/.test(placeText));
    assert.match(placeText, /Germanic place-name elements/);
    assert.match(api.buildMessages({ ...place, aiRoots: [] }, api.rollSeeds(3, { ...place, aiRoots: [] }, seeded(4)))[1].content, /-holm, -mere/);
});

test('v0.2.1: ✨ and swapping a part keep the roots; ✨ from Cache does not add them twice', () => {
    const { api } = load();
    const form = { target: 'person', vibe: 'fantasy', parts: ['given', 'family'], extras: [], method: 'ai', aiRoots: ['latin'] };
    const src = { name: 'Aurel Vantis', pieces: [{ role: 'given', text: 'Aurel' }, { role: 'family', text: 'Vantis' }] };
    assert.match(api.buildRefineMessages(src, 'soft', form)[1].content, /Keep it built from Latin name roots/);
    assert.match(api.buildPieceMessages(src, 'family', form)[1].content, /Build it from Latin name roots/);
    assert.ok(!/Build it from/.test(api.buildPieceMessages(src, 'given', { ...form, aiRoots: [] })[1].content));
    const fromCache = api.aiForm({ target: 'person', method: 'cache', roots: ['norse'], aiRoots: ['latin'] }, { name: 'Ulfgeir' });
    assert.deepEqual([...fromCache.aiRoots], []);
});

test('v0.2.1: the roots chips sit in "More options" and the folded line shows them', () => {
    const { api, extensionSettings } = load({ lang: 'ko' });
    api.settings();
    const form = { target: 'person', vibe: 'fantasy', method: 'ai', parts: ['given'], extras: [], aiRoots: ['celtic'] };
    const html = api.formHtml(form);
    assert.match(html, /id="tbd_airoots"/);
    assert.match(html, /data-chip="airoot" data-v="any" aria-pressed="false"/);
    assert.match(html, /data-chip="airoot" data-v="celtic" aria-pressed="true"/);
    assert.ok(html.indexOf('id="tbd_airoots"') > html.indexOf('id="tbd_more"'), 'inside the fold');
    assert.match(api.formHtml({ ...form, aiRoots: [] }), /data-chip="airoot" data-v="any" aria-pressed="true"/);
    assert.ok(!/tbd_airoots/.test(api.formHtml({ ...form, target: 'shop' })));
    extensionSettings.tbd_names.moreOpen = false;
    assert.match(api.moreFoldHtml(form).replace(/<[^>]+>/g, ''), /뿌리: 켈트/);
    const off = api.moreFoldHtml({ ...form, likeText: 'Elric' });
    assert.match(off, /tbd-fold-off[^>]*>뿌리: 켈트/);
    assert.match(api.aiRootsHtml({ ...form, likeText: 'Elric' }), /지금은 안 써요/);
    assert.match(api.aiRootsHtml(form), /id="tbd_airoot_note" hidden/);
});

test('v0.2.1: start letters skip ones the root never uses', () => {
    const { api } = load();
    const seeds = api.rollSeeds(200, { target: 'person', vibe: 'fantasy', method: 'ai', aiRoots: ['latin'] }, seeded(9));
    assert.ok(seeds.every(s => !['W', 'K'].includes(s.start)));
});

test('v0.2.2: eight roots and six kinds, all named in both languages, every fragment with a clean meaning', () => {
    const { api } = load();
    assert.deepEqual([...api.CACHE_ROOTS], ['latin', 'oldenglish', 'norman', 'germanic', 'celtic', 'norse', 'greek', 'slavic']);
    assert.deepEqual([...api.CACHE_KINDS], ['common', 'noble', 'religious', 'royal', 'warrior', 'scholar']);
    for (const lang of ['en', 'ko']) {
        const L = api.STRINGS[lang];
        for (const r of api.CACHE_ROOTS) assert.ok(L.roots[r], `${lang} root ${r}`);
        for (const k of api.CACHE_KINDS) assert.ok(L.ck[k], `${lang} kind ${k}`);
        for (const b of ['patron', 'place', 'dwell', 'trade', 'looks']) assert.ok(L.branch[b], `${lang} branch ${b}`);
    }
    const cat = /^(town|water|forest|hill|field|fort|coast|at|by|under|du|dela)(\/|$)/;
    let total = 0;
    for (const root of api.CACHE_ROOTS) {
        const R = api.CACHE[root];
        let n = 0;
        for (const key of ['head', 'masc', 'fem', 'placeHead', 'placeTail', 'placePre', 'placePost', 'dwellPre', 'dwellWord', 'dwell', 'trade', 'looks', 'war', 'royalEpithets']) {
            for (const f of R[key] || []) {
                n++;
                // "Text=English=Korean=cats": a missing "=" pushes a category into the Korean meaning.
                assert.ok(!cat.test(f.ko), `${root}.${key}: ${f.t}`);
                if (!['masc', 'fem', 'placeTail'].includes(key)) assert.ok(f.en && f.ko, `${root}.${key}: ${f.t} has a meaning`);
                assert.ok(!/[=;]/.test(f.t + f.en + f.ko), `${root}.${key}: ${f.t}`);
            }
        }
        assert.ok(n >= 90, `${root} has ${n} fragments`);
        assert.ok(R.titles?.m?.length && R.titles?.f?.length && R.royal?.m?.length && R.royal?.f?.length, root);
        total += n;
    }
    assert.ok(total >= 900, `${total} fragments`);
});

test('v0.2.2: hundreds of names stay sayable and fresh', () => {
    const { api } = load();
    const rnd = seeded(71);
    for (const root of api.CACHE_ROOTS) {
        const people = api.cacheNames({ target: 'person', method: 'cache', roots: [root], parts: ['given', 'family'], ckinds: [...api.CACHE_KINDS] }, 200, [], rnd);
        const places = api.cacheNames({ target: 'place', method: 'cache', roots: [root] }, 200, [], rnd);
        const givens = people.map(n => n.pieces.find(p => p.role === 'given').text);
        const bad = [...givens, ...places.map(n => n.name)].filter(t => !api.sayable(t));
        assert.ok(bad.length <= 4, `${root}: ${bad.join(', ')}`);
        assert.ok(new Set(givens).size >= 150, `${root}: only ${new Set(givens).size} different given names`);
        assert.ok(new Set(places.map(n => n.name)).size >= 150, `${root} places`);
        // No head and ending of the same word (Archo + archos).
        assert.ok(!givens.some(t => /^(arch\w*arch|slav\w*slav)/i.test(t)), root);
    }
});

test('v0.2.2: royal, warrior and scholar names', () => {
    const { api } = load();
    const rnd = seeded(81);
    const king = api.cacheOne({ target: 'person', parts: ['given', 'family'], gender: 'masculine', fixedFamily: 'Holloway' }, 'oldenglish', 'royal', rnd);
    assert.deepEqual([...king.pieces.map(p => p.role)], ['title', 'given', 'epithet']);
    assert.ok(['King', 'Prince', 'Duke', 'Earl'].includes(king.pieces[0].text));
    assert.ok(king.pieces[0].fixed && !king.pieces[2].fixed);
    assert.ok(!/Holloway/.test(king.name), 'kings go by a number or an epithet, not a kept family name');
    assert.match(king.pieces[2].text, /^(II|III|IV|V|VI|VII|VIII|IX|the \w+)$/);
    for (let i = 0; i < 30; i++) {
        const q = api.cacheOne({ target: 'person', parts: ['given'], gender: 'feminine' }, 'latin', 'royal', rnd);
        assert.ok(['Regina', 'Imperatrix', 'Ducissa', 'Principissa'].includes(q.pieces[0].text));
        assert.ok(!/us$/.test(q.pieces[2].text), `a queen is Magna, not Magnus: ${q.name}`);
        const g = api.cacheOne({ target: 'person', parts: ['given'] }, 'greek', 'royal', rnd);
        assert.ok(!/^(II|III|IV|V|VI|VII|VIII|IX)$/.test(g.pieces[2].text), `Greek kings use epithets: ${g.name}`);
    }
    const war = api.cacheOne({ target: 'person', parts: ['given', 'family'] }, 'norse', 'warrior', rnd);
    assert.deepEqual([...war.pieces.map(p => p.role)], ['given', 'epithet']);
    assert.ok(war.pieces[1].frags.length >= 1 && war.pieces[1].frags.every(f => f.ko));
    // Swapping the byname keeps it a byname; swapping a king's keeps it royal.
    const kRoll = api.cachePiece(king, 2, { target: 'person', gender: 'masculine' }, [], rnd);
    assert.match(kRoll.text, /^(II|III|IV|V|VI|VII|VIII|IX|the \w+)$/);
    for (const root of api.CACHE_ROOTS) {
        const s = api.cacheOne({ target: 'person', parts: ['given'], gender: 'masculine' }, root, 'scholar', rnd);
        assert.deepEqual([...s.pieces.map(p => p.role)], ['given', 'family']);
        assert.match(s.pieces[0].text, /(us|es|as)$/, s.name);
        assert.match(s.pieces[1].text, /(ius|ensis)$/, s.name);
        assert.ok(!/(ides|ović|ski)ius$/.test(s.pieces[1].text), s.name);
    }
    const she = api.cacheOne({ target: 'person', parts: ['given'], gender: 'feminine' }, 'germanic', 'scholar', rnd);
    assert.match(she.pieces[0].text, /a$/);
    const kept = api.cacheOne({ target: 'person', parts: ['given', 'family'], fixedFamily: 'Holloway' }, 'norman', 'scholar', rnd);
    assert.equal(kept.pieces[1].text, 'Hollowius');
    assert.ok(kept.pieces[1].fixed);
    assert.equal(api.latinGiven({ text: 'Theodoros', frags: [] }, 'm').text, 'Theodorus');
});

test('v0.2.2: family names come from five kinds, each root in its own way', () => {
    const { api } = load();
    const rnd = seeded(91);
    const seen = new Set();
    for (let i = 0; i < 300; i++) seen.add(api.cacheFamily('oldenglish', 'm', rnd).branch);
    assert.deepEqual([...seen].sort(), ['dwell', 'looks', 'patron', 'place', 'trade']);
    for (let i = 0; i < 40; i++) {
        const d = api.cacheFamilyBranch('oldenglish', 'dwell', 'm', rnd);
        assert.ok(d.frags.length === 1 || /^(At|By|Under)/.test(d.text), d.text);
        if (/^Under/.test(d.text)) assert.match(d.text, /^Under(wood|hill|down)$/);
        const fr = api.cacheFamilyBranch('norman', 'dwell', 'm', rnd);
        assert.match(fr.text, /^(Du|Dela)[a-zé]+$/, fr.text);
        assert.match(api.cacheFamilyBranch('norman', 'looks', 'm', rnd).text, /^Le[a-z]+$/);
        assert.match(api.cacheFamilyBranch('norman', 'patron', 'm', rnd).text, /^Fitz[A-Z]/);
        const sf = api.cacheFamily('slavic', 'f', rnd).text;
        assert.ok(!/(sk[iy]|ov|ev)$/.test(sf), `a Slavic woman's family name agrees: ${sf}`);
        const gf = api.cacheFamily('greek', 'f', rnd).text;
        assert.match(gf, /^of /, '-ides means "son of"');
        assert.match(api.cacheFamilyBranch('greek', 'patron', 'm', rnd).text, /ides$/);
    }
    assert.equal(api.glue('Aristo', 'ippos', true), 'Aristippos');
    assert.equal(api.glue('Theo', 'doros', true), 'Theodoros');
    // Slavic nobles take -ski from the estate.
    const pan = api.cacheOne({ target: 'person', parts: ['given', 'family'], gender: 'masculine' }, 'slavic', 'noble', rnd);
    assert.match(pan.name, /[sc]ki$/);
    assert.ok(!pan.pieces.some(p => p.role === 'particle'));
});

test('v0.2.2: places now and then get Great / -on-Sea / a saint, and only where they fit', () => {
    const { api } = load();
    const rnd = seeded(101);
    const extras = { pre: 0, post: 0, saint: 0 };
    for (let i = 0; i < 600; i++) {
        const p = api.cachePlace('oldenglish', null, rnd);
        if (p.saint) { extras.saint++; assert.match(p.text, /^St\. [A-Z][a-z]+'s$/); }
        else if (/^(Great|Little|Upper|Lower|North|South|East|West|Long|Market) /.test(p.text)) extras.pre++;
        else if (/(-on-Sea|-le-Street|-upon-Avon| Magna| Parva)$/.test(p.text)) extras.post++;
    }
    assert.ok(extras.pre > 5 && extras.post > 5 && extras.saint > 5, JSON.stringify(extras));
    for (let i = 0; i < 300; i++) {
        const w = api.cachePlace('oldenglish', ['water'], rnd);
        assert.ok(!/(-on-Sea|-le-Street|^St\.|^Market )/.test(w.text), w.text);
        const k = api.cachePlace('celtic', null, rnd);
        if (k.saint) assert.match(k.text, /^(Kil|Llan)[a-z]+$/);
    }
    assert.equal(api.cachePlace('germanic', null, seeded(5), true).frags.length, 2, 'plain places (inside family names) never get extras');
});

test('v0.2.2: the fragments line says which kind of family name it is', () => {
    const { api } = load({ lang: 'ko' });
    api.settings();
    const r = { name: 'Edwin Atwood', cache: true, root: 'oldenglish', pieces: [
        { role: 'given', text: 'Edwin', frags: [{ t: 'Ed', en: 'wealth', ko: '부·행운' }, { t: 'win', en: 'friend', ko: '벗' }] },
        { role: 'family', text: 'Atwood', branch: 'dwell', frags: [{ t: 'At', en: 'at', ko: '곁에' }, { t: 'wood', en: 'wood', ko: '숲' }] },
    ] };
    const line = api.fragsHtml(r).replace(/<[^>]+>/g, '');
    assert.equal(line, 'fragments: Ed 부·행운 + win 벗 / At 곁에 + wood 숲 · 사는 곳 · 옛 영어');
    const html = api.formHtml({ target: 'person', method: 'cache', roots: ['greek'], ckinds: ['royal'], parts: ['given'], extras: [] });
    assert.match(html, /data-chip="root" data-v="slavic"/);
    assert.match(html, /data-chip="ckind" data-v="royal" aria-pressed="true"/);
    assert.match(html, /왕족·군주/);
});

// ---------- v0.2.3 Cache + AI ----------
test('Cache + AI counts as Cache, only for people and places', () => {
    const { api } = load();
    assert.equal(api.isCache({ method: 'polish', target: 'person' }), true);
    assert.equal(api.isPolish({ method: 'polish', target: 'place' }), true);
    assert.equal(api.isPolish({ method: 'polish', target: 'shop' }), false);
    assert.equal(api.isPolish({ method: 'cache', target: 'person' }), false);
    assert.deepEqual([...api.METHODS], ['ai', 'cache', 'polish', 'roster']);
});

test('polish prompt lists only the parts it may change, and no meanings', () => {
    const { api } = load();
    const form = { method: 'polish', target: 'person', roots: ['oldenglish'], ckinds: ['religious'], mustContain: 'or' };
    const list = [
        { name: 'Wulfrith', root: 'oldenglish', cache: true },
        { name: 'Sister Ormhild of Stainthorpe', root: 'oldenglish', cache: true, kind: 'religious', pieces: [
            { role: 'title', text: 'Sister', fixed: true }, { role: 'given', text: 'Ormhild' }, { role: 'origin', text: 'of Stainthorpe' }] },
    ];
    const user = api.buildPolishMessages(list, form, { lang: 'ko', reading: true })[1].content;
    assert.match(user, /Old English/);
    assert.match(user, /1\. "Wulfrith"/);
    assert.match(user, /2\. "Sister Ormhild of Stainthorpe" — change only: given "Ormhild"/);
    assert.match(user, /Keep the letters "or"/);
    assert.match(user, /describe only its feel/);
    assert.match(user, /in Korean/);
    assert.doesNotMatch(user, /origin "/);
});

test('polish answers line up by n, and a missing one stays empty', () => {
    const { api } = load();
    const raw = '<think>hmm</think>[{"n": 2, "name": "Bee"}, {"n": 1, "name": "Ay"}]';
    const out = api.polishAnswers(raw, 3);
    assert.equal(out[0].name, 'Ay');
    assert.equal(out[1].name, 'Bee');
    assert.equal(out[2], null);
    assert.deepEqual([...api.polishAnswers('nothing here', 2)], []);
});

test('a polish must stay light: same first letter, same word count, close length', () => {
    const { api } = load();
    assert.equal(api.polishOk('Wulfrith', 'Wulfrath'), true);
    assert.equal(api.polishOk('Richier', 'Richie'), false, 'the ending stays');
    assert.equal(api.polishOk('Wulfrith', 'Thomas'), false);
    assert.equal(api.polishOk('Wulfrith', 'Wulfrithingtonius'), false);
    assert.equal(api.polishOk('Gornji Volkets', 'Gornji Volkats'), true);
    assert.equal(api.polishOk('Gornji Volkets', 'Gornjivolkets'), false);
    assert.equal(api.polishOk('Wulfrith', '{"name'), false);
});

test('applying a polish keeps fixed parts, marks the original, and falls back when it is off', () => {
    const { api } = load();
    const form = { method: 'polish', target: 'person' };
    const n = { name: 'Godgar Underwood', root: 'oldenglish', cache: true, pieces: [
        { role: 'given', text: 'Godgar', frags: [] }, { role: 'family', text: 'Underwood', frags: [] }] };
    const p = api.applyPolish(n, { parts: { given: 'Godgaer', family: 'Xyz' }, read: '고드개어', note: '단단한 느낌' }, form);
    assert.equal(p.name, 'Godgaer Underwood');
    assert.equal(p.orig, 'Godgar Underwood');
    assert.equal(p.polished, true);
    assert.equal(p.pieces[0].orig, 'Godgar');
    assert.equal(p.note, '단단한 느낌');
    // A word on the avoid list keeps the cache's own part.
    const q = api.applyPolish(n, { parts: { given: 'Godgaer' } }, form, new Set(['godgaer']));
    assert.equal(q.name, 'Godgar Underwood');
    assert.equal(api.applyPolish(n, null, form), null);
    // Must-contain letters can't be polished away.
    const one = { name: 'Everton', cache: true, root: 'oldenglish' };
    assert.equal(api.applyPolish(one, { name: 'Evarten' }, { ...form, target: 'place', mustContain: 'ton' }).name, 'Everton');
    assert.equal(api.applyPolish(one, { name: 'Evertun' }, { ...form, target: 'place' }).name, 'Evertun');
});

test('one-part polish only touches that part', () => {
    const { api } = load();
    const n = { name: 'Edwin Ashford', pieces: [{ role: 'given', text: 'Edwin' }, { role: 'family', text: 'Ashford' }], polishOnly: ['family'] };
    assert.deepEqual([...api.polishRoles(n)], ['family']);
    const p = api.applyPolish(n, { parts: { family: 'Asheford', given: 'Edwyn' } }, { target: 'person' });
    assert.equal(p.name, 'Edwin Asheford');
    assert.equal(p.polishOnly, undefined);
});

// ---------- v0.2.4 Found ⭐ ----------
test('Found keeps a clean copy and toggles in and out', () => {
    const ext = {};
    const { api } = load({ extensionSettings: ext });
    const st = api.settings();
    const r = { name: 'Mirelda Thornby', read: '미렐다', note: 'soft', form: { target: 'person', vibe: 'fantasy', parts: ['given', 'family'] },
        pieces: [{ role: 'given', text: 'Mirelda' }, { role: 'family', text: 'Thornby' }], check: { state: 'done' }, nicks: ['Mira'], from: { name: 'Mirella' }, tag: 'soft' };
    assert.equal(api.toggleFound(r, st), 'in');
    assert.equal(st.found.length, 1);
    const e = st.found[0];
    assert.equal(e.target, 'person');
    assert.equal(e.from, 'Mirella');
    assert.equal(e.check, undefined);
    assert.equal(api.isFound(r, st), true);
    // Kept names stay off new results.
    const avoid = api.avoidList(st, r.form);
    assert.ok(avoid.includes('Mirelda') && avoid.includes('Thornby'));
    assert.equal(api.toggleFound(r, st), 'out');
    assert.equal(st.found.length, 0);
    assert.ok(!api.avoidList(st, r.form).includes('Mirelda'));
});

test('the same name can be kept once per target, and Found has a cap', () => {
    const { api } = load({ extensionSettings: {} });
    const st = api.settings();
    api.toggleFound({ name: 'Vellow', form: { target: 'person' } }, st);
    api.toggleFound({ name: 'Vellow', form: { target: 'place' } }, st);
    assert.equal(st.found.length, 2);
    st.found = Array.from({ length: api.FOUND_MAX }, (_, i) => ({ name: `N${i}`, target: 'other' }));
    assert.equal(api.toggleFound({ name: 'Extra', form: { target: 'other' } }, st), 'full');
});

test('Found export / import round-trips, skips repeats and junk', () => {
    const { api } = load({ extensionSettings: {} });
    const st = api.settings();
    api.toggleFound({ name: 'Calderwick', form: { target: 'place' }, cache: true, root: 'oldenglish', frags: [{ t: 'Calder', en: 'rocky water', ko: '바위 물' }] }, st);
    const text = api.foundExportText(st);
    st.found = [];
    assert.equal(api.foundImport(text, st), 1);
    assert.equal(st.found[0].frags[0].t, 'Calder');
    assert.equal(api.foundImport(text, st), 0);
    assert.equal(api.foundImport('not json', st), -1);
    assert.equal(api.foundImport('{"x":1}', st), -1);
    const junk = JSON.stringify({ items: [{ name: '[{"parts' }, { name: 42 }, { name: 'Ossley', target: 'evil', pieces: 'no', onclick: 'x' }] });
    assert.equal(api.foundImport(junk, st), 1);
    const o = st.found.find(e => e.name === 'Ossley');
    assert.equal(o.target, 'other');
    assert.equal(o.onclick, undefined);
    assert.equal(o.pieces, undefined);
});

test('Found list shows names newest first and escapes text', () => {
    const { api } = load({ extensionSettings: {} });
    const st = api.settings();
    st.found = [{ name: 'Ashmere', target: 'place', at: 1 }, { name: 'Bryn<b>', target: 'person', at: 2 }];
    const html = api.foundHtml(st);
    assert.ok(html.indexOf('Bryn&lt;b&gt;') < html.indexOf('Ashmere'));
    assert.doesNotMatch(html, /Bryn<b>/);
    assert.match(api.tabsHtml(st), /tbd-tab-n">2</);
});

// ---------- v0.2.6 ----------
test('rulers get more than one title, and Norman / Germanic bynames match the title language and gender', () => {
    const { api } = load();
    const rnd = seeded(5);
    const titles = new Set();
    for (let i = 0; i < 80; i++) {
        const m = api.cacheOne({ target: 'person', parts: ['given'], gender: 'masculine' }, 'norman', 'royal', rnd);
        titles.add(m.pieces[0].text);
        assert.doesNotMatch(m.pieces[2].text, /^(the |la |die )/, m.name);
        const f = api.cacheOne({ target: 'person', parts: ['given'], gender: 'feminine' }, 'germanic', 'royal', rnd);
        assert.doesNotMatch(f.pieces[2].text, /^(the |der |le )/, f.name);
        assert.equal(f.gender, 'f');
        const gq = api.cacheOne({ target: 'person', parts: ['given'], gender: 'feminine' }, 'greek', 'royal', rnd);
        assert.ok(!['Soter', 'Nikator', 'Megas', 'Euergetes', 'Kallinikos'].includes(gq.pieces[2].text), gq.name);
        const lq = api.cacheOne({ target: 'person', parts: ['given'], gender: 'feminine' }, 'latin', 'royal', rnd);
        assert.notEqual(lq.pieces[2].text, 'Victor', lq.name);
    }
    assert.ok(titles.has('Roi') && titles.size >= 3, [...titles].join(','));
    // A swapped byname keeps the gender of the name, even when the form says "any".
    const q = api.cacheOne({ target: 'person', parts: ['given'], gender: 'feminine' }, 'norman', 'royal', rnd);
    for (let i = 0; i < 20; i++) {
        const e = api.cachePiece(q, 2, { target: 'person', gender: 'any' }, [], rnd);
        assert.doesNotMatch(e.text, /^le /, e.text);
    }
});

// ---------- v0.2.7: a sweep over every root, kind and gender, so odd names can't creep back in ----------
function sweep(api, n = 60) {
    const rnd = seeded(2027);
    const people = [];
    for (const root of api.CACHE_ROOTS) for (const kind of api.CACHE_KINDS) for (const gender of ['masculine', 'feminine']) {
        for (let i = 0; i < n; i++) people.push({ root, kind, g: gender[0], n: api.cacheOne({ target: 'person', parts: ['given', 'family'], gender }, root, kind, rnd) });
    }
    const places = [];
    for (const root of api.CACHE_ROOTS) for (let i = 0; i < n * 4; i++) places.push({ root, n: api.cachePlace(root, null, rnd, true) });
    return { people, places };
}
const MALE_ONLY = ['Niger', 'Longus', 'Paullus', 'Crassus', 'Calvus', 'Barbatus', 'Rufus', 'Albinus', 'Naso', 'Capito', 'Leo', 'Bellator', 'Victor', 'Magnus', 'Pius',
    'Nikator', 'Leon', 'Hoplomachos', 'Poliorketes', 'Monophthalmos', 'Soter', 'Megas', 'Euergetes', 'Kallinikos'];
test('sweep: women never get a man-only byname or family name', () => {
    const { api } = load();
    const trades = new Set(api.CACHE.latin.trade.map(f => f.t));
    for (const { root, g, n } of sweep(api).people) {
        if (g !== 'f') continue;
        const words = n.name.split(/\s+/);
        for (const w of words) {
            assert.ok(!MALE_ONLY.includes(w), `${root}: ${n.name}`);
            if (root === 'latin') assert.ok(!trades.has(w), `Roman women had no trade name: ${n.name}`);
        }
        assert.doesNotMatch(n.name, /\b(le|der) [A-Z]/, n.name);
        assert.doesNotMatch(n.name, /\b(Roi|Duc|Comte|König|Kaiser|Herzog|Fürst|Graf|King|Prince|Duke|Earl|Jarl|Rex|Imperator|Dux|Princeps|Basileus|Anax|Despotes|Archon|Knyaz|Tsar|Voivode)\b/, n.name);
    }
});
test('sweep: Slavic -ski names, Latin scholars and places come out well-formed', () => {
    const { api } = load();
    const { people, places } = sweep(api);
    for (const { n } of people) {
        assert.doesNotMatch(n.name, /(cs|ks|tss)k[aiy]\b|[ck]sk[aiy]\b/, n.name);
        assert.doesNotMatch(n.name, /aius\b|ovaius\b/, n.name);
    }
    for (const { root, n } of places) {
        // Two consonants never meet at the join in Latin or Slavic place names (Petr + magus → Petromagus).
        if ((root === 'latin' || root === 'slavic') && n.frags.length === 2) {
            const [h, t] = n.frags;
            if (/[^aeiouy]$/i.test(h.t) && /^[^aeiouy]/i.test(t.t)) assert.ok(!n.text.toLowerCase().includes((h.t + t.t).toLowerCase()), n.text);
        }
        assert.doesNotMatch(n.text.toLowerCase(), /(castr\w*castr|grad\w*grad)/, n.text);
    }
    assert.equal(api.latinGiven({ text: 'Apollokles', frags: [] }, 'm').text, 'Apollokles');
    assert.equal(api.latinGiven({ text: 'Neolaos', frags: [] }, 'm').text, 'Neolaus');
});

// ---------- v0.2.8: Split / Merge ----------
function mergeSweep(api, n = 12) {
    const rnd = seeded(2028);
    const people = [], places = [];
    for (const a of api.CACHE_ROOTS) for (const b of api.CACHE_ROOTS) {
        if (a === b) continue;
        for (const kind of api.CACHE_KINDS) for (const gender of ['masculine', 'feminine']) {
            for (let i = 0; i < n; i++) {
                const side = rnd() < 0.5 ? a : b;
                people.push({ root: side, mix: [a, b], kind, g: gender[0], n: api.cacheOne({ target: 'person', parts: ['given', 'middle', 'family'], gender }, side, kind, rnd, [a, b]) });
            }
        }
        for (let i = 0; i < n * 3; i++) places.push({ mix: [a, b], n: api.cacheOne({ target: 'place', kind: 'any' }, a, 'common', rnd, [a, b]) });
    }
    return { people, places };
}
test('merge: only with two or more roots, and each name gets two different roots', () => {
    const { api } = load();
    assert.equal(api.cacheMerge({ target: 'person', method: 'cache', roots: ['latin'], rootMix: 'merge' }), false);
    assert.equal(api.cacheMerge({ target: 'person', method: 'cache', roots: ['latin', 'norse'], rootMix: 'split' }), false);
    assert.equal(api.cacheMerge({ target: 'person', method: 'ai', roots: ['latin', 'norse'], rootMix: 'merge' }), false);
    assert.equal(api.cacheMerge({ target: 'place', method: 'polish', roots: ['latin', 'norse'], rootMix: 'merge' }), true);
    const pairs = api.rootPairs(['latin', 'norse', 'celtic'], seeded(3));
    assert.equal(pairs.length, 6);
    for (const [a, b] of pairs) assert.notEqual(a, b);
    const form = { target: 'person', method: 'cache', roots: ['latin', 'norse', 'celtic'], rootMix: 'merge', gender: 'any', parts: ['given', 'family'], ckinds: ['common'] };
    const names = api.cacheNames(form, 12, [], seeded(5));
    assert.equal(names.length, 12);
    for (const n of names) {
        assert.equal(n.mix.length, 2);
        assert.notEqual(n.mix[0], n.mix[1]);
        assert.ok(n.mix.includes(n.root), 'family name follows one of the two');
        const given = n.pieces.find(p => p.role === 'given');
        assert.deepEqual([...given.frags.map(f => f.r)], [...n.mix]);
    }
    // Split stays as it was: one root per name, no mix.
    for (const n of api.cacheNames({ ...form, rootMix: 'split' }, 6, [], seeded(5))) assert.equal(n.mix, undefined);
});
test('merge: places take the head from one root and the tail from the other', () => {
    const { api } = load();
    const names = api.cacheNames({ target: 'place', method: 'cache', roots: ['latin', 'oldenglish'], rootMix: 'merge', kind: 'any' }, 10, [], seeded(9));
    for (const n of names) {
        assert.equal(n.mix.length, 2);
        assert.ok(n.frags.length >= 2);
        assert.ok(n.frags.every(f => n.mix.includes(f.r)), n.name);
        assert.ok(new Set(n.frags.map(f => f.r)).size === 2, n.name);
    }
});
test('merge: fragments line names each root, and 🔄 keeps the same two roots', () => {
    const { api } = load({ lang: 'ko' });
    const n = api.cacheOne({ target: 'place', kind: 'any' }, 'latin', 'common', seeded(4), ['latin', 'oldenglish']);
    const html = api.fragsHtml(n);
    assert.match(html, /\(라틴\)/);
    assert.match(html, /\(옛 영어\)/);
    assert.match(html, /라틴 \+ 옛 영어/);
    const f = api.rerollForm(n, { roots: ['greek'] });
    assert.deepEqual([...f.roots], ['latin', 'oldenglish']);
    assert.equal(f.rootMix, 'merge');
    assert.deepEqual([...api.rerollForm({ root: 'greek' }, { roots: ['latin', 'norse'], rootMix: 'merge' }).roots], ['greek']);
    // Swapping the given name keeps the two roots; the family name stays with its one root.
    const p = api.cacheOne({ target: 'person', parts: ['given', 'family'], gender: 'masculine' }, 'norse', 'common', seeded(8), ['latin', 'norse']);
    for (let i = 0; i < 10; i++) {
        const g = api.cachePiece(p, 0, {}, [], seeded(20 + i));
        assert.ok(g.frags.every(x => ['latin', 'norse'].includes(x.r)));
    }
    const fam = p.pieces.find(x => x.role === 'family');
    assert.ok(fam.frags.every(x => !x.r));
    assert.match(api.fragsHtml(p), /· 북유럽/);
});
test('merge: Found keeps the two roots, and bad values are dropped', () => {
    const { api } = load();
    const e = api.foundEntry({ name: 'Silvwick', target: 'place', cache: true, root: 'latin', mix: ['latin', 'oldenglish'], frags: [{ t: 'Silv', en: 'wood', ko: '숲', r: 'latin' }, { t: 'wick', en: 'farm', ko: '마을', r: 'nope' }] });
    assert.deepEqual([...e.mix], ['latin', 'oldenglish']);
    assert.equal(e.frags[0].r, 'latin');
    assert.equal(e.frags[1].r, undefined);
    assert.equal(api.foundEntry({ name: 'Silvwick', mix: ['latin', 'latin'] }).mix, undefined);
    assert.equal(api.foundEntry({ name: 'Silvwick', mix: ['latin', 'x'] }).mix, undefined);
});
test('merge sweep: merged names stay sayable and fit the gender', () => {
    const { api } = load();
    const { people, places } = mergeSweep(api);
    for (const { g, n } of people) {
        for (const p of n.pieces || []) if (['given', 'middle'].includes(p.role)) assert.ok(api.sayable(p.text), n.name);
        if (g === 'f') {
            for (const w of n.name.split(/\s+/)) assert.ok(!MALE_ONLY.includes(w), n.name);
            assert.doesNotMatch(n.name, /\b(le|der) [A-Z]/, n.name);
            assert.doesNotMatch(n.name, /\b(Roi|Duc|Comte|König|Kaiser|Herzog|Fürst|Graf|King|Prince|Duke|Earl|Jarl|Rex|Imperator|Dux|Princeps|Basileus|Anax|Despotes|Archon|Knyaz|Tsar|Voivode)\b/, n.name);
        }
        assert.doesNotMatch(n.name, /(cs|ks|tss)k[aiy]\b|[ck]sk[aiy]\b/, n.name);
        // A merged given name can be a real one (Gai + ius → Gaius); only Latinized family names must not end -aius.
        const fam = (n.pieces || []).find(p => p.role === 'family');
        if (fam) assert.doesNotMatch(fam.text, /aius\b|ovaius\b/, n.name);
    }
    for (const { n } of places) {
        assert.ok(api.sayable(n.name.replace(/[-\s].*$/, '')) || /\s|-/.test(n.name), n.name);
        if (n.frags.length >= 2) assert.notEqual(n.frags[0].t.toLowerCase(), n.frags[1].t.toLowerCase());
    }
});
test('merge: the AI gets two roots per name, one short rule, and the ✨ line says blend', () => {
    const { api } = load();
    const form = { target: 'person', method: 'ai', vibe: 'fantasy', aiRoots: ['latin', 'celtic', 'norse'], aiRootMix: 'merge', parts: ['given'] };
    assert.equal(api.aiMerge(form), true);
    assert.equal(api.aiMerge({ ...form, aiRoots: ['latin'] }), false);
    assert.equal(api.aiMerge({ ...form, likeText: 'Elric' }), false, 'like words switch the roots off');
    const seeds = api.rollSeeds(6, form, seeded(2));
    for (const s of seeds) { assert.ok(s.root && s.root2); assert.notEqual(s.root, s.root2); }
    const msgs = api.buildMessages(form, seeds);
    const text = msgs.map(m => m.content).join('\n');
    assert.match(text, /blend two roots in each name/);
    assert.match(text, /\d\. (Latin|Welsh|Irish|Scottish Gaelic|Norse) start \+ (Latin|Welsh|Irish|Scottish Gaelic|Norse) ending/);
    assert.match(text, /says which of Latin, Celtic and Norse gives its start and which gives its ending/);
    assert.match(api.rootsPhrase(form, ['latin', 'celtic'], 'keep'), /^Keep it blending Latin and Celtic/);
    assert.match(api.rootsPhrase({ ...form, aiRootMix: 'split' }, ['latin', 'celtic'], 'keep'), /^Keep it built from Latin or Celtic/);
    // Split: one root per name, as before.
    for (const s of api.rollSeeds(4, { ...form, aiRootMix: 'split' }, seeded(2))) assert.equal(s.root2, undefined);
});
test('merge: settings default to Split and bad values fall back', () => {
    const { api, extensionSettings } = load({ extensionSettings: { tbd_names: { form: { rootMix: 'weird', aiRootMix: 'merge' } } } });
    const st = api.settings();
    assert.equal(st.form.rootMix, 'split');
    assert.equal(st.form.aiRootMix, 'merge');
    assert.ok(extensionSettings);
});

// ---------- v0.2.9: Copy for review ----------
test('review text: choices once per group, every name with its fragments, in English', () => {
    const { api } = load({ lang: 'ko' });
    const form = { target: 'person', method: 'cache', roots: ['latin', 'norse'], rootMix: 'merge', ckinds: ['royal'], gender: 'feminine', parts: ['given', 'family'] };
    const names = api.cacheNames(form, 3, [], seeded(6)).map(n => ({ ...n, form }));
    const place = { ...api.cacheOne({ target: 'place', kind: 'forest' }, 'celtic', 'common', seeded(2)), form: { target: 'place', method: 'cache', roots: ['celtic'], kind: 'forest' } };
    const ai = { name: 'Morvel', read: '모르벨', note: '부드러운 느낌', real: true, nicks: ['Mor'], form: { target: 'person', method: 'ai', vibe: 'medieval', aiRoots: ['celtic', 'latin'], aiRootMix: 'merge', realNames: 'near', parts: ['given'] } };
    const text = api.reviewText([...names, place, ai]);
    assert.match(text, /\[Made with: Archive · Target: person · Gender: feminine · Roots: Latin, Norse \(Merge\) · Kind of name: Royal \/ ruler · Parts: given, family\]/);
    assert.equal(text.split('Made with: Archive · Target: person').length - 1, 1, 'same choices written once');
    assert.match(text, /\[Made with: Archive · Target: place · Kind: forest · Roots: Celtic\]/);
    assert.match(text, /\[Made with: AI · Target: person · Vibe: medieval · Gender: any · Roots: Celtic, Latin \(Merge\) · Real names: near · Parts: given\]/);
    for (const n of names) {
        assert.ok(text.includes(n.name), n.name);
        assert.match(text, /female, Royal \/ ruler/);
        assert.match(text, /given "[^"]+": \S+ \([^)]*\) \[(Latin|Norse)\] \+ /);
    }
    assert.match(text, /title "[^"]+" \(kept as is\)/);
    assert.match(text, /roots: (Latin \+ Norse|Norse \+ Latin)/);
    assert.match(text, /fragments: .+ · ?|fragments: /);
    assert.match(text, /Morvel  \{real\}\n   reading: 모르벨\n   note: 부드러운 느낌\n   nicknames: Mor/);
    // English meanings, not the Korean ones, even on a Korean screen.
    assert.doesNotMatch(text.split('Morvel')[0], /[가-힣]/);
});

// ---------- v0.2.10: chips can all go off · no shared part between name and family ----------
test('roots and kinds can all be off; finding then asks for one (400)', () => {
    const { api } = load();
    const form = { target: 'person', method: 'cache', roots: [], ckinds: ['common'] };
    assert.deepEqual([...api.pickedRoots(form)], []);
    assert.equal(api.cacheNeed(form), 'roots');
    assert.equal(api.cacheNeed({ ...form, roots: ['latin'], ckinds: [] }), 'kinds');
    assert.equal(api.cacheNeed({ ...form, target: 'place', roots: ['latin'], ckinds: [] }), '', 'places have no kinds of name');
    assert.equal(api.cacheNeed({ ...form, method: 'ai' }), '', 'AI mode is never blocked by Cache chips');
    assert.equal(api.cacheNeed({ ...form, roots: ['latin'] }), '');
    // Settings keep an empty pick (it isn't refilled), and an old save with no list gets the default.
    const { api: a2 } = load({ extensionSettings: { tbd_names: { form: { roots: [], ckinds: [] } } } });
    assert.deepEqual([...a2.settings().form.roots], []);
    const { api: a3 } = load({ extensionSettings: { tbd_names: { form: {} } } });
    assert.deepEqual([...a3.settings().form.roots], ['oldenglish']);
    // Making a name still never breaks: an empty list falls back where names are made.
    assert.equal(api.cacheNames(form, 2, [], seeded(1)).length, 2);
    // The chips show nothing on, with the note.
    const html = api.cacheChipsHtml(form);
    assert.doesNotMatch(html, /data-chip="root"[^>]*aria-pressed="true"/);
    assert.match(html, /id="tbd_root_need"(?! hidden)/);
});
test('family name and "of a place" never reuse a part of the given name', () => {
    const { api } = load();
    assert.equal(api.sharedStems([{ t: 'Ver' }, { t: 'ia' }], [{ t: 'Ver' }, { t: 'ia' }]), true);
    assert.equal(api.sharedStems([{ t: 'Tiho' }, { t: 'mira' }], [{ t: 'Miro' }, { t: 'drag' }, { t: 'ović' }]), true);
    assert.equal(api.sharedStems([{ t: 'Cad' }, { t: 'an' }], [{ t: 'Mac' }, { t: 'Gov' }, { t: 'an' }]), false, 'short endings like -an don\'t count');
    assert.equal(api.sharedStems([{ t: 'Fid' }, { t: 'ia' }], [{ t: 'Ver' }, { t: 'ia' }]), false);
    const rnd = seeded(2030);
    for (const root of api.CACHE_ROOTS) for (const kind of api.CACHE_KINDS) for (const gender of ['masculine', 'feminine']) {
        for (let i = 0; i < 40; i++) {
            const n = api.cacheOne({ target: 'person', parts: ['given', 'middle', 'family'], gender }, root, kind, rnd);
            const names = (n.pieces || []).filter(p => ['given', 'middle'].includes(p.role)).flatMap(p => p.frags || []);
            for (const p of n.pieces || []) {
                if (['family', 'origin'].includes(p.role) && !p.fixed) assert.equal(api.sharedStems(names, p.frags || []), false, n.name);
            }
        }
    }
    // Swapping the family name keeps to the rule too.
    const n = api.cacheOne({ target: 'person', parts: ['given', 'family'], gender: 'feminine' }, 'latin', 'common', seeded(3));
    const k = n.pieces.findIndex(p => p.role === 'family');
    for (let i = 0; i < 20; i++) {
        const f = api.cachePiece(n, k, {}, [], seeded(40 + i));
        assert.equal(api.sharedStems(n.pieces[0].frags, f.frags), false, `${n.pieces[0].text} ${f.text}`);
    }
});

// ---------- v0.2.11 ----------
test('v0.2.11: Greek -os parts count as the same stem (Staninikos Nikodemides)', () => {
    const { api } = load();
    assert.equal(api.sharedStems([{ t: 'Stani' }, { t: 'nikos' }], [{ t: 'Niko' }, { t: 'demos' }, { t: 'ides' }]), true);
    assert.equal(api.sharedStems([{ t: 'Theo' }, { t: 'doros' }], [{ t: 'Philo' }, { t: 'kles' }, { t: 'ides' }]), false);
    assert.equal(api.sharedStems([{ t: 'Cad' }, { t: 'us' }], [{ t: 'Mac' }, { t: 'us' }]), false, 'a bare -us is too short to count');
    const rnd = seeded(77);
    for (let i = 0; i < 400; i++) {
        const n = api.cacheOne({ target: 'person', parts: ['given', 'family'], gender: 'masculine' }, 'greek', 'common', rnd);
        const names = n.pieces.filter(p => p.role === 'given').flatMap(p => p.frags || []);
        const fam = n.pieces.find(p => p.role === 'family');
        assert.equal(api.sharedStems(names, fam.frags || []), false, n.name);
    }
});
test('v0.2.11: a Roman woman\'s looks name is labelled looks, not trade', () => {
    const { api } = load();
    const rnd = seeded(5);
    for (let i = 0; i < 300; i++) {
        const f = api.cacheFamily('latin', 'f', rnd);
        assert.notEqual(f.branch, 'trade', f.text);
    }
});
test('v0.2.11: a nickname is never the name or one of its words', () => {
    const { api } = load();
    assert.deepEqual([...api.cleanNicks(['Pell', 'Pelly', 'acerby'], 'Pell Acerby')], ['Pelly']);
    assert.deepEqual([...api.cleanNicks(['Nuala', 'Nu'], 'Nuala')], ['Nu']);
});
test('v0.2.11: "AI polished" only when the spelling changed', () => {
    const { api } = load();
    const kept = { name: 'Ferrand', cache: true, polished: true, orig: 'Ferrand', read: 'x' };
    const changed = { name: 'Ferand', cache: true, polished: true, orig: 'Ferrand' };
    assert.equal(api.polishChanged(kept), false);
    assert.equal(api.polishChanged(changed), true);
    assert.match(api.tagsHtml(kept), />ARCHIVE</);
    assert.doesNotMatch(api.tagsHtml(kept), /AI polished/);
    assert.match(api.tagsHtml(changed), /AI polished/);
    const form = { target: 'person', method: 'polish', parts: ['given'] };
    assert.match(api.reviewText([{ ...kept, form }]), /ARCHIVE, AI read only/);
    assert.match(api.reviewText([{ ...changed, form }]), /AI polished/);
});
test('v0.2.11: one list never gives the same byname twice, and small ordinals come first', () => {
    const { api } = load();
    for (const root of api.CACHE_ROOTS) for (const kind of ['royal', 'warrior']) for (const gender of ['masculine', 'feminine']) {
        const list = api.cacheNames({ target: 'person', method: 'cache', gender, roots: [root], ckinds: [kind], parts: ['given'] }, 5, [], seeded(9));
        const epi = list.flatMap(n => n.pieces.filter(p => p.role === 'epithet' && !/^[IVX]+$/.test(p.text)).map(p => p.text));
        assert.equal(new Set(epi).size, epi.length, `${root} ${kind} ${gender}: ${epi.join(', ')}`);
    }
    const rnd = seeded(4), count = {};
    for (let i = 0; i < 2000; i++) { const t = api.pickOrdinal(rnd).t; count[t] = (count[t] || 0) + 1; }
    assert.ok(count.II > count.V && count.III > count.VI && count.V > count.IX);
    assert.ok(count.IX < 2000 * 0.05);
});
test('v0.2.11: AI roots drop the inspiration word and ask for new names, not real ones', () => {
    const { api } = load();
    const form = { target: 'person', vibe: 'medieval', parts: ['given', 'family'], extras: [], method: 'ai', aiRoots: ['latin', 'norse'], aiRootMix: 'merge' };
    const seeds = api.rollSeeds(10, form, seeded(3));
    assert.ok(seeds.every(s => !s.spark));
    const text = api.buildMessages(form, seeds)[1].content;
    assert.doesNotMatch(text, /inspiration/i);
    assert.match(text, /not names that already exist\. Any real word in a name comes from those roots' own languages/);
    const split = { ...form, aiRootMix: 'split', aiRoots: ['celtic'] };
    const t2 = api.buildMessages(split, api.rollSeeds(5, split, seeded(3)))[1].content;
    assert.match(t2, /\(word roots and endings\)/);
    assert.doesNotMatch(t2, /naming customs/);
    // Real-name modes keep the customs and don't get the "new names" line.
    const real = { ...split, realNames: 'near' };
    const t3 = api.buildMessages(real, api.rollSeeds(5, real, seeded(3)))[1].content;
    assert.match(t3, /naming customs/);
    assert.doesNotMatch(t3, /not names that already exist/);
    // No roots: the inspiration word is still there.
    const plain = { ...form, aiRoots: [] };
    assert.ok(api.rollSeeds(10, plain, seeded(3)).some(s => s.spark));
});

// ---------- v0.2.12 ----------
test('v0.2.12: nicknames of a full name (sent as parts) never repeat a part', () => {
    const { api } = load();
    const out = api.parseNames('[{"parts":{"given":"Orv","family":"Brandhov"},"note":"x","nicks":["Orv","Orvy","Brandhov"]}]');
    assert.deepEqual([...out[0].nicks], ['Orvy']);
});
test('v0.2.12: Latin AI roots ask for classical Latin forms', () => {
    const { api } = load();
    const form = { target: 'person', vibe: 'medieval', parts: ['given', 'family'], extras: [], method: 'ai', aiRoots: ['latin', 'norse'], aiRootMix: 'merge' };
    assert.match(api.buildMessages(form, api.rollSeeds(4, form, seeded(3)))[1].content, /classical Latin forms .*not Italian or French/);
    const split = { ...form, aiRoots: ['latin'], aiRootMix: 'split', realNames: 'near' };
    assert.match(api.buildMessages(split, api.rollSeeds(4, split, seeded(3)))[1].content, /classical Latin forms/);
    const norse = { ...form, aiRoots: ['norse'] };
    assert.doesNotMatch(api.buildMessages(norse, api.rollSeeds(4, norse, seeded(3)))[1].content, /classical Latin/);
});

test('v0.2.13: AI roots with any length give no one-syllable person names', () => {
    const { api } = load();
    const form = { target: 'person', vibe: 'medieval', parts: ['given', 'family'], extras: [], method: 'ai', aiRoots: ['latin', 'norse'], aiRootMix: 'merge' };
    const syl = f => [...api.rollSeeds(200, f, seeded(6))].map(s => s.syllables);
    assert.ok(syl(form).every(n => n >= 2 && n <= 4));
    assert.ok(syl({ ...form, length: 'any' }).every(n => n >= 2));
    // "Short" still allows one syllable, and so do names with no roots.
    assert.ok(syl({ ...form, length: 'short' }).includes(1));
    assert.ok(syl({ ...form, aiRoots: [] }).includes(1));
    // Places keep the old range.
    assert.ok(syl({ target: 'place', vibe: 'medieval', method: 'ai', aiRoots: ['latin'] }).includes(1));
});

test('v0.2.15: AI roots with a family name give each name its own kind of family name', () => {
    const { api } = load();
    const form = { target: 'person', vibe: 'medieval', parts: ['given', 'family'], extras: [], method: 'ai', aiRoots: ['latin', 'norse'], aiRootMix: 'merge' };
    const seeds = [...api.rollSeeds(4, form, seeded(3))];
    assert.deepEqual([...new Set(seeds.map(s => s.family))].sort(), ["from a father's name", 'from a place', 'from a trade', 'from looks or a nickname']);
    const text = api.buildMessages(form, seeds)[1].content;
    assert.match(text, /; family name: (Latin|Norse) words, from (a place|a trade|a father's name|looks or a nickname)/);
    // The old batch-wide line is gone.
    assert.doesNotMatch(text, /mix kinds of family names/);
    // No family name or a fixed one: no kind seed. No roots: the vibe's own family styles as before.
    assert.ok([...api.rollSeeds(4, { ...form, parts: ['given'] }, seeded(3))].every(s => !s.family));
    assert.ok([...api.rollSeeds(4, { ...form, fixedFamily: 'Pell' }, seeded(3))].every(s => !s.family));
    const plain = [...api.rollSeeds(4, { ...form, aiRoots: [] }, seeded(3))];
    assert.ok(plain.every(s => s.family));
    assert.ok([...api.rollSeeds(12, { ...form, aiRoots: [] }, seeded(5))].some(s => /-ford|landscape|Fitz/.test(s.family)), 'vibe styles without roots');
});

test('v0.2.14: the batch is asked to vary sounds, except in sound-alike mode', () => {
    const { api } = load();
    const form = { target: 'person', vibe: 'medieval', parts: ['given', 'family'], extras: [], method: 'ai', aiRoots: ['latin', 'norse'], aiRootMix: 'merge' };
    const text = f => api.buildMessages(f, api.rollSeeds(4, f, seeded(3)))[1].content;
    assert.match(text(form), /vary the sounds too: don't let one sound or word part run through most of the names/);
    assert.match(text({ target: 'place', vibe: 'fantasy', method: 'ai' }), /vary the sounds too/);
    assert.doesNotMatch(text({ ...form, aiRoots: [], likeText: 'Elric', likeMode: 'sound' }), /vary the sounds too/);
    assert.doesNotMatch(api.buildMessages(form, api.rollSeeds(1, form, seeded(3)))[1].content, /vary the sounds too/);
});

test('v0.2.14: Korean notes ask for Hangul only, English notes stay plain', () => {
    const ko = load({ lang: 'ko' }).api;
    const en = load().api;
    const form = { target: 'person', vibe: 'medieval', parts: ['given'], extras: [], method: 'ai' };
    const k = ko.buildMessages(form, ko.rollSeeds(3, form, seeded(3)), { lang: 'ko' })[1].content;
    assert.match(k, /in Korean \(Korean words written in Hangul only, no Chinese characters or Chinese words\)/);
    const e = en.buildMessages(form, en.rollSeeds(3, form, seeded(3)))[1].content;
    assert.match(e, /note \(under 12 words\) in English about/);
    assert.doesNotMatch(e, /Hangul only/);
    assert.match(ko.buildCheckMessages('Pell', 'ko')[1].content, /Hangul only/);
});

test('v0.2.16: the family-name seed says which root its words come from', () => {
    const { api } = load();
    const form = { target: 'person', vibe: 'medieval', parts: ['given', 'family'], extras: [], method: 'ai', aiRoots: ['latin', 'norse'], aiRootMix: 'merge' };
    const seeds = [...api.rollSeeds(20, form, seeded(3))];
    // Merge: one of the name's two roots, and both roots show up for every kind of family name.
    assert.ok(seeds.every(s => [s.root, s.root2].includes(s.familyRoot)));
    for (const kind of new Set(seeds.map(s => s.family))) {
        assert.deepEqual([...new Set(seeds.filter(s => s.family === kind).map(s => s.familyRoot))].sort(), ['latin', 'norse'], kind);
    }
    const text = api.buildMessages(form, seeds.slice(0, 4))[1].content;
    assert.match(text, /; family name: (Latin|Norse) words, from /);
    // Split: the name's own root.
    const split = { ...form, aiRootMix: 'split' };
    assert.ok([...api.rollSeeds(8, split, seeded(3))].every(s => s.familyRoot === s.root));
    // No roots: no root in the family seed.
    assert.ok([...api.rollSeeds(4, { ...form, aiRoots: [] }, seeded(3))].every(s => !s.familyRoot));
});

test('v0.2.17: "Copy for review" shows each name\'s seed, the same line the AI saw', () => {
    const { api } = load();
    const form = { target: 'person', vibe: 'medieval', parts: ['given', 'family'], extras: [], method: 'ai', aiRoots: ['latin', 'norse'], aiRootMix: 'merge' };
    const seeds = [...api.rollSeeds(3, form, seeded(5))];
    const prompt = api.buildMessages(form, seeds)[1].content;
    // The prompt still has one numbered line per seed, built by the same helper.
    seeds.forEach((s, i) => assert.ok(prompt.includes(`${i + 1}. ${api.seedLine(form, s)}`), `seed ${i + 1}`));
    // Answers in parts get their seed by order, and it survives applyShape.
    const raw = JSON.stringify([
        { parts: { given: 'Pellam', family: 'Ostrand' }, note: 'a' },
        { parts: { given: 'Corvan', family: 'Mirelund' }, note: 'b' },
    ]);
    const shaped = api.applyShape(api.withSeeds(api.parseNames(raw), form, seeds), form);
    assert.equal(shaped.length, 2);
    assert.equal(shaped[0].seed, api.seedLine(form, seeds[0]));
    assert.equal(shaped[1].seed, api.seedLine(form, seeds[1]));
    assert.match(shaped[0].seed, /; family name: (Latin|Norse) words, from /);
    const text = api.reviewText(shaped.map(r => ({ ...r, form })));
    assert.match(text, /\n   seed: given name: (Latin start \+ Norse ending|Norse start \+ Latin ending), /);
    // Old results with no seed print no seed line.
    assert.doesNotMatch(api.reviewText([{ name: 'Pellam', form }]), /seed:/);
});

test('v0.2.18: with roots on, about half the names get a "no v" seed, spread over both Merge orders', () => {
    const { api } = load();
    const form = { target: 'person', vibe: 'medieval', parts: ['given', 'family'], extras: [], method: 'ai', aiRoots: ['latin', 'norse'], aiRootMix: 'merge' };
    for (const n of [3, 5, 11]) {
        const seeds = [...api.rollSeeds(20, form, seeded(n))];
        const noV = seeds.filter(s => s.noV);
        assert.ok(noV.length >= 7 && noV.length <= 10, `seed ${n}: ${noV.length}`);
        // Not all on one pair order.
        assert.ok(noV.some(s => s.root === 'latin') && noV.some(s => s.root === 'norse'), `seed ${n}`);
        // Never on a name told to start with V or W.
        assert.ok(noV.every(s => !'VW'.includes(s.start)));
        assert.match(api.seedLine(form, noV[0]), /no "v" or "w" sound/);
    }
    // No roots: no "no v" seed, and the prompt is as before.
    assert.ok([...api.rollSeeds(20, { ...form, aiRoots: [] }, seeded(3))].every(s => !s.noV));
    // "Like this" turns roots off, so no "no v" seed either.
    assert.ok([...api.rollSeeds(10, { ...form, likeText: 'Pellam' }, seeded(3))].every(s => !s.noV));
});

test('v0.2.18: Latin trade and looks family names keep -us / -ius / -arius, not -a', () => {
    const { api } = load();
    const form = { target: 'person', vibe: 'medieval', parts: ['given', 'family'], extras: [], method: 'ai', aiRoots: ['latin', 'norse'], aiRootMix: 'merge' };
    assert.match(api.rootRule(form, ['latin', 'norse']), /trade or from looks keeps its -us, -ius or -arius form \(not -a\), unless it belongs to a woman/);
    // Only with a family name, and only with Latin.
    assert.doesNotMatch(api.rootRule({ ...form, parts: ['given'] }, ['latin', 'norse']), /-arius/);
    assert.doesNotMatch(api.rootRule(form, ['norse', 'celtic']), /-arius/);
    assert.doesNotMatch(api.rootRule({ ...form, fixedFamily: 'Ostrand' }, ['latin']), /-arius/);
});

test('v0.2.19: word names mode — who it is for and what wins over it', () => {
    const { api } = load();
    const p = { target: 'person', method: 'ai', wordMode: 'mix' };
    assert.equal(api.wordMode(p), 'mix');
    assert.equal(api.wordMode({ ...p, wordMode: 'nonsense' }), 'avoid');
    assert.equal(api.wordMode({ target: 'person' }), 'avoid', 'off by default');
    assert.equal(api.wordMode({ ...p, target: 'place' }), 'avoid', 'people only');
    assert.equal(api.wordMode({ ...p, method: 'cache' }), 'avoid', 'AI only');
    assert.equal(api.wordMode({ ...p, method: 'polish' }), 'avoid', 'not Cache + AI either');
    assert.equal(api.wordOff({ ...p, likeText: 'Pellam' }), 'like');
    assert.equal(api.wordOff({ ...p, realNames: 'only' }), 'real');
    assert.equal(api.wordOff({ ...p, realNames: 'mix' }), '', 'mixing real names is fine');
    assert.equal(api.wordUsed({ ...p, realNames: 'only' }), 'avoid');
    // The Cache ✨ path builds its own AI form: no word names there.
    assert.equal(api.aiForm({ ...p, method: 'cache', roots: ['latin'] }, { name: 'Pellam' }).wordMode, 'avoid');
    // The chips, with the "not used now" note only when another choice wins.
    assert.match(api.wordModeHtml(p), /data-chip="wordmode" data-v="mix" aria-pressed="true"/);
    assert.match(api.wordModeHtml(p), /id="tbd_word_note" hidden/);
    assert.doesNotMatch(api.wordModeHtml({ ...p, likeText: 'Pellam' }), /id="tbd_word_note" hidden/);
});

test('v0.2.19: word name seeds — off changes nothing, mix is about 1 in 3, main is all', () => {
    const { api } = load();
    const base = { target: 'person', vibe: 'fantasy', parts: ['given'], extras: [], method: 'ai' };
    // Off: exactly the same seeds as before (no extra random draws).
    assert.deepEqual(JSON.parse(JSON.stringify(api.rollSeeds(12, { ...base, wordMode: 'avoid' }, seeded(4)))),
        JSON.parse(JSON.stringify(api.rollSeeds(12, base, seeded(4)))));
    const mix = [...api.rollSeeds(21, { ...base, wordMode: 'mix' }, seeded(4))];
    assert.equal(mix.filter(s => s.word).length, 7);
    const main = [...api.rollSeeds(10, { ...base, wordMode: 'main' }, seeded(4))];
    assert.ok(main.every(s => s.word && !s.syllables && !s.ending && !s.spark && !s.start));
    // No roots: any language, English too.
    assert.match(api.seedLine(base, main[0]), /^real word: a pretty word from any language that fits the setting \(English is fine\)/);
    // Roots on: the word comes from those roots' languages, and "no v" is never added to a word.
    const roots = { ...base, parts: ['given', 'family'], aiRoots: ['latin', 'norse'], aiRootMix: 'merge', wordMode: 'main' };
    const rs = [...api.rollSeeds(8, roots, seeded(4))];
    assert.ok(rs.every(s => s.word && !s.noV && s.family));
    assert.match(api.seedLine(roots, rs[0]), /^given name: real word: a pretty (Latin or Norse|Norse or Latin) word, as it is or lightly changed/);
    assert.match(api.seedLine(roots, rs[0]), /; family name: (Latin|Norse) words, from /);
    // "Real names only" wins: no word seeds.
    assert.ok([...api.rollSeeds(6, { ...base, wordMode: 'main', realNames: 'only' }, seeded(4))].every(s => !s.word));
});

test('v0.2.19: word name prompt lines — exceptions instead of two rules that fight', () => {
    const { api } = load();
    const base = { target: 'person', vibe: 'fantasy', parts: ['given'], extras: [], method: 'ai' };
    const text = (form, n = 6) => api.buildMessages(form, api.rollSeeds(n, form, seeded(2)), { lang: 'ko' })[1].content;
    const off = text(base);
    assert.doesNotMatch(off, /real word|"word"/);
    assert.match(off, /Never use a plain existing English word on its own as the name \(like "Mold" or "Salt"\)\.\n/);
    const mix = text({ ...base, wordMode: 'mix' });
    assert.match(mix, /plain existing English word.*\(Names whose seed says "real word" are the exception\.\)/);
    assert.match(mix, /Invent the given names.*\(Names whose seed says "real word" are the exception\.\)/);
    assert.match(mix, /add "word": \{"meaning": "...", "lang": "..."\}.*both in Korean/);
    assert.match(mix, /"word": \{"meaning": "...", "lang": "..."\}\}\]/);
    // "Mostly" with a given name only: the plain-word rule goes away entirely.
    assert.doesNotMatch(text({ ...base, wordMode: 'main' }), /plain existing English word/);
    // Full name: the exception is for the given name only.
    const full = text({ ...base, parts: ['given', 'family'], aiRoots: ['latin', 'norse'], aiRootMix: 'merge', wordMode: 'main' });
    // v0.2.21: with roots on, the roots line covers English words, so the plain-word line stays home.
    assert.doesNotMatch(full, /must not be plain existing English words/);
    assert.match(full, /Put new names together from those parts, not names that already exist\. \(A given name whose seed says "real word" is the exception\.\)/);
    // A batch with no word seed (mix can roll none for one name) sends no word lines.
    const one = { ...base, wordMode: 'mix' };
    const plain = api.buildMessages(one, [{ start: 'D', syllables: 2 }], { lang: 'en' })[1].content;
    assert.doesNotMatch(plain, /add "word"/);
});

test('v0.2.19: the word comes back, shows as a mark, and is kept', () => {
    const { api } = load();
    const raw = JSON.stringify([
        { name: 'Stellan', note: 'a', word: { meaning: '별', lang: '라틴어' } },
        { name: 'Voreth', note: 'b' },
        { name: 'Wren', note: 'c', word: '굴뚝새' },
        { name: 'Pell', note: 'd', word: { meaning: '{"x": 1}', lang: '' } },
    ]);
    const list = api.parseNames(raw);
    assert.deepEqual({ ...list[0].word }, { meaning: '별', lang: '라틴어' });
    assert.equal(list[1].word, undefined);
    assert.deepEqual({ ...list[2].word }, { meaning: '굴뚝새' });
    assert.equal(list[3].word, undefined, 'JSON bits are not a meaning');
    // Full names in parts keep the word too.
    const form = { target: 'person', parts: ['given', 'family'], extras: [], method: 'ai', wordMode: 'main' };
    const shaped = api.applyShape(api.parseNames(JSON.stringify([{ parts: { given: 'Aster', family: 'Holm' }, note: 'n', word: { meaning: '별', lang: '그리스어' } }])), form);
    assert.equal(shaped[0].word.lang, '그리스어');
    // The mark: our own word tag, not the plain English word tag as well.
    const wren = { ...list[2], form: { target: 'person' } };
    const tags = api.tagsHtml(wren, api.STRINGS.ko);
    assert.match(tags, /낱말: 굴뚝새/);
    assert.equal((tags.match(/tbd-word-tag/g) || []).length, 1);
    assert.match(api.tagsHtml({ ...list[0], form: {} }, api.STRINGS.en), /word: 별 · 라틴어/);
    // Copy for review and Found.
    const review = api.reviewText([{ ...list[0], form: { ...form, parts: ['given'] } }]);
    assert.match(review, /Stellan  \{word: 별, 라틴어\}/);
    assert.match(review, /Word names: main/);
    assert.deepEqual({ ...api.foundEntry({ ...list[0], form }).word }, { meaning: '별', lang: '라틴어' });
});

test('v0.2.19: word names are never filtered as plain words, and "mostly" only marks AI favorites', () => {
    const { api } = load();
    const st = { wordNames: 'filter', banList: '', rememberHistory: false, history: [], found: [] };
    const list = [{ name: 'Wren', note: '' }, { name: 'Voreth', note: '' }];
    assert.deepEqual([...api.keepNames(list, [], { target: 'person' }, st).map(n => n.name)], ['Voreth'], 'as before when off');
    assert.equal(api.keepNames(list, [], { target: 'person', wordMode: 'mix' }, st).length, 2);
    const fav = api.CLICHES[0];
    assert.ok(api.avoidList(st, { target: 'person', wordMode: 'mix' }).includes(fav), 'mix still avoids them');
    assert.ok(!api.avoidList(st, { target: 'person', wordMode: 'main' }).includes(fav), 'mostly: marked only');
});

test('v0.2.20: word names spread over three Split roots and both Merge orders', () => {
    const { api } = load();
    for (const n of [1, 2, 3, 4, 5]) {
        const split = { target: 'person', vibe: 'medieval', parts: ['given', 'family'], extras: [], method: 'ai', wordMode: 'mix', aiRoots: ['oldenglish', 'norman', 'germanic'] };
        const seeds = api.rollSeeds(20, split, seeded(n));
        const words = seeds.filter(s => s.word);
        assert.ok(words.length >= 6 && words.length <= 7, `about one in three (${words.length})`);
        assert.ok(new Set(words.map(s => s.root)).size === 3, 'word names land on every root');
        const merge = { ...split, aiRoots: ['greek', 'slavic'], aiRootMix: 'merge' };
        const ms = api.rollSeeds(20, merge, seeded(n)).filter(s => s.word);
        assert.ok(new Set(ms.map(s => s.root)).size === 2, 'word names land on both Merge orders');
    }
});

test('v0.2.20: Slavic names get no "no v" seed; others still do', () => {
    const { api } = load();
    const base = { target: 'person', vibe: 'medieval', parts: ['given', 'family'], extras: [], method: 'ai' };
    const sl = api.rollSeeds(20, { ...base, aiRoots: ['greek', 'slavic'], aiRootMix: 'merge' }, seeded(2));
    assert.ok(sl.every(s => !s.noV));
    const split = api.rollSeeds(20, { ...base, aiRoots: ['latin', 'slavic'] }, seeded(2));
    assert.ok(split.filter(s => s.root === 'slavic').every(s => !s.noV));
    assert.ok(split.some(s => s.root === 'latin' && s.noV));
});

test('v0.2.20: each Celtic name gets one language, and a Germanic word says German', () => {
    const { api } = load();
    const form = { target: 'person', vibe: 'medieval', parts: ['given', 'family'], extras: [], method: 'ai', aiRoots: ['celtic'] };
    const seeds = api.rollSeeds(9, form, seeded(4));
    assert.deepEqual([...new Set(seeds.map(s => s.celtic))].sort(), ['Irish', 'Scottish Gaelic', 'Welsh']);
    for (const s of seeds) {
        const line = api.seedLine(form, s);
        assert.ok(line.startsWith(`given name: ${s.celtic} roots`), line);
        assert.ok(line.includes(`family name: ${s.celtic} words, `), line);
        assert.ok(!/Celtic/.test(line));
    }
    const text = api.buildMessages(form, seeds)[1].content;
    assert.match(text, /Celtic means Welsh, Irish or Scottish Gaelic .*keep the whole name, family name too, in that one language, with no English or Scots words\./);
    const merge = { ...form, aiRoots: ['celtic', 'norse'], aiRootMix: 'merge' };
    assert.match(api.rootRule(merge, ['celtic', 'norse']), /its Celtic parts stay in that one language/);
    assert.ok(!/Celtic means/.test(api.rootRule({ ...form, aiRoots: ['latin'] }, ['latin'])));
    // Germanic: plain roots stay "Germanic", a word name asks for a German word.
    assert.match(api.seedLine(form, { root: 'germanic', start: 'A' }), /^given name: Germanic roots/);
    assert.match(api.seedLine(form, { root: 'germanic', word: true }), /a pretty German word/);
    assert.match(api.seedLine(form, { root: 'germanic', root2: 'norman', word: true }), /a pretty German or Norman \/ French word/);
});

test('v0.2.20: Slavic family names take the feminine form for women', () => {
    const { api } = load();
    const base = { target: 'person', vibe: 'medieval', parts: ['given', 'family'], extras: [], method: 'ai' };
    assert.match(api.rootRule({ ...base, aiRoots: ['slavic'] }, ['slavic']), /Slavic family name takes its feminine form \(-ova, -eva, -ina, -ska\)/);
    assert.ok(!/feminine form/.test(api.rootRule({ ...base, parts: ['given'], aiRoots: ['slavic'] }, ['slavic'])), 'no family name, no line');
    assert.ok(!/feminine form/.test(api.rootRule({ ...base, aiRoots: ['greek'] }, ['greek'])));
});

test('v0.2.20: one batch never repeats a start letter until the letters run out', () => {
    const { api } = load();
    const base = { target: 'person', vibe: 'medieval', parts: ['given', 'family'], extras: [], method: 'ai' };
    for (const n of [1, 2, 3]) {
        const starts = api.rollSeeds(20, base, seeded(n)).map(s => s.start);
        assert.equal(new Set(starts).size, 20);
        // Greek leaves out six letters, so 16 come first, then repeats.
        const gr = api.rollSeeds(20, { ...base, aiRoots: ['greek'] }, seeded(n)).map(s => s.start);
        assert.equal(new Set(gr.slice(0, 16)).size, 16);
    }
});

test('v0.2.20: the batch "v" example stays out when Slavic is a root', () => {
    const { api } = load();
    const base = { target: 'person', vibe: 'medieval', parts: ['given', 'family'], extras: [], method: 'ai' };
    const sl = { ...base, aiRoots: ['slavic'] };
    const t = api.buildMessages(sl, api.rollSeeds(5, sl, seeded(1)))[1].content;
    assert.match(t, /vary the sounds too: don't let one sound or word part run through most of the names\.\n/);
    const la = { ...base, aiRoots: ['latin'] };
    assert.match(api.buildMessages(la, api.rollSeeds(5, la, seeded(1)))[1].content, /\(not a "v" in nearly every name\)/);
});

test('v0.2.21: roots never hand out start letters their own words lack; Merge skips both roots\' letters', () => {
    const { api } = load();
    const base = { target: 'person', vibe: 'medieval', parts: ['given', 'family'], extras: [], method: 'ai' };
    const slav = [...api.rollSeeds(60, { ...base, aiRoots: ['slavic'] }, seeded(5))];
    assert.ok(slav.every(s => !'EFQX'.includes(s.start)));
    const celt = [...api.rollSeeds(60, { ...base, aiRoots: ['celtic'] }, seeded(5))];
    assert.ok(celt.every(s => !'KVWJ'.includes(s.start)));
    const merge = [...api.rollSeeds(60, { ...base, aiRoots: ['greek', 'slavic'], aiRootMix: 'merge' }, seeded(5))];
    assert.ok(merge.every(s => !'WJQFVYUEX'.includes(s.start)));
});

test('v0.2.21: word seeds carry no start letter, and the other names still do not repeat one', () => {
    const { api } = load();
    const form = { target: 'person', vibe: 'medieval', parts: ['given', 'family'], extras: [], method: 'ai', aiRoots: ['greek', 'slavic'], aiRootMix: 'merge', wordMode: 'mix' };
    const seeds = [...api.rollSeeds(20, form, seeded(9))];
    assert.ok(seeds.some(s => s.word));
    assert.ok(seeds.filter(s => s.word).every(s => !s.start && !/starts with/.test(api.seedLine(form, s))));
    const starts = seeds.filter(s => !s.word).map(s => s.start);
    assert.equal(new Set(starts).size, starts.length);
    assert.ok(seeds.every(s => !('newStart' in s)));
    // No roots: word names alone get no start-letter line either.
    const noRoots = { ...form, aiRoots: [] };
    assert.doesNotMatch(api.buildMessages(noRoots, api.rollSeeds(6, noRoots, seeded(2)), {})[1].content, /nearby letter/);
});

test('v0.2.21: with roots on, the prompt drops rules the roots already cover and gives a way out', () => {
    const { api } = load();
    const base = { target: 'person', vibe: 'medieval', parts: ['given', 'family'], extras: [], method: 'ai', length: 'any' };
    const text = form => api.buildMessages(form, api.rollSeeds(6, form, seeded(2)), { lang: 'en', avoid: ['Elara'] })[1].content;
    const roots = text({ ...base, aiRoots: ['greek', 'slavic'], aiRootMix: 'merge' });
    assert.doesNotMatch(roots, /plain existing English words/);
    assert.match(roots, /Invent the given and family names/);
    assert.doesNotMatch(roots, /same idea or image/);
    assert.match(roots, /not names that already exist/);
    assert.match(roots, /If a start letter doesn't suit the name's roots, a nearby letter is fine\./);
    assert.doesNotMatch(roots, /move on|search long/);
    assert.match(roots, /Do NOT use these names: Elara\./);
    const plain = text(base);
    assert.match(plain, /plain existing English words/);
    assert.match(plain, /Invent the given and family names/);
    assert.match(plain, /same idea or image/);
    assert.doesNotMatch(plain, /nearby letter/);
});

test('v0.2.21: the prompt avoid list is AI favorites and the user\'s own list; past and kept names are only filtered', () => {
    const { api } = load();
    const st = { banList: 'Mira, Tobin', history: ['Pastname'], rememberHistory: true, found: [{ target: 'person', name: 'Keptname' }] };
    const ask = [...api.promptAvoid(st, { target: 'person' })];
    assert.ok(ask.includes('Mira') && ask.includes('Tobin') && ask.includes(api.CLICHES[0]));
    assert.ok(!ask.includes('Pastname') && !ask.includes('Keptname'));
    const all = [...api.avoidList(st, { target: 'person' })];
    assert.ok(all.includes('Pastname') && all.includes('Keptname'));
    assert.ok([...api.promptAvoid(st, { target: 'person' }, ['Onscreen'])].includes('Onscreen'));
});

// ---------- v0.2.24 ----------
test('v0.2.24: Merge seeds say which root gives the start and which the ending, both ways round', () => {
    const { api } = load();
    for (const roots of [['latin', 'norse'], ['greek', 'slavic', 'norman']]) {
        const form = { target: 'person', method: 'ai', vibe: 'medieval', aiRoots: roots, aiRootMix: 'merge', parts: ['given', 'family'] };
        const seeds = api.rollSeeds(20, form, seeded(7)).filter(s => !s.word);
        const lines = seeds.map(s => api.seedLine(form, s));
        for (const l of lines) assert.match(l, /^given name: [A-Za-z /]+ start \+ [A-Za-z /]+ ending/);
        // Every root shows up both as a start and as an ending.
        for (const r of roots) {
            assert.ok(seeds.some(s => s.root === r), `${r} as a start`);
            assert.ok(seeds.some(s => s.root2 === r), `${r} as an ending`);
        }
    }
    // Split and no roots: unchanged wording.
    const split = { target: 'person', method: 'ai', vibe: 'medieval', aiRoots: ['latin', 'norse'], aiRootMix: 'split', parts: ['given'] };
    assert.match(api.seedLine(split, { root: 'latin', start: 'A' }), /^Latin roots/);
});
test('v0.2.24: a family name seen before keeps the name; the given name and the own list still filter', () => {
    const { api } = load();
    const mk = (given, family) => ({ name: `${given} ${family}`, pieces: [{ role: 'given', text: given }, { role: 'family', text: family }] });
    const list = [mk('Corvan', 'Lignarius'), mk('Ostric', 'Faber'), mk('Pellam', 'Holm'), mk('Ulric', 'Ostrand')];
    const avoid = ['Lignarius', 'Ostric', 'Holm', 'Ulric Ostrand'];
    const out = api.filterNames(list, avoid, ['Holm']).map(n => n.name);
    assert.deepEqual([...out], ['Corvan Lignarius']);
    // Without a family list (old callers), family parts still filter as before.
    assert.deepEqual([...api.filterNames(list, avoid).map(n => n.name)], []);
    // keepNames uses the own avoid list for family names.
    const { api: a2 } = load({ extensionSettings: { tbd_names: { banList: 'Faber' } } });
    const kept = a2.keepNames([mk('Corvan', 'Lignarius'), mk('Brannoc', 'Faber')], ['Lignarius', 'Faber'], { target: 'person', method: 'ai' });
    assert.deepEqual([...kept.map(n => n.name)], ['Corvan Lignarius']);
});

test('v0.2.25: Archive joins — small rules, one by one', () => {
    const { api } = load();
    // same sound at the join
    assert.ok(api.sameSound('Gor', 'gorod') && api.sameSound('Stell', 'ella') && api.sameSound('Gwyn', 'wyn') && api.sameSound('Rich', 'rik'));
    assert.ok(!api.sameSound('Wulf', 'frith') && !api.sameSound('Ed', 'mund'));
    // same or close meaning
    assert.ok(api.meaningClash({ en: 'fort' }, { en: 'fort, hill' }) && api.meaningClash({ en: 'stream' }, { en: 'pond' }) && api.meaningClash({ en: 'by the forest' }, { en: 'wood' }));
    assert.ok(!api.meaningClash({ en: 'oak' }, { en: 'hill' }) && !api.meaningClash({ en: 'land of' }, { en: 'place of' }));
    // two describing words, but Slavic -ica / -ets are fine
    assert.ok(api.twoAdjectives({ t: 'Shan', en: 'old' }, { t: 'boy', en: 'yellow' }));
    assert.ok(!api.twoAdjectives({ t: 'Bel', en: 'white' }, { t: 'ica', en: 'little' }));
    assert.ok(!api.twoAdjectives({ t: 'Shan', en: 'old' }, { t: 'derry', en: 'oak wood' }));
    // Slavic adjectives agree
    assert.equal(api.slavicAgree('Veliki', 'Slavoreka'), 'Velika');
    assert.equal(api.slavicAgree('Gornji', 'Tikhoselo'), 'Gornje');
    assert.equal(api.slavicAgree('Stari', 'Lipovo'), 'Staro');
    assert.equal(api.slavicAgree('Mali', 'Novgrad'), 'Mali');
    // Latin scholars
    assert.equal(api.latinGiven({ text: 'Clairienne', frags: [] }, 'f').text, 'Clairiana');
    assert.equal(api.latinGiven({ text: 'Guéric', frags: [] }, 'm').text, 'Guericus');
    assert.equal(api.noAccents('Guévalensis'), 'Guevalensis');
    assert.equal(api.noAccents('Großius'), 'Grossius');
});

test('v0.2.25: sweep — Archive places and people keep the join rules', () => {
    const { api } = load();
    const rnd = seeded(2030);
    const extraWords = api.CACHE_ROOTS.flatMap(k => [...(api.CACHE[k].placePre || []), ...(api.CACHE[k].placePost || [])]).map(f => f.t)
        .concat(['Stara', 'Staro', 'Velika', 'Veliko', 'Mala', 'Malo', 'Gornja', 'Gornje', 'Donja', 'Donje']);
    const core = r => (r.frags || []).filter(f => !extraWords.includes(f.t) && !/^(Saint|Sainte|St\.|Sveti|Sveta|Kil)$/.test(f.t));
    const KIND_CATS = { mountain: ['hill'], water: ['water'], forest: ['forest'], sea: ['coast', 'water'], fort: ['fort', 'hill'] };
    for (const root of api.CACHE_ROOTS) for (const kind of ['', 'mountain', 'water', 'forest', 'sea', 'fort', 'town']) {
        for (const r of api.cacheNames({ target: 'place', method: 'cache', roots: [root], kind }, 40, [], rnd)) {
            const [h, t] = core(r);
            // Saint places are a person's name (Kilgwenwyn, Saint-Roric): the place rules don't apply.
            if (r.saint || ['saint', 'church of'].includes(r.frags[0].en) || !h || !t) continue;
            assert.ok(!api.sameSound(h.t, t.t), `same sound: ${r.name}`);
            assert.ok(!api.meaningClash(h, t), `same meaning: ${r.name}`);
            assert.ok(!api.twoAdjectives(h, t), `two describing words: ${r.name}`);
            assert.ok(!/ror/i.test(r.name), `r-o-r: ${r.name}`);
            assert.ok(!/^(Stari|Veliki|Mali|Gornji|Donji) \S*[aoe]$/.test(r.name), `Slavic agreement: ${r.name}`);
            const extra = (r.frags || []).find(f => extraWords.includes(f.t));
            if (extra) assert.ok(![h, t].some(f => api.meaningClash(extra, f)), `extra word says it twice: ${r.name}`);
            if (KIND_CATS[kind]) assert.ok([h, t].some(f => f.cats && f.cats.some(c => KIND_CATS[kind].includes(c))), `${kind}: ${r.name}`);
        }
    }
    // Old English head + short Latin ending stays out of Merge places
    for (const r of api.cacheNames({ target: 'place', method: 'cache', roots: ['latin', 'oldenglish'], rootMix: 'merge' }, 120, [], rnd)) {
        const [h, t] = core(r);
        if (h && t && h.r === 'oldenglish' && t.r === 'latin') assert.ok(t.t.length > 4, `short Latin ending: ${r.name}`);
    }
    // people: given names don't echo, Slavic father's names stay short, scholars write plain Latin
    for (const root of api.CACHE_ROOTS) for (const ckind of ['common', 'scholar']) for (const gender of ['masculine', 'feminine']) {
        for (const r of api.cacheNames({ target: 'person', method: 'cache', roots: [root], ckinds: [ckind], gender, parts: ['given', 'family'] }, 30, [], rnd)) {
            const given = r.pieces.find(p => p.role === 'given');
            if (given.frags.length >= 2) assert.ok(!api.sameSound(given.frags[0].t, given.frags[1].t), `same sound: ${r.name}`);
            const fam = r.pieces.find(p => p.role === 'family');
            if (root === 'slavic' && fam && fam.branch === 'patron') assert.ok(fam.text.length <= 12, `long: ${r.name}`);
            if (ckind === 'scholar') {
                assert.ok(!/[\u00c0-\u00e5\u00e7-\u0152\u0154-\u017f]/.test(r.name), `accent: ${r.name}`); // æ and œ are Latin letters
                assert.ok(!/ienna\b/.test(r.name), `-ienna: ${r.name}`);
            }
        }
    }
});

test('v0.2.26: Archive — -recki, no swallowed endings or doubled vowels, short Greek father names, no great + little', () => {
    const { api } = load();
    assert.equal(api.slavicSki('Poloreka'), 'Polorecki');
    assert.equal(api.slavicSki('Polovka'), 'Polovski');
    assert.equal(api.slavicSki('Lipets'), 'Lipecki');
    assert.ok(api.twoAdjectives({ t: 'Megalo', en: 'great' }, { t: 'ets', en: 'little' }));
    assert.ok(!api.twoAdjectives({ t: 'Bel', en: 'white' }, { t: 'ets', en: 'little' }));
    assert.ok(api.newDoubleVowel('Neevo', 'Nea', 'evo') && !api.newDoubleVowel('Leukozero', 'Leuko', 'ozero'));
    const rnd = seeded(2030);
    const R = api.CACHE_ROOTS;
    for (let i = 0; i < R.length; i++) for (let j = i; j < R.length; j++) {
        const roots = i === j ? [R[i]] : [R[i], R[j]];
        for (const r of api.cacheNames({ target: 'person', method: 'cache', roots, rootMix: 'merge', ckinds: ['common'], parts: ['given', 'family'] }, 20, [], rnd)) {
            const g = r.pieces.find(p => p.role === 'given');
            assert.notEqual(g.text.toLowerCase(), g.frags[0].t.toLowerCase(), `swallowed ending: ${r.name}`);
            assert.ok(!api.newDoubleVowel(g.text, g.frags[0].t, g.frags[1].t), `doubled vowel: ${r.name}`);
            const f = r.pieces.find(p => p.role === 'family');
            if (f && /ides$/.test(f.text)) assert.ok(f.text.length <= 12, `long: ${r.name}`);
        }
        for (const r of api.cacheNames({ target: 'place', method: 'cache', roots, rootMix: 'merge' }, 20, [], rnd)) {
            if (r.frags.length === 2) assert.ok(!api.newDoubleVowel(r.name, r.frags[0].t, r.frags[1].t), `doubled vowel: ${r.name}`);
        }
    }
});

test('v0.2.27: Archive — -ski family names stay sayable, and one list spreads out its first parts', () => {
    const { api } = load();
    const rnd = seeded(2030);
    const HEADS = new Set(api.CACHE_ROOTS.flatMap(k => [...api.CACHE[k].head, ...api.CACHE[k].placeHead].map(f => f.t)));
    for (const kind of ['common', 'noble']) for (const gender of ['masculine', 'feminine']) {
        for (const r of api.cacheNames({ target: 'person', method: 'cache', roots: ['slavic'], ckinds: [kind], gender, parts: ['given', 'family'] }, 40, [], rnd)) {
            for (const p of r.pieces) assert.ok(api.sayable(p.text), `hard to say: ${r.name}`);
        }
    }
    for (const roots of [['greek', 'slavic'], ['latin'], ['norse', 'oldenglish']]) for (const target of ['person', 'place']) {
        const list = api.cacheNames({ target, method: 'cache', roots, rootMix: 'merge', ckinds: ['common'], parts: ['given', 'family'] }, 20, [], rnd);
        const count = {};
        for (const r of list) for (const f of [...(r.frags || []), ...(r.pieces || []).flatMap(p => p.frags || [])]) if (HEADS.has(f.t)) count[f.t] = (count[f.t] || 0) + 1;
        assert.ok(Math.max(...Object.values(count)) <= 3, `${roots} ${target}: ${JSON.stringify(count)}`);
    }
});

test('v0.2.28: Archive — places named for a saint stay rare when one list spreads out its first parts', () => {
    const { api } = load();
    const rnd = seeded(2030);
    const saintly = r => (r.frags || []).some(f => f.en === 'saint' || f.en === 'church of');
    for (const roots of [['slavic'], ['norman'], ['oldenglish'], ['germanic']]) for (const kind of ['street', 'town']) {
        let saints = 0;
        for (let i = 0; i < 10; i++) saints += api.cacheNames({ target: 'place', method: 'cache', kind, roots }, 20, [], rnd).filter(saintly).length;
        // About 7% of names (14 in 200); before the fix it was close to half.
        assert.ok(saints <= 30, `${roots} ${kind}: ${saints} saints in 200`);
    }
});

test('v0.2.29: Archive — endings spread out, no stutter, Latin scholars keep Latin words, -ovo/-evo', () => {
    const { api } = load();
    // 91: Mart + ata, Fel + ella stutter; real shapes stay.
    assert.ok(api.echoSyllable('Mart', 'ata') && api.echoSyllable('Fel', 'ella') && api.echoSyllable('Fel', 'ellus'));
    assert.ok(!api.echoSyllable('Stein', 'unn') && !api.echoSyllable('Adal', 'olf') && !api.echoSyllable('Marc', 'ella'));
    // 93: -ovo after a hard sound, -evo after a soft one.
    const S = api.CACHE.slavic;
    const evo = S.placeTail.find(f => f.t === 'evo'), ovo = S.placeTail.find(f => f.t === 'ovo');
    assert.equal(api.slavicOvo('Krasno', evo, S).t, 'ovo');
    assert.equal(api.slavicOvo('Tikh', evo, S).t, 'ovo');
    assert.equal(api.slavicOvo('Kovač', ovo, S).t, 'evo');
    const rnd = seeded(2030);
    // 92: a Latin scholar keeps a Latin word as his family name (Agricola, not Agricolius).
    for (let i = 0; i < 300; i++) {
        const f = api.scholarFamily('latin', i % 2 ? 'f' : 'm', rnd);
        assert.ok(!/[ao]ius$/.test(f.text) || !f.frags.some(x => new RegExp(`^${x.t}$`, 'i').test(f.text.replace(/ius$/, 'a')) || new RegExp(`^${x.t}$`, 'i').test(f.text.replace(/ius$/, 'o'))), f.text);
    }
    for (const roots of [['latin', 'oldenglish'], ['norman', 'celtic'], ['oldenglish'], ['germanic'], ['slavic']]) {
        for (let k = 0; k < 5; k++) {
            const list = api.cacheNames({ target: 'place', method: 'cache', kind: 'town', roots, rootMix: 'merge' }, 20, [], rnd);
            // 89: one list doesn't pile up one ending.
            const count = {};
            for (const r of list) { const t = r.frags[r.frags.length - 1]; if (!/^-|\s/.test(t.t)) count[t.t] = (count[t.t] || 0) + 1; }
            assert.ok(Math.max(...Object.values(count)) <= 5, `${roots}: ${JSON.stringify(count)}`);
            for (const r of list) {
                // 90: no -arium after an Old English word; 93: no -evo after a hard sound.
                const [h, t] = r.frags.filter(f => f.r || r.frags.length === 2);
                if (h && t && h.r === 'oldenglish' && t.r === 'latin') assert.notEqual(t.t, 'arium', r.name);
                assert.ok(!/[knrtdbpmlv]evo/.test(r.name), r.name);
            }
        }
    }
    for (const gender of ['masculine', 'feminine']) for (const r of api.cacheNames({ target: 'person', method: 'cache', roots: ['latin'], ckinds: ['common', 'scholar'], gender, parts: ['given', 'family'] }, 40, [], rnd)) {
        const g = r.pieces.find(p => p.role === 'given');
        if (g.frags.length >= 2) assert.ok(!api.echoSyllable(g.frags[0].t, g.frags[1].t), r.name);
    }
});

test('v0.2.30: Archive — given endings and families spread out, Mesnil no longer piles up, no great + small', () => {
    const { api } = load();
    // 96: an extra word never says the opposite of the name.
    assert.ok(api.oppositeClash({ en: 'great' }, { en: 'small' }) && api.oppositeClash({ en: 'little (Latin)' }, { en: 'great' }));
    assert.ok(!api.oppositeClash({ en: 'great' }, { en: 'river' }));
    const rnd = seeded(2030);
    let mesnil = 0;
    for (let k = 0; k < 6; k++) {
        for (const roots of [['slavic'], ['greek', 'slavic']]) {
            const list = api.cacheNames({ target: 'person', method: 'cache', roots, rootMix: 'merge', ckinds: ['common'], parts: ['given', 'family'] }, 20, [], rnd);
            // 94: one list doesn't pile up one given-name ending (-mila six times).
            const ends = {};
            for (const r of list) { const g = r.pieces.find(p => p.role === 'given'); if (g.frags.length > 1) { const e = g.frags.slice(1).map(f => f.t).join('').toLowerCase().replace(/a$/, ''); ends[e] = (ends[e] || 0) + 1; } }
            assert.ok(Math.max(...Object.values(ends)) <= 5, `${roots}: ${JSON.stringify(ends)}`);
            // 97: no Chernov and Chernova in one list.
            const fams = list.map(r => r.pieces.find(p => p.role === 'family' || p.role === 'patronymic')).filter(Boolean)
                .map(p => p.text.toLowerCase().replace(/(sk|ck)a$/, '$1i').replace(/(ov|ev|in)a$/, '$1'));
            assert.ok(fams.length - new Set(fams).size <= 1, fams.join(', '));
        }
        const places = api.cacheNames({ target: 'place', method: 'cache', kind: 'street', roots: ['norman', 'celtic'], rootMix: 'merge' }, 20, [], rnd);
        mesnil += places.filter(r => /^Mesnil/.test(r.name)).length;
        for (const r of places) {
            const e = r.frags.map(f => f.en || '').join(' ');
            assert.ok(!(/\b(great|big)\b/.test(e) && /\b(small|little)\b/.test(e)), r.name);
        }
    }
    // 95: Mesnil… as the first part about three times in 20 at most, on average (was five).
    assert.ok(mesnil / 6 <= 3.5, String(mesnil / 6));
});

const STREET_WORDS = /^(rue|ruelle|venelle|chemin|de|d'|heol|stryd|sráid|bóthar)$/;

test('v0.2.31: Archive — first parts and endings spread out together, family-name endings too', () => {
    const { api } = load();
    const rnd = seeded(2030);
    let anyMax = 0, famMax = 0;
    for (let k = 0; k < 6; k++) {
        // 99: one word (as first part or ending) about three times in 20 at most (Pont…, …lieu).
        const places = api.cacheNames({ target: 'place', method: 'cache', kind: 'street', roots: ['norman', 'celtic'], rootMix: 'merge' }, 20, [], rnd);
        const w = {};
        // v0.2.45: the street word itself (Rue, Heol, de) comes back on purpose; the words around it spread out.
        for (const r of places) for (const f of r.frags) { const t = f.t.toLowerCase().replace(/^-|-$/g, ''); if (STREET_WORDS.test(t)) continue; w[t] = (w[t] || 0) + 1; }
        anyMax += Math.max(...Object.values(w));
        // 100: scholar family names don't pile up one ending (-castrensis three times).
        const people = api.cacheNames({ target: 'person', method: 'cache', roots: ['latin'], ckinds: ['scholar'], gender: 'masculine', parts: ['given', 'family'] }, 20, [], rnd);
        const f = {};
        for (const r of people) { const p = r.pieces.find(x => x.role === 'family'); if (p.frags.length >= 3) { const t = p.frags[p.frags.length - 2].t; f[t] = (f[t] || 0) + 1; } }
        famMax += Math.max(0, ...Object.values(f));
    }
    assert.ok(anyMax / 6 <= 3.5, `any part ${anyMax / 6}`);
    assert.ok(famMax / 6 <= 3.2, `family ending ${famMax / 6}`);
});

test('v0.2.32: Latin scholars keep -or trade words half the time (Pictor and Pictorius), no Malbane', () => {
    const { api } = load();
    const rnd = seeded(2030);
    const seen = { m: { or: 0, orius: 0 }, f: { or: 0, orius: 0 } };
    for (let i = 0; i < 2000; i++) {
        const g = i % 2 ? 'f' : 'm';
        const f = api.scholarFamily('latin', g, rnd);
        if (/orius$/.test(f.text)) seen[g].orius++;
        else if (/or$/.test(f.text)) seen[g].or++;
    }
    assert.ok(seen.m.or > 0 && seen.m.orius > 0, JSON.stringify(seen));
    assert.ok(seen.m.or < seen.m.orius * 2 && seen.m.orius < seen.m.or * 2, JSON.stringify(seen));
    // A woman never takes a bare Latin trade word as her family name.
    assert.equal(seen.f.or, 0);
    // "bad" counts as an adjective, so Mal + bane (bad + white) doesn't join.
    assert.ok(api.twoAdjectives({ t: 'Mal', en: 'bad' }, { t: 'bane', en: 'white' }));
});

test('v0.2.33: qu always takes a vowel after it (no Aqudunum, Aqus, Aquwulf)', () => {
    const { api } = load();
    assert.ok(!api.sayable('Aqudunum'));
    assert.ok(!api.sayable('Aqus'));
    assert.ok(!api.sayable('Aquwulf'));
    assert.ok(api.sayable('Aquila'));
    assert.ok(api.sayable('Quercensis'));
    const rnd = seeded(2030);
    for (const roots of [['latin'], ['latin', 'oldenglish'], ['latin', 'celtic']]) {
        for (const target of ['person', 'place']) {
            for (let k = 0; k < 10; k++) {
                const list = api.cacheNames({ target, method: 'cache', roots, rootMix: roots.length > 1 ? 'merge' : 'split', ckinds: ['common', 'scholar'], parts: ['given', 'family'] }, 20, [], rnd);
                for (const r of list) assert.ok(!/qu(?![aeio])/i.test(r.name), r.name);
            }
        }
    }
});

test('v0.2.34 Norman given names: no French word + Germanic ending, smooth joins, no stray words', () => {
    const { api } = load();
    const N = api.CACHE.norman;
    assert.ok(!N.head.some(f => f.t === 'Grand'));
    const rnd = seeded(2030);
    const seen = { fr: 0, ge: 0 };
    for (const gender of ['masculine', 'feminine']) {
        for (let i = 0; i < 20; i++) {
            for (const x of api.cacheNames({ target: 'person', method: 'cache', roots: ['norman'], ckinds: ['common'], parts: ['given'], gender }, 20, [], rnd)) {
                const [h, t] = x.pieces ? x.pieces[0].frags : x.frags;
                seen[N.frenchWords.has(h.t) ? 'fr' : 'ge']++;
                assert.ok(!(N.frenchWords.has(h.t) && N.germanEnds.has(t.t)), x.name);
                assert.ok(!(/[aeiouy]$/i.test(h.t) && /^[aeiouy]/i.test(t.t)), x.name);
                assert.ok(((h.t.match(/[^aeiouy]+$/i) || [''])[0] + (t.t.match(/^[^aeiouy]+/i) || [''])[0]).length < 3, x.name);
                assert.ok(!N.notNames.has(x.name.toLowerCase()), x.name);
            }
        }
    }
    // Both kinds still come out: French pet forms (Clairette) and Germanic names (Thibaud).
    assert.ok(seen.fr > 20 && seen.ge > 20, JSON.stringify(seen));
});

test('v0.2.35 Celtic names keep to one language: Welsh, Gaelic or Gaulish', () => {
    const { api } = load();
    const C = api.CACHE.celtic;
    const langs = x => {
        const s = new Set();
        for (const p of x.pieces || [{ frags: x.frags, text: x.name }]) {
            for (const f of p.frags || []) { const b = C.branchOf[f.t]; if (b) s.add(b === 'X' ? 'W' : b); }
            if (/^(ap|ab|ferch) /.test(p.text)) s.add('W');
            if (/^(Mac|O')/.test(p.text)) s.add('G');
        }
        return s;
    };
    assert.ok(!C.fem.some(f => f.t === 'finn'));
    const rnd = seeded(2030);
    let ap = 0, mac = 0;
    for (const kind of ['common', 'noble', 'religious', 'scholar']) {
        for (const gender of ['masculine', 'feminine']) {
            for (let i = 0; i < 6; i++) {
                for (const x of api.cacheNames({ target: 'person', method: 'cache', roots: ['celtic'], ckinds: [kind], parts: ['given', 'middle', 'family'], gender }, 20, [], rnd)) {
                    assert.ok(langs(x).size <= 1, x.name);
                    const g = x.pieces.find(p => p.role === 'given');
                    if (gender === 'feminine') assert.ok(g.frags[0].t !== 'Fer', x.name);
                    // Gaulish endings only after a head every branch shares.
                    if (C.branchOf[g.frags[1]?.t] === 'X') assert.ok(!C.branchOf[g.frags[0].t], x.name);
                    if (x.pieces.some(p => /^(ap|ab) /.test(p.text))) { ap++; assert.equal(gender, 'masculine', x.name); }
                    if (x.pieces.some(p => /^ferch /.test(p.text))) assert.equal(gender, 'feminine', x.name);
                    if (x.pieces.some(p => /^(Mac|O')/.test(p.text))) mac++;
                }
            }
        }
    }
    assert.ok(ap > 10 && mac > 10, `${ap} ${mac}`);
    for (const kind of ['any', 'forest', 'water', 'town']) {
        for (let i = 0; i < 10; i++) {
            for (const p of api.cacheNames({ target: 'place', method: 'cache', roots: ['celtic'], kind }, 20, [], rnd)) {
                assert.ok(langs(p).size <= 1, p.name);
                if (p.frags[0].en === 'church of') assert.match(p.name, /^(Kil|Llan)[a-z]+$/);
            }
        }
    }
    // A swapped part keeps the language of the rest.
    for (let i = 0; i < 60; i++) {
        const [x] = api.cacheNames({ target: 'person', method: 'cache', roots: ['celtic'], ckinds: ['common'], parts: ['given', 'middle', 'family'] }, 1, [], rnd);
        for (let k = 0; k < x.pieces.length; k++) {
            const np = api.cachePiece(x, k, { target: 'person', method: 'cache', roots: ['celtic'] }, [], rnd);
            if (np) assert.ok(langs({ pieces: x.pieces.map((p, j) => (j === k ? np : p)) }).size <= 1, `${x.name} → ${np.text}`);
        }
    }
});

test('v0.2.36: spellings, plain words and English-looking Merge endings', () => {
    const { api } = load();
    // accents count as plain letters when checking a name can be said
    assert.ok(api.sayable('Grünfeld') && api.sayable('Mühlbach') && api.sayable('Chesnepré'));
    const people = (root, g, n) => {
        const out = [];
        for (let b = 0; b < n; b++) out.push(...api.cacheNames({ target: 'person', method: 'cache', roots: [root], ckinds: ['common'], gender: g, parts: ['given'] }, 20, [], seeded(2030 + b)));
        return out;
    };
    const places = (roots, mix, n) => {
        const out = [];
        for (let b = 0; b < n; b++) out.push(...api.cacheNames({ target: 'place', method: 'cache', roots, rootMix: mix }, 20, [], seeded(2030 + b)));
        return out;
    };
    const latin = [...people('latin', 'masculine', 15), ...people('latin', 'feminine', 15)];
    assert.ok(!latin.some(n => /^(Dominus|Domina|Sanctus|Sancta|Solus|Sola|Vitulus|Vitula|Aqua|Terra|Lupa)$/.test(n.name)));
    const slavic = [...people('slavic', 'feminine', 15)];
    assert.ok(!slavic.some(n => /^(Ostra|Bola|Luta|Dobra)$/.test(n.name)));
    assert.ok(!people('oldenglish', 'masculine', 10).some(n => /^Bert/.test(n.name)));
    const norman = places(['norman'], 'split', 15);
    assert.ok(!norman.some(n => /Riv(?!e|a)|Foret|eay|pre\b/.test(n.name)));
    for (const other of ['norman', 'oldenglish']) {
        const merged = places([other, 'celtic'], 'merge', 15);
        for (const n of merged) {
            const [h, t] = n.frags.filter(f => f.r);
            if (h && t && h.r !== 'celtic' && t.r === 'celtic') assert.ok(!/^(boy|more|bane|lea|roe|coole)$/.test(t.t), n.name);
        }
    }
});

test('v0.2.37: given-only names spread their endings (-ianus/-iana as one); asked letters win', () => {
    const { api } = load();
    for (let b = 0; b < 10; b++) {
        const list = api.cacheNames({ target: 'person', method: 'cache', roots: ['latin'], ckinds: ['common'], parts: ['given'] }, 20, [], seeded(2030 + b));
        const count = {};
        for (const n of list) { const k = n.frags.slice(1).map(f => f.t).join('').replace(/(us|um|a)$/, ''); count[k] = (count[k] || 0) + 1; }
        assert.ok(Math.max(...Object.values(count)) <= 3, JSON.stringify(count));
        assert.ok(!list.some(n => n.name === 'Maxilla'));
    }
    const must = api.cacheNames({ target: 'person', method: 'cache', roots: ['oldenglish'], parts: ['given', 'family'], mustContain: 'win' }, 10, [], seeded(2030));
    assert.ok(must.filter(n => /win/i.test(n.name)).length >= 9);
    const slavic = api.cacheNames({ target: 'person', method: 'cache', roots: ['slavic'], ckinds: ['common'], gender: 'feminine', parts: ['given'] }, 20, [], seeded(2030));
    assert.ok(!slavic.some(n => /^(Velika|Dala|Voja)$/.test(n.name)));
});

test('v0.2.38: Norse, Norman and German woods, hills and forts have more endings; ch keeps the h', () => {
    const { api } = load();
    for (const [root, kind] of [['norse', 'forest'], ['norman', 'forest'], ['norman', 'mountain'], ['germanic', 'forest'], ['germanic', 'mountain'], ['germanic', 'fort']]) {
        for (let b = 0; b < 8; b++) {
            const list = api.cacheNames({ target: 'place', method: 'cache', roots: [root], kind }, 20, [], seeded(2030 + b));
            const R = api.CACHE[root], count = {};
            for (const n of list) {
                const t = [...n.frags].reverse().find(f => R.placeTail.some(x => x.t === f.t));
                if (t) count[t.t] = (count[t.t] || 0) + 1;
            }
            assert.ok(Math.max(0, ...Object.values(count)) <= 4, `${root} ${kind} ${JSON.stringify(count)}`);
        }
    }
    const german = [];
    for (let b = 0; b < 20; b++) german.push(...api.cacheNames({ target: 'place', method: 'cache', roots: ['germanic'], kind: 'forest' }, 20, [], seeded(2030 + b)));
    assert.ok(!german.some(n => /ch(?!h)(agen|olz|orst|ardt|alde)/.test(n.name)), german.filter(n => /ch(agen|olz|orst|ardt|alde)/.test(n.name)).map(n => n.name).join());
    assert.ok(german.some(n => /chh/.test(n.name)));
});

test('v0.2.39: no plain German words as places; no Norwegian word before an English-north ending', () => {
    const { api } = load();
    const all = [];
    for (let b = 0; b < 40; b++) {
        for (const kind of ['any', 'mountain', 'water', 'forest']) {
            all.push(...api.cacheNames({ target: 'place', method: 'cache', roots: ['germanic'], kind }, 20, [], seeded(2030 + b)));
            all.push(...api.cacheNames({ target: 'place', method: 'cache', roots: ['norse'], kind }, 20, [], seeded(2030 + b)));
        }
    }
    assert.ok(!all.some(n => /^(Eisberg|Steinschlag|Waldhorn)$/.test(n.name)));
    const dane = all.filter(n => /^(Ytre|Lille|Indre|Store) /.test(n.name) && api.CACHE.norse.danelaw.has(n.frags[n.frags.length - 1].t));
    assert.equal(dane.length, 0, dane.map(n => n.name).join());
    assert.ok(all.some(n => /^(Ytre|Lille|Indre|Store) /.test(n.name)));
});

test('v0.2.40: Greek and Slavic places have more endings', () => {
    const { api } = load();
    for (const [root, kind, most] of [['greek', 'water', 5], ['greek', 'forest', 5], ['greek', 'mountain', 5], ['greek', 'sea', 4], ['greek', 'town', 5], ['greek', 'fort', 4],
        ['slavic', 'water', 4], ['slavic', 'mountain', 4], ['slavic', 'sea', 4], ['slavic', 'fort', 4]]) {
        for (let b = 0; b < 8; b++) {
            const list = api.cacheNames({ target: 'place', method: 'cache', roots: [root], kind }, 20, [], seeded(2030 + b));
            const R = api.CACHE[root], count = {};
            for (const n of list) {
                const t = [...n.frags].reverse().find(f => R.placeTail.some(x => x.t === f.t || x.t === f.t.replace(/^e/, 'o')));
                if (t) count[t.t] = (count[t.t] || 0) + 1;
            }
            assert.ok(Math.max(0, ...Object.values(count)) <= most, `${root} ${kind} ${JSON.stringify(count)}`);
        }
    }
    assert.ok(api.CACHE.slavic.placeTail.some(f => f.t === 'more' && f.cats.includes('coast')));
});

test('v0.2.41: the version in the code matches manifest.json and shows in the review text', () => {
    const fs = require('fs'), path = require('path');
    const src = fs.readFileSync(path.join(__dirname, '..', 'index.js'), 'utf8');
    const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'manifest.json'), 'utf8'));
    const m = src.match(/const TBD_VERSION = '([^']+)'/);
    assert.ok(m);
    assert.equal(m[1], manifest.version);
    const { api } = load();
    assert.ok(api.reviewText().startsWith(`TBD names for review (v${manifest.version})`));
});

test('v0.2.42: a sea place always has a sea part, and never ends in a lake or stream', () => {
    const { api } = load();
    for (const root of api.CACHE_ROOTS) {
        for (let b = 0; b < 6; b++) {
            const list = api.cacheNames({ target: 'place', method: 'cache', roots: [root], kind: 'sea' }, 20, [], seeded(2030 + b));
            for (const n of list) {
                const fr = n.frags || [];
                assert.ok(fr.some(f => f.cats && f.cats.includes('coast')), `${root}: ${n.name} has no sea part`);
                const R = api.CACHE[root];
                const tail = [...fr].reverse().find(f => R.placeTail.some(t => t.t === f.t));
                if (tail && tail.cats) assert.ok(tail.cats.includes('coast') || !tail.cats.includes('water'), `${root}: ${n.name} ends in ${tail.t}`);
                assert.ok(!/ am See$|-upon-Avon$/.test(n.name), `${root}: ${n.name}`);
                assert.ok(!/c(h(ou|avre|aven)$)/i.test(n.name) || /ch(h)/i.test(n.name), `${root}: ${n.name} reads as ch`);
            }
        }
    }
    assert.ok(api.CACHE.germanic.notPlaces.has('goldfisch'));
});

test('v0.2.43: Latin places come as two words too, with the adjective agreeing', () => {
    const { api } = load();
    const R = api.CACHE.latin;
    const ends = { m: 'us', f: 'a', n: 'um', fp: 'ae', np: 'a' };
    let two = 0, total = 0;
    for (const kind of ['', 'water', 'forest', 'mountain', 'sea', 'town', 'fort']) {
        for (let b = 0; b < 4; b++) {
            for (const n of api.cacheNames({ target: 'place', method: 'cache', roots: ['latin'], kind }, 20, [], seeded(2030 + b))) {
                total++;
                const noun = n.frags.find(f => R.placeWords.some(w => w.t === f.t));
                if (!noun || !/ /.test(n.name)) continue;
                two++;
                const other = n.frags.find(f => f !== noun);
                if (other.use) assert.ok(other.t.endsWith(ends[R.wordGender[noun.t]]), `agreement: ${n.name}`);
                else assert.match(other.t, /i$/, `a man's name in the genitive: ${n.name}`);
                assert.ok(!api.sameSound(noun.t, other.t), `same sound: ${n.name}`);
            }
        }
    }
    assert.ok(two > total * 0.3 && two < total * 0.8, `two-word share ${two}/${total}`);
    for (const w of R.placeWords) assert.ok(R.wordGender[w.t], `gender for ${w.t}`);
    // Not in family names or Merge places.
    for (const n of api.cacheNames({ target: 'person', method: 'cache', roots: ['latin'], ckinds: ['scholar', 'noble'], parts: ['given', 'family'] }, 40, [], seeded(2030))) {
        for (const p of n.pieces.filter(p => p.role === 'family')) assert.ok(!R.placeWords.some(w => p.text.startsWith(w.t + ' ')), `family: ${p.text}`);
    }
    for (const n of api.cacheNames({ target: 'place', method: 'cache', roots: ['latin', 'greek'], rootMix: 'merge' }, 40, [], seeded(2030))) {
        assert.ok(!n.frags.some(f => R.placeWords.some(w => w.t === f.t) && / /.test(n.name) && !/ (Magna|Parva|Superior|Inferior)$/.test(n.name)), `merge: ${n.name}`);
    }
});

test('v0.2.44: Latin -etum only after a tree or plant, and Magna / Parva agree', () => {
    const { api } = load();
    const plant = /\b(oak|beech|pine|ash tree|birch|elm|linden|fir|laurel|olive|alder|hazel|cypress|wine|vine|flower|apple|yew|willow|thorn|broom|reed|rush)\b/;
    const words = api.CACHE.latin.placeWords.map(f => f.t);
    for (const roots of [['latin'], ['latin', 'greek'], ['slavic', 'latin']]) {
        for (const kind of ['', 'forest']) {
            for (let b = 0; b < 4; b++) {
                for (const n of api.cacheNames({ target: 'place', method: 'cache', roots, rootMix: roots.length > 1 ? 'merge' : 'split', kind }, 20, [], seeded(2030 + b))) {
                    const i = n.frags.findIndex(f => f.t === 'etum');
                    if (i > 0) assert.match(n.frags[i - 1].en, plant, `${n.name}`);
                    const m = n.name.match(/^(\S+) (Magn|Parv)(a|um|us)$/);
                    if (m && !words.includes(m[1])) assert.equal(m[3], /um$/.test(m[1]) ? 'um' : /us$/.test(m[1]) ? 'us' : 'a', n.name);
                }
            }
        }
    }
});

test('v0.2.45: street boards name streets each root\'s way; street words stay out of other names', () => {
    const { api } = load();
    const rnd = seeded(2030);
    const STREETY = /(^|\s)(Rue|Ruelle|Venelle|Chemin|Grande?-\w+|Street|Lane|Row|ulica|Hodos|Agyia|Stoa|Stryd|Heol|Sráid|Bóthar|Via|Clivus|Semita|Vicus|Straße)(\s|$)|(gasse|straße|weg|markt|graben|steig|tor|gate|gata|veg|stig|smug|brygge)$/;
    for (const roots of [['latin'], ['oldenglish'], ['norman'], ['germanic'], ['celtic'], ['norse'], ['greek'], ['slavic'], ['norman', 'celtic'], ['greek', 'slavic']]) {
        let streets = 0, total = 0;
        for (let b = 0; b < 5; b++) {
            const list = api.cacheNames({ target: 'place', method: 'cache', kind: 'street', roots, rootMix: 'merge' }, 20, [], rnd);
            for (const n of list) { total++; if (STREETY.test(n.name)) streets++; assert.ok(n.frags.every(f => f.ko !== undefined), n.name); }
        }
        assert.ok(streets / total >= 0.45, `${roots}: ${streets}/${total}`);
    }
    // Street-only words never reach other places, family names or "of" places.
    const ONLY = /(gasse|straße|steig|graben|gata|smug|brygge|stig)$|\b(Via|Clivus|Semita|Rue|ulica|Stryd|Heol|Hodos)\b|Bäcker|Schmied|Gerber|Mickle|Smed|Torg/;
    for (const root of ['germanic', 'norse', 'latin', 'norman', 'slavic']) {
        for (const kind of ['any', 'town', 'forest', 'fort']) {
            for (const n of api.cacheNames({ target: 'place', method: 'cache', kind, roots: [root] }, 20, [], rnd)) assert.ok(!ONLY.test(n.name), `${kind}: ${n.name}`);
        }
        // (People only by street endings and words: Gerbert is a real given name.)
        const ENDS = /(gasse|straße|steig|graben|gata|smug|brygge|stig)\b|\b(Via|Clivus|Semita|Rue|ulica|Stryd|Heol|Hodos)\b/;
        for (const n of api.cacheNames({ target: 'person', method: 'cache', roots: [root], ckinds: ['common', 'noble', 'religious', 'scholar'], parts: ['given', 'family'] }, 40, [], rnd)) assert.ok(!ENDS.test(n.name), n.name);
    }
    // Grande-Rue / Via Aurelia shapes, and more Norman town heads.
    assert.ok(api.CACHE.norman.placeHead.filter(f => f.cats && f.cats.includes('town')).length >= 8);
    assert.ok(api.CACHE.latin.placeWords.some(f => f.t === 'Via'));
});

test('v0.2.46: a Slavic "road to" street only for a town with a Slavic ending (no Chernototska ulica)', () => {
    const { api } = load();
    const rnd = seeded(2030);
    let ska = 0;
    for (const roots of [['slavic', 'norman'], ['greek', 'slavic'], ['norman', 'celtic', 'slavic']]) {
        for (let b = 0; b < 10; b++) {
            for (const n of api.cacheNames({ target: 'place', method: 'cache', kind: 'street', roots, rootMix: 'merge' }, 20, [], rnd)) {
                if (!n.frags.some(f => f.t === 'ska ulica')) continue;
                ska++;
                const end = n.frags[n.frags.length - 2];
                assert.ok(!end.r || end.r === 'slavic', n.name);
            }
        }
    }
    assert.ok(ska > 0);
});

test('v0.2.47: fewer "Rue de" in a Merge, more Vicus than Clivus, no Beaovo', () => {
    const { api } = load();
    const rnd = seeded(2030);
    let rue = 0;
    for (let b = 0; b < 10; b++) {
        for (const n of api.cacheNames({ target: 'place', method: 'cache', kind: 'street', roots: ['norman', 'slavic'], rootMix: 'merge' }, 20, [], rnd)) {
            if (/^Rue (de |d')(?!la )/.test(n.name)) rue++;
            const h = n.frags.find(f => /(au|eu)$/i.test(f.t));
            assert.ok(!h || n.name.includes(h.t), n.name);
        }
    }
    assert.ok(rue / 10 <= 4, `Rue de ${rue / 10} a list`);
    const seen = { Vicus: 0, Clivus: 0 };
    for (let i = 0; i < 400; i++) {
        const p = api.cachePlace('latin', ['town'], rnd);
        const t = api.cachePlace('latin', Object.assign(['town'], { street: true }), rnd);
        for (const w of Object.keys(seen)) if (new RegExp(`\\b${w}\\b`).test(t.text)) seen[w]++;
        assert.ok(!/\b(Via|Clivus|Semita)\b/.test(p.text), p.text);
    }
    assert.ok(seen.Vicus > seen.Clivus, JSON.stringify(seen));
});

test('v0.2.48: Latin streets: no Via + genitive, street words spread, Sacer', () => {
    const { api } = load();
    let worst = 0, gen = 0, sacr = 0;
    for (let b = 0; b < 30; b++) {
        const list = api.cacheNames({ target: 'place', method: 'cache', roots: ['latin'], rootMix: 'split', kind: 'street' }, 20, [], seeded(2030 + b));
        const count = {};
        for (const n of list) {
            const [a, c] = n.name.split(' ');
            for (const w of ['Via', 'Vicus', 'Semita', 'Clivus']) if (a === w || c === w) count[w] = (count[w] || 0) + 1;
            if (a === 'Via' && c && /i$/.test(c)) gen++;
            if (/Sacrus/.test(n.name)) sacr++;
        }
        worst = Math.max(worst, ...Object.values(count));
    }
    assert.equal(gen, 0, 'a via takes no genitive');
    assert.equal(sacr, 0, 'Sacer, not Sacrus');
    assert.ok(worst <= 6, `one street word at most 6 times in 20 (got ${worst})`);
});

test('v0.2.49: one list never gives a place both with and without its add-on word', () => {
    const { api } = load();
    for (const root of ['norse', 'norman', 'germanic', 'oldenglish']) {
        for (let b = 0; b < 15; b++) {
            const list = api.cacheNames({ target: 'place', method: 'cache', roots: [root], rootMix: 'split', kind: 'any' }, 20, [], seeded(2030 + b));
            const cores = list.map(n => {
                const a = n.frags.find(f => f.addon);
                return (a ? n.name.replace(a.t, '') : n.name).trim().toLowerCase();
            });
            assert.equal(new Set(cores).size, cores.length, `${root}: ${list.map(n => n.name).join(', ')}`);
        }
    }
});

test('v0.2.50: no man/woman pair of one family, Slavic -ka, short -ski, word names, place parts spread', () => {
    const { api } = load();
    const key = p => (p.frags && p.frags.length === 1 ? p.frags[0].t : p.text).toLowerCase()
        .replace(/^(ap|ab|ferch) /, '').replace(/(son|dottir)$/, '')
        .replace(/(sk|ck)a$/, '$1i').replace(/(ov|ev|in)a$/, '$1').replace(/(ius|ia)$/, 'i');
    for (const root of ['latin', 'slavic', 'celtic', 'norse', 'greek']) {
        for (let b = 0; b < 15; b++) {
            const list = api.cacheNames({ target: 'person', method: 'cache', roots: [root], ckinds: ['common'], parts: ['given', 'family'] }, 20, [], seeded(2030 + b));
            const fams = list.map(n => n.pieces.find(p => p.role === 'family' || p.role === 'patronymic')).filter(Boolean).map(key);
            assert.equal(new Set(fams).size, fams.length, `${root}: ${list.map(n => n.name).join(', ')}`);
            for (const n of list) {
                const g = n.pieces.find(p => p.role === 'given');
                assert.ok(!/[aeiouy]ka$/i.test(g.text) || g.frags[1].t !== 'ka', g.text);
                assert.ok(!/^(hardier|benana|lutka)$/i.test(g.text), g.text);
                const f = n.pieces.find(p => p.role === 'family');
                if (root === 'slavic' && f && /(sk|ck)[iay]$/.test(f.text) && f.frags.length > 1) assert.ok(f.text.length <= 13, f.text);
            }
            if (root === 'greek') {
                const parts = new Map();
                for (const n of list) for (const p of n.pieces) if ((p.frags || []).length === 2 && /^of /.test(p.text))
                    for (const fr of p.frags) { const s = fr.t.toLowerCase().replace(/[aeiouy]+$/, ''); parts.set(s, (parts.get(s) || 0) + 1); }
                assert.ok(Math.max(0, ...parts.values()) <= 3, [...parts].join(' '));
            }
        }
    }
});

test('v0.2.51 Roster: pasted lists, picking as is, joining, varying, import', async () => {
    const { api } = load();
    // Paste: one per line, "name | note" or a tab, # skipped, repeats and JSON bits dropped.
    const p = api.parseRosterText('# a heading\nAubert\n  Gautier  |  13th c. roll \nIsabeau\tfrom a sheet\naubert\n\n[{"x\nAmaury');
    assert.deepEqual([...p.items.map(it => it.n)], ['Aubert', 'Gautier', 'Isabeau', 'Amaury']);
    assert.equal(p.items[1].note, '13th c. roll');
    assert.equal(p.items[2].note, 'from a sheet');
    assert.equal(p.dupes, 1);
    assert.equal(p.bad, 1);
    assert.equal(api.rosterText({ items: p.items }).split('\n')[1], 'Gautier | 13th c. roll');

    const given = { id: 'g', title: 'Given', target: 'person', kind: 'given', items: api.parseRosterText('Aubert\nGautier\nIsabeau\nAmaury\nHersende\nOsbern').items };
    const family = { id: 'f', title: 'Family', target: 'person', kind: 'family', items: api.parseRosterText('Varenne\nMarchand | a trade\nDelacroix\nBeaumont').items };
    const towns = { id: 't', title: 'Towns', target: 'place', kind: 'given', items: api.parseRosterText('Harfleur\nValmont\nBarfleur').items };
    const settings = { rosters: [given, family, towns], form: { target: 'person', method: 'roster', rosterIds: ['g', 'f', 't'] } };
    const env = load({ extensionSettings: { tbd_names: settings } });
    const R = env.api;
    const form = { target: 'person', method: 'roster', rosterIds: ['g', 'f', 't'], rosterUse: 'asis' };
    assert.ok(R.isRoster(form) && R.notAi(form) && !R.isCache(form));
    assert.ok(!R.isRoster({ ...form, target: 'shop' }));
    // Only lists for this target count (a place list never names a person).
    assert.deepEqual([...R.rosterLists(form).map(l => l.id)], ['g', 'f']);
    assert.equal(R.rosterNeed(form), '');
    assert.equal(R.rosterNeed({ ...form, rosterIds: [] }), 'pick');
    assert.equal(R.rosterNeed({ ...form, target: 'place', rosterIds: [] }), 'pick');
    const env2 = load({ extensionSettings: { tbd_names: { rosters: [towns] } } });
    assert.equal(env2.api.rosterNeed(form), 'none');

    // Given-only + family-only lists are joined; never the same name twice; the user's avoid list holds.
    const list = R.rosterPick(form, 10, ['Gautier'], R.rosterLists(form), seeded(2030));
    assert.equal(list.length, 10);
    assert.equal(new Set(list.map(n => n.name)).size, 10);
    for (const n of list) {
        assert.match(n.name, /^\S+ \S+$/);
        assert.ok(!n.name.startsWith('Gautier'), n.name);
        assert.ok(n.roster && !n.cache);
        assert.deepEqual([...n.lists], ['Given', 'Family']);
    }
    assert.ok(list.some(n => n.note === 'a trade'));
    // Parts spread out: with 4 family names, none comes a third time in 8 joined names.
    const fams = R.rosterPick(form, 8, [], R.rosterLists(form), seeded(77)).map(n => n.name.split(' ')[1]);
    assert.ok(Math.max(...['Varenne', 'Marchand', 'Delacroix', 'Beaumont'].map(f => fams.filter(x => x === f).length)) <= 2, fams.join(' '));
    // A list on its own gives its own names; letters asked for come first.
    const one = R.rosterPick({ ...form, mustContain: 'ers' }, 2, [], [given], seeded(11));
    assert.equal(one[0].name, 'Hersende');
    // Runs out instead of repeating.
    assert.equal(R.rosterPick({ target: 'place' }, 9, [], [towns], seeded(3)).length, 3);

    // Vary: the prompt carries the names only; an answer that is the same, banned or another listed name is refused.
    const msgs = R.buildVaryMessages([{ name: 'Aubert Varenne' }], form, { lang: 'ko', reading: true });
    assert.match(msgs[1].content, /1\. "Aubert Varenne"/);
    assert.match(msgs[1].content, /same number of words/);
    assert.match(msgs[1].content, /"read"/);
    const src = { name: 'Aubert Varenne', roster: true, lists: ['Given', 'Family'], note: 'memo' };
    const banned = new Set(['gautier varenne']);
    assert.equal(R.applyVary(src, { name: 'Aubert Varenne' }, form, banned), null);
    assert.equal(R.applyVary(src, { name: 'Gautier Varenne' }, form, banned), null);
    assert.equal(R.applyVary(src, { name: 'Aubrecht' }, form, banned), null);
    const v = R.applyVary(src, { name: 'Aubrecht Varenne', note: 'firmer end', read: 'AU-brecht' }, form, banned);
    assert.equal(v.name, 'Aubrecht Varenne');
    assert.equal(v.orig, 'Aubert Varenne');
    assert.ok(v.varied && v.roster);
    assert.equal(v.note, 'firmer end');

    // v0.2.52: swapping in another listed name is not a new name; the part asked for has to change.
    const listed = new Set(['fontaine', 'marchand']);
    assert.equal(R.applyVary(src, { name: 'Aubert Fontaine' }, form, listed), null);
    assert.equal(R.applyVary(src, { name: 'Marchand Varenne' }, form, listed), null);
    assert.ok(R.applyVary(src, { name: 'Aubert Fontenay' }, form, listed));
    assert.equal(R.applyVary({ ...src, change: 'given' }, { name: 'Aubert Vareuil' }, form, listed), null);
    assert.ok(R.applyVary({ ...src, change: 'given' }, { name: 'Aubrin Varenne' }, form, listed));
    assert.equal(R.applyVary({ ...src, change: 'both' }, { name: 'Aubrin Varenne' }, form, listed), null);
    const both = R.applyVary({ ...src, change: 'both' }, { name: 'Aubrin Vareuil' }, form, listed);
    assert.ok(both && both.change === undefined);
    // Full names take turns (given / family / both); a single name gets no part.
    const plan = R.varyPlan([{ name: 'A B' }, { name: 'C D' }, { name: 'E F' }, { name: 'G' }], form, seeded(5));
    assert.deepEqual(new Set(plan.slice(0, 3).map(n => n.change)).size, 3);
    assert.equal(plan[3].change, undefined);
    assert.equal(R.varyPlan([{ name: 'Old Harbor' }], { target: 'place' })[0].change, undefined);
    const pm = R.buildVaryMessages(plan, form, {})[1].content;
    assert.match(pm, /1\. "A B" — change (the given name|the family name|both)/);
    assert.match(pm, /4\. "G"\n/);
    // v0.2.53: a given name changes only a little (Foulques → Firmin was a swap, not a variant).
    const pg = R.buildVaryMessages([{ name: 'A B', change: 'given' }, { name: 'C D', change: 'both' }], form, {})[1].content;
    assert.match(pg, /1\. "A B" — change the given name \(the first word\) a little, keeping its first sound or its ending/);
    assert.match(pg, /2\. "C D" — change both .*given name only a little/);
    assert.match(pg, /sound related to the original/);

    // Kept in Found with where it came from; the review text says so too.
    const e = R.foundEntry(v);
    assert.ok(e.roster && e.varied);
    assert.deepEqual([...e.lists], ['Given', 'Family']);
    assert.equal(e.orig, 'Aubert Varenne');
    const review = R.reviewText([{ ...list[0], form }]);
    assert.match(review, /Made with: Roster \(as is\)/);
    assert.match(review, /Lists: Given \[given\], Family \[family\]/);
    assert.match(review, /\{ROSTER\}/);
    assert.match(review, /from list: Given \+ Family/);

    // Import: a Roster file adds its lists; plain text becomes one list named after the file; other files are refused.
    const st = { rosters: [], form: {} };
    const r1 = R.rosterImport(R.rosterExportText({ rosters: [given, towns] }), 'x.json', st);
    assert.deepEqual({ ...r1 }, { lists: 2, names: 9, cut: false, full: false });
    assert.equal(st.rosters[1].target, 'place');
    const r2 = R.rosterImport('Ashby\nKirkby, an old note\n', 'Old_towns.csv', st, 'place');
    assert.equal(r2.lists, 1);
    assert.equal(st.rosters[2].title, 'Old towns');
    assert.equal(st.rosters[2].items[1].note, 'an old note');
    assert.equal(R.rosterImport(JSON.stringify({ type: 'found', items: [] }), 'f.json', st), null);
    // The cap across all lists holds.
    const big = { rosters: [{ id: 'b', title: 'Big', target: 'person', kind: 'full', items: Array.from({ length: R.ROSTER_MAX - 1 }, (_, i) => ({ n: `N${i}` })) }] };
    const r3 = R.rosterImport('Ana\nBo\nCy', 'more.txt', big);
    assert.equal(r3.names, 1);
    assert.ok(r3.cut);
    // A broken saved list is cleaned on load.
    const env3 = load({ extensionSettings: { tbd_names: { rosters: [{ title: 'x', items: ['A', { n: 'B', note: 'n' }, 5] }, 'junk'] } } });
    const s3 = env3.api.settings ? env3.api.settings() : null;
    if (s3) assert.equal(s3.rosters.length, 1);
});

test('v0.2.54: real places (AI only) have their own choice', () => {
    const { api } = load({ lang: 'ko' });
    api.settings();
    const place = { target: 'place', vibe: 'medieval', kind: 'any', length: 'any', method: 'ai' };
    // Default and the people's choice leave place prompts as they were.
    assert.equal(api.realMode(place), 'invented');
    assert.equal(api.realMode({ ...place, realNames: 'only' }), 'invented');
    assert.deepEqual([...api.realRule(place)], []);
    // Archive / Roster places stay invented.
    assert.equal(api.realMode({ ...place, placeReal: 'only', method: 'cache' }), 'invented');
    assert.equal(api.realMode({ ...place, placeReal: 'only', method: 'roster' }), 'invented');
    // A person's form ignores placeReal.
    assert.equal(api.realMode({ target: 'person', placeReal: 'only' }), 'invented');

    const only = { ...place, placeReal: 'only' };
    const user = api.buildMessages(only, api.rollSeeds(4, only, seeded(5)))[1].content;
    assert.match(user, /^Give 4 names for a place/);
    assert.match(user, /Use real place names that exist or existed/);
    assert.match(user, /"real": false/);
    assert.ok(!/bare everyday word|Old-world places/.test(user), 'no rules that fight real places');
    assert.ok(!/not place names that already exist/.test(api.buildMessages({ ...only, aiRoots: ['norse'] }, api.rollSeeds(3, { ...only, aiRoots: ['norse'] }, seeded(5)))[1].content), 'roots line drops "new" for real places');
    // Vibe hints, and Lovecraftian real places drop the alien-places line.
    const cosmic = api.buildMessages({ ...place, vibe: 'cosmic', placeReal: 'near' }, api.rollSeeds(3, { ...place, vibe: 'cosmic', placeReal: 'near' }, seeded(5)))[1].content;
    assert.match(cosmic, /New England coastal or marsh towns/);
    assert.ok(!/ancient alien places/.test(cosmic));
    assert.ok(api.rollSeeds(10, only, seeded(3)).every(s => !s.shape && !s.ending && !s.spark));

    // Answer, field, fold and review line.
    const [n] = api.parseNames('[{"name": "Whitby", "note": "x", "real": true}]');
    assert.equal(n.real, true);
    const html = api.formHtml(only);
    assert.ok(html.includes('id="tbd_placereal"') && !html.includes('id="tbd_realnames"'));
    assert.match(html, /실제 지명/);
    assert.ok(!api.formHtml({ target: 'person', parts: ['given'], extras: [] }).includes('id="tbd_placereal"'));
    assert.match(api.moreFoldHtml(only), /실제 지명만/);
    assert.match(api.reviewFormLine(only), /Real places: only/);
    assert.match(api.tagsHtml({ name: 'Whitby', real: true, form: only }), /실제로 있는 지명/);
});

test('v0.2.55: "real … only" sends Merge as Split and says so', () => {
    const { api } = load({ lang: 'ko' });
    api.settings();
    const place = { target: 'place', vibe: 'medieval', kind: 'any', length: 'any', method: 'ai', aiRoots: ['latin', 'norse'], aiRootMix: 'merge', placeReal: 'only' };
    assert.equal(api.mergeBlocked(place), true);
    assert.equal(api.aiMerge(place), false);
    // Same prompt as Split.
    const split = { ...place, aiRootMix: 'split' };
    assert.equal(api.buildMessages(place, api.rollSeeds(5, place, seeded(4)))[1].content,
        api.buildMessages(split, api.rollSeeds(5, split, seeded(4)))[1].content);
    // Only "only" with Merge and two roots.
    for (const f of [{ placeReal: 'near' }, { placeReal: 'mix' }, { aiRootMix: 'split' }, { aiRoots: ['latin'] }, { method: 'cache' }]) assert.equal(api.mergeBlocked({ ...place, ...f }), false, JSON.stringify(f));
    const person = { target: 'person', parts: ['given'], extras: [], aiRoots: ['greek', 'slavic'], aiRootMix: 'merge', realNames: 'only', method: 'ai' };
    assert.equal(api.mergeBlocked(person), true);
    assert.equal(api.mergeBlocked({ ...person, realNames: 'near' }), false);
    // Note, dimmed chip, fold and review line.
    const html = api.aiRootsHtml(place);
    assert.match(html, /id="tbd_mix_note">지금은 Split로 뽑아요: &quot;실제 지명만&quot;/);
    assert.match(html, /class="tbd-chip tbd-mix-off" data-chip="airootmix" data-v="merge"/);
    assert.match(api.aiRootsHtml(person), /&quot;실제 이름만&quot;/);
    assert.match(api.aiRootsHtml({ ...place, placeReal: 'near' }), /id="tbd_mix_note" hidden>/);
    assert.ok(!/tbd-mix-off/.test(api.aiRootsHtml({ ...place, placeReal: 'near' })));
    assert.match(api.moreFoldHtml(place), /라틴, 북유럽 \(Merge → Split\)/);
    assert.match(api.reviewFormLine(place), /\(Merge → Split now\)/);
});

test('v0.2.57: real places with any length get no syllable seed', () => {
    const { api } = load();
    const base = { target: 'place', vibe: 'medieval', kind: 'any', length: 'any', method: 'ai' };
    for (const placeReal of ['near', 'mix', 'only']) {
        const seeds = api.rollSeeds(40, { ...base, placeReal }, seeded(3));
        assert.ok(seeds.every(s => s.syllables === undefined && s.start), placeReal);
        const user = api.buildMessages({ ...base, placeReal }, seeds)[1].content;
        assert.ok(!/syllable/.test(user), placeReal);
    }
    // A picked length still gives one; invented places are as before.
    assert.ok(api.rollSeeds(40, { ...base, placeReal: 'near', length: 'short' }, seeded(3)).some(s => s.syllables === 1));
    assert.ok(api.rollSeeds(40, base, seeded(3)).some(s => s.syllables === 1));
});

test('v0.2.58: Korean names in the Archive', () => {
    const { api } = load({ lang: 'ko' });
    // Data: every hanja has six fields, a known place and gender, and Hangul sound.
    for (const c of api.KO_GIVEN) {
        assert.ok(c.t && c.rd && c.en && c.ko, c.t);
        assert.ok(['1', '2', 'b'].includes(c.pos) && ['m', 'f', 'c'].includes(c.g), c.t);
        assert.match(c.rd, /^[가-힣]$/);
    }
    assert.ok(api.KO_FAMILY.every(f => f.z && /^[가-힣]{1,2}$/.test(f.h) && f.z.length === f.h.length && /^[A-Z][a-z]+$/.test(f.r) && f.n > 0));
    // Romanization: syllables kept as written, joined by a hyphen.
    assert.equal(api.koRoman('서윤'), 'Seo-yun');
    assert.equal(api.koRoman('도현'), 'Do-hyeon');
    assert.equal(api.koRoman('하은'), 'Ha-eun');
    assert.equal(api.koRoman('채율'), 'Chae-yul');
    assert.ok(api.ARCHIVE_ROOTS.includes('korean') && !api.CACHE_ROOTS.includes('korean'));
    const byT = new Map(api.KO_GIVEN.map(c => [c.t, c]));
    for (const g of ['masculine', 'feminine']) {
        for (const s of [1, 2, 3, 4]) {
            const list = api.cacheNames({ target: 'person', method: 'cache', roots: ['korean'], ckinds: ['common'], parts: ['given', 'family'], gender: g }, 20, [], seeded(s));
            assert.equal(list.length, 20);
            const syl = new Map();
            for (const n of list) {
                const k = n.kor;
                assert.equal(n.name, k.hangul);
                assert.ok([3, 4].includes(k.hangul.length), k.hangul);
                assert.equal(k.hanja.length, k.hangul.length);
                assert.equal(k.roman, `${k.famR} ${api.koRoman(k.givenH)}`);
                const [a, b] = [...k.givenZ].map(t => byT.get(t));
                assert.ok(a && b && a.pos !== '2' && b.pos !== '1', k.hanja);
                const other = g === 'masculine' ? 'f' : 'm';
                assert.ok(a.g !== other && b.g !== other, `${k.hangul} ${g}`);
                assert.ok(a.rd !== b.rd && a.ko !== b.ko && k.famH.slice(-1) !== a.rd);
                assert.ok(!api.KO_NOT_NAMES.has(k.givenH), k.givenH);
                assert.equal(n.pieces[0].role, 'family');
                assert.equal(n.pieces[1].text, k.givenH);
                for (const c of k.givenH) syl.set(c, (syl.get(c) || 0) + 1);
            }
            assert.ok(Math.max(...syl.values()) <= 3, 'one syllable spread out');
        }
    }
    // Given name alone; English screen shows the romanization first.
    const only = api.koreanOne({ target: 'person', parts: ['given'], gender: 'feminine' }, seeded(5));
    assert.ok(!only.pieces && only.frags.length === 2 && only.kor.givenH === only.name);
    const en = load({ lang: 'en' }).api.koreanOne({ target: 'person', parts: ['given', 'family'], fixedFamily: 'park' }, seeded(5));
    assert.match(en.name, /^Park [A-Z][a-z]+-[a-z]+$/);
    assert.ok(en.pieces[0].fixed);
    assert.match(api.koAltHtml(en), /朴/);
    // Merge with Korean runs as Split; no Korean places (another root makes them, or a 400).
    const mix = { target: 'person', method: 'cache', roots: ['latin', 'korean'], rootMix: 'merge', ckinds: ['common'], parts: ['given', 'family'] };
    assert.equal(api.cacheMerge(mix), false);
    assert.equal(api.koMergeOff(mix), true);
    const both = api.cacheNames(mix, 10, [], seeded(2));
    assert.ok(both.some(n => n.kor) && both.some(n => !n.kor && !n.mix));
    assert.equal(api.cacheNeed({ target: 'place', method: 'cache', roots: ['korean'] }), 'koreanPlace');
    assert.ok(api.cacheNames({ target: 'place', method: 'cache', roots: ['korean', 'norse'], kind: 'any' }, 10, [], seeded(2)).every(n => !n.kor && n.root === 'norse'));
    // One part swapped: a new family name keeps the given name, and the three spellings follow.
    const src = api.cacheNames({ target: 'person', method: 'cache', roots: ['korean'], parts: ['given', 'family'] }, 1, [], seeded(8))[0];
    const next = api.cachePiece(src, 0, src.form || {}, [], seeded(9));
    assert.ok(next && next._kor && next._kor.givenH === src.kor.givenH && next._kor.famH !== src.kor.famH);
    // Sound feel works on Hangul.
    assert.ok(api.koSoundScore('예린', 'bright') > api.koSoundScore('도훈', 'bright'));
    assert.ok(api.soundScore('예린', 'soft') > 0);
    // Wiki check looks up the Hangul on the Korean Wikipedia; review text shows all three.
    assert.deepEqual([...api.checkTargets(src, 'en')].map(t => `${t.wiki}:${t.text}`), [`ko:${src.kor.hangul}`]);
    assert.match(api.reviewText([{ ...src, form: { target: 'person', method: 'cache', roots: ['korean'] } }]), new RegExp(`${src.kor.hangul} · ${src.kor.hanja} · ${src.kor.roman}`));
    // Found keeps the three spellings.
    assert.equal(api.foundEntry({ ...src, target: 'person' }).kor.hanja, src.kor.hanja);
});

test('v0.2.59: more Korean family names and hanja; rare family names are marked', () => {
    const { api } = load({ lang: 'ko' });
    assert.ok(api.KO_FAMILY.length >= 100 && api.KO_GIVEN.length >= 180);
    assert.equal(new Set(api.KO_GIVEN.map(c => c.t)).size, api.KO_GIVEN.length);
    assert.equal(new Set(api.KO_FAMILY.map(f => f.z)).size, api.KO_FAMILY.length);
    const rare = api.KO_FAMILY.filter(f => f.rare);
    assert.ok(rare.length > 10 && rare.every(f => f.n < 10000) && api.KO_FAMILY.filter(f => !f.rare).every(f => f.n >= 10000));
    assert.ok(['남궁', '제갈', '선우', '황보', '독고'].every(h => api.KO_FAMILY.some(f => f.h === h)));
    // Every family is picked about equally, and a rare one carries its mark through to the screen, review and Found.
    const seen = new Map();
    let marked = null;
    for (let b = 0; b < 60; b++) {
        for (const n of api.cacheNames({ target: 'person', method: 'cache', roots: ['korean'], parts: ['given', 'family'] }, 20, [], seeded(500 + b))) {
            seen.set(n.kor.famH, (seen.get(n.kor.famH) || 0) + 1);
            if (n.kor.rare && !marked) marked = n;
            const f = api.KO_FAMILY.find(x => x.z === n.kor.famZ);
            assert.equal(!!n.kor.rare, f.rare);
            assert.ok(!api.KO_NOT_NAMES.has(n.kor.givenH), n.kor.givenH);
        }
    }
    assert.ok(seen.size > 90);
    assert.ok(marked);
    assert.match(api.tagsHtml(marked), /희귀 성/);
    assert.match(api.reviewText([{ ...marked, form: { target: 'person', method: 'cache', roots: ['korean'] } }]), /rare family name/);
    assert.equal(api.foundEntry({ ...marked, target: 'person' }).kor.rare, true);
    // Two-syllable family names romanize as one word.
    const dk = api.koreanOne({ target: 'person', parts: ['given', 'family'], fixedFamily: '제갈' }, seeded(3));
    assert.match(dk.kor.roman, /^Jegal [A-Z][a-z]+-[a-z]+$/);
    assert.equal(dk.kor.hangul.length, 4);
});
