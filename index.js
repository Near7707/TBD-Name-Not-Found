// TBD — Name Not Found v0.1.7
// A SillyTavern extension that invents names (people, places, shops, items).
// Randomness is rolled by the extension, not the AI, so results don't all sound the same.
(() => {
    'use strict';

    const MODULE = 'tbd_names';
    const ctx = () => SillyTavern.getContext();

    // ---------- text (English first, Korean second) ----------
    const STRINGS = {
        en: {
            menu: 'TBD: Name generator',
            tagline: "Name Not Found. Let's make one!",
            target: 'Target', vibe: 'Vibe', gender: 'Gender', length: 'Length', sound: 'Sound', mustContain: 'Must contain',
            customVibePh: 'e.g. foggy harbor town', mustContainPh: 'e.g. ren',
            find: 'Find names', cancel: 'Cancel', again: 'Roll again',
            copy: 'Copy', insert: 'Put in input box', close: 'Close',
            copied: 'Copied', inserted: 'Added to the input box', copyFail: "Couldn't copy. Select the text and copy it yourself.",
            noChat: 'Open a chat first to use the input box.',
            empty: 'Pick your conditions and press "Find names".',
            parseFail: "The AI's answer couldn't be read. Try again.",
            allFiltered: 'Every name was on the avoid list. Try again.',
            found: n => `200 OK — ${n} name${n === 1 ? '' : 's'} found`,
            err: m => `500 — ${m}`,
            cancelled: '499 — cancelled',
            busy: 'Already searching. Wait or cancel first.',
            noProfileApi: "This SillyTavern version can't send requests with a connection profile.",
            t: { person: 'Person', place: 'Place', shop: 'Shop', item: 'Item', other: 'Other' },
            v: { fantasy: 'Fantasy', medieval: 'Medieval', scifi: 'Sci-fi / cyber', modern: 'Modern', gothic: 'Gothic', cozy: 'Cozy / whimsical', custom: 'Custom…' },
            g: { any: 'Any', feminine: 'Feminine', masculine: 'Masculine', neutral: 'Neutral' },
            l: { any: 'Any', short: 'Short', medium: 'Medium', long: 'Long' },
            s: { any: 'Any', soft: 'Soft', hard: 'Hard', sharp: 'Sharp', bright: 'Bright', dark: 'Dark' },
            refineBtn: 'Reshape the sound', refining: 'Reshaping…', refineCancel: 'Cancel',
            rerollBtn: 'Swap just this name', rerolling: 'Finding another…', rerolled: '200 OK — name swapped',
            r: { soft: 'Softer', hard: 'Harder', sharp: 'Sharper', bright: 'Brighter', dark: 'Darker', shorter: 'Shorter', longer: 'Longer' },
            variants: n => `200 OK — ${n} variant${n === 1 ? '' : 's'} found`,
            kind: 'Kind', detail: 'Details (optional)', otherWhat: 'Name for what?', otherPh: 'e.g. a pirate ship, a guild',
            detailPh: { place: 'e.g. an abandoned subway station', shop: 'e.g. a repair shop open only at night', item: 'e.g. a half-broken military drone' },
            k: {
                place: { any: 'Any', region: 'Country / region', city: 'City', town: 'Town / neighborhood', street: 'Street / district', building: 'Building / facility', transit: 'Station / port / airport', park: 'Park / square', mountain: 'Mountain / hill', water: 'River / lake', forest: 'Forest', sea: 'Sea / island', fort: 'Fort / base', ruins: 'Ruins / abandoned place', planet: 'Planet / station', custom: 'Custom…' },
                shop: { any: 'Any', restaurant: 'Restaurant', cafe: 'Café / desserts', bakery: 'Bakery', bar: 'Bar / pub', lodging: 'Inn / hotel', store: 'Store / market', clothes: 'Clothing', books: 'Books / stationery', pharmacy: 'Pharmacy / apothecary', repair: 'Repair shop / workshop', electronics: 'Electronics / machines', weapons: 'Weapons / gear', beauty: 'Hair / grooming', florist: 'Florist / plants', antiques: 'Antiques / second-hand', custom: 'Custom…' },
                item: { any: 'Any', wearable: 'Worn / carried', tool: 'Tool / machine', device: 'Electronics / gadget', vehicle: 'Vehicle', food: 'Food / drink', medicine: 'Medicine / chemical', weapon: 'Weapon', records: 'Book / document / record', furniture: 'Furniture / household', collectible: 'Art / collectible', product: 'Product / brand', custom: 'Custom…' },
            },
            gear: 'Settings', back: 'Back',
            // settings
            sTitle: 'TBD — Name Not Found',
            sLang: 'Language', sLangAuto: 'Follow SillyTavern',
            sProfile: 'Connection profile', sProfileCurrent: '(Use current API)', sProfileMissing: '⚠️ Profile not found — pick again',
            sCount: 'Names per search (1–30)',
            sTokens: 'Max response tokens',
            sTokensHint: 'Raised automatically for big batches. Thinking models may need more.',
            sTheme: 'Theme', sEffects: 'Moving effects (glitch, flicker, scanlines)',
            sReading: 'Show how to read each name',
            sHistory: 'Avoid names I already got',
            sHistoryClear: 'Forget past names', sHistoryCleared: 'Past names forgotten',
            sBan: 'Names to always avoid (comma or new line)',
            sBanHint: 'Common AI picks are already avoided.',
            th: { st: 'Follow SillyTavern', terminal: 'Terminal', bsod: 'Blue screen', panic: 'Kernel panic', glass: 'Glass (dark)', glasslight: 'Glass (clear)', oldwin: 'Old error box', tape: 'Warning tape', neon: 'Neon glitch' },
        },
        ko: {
            menu: 'TBD: 이름 짓기',
            tagline: "Name Not Found. Let's make one!", // kept in English on purpose (part of the 404 look)
            target: '대상', vibe: '분위기', gender: '성별', length: '길이', sound: '소리 느낌', mustContain: '꼭 들어갈 글자',
            customVibePh: '예: 안개 낀 항구 마을', mustContainPh: '예: ren',
            find: '이름 찾기', cancel: '취소', again: '다시 뽑기',
            copy: '복사', insert: '입력창에 넣기', close: '닫기',
            copied: '복사했어요', inserted: '입력창에 넣었어요', copyFail: '복사가 안 됐어요. 글자를 직접 골라서 복사해 주세요.',
            noChat: '입력창에 넣으려면 먼저 채팅방을 열어 주세요.',
            empty: '조건을 고르고 "이름 찾기"를 눌러 보세요.',
            parseFail: 'AI 답을 읽지 못했어요. 다시 해 보세요.',
            allFiltered: '나온 이름이 전부 피할 목록에 있었어요. 다시 해 보세요.',
            found: n => `200 OK — 이름 ${n}개 찾음`,
            err: m => `500 — ${m}`,
            cancelled: '499 — 취소함',
            busy: '이미 찾는 중이에요. 기다리거나 먼저 취소해 주세요.',
            noProfileApi: '이 실리태번 버전에선 연결 프로필로 요청할 수 없어요.',
            t: { person: '사람', place: '장소', shop: '가게', item: '아이템', other: '기타' },
            v: { fantasy: '판타지', medieval: '중세', scifi: 'SF / 사이버', modern: '현대', gothic: '고딕', cozy: '아기자기', custom: '직접 쓰기…' },
            g: { any: '상관없음', feminine: '여성적', masculine: '남성적', neutral: '중성적' },
            l: { any: '상관없음', short: '짧게', medium: '보통', long: '길게' },
            s: { any: '상관없음', soft: '부드럽게', hard: '단단하게', sharp: '날카롭게', bright: '밝게', dark: '어둡게' },
            refineBtn: '소리 다듬기', refining: '다듬는 중…', refineCancel: '취소',
            rerollBtn: '이 이름만 다시 뽑기', rerolling: '다른 이름 찾는 중…', rerolled: '200 OK — 이름 바꿈',
            r: { soft: '더 부드럽게', hard: '더 단단하게', sharp: '더 날카롭게', bright: '더 밝게', dark: '더 어둡게', shorter: '더 짧게', longer: '더 길게' },
            variants: n => `200 OK — 변형 ${n}개 찾음`,
            kind: '종류', detail: '자세히 (안 써도 됨)', otherWhat: '무엇의 이름?', otherPh: '예: 해적선, 길드',
            detailPh: { place: '예: 버려진 지하철역', shop: '예: 밤에만 여는 수리점', item: '예: 반쯤 부서진 군용 드론' },
            k: {
                place: { any: '상관없음', region: '나라·지역', city: '도시', town: '동네·마을', street: '거리·구역', building: '건물·시설', transit: '역·항구·공항', park: '공원·광장', mountain: '산·언덕', water: '강·호수', forest: '숲', sea: '바다·섬', fort: '요새·기지', ruins: '폐허·버려진 곳', planet: '행성·우주정거장', custom: '직접 쓰기…' },
                shop: { any: '상관없음', restaurant: '식당', cafe: '카페·디저트', bakery: '빵집', bar: '술집·바', lodging: '숙소(여관·호텔)', store: '마트·잡화점', clothes: '옷가게', books: '서점·문구점', pharmacy: '약국·약방', repair: '수리점·공방', electronics: '전자기기·기계 상점', weapons: '무기·장비점', beauty: '미용실·몸단장', florist: '꽃집·식물', antiques: '골동품·중고', custom: '직접 쓰기…' },
                item: { any: '상관없음', wearable: '입는 것·지니는 것', tool: '도구·기계', device: '전자기기·장치', vehicle: '탈것', food: '먹을 것·마실 것', medicine: '약·화학품', weapon: '무기', records: '책·문서·기록', furniture: '가구·집 소품', collectible: '예술품·수집품', product: '상품·브랜드', custom: '직접 쓰기…' },
            },
            gear: '설정', back: '돌아가기',
            sTitle: 'TBD — Name Not Found',
            sLang: '언어', sLangAuto: '실리태번 따라가기',
            sProfile: '연결 프로필', sProfileCurrent: '(현재 연결된 API 사용)', sProfileMissing: '⚠️ 찾을 수 없는 프로필 — 다시 골라 주세요',
            sCount: '한 번에 뽑을 이름 수 (1~30)',
            sTokens: '최대 응답 토큰',
            sTokensHint: '많이 뽑을 땐 자동으로 늘어나요. 생각하는 모델은 더 필요할 수 있어요.',
            sTheme: '테마', sEffects: '움직이는 효과 (글리치, 깜빡임, 스캔라인)',
            sReading: '이름 읽는 법 보기',
            sHistory: '이미 나온 이름은 피하기',
            sHistoryClear: '지난 이름 잊기', sHistoryCleared: '지난 이름을 잊었어요',
            sBan: '항상 피할 이름 (쉼표나 줄바꿈으로 구분)',
            sBanHint: 'AI가 자주 내는 뻔한 이름은 이미 피하고 있어요.',
            th: { st: '실리태번 따라가기', terminal: '터미널', bsod: '블루스크린', panic: '커널 패닉', glass: '유리 (어둡게)', glasslight: '유리 (맑게)', oldwin: '옛날 오류창', tape: '경고 테이프', neon: '네온 글리치' },
        },
    };

    // How each theme talks while it works.
    const THEME_TEXT = {
        st:       { code: '404', title: 'TBD', loading: ['404… searching'] },
        terminal: { code: '404', title: 'TBD > name not found_', loading: ['$ find --name', '$ scanning syllables…'] },
        bsod:     { code: ':(', title: 'TBD ran into a missing name', loading: ['Collecting name info… 0% complete', 'Collecting name info… 37% complete', 'Collecting name info… 82% complete'] },
        panic:    { code: 'FATAL 0x404', title: 'KERNEL PANIC — TBD', loading: ['> name == undefined', '> memory dump… OK', '> recovering name from fragments_'] },
        glass:      { code: '404', title: 'TBD // glass fault', loading: ['> refracting…', '> sweeping up shards…', '> name reassembled_'] },
        glasslight: { code: '404', title: 'TBD // glass fault', loading: ['> refracting…', '> sweeping up shards…', '> name reassembled_'] },
        oldwin:     { code: '404', title: 'TBD.exe — Name Not Found', loading: ['Searching for names…', 'Please wait…', 'Almost done…'] },
        tape:       { code: 'SYSTEM FAILURE', title: '404 TBD / SYSTEM FAILURE', loading: ['ERR_NAME_NOT_FOUND', '> retrying…', '> rebuilding name index_'] },
        neon:       { code: '404', title: 'TBD // name not found', loading: ['> signal lost…', '> re-syncing…', '> name found in the static_'] },
    };
    const THEMES = Object.keys(THEME_TEXT);

    // Names AI models reach for again and again. Always avoided.
    const CLICHES = [
        'Elara', 'Lyra', 'Kael', 'Kaelen', 'Seraphina', 'Aria', 'Thorne', 'Vex', 'Zephyr', 'Nyx', 'Aurelia',
        'Lysandra', 'Caelum', 'Elowen', 'Rowan', 'Sable', 'Elysia', 'Isolde', 'Evander', 'Orion', 'Luna',
        'Aelwyn', 'Thalia', 'Seren', 'Liora', 'Kira', 'Zara', 'Eldrin', 'Lucian', 'Cassian', 'Silas',
        'Eldoria', 'Silverwood', 'Ravenshollow', 'Whisperwind', 'Mistvale', 'Shadowmere', 'Starfall',
        'Moonwhisper', 'Ironforge', 'Brightwater', 'Stormhaven',
    ];

    // ---------- random seeds ----------
    const START_LETTERS = 'BCDFGHJKLMNPRSTVWAEIOU'.split('');
    // Endings depend on what is being named: person endings on a place made places sound like people.
    const ENDINGS = {
        person: ['-an', '-el', '-ick', '-or', '-wyn', '-ard', '-is', '-et', '-um', '-ow', '-ane', '-ith', '-ock', '-ess', '-ry', '-ay', '-ond', '-ix', '-ler', '-ia'],
        placeOld: ['-holm', '-mere', '-wick', '-ford', '-by', '-thorpe', '-moor', '-crag', '-ley', '-stead', '-gate', '-combe', '-den', '-wold', '-fell', '-bury'],
        placeTech: ['-ex', '-ion', '-ax', '-on', '-ar', '-is', ' Station', ' Array', ' Prime', ' Hub', ' Sector', '-7', '-IX', ' Spire'],
        placeModern: ['-ton', '-field', '-ville', ' Heights', ' Park', ' Bay', ' Point', '-burg', '-dale', ' Junction', ' Cross', '-side'],
    };
    function endingsFor(target, vibe) {
        if (target === 'person') return ENDINGS.person;
        if (target !== 'place') return null;
        if (vibe === 'scifi') return ENDINGS.placeTech;
        if (vibe === 'modern') return ENDINGS.placeModern;
        if (vibe === 'custom') return [...ENDINGS.placeOld, ...ENDINGS.placeModern];
        return ENDINGS.placeOld;
    }
    // Shops and items are often phrases, so they get a shape instead of an ending.
    const SHAPES = {
        shop: ['one invented word', 'The + adjective + noun', "an invented owner's name + 's", 'a short pun on the trade', 'noun & noun', 'an invented word + the kind of shop'],
        item: ['one invented word', 'an invented word + an object noun', '"the … of …"', "an invented maker's name + 's + object", 'a title-like epithet'],
        itemTech: ['a model name with letters or numbers', 'a brand-like invented word', 'an invented word + a tech noun'],
        // Real place names often use real words, so places mix invented and real-word shapes.
        place: ['one invented word', 'one invented word', 'two real words joined into one', 'a real word + a place word', 'an invented word + a place word', 'a real word blended with an invented part'],
    };
    function shapesFor(target, vibe) {
        if (target === 'shop') return SHAPES.shop;
        if (target === 'place') return SHAPES.place;
        if (target === 'item') return vibe === 'scifi' ? [...SHAPES.item, ...SHAPES.itemTech] : SHAPES.item;
        return null;
    }
    const TEXTURES = ['soft', 'sharp', 'earthy', 'airy', 'heavy', 'bright', 'old-fashioned', 'clipped', 'rolling', 'rough', 'playful', 'stern'];
    // Inspiration words per vibe. One shared rural list pulled every vibe toward the countryside.
    const SPARKS = {
        fantasy: ['moonlit spring', 'dragon bone', 'rune stone', 'silver birch', 'wyvern nest', 'enchanted mirror', 'crystal cave', 'elder oak',
            'phoenix ash', 'fairy ring', 'storm crown', 'sunken temple', 'griffin feather', 'spell ink', 'glass tower', 'amber', 'starlit pool',
            'troll bridge', 'sea serpent', 'hollow hill', 'gold leaf', 'mist bell', 'runed shield', 'wild hunt', 'giant\'s stair'],
        medieval: ['moss', 'rusted bell', 'salt', 'lantern', 'thistle', 'flint', 'river ford', 'wool', 'copper', 'chalk', 'hearth', 'bramble',
            'ledger', 'kiln', 'harbor', 'owl', 'rye', 'slate', 'tallow', 'quill', 'cistern', 'orchard', 'marsh', 'loom', 'anvil', 'cider',
            'bell tower', 'ferry', 'wax seal', 'heron', 'nettle', 'millstone', 'pewter', 'sundial', 'barley', 'iron gate'],
        scifi: ['orbital relay', 'neon sign', 'server farm', 'ion drive', 'drone swarm', 'hull plating', 'data vault', 'cryo pod', 'signal static',
            'chrome arm', 'fusion core', 'satellite dish', 'circuit board', 'holo ad', 'acid rain', 'maglev line', 'firewall', 'quantum chip',
            'cargo container', 'radiation badge', 'synth leather', 'laser grid', 'black market', 'dead pixel', 'vending machine', 'airlock'],
        modern: ['subway', 'coffee shop', 'parking garage', 'text message', 'rooftop', 'laundromat', 'skate park', 'office tower', 'food truck',
            'highway', 'vinyl record', 'gym', 'bus stop', 'convenience store', 'billboard', 'suburb', 'taxi', 'farmers market', 'loft', 'arcade',
            'bridge', 'studio', 'stadium', 'radio station', 'campus'],
        gothic: ['crypt', 'raven', 'candle wax', 'iron gate', 'cathedral', 'bell tower', 'mourning veil', 'gargoyle', 'fog', 'graveyard',
            'stained glass', 'old blood', 'thorn', 'organ pipe', 'locket', 'wolf', 'moor', 'chapel', 'bone', 'velvet', 'storm', 'ruin',
            'hunger', 'midnight', 'silver mirror'],
        cozy: ['teapot', 'honey', 'mitten', 'cinnamon', 'acorn', 'button', 'quilt', 'muffin', 'fireplace', 'kitten', 'jam jar', 'pinecone',
            'tea cozy', 'marshmallow', 'bumblebee', 'clover', 'biscuit', 'snail', 'window box', 'yarn', 'pancake', 'meadow', 'pudding', 'mushroom'],
    };
    const ALL_SPARKS = [...new Set(Object.values(SPARKS).flat())];
    const SYLLABLES = { short: [1, 2], medium: [2, 3], long: [3, 4], any: [1, 4] };

    function pick(arr, rnd = Math.random) { return arr[Math.floor(rnd() * arr.length)]; }

    // One seed per name. Each name gets its own nudge so the batch spreads out.
    function rollSeeds(count, opts = {}, rnd = Math.random) {
        const [lo, hi] = SYLLABLES[opts.length] || SYLLABLES.any;
        const sparks = SPARKS[opts.vibe] || ALL_SPARKS;
        const target = opts.target || 'person';
        const endings = endingsFor(target, opts.vibe);
        const shapes = shapesFor(target, opts.vibe);
        const seeds = [];
        const usedEndings = new Set();
        for (let i = 0; i < count; i++) {
            const seed = {
                syllables: lo + Math.floor(rnd() * (hi - lo + 1)),
                texture: pick(TEXTURES, rnd),
                spark: pick(sparks, rnd),
            };
            // A forced start letter would fight "must contain", so skip it then.
            if (!opts.mustContain) seed.start = pick(START_LETTERS, rnd);
            // Only nudge the ending about half the time; always forcing it sounds samey too.
            // Don't hand the same ending to two names in one batch (two "… Array" looked samey).
            if (endings && rnd() < 0.5) {
                const fresh = endings.filter(e => !usedEndings.has(e));
                seed.ending = pick(fresh.length ? fresh : endings, rnd);
                usedEndings.add(seed.ending);
            }
            if (shapes) seed.shape = pick(shapes, rnd);
            seeds.push(seed);
        }
        return seeds;
    }

    // ---------- settings ----------
    const DEFAULTS = {
        language: 'auto',
        profileId: '',
        count: 5,
        maxTokens: 1000,
        theme: 'st',
        effects: true,
        rememberHistory: true,
        historySize: 200,
        history: [],
        banList: '',
        showReading: true,
        form: { target: 'person', vibe: 'fantasy', customVibe: '', gender: 'any', kind: 'any', kindText: '', length: 'any', sound: 'any', mustContain: '' },
    };

    function settings() {
        const all = ctx().extensionSettings;
        if (!all[MODULE] || typeof all[MODULE] !== 'object') all[MODULE] = {};
        const st = all[MODULE];
        for (const [k, v] of Object.entries(DEFAULTS)) {
            if (st[k] === undefined) st[k] = Array.isArray(v) ? [] : (v && typeof v === 'object') ? { ...v } : v;
        }
        for (const [k, v] of Object.entries(DEFAULTS.form)) if (st.form[k] === undefined) st.form[k] = v;
        if (!Array.isArray(st.history)) st.history = [];
        if (!THEMES.includes(st.theme)) st.theme = 'st';
        st.count = clampInt(st.count, 1, 30, 5);
        return st;
    }
    function save() { ctx().saveSettingsDebounced(); }
    function clampInt(v, lo, hi, dflt) {
        const n = parseInt(v, 10);
        return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : dflt;
    }

    function detectLang(setting = settings().language) {
        if (setting === 'en' || setting === 'ko') return setting;
        let stLang = '';
        try { stLang = String(localStorage.getItem('language') || ''); } catch { /* no storage */ }
        const nav = typeof navigator !== 'undefined' ? String(navigator.language || '') : '';
        return (stLang || nav).toLowerCase().startsWith('ko') ? 'ko' : 'en';
    }
    const T = () => STRINGS[detectLang()];

    function escapeHtml(s) {
        return String(s ?? '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    // ---------- avoid list ----------
    function splitList(text) {
        return String(text || '').split(/[,\n]/).map(s => s.trim()).filter(Boolean);
    }
    function avoidList(st = settings()) {
        const own = splitList(st.banList);
        const past = st.rememberHistory ? st.history.slice(-80) : [];
        return [...new Set([...CLICHES, ...own, ...past])];
    }
    function rememberNames(names, st = settings()) {
        if (!st.rememberHistory || !names.length) return;
        const seen = new Set(st.history.map(n => n.toLowerCase()));
        for (const n of names) if (!seen.has(n.toLowerCase())) { st.history.push(n); seen.add(n.toLowerCase()); }
        const max = clampInt(st.historySize, 10, 2000, 200);
        if (st.history.length > max) st.history.splice(0, st.history.length - max);
    }

    // ---------- prompt ----------
    const TARGET_DESC = {
        person: 'a person (given name, optionally with a family name)',
        place: 'a place',
        shop: 'a shop or business',
        item: 'an item or object',
        other: 'something in a story (group, ship, creature, event…)',
    };
    // "Kind" narrows the target (a city, a bakery, a ring…).
    // Everyday kinds, so a sci-fi or modern story isn't stuck with swords and potions.
    const KIND_DESC = {
        place: {
            region: 'a country or region', city: 'a city', town: 'a town, village or neighborhood', street: 'a street or district',
            building: 'a building or facility (a school, hospital, factory…)', transit: 'a station, port or airport',
            park: 'a park or square', mountain: 'a mountain or hill', water: 'a river or lake', forest: 'a forest',
            sea: 'a sea or island', fort: 'a fort or base', ruins: 'a ruin or abandoned place', planet: 'a planet, moon or space station',
        },
        shop: {
            restaurant: 'a restaurant', cafe: 'a café or dessert shop', bakery: 'a bakery', bar: 'a bar or pub',
            lodging: 'an inn or hotel', store: 'a general store or market', clothes: 'a clothing shop', books: 'a bookshop or stationery shop',
            pharmacy: 'a pharmacy or apothecary', repair: 'a repair shop or workshop', electronics: 'an electronics or machine shop',
            weapons: 'a weapon or gear shop', beauty: 'a hair salon or grooming shop', florist: 'a florist or plant shop',
            antiques: 'an antique or second-hand shop',
        },
        item: {
            wearable: 'something worn or carried (clothing, a bag, jewelry)', tool: 'a tool or machine', device: 'an electronic device or gadget',
            vehicle: 'a vehicle', food: 'a food or drink', medicine: 'a medicine or chemical', weapon: 'a weapon',
            records: 'a book, document or record', furniture: 'furniture or a household object', collectible: 'an artwork or collectible',
            product: 'a product or brand',
        },
    };
    const KINDS = Object.fromEntries(Object.entries(KIND_DESC).map(([t, m]) => [t, ['any', ...Object.keys(m), 'custom']]));
    // Kinds from v0.1.5–0.1.6 → the closest new one, so a saved choice carries over.
    const OLD_KINDS = {
        place: { country: 'region', village: 'town', castle: 'fort', ruin: 'ruins' },
        shop: { tavern: 'bar', general: 'store', apothecary: 'pharmacy', smithy: 'weapons' },
        item: { armor: 'wearable', jewelry: 'wearable', potion: 'medicine', book: 'records', gem: 'collectible' },
    };
    function normalizeKind(target, kind) {
        const kinds = KINDS[target];
        if (!kinds) return 'any';
        const k = OLD_KINDS[target]?.[kind] || kind;
        return kinds.includes(k) ? k : 'any';
    }
    const DETAIL_MAX = 120;

    function targetText(form) {
        const target = TARGET_DESC[form.target] ? form.target : 'other';
        const own = String(form.kindText || '').trim().slice(0, DETAIL_MAX);
        if (target === 'other') return own ? `something in a story: "${own}"` : TARGET_DESC.other;
        if (target === 'person') return TARGET_DESC.person;
        const kindId = normalizeKind(target, form.kind);
        if (kindId === 'custom' && own) return `${TARGET_DESC[target]}, specifically: "${own}"`;
        const kind = KIND_DESC[target]?.[kindId];
        const base = kind ? `${TARGET_DESC[target]}, specifically ${kind}` : TARGET_DESC[target];
        // The optional details box: the name and the note should fit it.
        return own ? `${base}. Details from the user: "${own}"` : base;
    }

    const VIBE_DESC = {
        fantasy: 'fantasy (magic, myth, old kingdoms)',
        medieval: 'grounded medieval European (villages, trades, churches, no magic)',
        scifi: 'sci-fi / cyberpunk (technology, corporations, space, neon, code, chrome)',
        modern: 'modern-day (real-world today)',
        gothic: 'gothic, dark and old (decay, nobility, churches, night)',
        cozy: 'cozy, whimsical and warm (small, cute, homely)',
    };

    // What the name has to sound like, so a place doesn't come back as a person's name.
    function shapeRules(form) {
        const out = [];
        if (form.target === 'place') {
            out.push("It must sound like a place, not like a person's first name.");
            if (form.vibe === 'scifi') out.push('Sci-fi places can use tech or corporate roots, designations and numbers (a station, array, sector, hub, a "-7" suffix).');
            else if (form.vibe === 'modern') out.push('Modern places can sound like real towns, streets or districts (-ton, -field, Heights, Bay, Park…).');
            else if (form.vibe !== 'custom') out.push('Old-world places often use landscape endings (-holm, -mere, -wick, -ford, -by, -moor…). Mix them; don\'t put the same ending on every name.');
        } else if (form.target === 'shop') {
            out.push('It must sound like a shop sign, not like a person. Shop names may use real words or a short phrase, as long as the whole name is fresh.');
        } else if (form.target === 'item') {
            out.push('It must sound like the name of an object, not of a person. A short phrase is fine.');
        } else if (form.target === 'other') {
            out.push('It must fit what is being named.');
        }
        if (form.target === 'place') {
            out.push('Place names may use real words: joined real words or a real word plus a place word are welcome. Just never a single bare everyday word on its own (like "Mold" or "Salt").');
        } else if (form.target === 'person' || form.target === 'other') {
            out.push('Never use a plain existing English word on its own as the name (like "Mold" or "Salt").');
        }
        out.push('Across the batch, no two names may share the same ending or the same last word (not two "… Array" or two "-ex").');
        return out;
    }

    // How to show the reading: Korean letters for Korean, a stress respelling for English.
    function readingRule(lang) {
        return lang === 'ko'
            ? '"read": how to say it, written in Korean Hangul using standard Korean loanword spelling (e.g. Quilla → 퀼라)'
            : '"read": a simple respelling with the stressed syllable in capitals (e.g. Quilla → KWIL-uh)';
    }

    // Sound groups follow phonetics: sonorants, stops, fricatives, front vs back vowels.
    const SOUND_RULE = 'Judge by how it sounds, not by the letters (a "c" in "Cal" is hard, in "Ced" it is sharp).';
    const SOUND_DESC = {
        soft: 'soft and flowing: lean on l, r, m, n, w, y and open vowels; ending on a vowel is fine',
        hard: 'hard and firm: lean on k, t, p, d, g, b; end on a consonant',
        sharp: 'sharp and crisp: lean on s, z, x, f, v, sh, th',
        bright: 'bright and light: front vowels (i, e) with light consonants (p, t, k, s)',
        dark: 'dark and heavy: back vowels (o, u, a) with heavy consonants (b, d, g, z)',
    };
    const REFINE_DESC = {
        ...SOUND_DESC,
        shorter: 'shorter: trim a syllable or two but keep its core',
        longer: 'longer: add a syllable or two that fits its sound',
    };
    const REFINE_MODES = Object.keys(REFINE_DESC);

    function vibeText(form) {
        return form.vibe === 'custom' ? (String(form.customVibe || '').trim() || 'any') : (VIBE_DESC[form.vibe] || 'any');
    }

    function buildMessages(form, seeds, opts = {}) {
        const lang = opts.lang || 'en';
        const avoid = opts.avoid || [];
        const vibe = vibeText(form);
        const sound = SOUND_DESC[form.sound];
        const phrase = form.target === 'shop' || form.target === 'item';
        const lines = [];
        lines.push(`Invent ${seeds.length} original name${seeds.length === 1 ? '' : 's'} for ${targetText(form)}.`);
        lines.push(`Setting / vibe: ${vibe}.`);
        lines.push('Style: Western, English-readable spelling.');
        lines.push(...shapeRules(form));
        if (form.target === 'person' && form.gender && form.gender !== 'any') lines.push(`Gender feel: ${form.gender}.`);
        if (sound) lines.push(`Sound: ${sound}. ${SOUND_RULE}`);
        if (form.mustContain) lines.push(`Every name must contain the letters "${String(form.mustContain).trim()}" (any position).`);
        lines.push('');
        lines.push('The setting and what is being named come first. Each name also has a seed that only adds variety:');
        lines.push('follow its sound hints, but bend the inspiration word to fit the setting (never let it pull the name out of the setting).');
        seeds.forEach((s, i) => {
            const parts = [];
            if (s.shape) parts.push(`shape: ${s.shape}`);
            if (s.start) parts.push(`${phrase ? 'main word starts' : 'starts'} with "${s.start}"`);
            parts.push(`${phrase ? 'main word ' : ''}${s.syllables} syllable${s.syllables === 1 ? '' : 's'}`);
            if (s.ending) parts.push(`ends with "${s.ending}"`);
            if (!sound) parts.push(`${s.texture} sound`);
            parts.push(`inspiration: "${s.spark}"`);
            lines.push(`${i + 1}. ${parts.join(', ')}`);
        });
        if (avoid.length) {
            lines.push('');
            lines.push(`Do NOT use these names or close variants: ${avoid.join(', ')}.`);
        }
        lines.push('');
        lines.push(`For each name add a short note (under 12 words) in ${lang === 'ko' ? 'Korean' : 'English'} about how it fits this setting. Don't claim a real meaning unless you are sure.`);
        if (opts.reading) lines.push(`Also add ${readingRule(lang)}.`);
        lines.push('Reply with ONLY a JSON array, nothing else:');
        lines.push(opts.reading ? '[{"name": "...", "read": "...", "note": "..."}]' : '[{"name": "...", "note": "..."}]');
        return [
            { role: 'system', content: 'You are a naming assistant for fiction writers. You invent fresh, pronounceable names and avoid overused fantasy clichés.' },
            { role: 'user', content: lines.join('\n') },
        ];
    }

    // Variants of one name that keep its feel but move its sound one way.
    function buildRefineMessages(src, mode, form, opts = {}) {
        const lang = opts.lang || 'en';
        const avoid = opts.avoid || [];
        const count = opts.count || 3;
        const lines = [];
        lines.push(`Here is a name for ${targetText(form)}: "${src.name}".`);
        lines.push(`Setting / vibe: ${vibeText(form)}.`);
        lines.push(`Make ${count} new variant${count === 1 ? '' : 's'} that keep its overall feel and rough shape, but change it to be ${REFINE_DESC[mode] || REFINE_DESC.soft}.`);
        lines.push(SOUND_RULE);
        lines.push('Each variant must be clearly different from the original and from each other. Keep Western, English-readable spelling.');
        lines.push(...shapeRules(form));
        lines.push('Change the sounds inside the name, not just by gluing a letter on the end. Every variant must be easy to pronounce (no clusters like "-etd").');
        lines.push('Also cut sounds that pull the other way (for "sharper", drop soft r/l/m endings; for "softer", drop hard k/t/g stops).');
        lines.push('Avoid anything only a letter or two away from a well-known real or mythological name (like Bridget or Thor).');
        if (avoid.length) lines.push(`Do NOT use these names or close variants: ${avoid.join(', ')}.`);
        lines.push('');
        lines.push(`For each variant add a short note (under 10 words) in ${lang === 'ko' ? 'Korean' : 'English'} about what changed in the sound.`);
        if (opts.reading) lines.push(`Also add ${readingRule(lang)}.`);
        lines.push('Reply with ONLY a JSON array, nothing else:');
        lines.push(opts.reading ? '[{"name": "...", "read": "...", "note": "..."}]' : '[{"name": "...", "note": "..."}]');
        return [
            { role: 'system', content: 'You are a naming assistant for fiction writers who understands phonetics and how sounds feel.' },
            { role: 'user', content: lines.join('\n') },
        ];
    }

    // ---------- reading the answer ----------
    function stripThinking(text) {
        return String(text || '').replace(/<think(?:ing)?>[\s\S]*?<\/think(?:ing)?>/gi, '').trim();
    }

    function parseNames(raw) {
        const text = stripThinking(raw).replace(/```(?:json)?/gi, '');
        const out = [];
        const start = text.indexOf('[');
        const end = text.lastIndexOf(']');
        if (start !== -1 && end > start) {
            try {
                const arr = JSON.parse(text.slice(start, end + 1));
                if (Array.isArray(arr)) {
                    for (const it of arr) {
                        if (typeof it === 'string') out.push({ name: it, note: '' });
                        else if (it && typeof it === 'object') {
                            out.push({ name: String(it.name ?? ''), note: String(it.note ?? it.meaning ?? ''), read: String(it.read ?? it.reading ?? it.pronunciation ?? '') });
                        }
                    }
                }
            } catch { /* fall back to lines */ }
        }
        if (!out.length) {
            // "1. Name — note" / "- **Name**: note"
            for (const line of text.split('\n')) {
                const m = line.match(/^\s*(?:[-*•]|\d+[.)])?\s*\**\s*([^\s—–:*][^—–:*]{0,38}?)\s*\**\s*(?:[—–:]|\s-\s)\s*(.+)$/);
                if (m) out.push({ name: m[1], note: m[2] });
            }
        }
        return out
            .map(n => {
                let name = n.name.replace(/^["'*\s]+|["'*\s]+$/g, '').trim();
                let read = String(n.read || '').trim();
                // Line answers may put the reading in brackets: "Quilla (퀼라)".
                const m = name.match(/^(.+?)\s*[([]([^()[\]]+)[)\]]$/);
                if (m) { name = m[1].trim(); if (!read) read = m[2].trim(); }
                return { name, note: n.note.trim(), read: read.slice(0, 40) };
            })
            .filter(n => n.name && n.name.length <= 40);
    }

    function filterNames(list, avoid) {
        const banned = new Set(avoid.map(a => a.toLowerCase()));
        const seen = new Set();
        return list.filter(n => {
            const key = n.name.toLowerCase();
            if (banned.has(key) || seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    // ---------- talking to the AI (same path as Crib Note) ----------
    function getProfiles() {
        return ctx().extensionSettings?.connectionManager?.profiles || [];
    }

    async function requestLLM(messages, { profileId, maxTokens, signal } = {}) {
        const c = ctx();
        signal?.throwIfAborted();
        const content = res => typeof res === 'string' ? res : (res?.content ?? '');

        if (profileId) {
            const svc = c.ConnectionManagerRequestService;
            if (!svc) throw new Error(T().noProfileApi);
            const res = await svc.sendRequest(profileId, messages, maxTokens, {
                stream: false, signal, extractData: true, includePreset: true, includeInstruct: true,
            });
            return content(res);
        }

        const cc = c.ChatCompletionService;
        if (c.mainApi === 'openai' && cc?.presetToGeneratePayload && cc?.sendRequest) {
            const payload = await cc.presetToGeneratePayload({}, {}, {
                stream: false,
                messages,
                max_tokens: maxTokens,
                model: c.getChatCompletionModel(),
                chat_completion_source: c.chatCompletionSettings.chat_completion_source,
            });
            signal?.throwIfAborted();
            return content(await cc.sendRequest(payload, true, signal));
        }

        const tc = c.TextCompletionService;
        if (c.mainApi === 'textgenerationwebui' && tc?.presetToGeneratePayload && tc?.sendRequest && tc?.constructPrompt) {
            const instruct = c.powerUserSettings?.instruct;
            const prompt = instruct?.enabled ? tc.constructPrompt(messages, instruct) : messages.map(m => m.content).join('\n\n');
            const payload = await tc.presetToGeneratePayload({}, {}, { stream: false, prompt, max_tokens: maxTokens, max_new_tokens: maxTokens });
            const LENGTH_KEYS = ['max_tokens', 'max_new_tokens', 'max_length', 'n_predict', 'num_predict'];
            for (const target of [payload, payload?.options]) {
                if (!target || typeof target !== 'object') continue;
                for (const k of LENGTH_KEYS) if (Object.prototype.hasOwnProperty.call(target, k)) target[k] = maxTokens;
            }
            signal?.throwIfAborted();
            return content(await tc.sendRequest(payload, true, signal));
        }

        // Older or other APIs: generateRaw can't be aborted, so cancel just drops the result.
        const systemPrompt = messages.find(m => m.role === 'system')?.content || '';
        const prompt = messages.filter(m => m.role !== 'system').map(m => m.content).join('\n\n');
        const result = await c.generateRaw({ systemPrompt, prompt, responseLength: maxTokens });
        signal?.throwIfAborted();
        return result;
    }

    function tokensFor(count, st = settings()) {
        return Math.max(clampInt(st.maxTokens, 200, 16000, 1000), 300 + count * 100);
    }

    // ---------- state ----------
    let busy = false;
    let controller = null;
    let results = [];
    let status = { kind: 'idle', text: '' };
    let loadingTimer = null;
    let menuFor = null;   // the result whose reshape menu is open
    let refining = null;  // { src, mode, ctl } while a reshape request runs
    let view = 'form';    // 'form' or 'settings' (the ⚙ page inside the window)

    // ---------- the panel ----------
    function optionList(map, current) {
        return Object.entries(map).map(([k, label]) =>
            `<option value="${escapeHtml(k)}"${k === current ? ' selected' : ''}>${escapeHtml(label)}</option>`).join('');
    }

    function headerHtml(theme) {
        const tt = THEME_TEXT[theme] || THEME_TEXT.st;
        const L = T();
        const closeBtn = `<span class="tbd-head-btns"><button id="tbd_gear" class="tbd-icon-btn${view === 'settings' ? ' tbd-on' : ''}" title="${escapeHtml(L.gear)}" aria-label="${escapeHtml(L.gear)}"><i class="fa-solid fa-gear"></i></button><button id="tbd_close" class="tbd-icon-btn" title="${escapeHtml(L.close)}" aria-label="${escapeHtml(L.close)}"><i class="fa-solid fa-xmark"></i></button></span>`;
        if (theme === 'oldwin') {
            return `<div class="tbd-win-bar"><span>${escapeHtml(tt.title)}</span>${closeBtn}</div>
                <div class="tbd-head tbd-head-row"><div class="tbd-win-icon" aria-hidden="true">✕</div>
                <div class="tbd-head-text"><div class="tbd-title">Error ${escapeHtml(tt.code)}</div><div class="tbd-sub">${escapeHtml(L.tagline)}</div></div></div>`;
        }
        if (theme === 'tape') {
            return `<div class="tbd-tape-tabs"><span class="tbd-dots" aria-hidden="true"><i></i><i></i><i></i></span>
                <span class="tbd-tape-tab">${escapeHtml(tt.title)}</span>${closeBtn}</div>
                <div class="tbd-tape-url">about:404#name_not_found</div>
                <div class="tbd-tape-stripe" aria-hidden="true"></div>
                <div class="tbd-head tbd-head-row"><i class="fa-solid fa-file-circle-xmark tbd-tape-icon" aria-hidden="true"></i>
                <div class="tbd-head-text"><div class="tbd-code">${escapeHtml(tt.code)}</div><div class="tbd-sub">ERR_NAME_NOT_FOUND · code 404 — ${escapeHtml(L.tagline)}</div></div></div>`;
        }
        if (theme === 'panic') {
            return `<div class="tbd-panic-bar"><span>${escapeHtml(tt.title)}</span><span class="tbd-blink">■ REC</span>${closeBtn}</div>
                <div class="tbd-head"><div class="tbd-code tbd-glitch">${escapeHtml(tt.code)}</div>
                <div class="tbd-sub">${escapeHtml(L.tagline)}</div></div>`;
        }
        return `<div class="tbd-head tbd-head-row">
            <div class="tbd-code tbd-glitch">${escapeHtml(tt.code)}</div>
            <div class="tbd-head-text"><div class="tbd-title">${escapeHtml(tt.title)}</div><div class="tbd-sub">${escapeHtml(L.tagline)}</div></div>
            ${closeBtn}</div>`;
    }

    // Our own arrow (one only, theme colored, never over the text).
    function selectHtml(id, map, current) {
        return `<span class="tbd-select"><select id="${id}" class="text_pole">${optionList(map, current)}</select></span>`;
    }

    function formHtml(form) {
        const L = T();
        const kinds = KINDS[form.target];
        const kind = normalizeKind(form.target, form.kind);
        const isOther = form.target === 'other';
        const detailLabel = isOther ? L.otherWhat : (kinds ? L.detail : '');
        const detailPh = isOther ? L.otherPh : (L.detailPh[form.target] || '');
        return `<div class="tbd-form">
            <label>${escapeHtml(L.target)}${selectHtml('tbd_target', L.t, form.target)}</label>
            <label>${escapeHtml(L.vibe)}${selectHtml('tbd_vibe', L.v, form.vibe)}</label>
            <label class="tbd-wide" id="tbd_custom_wrap"${form.vibe === 'custom' ? '' : ' hidden'}><input id="tbd_custom" class="text_pole" type="text" maxlength="80" placeholder="${escapeHtml(L.customVibePh)}" value="${escapeHtml(form.customVibe)}"></label>
            <label id="tbd_gender_wrap"${form.target === 'person' ? '' : ' hidden'}>${escapeHtml(L.gender)}${selectHtml('tbd_gender', L.g, form.gender)}</label>
            ${kinds ? `<label id="tbd_kind_wrap">${escapeHtml(L.kind)}${selectHtml('tbd_kind', L.k[form.target], kind)}</label>` : ''}
            <label>${escapeHtml(L.length)}${selectHtml('tbd_length', L.l, form.length)}</label>
            <label>${escapeHtml(L.sound)}${selectHtml('tbd_sound', L.s, form.sound || 'any')}</label>
            ${detailLabel ? `<label class="tbd-wide" id="tbd_kindtext_wrap">${escapeHtml(detailLabel)}<input id="tbd_kindtext" class="text_pole" type="text" maxlength="${DETAIL_MAX}" placeholder="${escapeHtml(detailPh)}" value="${escapeHtml(form.kindText || '')}"></label>` : ''}
            <label class="tbd-wide">${escapeHtml(L.mustContain)}<input id="tbd_must" class="text_pole" type="text" maxlength="20" placeholder="${escapeHtml(L.mustContainPh)}" value="${escapeHtml(form.mustContain)}"></label>
            <button id="tbd_go" class="tbd-go menu_button">${escapeHtml(busy ? L.cancel : L.find)}</button>
        </div>`;
    }

    function resultsHtml() {
        const L = T();
        if (busy) return `<div class="tbd-log" id="tbd_log"></div>`;
        if (!results.length) return `<div class="tbd-empty">${escapeHtml(L.empty)}</div>`;
        const reading = !!settings().showReading;
        return results.map((r, i) => {
            const depth = r.depth || 0;
            const tag = r.tag && L.r[r.tag] ? `<span class="tbd-tag">${escapeHtml(L.r[r.tag])}</span>` : '';
            const menu = menuFor === r ? `<div class="tbd-refine-menu">${REFINE_MODES.map(m =>
                `<button class="tbd-small-btn tbd-refine-pick" data-mode="${m}">${escapeHtml(L.r[m])}</button>`).join('')}</div>` : '';
            const working = refining && refining.src === r
                ? `<div class="tbd-refining tbd-log"><div>${refining.kind === 'reroll' ? escapeHtml(L.rerolling) : `${escapeHtml(L.refining)} (${escapeHtml(L.r[refining.mode])})`}</div></div>
                   <div class="tbd-refine-menu"><button class="tbd-small-btn tbd-refine-cancel">${escapeHtml(L.refineCancel)}</button></div>` : '';
            return `<div class="tbd-row${depth ? ' tbd-variant' : ''}" data-i="${i}" style="--tbd-depth:${depth}">
                <div class="tbd-row-main">
                    <div class="tbd-row-text"><div class="tbd-name">${depth ? '<span class="tbd-branch">↳</span>' : ''}${escapeHtml(r.name)}${reading && r.read ? `<span class="tbd-read">${escapeHtml(r.read)}</span>` : ''}${tag}</div>${r.note ? `<div class="tbd-note">${escapeHtml(r.note)}</div>` : ''}</div>
                    <button class="tbd-icon-btn tbd-refine${menuFor === r ? ' tbd-on' : ''}" title="${escapeHtml(L.refineBtn)}" aria-label="${escapeHtml(L.refineBtn)}"${refining ? ' disabled' : ''}><i class="fa-solid fa-wand-magic-sparkles"></i></button>
                    <button class="tbd-icon-btn tbd-reroll" title="${escapeHtml(L.rerollBtn)}" aria-label="${escapeHtml(L.rerollBtn)}"${refining ? ' disabled' : ''}><i class="fa-solid fa-rotate-right"></i></button>
                    <button class="tbd-icon-btn tbd-copy" title="${escapeHtml(L.copy)}" aria-label="${escapeHtml(L.copy)}"><i class="fa-regular fa-copy"></i></button>
                    <button class="tbd-icon-btn tbd-insert" title="${escapeHtml(L.insert)}" aria-label="${escapeHtml(L.insert)}"><i class="fa-solid fa-pen-to-square"></i></button>
                </div>${menu}${working}
            </div>`;
        }).join('');
    }

    function footerHtml() {
        const L = T();
        const again = results.length && !busy && !refining ? `<button id="tbd_again" class="tbd-small-btn"><i class="fa-solid fa-rotate"></i> ${escapeHtml(L.again)}</button>` : '';
        return `<span class="tbd-status tbd-status-${status.kind}">${escapeHtml(status.text)}</span>${again}`;
    }

    function panelClasses(st = settings()) {
        return `tbd-panel tbd-theme-${st.theme}${st.effects ? '' : ' tbd-fx-off'}`;
    }

    function render() {
        const st = settings();
        const $p = $('#tbd_panel');
        if (!$p.length) return;
        $p.attr('class', panelClasses(st));
        if (view === 'settings') {
            $p.html(`${headerHtml(st.theme)}<div class="tbd-psettings">${settingsFieldsHtml('p')}
                <button id="tbd_back" class="tbd-go"><i class="fa-solid fa-arrow-left"></i> ${escapeHtml(T().back)}</button></div>`);
            syncSettingFields();
            fillProfileSelects();
            return;
        }
        $p.html(`${headerHtml(st.theme)}${formHtml(st.form)}
            <div class="tbd-results" id="tbd_results">${resultsHtml()}</div>
            <div class="tbd-foot" id="tbd_foot">${footerHtml()}</div>`);
        if (busy) runLoadingLog();
    }

    function renderResultsOnly() {
        $('#tbd_results').html(resultsHtml());
        $('#tbd_foot').html(footerHtml());
        $('#tbd_go').text(busy ? T().cancel : T().find);
        if (busy) runLoadingLog();
    }

    function runLoadingLog() {
        clearInterval(loadingTimer);
        const lines = (THEME_TEXT[settings().theme] || THEME_TEXT.st).loading;
        let i = 0;
        const step = () => {
            const $log = $('#tbd_log');
            if (!$log.length || !busy) { clearInterval(loadingTimer); return; }
            if (i < lines.length) $log.append(`<div>${escapeHtml(lines[i++])}</div>`);
            else clearInterval(loadingTimer);
        };
        step();
        loadingTimer = setInterval(step, 700);
    }

    function openPanel() {
        if (!$('#tbd_panel').length) $('body').append('<div id="tbd_panel" role="dialog" aria-modal="false"></div>');
        view = 'form';
        render();
        $('#tbd_panel').show();
    }
    function closePanel() { $('#tbd_panel').hide(); }

    function readForm() {
        const st = settings();
        if (!$('#tbd_target').length) return st.form; // the ⚙ page is showing
        const target = $('#tbd_target').val() || 'person';
        const kindVal = $('#tbd_kind').length ? $('#tbd_kind').val() : st.form.kind;
        st.form = {
            target,
            kind: normalizeKind(target, kindVal),
            kindText: String($('#tbd_kindtext').val() ?? st.form.kindText ?? '').slice(0, DETAIL_MAX),
            vibe: $('#tbd_vibe').val() || 'fantasy',
            customVibe: String($('#tbd_custom').val() || '').slice(0, 80),
            gender: $('#tbd_gender').val() || 'any',
            length: $('#tbd_length').val() || 'any',
            sound: $('#tbd_sound').val() || 'any',
            mustContain: String($('#tbd_must').val() || '').trim().slice(0, 20),
        };
        save();
        return st.form;
    }

    // ---------- actions ----------
    async function generate() {
        if (busy) { cancel(); return; }
        stopRefine();
        menuFor = null;
        const st = settings();
        const form = readForm();
        const lang = detectLang();
        const count = st.count;
        const avoid = avoidList(st);
        const messages = buildMessages(form, rollSeeds(count, form), { lang, avoid, reading: !!st.showReading });

        busy = true;
        controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const myController = controller;
        status = { kind: 'busy', text: '' };
        renderResultsOnly();
        try {
            const raw = await requestLLM(messages, { profileId: st.profileId, maxTokens: tokensFor(count, st), signal: myController?.signal });
            if (myController && myController.signal.aborted) return;
            if (controller !== myController) return;
            const parsed = parseNames(raw);
            const kept = filterNames(parsed, avoid);
            if (!parsed.length) {
                status = { kind: 'error', text: T().err(T().parseFail) };
            } else if (!kept.length) {
                status = { kind: 'error', text: T().err(T().allFiltered) };
            } else {
                const used = { ...form };
                results = kept.slice(0, count).map(k => ({ ...k, form: used }));
                rememberNames(results.map(r => r.name), st);
                save();
                status = { kind: 'ok', text: T().found(results.length) };
            }
        } catch (e) {
            if (controller !== myController) return;
            if (myController?.signal.aborted || e?.name === 'AbortError') status = { kind: 'error', text: T().cancelled };
            else status = { kind: 'error', text: T().err(String(e?.message || e || 'unknown error').slice(0, 160)) };
        } finally {
            if (controller === myController) {
                busy = false;
                controller = null;
                renderResultsOnly();
            }
        }
    }

    // ---------- reshape one name ----------
    function stopRefine() {
        if (!refining) return;
        refining.ctl?.abort();
        refining = null;
    }

    async function refine(src, mode) {
        if (busy || refining || !results.includes(src) || !REFINE_DESC[mode]) return;
        const st = settings();
        const L = T();
        const avoid = [...new Set([...avoidList(st), ...results.map(r => r.name)])];
        const messages = buildRefineMessages(src, mode, src.form || st.form, { lang: detectLang(), avoid, reading: !!st.showReading });
        const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const job = { src, mode, ctl, kind: 'refine' };
        refining = job;
        menuFor = null;
        status = { kind: 'busy', text: '' };
        renderResultsOnly();
        try {
            const raw = await requestLLM(messages, { profileId: st.profileId, maxTokens: tokensFor(3, st), signal: ctl?.signal });
            if (refining !== job) return;
            const parsed = parseNames(raw);
            const kept = filterNames(parsed, avoid).slice(0, 3);
            const at = results.indexOf(src);
            if (!parsed.length) status = { kind: 'error', text: L.err(L.parseFail) };
            else if (!kept.length) status = { kind: 'error', text: L.err(L.allFiltered) };
            else if (at !== -1) {
                // Put the variants under their source, after any variants it already has.
                const depth = src.depth || 0;
                let j = at + 1;
                while (j < results.length && (results[j].depth || 0) > depth) j++;
                results.splice(j, 0, ...kept.map(k => ({ ...k, depth: Math.min(depth + 1, 3), tag: mode, from: src, form: src.form })));
                rememberNames(kept.map(k => k.name), st);
                save();
                status = { kind: 'ok', text: L.variants(kept.length) };
            }
        } catch (e) {
            if (refining !== job) return;
            if (ctl?.signal.aborted || e?.name === 'AbortError') status = { kind: 'error', text: L.cancelled };
            else status = { kind: 'error', text: L.err(String(e?.message || e || 'unknown error').slice(0, 160)) };
        } finally {
            if (refining === job) {
                refining = null;
                renderResultsOnly();
            }
        }
    }

    // Swap one name for a new one made the same way. A variant is remade from its source
    // in the same direction; a first-round name is remade with the search it came from.
    async function reroll(src) {
        if (busy || refining || !results.includes(src)) return;
        const st = settings();
        const L = T();
        const lang = detectLang();
        const form = src.form || st.form;
        const avoid = [...new Set([...avoidList(st), ...results.map(r => r.name)])];
        const isVariant = (src.depth || 0) > 0 && src.from && REFINE_DESC[src.tag];
        const messages = isVariant
            ? buildRefineMessages(src.from, src.tag, form, { lang, avoid, count: 1, reading: !!st.showReading })
            : buildMessages(form, rollSeeds(1, form), { lang, avoid, reading: !!st.showReading });
        const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const job = { src, ctl, kind: 'reroll' };
        refining = job;
        menuFor = null;
        status = { kind: 'busy', text: '' };
        renderResultsOnly();
        try {
            const raw = await requestLLM(messages, { profileId: st.profileId, maxTokens: tokensFor(1, st), signal: ctl?.signal });
            if (refining !== job) return;
            const parsed = parseNames(raw);
            const kept = filterNames(parsed, avoid);
            const at = results.indexOf(src);
            if (!parsed.length) status = { kind: 'error', text: L.err(L.parseFail) };
            else if (!kept.length) status = { kind: 'error', text: L.err(L.allFiltered) };
            else if (at !== -1) {
                const fresh = { ...src, name: kept[0].name, note: kept[0].note, read: kept[0].read };
                // Variants hanging under the old name no longer fit, so they go with it.
                const depth = src.depth || 0;
                let end = at + 1;
                while (end < results.length && (results[end].depth || 0) > depth) end++;
                results.splice(at, end - at, fresh);
                rememberNames([fresh.name], st);
                save();
                status = { kind: 'ok', text: L.rerolled };
            }
        } catch (e) {
            if (refining !== job) return;
            if (ctl?.signal.aborted || e?.name === 'AbortError') status = { kind: 'error', text: L.cancelled };
            else status = { kind: 'error', text: L.err(String(e?.message || e || 'unknown error').slice(0, 160)) };
        } finally {
            if (refining === job) {
                refining = null;
                renderResultsOnly();
            }
        }
    }

    function cancel() {
        if (!busy) return;
        controller?.abort();
        controller = null;
        busy = false;
        status = { kind: 'error', text: T().cancelled };
        renderResultsOnly();
    }

    async function copyText(text) {
        try {
            if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return true; }
        } catch { /* try the old way */ }
        try {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            const ok = document.execCommand('copy');
            ta.remove();
            return ok;
        } catch { return false; }
    }

    // Put the name where the cursor is, without wiping what's already typed.
    function insertAtCursor(text) {
        const ta = document.getElementById('send_textarea');
        if (!ta) return false;
        const v = ta.value || '';
        const startPos = Number.isInteger(ta.selectionStart) ? ta.selectionStart : v.length;
        const endPos = Number.isInteger(ta.selectionEnd) ? ta.selectionEnd : v.length;
        const before = v.slice(0, startPos);
        const after = v.slice(endPos);
        const pad = before && !/\s$/.test(before) ? ' ' : '';
        ta.value = before + pad + text + after;
        const caret = (before + pad + text).length;
        try { ta.setSelectionRange(caret, caret); } catch { /* some inputs don't allow it */ }
        ta.dispatchEvent(new Event('input', { bubbles: true }));
        ta.focus();
        return true;
    }

    // ---------- settings (left drawer and the ⚙ page share the same fields) ----------
    function settingsFieldsHtml(prefix) {
        const L = T();
        const st = settings();
        const inPanel = prefix === 'p';
        const id = k => `tbd_${prefix}_${k}`;
        const sel = (k, inner) => {
            const el = `<select id="${id(k)}" class="text_pole" data-tbd-set="${k}">${inner}</select>`;
            return inPanel ? `<span class="tbd-select">${el}</span>` : el;
        };
        const langOpts = `<option value="auto">${escapeHtml(L.sLangAuto)}</option><option value="en">English</option><option value="ko">한국어</option>`;
        return `<label for="${id('lang')}">${escapeHtml(L.sLang)}</label>${sel('lang', langOpts)}
            <label for="${id('profile')}">${escapeHtml(L.sProfile)}</label>${sel('profile', '')}
            <label for="${id('count')}">${escapeHtml(L.sCount)}</label>
            <input id="${id('count')}" class="text_pole" type="number" min="1" max="30" step="1" data-tbd-set="count">
            <label for="${id('tokens')}">${escapeHtml(L.sTokens)}</label>
            <input id="${id('tokens')}" class="text_pole" type="number" min="200" max="16000" step="100" data-tbd-set="tokens">
            <small>${escapeHtml(L.sTokensHint)}</small>
            <label for="${id('theme')}">${escapeHtml(L.sTheme)}</label>${sel('theme', optionList(L.th, st.theme))}
            <label class="checkbox_label"><input id="${id('fx')}" type="checkbox" data-tbd-set="fx"><span>${escapeHtml(L.sEffects)}</span></label>
            <label class="checkbox_label"><input id="${id('reading')}" type="checkbox" data-tbd-set="reading"><span>${escapeHtml(L.sReading)}</span></label>
            <label class="checkbox_label"><input id="${id('hist')}" type="checkbox" data-tbd-set="hist"><span>${escapeHtml(L.sHistory)}</span></label>
            <div><button type="button" class="${inPanel ? 'tbd-small-btn' : 'menu_button'} tbd-hist-clear">${escapeHtml(L.sHistoryClear)}</button></div>
            <label for="${id('ban')}">${escapeHtml(L.sBan)}</label>
            <textarea id="${id('ban')}" class="text_pole" rows="3" data-tbd-set="ban"></textarea>
            <small>${escapeHtml(L.sBanHint)}</small>`;
    }

    function settingsHtml() {
        return `<div id="tbd_settings" class="tbd-settings">
            <div class="inline-drawer">
                <div class="inline-drawer-toggle inline-drawer-header">
                    <b>${escapeHtml(T().sTitle)}</b>
                    <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
                </div>
                <div class="inline-drawer-content">${settingsFieldsHtml('s')}</div>
            </div>
        </div>`;
    }

    // Put the saved values into every copy of the fields (drawer and ⚙ page), except the one being typed in.
    function syncSettingFields(except = null) {
        const st = settings();
        const values = {
            lang: st.language, profile: st.profileId, count: st.count, tokens: st.maxTokens, theme: st.theme, ban: st.banList,
        };
        const checks = { fx: !!st.effects, reading: !!st.showReading, hist: !!st.rememberHistory };
        $('[data-tbd-set]').each(function () {
            if (this === except) return;
            const key = this.getAttribute('data-tbd-set');
            if (key in checks) $(this).prop('checked', checks[key]);
            else if (key !== 'profile' && key in values) $(this).val(values[key]);
        });
    }

    function fillProfileSelects() {
        const st = settings();
        const L = T();
        const profiles = getProfiles();
        $('[data-tbd-set="profile"]').each(function () {
            const $sel = $(this);
            $sel.empty();
            $sel.append(`<option value="">${escapeHtml(L.sProfileCurrent)}</option>`);
            for (const p of profiles) $sel.append(`<option value="${escapeHtml(p.id)}">${escapeHtml(p.name)}</option>`);
            // Keep the saved choice even if the list is empty right now.
            if (st.profileId && !profiles.some(p => p.id === st.profileId)) {
                $sel.append(`<option value="${escapeHtml(st.profileId)}">${escapeHtml(L.sProfileMissing)}</option>`);
            }
            $sel.val(st.profileId);
        });
    }

    function rebuildDrawer() {
        $('#tbd_settings').remove();
        settingsSlot().append(settingsHtml());
        syncSettingFields();
        fillProfileSelects();
    }

    function applySetting(el, type) {
        const st = settings();
        const key = el.getAttribute('data-tbd-set');
        // Text box saves while typing; everything else on change (selects fire both events).
        if ((type === 'input') !== (key === 'ban')) return;
        const $el = $(el);
        switch (key) {
            case 'lang':
                st.language = $el.val();
                save();
                rebuildDrawer();
                $('#tbd_menu_label').text(T().menu);
                render();
                return;
            case 'profile': st.profileId = String($el.val() || ''); break;
            case 'count': st.count = clampInt($el.val(), 1, 30, 5); $el.val(st.count); break;
            case 'tokens': st.maxTokens = clampInt($el.val(), 200, 16000, 1000); $el.val(st.maxTokens); break;
            case 'theme': st.theme = THEMES.includes($el.val()) ? $el.val() : 'st'; save(); render(); syncSettingFields(); return;
            case 'fx': st.effects = !!$el.prop('checked'); save(); render(); syncSettingFields(); return;
            case 'reading': st.showReading = !!$el.prop('checked'); save(); render(); syncSettingFields(); return;
            case 'hist': st.rememberHistory = !!$el.prop('checked'); break;
            case 'ban': st.banList = String($el.val() || ''); break;
            default: return;
        }
        save();
        if (key === 'profile') fillProfileSelects();
        syncSettingFields(el);
    }

    // ---------- start ----------
    // The settings drawer goes in the LEFT column, in a spot taken as soon as this file loads,
    // so it sits where manifest.json's loading_order puts it (and stays there when rebuilt).
    function settingsColumn() {
        return $('#extensions_settings').length ? $('#extensions_settings') : $('#extensions_settings2');
    }
    let slot = null;
    function settingsSlot() {
        if (!slot || !slot.closest('body').length) {
            slot = $('#tbd_settings_slot');
            if (!slot.length) slot = $('<div id="tbd_settings_slot"></div>').appendTo(settingsColumn());
        }
        return slot;
    }

    function addMenuItem() {
        if ($('#tbd_menu').length) return true;
        const $menu = $('#extensionsMenu');
        if (!$menu.length) return false;
        $menu.append(`<div id="tbd_menu" class="list-group-item flex-container flexGap5">
            <div class="fa-solid fa-signature extensionsMenuExtensionButton"></div><span id="tbd_menu_label">${escapeHtml(T().menu)}</span></div>`);
        return true;
    }

    function init() {
        settings();
        settingsSlot().append(settingsHtml());
        syncSettingFields();
        fillProfileSelects();

        if (!addMenuItem()) {
            // The wand menu can appear a little later on slow loads.
            let tries = 0;
            const timer = setInterval(() => { if (addMenuItem() || ++tries > 20) clearInterval(timer); }, 500);
        }

        const $doc = $(document);
        $doc.on('click', '#tbd_menu', () => openPanel());
        $doc.on('click', '#tbd_close', closePanel);
        $doc.on('click', '#tbd_gear', () => { readForm(); view = view === 'settings' ? 'form' : 'settings'; render(); });
        $doc.on('click', '#tbd_back', () => { view = 'form'; render(); });
        $doc.on('change input', '[data-tbd-set]', function (e) { applySetting(this, e.type); });
        $doc.on('focusin', '[data-tbd-set="profile"]', function () { if (!this.options || this.options.length <= 1) fillProfileSelects(); });
        $doc.on('click', '.tbd-hist-clear', () => { settings().history = []; save(); toastr.info(T().sHistoryCleared, 'TBD'); });
        $doc.on('click', '#tbd_go', generate);
        $doc.on('click', '#tbd_again', generate);
        $doc.on('change', '#tbd_target', () => { readForm(); render(); });
        $doc.on('change', '#tbd_kind', () => readForm());
        $doc.on('change', '#tbd_vibe', function () { $('#tbd_custom_wrap').prop('hidden', $(this).val() !== 'custom'); readForm(); });
        $doc.on('change', '#tbd_gender, #tbd_length, #tbd_sound, #tbd_custom, #tbd_must, #tbd_kindtext', readForm);
        $doc.on('click', '#tbd_panel .tbd-refine', function () {
            if (refining) return;
            const r = results[Number($(this).closest('.tbd-row').data('i'))];
            menuFor = menuFor === r ? null : (r || null);
            renderResultsOnly();
        });
        $doc.on('click', '#tbd_panel .tbd-reroll', function () {
            const r = results[Number($(this).closest('.tbd-row').data('i'))];
            if (r) reroll(r);
        });
        $doc.on('click', '#tbd_panel .tbd-refine-pick', function () {
            const r = results[Number($(this).closest('.tbd-row').data('i'))];
            if (r) refine(r, String($(this).data('mode')));
        });
        $doc.on('click', '#tbd_panel .tbd-refine-cancel', () => {
            if (!refining) return;
            stopRefine();
            status = { kind: 'error', text: T().cancelled };
            renderResultsOnly();
        });
        $doc.on('keydown', '#tbd_must, #tbd_custom, #tbd_kindtext', (e) => { if (e.key === 'Enter') { e.preventDefault(); generate(); } });
        $doc.on('keydown', (e) => { if (e.key === 'Escape' && $('#tbd_panel').is(':visible')) closePanel(); });
        $doc.on('click', '#tbd_panel .tbd-copy', async function () {
            const r = results[Number($(this).closest('.tbd-row').data('i'))];
            if (!r) return;
            if (await copyText(r.name)) toastr.success(T().copied, 'TBD');
            else toastr.warning(T().copyFail, 'TBD');
        });
        $doc.on('click', '#tbd_panel .tbd-insert', function () {
            const r = results[Number($(this).closest('.tbd-row').data('i'))];
            if (!r) return;
            if (insertAtCursor(r.name)) toastr.success(T().inserted, 'TBD');
            else toastr.info(T().noChat, 'TBD');
        });
    }

    // Tests load this file without SillyTavern and call the pieces directly.
    if (globalThis.__TBD_TEST__) {
        globalThis.__TBD_TEST__.api = {
            rollSeeds, buildMessages, buildRefineMessages, REFINE_MODES, parseNames, filterNames, avoidList, rememberNames, detectLang,
            tokensFor, insertAtCursor, settings, STRINGS, THEMES, CLICHES, KINDS, targetText, SPARKS, normalizeKind,
        };
    } else {
        if (typeof $ === 'function' && document.body) settingsSlot();
        jQuery(() => init());
    }
})();
