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
    assert.match(user, /no two family names may be the same/);
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
    assert.ok(api.failText('<think>x</think>', L).includes(L.emptyFail));
    assert.ok(api.failText('[{"name": "Ab', L).includes(L.cutFail));
    assert.ok(api.failText('I can help with that.', L).includes(L.parseFail));
    for (const lang of ['en', 'ko']) {
        const S = api.STRINGS[lang];
        assert.ok(S.emptyFail && S.showRaw && S.hideRaw && S.rawEmpty && S.sPreset && S.sPresetHint);
    }
    assert.equal(api.settings().sendPreset, true);
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
    assert.equal(calls[1].includePreset, true);
});
