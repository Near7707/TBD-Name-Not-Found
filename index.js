// TBD — Name Not Found v0.2.0
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
            like: 'Like this (optional)', likePh: 'e.g. Elric, Aldous', likeMode: 'Alike in', likeModes: { sound: 'Sound', feel: 'Feel' },
            find: 'Find names', cancel: 'Cancel', again: 'Roll again',
            copy: 'Copy', close: 'Close',
            copied: 'Copied', copyFail: "Couldn't copy. Select the text and copy it yourself.",
            empty: 'Pick your conditions and press "Find names".',
            parseFail: "The AI's answer couldn't be read. Try again.",
            allFiltered: 'Every name was on the avoid list. Try again.',
            found: n => `200 OK — ${n} name${n === 1 ? '' : 's'} found`,
            foundCut: n => `206 — the answer was cut off; ${n} name${n === 1 ? '' : 's'} saved. Raise "Max response tokens" in settings.`,
            cutFail: 'The answer was cut off. Raise "Max response tokens" in settings and try again.',
            thinkFail: 'The AI only thought and wrote no answer. Set "Thinking effort" to Low in settings, or raise "Max response tokens".',
            emptyFail: 'The AI sent back an empty answer. A thinking model may have spent every token on thinking: set "Thinking effort" to Low or raise "Max response tokens". With a connection profile, also keep "Send the connection profile\'s preset too" off.',
            showRaw: 'See the answer', hideRaw: 'Hide the answer', rawEmpty: '(empty — no thinking and no answer came back)',
            sThink: 'Thinking effort (thinking models)', sThinkOpts: { default: "Default (don't send)", min: 'Minimal', low: 'Low', medium: 'Medium', high: 'High' },
            sThinkHint: 'Naming needs little thinking. If a thinking model answers empty or slowly, pick Low. Leave on Default for other models. On a Custom (OpenAI-compatible) connection, SillyTavern sends this only for OpenAI models: use the service\'s own connection (like NanoGPT), or pick a non-thinking model. Minimal asks the model not to think at all, so models that always think may refuse it: use Low then. If this seems to do nothing, another extension may be changing the request on its way out.',
            sPreset: "Send the connection profile's preset too", sPresetHint: 'Off by default. A roleplay preset can make the AI answer empty or in character. Turn on only if your model needs its preset.',
            err: m => `500 — ${m}`,
            cancelled: '499 — cancelled',
            busy: 'Already searching. Wait or cancel first.',
            noProfileApi: "This SillyTavern version can't send requests with a connection profile.",
            t: { person: 'Person', place: 'Place', shop: 'Shop', item: 'Item', other: 'Other' },
            v: { fantasy: 'Fantasy', medieval: 'Medieval', scifi: 'Sci-fi / cyber', modern: 'Modern', gothic: 'Gothic', cozy: 'Cozy / whimsical', myth: 'Myth & legend', game: 'Fantasy game', cosmic: 'Lovecraftian', weird: 'Weird', custom: 'Custom…' },
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
            parts: 'Name parts', extras: 'Extras', more: 'More options',
            pc: { given: 'Given', middle: 'Middle', family: 'Family' },
            ex: { title: 'Title', particle: 'Noble particle', origin: 'Place of origin', patronymic: "Father's-name surname", epithet: 'Nickname / epithet', religious: 'Religious name', codename: 'Codename', alias: 'Alias / stage name' },
            fixedFamily: 'Keep this family name (optional)', fixedFamilyPh: 'e.g. Holloway',
            realNames: 'Real names', realOpts: { invented: 'Invented only', near: 'Close to real names', mix: 'Mix in real names', only: 'Real names only' },
            realTag: 'real', realTip: 'The AI says real people use this name. It can be wrong: check with 🔎.',
            checkBtn: 'Check this name (Wikipedia)', checking: 'Checking Wikipedia…', checkFail: "Couldn't reach Wikipedia.",
            checkNone: '✓ no page', checkMany: 'several pages with this name', checkNamePage: 'a page about the name (people use it)',
            checkFull: 'Full', checkWiki: 'Wikipedia', checkEn: 'English Wikipedia', checkKo: 'Korean Wikipedia',
            checkGoogle: 'Search Google', checkAsk: 'Ask the AI too', checkAsking: 'Asking…', checkAiTag: 'AI guess', checkAiEmpty: '(no answer)',
            clicheTag: 'AI favorite', clicheTip: 'A name AI models hand out very often.',
            canonTag: 'Lovecraft', canonTip: "A name from Lovecraft's own stories.",
            method: 'Made with', methods: { ai: 'AI', cache: 'Cache' }, rootsLabel: 'Roots', ckLabel: 'Kind of name',
            roots: { latin: 'Latin', oldenglish: 'Old English', norman: 'Norman / French', germanic: 'Germanic', celtic: 'Celtic', norse: 'Norse' },
            ck: { common: 'Common name', noble: 'Noble house', religious: 'Monastic / saint' },
            fragments: 'fragments', cacheTag: 'CACHE', cacheTip: 'Built from name fragments. No AI was used.',
            foundCache: n => `200 OK — ${n} name${n === 1 ? '' : 's'} from cache`,
            cacheEmpty: 'No new names left in the cache for these choices. Try other roots or conditions.',
            nicks: 'Nicknames', nickCopy: 'Copy this nickname',
            copyPiece: 'Copy this part', rerollPiece: 'Swap just this part', rerollingPiece: 'Swapping one part…', pieceRerolled: '200 OK — part swapped',
            gear: 'Settings', back: 'Back',
            // settings
            sTitle: 'TBD — Name Not Found',
            sLang: 'Language', sLangAuto: 'Follow SillyTavern',
            sProfile: 'Connection profile', sProfileCurrent: '(Use current API)', sProfileMissing: '⚠️ Profile not found — pick again',
            sCount: 'Names per search (1–30)',
            sTokens: 'Max response tokens',
            sTokensHint: 'Raised automatically for big batches. Thinking models may need more, but a very high limit can let them think for a long time: set it just high enough that answers aren\'t cut off. Lower it for a very small local model.',
            sTheme: 'Theme', sEffects: 'Moving effects (glitch, flicker, scanlines)',
            sReading: 'Show how to read each name',
            sCheck: 'Check new names automatically (Wikipedia)', sCheckHint: 'Looks each new name up on Wikipedia and shows ⚠ only when a page has the same name. The names are sent to Wikipedia; 🔎 does the same, only when you tap it. This is not a legal trademark check.',
            sNicks: 'Show nicknames (people)', sNicksHint: 'Each person name also comes with 2–3 nicknames. Uses a few more tokens.',
            sWords: 'Names that are plain English words (Wren, Ox)',
            sWordOpts: { mark: 'Mark them', filter: 'Leave them out' },
            wordTag: ws => `word: ${ws.map(w => w.word).join(', ')}`,
            wordTip: 'This is an existing English word. Keep it, or reshape it with ✨.',
            sHistory: 'Avoid names I already got',
            sHistoryClear: 'Forget past names', sHistoryCleared: 'Past names forgotten',
            sHistoryShow: 'See past names ({n})', sHistoryEmpty: 'No past names yet.', sHistoryRemove: 'Forget this one',
            sBan: 'Names to always avoid (comma or new line)',
            sBanHint: 'Common AI picks are already avoided.',
            th: { st: 'Follow SillyTavern', terminal: 'Terminal', bsod: 'Blue screen', panic: 'Kernel panic', glass: 'Glass (dark)', glasslight: 'Glass (clear)', oldwin: 'Old error box', tape: 'Warning tape', neon: 'Neon glitch' },
        },
        ko: {
            menu: 'TBD: 이름 짓기',
            tagline: "Name Not Found. Let's make one!", // kept in English on purpose (part of the 404 look)
            target: '대상', vibe: '분위기', gender: '성별', length: '길이', sound: '소리 느낌', mustContain: '꼭 들어갈 글자',
            customVibePh: '예: 안개 낀 항구 마을', mustContainPh: '예: ren',
            like: '비슷하게 (안 써도 됨)', likePh: '예: Elric, Aldous', likeMode: '어떻게 비슷하게', likeModes: { sound: '소리', feel: '느낌' },
            find: '이름 찾기', cancel: '취소', again: '다시 뽑기',
            copy: '복사', close: '닫기',
            copied: '복사했어요', copyFail: '복사가 안 됐어요. 글자를 직접 골라서 복사해 주세요.',
            empty: '조건을 고르고 "이름 찾기"를 눌러 보세요.',
            parseFail: 'AI 답을 읽지 못했어요. 다시 해 보세요.',
            allFiltered: '나온 이름이 전부 피할 목록에 있었어요. 다시 해 보세요.',
            found: n => `200 OK — 이름 ${n}개 찾음`,
            foundCut: n => `206 — 답이 중간에 잘려서 ${n}개만 건졌어요. 설정에서 최대 응답 토큰을 늘려 보세요.`,
            cutFail: '답이 중간에 잘렸어요. 설정에서 최대 응답 토큰을 늘리고 다시 해 보세요.',
            thinkFail: 'AI가 생각만 하고 답을 안 썼어요. 설정에서 "생각 정도"를 낮게로 바꾸거나 최대 응답 토큰을 늘려 보세요.',
            emptyFail: 'AI가 빈 답을 보냈어요. 생각하는 모델이 토큰을 생각에 다 썼을 수 있어요. 설정에서 "생각 정도"를 낮게로 바꾸거나 최대 응답 토큰을 늘려 보세요. 연결 프로필을 쓰면 "연결 프로필의 프리셋도 같이 보내기"는 꺼 두세요.',
            showRaw: '받은 답 보기', hideRaw: '받은 답 접기', rawEmpty: '(비어 있음 — 생각도 답도 안 왔어요)',
            sThink: '생각 정도 (생각하는 모델용)', sThinkOpts: { default: '기본 (안 보냄)', min: '최소', low: '낮게', medium: '보통', high: '높게' },
            sThinkHint: '이름 짓기는 길게 생각할 필요가 없어요. 생각하는 모델이 빈 답을 보내거나 느리면 "낮게"로 두세요. 다른 모델은 기본 그대로 두면 돼요. Custom(OpenAI 호환) 연결에선 실리태번이 OpenAI 모델에만 이 값을 보내요. NanoGPT 같은 전용 연결을 쓰거나, 생각 안 하는 모델을 고르세요. "최소"는 생각을 아예 하지 말라는 뜻이라, 항상 생각하는 모델은 거절할 수 있어요. 그럴 땐 "낮게"로 두세요. 설정이 안 먹히는 것 같으면 다른 확장이 요청을 가로채고 있을 수 있어요.',
            sPreset: '연결 프로필의 프리셋도 같이 보내기', sPresetHint: '기본은 꺼짐이에요. 롤플레이 프리셋을 같이 보내면 AI가 빈 답이나 롤플레이로 답할 수 있어요. 모델에 프리셋이 꼭 필요할 때만 켜세요.',
            err: m => `500 — ${m}`,
            cancelled: '499 — 취소함',
            busy: '이미 찾는 중이에요. 기다리거나 먼저 취소해 주세요.',
            noProfileApi: '이 실리태번 버전에선 연결 프로필로 요청할 수 없어요.',
            t: { person: '사람', place: '장소', shop: '가게', item: '아이템', other: '기타' },
            v: { fantasy: '판타지', medieval: '중세', scifi: 'SF / 사이버', modern: '현대', gothic: '고딕', cozy: '포근한', myth: '신화·전설', game: '판타지 게임', cosmic: '러브크래프트풍', weird: '기묘한', custom: '직접 쓰기…' },
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
            parts: '이름 구성', extras: '특수한 이름', more: '조건 더 보기',
            pc: { given: '이름', middle: '미들네임', family: '성' },
            ex: { title: '직함·존칭', particle: '귀족 표시', origin: '출신지', patronymic: '아버지 이름 성', epithet: '별명·칭호', religious: '세례명·수도명', codename: '코드네임', alias: '가명·예명' },
            fixedFamily: '성 고정 (안 써도 됨)', fixedFamilyPh: '예: Holloway',
            realNames: '실제 이름', realOpts: { invented: '지어낸 이름만', near: '실제 이름 비슷하게', mix: '실제 이름도 섞기', only: '실제 이름만' },
            realTag: '실제', realTip: 'AI가 실제로 쓰는 이름이라고 했어요. 틀릴 수 있으니 🔎로 확인해 보세요.',
            checkBtn: '이름 확인 (위키백과)', checking: '위키백과 찾는 중…', checkFail: '위키백과에 연결하지 못했어요',
            checkNone: '✓ 없음', checkMany: '같은 이름 여러 개', checkNamePage: '이름 문서 (실제로 쓰는 이름)',
            checkFull: '전체', checkWiki: '위키백과', checkEn: '영어 위키', checkKo: '한국어 위키',
            checkGoogle: '구글에서 보기', checkAsk: 'AI에게도 묻기', checkAsking: '묻는 중…', checkAiTag: 'AI 추정', checkAiEmpty: '(답 없음)',
            clicheTag: 'AI 단골', clicheTip: 'AI가 아주 자주 내는 이름이에요.',
            canonTag: '원작', canonTip: '러브크래프트 원작에 나오는 이름이에요.',
            method: '만드는 방식', methods: { ai: 'AI', cache: 'Cache' }, rootsLabel: '뿌리', ckLabel: '이름 종류',
            roots: { latin: '라틴', oldenglish: '옛 영어', norman: '노르만·프랑스', germanic: '게르만', celtic: '켈트', norse: '북유럽' },
            ck: { common: '일반 인명', noble: '귀족 가문', religious: '수도원·성인' },
            fragments: 'fragments', cacheTag: 'CACHE', cacheTip: '이름 조각으로 만든 이름이에요. AI는 안 썼어요.',
            foundCache: n => `200 OK — 캐시에서 이름 ${n}개 찾음`,
            cacheEmpty: '이 조건으론 캐시에서 새 이름을 더 못 찾았어요. 뿌리나 조건을 바꿔 보세요.',
            nicks: '애칭', nickCopy: '이 애칭 복사',
            copyPiece: '이 조각 복사', rerollPiece: '이 조각만 다시 뽑기', rerollingPiece: '조각 하나 바꾸는 중…', pieceRerolled: '200 OK — 조각 바꿈',
            gear: '설정', back: '돌아가기',
            sTitle: 'TBD — Name Not Found',
            sLang: '언어', sLangAuto: '실리태번 따라가기',
            sProfile: '연결 프로필', sProfileCurrent: '(현재 연결된 API 사용)', sProfileMissing: '⚠️ 찾을 수 없는 프로필 — 다시 골라 주세요',
            sCount: '한 번에 뽑을 이름 수 (1~30)',
            sTokens: '최대 응답 토큰',
            sTokensHint: '많이 뽑을 땐 자동으로 늘어나요. 생각하는 모델은 더 필요할 수 있지만, 너무 높으면 오래 생각할 수 있어요. 답이 잘리지 않을 만큼만 넉넉히 두세요. 아주 작은 로컬 모델이면 줄이세요.',
            sTheme: '테마', sEffects: '움직이는 효과 (글리치, 깜빡임, 스캔라인)',
            sReading: '이름 읽는 법 보기',
            sCheck: '새 이름 자동으로 확인 (위키백과)', sCheckHint: '이름이 나올 때마다 위키백과에서 찾아, 같은 이름의 문서가 있을 때만 ⚠를 보여 줘요. 이름이 위키백과로 보내져요. 🔎도 누를 때만 똑같이 보내요. 법적인 상표 확인은 아니에요.',
            sNicks: '애칭 보기 (사람 이름)', sNicksHint: '사람 이름마다 애칭 2~3개도 같이 받아요. 토큰을 조금 더 써요.',
            sWords: '평범한 영어 낱말인 이름 (Wren, Ox)',
            sWordOpts: { mark: '표시만 하기', filter: '아예 빼기' },
            wordTag: ws => `낱말: ${ws.map(w => w.ko).join(', ')}`,
            wordTip: '실제 영어 낱말이에요. 그대로 써도 되고, ✨로 바꿔 볼 수도 있어요.',
            sHistory: '이미 나온 이름은 피하기',
            sHistoryClear: '지난 이름 잊기', sHistoryCleared: '지난 이름을 잊었어요',
            sHistoryShow: '지난 이름 보기 ({n}개)', sHistoryEmpty: '아직 지난 이름이 없어요.', sHistoryRemove: '이 이름 잊기',
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

    // Everyday English words AI likes to pass off as names (Wren, Ox). Not banned: just marked,
    // or filtered if the user asks. "word=Korean meaning", split by ";".
    const WORD_NAMES = new Map((
        'wren=굴뚝새;robin=울새;finch=되새;sparrow=참새;raven=큰까마귀;rook=떼까마귀;crow=까마귀;jay=어치;lark=종다리;swift=칼새;swallow=제비;' +
        'heron=왜가리;crane=두루미;hawk=매;falcon=송골매;kestrel=황조롱이;merlin=쇠황조롱이;owl=부엉이;dove=비둘기;starling=찌르레기;magpie=까치;' +
        'kite=솔개;osprey=물수리;egret=백로;ibis=따오기;linnet=홍방울새;thrush=지빠귀;plover=물떼새;tern=제비갈매기;gull=갈매기;swan=백조;teal=쇠오리;' +
        'phoenix=불사조;griffin=그리핀;drake=수오리;fox=여우;wolf=늑대;bear=곰;ox=황소;bull=황소;stag=수사슴;hart=수사슴;doe=암사슴;fawn=새끼 사슴;' +
        'elk=엘크;hare=산토끼;lynx=스라소니;otter=수달;badger=오소리;boar=멧돼지;lion=사자;tiger=호랑이;panther=표범;puma=퓨마;jaguar=재규어;' +
        'colt=망아지;mare=암말;pony=조랑말;ram=숫양;lamb=어린 양;mole=두더지;mink=밍크;ermine=흰담비;stoat=담비;weasel=족제비;newt=영원;toad=두꺼비;' +
        'viper=독사;adder=살무사;cobra=코브라;pike=강꼬치고기;trout=송어;moth=나방;wasp=말벌;cricket=귀뚜라미;ash=물푸레나무·재;oak=참나무;elm=느릅나무;' +
        'birch=자작나무;willow=버드나무;hazel=개암나무;alder=오리나무;rowan=마가목;aspen=사시나무;cedar=삼나무;pine=소나무;yew=주목;holly=호랑가시나무;' +
        'ivy=담쟁이;laurel=월계수;myrtle=도금양;olive=올리브;maple=단풍나무;linden=보리수;heather=헤더;fern=고사리;moss=이끼;reed=갈대;sage=세이지;' +
        'basil=바질;thyme=백리향;clover=토끼풀;daisy=데이지;lily=백합;rose=장미;iris=붓꽃;violet=제비꽃;poppy=양귀비;tansy=쑥국화;aster=과꽃;' +
        'dahlia=달리아;jasmine=재스민;lavender=라벤더;lotus=연꽃;orchid=난초;briar=찔레;bramble=가시덤불;thistle=엉겅퀴;nettle=쐐기풀;sorrel=수영;' +
        'saffron=사프란;juniper=노간주나무;hawthorn=산사나무;blossom=꽃;petal=꽃잎;berry=베리;plum=자두;cherry=체리;peach=복숭아;quince=모과;' +
        'amber=호박;jade=옥;jet=흑옥;onyx=오닉스;opal=오팔;pearl=진주;ruby=루비;garnet=석류석;beryl=녹주석;coral=산호;crystal=수정;emerald=에메랄드;' +
        'sapphire=사파이어;topaz=토파즈;jasper=벽옥;agate=마노;flint=부싯돌;slate=점판암;cobalt=코발트;iron=철;steel=강철;silver=은;gold=금;' +
        'copper=구리;storm=폭풍;rain=비;snow=눈;frost=서리;hail=우박;mist=안개;fog=안개;cloud=구름;thunder=천둥;gale=강풍;breeze=산들바람;' +
        'dawn=새벽;dusk=해질녘;night=밤;star=별;sun=해;moon=달;sky=하늘;nova=신성;comet=혜성;aurora=오로라;echo=메아리;ember=불씨;blaze=불길;' +
        'flame=불꽃;spark=불똥;smoke=연기;cinder=타다 남은 재;tide=조수;wave=파도;river=강;brook=시내;lake=호수;marsh=늪;moor=황야;heath=황야;' +
        'glen=골짜기;dale=골짜기;vale=골짜기;ridge=산등성이;cliff=절벽;stone=돌;rock=바위;cove=작은 만;isle=섬;shore=해변;winter=겨울;summer=여름;' +
        'autumn=가을;blue=파랑;red=빨강;grey=회색;gray=회색;scarlet=주홍;crimson=진홍;sable=검은담비·검은색;ivory=상아;indigo=남색;azure=하늘색;' +
        'cyan=청록;umber=암갈색;ochre=황토색;russet=적갈색;hope=희망;faith=믿음;grace=은혜;joy=기쁨;mercy=자비;honor=명예;justice=정의;valor=용맹;' +
        'glory=영광;haven=피난처;bliss=더없는 행복;serenity=평온;harmony=조화;liberty=자유;destiny=운명;fate=운명;rebel=반역자;jinx=징크스;' +
        'vex=성가시게 하다;hex=저주;rune=룬 문자;cipher=암호;glitch=오류;pixel=픽셀;vector=벡터;nexus=연결점;orbit=궤도;zero=영;ace=에이스;blade=칼날;' +
        'arrow=화살;bolt=볼트·번개;'
    ).split(';').filter(Boolean).map(t => { const [w, ko] = t.split('='); return [w, ko]; }));
    // The parts that are meant to be invented (family names, epithets may use real words on purpose).
    const WORD_CHECK_ROLES = ['given', 'middle'];
    function wordHits(r, form = r.form || {}) {
        let texts;
        if (r.pieces) texts = r.pieces.filter(p => WORD_CHECK_ROLES.includes(p.role)).map(p => p.text);
        else if (['person', 'place', 'other'].includes(form.target || 'person')) texts = [r.name];
        else return [];
        return texts.map(t => String(t).trim().toLowerCase()).filter(t => WORD_NAMES.has(t)).map(w => ({ word: w, ko: WORD_NAMES.get(w) }));
    }
    // "Like this" words: up to 5, split on commas or new lines.
    const LIKE_MAX = 60;
    function likeWords(form = {}) {
        return [...new Set(String(form.likeText || '').slice(0, LIKE_MAX).split(/[,，、\n]+/).map(w => w.trim()).filter(Boolean))].slice(0, 5);
    }
    // The typed word itself coming back is no help, so drop exact copies (the whole name, or any invented part).
    function isLikeCopy(n, form) {
        const words = new Set(likeWords(form).map(w => w.toLowerCase()));
        if (!words.size) return false;
        const texts = n.pieces ? n.pieces.filter(p => !p.fixed).map(p => p.text) : [n.name];
        return texts.some(t => words.has(String(t).trim().toLowerCase()));
    }
    // "Real names" (people only): invented only (default) / close to real names / mix in real names / real names only.
    const REAL_MODES = ['invented', 'near', 'mix', 'only'];
    // The parts the choice applies to. Extras (codename, epithet…) stay invented; a kept family name stays as it is.
    const REAL_ROLES = ['given', 'middle', 'family'];
    function realMode(form = {}) {
        return form.target === 'person' && REAL_MODES.includes(form.realNames) ? form.realNames : 'invented';
    }
    function realRoles(form) {
        if (form.target !== 'person') return [];
        const shape = nameShape(form);
        if (!shape) return ['given'];
        return shape.roles.filter(r => REAL_ROLES.includes(r) && !(r === 'family' && shape.fixed));
    }
    // AI models' favorite names. With "real names only" they aren't banned (Luna is a real name), just marked.
    const CLICHE_SET = new Set(CLICHES.map(c => c.toLowerCase()));
    // Game-style favorites: only marked, never avoided (a twist on one can still be nice).
    const SOFT_CLICHES = ['Shadowfang', 'Bloodthorn', 'Aetherion', 'Dragonsbane', 'Soulreaver', 'Doomblade', 'Darkblade',
        'Netherbane', 'Voidheart', 'Shadowbane', 'Nightfall', 'Dreadmaw', 'Bloodmoon', 'Soulfire'];
    // Names from Lovecraft's own stories: marked so a copy is easy to spot. The cosmic vibe also asks not to reuse them.
    const CANON_NAMES = ['Cthulhu', 'Nyarlathotep', 'Azathoth', 'Yog-Sothoth', 'Shub-Niggurath', 'Dagon', 'Hastur', 'Tsathoggua',
        'Nodens', "R'lyeh", 'Innsmouth', 'Arkham', 'Dunwich', 'Kingsport', 'Miskatonic', 'Kadath', 'Yuggoth', 'Leng',
        'Necronomicon', 'Shoggoth', 'Mi-Go', 'Yith'];
    const SOFT_SET = new Set(SOFT_CLICHES.map(c => c.toLowerCase()));
    const CANON_SET = new Set(CANON_NAMES.map(c => c.toLowerCase()));
    function markTexts(r) {
        return r.pieces ? r.pieces.filter(p => REAL_ROLES.includes(p.role)).map(p => p.text) : [r.name];
    }
    function clicheHit(r) {
        return markTexts(r).some(t => { const k = String(t).trim().toLowerCase(); return CLICHE_SET.has(k) || SOFT_SET.has(k); });
    }
    function canonHit(r) {
        return markTexts(r).some(t => CANON_SET.has(String(t).trim().toLowerCase()));
    }
    // "nicks" from the answer: a list (or a comma string), a few short name-like bits, not the name itself.
    function cleanNicks(v, name = '') {
        const list = Array.isArray(v) ? v : typeof v === 'string' ? v.split(/[,·/]/) : [];
        const own = String(name).trim().toLowerCase();
        const out = [];
        for (const x of list) {
            const t = cleanPiece(typeof x === 'string' ? x : '');
            if (!t || t.length > 20 || !looksLikeName(t) || t.toLowerCase() === own) continue;
            if (!out.some(o => o.toLowerCase() === t.toLowerCase())) out.push(t);
        }
        return out.slice(0, 3);
    }
    // Avoid list + repeats + copies of the "like this" words, then real words too when the user chose to filter them.
    // In a real-names mode, a name the AI called real stays even then (Rose is both a word and a real name).
    function keepNames(list, avoid, form, st = settings()) {
        const out = filterNames(list, avoid).filter(n => !isLikeCopy(n, form || {}));
        if (st.wordNames !== 'filter') return out;
        const realOk = realMode(form || {}) !== 'invented';
        return out.filter(n => !wordHits(n, form).length || (realOk && n.real));
    }

    // ---------- name check (🔎) ----------
    // Looks the name up on Wikipedia (exact title only, no key needed). Korean Wikipedia is searched
    // with the Korean reading, and only when the panel is in Korean. Parts of a person's name are checked
    // one by one (a kept family name and extras like codenames are left out).
    const CHECK_ROLES = ['given', 'middle', 'family'];
    function checkTargets(r, lang = 'en') {
        const out = [];
        if (r.pieces) {
            const parts = r.pieces.filter(p => CHECK_ROLES.includes(p.role));
            if (parts.length > 1) out.push({ role: 'full', text: parts.map(p => p.text).join(' '), wiki: 'en' });
            for (const p of parts) if (!p.fixed) out.push({ role: p.role, text: p.text, wiki: 'en' });
            if (!out.length) out.push({ role: 'full', text: r.name, wiki: 'en' });
        } else {
            out.push({ role: 'full', text: r.name, wiki: 'en' });
        }
        const read = String(r.read || '').trim();
        if (lang === 'ko' && read && /[가-힣]/.test(read)) out.push({ role: 'full', text: read, wiki: 'ko' });
        return out.filter(t => String(t.text).trim());
    }
    // A page about the name itself (Rolan: "a given name") just means people really use it.
    const NAME_PAGE = /\b(given name|surname|family name|first name|masculine name|feminine name|unisex name|personal name)\b|(이름이다|성씨|인명|이름의 하나)/i;
    // Turn one api.php answer into title → { kind: 'hit' | 'many' | 'name', title, desc, url }, or null for no page.
    function readWikiAnswer(json, asked) {
        const q = json?.query || {};
        const step = new Map();
        for (const n of q.normalized || []) step.set(n.from, n.to);
        const redir = new Map();
        for (const n of q.redirects || []) redir.set(n.from, n.to);
        const pages = new Map();
        for (const p of q.pages || []) if (p && p.title) pages.set(p.title, p);
        const out = new Map();
        for (const t of asked) {
            let k = step.get(t) || t;
            k = redir.get(k) || k;
            const p = pages.get(k);
            if (!p || p.missing || p.invalid) { out.set(t, null); continue; }
            const props = p.pageprops || {};
            const desc = String(props['wikibase-shortdesc'] || p.extract || '').replace(/\s+/g, ' ').trim().slice(0, 90);
            const kind = 'disambiguation' in props ? 'many' : NAME_PAGE.test(`${desc} ${p.title}`) ? 'name' : 'hit';
            out.set(t, { kind, title: p.title, desc, url: p.fullurl || '' });
        }
        return out;
    }
    const wikiCache = new Map(); // "en:Vistra" → result or null (kept until reload)
    async function wikiLookup(wiki, titles, { signal } = {}) {
        const want = [...new Set(titles.map(t => String(t).trim()).filter(Boolean))];
        const missing = want.filter(t => !wikiCache.has(`${wiki}:${t}`));
        for (let i = 0; i < missing.length; i += 20) {
            const chunk = missing.slice(i, i + 20);
            const url = `https://${wiki}.wikipedia.org/w/api.php?` + new URLSearchParams({
                action: 'query', format: 'json', formatversion: '2', origin: '*', redirects: '1',
                prop: 'pageprops|info|extracts', ppprop: 'disambiguation|wikibase-shortdesc', inprop: 'url',
                exintro: '1', explaintext: '1', exchars: '120', exlimit: '20', titles: chunk.join('|'),
            });
            const res = await fetch(url, { signal });
            if (!res.ok) throw new Error(`Wikipedia ${res.status}`);
            const found = readWikiAnswer(await res.json(), chunk);
            for (const t of chunk) wikiCache.set(`${wiki}:${t}`, found.get(t) ?? null);
        }
        return new Map(want.map(t => [t, wikiCache.get(`${wiki}:${t}`) ?? null]));
    }
    // Check every given result. Results get r.check = { state, items } (items keep their order).
    async function checkNames(list, { quiet = false } = {}) {
        const lang = detectLang();
        // Each result gets its own check object; a result swapped meanwhile simply drops it.
        const jobs = list.map(r => {
            r.check = { ...(r.check || {}), state: 'busy', quiet, hidden: false };
            return { c: r.check, targets: checkTargets(r, lang) };
        });
        renderResultsOnly();
        const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const timer = setTimeout(() => ctl?.abort(), 12000);
        try {
            const found = {};
            for (const wiki of ['en', 'ko']) {
                const titles = jobs.flatMap(j => j.targets.filter(t => t.wiki === wiki).map(t => t.text));
                if (titles.length) found[wiki] = await wikiLookup(wiki, titles, { signal: ctl?.signal });
            }
            for (const { c, targets } of jobs) {
                c.items = targets.map(t => ({ ...t, hit: found[t.wiki]?.get(String(t.text).trim()) ?? null }));
                c.state = 'done';
            }
        } catch {
            for (const { c } of jobs) c.state = 'fail';
        } finally {
            clearTimeout(timer);
            renderResultsOnly();
        }
    }
    // Something worth a ⚠ (another page has this exact name). A name page alone is only "people use it".
    function checkWarns(c) {
        return !!c?.items?.some(i => i.hit && i.hit.kind !== 'name');
    }
    function googleUrl(name) {
        return `https://www.google.com/search?q=${encodeURIComponent(`"${name}"`)}`;
    }
    function checkHtml(r) {
        const c = r.check;
        if (!c || c.hidden) return '';
        // Auto check stays out of sight unless it found something.
        if (c.quiet && !(c.state === 'done' && checkWarns(c))) return '';
        const L = T();
        const many = (c.items || []).filter(i => i.wiki === 'en').length > 1;
        const hasKo = (c.items || []).some(i => i.wiki === 'ko');
        const link = (url, text) => url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(text)}</a>` : escapeHtml(text);
        let body;
        if (c.state === 'busy') body = `<span>${escapeHtml(L.checking)}</span>`;
        else if (c.state === 'fail') body = `<span class="tbd-check-warn">${escapeHtml(L.checkFail)}</span>`;
        else body = (c.items || []).map(i => {
            const label = i.wiki === 'ko' ? L.checkKo : many ? (i.role === 'full' ? L.checkFull : L.pc[i.role]) : hasKo ? L.checkEn : L.checkWiki;
            const head = `<span class="tbd-check-label">${escapeHtml(label)}</span> `;
            const h = i.hit;
            if (!h) return `<span class="tbd-check-item">${head}${escapeHtml(L.checkNone)}</span>`;
            if (h.kind === 'many') return `<span class="tbd-check-item tbd-check-warn">${head}⚠ ${link(h.url, L.checkMany)}</span>`;
            if (h.kind === 'name') return `<span class="tbd-check-item">${head}ℹ ${link(h.url, L.checkNamePage)}</span>`;
            return `<span class="tbd-check-item tbd-check-warn">${head}⚠ ${link(h.url, h.title)}${h.desc ? ` — ${escapeHtml(h.desc)}` : ''}</span>`;
        }).join('<span class="tbd-nick-dot" aria-hidden="true">·</span>');
        const ai = c.ai
            ? `<div class="tbd-check-ai"><span class="tbd-tag tbd-word-tag">${escapeHtml(L.checkAiTag)}</span> ${escapeHtml(c.ai.state === 'busy' ? L.checkAsking : c.ai.text || '')}</div>` : '';
        const askBtn = c.ai?.state === 'busy' ? '' : `<button type="button" class="tbd-check-ask">${escapeHtml(L.checkAsk)}</button>`;
        const full = r.pieces ? r.pieces.filter(p => CHECK_ROLES.includes(p.role)).map(p => p.text).join(' ') || r.name : r.name;
        return `<div class="tbd-check">${body}<span class="tbd-check-links"><a href="${escapeHtml(googleUrl(full))}" target="_blank" rel="noopener noreferrer">${escapeHtml(L.checkGoogle)}</a>${askBtn}</span>${ai}</div>`;
    }
    // Asked only on a tap. A guess, marked as one.
    function buildCheckMessages(name, lang) {
        const out = lang === 'ko' ? 'Korean' : 'English';
        return [
            { role: 'system', content: 'You check whether an invented name runs into trouble. Answer briefly and honestly.' },
            { role: 'user', content: `Name: "${name}"\nIn 2 or 3 short sentences, in ${out}: does it match or closely resemble a well-known brand, company, product, fictional character, famous real person or place? Does it mean something rude or embarrassing in a major language? If nothing comes to mind, say so plainly. Don't make up facts; say when you're unsure. Plain text, no list.` },
        ];
    }
    // Runs after the status line is set; the panel redraws once the answer is in.
    function autoCheck(list) {
        if (!settings().autoCheck || !list.length) return;
        setTimeout(() => checkNames(list, { quiet: true }), 0);
    }
    async function askAiCheck(r) {
        if (!r.check || r.check.ai?.state === 'busy') return;
        const st = settings();
        const full = r.pieces ? r.pieces.filter(p => CHECK_ROLES.includes(p.role)).map(p => p.text).join(' ') || r.name : r.name;
        const check = r.check;
        check.ai = { state: 'busy' };
        renderResultsOnly();
        try {
            const raw = await requestLLM(buildCheckMessages(full, detectLang()), { profileId: st.profileId, sendPreset: !!st.sendPreset, reasoning: st.reasoning, maxTokens: tokensFor(1, st) });
            const text = stripThinking(String(raw || '')).replace(/\s+/g, ' ').trim().slice(0, 400);
            check.ai = { state: 'done', text: text || T().checkAiEmpty };
        } catch (e) {
            check.ai = { state: 'done', text: T().err(String(e?.message || e || 'unknown error').slice(0, 120)) };
        }
        if (r.check === check) renderResultsOnly();
    }

    // ---------- random seeds ----------
    const START_LETTERS = 'BCDFGHJKLMNPRSTVWAEIOU'.split('');
    // Endings depend on what is being named: person endings on a place made places sound like people.
    // Person endings follow the setting too: one shared list made sci-fi and modern people sound like fantasy.
    const PERSON_ENDINGS = {
        fantasy: ['-an', '-el', '-ick', '-or', '-wyn', '-ard', '-is', '-et', '-um', '-ow', '-ane', '-ith', '-ock', '-ess', '-ry', '-ay', '-ond', '-ix', '-ler', '-ia'],
        medieval: ['-in', '-et', '-ard', '-ric', '-mund', '-wen', '-ot', '-ild', '-ey', '-is', '-a', '-elle', '-iam', '-er'],
        gothic: ['-ias', '-ine', '-ard', '-ius', '-ora', '-mond', '-ette', '-iel', '-ane', '-ica', '-ault', '-ian'],
        scifi: ['-ek', '-a', '-o', '-ae', '-in', '-iko', '-ra', '-ov', '-is', '-ay', '-en', '-yx', '-i', '-ash'],
        modern: ['-en', '-y', '-ie', '-a', '-on', '-er', '-ia', '-ley', '-son', '-o', '-ah', '-ce'],
        cozy: ['-y', '-ie', '-kin', '-a', '-elle', '-o', '-et', '-ly', '-bee', '-ette', '-ow'],
        myth: ['-os', '-eus', '-a', '-is', '-on', '-ir', '-ra', '-ys', '-und', '-ia', '-ar', '-eth', '-ax', '-ura', '-ne'],
        game: ['-ion', '-ius', '-ra', '-ex', '-yn', '-or', '-ael', '-is', '-ia', '-os', '-iel', '-yx', '-ar', '-en', '-ka'],
        // Invented Lovecraftian names are eldritch, even for people. Real-name modes switch to old-town folk
        // (and get no ending seeds at all), so these only reach invented names.
        cosmic: ['-oth', '-uun', "'th", '-yeh', '-ath', '-ugg', '-ul', '-thua', '-agg', '-ith', '-ogg', '-urr', '-hu', '-aal'],
        weird: ['-ub', '-ix', '-oom', '-ilk', '-eth', '-uzz', '-ip', '-orm', '-ae', '-ogg', '-elm', '-oe', '-umble', '-iv'],
    };
    const ENDINGS = {
        placeOld: ['-holm', '-mere', '-wick', '-ford', '-by', '-thorpe', '-moor', '-crag', '-ley', '-stead', '-gate', '-combe', '-den', '-wold', '-fell', '-bury'],
        placeTech: ['-ex', '-ion', '-ax', '-on', '-ar', '-is', ' Station', ' Array', ' Prime', ' Hub', ' Sector', '-7', '-IX', ' Spire'],
        placeModern: ['-ton', '-field', '-ville', ' Heights', ' Park', ' Bay', ' Point', '-burg', '-dale', ' Junction', ' Cross', '-side'],
        placeMyth: ['-os', '-ia', '-heim', '-gard', '-on', '-ys', '-ara', '-eum', ' Mount', ' Isle', '-ion', '-und', ' Spring', ' Gate'],
        placeGame: [' Keep', ' Hold', '-heim', '-ia', ' Wastes', ' Spire', '-gard', ' Reach', ' Citadel', ' Depths', ' Ruins', '-or', ' Pass', ' Sanctum'],
        // Two kinds: decaying old seaside towns, and alien places that should not exist.
        placeCosmic: ['-mouth', '-wich', '-ham', '-port', '-ton', ' Hollow', ' Marsh', ' Reef', ' Deep', "'th", '-oth', '-uun', '-yeh', '-ath'],
    };
    function endingsFor(target, vibe) {
        // A typed vibe decides the sound itself, so no person ending is pushed on it.
        if (target === 'person') return vibe === 'custom' ? null : (PERSON_ENDINGS[vibe] || PERSON_ENDINGS.fantasy);
        if (target !== 'place') return null;
        if (vibe === 'scifi') return ENDINGS.placeTech;
        if (vibe === 'modern') return ENDINGS.placeModern;
        if (vibe === 'myth') return ENDINGS.placeMyth;
        if (vibe === 'game') return ENDINGS.placeGame;
        if (vibe === 'cosmic') return ENDINGS.placeCosmic;
        // Weird places should be free to be anything, so no ending is pushed.
        if (vibe === 'weird') return null;
        if (vibe === 'custom') return [...ENDINGS.placeOld, ...ENDINGS.placeModern];
        return ENDINGS.placeOld;
    }
    // Shops and items are often phrases, so they get a shape instead of an ending.
    const SHAPES = {
        shop: ['one invented word', 'The + adjective + noun', "an invented owner's name + 's", 'a short pun on the trade', 'noun & noun', 'an invented word + the kind of shop'],
        // "A word for what it is" keeps the name on the thing (bread → loaf, bun), not on a random object.
        item: ['one invented word', 'an invented word + a plain word for what it is', "an invented maker's name + 's + a plain word for what it is", 'a short descriptive phrase'],
        itemOld: ['"the … of …"', 'a title-like epithet'],
        // Game gear sounds like loot: grand, named, a little boastful.
        itemGame: ['a grand invented name for a legendary piece', 'adjective + a plain word for what it is, like named loot'],
        itemTech: ['a model name with letters or numbers', 'a brand-like invented word', 'an invented word + a plain word for what it is'],
        // Real place names often use real words, so places mix invented and real-word shapes.
        place: ['one invented word', 'one invented word', 'two real words joined into one', 'a real word + a place word', 'an invented word + a place word', 'a real word blended with an invented part'],
    };
    function shapesFor(target, vibe) {
        if (target === 'shop') return SHAPES.shop;
        if (target === 'place') return SHAPES.place;
        if (target === 'item') {
            if (vibe === 'scifi') return [...SHAPES.item, ...SHAPES.itemTech];
            // "The … of …" and epithets only suit old-world settings ("The Ease of Loaf" was odd in a modern bakery).
            if (vibe === 'game') return [...SHAPES.item, ...SHAPES.itemOld, ...SHAPES.itemGame];
            if (['fantasy', 'medieval', 'gothic', 'myth', 'cosmic'].includes(vibe)) return [...SHAPES.item, ...SHAPES.itemOld];
            return SHAPES.item;
        }
        return null;
    }
    const TEXTURES = ['soft', 'sharp', 'earthy', 'airy', 'heavy', 'bright', 'old-fashioned', 'clipped', 'rolling', 'rough', 'playful', 'stern'];
    // Old-world textures pulled sci-fi and modern names back toward fantasy.
    const WEIRD_TEXTURES = ['uncanny', 'lopsided', 'dreamlike', 'slippery', 'off-key'];
    function texturesFor(vibe) {
        if (vibe === 'weird') return [...TEXTURES, ...WEIRD_TEXTURES];
        return vibe === 'scifi' || vibe === 'modern' ? TEXTURES.filter(t => t !== 'old-fashioned' && t !== 'earthy') : TEXTURES;
    }
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
        myth: ['golden fleece', 'oracle smoke', 'world tree', 'thunderbolt', 'labyrinth', 'river of the dead', 'sun chariot', 'sacred grove',
            'sea foam', 'titan bone', 'laurel wreath', 'underworld gate', 'winged sandal', 'serpent coil', 'burning altar', 'nectar',
            'spindle of fate', "giant's hammer", 'star map', 'sacred spring', 'raven messenger', 'mountain throne', 'tidal horn', 'stolen fire'],
        game: ['loot chest', 'boss gate', 'mana potion', 'respawn point', 'skill tree', 'raid banner', 'legendary drop', 'dungeon key',
            'guild hall', 'quest board', 'critical hit', 'dragon egg', 'teleport rune', 'save crystal', 'arena', 'class crest', 'world map',
            'enchant slot', 'summon circle', 'final dungeon', 'hidden ending', 'airship', 'boss theme', 'starter village'],
        cosmic: ['drowned city', 'sunken idol', 'salt marsh', 'fish-eyed stranger', 'old manuscript', 'starless sky', 'fog bell', 'ancient tablet',
            'asylum', 'dead language', 'abyssal trench', 'wrong geometry', 'whispering well', 'eclipse', 'cult chant', 'black stone', 'tidal cave',
            'forbidden library', 'endless sleep', 'pale lamp', 'rotting wharf', 'choir in the deep', 'bone flute', 'static from the stars'],
        weird: ['melting clock', 'door to nowhere', 'teeth in a jar', 'upside-down rain', 'moth with a face', 'talking soup', 'endless hallway',
            'spoon collection', 'humming fog', 'wrong shadow', 'rubber moon', 'stitched doll', 'backwards song', 'bottled whisper', 'eye in the wall',
            'paper bones', 'jelly crown', 'clock with no hands', 'stairs into water', 'glass worm', 'smiling well', 'button eyes', 'inside-out umbrella'],
    };
    const ALL_SPARKS = [...new Set(Object.values(SPARKS).flat())];
    const SYLLABLES = { short: [1, 2], medium: [2, 3], long: [3, 4], any: [1, 4] };

    const LIKE_FOCUS = ['its opening sound', 'its vowels', 'its ending', 'its rhythm', 'its consonants'];

    function pick(arr, rnd = Math.random) { return arr[Math.floor(rnd() * arr.length)]; }

    // One seed per name. Each name gets its own nudge so the batch spreads out.
    function rollSeeds(count, opts = {}, rnd = Math.random) {
        const [lo, hi] = SYLLABLES[opts.length] || SYLLABLES.any;
        const target = opts.target || 'person';
        // No inspiration word when the user typed a vibe or details: their words already set the direction,
        // and a random word ("bus stop") pulled names away from what was typed ("bread").
        const typedDetail = target !== 'person' && String(opts.kindText || '').trim();
        // "Like this" words set the direction too, and they replace the random start, ending and sound nudges
        // (a forced "starts with K" can't sound like "Elric").
        const like = likeWords(opts).length ? (opts.likeMode === 'feel' ? 'feel' : 'sound') : null;
        // Real names come from real use, so the made-up sound nudges (ending, texture, inspiration word) go.
        // The start letter stays: it still spreads the batch over different real names.
        const real = realMode(opts) !== 'invented';
        const sparks = opts.vibe === 'custom' || typedDetail || like || real ? null : (SPARKS[opts.vibe] || ALL_SPARKS);
        const textures = texturesFor(opts.vibe);
        const endings = endingsFor(target, opts.vibe);
        const shapes = shapesFor(target, opts.vibe);
        const shape = nameShape(opts);
        const familyKey = opts.vibe === 'cosmic' && real ? 'cosmicFolk' : opts.vibe;
        const familyStyles = shape && shape.roles.includes('family') && !shape.fixed ? (FAMILY_STYLES[familyKey] || ALL_FAMILY_STYLES) : null;
        const seeds = [];
        const usedEndings = new Set();
        const usedFamily = new Set();
        const usedSparks = new Set();
        // Sound-alike: each name copies a different part of the typed word, so the batch doesn't all copy its start.
        const focusStart = Math.floor(rnd() * LIKE_FOCUS.length);
        for (let i = 0; i < count; i++) {
            const seed = {};
            // Sound-alike keeps the typed word's rhythm, so no random syllable count then.
            if (like !== 'sound') seed.syllables = lo + Math.floor(rnd() * (hi - lo + 1));
            if (!like && !real) seed.texture = pick(textures, rnd);
            if (like === 'sound') seed.likeFocus = LIKE_FOCUS[(focusStart + i) % LIKE_FOCUS.length];
            // Like endings, no inspiration word twice in one batch (three "neon" names looked samey).
            if (sparks) {
                const fresh = sparks.filter(s => !usedSparks.has(s));
                seed.spark = pick(fresh.length ? fresh : sparks, rnd);
                usedSparks.add(seed.spark);
            }
            // A forced start letter would fight "must contain", so skip it then.
            if (!opts.mustContain && !like) seed.start = pick(START_LETTERS, rnd);
            // Only nudge the ending about half the time; always forcing it sounds samey too.
            // Don't hand the same ending to two names in one batch (two "… Array" looked samey).
            if (endings && !like && !real && rnd() < 0.5) {
                const fresh = endings.filter(e => !usedEndings.has(e));
                seed.ending = pick(fresh.length ? fresh : endings, rnd);
                usedEndings.add(seed.ending);
            }
            if (shapes) seed.shape = pick(shapes, rnd);
            if (familyStyles) {
                const fresh = familyStyles.filter(f => !usedFamily.has(f));
                seed.family = pick(fresh.length ? fresh : familyStyles, rnd);
                usedFamily.add(seed.family);
            }
            seeds.push(seed);
        }
        return seeds;
    }

    // ---------- person names in parts (given / middle / family + extras) ----------
    const NAME_PARTS = ['given', 'middle', 'family'];
    const NAME_EXTRAS = ['title', 'particle', 'origin', 'patronymic', 'epithet', 'religious', 'codename', 'alias'];
    // How the parts line up in the full name. Codename, religious name and alias trail behind.
    const PIECE_ORDER = ['title', 'given', 'middle', 'particle', 'family', 'patronymic', 'origin', 'epithet', 'codename', 'religious', 'alias'];
    const PIECE_DESC = {
        given: 'given (first) name',
        middle: 'middle name',
        family: 'family name (surname)',
        title: 'title or honorific',
        particle: 'nobility or house particle that sits right before the family name; if there is no family name, include the house name in it',
        origin: 'place of origin, with an invented place',
        patronymic: 'surname made from an invented father\'s name',
        epithet: 'nickname or epithet',
        religious: 'religious or monastic name, with its title',
        codename: 'codename or handle',
        alias: 'alias or stage name (another name they go by)',
    };
    // Examples follow the setting: AI copies the style of examples, and "Sir" or "the Grey" pulled sci-fi names into fantasy.
    const PIECE_EXAMPLES = {
        old: {
            title: 'Sir, Lady, Captain, Doctor', particle: 'von, de, "of House Varn"', origin: '"of Westmere", "da Riva"',
            patronymic: 'Erikson, ap Rhys, MacArran', epithet: '"the Grey", "Ironhand"', religious: '"Brother Anselm", "Sister Maren"', codename: 'Nightjar, Vex-9',
        },
        scifi: {
            title: 'Dr., Commander, Captain, Unit', particle: 'von, de, "of the Ceres line"', origin: '"of Ceres Station", "from Dock 9"',
            patronymic: 'Ivanovich, bint Rahim, Sigurdsdottir', epithet: '"Deadwire", "the Ghost"', religious: '"Brother Kei", "Sister Ofelia"', codename: 'Static, Vex-9, Patchwork',
        },
        modern: {
            title: 'Dr., Ms., Officer, Coach', particle: 'von, de, van der', origin: '"from Leeds", "of Brooklyn"',
            patronymic: 'Petrovich, Jensen, MacArthur', epithet: '"Lucky", "the Kid"', religious: '"Father Tomas", "Sister Grace"', codename: 'Falcon, Zero, Echo-2',
        },
        cozy: {
            title: 'Auntie, Old, Miss, Grandpa', particle: 'de, "of Bramble Lane"', origin: '"of Hollyhill", "from the Mill"',
            patronymic: 'Wrenson, Dillson', epithet: '"Button", "the Baker"', religious: '"Brother Bramble", "Sister Clover"', codename: 'Pip, Biscuit-2',
        },
        game: {
            title: 'Hero, Lord, Archmage, Captain', particle: 'von, de, "of House Varn"', origin: '"of the Frozen North", "from the Ashlands"',
            patronymic: 'Erikson, MacArran', epithet: '"the Undying", "Kingslayer"', religious: '"High Priestess Ione", "Brother Anselm"', codename: 'Reaper, X-01',
        },
        cosmic: {
            title: 'Professor, Dr., Mrs., Captain', particle: 'van der, de', origin: '"of Saltmarsh", "from the old harbor"',
            patronymic: 'Abrahamson, MacKay', epithet: '"the Hermit", "Old"', religious: '"Brother Ezra", "Mother Abigail"', codename: 'Watcher, Mr. Grey',
        },
        weird: {
            title: 'Mister, Old, Auntie, Doctor', particle: 'de, "of the Hum"', origin: '"of Under the Stairs", "from the Wet Room"',
            patronymic: 'Mothson, Spoonsdottir', epithet: '"the Upside-Down", "Twelve Spoons"', religious: '"Brother Static", "Sister Moth"', codename: 'Moth, Static-0',
        },
    };
    function pieceDesc(role, vibe) {
        // A typed vibe gets no examples, so they don't fight what was typed.
        const group = vibe === 'custom' ? null : (PIECE_EXAMPLES[vibe] || PIECE_EXAMPLES.old);
        const ex = group?.[role];
        return ex ? `${PIECE_DESC[role]} (like ${ex})` : PIECE_DESC[role];
    }
    // Parts that are names of their own, so they go on the avoid list. Titles and particles don't.
    const NAME_ROLES = ['given', 'middle', 'family', 'patronymic', 'codename', 'alias'];
    // Family names follow the setting, like place endings do.
    const FAMILY_STYLES = {
        fantasy: ['from an invented place', 'from a trade', 'from a landscape feature', "from an invented ancestor's name", 'an old clan name'],
        medieval: ['from a place (-ford, -wick, -by, -ley…)', 'from a trade', 'from a landscape feature', "from a father's name (-son, Fitz-)"],
        gothic: ['an old noble house', 'from a family estate', 'heavy and old, two or three syllables', 'from a church or relic word'],
        scifi: ['short and clipped, one or two syllables', 'corporate or code-like', 'a blend of two languages', 'a colony- or ship-born name'],
        modern: ['a realistic everyday surname', 'from a place', 'from a trade', "from a father's name"],
        cozy: ['from a plant or food', 'from a craft', 'from a cosy little place', 'soft and homely'],
        myth: ['from an invented hero or ancestor', 'from a sacred place', "a \"son/daughter of\" form", 'from a divine title or gift'],
        game: ['grand and heroic', 'from a clan or guild', 'from an invented kingdom', 'dark and edgy, two syllables'],
        cosmic: ['alien and ancient, hard to say', 'with an apostrophe or a hyphen', 'heavy and wet-sounding', "like a forgotten cult's name"],
        cosmicFolk: ['an old New England-style surname', 'from a decaying family estate', 'plain and old-fashioned, two syllables', 'from a seaport or marsh town'],
        weird: ['from an odd everyday object', 'a sound that is slightly off', 'two mismatched words joined', 'strange but still sayable'],
    };
    const ALL_FAMILY_STYLES = [...new Set(Object.values(FAMILY_STYLES).flat())];

    // What a person's name is made of. null means the plain old single name.
    function nameShape(form = {}) {
        if (form.target !== 'person') return null;
        let parts = (Array.isArray(form.parts) ? form.parts : ['given']).filter(p => NAME_PARTS.includes(p));
        const extras = (Array.isArray(form.extras) ? form.extras : []).filter(p => NAME_EXTRAS.includes(p));
        if (!parts.length && !extras.length) parts = ['given'];
        const roles = PIECE_ORDER.filter(r => parts.includes(r) || extras.includes(r));
        if (roles.length === 1 && roles[0] === 'given') return null;
        let fixed = roles.includes('family') ? cleanPiece(form.fixedFamily) : '';
        if (roles.length === 1) fixed = ''; // nothing else to make
        return { roles, fixed };
    }
    function cleanPiece(v) {
        return String(v ?? '').replace(/^["'“”‘’()\[\]\s]+|["'“”‘’()\[\]\s]+$/g, '').replace(/\s+/g, ' ').trim().slice(0, 40);
    }
    function pieceText(p) {
        if (p.role === 'codename') return `"${p.text}"`;
        if (p.role === 'religious' || p.role === 'alias') return `(${p.text})`;
        return p.text;
    }
    function joinPieces(pieces) { return pieces.map(pieceText).join(' '); }
    // Turn {"parts": {...}} answers into pieces in the right order. Plain answers pass through.
    function applyShape(list, form) {
        const shape = nameShape(form);
        if (!shape) return list;
        return list.map(n => {
            if (!n.parts) return n.name ? n : null;
            const pieces = [];
            for (const role of shape.roles) {
                const fixed = role === 'family' && shape.fixed;
                const text = fixed ? shape.fixed : cleanPiece(n.parts[role]);
                if (!text) continue;
                const piece = fixed ? { role, text, fixed: true } : { role, text };
                // "real": true for the whole name marks every real-able part; a list marks just those.
                if (!fixed && n.real && REAL_ROLES.includes(role) && (!n.realParts || n.realParts.includes(role))) piece.real = true;
                pieces.push(piece);
            }
            if (!pieces.length) return null;
            const out = { name: joinPieces(pieces), note: n.note, read: n.read, pieces };
            if (pieces.some(p => p.real)) out.real = true;
            if (n.nicks?.length) out.nicks = n.nicks;
            return out;
        }).filter(n => n && n.name.length <= 120);
    }
    // The parts worth remembering and avoiding next time (not "Sir", not a kept family name).
    function memoryNames(r) {
        if (!r.pieces) return [r.name];
        return r.pieces.filter(p => NAME_ROLES.includes(p.role) && !p.fixed).map(p => p.text);
    }

    // ---------- Cache (names from built-in fragments, no AI) ----------
    // Each fragment: "Text=English meaning=Korean meaning[=categories]". Only well-known meanings;
    // an empty meaning means "just an ending". Categories tie place fragments to place kinds.
    function F(s) {
        return s.split(';').map(x => x.trim()).filter(Boolean).map(x => {
            const [t, en = '', ko = '', cats = ''] = x.split('=');
            const f = { t, en, ko };
            if (cats) f.cats = cats.split('/');
            return f;
        });
    }
    const CACHE = {
        latin: {
            head: F('Silv=forest=숲;Luc=light=빛;Aur=gold=금;Sever=stern=엄격한;Clar=clear, bright=맑은;Fort=strong=강한;Flor=flower=꽃;Vit=life=생명;Fel=lucky=행운의;Ver=true=참된;Prim=first=첫째;Val=strong, well=굳센;Dom=lord=주인;Pac=peace=평화;Fid=faith=믿음;Sanct=holy=거룩한;Alb=white=흰;Rub=red=붉은;Nov=new=새로운;Sol=sun=해;Stell=star=별;Ign=fire=불;Vent=wind=바람;Mar=sea=바다;Terr=earth=땅;Aqu=water=물;Noct=night=밤;Cael=sky=하늘'),
            masc: F('us==;ius==;ianus=belonging to=~에 속한;inus=like=~ 같은;ian=belonging to=~에 속한'),
            fem: F('a==;ia==;ina=like=~ 같은;ana=belonging to=~에 속한;illa=little=작은;ella=little=작은'),
            placeHead: F('Silv=forest=숲=forest;Aqu=water=물=water;Mar=sea=바다=coast;Terr=earth=땅;Alb=white=흰;Rub=red=붉은;Nov=new=새로운;Sol=sun=해;Luc=light=빛;Aur=gold=금;Fort=strong=강한=fort;Flor=flower=꽃=field;Vent=wind=바람=hill/coast;Petr=rock=바위=hill;Mont=mountain=산=hill;Lac=lake=호수=water;Port=harbor=항구=coast;Prat=meadow=풀밭=field;Castr=fort=요새=fort;Font=spring=샘=water'),
            placeTail: F('ia=land of=~의 땅;ium=place of=~의 터=town/fort;um===town;ana=belonging to=~에 속한;etum=grove of=~나무 숲=forest;arium=place for=~ 두는 곳=town/fort;ona===town/coast'),
            family: 'nomen', noble: 'de', of: 'de', titles: { m: ['Frater', 'Sanctus'], f: ['Soror', 'Sancta'] },
        },
        oldenglish: {
            head: F('Ethel=noble=고귀한;Ed=wealth, fortune=부·행운;Alf=elf=요정;Os=god=신;God=god=신;Leof=dear=사랑하는;Wulf=wolf=늑대;Sig=victory=승리;Cuth=famous=이름난;Here=army=군대;Hild=battle=전투;Wil=will=의지;Beorn=warrior=전사;Ald=old=오래된;Win=friend=벗;Bert=bright=빛나는;Mild=gentle=온화한;Ceol=ship=배;Wig=battle=싸움;Swith=strong=강한'),
            masc: F('win=friend=벗;ric=ruler=통치자;wulf=wolf=늑대;mund=protection=보호;ward=guardian=지킴이;stan=stone=돌;red=counsel=조언;frith=peace=평화;helm=helmet=투구;bert=bright=빛나는;gar=spear=창'),
            fem: F('gyth=battle=전투;wyn=joy=기쁨;flaed=beauty=아름다움;burh=fortress=요새;thryth=strength=힘;hild=battle=전투'),
            placeHead: F('Ash=ash tree=물푸레나무=forest;Brad=broad=넓은;Ald=old=오래된;Brom=broom=금작화=field;Thorn=thorn=가시나무=forest/field;Stan=stone=돌=hill/fort;Hart=stag=수사슴=forest;Lang=long=긴;Sut=south=남쪽;Nor=north=북쪽;Wes=west=서쪽;East=east=동쪽;Cran=crane=두루미=water;Brock=badger=오소리=forest;Fox=fox=여우=forest;Ever=wild boar=멧돼지=forest;Elm=elm=느릅나무=forest;Black=black=검은;Whit=white=흰;Hasel=hazel=개암나무=forest;Salt=salt=소금=coast;Kings=king\'s=왕의=town/fort;Chip=market=장터=town;Mil=mill=방앗간=water/town'),
            placeTail: F('ton=farmstead=농가 마을=town/field;ham=homestead=마을=town/field;wick=dwelling, trading place=마을·장터=town;ford=river crossing=여울=water;bury=fort=성채=fort/town;ley=woodland clearing=숲속 빈터=forest/field;wood=wood=숲=forest;hurst=wooded hill=숲 언덕=forest/hill;den=valley=골짜기=hill/field;mere=lake=호수=water;well=spring=샘=water/town;stead=place=터=town/field;field=open land=들판=field;combe=valley=골짜기=hill;cliffe=cliff=절벽=hill/coast;don=hill=언덕=hill;worth=enclosure=울타리 친 땅=town/field;bourne=stream=시내=water;holt=wood=숲=forest;mouth=river mouth=하구=coast/water;port=harbor, market town=항구·장터=coast/town;ridge=ridge=산등성이=hill;brook=stream=시내=water;wold=forest upland=숲 고원=forest/hill;hithe=landing place=나루터=water/coast'),
            family: 'english', noble: 'of', of: 'of', titles: { m: ['Brother', 'Saint'], f: ['Sister', 'Saint'] },
        },
        norman: {
            head: F('Beau=beautiful=아름다운;Bel=fine=고운;Clair=clear=맑은;Fleur=flower=꽃;Gai=merry=명랑한;Dou=sweet=다정한;Blanc=white=흰;Roy=king=왕;Lys=lily=백합;Aim=loved=사랑받는;Ros=rose=장미;Jol=pretty=예쁜;Hardi=bold=대담한;Sauv=wild=야생의;Gent=noble=고귀한;Fid=faithful=믿음직한'),
            masc: F('ard=hardy=굳센;ert=bright=빛나는;ault=rule=다스림;in=little=작은;on=little=작은;ier=one who=~하는 사람;et=little=작은'),
            fem: F('ine=little=작은;elle=little=작은;ette=little=작은;ise==;ienne=of=~의'),
            placeHead: F('Beau=beautiful=아름다운;Bel=fine=고운;Mont=mountain=산=hill/fort;Roche=rock=바위=hill/coast;Val=valley=골짜기=hill/field;Bois=wood=숲=forest;Font=spring=샘=water;Pont=bridge=다리=water/town;Clair=clear=맑은=water;Blanc=white=흰;Vert=green=푸른=field/forest;Grand=great=큰;Haut=high=높은=hill/fort;Castel=castle=성=fort;Riv=riverbank=강가=water;Mal=bad=나쁜;Neuf=new=새로운=town'),
            placeTail: F('ville=town=마을=town;mont=mountain=산=hill/fort;court=estate=영지=town/field;val=valley=골짜기=hill/field;champ=field=들판=field;fort=stronghold=성채=fort;lieu=place=곳;bois=wood=숲=forest;mare=pond=연못=water;fontaine=spring=샘=water/town;roche=rock=바위=hill/coast;pont=bridge=다리=water/town;port=harbor=항구=coast;rive=riverbank=강가=water;mer=sea=바다=coast;pre=meadow=풀밭=field'),
            family: 'french', noble: 'de', of: 'de', titles: { m: ['Frère', 'Saint'], f: ['Sœur', 'Sainte'] },
        },
        germanic: {
            head: F('Adal=noble=고귀한;Bern=bear=곰;Ger=spear=창;Hild=battle=전투;Rad=counsel=조언;Sieg=victory=승리;Wolf=wolf=늑대;Gott=god=신;Kun=bold=대담한;Lud=famous=이름난;Wil=will=의지;Frid=peace=평화;Ans=god=신;Diet=people=백성;Hart=hardy=굳센;Arn=eagle=독수리;Rein=counsel=조언;Eber=boar=멧돼지;Gund=battle=전투;Irm=great=큰;Walt=rule=다스림;Ot=wealth=부'),
            masc: F('bert=bright=빛나는;hard=hardy=굳센;mund=protection=보호;wald=rule=다스림;rich=ruler=통치자;win=friend=벗;fried=peace=평화;helm=helmet=투구;bald=bold=대담한;wig=battle=싸움;olf=wolf=늑대;brand=sword, fire=칼·불길;mar=famous=이름난'),
            fem: F('hild=battle=전투;gard=enclosure=울타리;trud=strength=힘;lind=gentle=부드러운;burg=fortress=요새;run=secret=비밀;heid=nature=됨됨이'),
            placeHead: F('Stein=stone=돌=hill/fort;Ross=horse=말=field;Eich=oak=참나무=forest;Lind=linden=보리수=forest/town;Wolf=wolf=늑대=forest;Hoh=high=높은=hill/fort;Neu=new=새로운=town;Alt=old=오래된;Schwarz=black=검은=forest;Weiss=white=흰;Rot=red=붉은;Grun=green=푸른=field/forest;Tann=fir=전나무=forest;Birk=birch=자작나무=forest;Fels=rock=바위=hill;Muhl=mill=방앗간=water/town;Kirch=church=교회=town;Hirsch=stag=수사슴=forest;Falk=falcon=매=hill;Sonn=sun=해;Eis=ice=얼음=hill/water;Wald=forest=숲=forest'),
            placeTail: F('burg=fortress=성채=fort/town;berg=mountain=산=hill;heim=home=집·마을=town;dorf=village=마을=town/field;feld=field=들판=field;wald=forest=숲=forest;bach=stream=시내=water;stein=stone, rock=돌·바위=hill/fort;furt=ford=여울=water;hof=farmstead=농장=field/town;au=water meadow=물가 풀밭=water/field;hausen=houses=집들=town;see=lake=호수=water;bruck=bridge=다리=water/town;tal=valley=골짜기=hill/field;hafen=harbor=항구=coast;hain=grove=작은 숲=forest;horn=peak=봉우리=hill'),
            family: 'place', noble: 'von', of: 'von', titles: { m: ['Bruder', 'Sankt'], f: ['Schwester', 'Sankt'] },
        },
        celtic: {
            head: F('Bran=raven=큰까마귀;Cad=battle=전투;Gwen=white, blessed=흰·복된;Gwyn=white, fair=흰;Mor=great=큰;Kier=dark=어두운;Finn=fair=흰;Aed=fire=불;Con=hound=사냥개;Duv=black=검은;Bri=high=높은;Mael=follower=따르는 이;Ard=high=높은;Rua=red=붉은;Teg=fair=고운;Llew=light=빛;Bryn=hill=언덕;Fer=man=사내'),
            masc: F('an=little=작은;in=little=작은;ach==;wyn=white=흰;gal=valor=용맹'),
            fem: F('wen=white, blessed=흰·복된;een=little=작은;nat=little=작은;ia=='),
            // Celtic places put the place word first: Aber + glas, Dun + more.
            placeHead: F('Aber=river mouth=하구=coast/water;Inver=river mouth=하구=coast/water;Llan=church enclosure=교회 마을=town;Kil=church=교회=town;Dun=fort=요새=fort/hill;Caer=fort=성=fort/town;Pen=head, top=꼭대기=hill;Tre=homestead=마을=town/field;Bally=town=마을=town;Glen=valley=골짜기=hill/field;Ard=height=높은 곳=hill;Strath=wide valley=넓은 골짜기=field/hill;Loch=lake=호수=water;Ros=headland, wood=곶·숲=coast/forest;Bryn=hill=언덕=hill;Coed=wood=숲=forest;Nant=stream, valley=시냇골=water/hill;Porth=harbor=항구=coast'),
            placeTail: F('more=great=큰;beg=small=작은;glas=blue-green=푸른;wen=white=흰;duff=black=검은;ard=high=높은;roe=red=붉은;fin=fair=흰;derry=oak wood=참나무 숲;carrick=rock=바위;lyn=lake=호수;mawr=great=큰;fach=small=작은'),
            family: 'celtic', noble: 'of', of: 'of', titles: { m: ['Brother', 'Saint'], f: ['Sister', 'Saint'] },
        },
        norse: {
            head: F('Thor=Thor (thunder god)=토르(천둥신);Ulf=wolf=늑대;Arn=eagle=독수리;Bjarn=bear=곰;Sig=victory=승리;Ragn=counsel of the gods=신들의 뜻;Gunn=battle=전투;Hall=rock=바위;As=god=신;Ing=the god Ing=잉(신);Ketil=cauldron=솥;Stein=stone=돌;Rafn=raven=큰까마귀;Frey=lord=주인;Vig=battle=싸움;Grim=mask=가면;Orm=serpent=뱀;Svan=swan=백조;Har=army=군대'),
            masc: F('ulf=wolf=늑대;bjorn=bear=곰;mund=protection=보호;stein=stone=돌;kel=cauldron, helmet=솥·투구;vald=ruler=다스림;geir=spear=창;leif=heir=후손;vard=guardian=지킴이;fast=firm=굳은;vid=wood=나무'),
            fem: F('frid=beautiful=아름다운;hild=battle=전투;dis=goddess=여신;run=secret=비밀;gerd=enclosure=울타리;borg=protection=보호'),
            placeHead: F('Kirk=church=교회=town;Stain=stone=돌=hill;Ask=ash tree=물푸레나무=forest;Lang=long=긴;Brei=broad=넓은;Sand=sand=모래=coast;Fisk=fish=물고기=water/coast;Hval=whale=고래=coast;Myr=bog=늪=water/field;Hest=horse=말=field;Kald=cold=차가운;Skog=forest=숲=forest;Nor=north=북쪽;Aust=east=동쪽;Hvit=white=흰;Ulf=wolf=늑대=forest;Ravn=raven=큰까마귀;Thor=Thor=토르'),
            placeTail: F('by=farm, village=마을=town/field;thorpe=outlying farm=외딴 농가=field;thwaite=clearing=빈터=forest/field;toft=homestead=집터=town;dale=valley=골짜기=hill/field;fell=mountain=산=hill;beck=stream=시내=water;holm=islet=작은 섬=coast/water;vik=bay=만=coast;ness=headland=곶=coast;kirk=church=교회=town;gate=street=거리=town;garth=enclosure=울타리=town/field;scar=rock, cliff=바위 절벽=hill/coast;fjord=fjord=피오르=coast;stad=place=터=town;lund=grove=작은 숲=forest;howe=mound=언덕 무덤=hill'),
            family: 'norse', noble: 'af', of: 'of', titles: { m: ['Brother', 'Saint'], f: ['Sister', 'Saint'] },
        },
    };
    const CACHE_ROOTS = Object.keys(CACHE);
    const CACHE_KINDS = ['common', 'noble', 'religious'];
    // Place kinds → which place fragments fit (none listed = any fragment).
    const PLACE_CATS = {
        city: ['town', 'fort'], town: ['town', 'field'], street: ['town'], building: ['town', 'fort'], transit: ['water', 'coast', 'town'],
        park: ['field', 'town'], mountain: ['hill'], water: ['water'], forest: ['forest'], sea: ['coast', 'water'], fort: ['fort', 'hill'],
    };
    function isCache(form = {}) {
        return form.method === 'cache' && (form.target === 'person' || form.target === 'place');
    }
    function cacheRoots(form = {}) {
        const r = (Array.isArray(form.roots) ? form.roots : []).filter(x => CACHE_ROOTS.includes(x));
        return r.length ? r : ['oldenglish'];
    }
    function cacheKinds(form = {}) {
        const k = (Array.isArray(form.ckinds) ? form.ckinds : []).filter(x => CACHE_KINDS.includes(x));
        return k.length ? k : ['common'];
    }
    const VOWEL = /[aeiouyæœ]/i;
    // Glue two fragments: one letter where they'd double up (Wulf + frith → Wulfrith).
    function glue(a, b) {
        if (!a) return b;
        if (!b) return a;
        const last = a[a.length - 1].toLowerCase();
        const first = b[0].toLowerCase();
        if (last === first) return a + b.slice(1);
        return a + b;
    }
    function capFirst(s) { return s ? s[0].toUpperCase() + s.slice(1) : s; }
    // Hard to say: four consonants in a row, or the same letter three times.
    function sayable(s) {
        const w = String(s).toLowerCase().replace(/[^a-zæœ]/g, '');
        return !/[^aeiouyæœ]{4,}/.test(w) && !/[aeiouy]{4,}/.test(w) && !/(.)\1\1/.test(w);
    }
    function syllableCount(s) {
        return (String(s).toLowerCase().match(/[aeiouyæœ]+/g) || []).length;
    }
    function fitCats(list, cats) {
        if (!cats) return list;
        const ok = list.filter(f => !f.cats || f.cats.some(c => cats.includes(c)));
        return ok.length ? ok : list;
    }
    function genderOf(form, rnd) {
        if (form.gender === 'feminine') return 'f';
        if (form.gender === 'masculine') return 'm';
        return rnd() < 0.5 ? 'm' : 'f';
    }
    // One given name: head + ending. The two parts never mean the same thing (Wulf + wulf).
    function cacheGiven(root, g, rnd) {
        const R = CACHE[root];
        const tails = g === 'f' ? R.fem : R.masc;
        for (let i = 0; i < 20; i++) {
            const h = pick(R.head, rnd);
            const t = pick(tails, rnd);
            if (t.en && h.en === t.en) continue;
            const text = glue(h.t, t.t);
            if (!sayable(text)) continue;
            return { text, frags: [h, t], root };
        }
        const h = R.head[0], t = tails[0];
        return { text: glue(h.t, t.t), frags: [h, t], root };
    }
    function cachePlace(root, cats, rnd) {
        const R = CACHE[root];
        const heads = fitCats(R.placeHead, cats);
        const tails = fitCats(R.placeTail, cats);
        for (let i = 0; i < 20; i++) {
            const h = pick(heads, rnd);
            const t = pick(tails, rnd);
            if (t.en && h.en === t.en) continue;
            if (h.t.toLowerCase() === t.t.toLowerCase()) continue;
            const text = capFirst(glue(h.t, t.t));
            if (!sayable(text)) continue;
            return { text, frags: [h, t], root };
        }
        return { text: capFirst(glue(heads[0].t, tails[0].t)), frags: [heads[0], tails[0]], root };
    }
    const SON = { t: 'son', en: 'son', ko: '아들' };
    // A family name the way each root makes one.
    function cacheFamily(root, g, rnd) {
        const R = CACHE[root];
        const place = () => cachePlace(root, null, rnd);
        switch (R.family) {
            case 'nomen': { // Roman family name: head + -ius (Silvius)
                const h = pick(R.head, rnd);
                return { text: glue(h.t, 'ius'), frags: [h, { t: 'ius', en: 'family of', ko: '~ 집안' }], root };
            }
            case 'english': { // a place (Ashford), or father's name + s / son
                const r = rnd();
                if (r < 0.5) return place();
                const f = cacheGiven(root, 'm', rnd);
                const end = r < 0.75 ? { t: 's', en: "'s (child of)", ko: '~의 (자식)' } : SON;
                return { text: f.text + end.t, frags: [...f.frags, end], root };
            }
            case 'french': { // a place (Beaumont), or Le + a word (Le Blanc)
                if (rnd() < 0.7) return place();
                const h = pick(R.head, rnd);
                return { text: `Le ${h.t}`, frags: [{ t: 'Le', en: 'the', ko: '그' }, h], root };
            }
            case 'celtic': { // Mac / O' + a given name
                const f = cacheGiven(root, 'm', rnd);
                const pre = rnd() < 0.6 ? { t: 'Mac', en: 'son of', ko: '~의 아들' } : { t: "O'", en: 'descendant of', ko: '~의 후손' };
                return { text: pre.t === 'Mac' ? `Mac${f.text}` : `O'${f.text}`, frags: [pre, ...f.frags], root };
            }
            case 'norse': { // father's name + son (or dottir for a daughter)
                const f = cacheGiven(root, 'm', rnd);
                const end = g === 'f' ? { t: 'dottir', en: 'daughter', ko: '딸' } : SON;
                const s = /s$/i.test(f.text) ? '' : 's';
                return { text: f.text + s + end.t, frags: [...f.frags, end], root };
            }
            default: return place();
        }
    }
    // "de" + a vowel → d'Aubeval.
    function withParticle(p, place) {
        if (p === 'de' && /^[aeiouy]/i.test(place)) return { joined: `d'${place}`, particle: '' };
        return { joined: `${p} ${place}`, particle: p };
    }
    // One whole Cache name (one root per name for now).
    function cacheOne(form, root, kind, rnd = Math.random) {
        if (form.target === 'place') {
            const p = cachePlace(root, PLACE_CATS[normalizeKind('place', form.kind)] || null, rnd);
            return { name: p.text, frags: p.frags, root, cache: true };
        }
        const R = CACHE[root];
        const g = genderOf(form, rnd);
        const parts = (Array.isArray(form.parts) ? form.parts : ['given']).filter(p => NAME_PARTS.includes(p));
        const fixed = parts.includes('family') ? cleanPiece(form.fixedFamily) : '';
        const pieces = [];
        const given = cacheGiven(root, g, rnd);
        if (kind === 'religious') pieces.push({ role: 'title', text: pick(R.titles[g], rnd), fixed: true });
        if (parts.includes('given') || !parts.length) pieces.push({ role: 'given', text: given.text, frags: given.frags });
        if (parts.includes('middle')) { const m = cacheGiven(root, g, rnd); pieces.push({ role: 'middle', text: m.text, frags: m.frags }); }
        if (kind === 'religious') {
            // Monks and saints go by "of a place" instead of a family name.
            const pl = cachePlace(root, null, rnd);
            const w = withParticle(R.of, pl.text);
            pieces.push({ role: 'origin', text: w.joined, frags: pl.frags });
        } else if (parts.includes('family')) {
            if (kind === 'noble') {
                const pl = fixed ? { text: fixed } : cachePlace(root, null, rnd);
                const w = withParticle(R.noble, pl.text);
                if (w.particle) {
                    pieces.push({ role: 'particle', text: w.particle, fixed: true });
                    pieces.push(fixed ? { role: 'family', text: fixed, fixed: true } : { role: 'family', text: pl.text, frags: pl.frags });
                } else pieces.push(fixed ? { role: 'family', text: w.joined, fixed: true } : { role: 'family', text: w.joined, frags: pl.frags });
            } else if (fixed) pieces.push({ role: 'family', text: fixed, fixed: true });
            else { const f = cacheFamily(root, g, rnd); pieces.push({ role: 'family', text: f.text, frags: f.frags }); }
        }
        if (!pieces.some(p => p.role === 'given')) pieces.splice(kind === 'religious' ? 1 : 0, 0, { role: 'given', text: given.text, frags: given.frags });
        if (pieces.length === 1) return { name: pieces[0].text, frags: pieces[0].frags, root, cache: true };
        return { name: pieces.map(p => p.text).join(' '), pieces, root, cache: true };
    }
    // Sound feel, by letters (no AI here to judge by ear).
    const SOUND_LETTERS = { soft: /[lrmnwy]|[aeiou]/g, hard: /[ktpdgb]|c(?![eiy])|ck/g, sharp: /sh|th|[szxfv]|c(?=[eiy])/g, bright: /[ie]/g, dark: /[oua]/g };
    function soundScore(text, sound) {
        const re = SOUND_LETTERS[sound];
        if (!re) return 0;
        const w = String(text).toLowerCase();
        return (w.match(re) || []).length / Math.max(1, w.replace(/[^a-z]/g, '').length);
    }
    // The part that carries length and sound: the given name, or the place name.
    function cacheCore(n) {
        return n.pieces ? (n.pieces.find(p => p.role === 'given')?.text || n.name) : n.name;
    }
    // Make `count` names: many tries each, keep the ones that fit length, sound and letters, skip the avoid list.
    function cacheNames(form, count, avoid = [], rnd = Math.random) {
        const roots = cacheRoots(form);
        const kinds = cacheKinds(form);
        const banned = new Set(avoid.map(a => String(a).toLowerCase()));
        const must = String(form.mustContain || '').trim().toLowerCase();
        const [lo, hi] = SYLLABLES[form.length] || SYLLABLES.any;
        const out = [];
        const seen = new Set();
        // Each name takes turns through the chosen roots, starting at a random one.
        const start = Math.floor(rnd() * roots.length);
        for (let i = 0; i < count; i++) {
            const root = roots[(start + i) % roots.length];
            const pool = [];
            for (let k = 0; k < 60; k++) {
                const n = cacheOne(form, root, pick(kinds, rnd), rnd);
                const texts = memoryNames(n).map(t => t.toLowerCase());
                if (seen.has(n.name.toLowerCase()) || texts.some(t => banned.has(t))) continue;
                pool.push(n);
            }
            if (!pool.length) continue;
            let best = pool;
            if (must) { const m = best.filter(n => n.name.toLowerCase().includes(must)); if (m.length) best = m; }
            if (form.length && form.length !== 'any') {
                const m = best.filter(n => { const s = syllableCount(cacheCore(n)); return s >= lo && s <= hi; });
                if (m.length) best = m;
            }
            if (form.sound && form.sound !== 'any') {
                best = [...best].sort((a, b) => soundScore(cacheCore(b), form.sound) - soundScore(cacheCore(a), form.sound)).slice(0, 5);
            }
            const n = pick(best, rnd);
            seen.add(n.name.toLowerCase());
            for (const t of memoryNames(n)) banned.add(t.toLowerCase());
            out.push(n);
        }
        return out;
    }
    // Swap one part of a Cache name, the Cache way.
    function cachePiece(src, k, form, avoid = [], rnd = Math.random) {
        const p = src.pieces?.[k];
        if (!p || p.fixed) return null;
        const root = src.root || cacheRoots(form)[0];
        const R = CACHE[root];
        const g = genderOf(form, rnd);
        const banned = new Set([p.text, ...avoid].map(a => String(a).toLowerCase()));
        for (let i = 0; i < 40; i++) {
            let next;
            if (p.role === 'given' || p.role === 'middle') next = cacheGiven(root, g, rnd);
            else if (p.role === 'origin') { const pl = cachePlace(root, null, rnd); next = { text: withParticle(R.of, pl.text).joined, frags: pl.frags }; }
            else if (p.role === 'family' && src.pieces.some(q => q.role === 'particle')) next = cachePlace(root, null, rnd);
            else if (p.role === 'family') next = cacheFamily(root, g, rnd);
            else return null;
            if (banned.has(next.text.toLowerCase()) || banned.has(next.text.replace(/^(de|of|von|af|d')\s?/i, '').toLowerCase())) continue;
            return { ...p, text: next.text, frags: next.frags };
        }
        return null;
    }
    // "fragments: Ethel noble + win friend / Ash ash tree + ford river crossing · Old English"
    function fragsHtml(r) {
        if (!r.cache) return '';
        const L = T();
        const lang = detectLang();
        const groups = r.pieces ? r.pieces.filter(p => p.frags?.length).map(p => p.frags) : (r.frags ? [r.frags] : []);
        if (!groups.length) return '';
        const one = f => {
            const mean = lang === 'ko' ? f.ko : f.en;
            return `<span class="tbd-frag"><b>${escapeHtml(f.t)}</b>${mean ? ` ${escapeHtml(mean)}` : ''}</span>`;
        };
        const body = groups.map(g => g.map(one).join(' + ')).join('<span class="tbd-nick-dot" aria-hidden="true"> / </span>');
        const root = r.root && L.roots[r.root] ? ` <span class="tbd-frag-root">· ${escapeHtml(L.roots[r.root])}</span>` : '';
        return `<div class="tbd-frags"><span class="tbd-nicks-label">${escapeHtml(L.fragments)}:</span> ${body}${root}</div>`;
    }
    // ✨ and swapping a variant still use the AI. It gets the roots in place of the hidden vibe,
    // and a full name goes as one whole name.
    function aiForm(form, src) {
        if (!isCache(form)) return form;
        const roots = cacheRoots(form).map(r => STRINGS.en.roots[r]).join(' and ');
        const full = form.target === 'person' && /\s/.test(String(src?.name || ''));
        return {
            ...form, method: 'ai', vibe: 'custom', customVibe: `built from ${roots} name roots`, realNames: 'invented', likeText: '', extras: [], parts: ['given'],
            ...(full ? { target: 'other', kind: 'any', kindText: 'a full name for a person; keep the same number of words and any title or "of …" part' } : {}),
        };
    }

    // ---------- settings ----------
    const DEFAULTS = {
        language: 'auto',
        profileId: '',
        count: 5,
        maxTokens: 2000,
        theme: 'st',
        effects: true,
        rememberHistory: true,
        sendPreset: false,
        reasoning: 'default',
        historySize: 200,
        history: [],
        banList: '',
        showReading: true,
        nicknames: false,
        autoCheck: false,
        extrasOpen: false,
        moreOpen: false,
        wordNames: 'mark',
        form: { target: 'person', vibe: 'fantasy', customVibe: '', gender: 'any', kind: 'any', kindText: '', length: 'any', sound: 'any', mustContain: '', likeText: '', likeMode: 'sound', realNames: 'invented', parts: ['given'], extras: [], fixedFamily: '', method: 'ai', roots: ['oldenglish'], ckinds: ['common'] },
    };

    // "Thinking effort": SillyTavern's own reasoning_effort values. 'default' sends nothing (some APIs reject the field).
    const REASONING_LEVELS = ['default', 'min', 'low', 'medium', 'high'];
    // Thinking models can spend 10000+ tokens on thought alone.
    const MAX_TOKENS_CAP = 65000;

    function settings() {
        const all = ctx().extensionSettings;
        if (!all[MODULE] || typeof all[MODULE] !== 'object') all[MODULE] = {};
        const st = all[MODULE];
        for (const [k, v] of Object.entries(DEFAULTS)) {
            if (st[k] === undefined) st[k] = Array.isArray(v) ? [] : (v && typeof v === 'object') ? { ...v } : v;
        }
        for (const [k, v] of Object.entries(DEFAULTS.form)) if (st.form[k] === undefined) st.form[k] = Array.isArray(v) ? [...v] : v;
        if (!Array.isArray(st.history)) st.history = [];
        // v0.1.11: the old default (1000) cut off answers, so it moves to the new one once. A number the user typed stays.
        // v0.1.15: a roleplay preset sent along made some models answer empty, so the preset now stays home by default.
        // v0.1.14 (on) was out for minutes, so move everyone once; a later choice stays.
        if (!st.presetV2) { st.sendPreset = false; st.presetV2 = true; }
        if (!st.tokensV2) { if (Number(st.maxTokens) === 1000) st.maxTokens = DEFAULTS.maxTokens; st.tokensV2 = true; }
        // Bits of a cut-off JSON answer once got saved as names; drop them.
        if (st.history.some(n => !looksLikeName(n))) st.history = st.history.filter(looksLikeName);
        if (!THEMES.includes(st.theme)) st.theme = 'st';
        if (st.wordNames !== 'filter') st.wordNames = 'mark';
        if (!REASONING_LEVELS.includes(st.reasoning)) st.reasoning = 'default';
        if (!REAL_MODES.includes(st.form.realNames)) st.form.realNames = 'invented';
        if (st.form.method !== 'cache') st.form.method = 'ai';
        st.form.roots = cacheRoots(st.form);
        st.form.ckinds = cacheKinds(st.form);
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
    // With "real names only", AI favorites like Luna are real names too, so they're marked instead of avoided.
    function avoidList(st = settings(), form = null) {
        const own = splitList(st.banList);
        const past = st.rememberHistory ? st.history.slice(-80) : [];
        const cliches = form && realMode(form) === 'only' ? [] : CLICHES;
        return [...new Set([...cliches, ...own, ...past])];
    }
    function rememberNames(names, st = settings()) {
        if (!st.rememberHistory || !names.length) return;
        const seen = new Set(st.history.map(n => n.toLowerCase()));
        for (const n of names) if (looksLikeName(n) && !seen.has(n.toLowerCase())) { st.history.push(n); seen.add(n.toLowerCase()); }
        const max = clampInt(st.historySize, 10, 2000, 200);
        if (st.history.length > max) st.history.splice(0, st.history.length - max);
    }

    // ---------- prompt ----------
    const TARGET_DESC = {
        person: 'a person (a given name only, no family name)',
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
        // No kind picked: the details say what the thing is ("bread" names a bread, not a bread basket or bakery).
        if (own && kindId === 'any') return `${TARGET_DESC[target]}, namely: "${own}" (the name is for this exact thing, not for something connected to it)`;
        const kind = KIND_DESC[target]?.[kindId];
        const base = kind ? `${TARGET_DESC[target]}, specifically ${kind}` : TARGET_DESC[target];
        // The optional details box: the name and the note should fit it.
        return own ? `${base}. Details from the user: "${own}"` : base;
    }

    const VIBE_DESC = {
        fantasy: 'fantasy (magic, myth, old kingdoms)',
        medieval: 'grounded medieval European (villages, trades, churches, no magic)',
        scifi: 'sci-fi / cyberpunk (future technology, space travel, corporations, code)',
        modern: 'modern-day (real-world today)',
        gothic: 'gothic, dark and old (decay, nobility, churches, night)',
        cozy: 'cozy, whimsical and warm (small, cute, homely)',
        myth: 'myth and legend (gods, heroes, monsters and sacred places, from many ancient cultures)',
        game: 'fantasy video game (bold, flashy and memorable: heroes, bosses, classes, dungeons, legendary gear)',
        cosmic: 'Lovecraftian cosmic horror (ancient unknowable beings, decaying old towns, forbidden knowledge, the deep sea and the stars)',
        weird: 'weird and uncanny (strange, surreal, eerie or absurd; far from ordinary)',
    };

    // How people sound in each setting. Without this, every setting drifted toward fantasy.
    const PERSON_VIBE_RULES = {
        fantasy: 'Fantasy names may be freely invented, but avoid the overused elvish style.',
        medieval: 'Medieval people sound like old European village or church records, not magical fantasy.',
        gothic: 'Gothic people sound old, formal and aristocratic or churchly; dark but believable, not elvish.',
        scifi: 'Sci-fi people sound like the future: a mix of world cultures, short clipped forms, or slightly altered real names. Never like fantasy elves, knights or wizards.',
        modern: 'Modern people sound like someone you could meet today: uncommon is fine, but it must be believable on a real passport. Nothing fantasy-like.',
        cozy: 'Cozy people sound warm, simple and friendly; small and cute rather than grand or epic.',
        myth: 'Myth people sound grand and ancient, like gods, heroes or figures from old legends of any culture.',
        game: 'Game people sound bold, flashy and easy to remember, like heroes, villains or party members in a fantasy video game.',
        cosmic: 'Lovecraftian people get eldritch names, like the ancient beings of those stories: alien, old and hard to say (odd consonant clusters, an apostrophe or hyphen), but still readable. Never like a fantasy orc, dwarf or elf.',
        weird: 'Weird people sound strange or slightly wrong, like someone from a dream.',
    };
    // With a real-names choice, Lovecraftian people are the plain townsfolk of those stories instead.
    const COSMIC_FOLK_RULE = 'Lovecraftian people here are plain, old-fashioned folk from a decaying New England coastal town about a hundred years ago (old Biblical or Puritan-style names fit); never elvish or grand.';
    function personVibeRule(form) {
        if (form.target !== 'person') return '';
        if (form.vibe === 'cosmic' && realMode(form) !== 'invented') return COSMIC_FOLK_RULE;
        return PERSON_VIBE_RULES[form.vibe] || '';
    }

    // What the name has to sound like, so a place doesn't come back as a person's name.
    function shapeRules(form) {
        const out = [];
        if (personVibeRule(form)) out.push(personVibeRule(form));
        // Whole-vibe rules, for every target.
        if (form.vibe === 'cosmic') {
            if (form.target === 'other' || form.target === 'item') out.push('Names may sound alien and hard to say (odd consonant clusters, an apostrophe), but stay readable.');
            out.push("Don't reuse names from Lovecraft's own stories, or ones only a letter away.");
        }
        if (form.vibe === 'weird') out.push('However strange, it must still be sayable aloud: no random strings of letters.');
        if (form.target === 'place') {
            out.push("It must sound like a place, not like a person's first name.");
            if (form.vibe === 'scifi') out.push('Sci-fi places can use tech or corporate roots, designations and numbers (a station, array, sector, hub, a "-7" suffix).');
            else if (form.vibe === 'modern') out.push('Modern places can sound like real towns, streets or districts (-ton, -field, Heights, Bay, Park…).');
            else if (form.vibe === 'cosmic') out.push('Cosmic-horror places are either decaying old towns by the sea or marsh, or ancient alien places that should not exist. Mix both.');
            else if (form.vibe === 'game') out.push('Game places sound like map areas or dungeons: grand, clear and easy to remember.');
            else if (form.vibe === 'myth') out.push('Myth places sound like sacred or legendary sites from old stories.');
            else if (form.vibe !== 'custom' && form.vibe !== 'weird') out.push('Old-world places often use landscape endings (-holm, -mere, -wick, -ford, -by, -moor…). Mix them; don\'t put the same ending on every name.');
        } else if (form.target === 'shop') {
            out.push('It must sound like a shop sign, not like a person. Shop names may use real words or a short phrase, as long as the whole name is fresh.');
        } else if (form.target === 'item') {
            out.push('It must sound like the name of an object, not of a person. A short phrase is fine.');
            out.push('When a shape asks for a word for what it is, use a plain word for this kind of thing (for bread: loaf, bun, roll), never an unrelated object.');
        } else if (form.target === 'other') {
            out.push('It must fit what is being named.');
        }
        if (form.target === 'place') {
            out.push('Place names may use real words: joined real words or a real word plus a place word are welcome. Just never a single bare everyday word on its own (like "Mold" or "Salt").');
        } else if (['mix', 'only'].includes(realMode(form))) {
            // Real names may be words too (Rose, Hope), so the plain-word rule would fight the real-name choice.
        } else if (nameShape(form)) {
            out.push('The given and middle names must not be plain existing English words (like "Mold" or "Salt"). Family names, epithets and titles may use real words (trades, places, deeds).');
        } else if (form.target === 'person' || form.target === 'other') {
            out.push('Never use a plain existing English word on its own as the name (like "Mold" or "Salt").');
        }
        // Only "given" picked: the family-name button is off, so no surname tagging along.
        if (form.target === 'person' && !nameShape(form)) out.push('Give only the given name, with no family name after it.');
        const shape = nameShape(form);
        // Sound-alike names often share the typed word's ending, so don't forbid that then.
        const likeSound = likeWords(form).length > 0 && form.likeMode !== 'feel';
        if (shape) {
            if (likeSound) {
                if (!shape.fixed && shape.roles.includes('family')) out.push('Across the batch, no two family names may be the same.');
            } else {
                out.push(shape.fixed
                    ? 'Across the batch, no two given names may share the same ending.'
                    : 'Across the batch, no two given names may share the same ending, and no two family names may be the same.');
            }
        } else if (likeSound) {
            // A person's name is one word, so "same last word" only matters for places, shops and items.
            if (form.target !== 'person' && form.target !== 'other') out.push('Across the batch, no two names may share the same last word.');
        } else {
            out.push('Across the batch, no two names may share the same ending or the same last word (not two "… Array" or two "-ex").');
        }
        return out;
    }

    // "Real names": one short line, no example names (models copy examples) and nothing to tick off one by one.
    function realWhat(roles) {
        const words = roles.map(r => ({ given: 'given', middle: 'middle', family: 'family' }[r]));
        return `${words.length > 1 ? `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}` : words[0]} names`;
    }
    // What "real" means in a vibe where real names would otherwise fight the setting.
    // (Lovecraftian gets its own person rule for this, COSMIC_FOLK_RULE.)
    const REAL_VIBE_HINT = {
        myth: 'Here "real" means names from actual myths and legends.',
        game: 'Here use real names the way a fantasy video game would, for heroes, villains and party members.',
        weird: 'Here pick real names that are rare and sound strange or old-fashioned today.',
    };
    function realRule(form) {
        const roles = realRoles(form);
        if (!roles.length) return [];
        const what = realWhat(roles);
        const mode = realMode(form);
        const out = [];
        if (mode === 'invented') out.push(`Invent the ${what}; don't hand back names that real people commonly have.`);
        else if (mode === 'near') out.push(`Base the ${what} on real names people use in this setting, each changed a little so it is new but still feels familiar.`);
        else if (mode === 'mix') out.push(`Mix real ${what} that people use in this setting with invented ones, roughly half and half.`);
        else out.push(`Use real ${what} that people actually use in this setting, not invented ones.${roles.length > 1 ? " Don't put together a famous person's full name." : ''}`);
        if (mode !== 'invented' && REAL_VIBE_HINT[form.vibe]) out.push(REAL_VIBE_HINT[form.vibe]);
        if (mode !== 'invented') out.push(nameShape(form)
            ? `Add "real": the list of parts (${roles.join(', ')}) that are real names people actually use; an empty list if none.`
            : 'Add "real": true if it is a real name people actually use, otherwise false.');
        return out;
    }
    // Nicknames only for people, and only when the name has a given name to shorten.
    function nickOn(form, st = settings()) {
        if (!st.nicknames || form.target !== 'person') return false;
        const shape = nameShape(form);
        return !shape || shape.roles.includes('given');
    }
    const NICK_RULE = 'Also add "nicks": 2 or 3 short nicknames for the given name, made the way English speakers shorten names (a clipped front or end, or -y/-ie added).';
    // The JSON to answer in, with the extra fields that are switched on.
    function answerJson(shape, { reading, real, nicks } = {}) {
        const bits = [];
        if (shape) bits.push(`"parts": {${shape.roles.map(r => `"${r}": "..."`).join(', ')}}`);
        else bits.push('"name": "..."');
        if (reading) bits.push('"read": "..."');
        bits.push('"note": "..."');
        if (real) bits.push(shape ? '"real": ["..."]' : '"real": false');
        if (nicks) bits.push('"nicks": ["...", "..."]');
        return `[{${bits.join(', ')}}]`;
    }

    // How to show the reading: Korean letters for Korean, a stress respelling for English.
    function readingRule(lang, full) {
        const what = full ? 'how to say the whole full name, with a space between parts' : 'how to say it';
        return lang === 'ko'
            ? `"read": ${what}, written in Korean Hangul using standard Korean loanword spelling (e.g. Quilla → 퀼라)`
            : `"read": ${what}, as a simple respelling with the stressed syllable in capitals (e.g. Quilla → KWIL-uh)`;
    }

    // The parts a person's name must have, and the JSON shape to answer in.
    function shapeLines(shape, vibe) {
        const lines = ['Each full name is made of exactly these parts, in this order (nothing else):'];
        for (const role of shape.roles) {
            lines.push(`- ${role}: ${pieceDesc(role, vibe)}${role === 'family' && shape.fixed ? ` — always exactly "${shape.fixed}"` : ''}`);
        }
        if (shape.fixed) lines.push(`They are all family: every name keeps the family name "${shape.fixed}", so make the other parts fit it.`);
        lines.push('Put each part in its own field, without quotes or brackets.');
        return lines;
    }
    function namedPieces(src) {
        return src.pieces.map(p => `${p.role} "${p.text}"`).join(', ');
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

    // "Like this": sound = same sounds and rhythm, feel = same flavor and era even with other sounds. Never the word itself.
    function likeRule(form, what) {
        const words = likeWords(form);
        if (!words.length) return '';
        const list = words.map(w => `"${w}"`).join(', ');
        const many = words.length > 1;
        const base = form.likeMode === 'feel'
            ? `Give each ${what} the same feel as ${list}${many ? ' (somewhere between them)' : ''}: the same cultural flavor, era and mood, but the sounds may be quite different.`
            : `Make each ${what} sound like ${list}${many ? ' (somewhere between them)' : ''}: about the same rhythm (syllable count and stress) with some of its sounds carried over, so the two sound related. Go by ear; don't count or check letter by letter.`;
        return `${base} Never use ${many ? 'those words themselves' : 'that word itself'}, and don't just respell ${many ? 'them' : 'it'}; each one must be a different, new ${what}.`;
    }

    function buildMessages(form, seeds, opts = {}) {
        const lang = opts.lang || 'en';
        const avoid = opts.avoid || [];
        const vibe = vibeText(form);
        const sound = SOUND_DESC[form.sound];
        const phrase = form.target === 'shop' || form.target === 'item';
        const shape = nameShape(form);
        const lines = [];
        // "Invent original" would argue with "use real names", so those modes just ask for names.
        const mode = realMode(form);
        const ask = mode === 'mix' || mode === 'only' ? 'Give' : 'Invent';
        const orig = mode === 'mix' || mode === 'only' ? '' : 'original ';
        if (shape) {
            lines.push(`${ask} ${seeds.length} ${orig}full name${seeds.length === 1 ? '' : 's'} for a person.`);
            lines.push(...shapeLines(shape, form.vibe));
        } else {
            lines.push(`${ask} ${seeds.length} ${orig}name${seeds.length === 1 ? '' : 's'} for ${targetText(form)}.`);
        }
        lines.push(`Setting / vibe: ${vibe}.`);
        lines.push('Style: Western, English-readable spelling.');
        lines.push(...shapeRules(form));
        lines.push(...realRule(form));
        if (form.target === 'person' && form.gender && form.gender !== 'any') lines.push(shape ? `Gender feel (for the given and middle names and any title): ${form.gender}.` : `Gender feel: ${form.gender}.`);
        if (sound) lines.push(`Sound: ${sound}. ${SOUND_RULE}`);
        if (form.mustContain) lines.push(`Every ${shape ? 'full ' : ''}name must contain the letters "${String(form.mustContain).trim()}" (any position).`);
        const likeLine = likeRule(form, shape ? (shape.roles.includes('given') ? 'given name' : 'main invented part') : phrase ? 'main word' : 'name');
        if (likeLine) lines.push(likeLine);
        lines.push('');
        // With "like" words, they beat the vibe: a typed word that doesn't fit the setting still wins, the setting only adjusts spelling.
        lines.push(likeLine
            ? 'What is being named comes first, then the "like" words: follow them even if they don\'t match the setting. The setting only adjusts spelling and flavor, never at the cost of the likeness. Each name also has a seed that only adds variety:'
            : 'The setting and what is being named come first. Each name also has a seed that only adds variety:');
        // Sound-alike seeds carry only a part to echo; skipping rules that don't apply means less overthinking.
        const echoOnly = seeds.length > 0 && seeds.every(s => s.likeFocus && !s.spark);
        // Real names get no inspiration word, so those rules would only be noise there.
        // (Other cases keep them as before: the bread fix in v0.1.9 was checked with them in.)
        const noSparkRules = realMode(form) !== 'invented' && !seeds.some(s => s.spark);
        if (!echoOnly && !noSparkRules) {
            lines.push('follow its sound hints. An inspiration word is only a loose mood: bend it to fit what is being named and the setting, and ignore it if it doesn\'t fit.');
            lines.push('Never put the inspiration object itself into the name or the note when it isn\'t part of what is being named (no "bus stop" in the name of a bread).');
        } else if (!echoOnly) {
            lines.push('follow its hints.');
        } else {
            lines.push('follow its hint.');
        }
        const main = shape ? (shape.roles.includes('given') ? 'given name: ' : 'main invented part: ') : '';
        seeds.forEach((s, i) => {
            const parts = [];
            if (s.shape) parts.push(`shape: ${s.shape}`);
            if (s.start) parts.push(`${phrase ? 'main word starts' : 'starts'} with "${s.start}"`);
            if (s.syllables) parts.push(`${phrase ? 'main word ' : ''}${s.syllables} syllable${s.syllables === 1 ? '' : 's'}`);
            if (s.ending) parts.push(`ends with "${s.ending}"`);
            if (!sound && s.texture) parts.push(`${s.texture} sound`);
            if (s.likeFocus) parts.push(`echo the "like" word${likeWords(form).length > 1 ? 's' : ''} mostly in ${s.likeFocus}`);
            if (!parts.length) parts.push('follow the "like" words above');
            if (s.spark) parts.push(`inspiration: "${s.spark}"`);
            lines.push(`${i + 1}. ${main}${parts.join(', ')}${s.family ? `; family name: ${s.family}` : ''}`);
        });
        if (seeds.length > 1 && !echoOnly) lines.push('Across the batch, don\'t build two names or notes on the same idea or image (not three "neon" names).');
        if (avoid.length) {
            lines.push('');
            lines.push(`Do NOT use these names or close variants: ${avoid.join(', ')}.`);
        }
        lines.push('');
        lines.push(`For each name add a short note (under 12 words) in ${lang === 'ko' ? 'Korean' : 'English'} about how it fits this setting. Don't claim a real meaning unless you are sure.`);
        if (opts.reading) lines.push(`Also add ${readingRule(lang, !!shape)}.`);
        if (opts.nicks) lines.push(NICK_RULE);
        lines.push('Reply with ONLY a JSON array, nothing else:');
        lines.push(answerJson(shape, { reading: opts.reading, real: mode !== 'invented' && realRoles(form).length > 0, nicks: opts.nicks }));
        return [
            { role: 'system', content: 'You are a naming assistant for fiction writers. You invent fresh, pronounceable names and avoid overused, cliché names.' },
            { role: 'user', content: lines.join('\n') },
        ];
    }

    // Variants of one name that keep its feel but move its sound one way.
    function buildRefineMessages(src, mode, form, opts = {}) {
        const lang = opts.lang || 'en';
        const avoid = opts.avoid || [];
        const count = opts.count || 3;
        const shape = src.pieces ? nameShape(form) : null;
        const lines = [];
        if (shape) {
            lines.push(`Here is a full name for a person: "${src.name}" (${namedPieces(src)}).`);
            lines.push(...shapeLines(shape, form.vibe));
        } else {
            lines.push(`Here is a name for ${targetText(form)}: "${src.name}".`);
        }
        lines.push(`Setting / vibe: ${vibeText(form)}.`);
        lines.push(`Make ${count} new variant${count === 1 ? '' : 's'} that keep its overall feel and rough shape, but change it to be ${REFINE_DESC[mode] || REFINE_DESC.soft}.`);
        if (shape) lines.push('Reshape mostly the given and middle names (and other invented parts); keep titles and particles unless they clash.');
        lines.push(SOUND_RULE);
        lines.push('Each variant must be clearly different from the original and from each other. Keep Western, English-readable spelling.');
        lines.push(...shapeRules(form));
        lines.push('Change the sounds inside the name, not just by gluing a letter on the end. Every variant must be easy to pronounce (no clusters like "-etd").');
        lines.push('Also cut sounds that pull the other way (for "sharper", drop soft r/l/m endings; for "softer", drop hard k/t/g stops).');
        // With a real-names choice, a variant landing on a real name is fine; it just gets marked.
        const real = realMode(form) !== 'invented' && realRoles(form).length > 0;
        if (real) lines.push(...realRule(form).slice(1));
        else lines.push('Avoid anything only a letter or two away from a well-known real or mythological name (like Bridget or Thor).');
        if (avoid.length) lines.push(`Do NOT use these names or close variants: ${avoid.join(', ')}.`);
        lines.push('');
        lines.push(`For each variant add a short note (under 10 words) in ${lang === 'ko' ? 'Korean' : 'English'} about what changed in the sound.`);
        if (opts.reading) lines.push(`Also add ${readingRule(lang, !!shape)}.`);
        if (opts.nicks) lines.push(NICK_RULE);
        lines.push('Reply with ONLY a JSON array, nothing else:');
        lines.push(answerJson(shape, { reading: opts.reading, real, nicks: opts.nicks }));
        return [
            { role: 'system', content: 'You are a naming assistant for fiction writers who understands phonetics and how sounds feel.' },
            { role: 'user', content: lines.join('\n') },
        ];
    }

    // The real-names choice for one swapped part (given, middle or family only).
    function realPieceRule(form, role) {
        if (!realRoles(form).includes(role)) return '';
        const mode = realMode(form);
        if (mode === 'invented') return "Invent it; don't hand back a name that real people commonly have.";
        const hint = REAL_VIBE_HINT[form.vibe] ? ` ${REAL_VIBE_HINT[form.vibe]}` : '';
        return realPieceBase(mode) + hint;
    }
    function realPieceBase(mode) {
        if (mode === 'near') return 'Base it on a real name people use in this setting, changed a little so it is new but still feels familiar.';
        if (mode === 'mix') return 'It may be a real name people use in this setting or an invented one.';
        return 'Use a real name that people actually use in this setting.';
    }

    // A new version of just one part of a full name; the rest stays.
    function buildPieceMessages(src, role, form, opts = {}) {
        const lang = opts.lang || 'en';
        const avoid = opts.avoid || [];
        const current = src.pieces.find(p => p.role === role)?.text || '';
        const lines = [];
        lines.push(`Here is a full name for a person: "${src.name}" (${namedPieces(src)}).`);
        lines.push(`Setting / vibe: ${vibeText(form)}.`);
        lines.push(`Replace only its ${role} part, now "${current}". The new part is a ${pieceDesc(role, form.vibe)}.`);
        const vibeRule = personVibeRule({ ...form, target: 'person' });
        if (vibeRule) lines.push(vibeRule);
        lines.push('It must fit the rest of the name and the setting, and be clearly different from the current one. Keep Western, English-readable spelling.');
        if (form.gender && form.gender !== 'any' && ['given', 'middle', 'title', 'religious'].includes(role)) lines.push(`Gender feel: ${form.gender}.`);
        if (role === 'given') { const likeLine = likeRule(form, 'given name'); if (likeLine) lines.push(likeLine); }
        const real = realPieceRule(form, role);
        if (real) lines.push(real);
        const realAsk = !!real && realMode(form) !== 'invented';
        if (realAsk) lines.push('Add "real": true if it is a real name people actually use, otherwise false.');
        if (avoid.length) lines.push(`Do NOT use these names or close variants: ${avoid.join(', ')}.`);
        lines.push('');
        if (opts.reading) lines.push(`Also add ${readingRule(lang, true)} — the whole name with the new part.`);
        const nicks = !!opts.nicks && role === 'given';
        if (nicks) lines.push(NICK_RULE);
        lines.push('Reply with ONLY a JSON array with one item, nothing else. "name" is the new part only, without quotes or brackets:');
        const bits = ['"name": "..."'];
        if (opts.reading) bits.push('"read": "..."');
        if (realAsk) bits.push('"real": false');
        if (nicks) bits.push('"nicks": ["...", "..."]');
        lines.push(`[{${bits.join(', ')}}]`);
        return [
            { role: 'system', content: 'You are a naming assistant for fiction writers. You invent fresh, pronounceable names and avoid overused, cliché names.' },
            { role: 'user', content: lines.join('\n') },
        ];
    }

    // ---------- reading the answer ----------
    function stripThinking(text) {
        return String(text || '').replace(/<think(?:ing)?>[\s\S]*?<\/think(?:ing)?>/gi, '').trim();
    }

    // A real name never has JSON bits in it (a cut-off answer once showed up as the name '[{"parts').
    function looksLikeName(n) {
        return typeof n === 'string' && n.trim() !== '' && !/[{}\[\]]|":/.test(n);
    }
    // Each complete {...} at the top of the array, so a cut-off answer still gives its finished names.
    function salvageObjects(text) {
        const found = [];
        let depth = 0, inStr = false, esc = false, begin = -1;
        for (let i = text.indexOf('[') + 1; i > 0 && i < text.length; i++) {
            const ch = text[i];
            if (inStr) { if (esc) esc = false; else if (ch === '\\') esc = true; else if (ch === '"') inStr = false; continue; }
            if (ch === '"') inStr = true;
            else if (ch === '{') { if (depth++ === 0) begin = i; }
            else if (ch === '}' && depth > 0 && --depth === 0) {
                try { found.push(JSON.parse(text.slice(begin, i + 1))); } catch { /* skip a broken one */ }
            }
        }
        return found;
    }
    // True when the answer started a JSON array but never finished it.
    function answerCut(raw) {
        const text = stripThinking(raw).replace(/```(?:json)?/gi, '').trim();
        const start = text.indexOf('[');
        if (start === -1) return false;
        try { JSON.parse(text.slice(start, text.lastIndexOf(']') + 1)); return false; } catch { return true; }
    }

    // Nothing left once the thinking is gone (also an unclosed <think> that ate all the tokens).
    function answerEmpty(raw) {
        return !stripThinking(raw).replace(/<think(?:ing)?>[\s\S]*$/i, '').replace(/```(?:json)?/gi, '').trim();
    }
    // Which "couldn't read it" message fits this answer.
    function failText(raw, L = T()) {
        if (answerEmpty(raw)) return L.err(/<think/i.test(String(raw || '')) ? L.thinkFail : L.emptyFail);
        return L.err(answerCut(raw) ? L.cutFail : L.parseFail);
    }

    // "real": true / "yes" for a one-word name, or a list of parts (["given", "family"]) for a full name.
    function realFrom(v) {
        if (v === true || (typeof v === 'string' && /^\s*(true|yes)\s*$/i.test(v))) return { real: true };
        const list = Array.isArray(v) ? v : typeof v === 'string' ? v.split(/[,\s]+/) : [];
        const parts = [...new Set(list.map(x => String(x).trim().toLowerCase()).filter(x => REAL_ROLES.includes(x)))];
        return parts.length ? { real: true, realParts: parts } : {};
    }

    function parseNames(raw) {
        const text = stripThinking(raw).replace(/```(?:json)?/gi, '');
        const out = [];
        const start = text.indexOf('[');
        const end = text.lastIndexOf(']');
        let arr = null;
        if (start !== -1 && end > start) {
            try { arr = JSON.parse(text.slice(start, end + 1)); } catch { /* try the pieces below */ }
        }
        if (!Array.isArray(arr) && start !== -1) arr = salvageObjects(text);
        if (Array.isArray(arr)) {
            for (const it of arr) {
                if (typeof it === 'string') out.push({ name: it, note: '' });
                else if (it && typeof it === 'object') {
                    const parts = it.parts && typeof it.parts === 'object' && !Array.isArray(it.parts) ? it.parts : null;
                    out.push({
                        name: String(it.name ?? ''), note: String(it.note ?? it.meaning ?? ''), read: String(it.read ?? it.reading ?? it.pronunciation ?? ''),
                        ...(parts ? { parts } : {}), ...realFrom(it.real), ...(it.nicks ?? it.nicknames ? { nicks: it.nicks ?? it.nicknames } : {}),
                    });
                }
            }
        }
        if (!out.length) {
            // "1. Name — note" / "- **Name**: note". Lines of broken JSON are not names.
            for (const line of text.split('\n')) {
                if (/[{\[]|":/.test(line)) continue;
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
                const nicks = n.nicks ? cleanNicks(n.nicks, name) : [];
                return {
                    name, note: n.note.trim(), read: read.slice(0, 80), ...(n.parts ? { parts: n.parts } : {}),
                    ...(n.real ? { real: true } : {}), ...(n.realParts ? { realParts: n.realParts } : {}), ...(nicks.length ? { nicks } : {}),
                };
            })
            .filter(n => n.parts || (n.name && n.name.length <= 40 && looksLikeName(n.name)));
    }

    function filterNames(list, avoid) {
        const banned = new Set(avoid.map(a => a.toLowerCase()));
        const seen = new Set();
        return list.filter(n => {
            const key = n.name.toLowerCase();
            if (banned.has(key) || seen.has(key)) return false;
            if (n.pieces && memoryNames(n).some(t => banned.has(t.toLowerCase()))) return false;
            seen.add(key);
            return true;
        });
    }

    // ---------- talking to the AI (same path as Crib Note) ----------
    function getProfiles() {
        return ctx().extensionSettings?.connectionManager?.profiles || [];
    }

    async function requestLLM(messages, { profileId, maxTokens, signal, sendPreset = false, reasoning = 'default' } = {}) {
        const c = ctx();
        signal?.throwIfAborted();
        // Thinking that came back separately is kept (as <think>…</think>) so "See the answer" can show it.
        // It is stripped before reading names, so it never turns into a name.
        const content = res => {
            if (typeof res === 'string') return res;
            const text = String(res?.content ?? '');
            const thought = String(res?.reasoning ?? res?.reasoning_content ?? '').trim();
            return thought && !/<think/i.test(text) ? `<think>${thought}</think>\n${text}` : text;
        };

        // Without the preset, nothing told a thinking model how long to think, so it could spend every token on it.
        const effort = reasoning && reasoning !== 'default' ? { reasoning_effort: reasoning } : {};

        if (profileId) {
            const svc = c.ConnectionManagerRequestService;
            if (!svc) throw new Error(T().noProfileApi);
            const res = await svc.sendRequest(profileId, messages, maxTokens, {
                stream: false, signal, extractData: true, includePreset: !!sendPreset, includeInstruct: true,
            }, effort);
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
                ...effort,
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

    function tokensFor(count, st = settings(), heavy = false) {
        return Math.max(clampInt(st.maxTokens, 200, MAX_TOKENS_CAP, DEFAULTS.maxTokens), 300 + count * (heavy ? 160 : 100));
    }

    // ---------- state ----------
    let busy = false;
    let controller = null;
    let results = [];
    let status = { kind: 'idle', text: '' };
    let rawOpen = false; // "see the answer" box, closed again on each new request
    let loadingTimer = null;
    let menuFor = null;   // the result whose reshape menu is open
    let refining = null;  // { src, mode, ctl } while a reshape request runs
    let view = 'form';    // 'form' or 'settings' (the ⚙ page inside the window)

    // ---------- the panel ----------
    function optionList(map, current) {
        return Object.entries(map).map(([k, label]) =>
            `<option value="${escapeHtml(k)}"${k === current ? ' selected' : ''}>${escapeHtml(label)}</option>`).join('');
    }

    // The whole top stays put while the panel scrolls, so ⚙ and ✕ are always in reach.
    function headerHtml(theme) { return `<div class="tbd-top">${headerInner(theme)}</div>`; }

    function headerInner(theme) {
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
        // Cache mode hides the AI-only fields (they stay in the page, so the form keeps their values).
        const cache = isCache(form);
        const canCache = form.target === 'person' || form.target === 'place';
        return `<div class="tbd-form${cache ? ' tbd-cache' : ''}">
            ${canCache ? methodHtml(form) : ''}
            <label>${escapeHtml(L.target)}${selectHtml('tbd_target', L.t, form.target)}</label>
            <label class="tbd-ai-only">${escapeHtml(L.vibe)}${selectHtml('tbd_vibe', L.v, form.vibe)}</label>
            <label class="tbd-wide tbd-ai-only" id="tbd_custom_wrap"${form.vibe === 'custom' ? '' : ' hidden'}><input id="tbd_custom" class="text_pole" type="text" maxlength="80" placeholder="${escapeHtml(L.customVibePh)}" value="${escapeHtml(form.customVibe)}"></label>
            <label id="tbd_gender_wrap"${form.target === 'person' ? '' : ' hidden'}>${escapeHtml(L.gender)}${selectHtml('tbd_gender', L.g, form.gender)}</label>
            ${kinds ? `<label id="tbd_kind_wrap">${escapeHtml(L.kind)}${selectHtml('tbd_kind', L.k[form.target], kind)}</label>` : ''}
            <label>${escapeHtml(L.length)}${selectHtml('tbd_length', L.l, form.length)}</label>
            ${detailLabel ? `<label class="tbd-wide tbd-ai-only" id="tbd_kindtext_wrap">${escapeHtml(detailLabel)}<input id="tbd_kindtext" class="text_pole" type="text" maxlength="${DETAIL_MAX}" placeholder="${escapeHtml(detailPh)}" value="${escapeHtml(form.kindText || '')}"></label>` : ''}
            ${cache ? cacheChipsHtml(form) : ''}
            ${form.target === 'person' ? personPartsHtml(form) : ''}
            ${moreFoldHtml(form)}
            <div class="tbd-more" id="tbd_more"${settings().moreOpen ? '' : ' hidden'}>
            <label>${escapeHtml(L.sound)}${selectHtml('tbd_sound', L.s, form.sound || 'any')}</label>
            <label>${escapeHtml(L.mustContain)}<input id="tbd_must" class="text_pole" type="text" maxlength="20" placeholder="${escapeHtml(L.mustContainPh)}" value="${escapeHtml(form.mustContain)}"></label>
            <label class="tbd-ai-only">${escapeHtml(L.like)}<input id="tbd_like" class="text_pole" type="text" maxlength="${LIKE_MAX}" placeholder="${escapeHtml(L.likePh)}" value="${escapeHtml(form.likeText || '')}"></label>
            <label class="tbd-ai-only">${escapeHtml(L.likeMode)}${selectHtml('tbd_likemode', L.likeModes, form.likeMode === 'feel' ? 'feel' : 'sound')}</label>
            ${form.target === 'person' ? `<label class="tbd-wide tbd-ai-only" id="tbd_real_wrap">${escapeHtml(L.realNames)}${selectHtml('tbd_realnames', L.realOpts, realMode(form))}</label>` : ''}
            </div>
            <button id="tbd_go" class="tbd-go menu_button">${escapeHtml(busy ? L.cancel : L.find)}</button>
        </div>`;
    }

    function chipHtml(group, v, label, on) {
        return `<button type="button" class="tbd-chip" data-chip="${group}" data-v="${v}" aria-pressed="${on ? 'true' : 'false'}">${escapeHtml(label)}</button>`;
    }
    // AI or Cache (people and places only).
    function methodHtml(form) {
        const L = T();
        const m = isCache(form) ? 'cache' : 'ai';
        return `<div class="tbd-wide tbd-chipset"><div class="tbd-chips-label">${escapeHtml(L.method)}</div>
            <div class="tbd-chips">${['ai', 'cache'].map(v => chipHtml('method', v, L.methods[v], m === v)).join('')}</div></div>`;
    }
    // Roots (and, for people, kinds of name). Several can be on; the last one stays on.
    function cacheChipsHtml(form) {
        const L = T();
        const roots = cacheRoots(form);
        const kinds = cacheKinds(form);
        return `<div class="tbd-wide tbd-chipset"><div class="tbd-chips-label">${escapeHtml(L.rootsLabel)}</div>
            <div class="tbd-chips">${CACHE_ROOTS.map(v => chipHtml('root', v, L.roots[v], roots.includes(v))).join('')}</div>
            ${form.target === 'person' ? `<div class="tbd-chips-label">${escapeHtml(L.ckLabel)}</div>
            <div class="tbd-chips">${CACHE_KINDS.map(v => chipHtml('ckind', v, L.ck[v], kinds.includes(v))).join('')}</div>` : ''}</div>`;
    }

    // Toggle buttons for what a person's name is made of, plus the kept family name.
    function personPartsHtml(form) {
        const L = T();
        const parts = Array.isArray(form.parts) ? form.parts : ['given'];
        const extras = Array.isArray(form.extras) ? form.extras : [];
        const chip = (group, v, label, on) =>
            `<button type="button" class="tbd-chip" data-chip="${group}" data-v="${v}" aria-pressed="${on ? 'true' : 'false'}">${escapeHtml(label)}</button>`;
        return `<div class="tbd-wide tbd-chipset">
                <div class="tbd-chips-label">${escapeHtml(L.parts)}</div>
                <div class="tbd-chips">${NAME_PARTS.map(v => chip('part', v, L.pc[v], parts.includes(v))).join('')}</div>
                ${extrasFoldHtml(extras)}
                <div class="tbd-chips tbd-ai-only" id="tbd_extras_chips"${settings().extrasOpen ? '' : ' hidden'}>${NAME_EXTRAS.map(v => chip('extra', v, L.ex[v], extras.includes(v))).join('')}</div>
            </div>
            <label class="tbd-wide" id="tbd_fixed_wrap"${parts.includes('family') ? '' : ' hidden'}>${escapeHtml(L.fixedFamily)}<input id="tbd_fixed" class="text_pole" type="text" maxlength="40" placeholder="${escapeHtml(L.fixedFamilyPh)}" value="${escapeHtml(form.fixedFamily || '')}"></label>`;
    }

    // Less-used conditions fold away to one line; when folded, the ones that were changed still show.
    function moreFoldHtml(form) {
        const L = T();
        const open = !!settings().moreOpen;
        const on = [];
        if (form.sound && form.sound !== 'any') on.push(`${L.sound}: ${L.s[form.sound]}`);
        if (String(form.mustContain || '').trim()) on.push(`${L.mustContain}: ${String(form.mustContain).trim()}`);
        const like = isCache(form) ? [] : likeWords(form);
        if (like.length) on.push(`${L.like.replace(/\s*\(.*\)\s*$/, '')}: ${like.join(', ')}`);
        if (!isCache(form) && form.target === 'person' && realMode(form) !== 'invented') on.push(L.realOpts[realMode(form)]);
        const sum = !open && on.length ? `<span class="tbd-fold-sum">: ${escapeHtml(on.join(' · '))}</span>` : '';
        return `<button type="button" id="tbd_more_fold" class="tbd-fold tbd-wide" aria-expanded="${open ? 'true' : 'false'}"><i class="fa-solid fa-chevron-${open ? 'down' : 'right'}" aria-hidden="true"></i><span>${escapeHtml(L.more)}${sum}</span></button>`;
    }

    // Extras fold away to one line; when folded, the ones that are on still show.
    function extrasFoldHtml(extras) {
        const L = T();
        const open = !!settings().extrasOpen;
        const on = NAME_EXTRAS.filter(v => extras.includes(v)).map(v => L.ex[v]);
        const sum = !open && on.length ? `<span class="tbd-fold-sum">: ${escapeHtml(on.join(', '))}</span>` : '';
        return `<button type="button" id="tbd_extras_fold" class="tbd-fold tbd-ai-only" aria-expanded="${open ? 'true' : 'false'}"><i class="fa-solid fa-chevron-${open ? 'down' : 'right'}" aria-hidden="true"></i><span>${escapeHtml(L.extras)}${sum}</span></button>`;
    }

    // Each part of a full name: tap it to copy, 🔄 to swap just that part.
    function piecesHtml(r) {
        if (!r.pieces || r.pieces.length < 2) return '';
        const L = T();
        return `<div class="tbd-pieces">${r.pieces.map((p, k) => {
            const label = L.pc[p.role] || L.ex[p.role] || p.role;
            return `<span class="tbd-piece" data-k="${k}"><button class="tbd-piece-copy" title="${escapeHtml(`${label} — ${L.copyPiece}`)}"><i class="fa-regular fa-copy" aria-hidden="true"></i><span>${escapeHtml(p.text)}</span></button>${p.fixed ? ''
                : `<button class="tbd-piece-roll" title="${escapeHtml(L.rerollPiece)}" aria-label="${escapeHtml(`${label}: ${L.rerollPiece}`)}"${refining ? ' disabled' : ''}><i class="fa-solid fa-rotate-right"></i></button>`}</span>`;
        }).join('')}</div>`;
    }

    function resultsHtml() {
        const L = T();
        if (busy) return `<div class="tbd-log" id="tbd_log"></div>`;
        if (!results.length) return `<div class="tbd-empty">${escapeHtml(L.empty)}</div>`;
        const reading = !!settings().showReading;
        const showNicks = !!settings().nicknames;
        return results.map((r, i) => {
            const depth = r.depth || 0;
            const tag = r.tag && L.r[r.tag] ? `<span class="tbd-tag">${escapeHtml(L.r[r.tag])}</span>` : '';
            const words = wordHits(r);
            const wordTag = words.length ? `<span class="tbd-tag tbd-word-tag" title="${escapeHtml(L.wordTip)}">${escapeHtml(L.wordTag(words))}</span>` : '';
            const realTag = r.real ? `<span class="tbd-tag tbd-word-tag" title="${escapeHtml(L.realTip)}">${escapeHtml(L.realTag)}</span>` : '';
            const clicheTag = clicheHit(r) ? `<span class="tbd-tag tbd-word-tag" title="${escapeHtml(L.clicheTip)}">${escapeHtml(L.clicheTag)}</span>` : '';
            const canonTag = canonHit(r) ? `<span class="tbd-tag tbd-word-tag" title="${escapeHtml(L.canonTip)}">${escapeHtml(L.canonTag)}</span>` : '';
            const cacheTag = r.cache ? `<span class="tbd-tag tbd-word-tag" title="${escapeHtml(L.cacheTip)}">${escapeHtml(L.cacheTag)}</span>` : '';
            const nicks = showNicks && r.nicks?.length ? `<div class="tbd-nicks"><span class="tbd-nicks-label">${escapeHtml(L.nicks)}:</span>${r.nicks.map((n, k) =>
                `${k ? '<span class="tbd-nick-dot" aria-hidden="true">·</span>' : ''}<button type="button" class="tbd-nick" data-n="${k}" title="${escapeHtml(L.nickCopy)}">${escapeHtml(n)}</button>`).join('')}</div>` : '';
            const menu = menuFor === r ? `<div class="tbd-refine-menu">${REFINE_MODES.map(m =>
                `<button class="tbd-small-btn tbd-refine-pick" data-mode="${m}">${escapeHtml(L.r[m])}</button>`).join('')}</div>` : '';
            const working = refining && refining.src === r
                ? `<div class="tbd-refining tbd-log"><div>${refining.kind === 'reroll' ? escapeHtml(L.rerolling) : refining.kind === 'piece' ? escapeHtml(L.rerollingPiece) : `${escapeHtml(L.refining)} (${escapeHtml(L.r[refining.mode])})`}</div></div>
                   <div class="tbd-refine-menu"><button class="tbd-small-btn tbd-refine-cancel">${escapeHtml(L.refineCancel)}</button></div>` : '';
            return `<div class="tbd-row${depth ? ' tbd-variant' : ''}" data-i="${i}" style="--tbd-depth:${depth}">
                <div class="tbd-row-main">
                    <div class="tbd-row-text"><div class="tbd-name">${depth ? '<span class="tbd-branch">↳</span>' : ''}${escapeHtml(r.name)}${reading && r.read ? `<span class="tbd-read">${escapeHtml(r.read)}</span>` : ''}${tag}${cacheTag}${realTag}${wordTag}${clicheTag}${canonTag}</div>${nicks}${fragsHtml(r)}${r.note ? `<div class="tbd-note">${escapeHtml(r.note)}</div>` : ''}</div>
                    <button class="tbd-icon-btn tbd-refine${menuFor === r ? ' tbd-on' : ''}" title="${escapeHtml(L.refineBtn)}" aria-label="${escapeHtml(L.refineBtn)}"${refining ? ' disabled' : ''}><i class="fa-solid fa-wand-magic-sparkles"></i></button>
                    <button class="tbd-icon-btn tbd-reroll" title="${escapeHtml(L.rerollBtn)}" aria-label="${escapeHtml(L.rerollBtn)}"${refining ? ' disabled' : ''}><i class="fa-solid fa-rotate-right"></i></button>
                    <button class="tbd-icon-btn tbd-copy" title="${escapeHtml(L.copy)}" aria-label="${escapeHtml(L.copy)}"><i class="fa-regular fa-copy"></i></button>
                    <button class="tbd-icon-btn tbd-check-btn${r.check && !r.check.hidden && !r.check.quiet ? ' tbd-on' : ''}" title="${escapeHtml(L.checkBtn)}" aria-label="${escapeHtml(L.checkBtn)}"><i class="fa-solid fa-magnifying-glass"></i></button>
                </div>${checkHtml(r)}${piecesHtml(r)}${menu}${working}
            </div>`;
        }).join('');
    }

    function footerHtml() {
        const L = T();
        const again = results.length && !busy && !refining ? `<button id="tbd_again" class="tbd-small-btn"><i class="fa-solid fa-rotate"></i> ${escapeHtml(L.again)}</button>` : '';
        // When an answer couldn't be used, let the user see what actually came back.
        const hasRaw = status.kind === 'error' && typeof status.raw === 'string';
        const rawBtn = hasRaw ? `<button id="tbd_raw_btn" class="tbd-small-btn" aria-expanded="${rawOpen}">${escapeHtml(rawOpen ? L.hideRaw : L.showRaw)}</button>` : '';
        const rawBox = hasRaw && rawOpen ? `<pre class="tbd-raw">${escapeHtml(status.raw.trim() ? status.raw.slice(0, 20000) : L.rawEmpty)}</pre>` : '';
        return `<span class="tbd-status tbd-status-${status.kind}">${escapeHtml(status.text)}</span>${rawBtn}${again}${rawBox}`;
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
            likeText: String($('#tbd_like').val() || '').slice(0, LIKE_MAX),
            likeMode: $('#tbd_likemode').val() === 'feel' ? 'feel' : 'sound',
            realNames: REAL_MODES.includes($('#tbd_realnames').val()) ? $('#tbd_realnames').val() : (REAL_MODES.includes(st.form.realNames) ? st.form.realNames : 'invented'),
            parts: Array.isArray(st.form.parts) ? st.form.parts : ['given'],
            extras: Array.isArray(st.form.extras) ? st.form.extras : [],
            fixedFamily: String($('#tbd_fixed').val() ?? st.form.fixedFamily ?? '').slice(0, 40),
            method: st.form.method === 'cache' ? 'cache' : 'ai',
            roots: cacheRoots(st.form),
            ckinds: cacheKinds(st.form),
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
        const avoid = avoidList(st, form);
        if (isCache(form)) { cacheGenerate(form, count, avoid, st); return; }
        const messages = buildMessages(form, rollSeeds(count, form), { lang, avoid, reading: !!st.showReading, nicks: nickOn(form, st) });

        busy = true;
        controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const myController = controller;
        status = { kind: 'busy', text: '' }; rawOpen = false;
        renderResultsOnly();
        try {
            const raw = await requestLLM(messages, { profileId: st.profileId, sendPreset: !!st.sendPreset, reasoning: st.reasoning, maxTokens: tokensFor(count, st, !!nameShape(form)), signal: myController?.signal });
            if (myController && myController.signal.aborted) return;
            if (controller !== myController) return;
            const parsed = applyShape(parseNames(raw), form);
            const kept = keepNames(parsed, avoid, form, st);
            const cut = answerCut(raw);
            if (!parsed.length) {
                status = { kind: 'error', text: failText(raw), raw };
            } else if (!kept.length) {
                status = { kind: 'error', text: T().err(T().allFiltered), raw };
            } else {
                const used = { ...form };
                results = kept.slice(0, count).map(k => ({ ...k, form: used }));
                rememberNames(results.flatMap(memoryNames), st); refreshHistory();
                save();
                status = cut ? { kind: 'error', text: T().foundCut(results.length) } : { kind: 'ok', text: T().found(results.length) };
                autoCheck(results);
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

    // Cache names are made right here: no request, no waiting.
    function cacheGenerate(form, count, avoid, st) {
        const made = cacheNames(form, count, avoid);
        rawOpen = false;
        if (!made.length) {
            status = { kind: 'error', text: T().err(T().cacheEmpty) };
        } else {
            const used = { ...form };
            results = made.map(n => ({ ...n, form: used }));
            rememberNames(results.flatMap(memoryNames), st); refreshHistory();
            save();
            status = { kind: 'ok', text: T().foundCache(results.length) };
            autoCheck(results);
        }
        renderResultsOnly();
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
        // A Cache name goes to the AI as one whole name, with its roots in place of a vibe.
        const form = aiForm(src.form || st.form, src);
        const base = src.cache ? { ...src, pieces: undefined } : src;
        const avoid = [...new Set([...avoidList(st, form), ...results.flatMap(memoryNames)])];
        const messages = buildRefineMessages(base, mode, form, { lang: detectLang(), avoid, reading: !!st.showReading, nicks: nickOn(form, st) });
        const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const job = { src, mode, ctl, kind: 'refine' };
        refining = job;
        menuFor = null;
        status = { kind: 'busy', text: '' }; rawOpen = false;
        renderResultsOnly();
        try {
            const raw = await requestLLM(messages, { profileId: st.profileId, sendPreset: !!st.sendPreset, reasoning: st.reasoning, maxTokens: tokensFor(3, st, !!base.pieces), signal: ctl?.signal });
            if (refining !== job) return;
            const parsed = base.pieces ? applyShape(parseNames(raw), form) : parseNames(raw);
            const kept = keepNames(parsed, avoid, form, st).slice(0, 3);
            const at = results.indexOf(src);
            if (!parsed.length) status = { kind: 'error', text: failText(raw, L), raw };
            else if (!kept.length) status = { kind: 'error', text: L.err(L.allFiltered), raw };
            else if (at !== -1) {
                // Put the variants under their source, after any variants it already has.
                const depth = src.depth || 0;
                let j = at + 1;
                while (j < results.length && (results[j].depth || 0) > depth) j++;
                results.splice(j, 0, ...kept.map(k => ({ ...k, depth: Math.min(depth + 1, 3), tag: mode, from: src, form: src.form })));
                rememberNames(kept.flatMap(memoryNames), st); refreshHistory();
                save();
                status = { kind: 'ok', text: L.variants(kept.length) };
                autoCheck(results.filter(x => x.from === src && !x.check));
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
        const isVariant = (src.depth || 0) > 0 && src.from && REFINE_DESC[src.tag];
        // A first-round Cache name is remade from the cache, right away and for free.
        if (!isVariant && src.cache) { cacheReroll(src, st); return; }
        const from = isVariant && src.from.cache ? { ...src.from, pieces: undefined } : src.from;
        const form = aiForm(src.form || st.form, isVariant ? src.from : src);
        const avoid = [...new Set([...avoidList(st, form), ...results.flatMap(memoryNames)])];
        const nicks = nickOn(form, st);
        const messages = isVariant
            ? buildRefineMessages(from, src.tag, form, { lang, avoid, count: 1, reading: !!st.showReading, nicks })
            : buildMessages(form, rollSeeds(1, form), { lang, avoid, reading: !!st.showReading, nicks });
        const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const job = { src, ctl, kind: 'reroll' };
        refining = job;
        menuFor = null;
        status = { kind: 'busy', text: '' }; rawOpen = false;
        renderResultsOnly();
        try {
            const raw = await requestLLM(messages, { profileId: st.profileId, sendPreset: !!st.sendPreset, reasoning: st.reasoning, maxTokens: tokensFor(1, st, !!nameShape(form)), signal: ctl?.signal });
            if (refining !== job) return;
            const parsed = isVariant && !from.pieces ? parseNames(raw) : applyShape(parseNames(raw), form);
            const kept = keepNames(parsed, avoid, form, st);
            const at = results.indexOf(src);
            if (!parsed.length) status = { kind: 'error', text: failText(raw, L), raw };
            else if (!kept.length) status = { kind: 'error', text: L.err(L.allFiltered), raw };
            else if (at !== -1) {
                const fresh = { ...src, name: kept[0].name, note: kept[0].note, read: kept[0].read, pieces: kept[0].pieces, real: kept[0].real, nicks: kept[0].nicks };
                for (const k of ['pieces', 'real', 'nicks']) if (!fresh[k]) delete fresh[k];
                delete fresh.check; // the old name's check is not about this one
                // Variants hanging under the old name no longer fit, so they go with it.
                const depth = src.depth || 0;
                let end = at + 1;
                while (end < results.length && (results[end].depth || 0) > depth) end++;
                results.splice(at, end - at, fresh);
                rememberNames(memoryNames(fresh), st); refreshHistory();
                save();
                status = { kind: 'ok', text: L.rerolled };
                autoCheck([fresh]);
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

    function cacheReroll(src, st) {
        const form = src.form || st.form;
        const avoid = [...new Set([...avoidList(st, form), ...results.flatMap(memoryNames)])];
        const one = { ...form, roots: [src.root || cacheRoots(form)[0]] };
        const [n] = cacheNames(one, 1, avoid);
        const at = results.indexOf(src);
        if (!n) status = { kind: 'error', text: T().err(T().cacheEmpty) };
        else if (at !== -1) {
            const fresh = { ...n, form: src.form };
            const depth = src.depth || 0;
            let end = at + 1;
            while (end < results.length && (results[end].depth || 0) > depth) end++;
            results.splice(at, end - at, fresh);
            rememberNames(memoryNames(fresh), st); refreshHistory();
            save();
            status = { kind: 'ok', text: T().rerolled };
            autoCheck([fresh]);
        }
        menuFor = null;
        renderResultsOnly();
    }
    function cacheRerollPiece(src, k, st) {
        const form = src.form || st.form;
        const avoid = [...new Set([...avoidList(st, form), ...results.flatMap(memoryNames)])];
        const next = cachePiece(src, k, form, avoid);
        if (!next) status = { kind: 'error', text: T().err(T().cacheEmpty) };
        else {
            src.pieces = src.pieces.map((p, j) => (j === k ? next : p));
            src.name = src.pieces.map(p => p.text).join(' ');
            delete src.check;
            if (NAME_ROLES.includes(next.role)) { rememberNames([next.text], st); refreshHistory(); }
            save();
            status = { kind: 'ok', text: T().pieceRerolled };
            autoCheck([src]);
        }
        menuFor = null;
        renderResultsOnly();
    }

    // Swap one part of a full name (keep "Holloway", swap "Mira").
    async function rerollPiece(src, k) {
        if (busy || refining || !results.includes(src)) return;
        const piece = src.pieces?.[k];
        if (!piece || piece.fixed) return;
        if (src.cache) { cacheRerollPiece(src, k, settings()); return; }
        const st = settings();
        const L = T();
        const form = src.form || st.form;
        const avoid = [...new Set([...avoidList(st, form), ...results.flatMap(memoryNames)])];
        const reading = !!st.showReading;
        const nicks = nickOn(form, st);
        const messages = buildPieceMessages(src, piece.role, form, { lang: detectLang(), avoid, reading, nicks });
        const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const job = { src, ctl, kind: 'piece' };
        refining = job;
        menuFor = null;
        status = { kind: 'busy', text: '' }; rawOpen = false;
        renderResultsOnly();
        try {
            const raw = await requestLLM(messages, { profileId: st.profileId, sendPreset: !!st.sendPreset, reasoning: st.reasoning, maxTokens: tokensFor(1, st), signal: ctl?.signal });
            if (refining !== job) return;
            const parsed = parseNames(raw);
            const text = cleanPiece(parsed[0]?.name);
            const banned = new Set(avoid.map(a => a.toLowerCase()));
            // Only a real-names mode lets a part the AI called real through the word filter.
            const realOk = !!parsed[0]?.real && realMode(form) !== 'invented' && REAL_ROLES.includes(piece.role);
            if (!text) status = { kind: 'error', text: failText(raw, L), raw };
            else if (text.toLowerCase() === piece.text.toLowerCase() || (NAME_ROLES.includes(piece.role) && banned.has(text.toLowerCase()))
                || likeWords(form).some(w => w.toLowerCase() === text.toLowerCase())
                || (st.wordNames === 'filter' && !realOk && WORD_CHECK_ROLES.includes(piece.role) && WORD_NAMES.has(text.toLowerCase()))) {
                status = { kind: 'error', text: L.err(L.allFiltered) };
            } else if (results.includes(src) && src.pieces[k] === piece) {
                src.pieces = src.pieces.map((p, j) => {
                    if (j !== k) return p;
                    const next = { ...p, text };
                    delete next.real;
                    if (realOk) next.real = true;
                    return next;
                });
                if (src.pieces.some(p => p.real)) src.real = true; else delete src.real;
                // A new given name needs its own nicknames; the old ones would be for someone else.
                if (piece.role === 'given') {
                    const fresh = nicks ? cleanNicks(parsed[0].nicks, text) : [];
                    if (fresh.length) src.nicks = fresh; else delete src.nicks;
                }
                src.name = joinPieces(src.pieces);
                delete src.check;
                src.read = reading ? String(parsed[0].read || '').slice(0, 80) : '';
                if (NAME_ROLES.includes(piece.role)) { rememberNames([text], st); refreshHistory(); }
                save();
                status = { kind: 'ok', text: L.pieceRerolled };
                autoCheck([src]);
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

    // ---------- settings (left drawer and the ⚙ page share the same fields) ----------
    // Past names, newest first, each with its own forget button. Index points into st.history.
    function historyHtml(st, L) {
        if (!st.history.length) return `<div class="tbd-hist-empty">${escapeHtml(L.sHistoryEmpty)}</div>`;
        const items = [];
        for (let i = st.history.length - 1; i >= 0; i--) {
            items.push(`<span class="tbd-hist-item" data-i="${i}"><span class="tbd-hist-name">${escapeHtml(st.history[i])}</span>`
                + `<button type="button" class="tbd-hist-del" title="${escapeHtml(L.sHistoryRemove)}" aria-label="${escapeHtml(`${st.history[i]}: ${L.sHistoryRemove}`)}">×</button></span>`);
        }
        return items.join('');
    }

    // Update the count, and the list where it's open. Closed lists are filled when opened.
    function refreshHistory() {
        const st = settings();
        const L = T();
        $('.tbd-hist').each(function () {
            $(this).children('summary').text(L.sHistoryShow.replace('{n}', String(st.history.length)));
            const $list = $(this).children('.tbd-hist-list');
            if (this.open) $list.html(historyHtml(st, L));
            else $list.empty();
        });
    }

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
            <input id="${id('tokens')}" class="text_pole" type="number" min="200" max="${MAX_TOKENS_CAP}" step="100" data-tbd-set="tokens">
            <small>${escapeHtml(L.sTokensHint)}</small>
            <label for="${id('theme')}">${escapeHtml(L.sTheme)}</label>${sel('theme', optionList(L.th, st.theme))}
            <label class="checkbox_label"><input id="${id('fx')}" type="checkbox" data-tbd-set="fx"><span>${escapeHtml(L.sEffects)}</span></label>
            <label class="checkbox_label"><input id="${id('reading')}" type="checkbox" data-tbd-set="reading"><span>${escapeHtml(L.sReading)}</span></label>
            <label class="checkbox_label"><input id="${id('nicks')}" type="checkbox" data-tbd-set="nicks"><span>${escapeHtml(L.sNicks)}</span></label>
            <small>${escapeHtml(L.sNicksHint)}</small>
            <label class="checkbox_label"><input id="${id('check')}" type="checkbox" data-tbd-set="check"><span>${escapeHtml(L.sCheck)}</span></label>
            <small>${escapeHtml(L.sCheckHint)}</small>
            <label for="${id('words')}">${escapeHtml(L.sWords)}</label>${sel('words', optionList(L.sWordOpts, st.wordNames))}
            <label for="${id('think')}">${escapeHtml(L.sThink)}</label>${sel('think', optionList(L.sThinkOpts, st.reasoning))}
            <small>${escapeHtml(L.sThinkHint)}</small>
            <label class="checkbox_label"><input id="${id('preset')}" type="checkbox" data-tbd-set="preset"><span>${escapeHtml(L.sPreset)}</span></label>
            <small>${escapeHtml(L.sPresetHint)}</small>
            <label class="checkbox_label"><input id="${id('hist')}" type="checkbox" data-tbd-set="hist"><span>${escapeHtml(L.sHistory)}</span></label>
            <details class="tbd-hist"><summary>${escapeHtml(L.sHistoryShow.replace('{n}', String(st.history.length)))}</summary><div class="tbd-hist-list"></div></details>
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
            lang: st.language, profile: st.profileId, words: st.wordNames, think: st.reasoning, count: st.count, tokens: st.maxTokens, theme: st.theme, ban: st.banList,
        };
        const checks = { fx: !!st.effects, reading: !!st.showReading, nicks: !!st.nicknames, check: !!st.autoCheck, hist: !!st.rememberHistory, preset: !!st.sendPreset };
        $('[data-tbd-set]').each(function () {
            if (this === except) return;
            const key = this.getAttribute('data-tbd-set');
            if (key in checks) $(this).prop('checked', checks[key]);
            else if (key !== 'profile' && key in values) $(this).val(values[key]);
        });
        refreshHistory();
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
            case 'tokens': st.maxTokens = clampInt($el.val(), 200, MAX_TOKENS_CAP, DEFAULTS.maxTokens); $el.val(st.maxTokens); break;
            case 'theme': st.theme = THEMES.includes($el.val()) ? $el.val() : 'st'; save(); render(); syncSettingFields(); return;
            case 'fx': st.effects = !!$el.prop('checked'); save(); render(); syncSettingFields(); return;
            case 'reading': st.showReading = !!$el.prop('checked'); save(); render(); syncSettingFields(); return;
            case 'nicks': st.nicknames = !!$el.prop('checked'); save(); renderResultsOnly(); syncSettingFields(); return;
            case 'words': st.wordNames = $el.val() === 'filter' ? 'filter' : 'mark'; save(); renderResultsOnly(); syncSettingFields(); return;
            case 'check': st.autoCheck = !!$el.prop('checked'); break;
            case 'hist': st.rememberHistory = !!$el.prop('checked'); break;
            case 'preset': st.sendPreset = !!$el.prop('checked'); break;
            case 'think': st.reasoning = REASONING_LEVELS.includes($el.val()) ? $el.val() : 'default'; break;
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
        $doc.on('click', '.tbd-hist-clear', () => { settings().history = []; save(); refreshHistory(); toastr.info(T().sHistoryCleared, 'TBD'); });
        // <details> toggle doesn't bubble, so listen in the capture phase.
        document.addEventListener('toggle', e => { if (e.target?.classList?.contains('tbd-hist')) refreshHistory(); }, true);
        $doc.on('click', '.tbd-hist-del', function () {
            const st = settings();
            const i = Number($(this).closest('.tbd-hist-item').data('i'));
            const name = $(this).siblings('.tbd-hist-name').text();
            // Check the name too, in case the list changed under the click.
            if (st.history[i] === name) st.history.splice(i, 1);
            else { const k = st.history.indexOf(name); if (k >= 0) st.history.splice(k, 1); }
            save();
            refreshHistory();
        });
        $doc.on('click', '#tbd_raw_btn', () => { rawOpen = !rawOpen; $('#tbd_foot').html(footerHtml()); });
        $doc.on('click', '#tbd_go', generate);
        $doc.on('click', '#tbd_again', generate);
        $doc.on('change', '#tbd_target', () => { readForm(); render(); });
        $doc.on('change', '#tbd_kind', () => readForm());
        $doc.on('change', '#tbd_vibe', function () { $('#tbd_custom_wrap').prop('hidden', $(this).val() !== 'custom'); readForm(); });
        $doc.on('change', '#tbd_gender, #tbd_length, #tbd_custom, #tbd_kindtext, #tbd_fixed', readForm);
        $doc.on('change', '#tbd_sound, #tbd_must, #tbd_like, #tbd_likemode, #tbd_realnames', () => {
            const form = readForm();
            $('#tbd_more_fold').replaceWith(moreFoldHtml(form));
        });
        $doc.on('click', '#tbd_more_fold', () => {
            const st = settings();
            const form = readForm();
            st.moreOpen = !st.moreOpen;
            save();
            $('#tbd_more').prop('hidden', !st.moreOpen);
            $('#tbd_more_fold').replaceWith(moreFoldHtml(form));
        });
        $doc.on('click', '#tbd_extras_fold', () => {
            const st = settings();
            const form = readForm();
            st.extrasOpen = !st.extrasOpen;
            save();
            $('#tbd_extras_chips').prop('hidden', !st.extrasOpen);
            $('#tbd_extras_fold').replaceWith(extrasFoldHtml(form.extras));
        });
        $doc.on('click', '#tbd_panel .tbd-chip', function () {
            const form = readForm();
            const group = String($(this).data('chip'));
            const v0 = String($(this).data('v'));
            if (group === 'method') {
                if (form.method === v0) return;
                form.method = v0 === 'cache' ? 'cache' : 'ai';
                save();
                render();
                return;
            }
            if (group === 'root' || group === 'ckind') {
                const key = group === 'root' ? 'roots' : 'ckinds';
                const all = group === 'root' ? CACHE_ROOTS : CACHE_KINDS;
                const set = new Set(form[key]);
                if (set.has(v0)) { if (set.size === 1) return; set.delete(v0); } else set.add(v0);
                form[key] = all.filter(x => set.has(x));
                $(this).attr('aria-pressed', set.has(v0) ? 'true' : 'false');
                save();
                return;
            }
            const key = group === 'part' ? 'parts' : 'extras';
            const v = String($(this).data('v'));
            const list = new Set(form[key]);
            if (list.has(v)) list.delete(v); else list.add(v);
            const next = { ...form, [key]: [...list] };
            // Keep at least one part: turning off the last one does nothing.
            if (!next.parts.length && !next.extras.length) return;
            form[key] = key === 'parts' ? NAME_PARTS.filter(p => list.has(p)) : NAME_EXTRAS.filter(p => list.has(p));
            $(this).attr('aria-pressed', list.has(v) ? 'true' : 'false');
            $('#tbd_fixed_wrap').prop('hidden', !form.parts.includes('family'));
            save();
        });
        $doc.on('click', '#tbd_panel .tbd-piece-copy', async function () {
            const r = results[Number($(this).closest('.tbd-row').data('i'))];
            const p = r?.pieces?.[Number($(this).closest('.tbd-piece').data('k'))];
            if (!p) return;
            if (await copyText(p.text)) toastr.success(T().copied, 'TBD');
            else toastr.warning(T().copyFail, 'TBD');
        });
        $doc.on('click', '#tbd_panel .tbd-nick', async function () {
            const r = results[Number($(this).closest('.tbd-row').data('i'))];
            const n = r?.nicks?.[Number($(this).data('n'))];
            if (!n) return;
            if (await copyText(n)) toastr.success(T().copied, 'TBD');
            else toastr.warning(T().copyFail, 'TBD');
        });
        $doc.on('click', '#tbd_panel .tbd-piece-roll', function () {
            const r = results[Number($(this).closest('.tbd-row').data('i'))];
            if (r) rerollPiece(r, Number($(this).closest('.tbd-piece').data('k')));
        });
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
        $doc.on('keydown', '#tbd_must, #tbd_like, #tbd_custom, #tbd_kindtext, #tbd_fixed', (e) => { if (e.key === 'Enter') { e.preventDefault(); generate(); } });
        $doc.on('keydown', (e) => { if (e.key === 'Escape' && $('#tbd_panel').is(':visible')) closePanel(); });
        $doc.on('click', '#tbd_panel .tbd-check-btn', function () {
            const r = results[Number($(this).closest('.tbd-row').data('i'))];
            if (!r) return;
            const c = r.check;
            if (c && !c.hidden && !c.quiet) { if (c.state !== 'busy') { c.hidden = true; renderResultsOnly(); } return; }
            if (c && c.state === 'done') { c.hidden = false; c.quiet = false; renderResultsOnly(); return; }
            if (c && c.state === 'busy') { c.quiet = false; renderResultsOnly(); return; }
            checkNames([r]);
        });
        $doc.on('click', '#tbd_panel .tbd-check-ask', function () {
            const r = results[Number($(this).closest('.tbd-row').data('i'))];
            if (r) askAiCheck(r);
        });
        $doc.on('click', '#tbd_panel .tbd-copy', async function () {
            const r = results[Number($(this).closest('.tbd-row').data('i'))];
            if (!r) return;
            if (await copyText(r.name)) toastr.success(T().copied, 'TBD');
            else toastr.warning(T().copyFail, 'TBD');
        });
    }

    // Tests load this file without SillyTavern and call the pieces directly.
    if (globalThis.__TBD_TEST__) {
        globalThis.__TBD_TEST__.api = {
            rollSeeds, buildMessages, buildRefineMessages, REFINE_MODES, parseNames, filterNames, avoidList, rememberNames, detectLang,
            tokensFor, settings, historyHtml, STRINGS, THEMES, CLICHES, KINDS, targetText, SPARKS, normalizeKind,
            nameShape, applyShape, joinPieces, memoryNames, buildPieceMessages, FAMILY_STYLES,
            wordHits, keepNames, WORD_NAMES, answerCut, answerEmpty, failText, requestLLM, looksLikeName, likeWords, likeRule, isLikeCopy,
            realMode, realRoles, realRule, realPieceRule, moreFoldHtml, formHtml, nickOn, cleanNicks, clicheHit, canonHit, answerJson, resultsHtml,
            CACHE, CACHE_ROOTS, isCache, cacheRoots, cacheOne, cacheNames, cachePiece, cacheFamily, fragsHtml, aiForm, glue, sayable, soundScore,
            checkTargets, readWikiAnswer, wikiLookup, checkNames, checkHtml, checkWarns, buildCheckMessages, googleUrl,
            setResults: list => { results = list; },
        };
    } else {
        if (typeof $ === 'function' && document.body) settingsSlot();
        jQuery(() => init());
    }
})();
