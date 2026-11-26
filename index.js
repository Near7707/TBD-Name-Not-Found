// TBD — Name Not Found v0.2.29
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
            reviewCopy: 'Copy for review', reviewTip: 'Copy every name here as text, with its fragments and the choices it was made with, to paste somewhere for a check.', reviewCopied: 'Copied the names for review.',
            copy: 'Copy', close: 'Close',
            copied: 'Copied', copyFail: "Couldn't copy. Select the text and copy it yourself.",
            tabFind: 'Find names', tabFound: 'Found', starAdd: 'Keep in Found', starRemove: 'Take out of Found',
            foundEmpty: 'Nothing here yet. Tap ☆ next to a name to keep it here.', foundAll: 'All', foundFrom: 'from',
            foundRemove: 'Remove from Found', foundExport: 'Export', foundImport: 'Import',
            foundExportTip: 'Save Found as a file, as a backup or to move it.', foundImportTip: 'Add names from a Found file. Names you already have are skipped.',
            foundImported: n => `Added ${n} name${n === 1 ? '' : 's'} to Found`, foundImportBad: "Couldn't read that file.",
            foundFull: n => `Found is full (${n}). Remove some names first.`,
            foundHint: 'Names in Found are also kept off new results.',
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
            wordMode: 'Word names', wordModes: { avoid: 'Avoid', mix: 'Mix in', main: 'Mostly' },
            wordModeTip: { avoid: 'Invented names, not plain words (as before).', mix: 'About one name in three is made from a pretty real word.', main: 'Nearly every name is made from a pretty real word.' },
            wordOff: { like: 'Not used now: the "Like this" words lead.', real: 'Not used now: "Real names only" leads.' },
            wordMeanTag: (m, lang) => `word: ${[m, lang].filter(Boolean).join(' · ')}`, wordMeanTip: "Made from a real word. The meaning and language are the AI's guess.",
            checkBtn: 'Check this name (Wikipedia)', checking: 'Checking Wikipedia…', checkFail: "Couldn't reach Wikipedia.",
            checkNone: '✓ no page', checkMany: 'several pages with this name', checkNamePage: 'a page about the name (people use it)',
            checkFull: 'Full', checkWiki: 'Wikipedia', checkEn: 'English Wikipedia', checkKo: 'Korean Wikipedia',
            checkGoogle: 'Search Google', checkAsk: 'Ask the AI too', checkAsking: 'Asking…', checkAiTag: 'AI guess', checkAiEmpty: '(no answer)',
            clicheTag: 'AI favorite', clicheTip: 'A name AI models hand out very often.',
            canonTag: 'Lovecraft', canonTip: "A name from Lovecraft's own stories.",
            method: 'Made with', methods: { ai: 'AI', cache: 'Archive', polish: 'Archive + AI' }, rootsLabel: 'Roots', ckLabel: 'Kind of name',
            roots: { latin: 'Latin', oldenglish: 'Old English', norman: 'Norman / French', germanic: 'Germanic', celtic: 'Celtic', norse: 'Norse', greek: 'Ancient Greek', slavic: 'Slavic' },
            rootMix: { split: 'Split', merge: 'Merge' }, rootMixTip: { split: 'Each name from one root, taking turns.', merge: 'Each name mixes two roots: one part from each.' },
            aiRootAny: 'Any', aiRootOff: { like: 'Not used now: the "Like this" words lead.', cosmic: 'Not used now: Lovecraftian invented names stay eldritch.' },
            ck: { common: 'Common name', noble: 'Noble house', religious: 'Monastic / saint', royal: 'Royal / ruler', warrior: 'Warrior / byname', scholar: 'Scholar (Latin)' },
            branch: { patron: "father's name", place: 'home place', dwell: 'where they lived', trade: 'trade', looks: 'looks / nickname' },
            fragments: 'fragments', cacheTag: 'ARCHIVE', cacheTip: 'Built from name fragments. No AI was used.',
            foundCache: n => `200 OK — ${n} name${n === 1 ? '' : 's'} from the archive`,
            cacheEmpty: 'No new names left in the archive for these choices. Try other roots or conditions.',
            needPick: { roots: 'Pick at least one root.', kinds: 'Pick at least one kind of name.' }, needErr: m => `400 — ${m}`,
            polishTag: 'AI polished', polishTip: 'Built from name fragments, then the AI smoothed the sound a little. The meanings are from the archive, not the AI.',
            keptTip: 'Built from name fragments. The AI read it and left the spelling as it was; the reading and note are from the AI.',
            polishWas: 'was', polishing: 'Polishing…',
            polishFail: '206 — the AI polish failed; showing plain Archive names.',
            polishSome: (n, all) => `206 — ${n} of ${all} polished; the rest are plain Archive names.`,
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
            reviewCopy: '검사용 복사', reviewTip: '지금 보이는 이름 전부를 조각·만든 조건과 함께 글로 복사해요. 다른 곳에 붙여넣어 검사할 때 써요.', reviewCopied: '검사용으로 이름을 복사했어요.',
            copy: '복사', close: '닫기',
            copied: '복사했어요', copyFail: '복사가 안 됐어요. 글자를 직접 골라서 복사해 주세요.',
            tabFind: '이름 찾기', tabFound: 'Found', starAdd: 'Found에 넣기', starRemove: 'Found에서 빼기',
            foundEmpty: '아직 비어 있어요. 이름 옆 ☆를 누르면 여기 모여요.', foundAll: '전부', foundFrom: '원래 이름',
            foundRemove: 'Found에서 빼기', foundExport: '내보내기', foundImport: '불러오기',
            foundExportTip: 'Found를 파일로 저장해요. 백업하거나 옮길 때 써요.', foundImportTip: 'Found 파일에서 이름을 더해요. 이미 있는 이름은 건너뛰어요.',
            foundImported: n => `Found에 이름 ${n}개를 더했어요`, foundImportBad: '파일을 읽지 못했어요.',
            foundFull: n => `Found가 꽉 찼어요(${n}개). 몇 개 빼고 넣어 주세요.`,
            foundHint: 'Found에 넣은 이름은 새 결과에도 다시 안 나와요.',
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
            wordMode: '낱말 이름', wordModes: { avoid: '피하기', mix: '섞기', main: '위주로' },
            wordModeTip: { avoid: '낱말이 아닌 지어낸 이름(지금까지와 같음).', mix: '3개 중 1개쯤은 예쁜 진짜 낱말로 만들어요.', main: '거의 다 예쁜 진짜 낱말로 만들어요.' },
            wordOff: { like: '지금은 안 써요: "비슷하게" 단어를 따라가요.', real: '지금은 안 써요: "실제 이름만"을 따라가요.' },
            wordMeanTag: (m, lang) => `낱말: ${[m, lang].filter(Boolean).join(' · ')}`, wordMeanTip: '진짜 낱말로 만든 이름이에요. 뜻과 언어는 AI 추정이에요.',
            checkBtn: '이름 확인 (위키백과)', checking: '위키백과 찾는 중…', checkFail: '위키백과에 연결하지 못했어요',
            checkNone: '✓ 없음', checkMany: '같은 이름 여러 개', checkNamePage: '이름 문서 (실제로 쓰는 이름)',
            checkFull: '전체', checkWiki: '위키백과', checkEn: '영어 위키', checkKo: '한국어 위키',
            checkGoogle: '구글에서 보기', checkAsk: 'AI에게도 묻기', checkAsking: '묻는 중…', checkAiTag: 'AI 추정', checkAiEmpty: '(답 없음)',
            clicheTag: 'AI 단골', clicheTip: 'AI가 아주 자주 내는 이름이에요.',
            canonTag: '원작', canonTip: '러브크래프트 원작에 나오는 이름이에요.',
            method: '만드는 방식', methods: { ai: 'AI', cache: 'Archive', polish: 'Archive + AI' }, rootsLabel: '뿌리', ckLabel: '이름 종류',
            roots: { latin: '라틴', oldenglish: '옛 영어', norman: '노르만·프랑스', germanic: '게르만', celtic: '켈트', norse: '북유럽', greek: '고대 그리스', slavic: '슬라브' },
            rootMix: { split: 'Split', merge: 'Merge' }, rootMixTip: { split: '이름마다 뿌리 하나씩, 돌아가며.', merge: '이름마다 뿌리 두 개를 섞어요: 조각 하나씩.' },
            aiRootAny: '상관없음', aiRootOff: { like: '지금은 안 써요: "비슷하게" 단어를 따라가요.', cosmic: '지금은 안 써요: 러브크래프트풍 지어낸 이름은 이질적인 이름이라서요.' },
            ck: { common: '일반 인명', noble: '귀족 가문', religious: '수도원·성인', royal: '왕족·군주', warrior: '전사·별칭', scholar: '학자 (라틴식)' },
            branch: { patron: '아버지 이름', place: '출신 지명', dwell: '사는 곳', trade: '직업', looks: '생김새·별명' },
            fragments: 'fragments', cacheTag: 'ARCHIVE', cacheTip: '이름 조각으로 만든 이름이에요. AI는 안 썼어요.',
            foundCache: n => `200 OK — 아카이브에서 이름 ${n}개 찾음`,
            cacheEmpty: '이 조건으론 아카이브에서 새 이름을 더 못 찾았어요. 뿌리나 조건을 바꿔 보세요.',
            needPick: { roots: '뿌리를 하나 이상 골라 주세요.', kinds: '이름 종류를 하나 이상 골라 주세요.' }, needErr: m => `400 — ${m}`,
            polishTag: 'AI 다듬음', polishTip: '이름 조각으로 만든 뒤 AI가 소리를 살짝 다듬었어요. 뜻은 AI가 아니라 아카이브 자료예요.',
            keptTip: '이름 조각으로 만든 이름이에요. AI가 보고 철자는 그대로 뒀어요. 읽는 법과 설명은 AI가 썼어요.',
            polishWas: '원래', polishing: '다듬는 중…',
            polishFail: '206 — AI 다듬기에 실패해서 조각 이름 그대로 보여요.',
            polishSome: (n, all) => `206 — ${all}개 중 ${n}개만 다듬었어요. 나머지는 조각 이름 그대로예요.`,
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
    // v0.2.19 word names (people, AI only): avoid (as before) / mix (about 1 in 3) / main (nearly all).
    // A pretty real word from any language, as it is or lightly changed; with roots on, from those roots' languages.
    const WORD_MODES = ['avoid', 'mix', 'main'];
    function wordMode(form = {}) {
        return form.target === 'person' && !isCache(form) && WORD_MODES.includes(form.wordMode) ? form.wordMode : 'avoid';
    }
    // Choices that win over word names: the "like" words, and "real names only".
    function wordOff(form = {}) {
        if (wordMode(form) === 'avoid') return '';
        if (likeWords(form).length) return 'like';
        if (realMode(form) === 'only') return 'real';
        return '';
    }
    function wordUsed(form = {}) {
        return wordOff(form) ? 'avoid' : wordMode(form);
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
        // v0.2.11: not the whole name, and not one of its words either (Pell Acerby → "Pell" is no nickname).
        const own = String(name).trim().toLowerCase();
        const words = new Set([own, ...own.split(/[\s-]+/).filter(Boolean)]);
        const out = [];
        for (const x of list) {
            const t = cleanPiece(typeof x === 'string' ? x : '');
            if (!t || t.length > 20 || !looksLikeName(t) || words.has(t.toLowerCase())) continue;
            if (!out.some(o => o.toLowerCase() === t.toLowerCase())) out.push(t);
        }
        return out.slice(0, 3);
    }
    // Avoid list + repeats + copies of the "like this" words, then real words too when the user chose to filter them.
    // In a real-names mode, a name the AI called real stays even then (Rose is both a word and a real name).
    function keepNames(list, avoid, form, st = settings()) {
        const out = filterNames(list, avoid, splitList(st.banList)).filter(n => !isLikeCopy(n, form || {}));
        if (st.wordNames !== 'filter' || wordUsed(form || {}) !== 'avoid') return out;
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
    // v0.2.14: Chinese-trained models slipped Chinese words into Korean notes (세례册, 노인 → 老人).
    // The words mean something, so they are not stripped afterwards; the prompt asks for Korean words instead.
    function noteLang(lang) {
        return lang === 'ko' ? 'Korean (Korean words written in Hangul only, no Chinese characters or Chinese words)' : 'English';
    }
    // Asked only on a tap. A guess, marked as one.
    function buildCheckMessages(name, lang) {
        const out = noteLang(lang);
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

    // Start letters a root (almost) never uses: a Latin name can't start with W.
    // v0.2.21: letters each root's own words (almost) never start with. With one start letter per name and no
    // repeats in a batch, rare letters always came up, and the AI got stuck on them (a Slavic name starting
    // with E looped until the answer ran out; Celtic gave Kerallach and Verlanath).
    const ROOT_NO_START = { latin: 'WK', norse: 'CWP', celtic: 'WJKV', norman: 'K', oldenglish: 'JV', greek: 'WJQFVYU', slavic: 'QXEF' };
    const CELTIC_BRANCHES = ['Welsh', 'Irish', 'Scottish Gaelic'];
    const ROOT_FAMILY_KINDS = ['from a place', "from a father's name", 'from looks or a nickname', 'from a trade'];
    const LIKE_FOCUS = ['its opening sound', 'its vowels', 'its ending', 'its rhythm', 'its consonants'];

    function pick(arr, rnd = Math.random) { return arr[Math.floor(rnd() * arr.length)]; }

    // One seed per name. Each name gets its own nudge so the batch spreads out.
    function rollSeeds(count, opts = {}, rnd = Math.random) {
        const target = opts.target || 'person';
        // v0.2.13: one-syllable names with roots on came out blunt or as plain words (Irk, Jorp, Hark),
        // so "any length" starts at two syllables then. "Short" still allows one.
        const anyLen = !SYLLABLES[opts.length] || opts.length === 'any';
        const [lo, hi] = anyLen && target === 'person' && aiRootsUsed(opts).length ? [2, 4] : (SYLLABLES[opts.length] || SYLLABLES.any);
        // No inspiration word when the user typed a vibe or details: their words already set the direction,
        // and a random word ("bus stop") pulled names away from what was typed ("bread").
        const typedDetail = target !== 'person' && String(opts.kindText || '').trim();
        // "Like this" words set the direction too, and they replace the random start, ending and sound nudges
        // (a forced "starts with K" can't sound like "Elric").
        const like = likeWords(opts).length ? (opts.likeMode === 'feel' ? 'feel' : 'sound') : null;
        // Real names come from real use, so the made-up sound nudges (ending, texture, inspiration word) go.
        // The start letter stays: it still spreads the batch over different real names.
        const real = realMode(opts) !== 'invented';
        // v0.2.11: picked roots set the direction too. With an inspiration word the AI put the thing itself
        // into the name (an orchard word → a Latin "orchard keeper" family name, a wool word → "Carderby").
        const rootsOn = aiRootsUsed(opts).length > 0;
        const sparks = opts.vibe === 'custom' || typedDetail || like || real || rootsOn ? null : (SPARKS[opts.vibe] || ALL_SPARKS);
        const textures = texturesFor(opts.vibe);
        const shapes = shapesFor(target, opts.vibe);
        const shape = nameShape(opts);
        const familyKey = opts.vibe === 'cosmic' && real ? 'cosmicFolk' : opts.vibe;
        // Picked roots set the sounds, so the vibe's own endings and family styles would argue with them.
        const roots = aiRootsUsed(opts);
        const endings = roots.length ? null : endingsFor(target, opts.vibe);
        const familyStyles = !roots.length && shape && shape.roles.includes('family') && !shape.fixed ? (FAMILY_STYLES[familyKey] || ALL_FAMILY_STYLES) : null;
        // v0.2.15: with roots on, one batch-wide "mix kinds of family names" line still let them bunch up
        // (-oris, then -onis), so each name gets its own kind in turn. Plain kinds only: no vibe wording to argue with the roots.
        const rootFamily = roots.length && shape && shape.roles.includes('family') && !shape.fixed;
        const familyKindStart = Math.floor(rnd() * ROOT_FAMILY_KINDS.length);
        const rootStart = Math.floor(rnd() * Math.max(1, roots.length));
        // Merge: each name gets two different roots, in turn through every pair.
        const pairs = aiMerge(opts) ? rootPairs(roots, rnd) : null;
        const seeds = [];
        const usedEndings = new Set();
        const usedFamily = new Set();
        const usedSparks = new Set();
        // Sound-alike: each name copies a different part of the typed word, so the batch doesn't all copy its start.
        const focusStart = Math.floor(rnd() * LIKE_FOCUS.length);
        // v0.2.18: with roots on, a batch-wide "vary the sounds" line still left a v in 14 of 20 names
        // (-var- in 7), so about half the names get their own "no v" nudge. Per-name seeds are what the AI follows.
        // The 0,1,1,0 beat keeps it off the Merge pair order, which flips every name.
        const noVStart = Math.floor(rnd() * 2);
        // v0.2.19 word names: "main" marks every name, "mix" about one in three. No extra random draws when off,
        // so the seeds stay exactly as before for everyone else.
        const wm = wordUsed(opts);
        const wordStart = wm === 'mix' && count > 1 ? Math.floor(rnd() * 3) : 0;
        // v0.2.20: "Celtic" is several languages, and the AI filled the gaps with English and Scots
        // (Nailor, Souter, Dunwrinkle) and mixed Irish with Welsh (mac Branwyn). Each Celtic name gets one language.
        const celticStart = roots.includes('celtic') ? Math.floor(rnd() * CELTIC_BRANCHES.length) : 0;
        let celticCount = 0;
        // v0.2.20: start letters were drawn with repeats (four W, four O, four K in one batch of 20).
        const usedStarts = new Set();
        for (let i = 0; i < count; i++) {
            const seed = {};
            // Like Cache, each name takes the picked roots in turn.
            if (pairs) { [seed.root, seed.root2] = pairs[i % pairs.length]; }
            else if (roots.length) seed.root = roots[(rootStart + i) % roots.length];
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
            if (!opts.mustContain && !like) {
                // Merge: the name may open with either root, so skip letters either one never starts with.
                const no = (ROOT_NO_START[seed.root] || '') + (ROOT_NO_START[seed.root2] || '');
                const letters = seed.root ? START_LETTERS.filter(c => !no.includes(c)) : START_LETTERS;
                const fresh = letters.filter(c => !usedStarts.has(c));
                seed.start = pick(fresh.length ? fresh : letters, rnd);
                if (fresh.length) { usedStarts.add(seed.start); seed.newStart = true; }
            }
            // Only nudge the ending about half the time; always forcing it sounds samey too.
            // Don't hand the same ending to two names in one batch (two "… Array" looked samey).
            if (endings && !like && !real && rnd() < 0.5) {
                const fresh = endings.filter(e => !usedEndings.has(e));
                seed.ending = pick(fresh.length ? fresh : endings, rnd);
                usedEndings.add(seed.ending);
            }
            if (shapes) seed.shape = pick(shapes, rnd);
            // v0.2.20: no "no v" for Slavic: -slav, Vlad- and -vit are its core parts (0 of 20 names had a v).
            const slavic = seed.root === 'slavic' || seed.root2 === 'slavic';
            if (rootsOn && !like && !slavic && (i + Math.floor(i / 2) + noVStart) % 2 === 0 && !'VW'.includes(seed.start || '')) seed.noV = true;
            // v0.2.20: plain (i + start) % 3 ran in step with three roots taken in turn, so every word name
            // went to one root. The extra i/3 shift spreads them over the roots and still hits one in three.
            if (wm === 'main' || (wm === 'mix' && (count > 1 ? (i + Math.floor(i / 3) + wordStart) % 3 === 0 : rnd() < 1 / 3))) {
                // A real word brings its own length and ending, so those nudges (and "no v") would only argue with it.
                seed.word = true;
                delete seed.syllables; delete seed.ending; delete seed.spark; delete seed.noV;
                // v0.2.21: "a pretty Slavic word starting with W" is often impossible, and the AI searched until
                // the answer ran out. The letter goes back to the pool for the other names.
                if (seed.newStart) usedStarts.delete(seed.start);
                delete seed.start;
            }
            if (rootFamily) {
                seed.family = ROOT_FAMILY_KINDS[(familyKindStart + i) % ROOT_FAMILY_KINDS.length];
                // v0.2.16: a bare English kind ("from a trade") came back as English words (Ropewright, Redwhisker),
                // so the seed names the root too. Merge takes its two roots in turn.
                // Split keeps the name's own root. Merge picks one of its two, shifted each round of kinds,
                // so "trade" isn't always Latin.
                const want = roots[(i + Math.floor(i / ROOT_FAMILY_KINDS.length)) % roots.length];
                seed.familyRoot = seed.root2 && want === seed.root2 ? seed.root2 : seed.root;
            }
            if (seed.root === 'celtic' || seed.root2 === 'celtic') seed.celtic = CELTIC_BRANCHES[(celticStart + celticCount++) % CELTIC_BRANCHES.length];
            if (familyStyles) {
                const fresh = familyStyles.filter(f => !usedFamily.has(f));
                seed.family = pick(fresh.length ? fresh : familyStyles, rnd);
                usedFamily.add(seed.family);
            }
            delete seed.newStart;
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
            if (n.seed) out.seed = n.seed;
            if (n.word) out.word = n.word;
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
    // Careful: a category with no meaning needs three "=" ("um===town").
    // v0.2.2: meanings checked against Behind the Name, the Wikipedia lists of Germanic and Slavic name
    // elements and of British place-name elements, and German / Slavic / Greek place-name references.
    function F(s) {
        return s.split(';').map(x => x.trim()).filter(Boolean).map(x => {
            const [t, en = '', ko = '', cats = ''] = x.split('=');
            const f = { t, en, ko };
            if (cats) f.cats = cats.split('/');
            return f;
        });
    }
    // Shared English-style bynames (Ironside, Fairhair, Forkbeard, Erik the Red) and royal epithets.
    const WAR_EN = {
        head: F('Iron=iron=쇠;Strong=strong=억센;Long=long=긴;Red=red=붉은;Fair=fair=고운;Grey=grey=잿빛;Black=black=검은;Blood=blood=피;Storm=storm=폭풍;Wolf=wolf=늑대;Stone=stone=돌;Silver=silver=은;Bright=bright=빛나는;Fork=forked=갈라진'),
        tail: F('hand=hand=손;arm=arm=팔;sword=sword=칼;beard=beard=수염;hair=hair=머리카락;shield=shield=방패;axe=axe=도끼;bow=bow=활;heart=heart=심장;side=side=옆구리;foot=foot=발;tooth=tooth=이빨;spear=spear=창;helm=helmet=투구'),
        whole: F('the Red=the Red=붉은 이;the Bold=the Bold=대담한 이;the Grim=the Grim=사나운 이;the Tall=the Tall=키 큰 이;the Young=the Young=젊은 이;the Old=the Old=늙은 이;the Black=the Black=검은 이;the Fair=the Fair=고운 이;the Wolf=the Wolf=늑대;the Raven=the Raven=큰까마귀;the Fearless=the Fearless=겁 없는 이;the Silent=the Silent=말 없는 이'),
    };
    const ROYAL_EN = F('the Fair=the Fair=고운 이;the Bold=the Bold=대담한 이;the Great=the Great=위대한 이;the Wise=the Wise=현명한 이;the Just=the Just=정의로운 이;the Pious=the Pious=경건한 이;the Young=the Young=젊은 이;the Elder=the Elder=나이 든 이;the Good=the Good=선한 이;the Lion=the Lion=사자;the Peaceful=the Peaceful=평화로운 이;the Learned=the Learned=학식 있는 이;the Conqueror=the Conqueror=정복자;the Brave=the Brave=용감한 이');
    const ORDINALS = F('II=the Second=2세;III=the Third=3세;IV=the Fourth=4세;V=the Fifth=5세;VI=the Sixth=6세;VII=the Seventh=7세;VIII=the Eighth=8세;IX=the Ninth=9세');
    const CACHE = {
        latin: {
            head: F('Silv=forest=숲;Luc=light=빛;Aur=gold=금;Sever=stern=엄격한;Clar=clear, bright=맑은;Fort=strong=강한;Flor=flower=꽃;Vit=life=생명;Fel=lucky=행운의;Ver=true=참된;Prim=first=첫째;Val=strong, well=굳센;Dom=lord=주인;Pac=peace=평화;Fid=faith=믿음;Sanct=holy=거룩한;Alb=white=흰;Rub=red=붉은;Nov=new=새로운;Sol=sun=해;Stell=star=별;Ign=fire=불;Vent=wind=바람;Mar=sea=바다;Terr=earth=땅;Aqu=water=물;Noct=night=밤;Cael=sky=하늘;'
                + 'Magn=great=큰;Ferr=iron=쇠;Lup=wolf=늑대;Urs=bear=곰;Aquil=eagle=독수리;Corv=raven=큰까마귀;Columb=dove=비둘기;Ros=rose=장미;Laur=laurel=월계수;Oliv=olive=올리브;Bon=good=좋은;Ben=well=잘;Grat=grace=은총;Iust=just=의로운;Fest=festive=축제의;Hilar=cheerful=쾌활한;Constant=steadfast=한결같은;Vict=victory=승리;August=venerable=존엄한;Max=greatest=가장 큰;Mart=Mars=마르스;Vesper=evening=저녁;Argent=silver=은'),
            masc: F('us==;ius==;ianus=belonging to=~에 속한;inus=like=~ 같은;ian=belonging to=~에 속한;ellus=little=작은;ulus=little=작은;icus=of, belonging to=~의;atus=having=~을 지닌'),
            fem: F('a==;ia==;ina=like=~ 같은;ana=belonging to=~에 속한;illa=little=작은;ella=little=작은;ula=little=작은;ica=of, belonging to=~의;ata=having=~을 지닌;iana=belonging to=~에 속한'),
            placeHead: F('Silv=forest=숲=forest;Aqu=water=물=water;Mar=sea=바다=coast;Terr=earth=땅;Alb=white=흰;Rub=red=붉은;Nov=new=새로운;Sol=sun=해;Luc=light=빛;Aur=gold=금;Fort=strong=강한=fort;Flor=flower=꽃=field;Vent=wind=바람=hill/coast;Petr=rock=바위=hill;Mont=mountain=산=hill;Lac=lake=호수=water;Port=harbor=항구=coast;Prat=meadow=풀밭=field;Castr=fort=요새=fort;Font=spring=샘=water;'
                + 'Aquil=eagle=독수리=hill;Lup=wolf=늑대=forest;Urs=bear=곰=forest;Ferr=iron=쇠=hill;Vin=wine=포도주=field;Oliv=olive=올리브=field;Laur=laurel=월계수=forest;Magn=great=큰;Alt=high=높은=hill/fort;Flumin=river=강=water;Sax=rock=바위=hill;Pin=pine=소나무=forest;Querc=oak=참나무=forest;Fag=beech=너도밤나무=forest;Nemor=grove=작은 숲=forest;Pont=bridge=다리=water/town;Insul=island=섬=coast/water;Camp=field=들판=field;Vic=village=마을=town;Colon=settlement=정착지=town;Hort=garden=정원=field'),
            placeTail: F('ia=land of=~의 땅;ium=place of=~의 터=town/fort;um===town;ana=belonging to=~에 속한;etum=grove of=~나무 숲=forest;arium=place for=~ 두는 곳=town/fort;ona===town/coast;'
                + 'acum=place of=~의 터=town;magus=field, market=들판·장터=town/field;briga=hill fort=언덕 요새=fort/hill;dunum=fort, hill=요새·언덕=fort/hill;castra=army camp=진지=fort'),
            placePost: F('Magna=great=큰;Parva=little=작은;Superior=upper=위쪽;Inferior=lower=아래쪽'),
            family: 'nomen', branches: { patron: 4, trade: 2, looks: 3 },
            trade: F('Faber=smith=대장장이;Pictor=painter=화가;Agricola=farmer=농부;Pastor=shepherd=목동;Sutor=shoemaker=구두장이;Nauta=sailor=뱃사람;Scriba=scribe=서기;Medicus=physician=의사;Piscator=fisherman=어부;Molitor=miller=방앗간 주인'),
            looks: F('Rufus=red-haired=빨강 머리;Longus=tall=키 큰;Crassus=stout=뚱뚱한;Paullus=small=작은;Niger=dark=거무스름한;Calvus=bald=대머리;Naso=big-nosed=코 큰;Barbatus=bearded=수염 난;Albinus=pale=하얀;Capito=big-headed=머리 큰'),
            link: 'o',
            noble: 'de', of: 'de', titles: { m: ['Frater', 'Sanctus'], f: ['Soror', 'Sancta'] }, royal: { m: ['Rex', 'Imperator', 'Dux', 'Princeps'], f: ['Regina', 'Imperatrix', 'Ducissa', 'Principissa'] },
            royalEpithets: F('Magnus=the Great=위대한 이;Pius=the Pious=경건한 이;Iustus=the Just=정의로운 이;Felix=the Fortunate=행운의 이;Sapiens=the Wise=현명한 이;Victor=the Victor=승리자;Augustus=the Venerable=존엄한 이'),
            war: F('Ferox=fierce=사나운;Fortis=brave=용감한;Rufus=red-haired=빨강 머리;Audax=bold=대담한;Ferreus=made of iron=쇠 같은;Bellator=warrior=전사;Leo=lion=사자;Lupus=wolf=늑대;Torquatus=wearing a neck-ring=목걸이 두른'),
        },
        oldenglish: {
            head: F('Ethel=noble=고귀한;Ed=wealth, fortune=부·행운;Alf=elf=요정;Os=god=신;God=god=신;Leof=dear=사랑하는;Wulf=wolf=늑대;Sig=victory=승리;Cuth=famous=이름난;Here=army=군대;Hild=battle=전투;Wil=will=의지;Beorn=warrior=전사;Ald=old=오래된;Win=friend=벗;Bert=bright=빛나는;Mild=gentle=온화한;Ceol=ship=배;Wig=battle=싸움;Swith=strong=강한;'
                + 'Cyne=royal=왕다운;Cen=bold, keen=용감한;Deor=dear=소중한;Eorl=warrior, noble=전사·귀족;Frith=peace=평화;Gar=spear=창;Wiht=spirit=정령;Wyn=joy=기쁨;Beald=bold=대담한;Brun=brown=갈색;Blith=happy=즐거운;Heah=high=높은;Eofor=boar=멧돼지;Hroth=fame=명성;Ecg=sword edge=칼날;Noth=courage=용기;Cwic=alive=살아 있는;Frea=lord=주인;Guth=battle=전투'),
            masc: F('win=friend=벗;ric=ruler=통치자;wulf=wolf=늑대;mund=protection=보호;ward=guardian=지킴이;stan=stone=돌;red=counsel=조언;frith=peace=평화;helm=helmet=투구;bert=bright=빛나는;gar=spear=창;'
                + 'here=army=군대;laf=heir=후손;noth=courage=용기;sige=victory=승리;wald=rule=다스림;heard=hardy=굳센;mer=famous=이름난;bald=bold=대담한'),
            fem: F('gyth=battle=전투;wyn=joy=기쁨;flaed=beauty=아름다움;burh=fortress=요새;thryth=strength=힘;hild=battle=전투;gifu=gift=선물;swith=strength=힘;waru=care, protection=보살핌'),
            placeHead: F('Ash=ash tree=물푸레나무=forest;Brad=broad=넓은;Ald=old=오래된;Brom=broom=금작화=field;Thorn=thorn=가시나무=forest/field;Stan=stone=돌=hill/fort;Hart=stag=수사슴=forest;Lang=long=긴;Sut=south=남쪽;Nor=north=북쪽;Wes=west=서쪽;East=east=동쪽;Cran=crane=두루미=water;Brock=badger=오소리=forest;Fox=fox=여우=forest;Ever=wild boar=멧돼지=forest;Elm=elm=느릅나무=forest;Black=black=검은;Whit=white=흰;Hasel=hazel=개암나무=forest;Salt=salt=소금=coast;Kings=king\'s=왕의=town/fort;Chip=market=장터=town;Mil=mill=방앗간=water/town;'
                + 'Ac=oak=참나무=forest;Bex=boxwood=회양목=forest;Ship=sheep=양=field;Swin=swine=돼지=field;Cald=cold=차가운;Clay=clay=점토=field;Craw=crow=까마귀;Bar=barley=보리=field;Apple=apple=사과=field;Ling=heather=헤더=field/hill;Farn=fern=고사리=field/forest;Buck=buck=수사슴=forest;Bever=beaver=비버=water;Wal=foreigners (Britons)=이방인(브리튼인);Mid=middle=가운데;Birch=birch=자작나무=forest'),
            placeTail: F('ton=farmstead=농가 마을=town/field;ham=homestead=마을=town/field;wick=dwelling, trading place=마을·장터=town;ford=river crossing=여울=water;bury=fort=성채=fort/town;ley=woodland clearing=숲속 빈터=forest/field;wood=wood=숲=forest;hurst=wooded hill=숲 언덕=forest/hill;den=valley=골짜기=hill/field;mere=lake=호수=water;well=spring=샘=water/town;stead=place=터=town/field;field=open land=들판=field;combe=valley=골짜기=hill;cliffe=cliff=절벽=hill/coast;don=hill=언덕=hill;worth=enclosure=울타리 친 땅=town/field;bourne=stream=시내=water;holt=wood=숲=forest;mouth=river mouth=하구=coast/water;port=harbor, market town=항구·장터=coast/town;ridge=ridge=산등성이=hill;brook=stream=시내=water;wold=forest upland=숲 고원=forest/hill;hithe=landing place=나루터=water/coast;'
                + 'stoke=outlying farmstead=딸린 농가=field/town;stow=holy meeting place=거룩한 모임터=town;minster=great church=큰 교회·수도원=town;chester=old fort=옛 성채=fort/town;cot=cottage=오두막=town/field;croft=enclosed field=울 친 밭=field;fold=animal pen=가축 우리=field;hope=enclosed valley=막힌 골짜기=hill/field;law=rounded hill=둥근 언덕=hill;shaw=thicket=덤불숲=forest;hay=hedged land=산울타리 땅=field;royd=clearing=개간지=forest/field;moss=bog=늪=water/field;ey=island=섬=water/coast;pool=pool, harbour=웅덩이·항구=water/coast;bridge=bridge=다리=water/town'),
            placePre: F('Great=great=큰;Little=little=작은;Upper=upper=위쪽;Lower=lower=아래쪽;North=north=북쪽;South=south=남쪽;East=east=동쪽;West=west=서쪽;Long=long=긴;Market=market=장터=town'),
            placePost: F('-on-Sea=by the sea=바닷가=coast;-le-Street=near the Roman road=옛 로마 길가=town;-upon-Avon=on the river (avon = river)=강가 (avon = 강)=water/town;Magna=great (Latin)=큰 (라틴어);Parva=little (Latin)=작은 (라틴어)'),
            saint: { m: "St. {}'s", f: "St. {}'s" },
            family: 'english', branches: { patron: 2, place: 2, dwell: 2, trade: 2, looks: 2 },
            dwellPre: F('At=at=곁에;By=by=옆에;Under=under=아래'),
            dwellWord: F('wood=wood=숲=at/by/under;water=water=물가=at/by;well=spring=샘=at/by;hill=hill=언덕=at/under;field=field=들판=at/by;lee=clearing=숲속 빈터=at;brook=brook=시내=at/by;gate=gate=문=at;down=hill=언덕=under'),
            dwell: F('Nash=at the ash=물푸레나무 곁;Noakes=at the oaks=참나무 곁;Hill=hill=언덕;Brook=brook=시내;Wood=wood=숲;Marsh=marsh=늪;Green=village green=마을 풀밭;Lane=lane=골목;Bridge=bridge=다리;Cross=crossroads=네거리;Banks=hillside=언덕배기;Shaw=thicket=덤불숲;Dale=valley=골짜기;Moore=moor=황야;Ford=ford=여울'),
            trade: F('Smith=smith=대장장이;Thatcher=roof thatcher=지붕 이는 사람;Fletcher=arrow maker=화살 만드는 사람;Cooper=barrel maker=통 만드는 사람;Fisher=fisherman=어부;Baker=baker=빵 굽는 사람;Miller=miller=방앗간 주인;Turner=lathe worker=선반공;Carter=cart driver=짐수레꾼;Mason=stonemason=석공;Wright=craftsman=장인;Webster=weaver=베 짜는 사람;Shepherd=shepherd=양치기;Hunter=hunter=사냥꾼;Ward=watchman=파수꾼;Millward=mill keeper=방앗간지기;Arkwright=chest maker=궤짝 만드는 사람;Chapman=merchant=행상;Cook=cook=요리사;Knight=servant, knight=시종·기사'),
            looks: F('Brown=brown-haired=갈색 머리;White=fair-haired, pale=흰 머리·흰 얼굴;Black=dark-haired=검은 머리;Armstrong=strong in the arm=팔심 센;Young=young=젊은;Little=small=작은;Long=tall=키 큰;Short=short=키 작은;Strong=strong=억센;Read=red-haired=빨강 머리;Grey=grey-haired=잿빛 머리;Blythe=cheerful=명랑한;Fairfax=fair-haired=고운 머리;Swift=quick=빠른;Bold=bold=대담한'),
            noble: 'of', of: 'of', titles: { m: ['Brother', 'Saint'], f: ['Sister', 'Saint'] }, royal: { m: ['King', 'Prince', 'Duke', 'Earl'], f: ['Queen', 'Princess', 'Duchess', 'Countess'] },
        },
        norman: {
            head: F('Beau=beautiful=아름다운;Bel=fine=고운;Clair=clear=맑은;Fleur=flower=꽃;Gai=merry=명랑한;Dou=sweet=다정한;Blanc=white=흰;Roy=king=왕;Lys=lily=백합;Aim=loved=사랑받는;Ros=rose=장미;Jol=pretty=예쁜;Hardi=bold=대담한;Sauv=wild=야생의;Gent=noble=고귀한;Fid=faithful=믿음직한;'
                + 'Grand=great=큰;Fier=proud=당당한;Franc=free=자유로운;Bon=good=좋은;Joi=joy=기쁨;Lou=wolf=늑대;Esper=hope=희망;Guill=will=의지;Rich=ruler=통치자;Ber=bear=곰;Hu=mind=마음;Lam=land=땅;Ro=fame=명성;Thi=people=백성;Ger=spear=창;Bau=bold=대담한;Gui=wood=숲'),
            masc: F('ard=hardy=굳센;ert=bright=빛나는;ault=rule=다스림;in=little=작은;on=little=작은;ier=one who=~하는 사람;et=little=작은;aume=helmet=투구;aud=rule=다스림;ouin=friend=벗;ric=ruler=통치자;ran=raven=큰까마귀;mond=protection=보호;land=land=땅'),
            fem: F('ine=little=작은;elle=little=작은;ette=little=작은;ise==;ienne=of=~의;ilde=battle=전투;inde=gentle=부드러운'),
            placeHead: F('Beau=beautiful=아름다운;Bel=fine=고운;Mont=mountain=산=hill/fort;Roche=rock=바위=hill/coast;Val=valley=골짜기=hill/field;Bois=wood=숲=forest;Font=spring=샘=water;Pont=bridge=다리=water/town;Clair=clear=맑은=water;Blanc=white=흰;Vert=green=푸른=field/forest;Grand=great=큰;Haut=high=높은=hill/fort;Castel=castle=성=fort;Riv=riverbank=강가=water;Mal=bad=나쁜;Neuf=new=새로운=town;'
                + 'Chesne=oak=참나무=forest;Loup=wolf=늑대=forest;Fleur=flower=꽃=field;Vieux=old=오래된;Ros=rose=장미=field;Chastel=castle=성=fort;Gué=ford=여울=water;Mesnil=dwelling=집터=town;Bec=stream=시내=water;Tour=tower=탑=fort;Sable=sand=모래=coast;Ormes=elms=느릅나무들=forest;Lande=heath=황야=field'),
            placeTail: F('ville=town=마을=town;mont=mountain=산=hill/fort;court=estate=영지=town/field;val=valley=골짜기=hill/field;champ=field=들판=field;fort=stronghold=성채=fort;lieu=place=곳;bois=wood=숲=forest;mare=pond=연못=water;fontaine=spring=샘=water/town;roche=rock=바위=hill/coast;pont=bridge=다리=water/town;port=harbor=항구=coast;rive=riverbank=강가=water;mer=sea=바다=coast;pre=meadow=풀밭=field;'
                + 'tot=homestead (Norse)=집터 (노르드어)=town;beuf=hut (Norse)=오두막 (노르드어)=town;fleur=inlet=물굽이=coast/water;bec=stream=시내=water;ay=estate=영지=town;bourg=market town=장터 마을=town;lande=heath=황야=field;tour=tower=탑=fort;chastel=castle=성=fort;mesnil=dwelling=집터=town'),
            placePre: F('Grand-=great=큰;Petit-=little=작은'),
            placePost: F('-sur-Mer=on the sea=바닷가=coast;-le-Grand=the great=큰;-le-Petit=the little=작은;-la-Foret=by the forest=숲가=forest'),
            saint: { m: 'Saint-{}', f: 'Sainte-{}' },
            family: 'french', branches: { patron: 1, place: 3, dwell: 2, trade: 2, looks: 2 },
            dwellPre: F('Du=of the=~의;Dela=of the=~의'),
            dwellWord: F('bois=wood=숲=du;pont=bridge=다리=du;mont=hill=언덕=du;val=valley=골짜기=du;pre=meadow=풀밭=du;chesne=oak=참나무=du;moulin=mill=방앗간=du;four=oven=화덕=du;puis=well=우물=du;bourg=market town=장터 마을=du;champ=field=들판=du;mesnil=dwelling=집터=du;'
                + 'croix=cross=십자가=dela;fontaine=spring=샘=dela;rue=street=길=dela;porte=gate=문=dela;haye=hedge=산울타리=dela;motte=mound=둔덕=dela;roche=rock=바위=dela;mare=pond=연못=dela;cour=courtyard=안뜰=dela;fosse=ditch=도랑=dela'),
            trade: F('Lefebvre=smith=대장장이;Boulanger=baker=빵 굽는 사람;Meunier=miller=방앗간 주인;Charpentier=carpenter=목수;Berger=shepherd=양치기;Tisserand=weaver=베 짜는 사람;Mercier=haberdasher=잡화상;Barbier=barber=이발사;Marchand=merchant=상인;Fournier=oven keeper=화덕지기;Chevalier=horseman, knight=기사;Page=page boy=시동;Granger=granary keeper=곳간지기'),
            looksPre: { t: 'Le', en: 'the', ko: '그' },
            looks: F('blanc=white, fair-haired=흰;brun=brown-haired=갈색 머리;roux=red-haired=빨강 머리;petit=small=작은;grand=tall=큰;gros=stout=뚱뚱한;bel=handsome=잘생긴;bon=good=선한;noir=black-haired=검은 머리;sage=wise=현명한;fort=strong=억센;jeune=young=젊은;doux=gentle=다정한;hardi=bold=대담한;court=short=키 작은'),
            noble: 'de', of: 'de', titles: { m: ['Frère', 'Saint'], f: ['Sœur', 'Sainte'] }, royal: { m: ['Roi', 'Duc', 'Prince', 'Comte'], f: ['Reine', 'Duchesse', 'Princesse', 'Comtesse'] },
            royalEpithets: F("le Bel=the Fair=고운 이;le Hardi=the Bold=대담한 이;le Grand=the Great=위대한 이;le Sage=the Wise=현명한 이;le Juste=the Just=정의로운 이;le Pieux=the Pious=경건한 이;le Jeune=the Young=젊은 이;l'Ancien=the Elder=나이 든 이;le Bon=the Good=선한 이;le Lion=the Lion=사자;le Pacifique=the Peaceful=평화로운 이;le Conquérant=the Conqueror=정복자;le Vaillant=the Valiant=용맹한 이"),
            royalEpithetsF: F("la Belle=the Fair=고운 이;la Hardie=the Bold=대담한 이;la Grande=the Great=위대한 이;la Sage=the Wise=현명한 이;la Juste=the Just=정의로운 이;la Pieuse=the Pious=경건한 이;la Jeune=the Young=젊은 이;l'Ancienne=the Elder=나이 든 이;la Bonne=the Good=선한 이;la Pacifique=the Peaceful=평화로운 이;la Vaillante=the Valiant=용맹한 이"),
        },
        germanic: {
            head: F('Adal=noble=고귀한;Bern=bear=곰;Ger=spear=창;Hild=battle=전투;Rad=counsel=조언;Sieg=victory=승리;Wolf=wolf=늑대;Gott=god=신;Kun=bold=대담한;Lud=famous=이름난;Wil=will=의지;Frid=peace=평화;Ans=god=신;Diet=people=백성;Hart=hardy=굳센;Arn=eagle=독수리;Rein=counsel=조언;Eber=boar=멧돼지;Gund=battle=전투;Irm=great=큰;Walt=rule=다스림;Ot=wealth=부;'
                + 'Brun=armour, brown=갑옷·갈색;Erchen=pure=순수한;Erl=warrior, noble=전사·귀족;Folc=people=백성;Fram=spear=창;Frod=wise=지혜로운;Gisel=pledge=서약;Grim=mask, helmet=가면·투구;Heim=home=집;Hug=mind, spirit=마음;Isen=iron=쇠;Land=land=땅;Liut=people=백성;Mein=might=힘;Nord=north=북쪽;Rud=fame=명성;Wid=wood=숲;Ing=the god Ing=잉(신);Helm=helmet=투구;Her=army=군대;Engel=Angles (a tribe)=앵글족'),
            masc: F('bert=bright=빛나는;hard=hardy=굳센;mund=protection=보호;wald=rule=다스림;rich=ruler=통치자;win=friend=벗;fried=peace=평화;helm=helmet=투구;bald=bold=대담한;wig=battle=싸움;olf=wolf=늑대;brand=sword, fire=칼·불길;mar=famous=이름난;'
                + 'ger=spear=창;gast=guest=손님;land=land=땅;man=man=사람;rad=counsel=조언;ram=raven=큰까마귀;grim=mask=가면;gang=path=길;mut=mind, spirit=마음;wart=guardian=지킴이'),
            fem: F('hild=battle=전투;gard=enclosure=울타리;trud=strength=힘;lind=gentle=부드러운;burg=fortress=요새;run=secret=비밀;heid=kind, rank=됨됨이·지위;gund=battle=전투;swind=strength=힘'),
            placeHead: F('Stein=stone=돌=hill/fort;Ross=horse=말=field;Eich=oak=참나무=forest;Lind=linden=보리수=forest/town;Wolf=wolf=늑대=forest;Hoh=high=높은=hill/fort;Neu=new=새로운=town;Alt=old=오래된;Schwarz=black=검은=forest;Weiss=white=흰;Rot=red=붉은;Grun=green=푸른=field/forest;Tann=fir=전나무=forest;Birk=birch=자작나무=forest;Fels=rock=바위=hill;Muhl=mill=방앗간=water/town;Kirch=church=교회=town;Hirsch=stag=수사슴=forest;Falk=falcon=매=hill;Sonn=sun=해;Eis=ice=얼음=hill/water;Wald=forest=숲=forest;'
                + 'Esch=ash tree=물푸레나무=forest;Buch=beech=너도밤나무=forest;Salz=salt=소금=water;Kalt=cold=차가운;Lang=long=긴;Breit=broad=넓은;Hasel=hazel=개암나무=forest;Erl=alder=오리나무=forest/water;Kreuz=cross=십자가=town;Gold=gold=금;Adler=eagle=독수리=hill;Raben=raven=큰까마귀=forest;Bären=bear=곰=forest;Mittel=middle=가운데;Brunn=spring=샘=water;Wies=meadow=풀밭=field;Hasen=hare=토끼=field'),
            placeTail: F('burg=fortress=성채=fort/town;berg=mountain=산=hill;heim=home=집·마을=town;dorf=village=마을=town/field;feld=field=들판=field;wald=forest=숲=forest;bach=stream=시내=water;stein=stone, rock=돌·바위=hill/fort;furt=ford=여울=water;hof=farmstead=농장=field/town;au=water meadow=물가 풀밭=water/field;hausen=houses=집들=town;see=lake=호수=water;bruck=bridge=다리=water/town;tal=valley=골짜기=hill/field;hafen=harbor=항구=coast;hain=grove=작은 숲=forest;horn=peak=봉우리=hill;'
                + 'ingen=descendants of=~의 후손 (마을)=town;stadt=town, place=도시·터=town;rode=clearing=개간지=forest/field;weiler=hamlet=작은 마을=town/field;wang=meadow=풀밭=field;ach=river=강=water;beck=stream=시내=water;zell=monk\'s cell=수도원 방=town;loh=grove=작은 숲=forest;winkel=corner=구석=town/field;werder=river island=강섬=water;schlag=felled clearing=벌목지=forest'),
            placePre: F('Ober=upper=위쪽;Unter=lower=아래쪽;Nieder=lower=아래쪽;Groß=great=큰;Klein=little=작은'),
            placePost: F('am See=at the lake=호숫가=water'),
            saint: { m: 'Sankt {}', f: 'Sankt {}' },
            family: 'place', branches: { place: 3, dwell: 3, trade: 3, looks: 2 },
            dwell: F('Bach=by the stream=시냇가;Brunner=by the well=샘가;Steiner=by the rocks=바위 곁;Imhof=at the farmstead=농장 안;Buchner=by the beeches=너도밤나무 곁;Wiesner=by the meadow=풀밭 곁;Waldner=in the forest=숲속;Holzer=in the woods=숲속;Moser=by the bog=늪가;Bühler=on the hill=언덕 위;Lindner=by the lindens=보리수 곁;Imboden=on the valley floor=골짜기 바닥;Thaler=in the valley=골짜기;Auer=by the water meadow=물가 풀밭'),
            trade: F('Müller=miller=방앗간 주인;Schmidt=smith=대장장이;Schneider=tailor=재단사;Fischer=fisherman=어부;Weber=weaver=베 짜는 사람;Bauer=farmer=농부;Becker=baker=빵 굽는 사람;Wagner=wagon maker=수레 만드는 사람;Jäger=hunter=사냥꾼;Zimmermann=carpenter=목수;Koch=cook=요리사;Maurer=wall builder=미장이;Kaufmann=merchant=상인;Schäfer=shepherd=양치기;Böttcher=cooper=통 만드는 사람;Pfeiffer=piper=피리 부는 사람'),
            looks: F('Klein=small=작은;Groß=big=큰;Lang=tall=키 큰;Kurz=short=키 작은;Schwarz=black-haired=검은 머리;Weiss=white-haired=흰 머리;Braun=brown-haired=갈색 머리;Roth=red-haired=빨강 머리;Fuchs=fox (red-haired, sly)=여우 (빨강 머리·꾀);Jung=young=젊은;Kahl=bald=대머리;Stark=strong=억센;Krause=curly-haired=곱슬머리;Neumann=newcomer=새로 온 사람'),
            noble: 'von', of: 'von', titles: { m: ['Bruder', 'Sankt'], f: ['Schwester', 'Sankt'] }, royal: { m: ['König', 'Kaiser', 'Herzog', 'Fürst', 'Graf'], f: ['Königin', 'Kaiserin', 'Herzogin', 'Fürstin', 'Gräfin'] },
            royalEpithets: F('der Große=the Great=위대한 이;der Kühne=the Bold=대담한 이;der Weise=the Wise=현명한 이;der Gerechte=the Just=정의로운 이;der Fromme=the Pious=경건한 이;der Junge=the Young=젊은 이;der Ältere=the Elder=나이 든 이;der Gute=the Good=선한 이;der Schöne=the Fair=고운 이;der Löwe=the Lion=사자;der Friedfertige=the Peaceful=평화로운 이;der Eroberer=the Conqueror=정복자;der Tapfere=the Brave=용감한 이'),
            royalEpithetsF: F('die Große=the Great=위대한 이;die Kühne=the Bold=대담한 이;die Weise=the Wise=현명한 이;die Gerechte=the Just=정의로운 이;die Fromme=the Pious=경건한 이;die Junge=the Young=젊은 이;die Ältere=the Elder=나이 든 이;die Gute=the Good=선한 이;die Schöne=the Fair=고운 이;die Friedfertige=the Peaceful=평화로운 이;die Tapfere=the Brave=용감한 이'),
        },
        celtic: {
            head: F('Bran=raven=큰까마귀;Cad=battle=전투;Gwen=white, blessed=흰·복된;Gwyn=white, fair=흰;Mor=great=큰;Kier=dark=어두운;Finn=fair=흰;Aed=fire=불;Con=hound=사냥개;Duv=black=검은;Bri=hill, high=언덕·높은;Mael=follower=따르는 이;Ard=high=높은;Rua=red=붉은;Teg=fair=고운;Llew=light=빛;Bryn=hill=언덕;Fer=man=사내;'
                + 'Cael=slender=날씬한;Cain=handsome, good=잘생긴;Cam=crooked=굽은;Ken=head=머리;Bleid=wolf=늑대;Art=bear=곰;Blath=flower=꽃;Barr=top=꼭대기;Brig=might=힘;Car=love=사랑;Cian=long, distant=먼;Don=brown=갈색;Gov=smith=대장장이;Cyn=first, chief=으뜸;Arian=silver=은;Rhi=king=왕'),
            masc: F('an=little=작은;in=little=작은;ach==;wyn=white=흰;gal=valor=용맹;fael=prince=왕자;rix=king=왕;mar=great=큰'),
            fem: F('wen=white, blessed=흰·복된;een=little=작은;nat=little=작은;ia==;ait=little=작은;finn=fair=흰'),
            // Celtic places put the place word first: Aber + glas, Dun + more.
            placeHead: F('Aber=river mouth=하구=coast/water;Inver=river mouth=하구=coast/water;Llan=church enclosure=교회 마을=town;Kil=church=교회=town;Dun=fort=요새=fort/hill;Caer=fort=성=fort/town;Pen=head, top=꼭대기=hill;Tre=homestead=마을=town/field;Bally=town=마을=town;Glen=valley=골짜기=hill/field;Ard=height=높은 곳=hill;Strath=wide valley=넓은 골짜기=field/hill;Loch=lake=호수=water;Ros=headland, wood=곶·숲=coast/forest;Bryn=hill=언덕=hill;Coed=wood=숲=forest;Nant=stream, valley=시냇골=water/hill;Porth=harbor=항구=coast;'
                + 'Ben=mountain=산=hill;Knock=hill=언덕=hill;Drum=ridge=산등성이=hill;Inch=island=섬=water/coast;Ennis=island=섬=water/coast;Clon=meadow=풀밭=field;Kin=head=머리=hill;Lis=small ringfort=작은 원형 요새=fort;Rath=ringfort=원형 요새=fort;Carrick=rock=바위=hill/coast;Tully=hillock=작은 언덕=hill;Cwm=valley=골짜기=hill;Blaen=upland=고지대=hill;Pant=hollow=우묵한 곳=field;Pol=pool=웅덩이=water;Ynys=island=섬=coast;Kyle=narrows=좁은 해협=coast;Slieve=mountain=산=hill;Cashel=stone ringfort=돌 원형 요새=fort;Tober=well=우물=water;Derry=oak grove=참나무 숲=forest;Auch=field=들판=field;Moy=plain=평원=field;Shan=old=오래된'),
            placeTail: F('more=great=큰;beg=small=작은;glas=blue-green=푸른;wen=white=흰;duff=black=검은;ard=high=높은;roe=red=붉은;fin=fair=흰;derry=oak wood=참나무 숲;carrick=rock=바위;lyn=lake=호수;mawr=great=큰;fach=small=작은;'
                + 'bane=white=흰;boy=yellow=노란;brack=speckled=얼룩덜룩한;garv=rough=거친;gorm=blue, dark=검푸른;lea=light grey=잿빛;reagh=streaked=줄무늬진;noe=new=새로운;cool=nook=구석;sally=willows=버드나무'),
            // Kil + a name = "church of" that saint (Kilbride: church of Brigit).
            saint: { m: 'Kil{}', f: 'Kil{}' },
            family: 'celtic', branches: { patron: 4, trade: 2, looks: 2 },
            trade: F('MacGowan=son of the smith=대장장이의 아들;MacIntyre=son of the carpenter=목수의 아들;MacNab=son of the abbot=수도원장의 아들;MacPherson=son of the parson=교구 사제의 아들;MacTaggart=son of the priest=사제의 아들;MacClery=son of the cleric=성직자의 아들;MacWard=son of the bard=음유시인의 아들;Gow=smith=대장장이'),
            looks: F('Lloyd=grey=잿빛;Vaughan=small=작은;Gough=red=붉은;Gwyn=white, fair=흰;Moyle=bald=대머리;Bain=fair=흰;Roy=red=붉은;Dow=black=검은;Begg=small=작은;More=big=큰;Duff=black=검은;Boyd=yellow-haired=노란 머리'),
            noble: 'of', of: 'of', titles: { m: ['Brother', 'Saint'], f: ['Sister', 'Saint'] }, royal: { m: ['King', 'High King', 'Prince', 'Chief'], f: ['Queen', 'High Queen', 'Princess'] },
        },
        norse: {
            head: F('Thor=Thor (thunder god)=토르(천둥신);Ulf=wolf=늑대;Arn=eagle=독수리;Bjarn=bear=곰;Sig=victory=승리;Ragn=counsel of the gods=신들의 뜻;Gunn=battle=전투;Hall=rock=바위;As=god=신;Ing=the god Ing=잉(신);Ketil=cauldron=솥;Stein=stone=돌;Rafn=raven=큰까마귀;Frey=lord=주인;Vig=battle=싸움;Grim=mask=가면;Orm=serpent=뱀;Svan=swan=백조;Har=army=군대;'
                + 'Ey=island, luck=섬·행운;Odd=spear point=창끝;Hjalm=helmet=투구;Gang=path=길;Fast=firm=굳은;Thjod=people=백성;Hlif=shield=방패;Rand=shield rim=방패;Raud=red=붉은;Stor=big=큰;Hun=cub=새끼 곰;Hus=house=집;Hreid=nest, home=둥지;Dag=day=낮;Aud=wealth=부;Gaut=Geat (a tribe)=가우트족'),
            masc: F('ulf=wolf=늑대;bjorn=bear=곰;mund=protection=보호;stein=stone=돌;kel=cauldron, helmet=솥·투구;vald=ruler=다스림;geir=spear=창;leif=heir=후손;vard=guardian=지킴이;fast=firm=굳은;vid=wood=나무;'
                + 'grim=mask=가면;orm=serpent=뱀;finn=Finn=핀인;mod=courage=용기;brand=sword=칼;bard=beard=수염;rik=mighty=힘센'),
            fem: F('frid=beautiful=아름다운;hild=battle=전투;dis=goddess=여신;run=secret=비밀;gerd=enclosure=울타리;borg=protection=보호;unn=wave=물결;bjorg=help=도움;ny=new=새로운;heid=honour=명예;thrud=strength=힘'),
            placeHead: F('Kirk=church=교회=town;Stain=stone=돌=hill;Ask=ash tree=물푸레나무=forest;Lang=long=긴;Brei=broad=넓은;Sand=sand=모래=coast;Fisk=fish=물고기=water/coast;Hval=whale=고래=coast;Myr=bog=늪=water/field;Hest=horse=말=field;Kald=cold=차가운;Skog=forest=숲=forest;Nor=north=북쪽;Aust=east=동쪽;Hvit=white=흰;Ulf=wolf=늑대=forest;Ravn=raven=큰까마귀;Thor=Thor=토르;'
                + 'Birk=birch=자작나무=forest;Alm=elm=느릅나무=forest;Berg=mountain=산=hill;Dal=valley=골짜기=hill/field;Aker=field=밭=field;Fen=marsh=늪=water;Heid=heath=황야=field/hill;Brun=brown=갈색;Blom=flower=꽃=field;Borg=fortress=요새=fort;Hus=house=집=town;Lin=flax=아마=field'),
            placeTail: F('by=farm, village=마을=town/field;thorpe=outlying farm=외딴 농가=field;thwaite=clearing=빈터=forest/field;toft=homestead=집터=town;dale=valley=골짜기=hill/field;fell=mountain=산=hill;beck=stream=시내=water;holm=islet=작은 섬=coast/water;vik=bay=만=coast;ness=headland=곶=coast;kirk=church=교회=town;gate=street=거리=town;garth=enclosure=울타리=town/field;scar=rock, cliff=바위 절벽=hill/coast;fjord=fjord=피오르=coast;stad=place=터=town;lund=grove=작은 숲=forest;howe=mound=언덕 무덤=hill;'
                + 'keld=spring=샘=water;foss=waterfall=폭포=water/hill;gill=ravine=협곡=hill/water;rigg=ridge=산등성이=hill;tarn=mountain lake=산속 호수=water/hill;ster=farm=농장=field;bost=farm=농장=field;berg=mountain=산=hill;bakke=bank, ridge=둑·언덕=hill;heim=home=집·마을=town;borg=fortress=요새=fort;ey=island=섬=coast/water'),
            placePre: F('Store=big=큰;Lille=little=작은;Ytre=outer=바깥쪽;Indre=inner=안쪽'),
            family: 'norse', branches: { patron: 6, dwell: 4 },
            dwell: F('Dahl=valley=골짜기;Lund=grove=작은 숲;Berg=mountain=산;Strand=shore=바닷가;Holm=islet=작은 섬;Haugen=the mound=언덕 무덤;Bakke=slope=비탈;Lie=hillside=산비탈;Nes=headland=곶;Vik=bay=만;Moen=the heath=황야;Foss=waterfall=폭포;Hagen=the enclosure=울타리 친 땅;Rud=clearing=개간지;Gard=farm=농장'),
            noble: 'af', of: 'of', titles: { m: ['Brother', 'Saint'], f: ['Sister', 'Saint'] }, royal: { m: ['King', 'Jarl', 'Prince'], f: ['Queen', 'Princess'] },
        },
        greek: {
            head: F('Theo=god=신;Dio=of Zeus=제우스의;Niko=victory=승리;Aristo=best=가장 뛰어난;Demo=the people=백성;Kalli=beautiful=아름다운;Agatho=good=좋은;Eu=good, well=좋은;Xeno=stranger=나그네;Andro=man=사내;Hippo=horse=말;Philo=loving=사랑하는;Lyko=wolf=늑대;Kleo=glory=영광;Strato=army=군대;Neo=new=새로운;Archo=rule=다스림;Hermo=Hermes=헤르메스;Apollo=Apollo=아폴론;Nausi=ship=배;Aglao=splendid=빛나는;Chryso=gold=금;Poly=many=많은;Mega=great=큰;Timo=honour=명예;Pheido=sparing=아끼는;Agano=gentle=온화한;Metro=mother=어머니;Chaire=rejoicing=기뻐하는'),
            masc: F('doros=gift=선물;kles=glory=영광;nikos=victory=승리;machos=battle=전투;stratos=army=군대;genes=born=태어난;phanes=appearing=나타난;philos=friend=벗;krates=power=힘;laos=people=백성;demos=the people=백성;ippos=horse=말;archos=ruler=통치자;menes=might=기운'),
            fem: F('dora=gift=선물;kleia=glory=영광;nike=victory=승리;mache=battle=전투;strate=army=군대;geneia=born=태어난;phila=loved=사랑받는;ippe=horse=말;ia=='),
            placeHead: F('Nea=new=새로운=town;Hiero=holy=거룩한=town;Helio=sun=해;Megalo=great=큰=town;Chryso=gold=금;Kalli=beautiful=아름다운;Leuko=white=흰;Akro=topmost=꼭대기=hill/fort;Petro=rock=바위=hill;Niko=victory=승리=town;Limno=lake=호수=water;Oino=wine=포도주=field;Chalko=copper=구리=hill;Hydro=water=물=water;Dryo=oak=참나무=forest;Pyrgo=tower=탑=fort;Melano=black=검은;Argyro=silver=은'),
            placeTail: F('polis=city=도시=town/fort;limen=harbor=항구=coast;nesos=island=섬=coast/water;kome=village=마을=town/field;pyrgos=tower=탑=fort;akra=cape=곶=coast/hill;oros=mountain=산=hill;potamos=river=강=water;drymos=woodland=숲=forest;ion=place of=~의 터=town'),
            // Greek joins drop the vowel where two meet (Aristo + ippos → Aristippos).
            elide: true,
            family: 'greek', branches: { patron: 3, place: 2 },
            noble: 'of', of: 'of', titles: { m: ['Adelphos', 'Hagios'], f: ['Adelphe', 'Hagia'] }, royal: { m: ['Basileus', 'Anax', 'Despotes', 'Archon'], f: ['Basilissa', 'Anassa', 'Despoina'] },
            royalEpithets: F('Soter=the Saviour=구원자;Nikator=the Victor=승리자;Megas=the Great=위대한 이;Euergetes=the Benefactor=은인;Kallinikos=gloriously victorious=빛나는 승리자;Philadelphos=sibling-loving=형제를 아끼는 이'),
            royalEpithetsF: F('Soteira=the Saviour=구원자;Megale=the Great=위대한 이;Euergetis=the Benefactor=은인;Kallinike=gloriously victorious=빛나는 승리자;Philadelphos=sibling-loving=형제를 아끼는 이;Philopator=father-loving=아버지를 아끼는 이'),
            noOrdinals: true,
            war: F('Monophthalmos=one-eyed=애꾸눈;Poliorketes=the Besieger=성을 함락하는 자;Keraunos=thunderbolt=벼락;Nikator=the Victor=승리자;Hoplomachos=armoured fighter=중무장 전사;Leon=the lion=사자;Hierax=the hawk=매;Grypos=hook-nosed=매부리코;Monomachos=the lone fighter=홀로 싸우는 이'),
            warF: F('Leaina=the lioness=암사자;Keraunos=thunderbolt=벼락;Nikephoros=victory-bearing=승리를 가져오는 이;Kallinike=gloriously victorious=빛나는 승리자;Thraseia=the bold=대담한 이'),
        },
        slavic: {
            head: F('Vladi=rule=다스림;Slavo=glory=영광;Miro=peace=평화;Bogo=god=신;Bori=battle=싸움;Dobro=good=좋은;Rado=joy, counsel=기쁨·조언;Jaro=fierce, strong=굳센;Lyubo=love=사랑;Milo=dear=다정한;Bole=great=큰;Voji=warrior=전사;Brani=defend=지킴;Sveto=holy, light=거룩한·빛;Zlato=gold=금;Drago=precious=소중한;Ostro=sharp=날카로운;Luto=fierce=사나운;Stani=to become=되다;Dali=far=먼;Tiho=quiet=고요한;Veli=great=큰;Rati=war=전쟁;Vse=all=모든'),
            masc: F('mir=peace, world=평화·세상;slav=glory=영광;bor=battle=싸움;gost=guest=손님;vit=lord=주인;polk=regiment=군대;volod=ruler=다스림;drag=dear=소중한;dan=given=주어진;gnev=anger=분노;mil=dear=다정한'),
            fem: F('slava=glory=영광;mira=peace=평화;mila=dear=다정한;dana=given=주어진;ka=little=작은;a=='),
            placeHead: F('Bel=white=흰;Novo=new=새로운=town;Cherno=black=검은;Zlato=gold=금;Gor=mountain=산=hill;Dub=oak=참나무=forest;Lip=linden=보리수=forest/town;Brez=birch=자작나무=forest;Kamen=stone=돌=hill/fort;Vod=water=물=water;Bystr=swift=빠른=water;Suh=dry=마른;Mokr=wet=젖은=water/field;Volk=wolf=늑대=forest;Vyshe=upper=위쪽=fort/town;Slav=glory=영광=town;Krasno=red, fair=붉은·고운;Les=forest=숲=forest;Pol=field=들=field;Ozer=lake=호수=water;Rib=fish=물고기=water;Star=old=오래된;Tikh=quiet=고요한'),
            placeTail: F('grad=town, castle=도시·성=town/fort;gorod=town=도시=town/fort;ovo=belonging to=~의 (마을)=town/field;evo=belonging to=~의 (마을)=town/field;ets=little=작은=town;ica=little=작은=water/town;ovka=small village=작은 마을=field/town;selo=village=마을=town/field;gora=mountain=산=hill;dol=valley=골짜기=hill/field;vrh=peak=봉우리=hill;polje=field=들판=field;reka=river=강=water;voda=water=물=water;ozero=lake=호수=water'),
            elide: true,
            placePre: F('Gornji=upper=위쪽;Donji=lower=아래쪽;Veliki=great=큰;Mali=little=작은;Stari=old=오래된'),
            saint: { m: 'Sveti {}', f: 'Sveta {}' },
            family: 'slavic', branches: { patron: 3, place: 2, dwell: 2, trade: 2, looks: 2 },
            dwell: F('Gorski=of the mountains=산 사람;Zagorski=beyond the hills=언덕 너머;Podgorski=below the hill=언덕 아래;Zarecki=beyond the river=강 건너;Zalesski=beyond the forest=숲 너머;Dubrovski=by the oak wood=참나무 숲가;Lipski=by the lindens=보리수 곁'),
            trade: F('Kovač=smith=대장장이;Kuznetsov=smith\'s child=대장장이의 자식;Melnik=miller=방앗간 주인;Kravets=tailor=재단사;Rybak=fisherman=어부;Pekar=baker=빵 굽는 사람;Bondar=cooper=통 만드는 사람;Goncharov=potter\'s child=도공의 자식;Plotnikov=carpenter\'s child=목수의 자식;Kolar=wheelwright=수레바퀴 장인'),
            looks: F('Belov=white=흰;Chernov=black=검은;Ryzhov=red-haired=빨강 머리;Sedov=grey-haired=흰머리;Novak=newcomer=새로 온 사람;Maly=small=작은;Krasnov=red, handsome=붉은·잘생긴;Lysenko=bald=대머리;Kudryashov=curly-haired=곱슬머리'),
            noble: 'ski', of: 'of', link: 'o', titles: { m: ['Brat', 'Sveti'], f: ['Sestra', 'Sveta'] }, royal: { m: ['Knyaz', 'Tsar', 'Voivode'], f: ['Knyaginya', 'Tsaritsa'] },
        },
    };
    const CACHE_ROOTS = Object.keys(CACHE);
    // First parts of names and places (Chryso-, Zlato-), to spread them out in one list.
    const TAIL_TEXTS = new Set(CACHE_ROOTS.flatMap(k => CACHE[k].placeTail.map(f => f.t)));
    const HEAD_TEXTS = new Set(CACHE_ROOTS.flatMap(k => [...CACHE[k].head, ...CACHE[k].placeHead].map(f => f.t)));
    const CACHE_KINDS = ['common', 'noble', 'religious', 'royal', 'warrior', 'scholar'];
    const FAMILY_BRANCHES = ['patron', 'place', 'dwell', 'trade', 'looks'];
    // Place kinds → which place fragments fit (none listed = any fragment).
    const PLACE_CATS = {
        city: ['town', 'fort'], town: ['town', 'field'], street: ['town'], building: ['town', 'fort'], transit: ['water', 'coast', 'town'],
        park: ['field', 'town'], mountain: ['hill'], water: ['water'], forest: ['forest'], sea: ['coast', 'water'], fort: ['fort', 'hill'],
    };
    // "Cache + AI" (polish) is a Cache name first, so it counts as Cache everywhere the form is concerned.
    const METHODS = ['ai', 'cache', 'polish'];
    function isCache(form = {}) {
        return (form.method === 'cache' || form.method === 'polish') && (form.target === 'person' || form.target === 'place');
    }
    function isPolish(form = {}) {
        return form.method === 'polish' && isCache(form);
    }
    // v0.2.10: the chips can all be off (to switch from one to another in any order). The raw picks are
    // what the chips show; cacheRoots / cacheKinds still fall back to a default wherever a name is made.
    function pickedRoots(form = {}) {
        return Array.isArray(form.roots) ? form.roots.filter(x => CACHE_ROOTS.includes(x)) : ['oldenglish'];
    }
    function pickedKinds(form = {}) {
        return Array.isArray(form.ckinds) ? form.ckinds.filter(x => CACHE_KINDS.includes(x)) : ['common'];
    }
    // What's missing before a Cache name can be made ('' when nothing is).
    function cacheNeed(form = {}) {
        if (!isCache(form)) return '';
        if (!pickedRoots(form).length) return 'roots';
        if (form.target === 'person' && !pickedKinds(form).length) return 'kinds';
        return '';
    }
    function cacheRoots(form = {}) {
        const r = (Array.isArray(form.roots) ? form.roots : []).filter(x => CACHE_ROOTS.includes(x));
        return r.length ? r : ['oldenglish'];
    }
    function cacheKinds(form = {}) {
        const k = (Array.isArray(form.ckinds) ? form.ckinds : []).filter(x => CACHE_KINDS.includes(x));
        return k.length ? k : ['common'];
    }
    // v0.2.8: Split (one root per name, in turn) or Merge (two different roots in each name).
    // Cache and AI keep their own choice. Only matters with two or more roots.
    const ROOT_MIXES = ['split', 'merge'];
    function cacheMerge(form = {}) {
        return isCache(form) && form.rootMix === 'merge' && cacheRoots(form).length > 1;
    }
    // Every ordered pair of two different roots, shuffled: names take them in turn.
    function rootPairs(roots, rnd = Math.random) {
        const pairs = [];
        for (const a of roots) for (const b of roots) if (a !== b) pairs.push([a, b]);
        for (let i = pairs.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [pairs[i], pairs[j]] = [pairs[j], pairs[i]]; }
        return pairs;
    }
    // v0.2.1: the AI can follow the same roots. Kept apart from the Cache roots (form.aiRoots),
    // and empty means "any", so nothing changes until a root is picked.
    function aiRoots(form = {}) {
        if (isCache(form) || (form.target !== 'person' && form.target !== 'place')) return [];
        return (Array.isArray(form.aiRoots) ? form.aiRoots : []).filter(x => CACHE_ROOTS.includes(x));
    }
    // When another choice says the opposite, only one goes to the AI:
    // typed "Like this" words lead, and Lovecraftian invented people stay eldritch.
    function aiRootsOff(form = {}) {
        if (!aiRoots(form).length) return '';
        if (likeWords(form).length) return 'like';
        if (form.vibe === 'cosmic' && form.target === 'person' && realMode(form) === 'invented') return 'cosmic';
        return '';
    }
    function aiRootsUsed(form = {}) {
        return aiRootsOff(form) ? [] : aiRoots(form);
    }
    function aiMerge(form = {}) {
        return form.aiRootMix === 'merge' && aiRootsUsed(form).length > 1;
    }
    // "built from Latin or Celtic" / "blending Latin and Celtic" for the short ✨ and part lines.
    function rootsPhrase(form, roots, verb) {
        return aiMerge(form) ? `${verb === 'keep' ? 'Keep it blending' : 'Blend'} ${rootNames(roots, 'and')} name roots in one name.`
            : `${verb === 'keep' ? 'Keep it built from' : 'Build it from'} ${rootNames(roots)} name roots.`;
    }
    function rootNames(roots, join = 'or') {
        const n = roots.map(r => STRINGS.en.roots[r]);
        return n.length > 1 ? `${n.slice(0, -1).join(', ')} ${join} ${n[n.length - 1]}` : (n[0] || '');
    }
    const VOWEL = /[aeiouyæœ]/i;
    // Glue two fragments: one letter where they'd double up (Wulf + frith → Wulfrith).
    // With elide (Greek, Slavic) a vowel meeting a vowel drops the first one (Aristo + ippos → Aristippos).
    function glue(a, b, elide = false, link = '') {
        if (!a) return b;
        if (!b) return a;
        const last = a[a.length - 1].toLowerCase();
        const first = b[0].toLowerCase();
        if (elide && VOWEL.test(last) && VOWEL.test(first) && a.length > 2) return a.slice(0, -1) + b;
        // Latin and Slavic place names join two consonants with -o- (Noviomagus, Belozersk).
        if (link && /[a-z]/.test(last) && /[a-z]/.test(first) && !VOWEL.test(last) && !VOWEL.test(first)) return a + link + b;
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
    // Only fragments that fit, and nothing when none do (for the optional extras).
    function strictCats(list = [], cats) {
        if (!cats) return list;
        return list.filter(f => !f.cats || f.cats.some(c => cats.includes(c)));
    }
    function genderOf(form, rnd) {
        if (form.gender === 'feminine') return 'f';
        if (form.gender === 'masculine') return 'm';
        return rnd() < 0.5 ? 'm' : 'f';
    }
    function pickWeighted(weights, rnd) {
        const keys = Object.keys(weights).filter(k => weights[k] > 0);
        let r = rnd() * keys.reduce((s, k) => s + weights[k], 0);
        for (const k of keys) { r -= weights[k]; if (r < 0) return k; }
        return keys[keys.length - 1];
    }
    // Archo + archos, Slav + slava: the same word twice.
    function sameStem(a, b) {
        const x = dropVowel(a).toLowerCase(), y = b.toLowerCase();
        return x.length >= 3 && y.startsWith(x.slice(0, 4));
    }
    // v0.2.25: the head and the ending sound the same at the join (Gor + gorod, Stell + ella, Gwyn + wyn, Iust + ius).
    function soundKey(t) { return String(t).toLowerCase().replace(/ch/g, 'k').replace(/c/g, 'k'); }
    function sameSound(a, b) {
        const x = soundKey(a), y = soundKey(b);
        if (x.length < 3 || y.length < 3) return false;
        return x.slice(0, 3) === y.slice(0, 3) || y.startsWith(x) || x.endsWith(y.slice(0, 3));
    }
    // v0.2.25: two place fragments that say the same thing (Castro + dunum = fort + fort, Bec + mare = stream + pond).
    const MEANING_SKIP = new Set(['of', 'the', 'by', 'on', 'at', 'a', 'an', 'to', 'for', 'in', 'near', 'place', 'land', 'belonging', 'having', 'like', 's', 'child']);
    const MEANING_KIN = {
        great: 'big', big: 'big', large: 'big', little: 'small', small: 'small',
        water: 'water', lake: 'water', river: 'water', stream: 'water', sea: 'water', pool: 'water', spring: 'water', pond: 'water', marsh: 'water', well: 'water', brook: 'water',
        wood: 'wood', woods: 'wood', forest: 'wood', grove: 'wood', woodland: 'wood',
        hill: 'hill', mountain: 'hill', height: 'hill', ridge: 'hill', peak: 'hill', top: 'hill', topmost: 'hill', upland: 'hill', hillock: 'hill',
        fort: 'fort', stronghold: 'fort', castle: 'fort', ringfort: 'fort', fortress: 'fort', tower: 'fort', camp: 'fort',
        town: 'town', city: 'town', village: 'town', homestead: 'town', settlement: 'town', farmstead: 'town', farm: 'town', dwelling: 'town',
        valley: 'vale', dale: 'vale', glen: 'vale', field: 'field', fields: 'field', meadow: 'field', plain: 'field', island: 'isle',
    };
    function meaningKeys(f) {
        return new Set(((f && f.en) || '').toLowerCase().match(/[a-z]+/g)?.filter(w => !MEANING_SKIP.has(w)).map(w => MEANING_KIN[w] || w) || []);
    }
    function meaningClash(a, b) {
        const x = meaningKeys(a);
        for (const k of meaningKeys(b)) if (x.has(k)) return true;
        return false;
    }
    // v0.2.25: a place of two describing words and no thing (Shan + boy = old + yellow). Slavic -ica / -ets
    // ("little") make real place names out of one describing word (Belica, Starets), so they don't count.
    const ADJ_WORDS = new Set(['great', 'big', 'small', 'little', 'white', 'black', 'red', 'blue', 'blue-green', 'green', 'high', 'old', 'new', 'long', 'fair', 'dark', 'grey', 'light grey', 'yellow', 'speckled', 'rough', 'streaked', 'broad', 'cold', 'brown', 'swift', 'dry', 'wet', 'quiet', 'upper', 'lower', 'beautiful', 'fine', 'holy']);
    function isAdj(f) { return ADJ_WORDS.has(((f && f.en) || '').split(',')[0].trim().toLowerCase()); }
    // v0.2.26: …but never "great" + "little" (Megalets).
    function twoAdjectives(h, t) { return isAdj(h) && isAdj(t) && (!(t.en === 'little' && t.t.length <= 3) || /^(great|big)\b/.test(h.en)); }
    // v0.2.26: dropping a vowel left the same vowel twice (Nea + evo → Neevo, Dio + ippe → Diippe).
    function newDoubleVowel(text, h, t) {
        const d = /(aa|ee|ii|oo|uu)/i;
        return d.test(text) && !d.test(h) && !d.test(t);
    }
    // v0.2.25: Slavic "upper / lower / great / little / old" agree with the place (Velika Reka, Gornje Selo, Stari Grad).
    const SLAVIC_ADJ = { Gornji: 'Gornj', Donji: 'Donj', Veliki: 'Velik', Mali: 'Mal', Stari: 'Star' };
    function slavicAgree(word, place) {
        const stem = SLAVIC_ADJ[word];
        if (!stem) return word;
        if (/a$/i.test(place)) return `${stem}a`;
        if (/[oe]$/i.test(place)) return stem + (/j$/.test(stem) ? 'e' : 'o');
        return word;
    }
    // Merge: each fragment keeps the root it came from, for the fragments line.
    function tagRoot(f, r, on) { return on ? { ...f, r } : f; }
    // One given name: head + ending. The two parts never mean the same thing (Wulf + wulf).
    // Merge: the head from one root, the ending from another (root2). Joins follow whichever has the rule.
    // v0.2.29: a t or l, a vowel, the same t or l again sounds like a stutter (Mart + ata → Martata,
    // Fel + ella → Felella). Only t and l, and only endings that close on a vowel or -us, so real shapes
    // like Steinunn, Kenin or Adalolf stay.
    function echoSyllable(h, t) {
        const c = String(h).slice(-1).toLowerCase();
        return /[tl]/.test(c) && /^[aeiouy]/i.test(t) && String(t).charAt(1).toLowerCase() === c && /([aeiouy]|us)$/i.test(t);
    }
    function cacheGiven(root, g, rnd, root2 = '') {
        const R = CACHE[root];
        const mix = !!root2 && root2 !== root;
        const E = mix ? CACHE[root2] : R;
        const elide = R.elide || E.elide;
        const tails = g === 'f' ? E.fem : E.masc;
        const make = (h, t) => ({ text: glue(h.t, t.t, elide), frags: [tagRoot(h, root, mix), tagRoot(t, root2, mix)], root });
        for (let i = 0; i < 20; i++) {
            const h = pick(R.head, rnd);
            const t = pick(tails, rnd);
            if (t.en && h.en === t.en) continue;
            if (sameStem(h.t, t.t) || sameSound(h.t, t.t)) continue;
            const text = glue(h.t, t.t, elide);
            if (!sayable(text)) continue;
            // v0.2.26: the ending must still be there (Mega + a → Mega) and not leave a doubled vowel.
            if (text.toLowerCase() === h.t.toLowerCase() || newDoubleVowel(text, h.t, t.t)) continue;
            if (echoSyllable(h.t, t.t)) continue;
            return make(h, t);
        }
        return make(R.head[0], tails[0]);
    }
    // v0.2.29: Slavic -ovo after a hard sound, -evo after a soft one (Krasnovo, Tikhovo; Kovačevo).
    function slavicOvo(head, t, E) {
        if (!/^[oe]vo$/.test(t.t) || E !== CACHE.slavic) return t;
        const stem = String(head).replace(/[aeiouy]+$/i, '');
        const want = /(j|c|č|ć|š|ž|đ|ch|sh|zh|ts)$/i.test(stem) ? 'evo' : 'ovo';
        return t.t === want ? t : (E.placeTail.find(f => f.t === want) || t);
    }
    // A place: head + tail, now and then with "Great …" / "…-on-Sea", or named for a saint (St. Edwin's, Kilbran).
    // Merge: the head from one root and the tail from another (root2); no saint's name then.
    function cachePlace(root, cats, rnd, plain = false, root2 = '') {
        const R = CACHE[root];
        const mix = !!root2 && root2 !== root;
        const E = mix ? CACHE[root2] : R;
        const elide = R.elide || E.elide, link = R.link || E.link;
        if (!mix && !plain && R.saint && (!cats || cats.includes('town')) && rnd() < 0.07) {
            const g = rnd() < 0.5 ? 'm' : 'f';
            const who = cacheGiven(root, g, rnd);
            const pattern = R.saint[g];
            const name = pattern.startsWith('Kil') ? who.text.toLowerCase() : who.text;
            const text = pattern.replace('{}', name);
            const lead = pattern.split('{}')[0].trim().replace(/-$/, '');
            const frag = lead === 'Kil' ? { t: 'Kil', en: 'church of', ko: '~의 교회' } : { t: lead, en: 'saint', ko: '성인' };
            if (sayable(text)) return { text, frags: [frag, ...who.frags], root, saint: true };
        }
        const heads = fitCats(R.placeHead, cats);
        const tails = fitCats(E.placeTail, cats);
        // v0.2.25: a picked place kind wants one fragment of that kind (no "forest" called Magnana),
        // unless the root has too few to find one in time.
        const ofKind = f => !!(f.cats && cats && f.cats.some(c => cats.includes(c)));
        // v0.2.25: an Old English word + a short Latin ending sounds like a joke (Kingsetum, Birchona).
        const shortLatin = mix && root === 'oldenglish' && root2 === 'latin';
        // v0.2.29: and few Latin endings are left after an English word (mostly -magus), so this pair
        // goes the natural way round most of the time: a Latin head and an Old English tail (Aurostead).
        if (shortLatin && rnd() < 0.7) return cachePlace('latin', cats, rnd, plain, 'oldenglish');
        let base = null;
        for (let i = 0; i < 40; i++) {
            const h = pick(heads, rnd);
            const t = slavicOvo(h.t, pick(tails, rnd), E);
            if (t.en && h.en === t.en) continue;
            if (h.t.toLowerCase() === t.t.toLowerCase()) continue;
            // Not the same word twice (Castr + castra), nor the same sound (Gor + gorod).
            if (t.t.length > 3 && h.t.length > 3 && (t.t.toLowerCase().startsWith(h.t.toLowerCase()) || h.t.toLowerCase().startsWith(t.t.toLowerCase()))) continue;
            if (sameSound(h.t, t.t)) continue;
            if (meaningClash(h, t) || twoAdjectives(h, t)) continue;
            if (cats && i < 30 && !ofKind(h) && !ofKind(t)) continue;
            // v0.2.29: -arium too (Whitarium, Midarium).
            if (shortLatin && (t.t.length <= 4 || t.t === 'arium')) continue;
            const text = capFirst(glue(h.t, t.t, elide, link));
            if (!sayable(text) || newDoubleVowel(text, h.t, t.t)) continue;
            // r + vowel + r at the join (Akro + oros → Akroros).
            if (/ror/i.test(text) && !/ror/i.test(h.t) && !/ror/i.test(t.t)) continue;
            base = { text, frags: [tagRoot(h, root, mix), tagRoot(t, root2, mix)], root };
            break;
        }
        if (!base) base = { text: capFirst(glue(heads[0].t, tails[0].t, elide, link)), frags: [tagRoot(heads[0], root, mix), tagRoot(tails[0], root2, mix)], root };
        if (plain || rnd() >= 0.12) return base;
        // Now and then an extra word: before (Great, Ober, Lille) or after (-on-Sea, Magna, am See).
        // The extra word before comes from the head's root, the one after from the tail's.
        // Never an extra word that says what the name already says (Grandroche-le-Grand, Magnona Magna).
        const fresh = f => f.en !== base.frags[0].en && !base.frags.some(b => meaningClash(f, b));
        const pre = strictCats(R.placePre, cats).filter(fresh).map(f => tagRoot(f, root, mix));
        const post = strictCats(E.placePost, cats).filter(fresh).map(f => tagRoot(f, root2, mix));
        const usePre = pre.length && (!post.length || rnd() < 0.5);
        const list = usePre ? pre : post;
        if (!list.length) return base;
        let a = pick(list, rnd);
        if (SLAVIC_ADJ[a.t]) a = { ...a, t: slavicAgree(a.t, base.text) };
        let text;
        if (usePre) text = a.t.endsWith('-') ? a.t + base.text : `${a.t} ${base.text}`;
        else text = a.t.startsWith('-') ? base.text + a.t : `${base.text} ${a.t}`;
        // Ashwell + -le-Street runs three l's together: keep the plain name then.
        if (!sayable(text)) return base;
        return { text, frags: usePre ? [a, ...base.frags] : [...base.frags, a], root };
    }
    const SON = { t: 'son', en: 'son', ko: '아들' };
    const LATIN_END = (t) => ({ t, en: 'Latin ending', ko: '라틴식 끝' });
    // Slavic family names change for women: -ov → -ova, -ski → -ska, Maly → Mala.
    function slavicFem(text) {
        if (/([sc])k[iy]$/.test(text)) return text.replace(/([sc])k[iy]$/, '$1ka');
        if (/(ov|ev|in)$/.test(text)) return `${text}a`;
        if (/y$/.test(text)) return text.replace(/y$/, 'a');
        return text;
    }
    function dropVowel(text) { return text.replace(/[aeiouy]+$/i, ''); }
    // Place + -ski the way Slavic names really do it: Novica → Novicki, Chernets → Chernecki,
    // Slavovka → Slavovski, Les → Leski (never "-cski" or "-kski").
    // v0.2.27: -ski can make a place hard to say (Krasnovrh → Krasnovrhska): try another place then.
    function skiPlace(makePlace) {
        let pl, text;
        for (let i = 0; i < 8; i++) {
            pl = makePlace();
            text = slavicSki(pl.text);
            if (sayable(slavicFem(text))) break;
        }
        return { pl, text };
    }
    function slavicSki(place) {
        const b = dropVowel(place);
        if (/ts$/.test(b)) return `${b.slice(0, -2)}cki`;
        if (/[cs]$/.test(b)) return `${b}ki`;
        // v0.2.26: a vowel + k (reka) softens: Polorecki, Zarecki. After a consonant (Polovka) the k just drops: Polovski.
        if (/[aeiouy]k$/.test(b)) return `${b.slice(0, -1)}cki`;
        if (/k$/.test(b)) return `${b.slice(0, -1)}ski`;
        return `${b}ski`;
    }
    // One family name of a given kind (branch): father's name, home place, where they lived, trade, or looks.
    function cacheFamilyBranch(root, branch, g, rnd) {
        const R = CACHE[root];
        const place = () => cachePlace(root, null, rnd, true);
        const fem = s => (root === 'slavic' && g === 'f' ? slavicFem(s) : s);
        // Roman women took the feminine family name (Silvia) and never a trade name.
        const latinF = R.family === 'nomen' && g === 'f';
        if (latinF && branch === 'trade') branch = 'looks';
        if (branch === 'patron') {
            switch (R.family) {
                case 'nomen': { // Roman family name: head + -ius (Silvius)
                    const h = pick(R.head, rnd);
                    const end = latinF ? 'ia' : 'ius';
                    return { text: glue(h.t, end), frags: [h, { t: end, en: 'family of', ko: '~ 집안' }] };
                }
                case 'english': { // father's name + s / son
                    const f = cacheGiven(root, 'm', rnd);
                    const end = rnd() < 0.5 ? { t: 's', en: "'s (child of)", ko: '~의 (자식)' } : SON;
                    return { text: f.text + end.t, frags: [...f.frags, end] };
                }
                case 'french': { // Fitz + father's name (FitzGerald)
                    const f = cacheGiven(root, 'm', rnd);
                    return { text: `Fitz${f.text}`, frags: [{ t: 'Fitz', en: 'son of', ko: '~의 아들' }, ...f.frags] };
                }
                case 'celtic': { // Mac / O' + a given name
                    const f = cacheGiven(root, 'm', rnd);
                    const pre = rnd() < 0.6 ? { t: 'Mac', en: 'son of', ko: '~의 아들' } : { t: "O'", en: 'descendant of', ko: '~의 후손' };
                    return { text: `${pre.t}${f.text}`, frags: [pre, ...f.frags] };
                }
                case 'norse': { // father's name + son (or dottir for a daughter)
                    const f = cacheGiven(root, 'm', rnd);
                    const end = g === 'f' ? { t: 'dottir', en: 'daughter', ko: '딸' } : SON;
                    const s = /s$/i.test(f.text) ? '' : 's';
                    return { text: f.text + s + end.t, frags: [...f.frags, end] };
                }
                case 'greek': { // father's name + -ides (Theodorides)
                    const f = cacheGiven(root, 'm', rnd);
                    let base = dropVowel(f.text.replace(/(os|es|as|is|on)$/, '')), frags = f.frags;
                    // v0.2.26: a long father's name keeps only its first part (Aristostratides → Aristides).
                    if ((base + 'ides').length > 12 && f.frags[0]) { base = dropVowel(f.frags[0].t); frags = [f.frags[0]]; }
                    return { text: `${base}ides`, frags: [...frags, { t: 'ides', en: 'son of', ko: '~의 아들' }] };
                }
                case 'slavic': { // father's name + -ov / -ović
                    const f = cacheGiven(root, 'm', rnd);
                    const end = rnd() < 0.6 ? { t: 'ov', en: "'s (child of)", ko: '~의 (자식)' } : { t: 'ović', en: 'son of', ko: '~의 아들' };
                    // v0.2.25: a long father's name keeps only its first part (Dragovolodović → Dragović),
                    // as short forms did (Radović, Vladov).
                    let base = dropVowel(f.text), frags = f.frags;
                    if ((base + end.t).length > 11 && f.frags[0]) { base = dropVowel(f.frags[0].t); frags = [f.frags[0]]; }
                    const text = end.t === 'ov' ? fem(base + 'ov') : base + end.t;
                    return { text, frags: [...frags, end] };
                }
                default: return place();
            }
        }
        if (branch === 'place') {
            if (R.family === 'slavic') { const { pl, text } = skiPlace(place); return { text: fem(text), frags: [...pl.frags, { t: 'ski', en: 'of, from', ko: '~의·~ 출신' }] }; }
            const pl = place();
            if (R.family === 'greek') return { text: `of ${pl.text}`, frags: pl.frags }; // Thales of Miletus
            return pl;
        }
        if (branch === 'dwell') {
            if (R.dwellPre && (!R.dwell || rnd() < 0.6)) {
                const pre = pick(R.dwellPre, rnd);
                const word = pick(R.dwellWord.filter(w => !w.cats || w.cats.includes(pre.t.toLowerCase())), rnd);
                return { text: pre.t + word.t, frags: [pre, word] };
            }
            const w = pick(R.dwell, rnd);
            return { text: fem(w.t), frags: [w] };
        }
        if (branch === 'trade') { const w = pick(R.trade, rnd); return { text: fem(w.t), frags: [w] }; }
        if (branch === 'looks') {
            if (latinF) {
                // Bynames agree: Longus → Longa, Niger → Nigra. Nouns like Naso stay with men.
                const w = pick(R.looks.filter(x => /(us|er)$/.test(x.t)), rnd);
                return { text: w.t.replace(/us$/, 'a').replace(/er$/, 'ra'), frags: [w] };
            }
            const w = pick(R.looks, rnd);
            if (R.looksPre) return { text: R.looksPre.t + w.t, frags: [R.looksPre, w] }; // Le + blanc → Leblanc
            return { text: fem(w.t), frags: [w] };
        }
        return place();
    }
    // A family name the way each root makes one, from its five kinds (branches) in turn.
    function cacheFamily(root, g, rnd) {
        const R = CACHE[root];
        let branch = pickWeighted(R.branches || { place: 1 }, rnd);
        if (R.family === 'greek' && g === 'f') branch = 'place'; // -ides means "son of")
        if (R.family === 'nomen' && g === 'f' && branch === 'trade') branch = 'looks'; // v0.2.11: show what she really got
        return { ...cacheFamilyBranch(root, branch, g, rnd), root, branch };
    }
    // "de" + a vowel → d'Aubeval.
    function withParticle(p, place) {
        if (p === 'de' && /^[aeiouy]/i.test(place)) return { joined: `d'${place}`, particle: '' };
        return { joined: `${p} ${place}`, particle: p };
    }
    // Latin bynames agree with a woman: Magnus → Magna, Rufus → Rufa.
    function latinAgree(f, root, g) {
        const LATIN_F = { Victor: 'Victrix', Bellator: 'Bellatrix', Leo: 'Leaena' };
        if (root === 'latin' && g === 'f' && LATIN_F[f.t]) return { ...f, t: LATIN_F[f.t] };
        if (root !== 'latin' || g !== 'f' || !/us$/.test(f.t)) return f;
        return { ...f, t: f.t.replace(/us$/, 'a') };
    }
    // v0.2.11: small ordinals are the usual ones (II, III); VII and up stay rare.
    const ORDINAL_WEIGHTS = [30, 22, 14, 10, 8, 4, 3, 2];
    const ORDINAL_TEXTS = new Set(ORDINALS.map(o => o.t));
    function pickOrdinal(rnd) {
        return ORDINALS[Number(pickWeighted(Object.fromEntries(ORDINAL_WEIGHTS.map((w, i) => [i, w])), rnd))];
    }
    // Kings and queens: an ordinal (II) or an epithet (the Fair, Magnus, Soter).
    function royalEpithet(root, rnd, g = 'm') {
        const R = CACHE[root];
        const words = (g === 'f' && R.royalEpithetsF) || R.royalEpithets || ROYAL_EN;
        const f = latinAgree((!R.noOrdinals && rnd() < 0.5) ? pickOrdinal(rnd) : pick(words, rnd), root, g);
        return { text: f.t, frags: [f] };
    }
    // The first title (king, queen) half the time; the others (duke, prince…) share the rest.
    function royalTitle(root, g, rnd) {
        const list = CACHE[root].royal[g] || CACHE[root].royal.m;
        return list.length > 1 && rnd() >= 0.5 ? pick(list.slice(1), rnd) : list[0];
    }
    // Warriors: Ironhand, Fairhair, the Red (or a Latin / Greek byname).
    function warEpithet(root, rnd, g = 'm') {
        const R = CACHE[root];
        if (R.war) { const f = latinAgree(pick((g === 'f' && R.warF) || R.war, rnd), root, g); return { text: f.t, frags: [f] }; }
        if (rnd() < 0.35) { const f = pick(WAR_EN.whole, rnd); return { text: f.t, frags: [f] }; }
        for (let i = 0; i < 20; i++) {
            const h = pick(WAR_EN.head, rnd), t = pick(WAR_EN.tail, rnd);
            if (h.en === t.en) continue;
            return { text: h.t + t.t, frags: [h, t] };
        }
        return { text: 'Ironhand', frags: [WAR_EN.head[0], WAR_EN.tail[0]] };
    }
    // Scholars wrote their names in Latin: Ethelwin → Ethelwinus, Ashford → Ashfordensis (from Ashford).
    // v0.2.25: Latin has no accents (Guévalensis → Guevalensis).
    function noAccents(t) { return String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\u00df/g, 'ss'); }
    function latinGiven(given, g) {
        const t = noAccents(given.text);
        if (t !== given.text) given = { ...given, text: t };
        if (g === 'f') {
            if (/a$/.test(t)) return given;
            // -ienne → -iana (Clairienne → Clairiana, not Clairienna).
            if (/ienne$/.test(t)) return { ...given, text: t.replace(/ienne$/, 'iana'), frags: [...given.frags, LATIN_END('a')] };
            return { ...given, text: `${t.replace(/[eiouy]+$/, '')}a`, frags: [...given.frags, LATIN_END('a')] };
        }
        if (/us$/.test(t)) return given;
        // Greek names keep -es and -as (Sophocles, Aeneas); -laos → -laus, -os → -us.
        if (/(es|as)$/.test(t)) return given;
        if (/os$/.test(t)) return { ...given, text: t.replace(/os$/, 'us'), frags: [...given.frags, LATIN_END('us')] };
        return { ...given, text: `${dropVowel(t)}us`, frags: [...given.frags, LATIN_END('us')] };
    }
    // Holloway → Hollow-, Moore → Moor-, Nauta → Naut-: drop a last y, then e, o or a before -ius.
    function latinStem(t) { return t.replace(/y$/i, '').replace(/[eoa]$/i, ''); }
    function scholarFamily(root, g, rnd, fixed = '') {
        if (fixed) return { text: `${latinStem(fixed.replace(/\s+/g, ''))}ius`, fixed: true };
        if (rnd() < 0.5) {
            // Latinized from the man's form (Kudryashov, not Kudryashova).
            const f = cacheFamily(root, 'm', rnd);
            // v0.2.29: a Latin word stays as it is for a man (Agricola, Naso — not Agricolius, Nasius).
            // Roman women had no trade or nickname surname, so a woman gets a place name then.
            const latinWord = root === 'latin' && ['trade', 'looks'].includes(f.branch) && /^[A-Z][a-z]+[ao]$/.test(f.text);
            if (latinWord && g !== 'f') return { text: f.text, frags: f.frags, branch: f.branch };
            if (!latinWord && ['dwell', 'trade', 'looks'].includes(f.branch) && !/[\s']/.test(f.text) && !/(us|ius|[sc]k[aiy]|er)$/.test(f.text)) return { text: noAccents(`${latinStem(f.text)}ius`), frags: [...f.frags, LATIN_END('ius')], branch: f.branch };
        }
        const pl = cachePlace(root, null, rnd, true);
        const base = noAccents(pl.text).replace(/(is|us|um|ia|os)$/i, '');
        return { text: `${dropVowel(base)}ensis`, frags: [...pl.frags, { t: 'ensis', en: 'from', ko: '~ 출신' }], branch: 'place' };
    }
    // One whole Cache name. Merge (mix = [A, B]): given names take A's head and B's ending,
    // places A's head and B's tail; the family name, title and bynames follow `root`, one of the two.
    // v0.2.10: the family name (or "of a place") never reuses a part of the given or middle name
    // (Veria Veria, Tihomira Mirodragović). Parts compare by stem, 3 letters or more, so endings
    // like -an or -ia that many names share don't count.
    function fragStems(frags = []) {
        // v0.2.11: Greek-style endings go too (nikos ~ Niko-), the way the -ides family name drops them.
        return frags.map(f => {
            const t = String(f.t || '').toLowerCase().replace(/[^a-zà-ÿœæ]/g, '');
            const bare = t.replace(/(os|es|as|us)$/, '');
            return dropVowel(bare.length >= 3 ? bare : t);
        }).filter(x => x.length >= 3);
    }
    const NAME_SIDE = ['given', 'middle'];
    const HOME_SIDE = ['family', 'origin'];
    function sharedStems(a = [], b = []) {
        const x = new Set(fragStems(a));
        return fragStems(b).some(t => x.has(t));
    }
    function piecesClash(pieces = []) {
        const names = pieces.filter(p => NAME_SIDE.includes(p.role)).flatMap(p => p.frags || []);
        return pieces.some(p => HOME_SIDE.includes(p.role) && !p.fixed && sharedStems(names, p.frags || []));
    }
    function cacheOne(form, root, kind, rnd = Math.random, mix = null) {
        let n;
        for (let i = 0; i < 12; i++) {
            n = cacheOneRaw(form, root, kind, rnd, mix);
            if (!n.pieces || !piecesClash(n.pieces)) return n;
        }
        return n;
    }
    function cacheOneRaw(form, root, kind, rnd = Math.random, mix = null) {
        const pair = Array.isArray(mix) && mix.length === 2 && mix[0] !== mix[1] ? mix : null;
        if (form.target === 'place') {
            const p = pair ? cachePlace(pair[0], PLACE_CATS[normalizeKind('place', form.kind)] || null, rnd, false, pair[1])
                : cachePlace(root, PLACE_CATS[normalizeKind('place', form.kind)] || null, rnd);
            return { name: p.text, frags: p.frags, root: pair ? pair[0] : root, ...(pair ? { mix: pair } : {}), cache: true };
        }
        const R = CACHE[root];
        const g = genderOf(form, rnd);
        const parts = (Array.isArray(form.parts) ? form.parts : ['given']).filter(p => NAME_PARTS.includes(p));
        const fixed = parts.includes('family') ? cleanPiece(form.fixedFamily) : '';
        const pieces = [];
        const mixed = pair ? { mix: pair } : {};
        // A middle name mixes the same two roots the other way round, for variety.
        const giv = (flip = false) => (pair ? cacheGiven(flip ? pair[1] : pair[0], g, rnd, flip ? pair[0] : pair[1]) : cacheGiven(root, g, rnd));
        let given = giv();
        if (kind === 'scholar') given = latinGiven(given, g);
        if (kind === 'religious') pieces.push({ role: 'title', text: pick(R.titles[g], rnd), fixed: true });
        if (kind === 'royal') pieces.push({ role: 'title', text: royalTitle(root, g, rnd), fixed: true });
        if (parts.includes('given') || !parts.length) pieces.push({ role: 'given', text: given.text, frags: given.frags });
        if (parts.includes('middle')) {
            let m = giv(rnd() < 0.5);
            if (kind === 'scholar') m = latinGiven(m, g);
            pieces.push({ role: 'middle', text: m.text, frags: m.frags });
        }
        if (kind === 'religious') {
            // Monks and saints go by "of a place" instead of a family name.
            const pl = cachePlace(root, null, rnd, true);
            const w = withParticle(R.of, pl.text);
            pieces.push({ role: 'origin', text: w.joined, frags: pl.frags });
        } else if (kind === 'royal') {
            const e = royalEpithet(root, rnd, g);
            pieces.push({ role: 'epithet', text: e.text, frags: e.frags });
        } else if (kind === 'warrior') {
            const e = warEpithet(root, rnd, g);
            pieces.push({ role: 'epithet', text: e.text, frags: e.frags });
        } else if (kind === 'scholar') {
            // A Latin surname always: it is what makes a scholar's name (Copernicus, Erasmus Roterodamus).
            const f = scholarFamily(root, g, rnd, fixed);
            pieces.push(f.fixed ? { role: 'family', text: f.text, fixed: true } : { role: 'family', text: f.text, frags: f.frags, branch: f.branch });
        } else if (parts.includes('family')) {
            if (kind === 'noble' && R.noble === 'ski') {
                // Slavic nobles take -ski from their estate (no "von" or "de").
                const { pl, text: ski } = skiPlace(() => cachePlace(root, null, rnd, true));
                pieces.push(fixed ? { role: 'family', text: fixed, fixed: true }
                    : { role: 'family', text: (g === 'f' ? slavicFem : (s => s))(ski), frags: [...pl.frags, { t: 'ski', en: 'of, from', ko: '~의·~ 출신' }] });
            } else if (kind === 'noble') {
                const pl = fixed ? { text: fixed } : cachePlace(root, null, rnd, true);
                const w = withParticle(R.noble, pl.text);
                if (w.particle) {
                    pieces.push({ role: 'particle', text: w.particle, fixed: true });
                    pieces.push(fixed ? { role: 'family', text: fixed, fixed: true } : { role: 'family', text: pl.text, frags: pl.frags });
                } else pieces.push(fixed ? { role: 'family', text: w.joined, fixed: true } : { role: 'family', text: w.joined, frags: pl.frags });
            } else if (fixed) pieces.push({ role: 'family', text: fixed, fixed: true });
            else { const f = cacheFamily(root, g, rnd); pieces.push({ role: 'family', text: f.text, frags: f.frags, branch: f.branch }); }
        }
        if (!pieces.some(p => p.role === 'given')) pieces.splice(pieces[0]?.role === 'title' ? 1 : 0, 0, { role: 'given', text: given.text, frags: given.frags });
        if (pieces.length === 1) return { name: pieces[0].text, frags: pieces[0].frags, root, ...mixed, cache: true };
        // The gender is kept so a swapped part still fits (no "la Belle" after "Roi").
        return { name: pieces.map(p => p.text).join(' '), pieces, root, ...mixed, cache: true, kind, gender: g };
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
        // Merge: names take turns through pairs of two different roots instead.
        const pairs = cacheMerge(form) ? rootPairs(roots, rnd) : null;
        const start = Math.floor(rnd() * roots.length);
        // v0.2.11: one list doesn't give the same byname twice (two "the Conqueror"s). Ordinals may repeat.
        const usedEpi = new Set();
        // v0.2.27: nor the same first part again and again (Chryso- four times) while unused ones are left.
        const usedHeads = new Set();
        // v0.2.28: a place named for a saint counts as one first part too ("saint"), or saints, never
        // "used", win every turn once the place heads run out (Sveti … 10 times in 20).
        const isSaintPlace = n => !!n.saint || (n.frags || []).some(f => f.en === 'saint' || f.en === 'church of');
        const headsOf = n => [...(n.frags || []), ...(n.pieces || []).flatMap(p => p.frags || [])].filter(f => HEAD_TEXTS.has(f.t)).map(f => f.t.toLowerCase())
            .concat(isSaintPlace(n) ? ['#saint'] : []);
        // v0.2.29: places spread out their endings the same way (-magus six times in 20).
        const usedTails = new Set();
        const tailsOf = n => (n.pieces ? [] : n.frags || []).filter(f => TAIL_TEXTS.has(f.t)).map(f => f.t.toLowerCase())
            .concat(isSaintPlace(n) ? ['#saint'] : []);
        const epithets = n => (n.pieces || []).filter(p => p.role === 'epithet' && !ORDINAL_TEXTS.has(p.text)).map(p => p.text.toLowerCase());
        for (let i = 0; i < count; i++) {
            const pair = pairs ? pairs[i % pairs.length] : null;
            const root = pair ? null : roots[(start + i) % roots.length];
            const pool = [];
            for (let k = 0; k < 60; k++) {
                // The family name and title side with either root.
                const n = pair ? cacheOne(form, pick(pair, rnd), pick(kinds, rnd), rnd, pair) : cacheOne(form, root, pick(kinds, rnd), rnd);
                const texts = memoryNames(n).map(t => t.toLowerCase());
                if (seen.has(n.name.toLowerCase()) || texts.some(t => banned.has(t))) continue;
                pool.push(n);
            }
            if (!pool.length) continue;
            let best = pool;
            const freshEpi = best.filter(n => !epithets(n).some(e => usedEpi.has(e)));
            if (freshEpi.length) best = freshEpi;
            const freshHeads = best.filter(n => !headsOf(n).some(h => usedHeads.has(h)));
            if (freshHeads.length) best = freshHeads;
            const freshTails = best.filter(n => !tailsOf(n).some(t => usedTails.has(t)));
            if (freshTails.length) best = freshTails;
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
            for (const e of epithets(n)) usedEpi.add(e);
            for (const h of headsOf(n)) usedHeads.add(h);
            for (const t of tailsOf(n)) usedTails.add(t);
            for (const t of memoryNames(n)) banned.add(t.toLowerCase());
            out.push(n);
        }
        return out;
    }
    // 🔄 on a whole Cache name: the same root, or the same two roots when merged.
    function rerollForm(src, form) {
        if (Array.isArray(src.mix) && src.mix.length === 2) return { ...form, roots: [...src.mix], rootMix: 'merge' };
        return { ...form, roots: [src.root || cacheRoots(form)[0]], rootMix: 'split' };
    }
    // Swap one part of a Cache name, the Cache way.
    function cachePiece(src, k, form, avoid = [], rnd = Math.random) {
        const p = src.pieces?.[k];
        if (!p || p.fixed) return null;
        const root = src.root || cacheRoots(form)[0];
        const R = CACHE[root];
        const g = src.gender === 'm' || src.gender === 'f' ? src.gender : genderOf(form, rnd);
        const kind = src.kind || '';
        const banned = new Set([p.text, ...avoid].map(a => String(a).toLowerCase()));
        for (let i = 0; i < 40; i++) {
            let next;
            if (p.role === 'given' || p.role === 'middle') {
                const pair = Array.isArray(src.mix) && src.mix.length === 2 ? (p.role === 'middle' && rnd() < 0.5 ? [src.mix[1], src.mix[0]] : src.mix) : null;
                next = pair ? cacheGiven(pair[0], g, rnd, pair[1]) : cacheGiven(root, g, rnd);
                if (kind === 'scholar') next = latinGiven(next, g);
            }
            else if (p.role === 'origin') { const pl = cachePlace(root, null, rnd, true); next = { text: withParticle(R.of, pl.text).joined, frags: pl.frags }; }
            else if (p.role === 'epithet') next = kind === 'royal' ? royalEpithet(root, rnd, g) : warEpithet(root, rnd, g);
            else if (p.role === 'family' && kind === 'scholar') next = scholarFamily(root, g, rnd);
            else if (p.role === 'family' && src.pieces.some(q => q.role === 'particle')) next = cachePlace(root, null, rnd, true);
            else if (p.role === 'family' && /[sc]k[iya]$/.test(p.text) && kind === 'noble') { const { pl, text: ski } = skiPlace(() => cachePlace(root, null, rnd, true)); next = { text: (g === 'f' ? slavicFem(ski) : ski), frags: [...pl.frags, { t: 'ski', en: 'of, from', ko: '~의·~ 출신' }] }; }
            else if (p.role === 'family') next = cacheFamily(root, g, rnd);
            else return null;
            if (banned.has(next.text.toLowerCase()) || banned.has(next.text.replace(/^(de|of|von|af|d')\s?/i, '').toLowerCase())) continue;
            const out = { ...p, text: next.text, frags: next.frags };
            // A swapped part still mustn't echo the other side of the name (only the new part is checked).
            const others = src.pieces.filter((q, j) => j !== k);
            if (NAME_SIDE.includes(out.role) && sharedStems(others.filter(q => HOME_SIDE.includes(q.role) && !q.fixed).flatMap(q => q.frags || []), out.frags || [])) continue;
            if (HOME_SIDE.includes(out.role) && sharedStems(others.filter(q => NAME_SIDE.includes(q.role)).flatMap(q => q.frags || []), out.frags || [])) continue;
            if (next.branch) out.branch = next.branch; else delete out.branch;
            return out;
        }
        return null;
    }
    // "fragments: Ethel noble + win friend / at by + wood wood · where they lived / … · Old English"
    function fragsHtml(r) {
        if (!r.cache) return '';
        const L = T();
        const lang = detectLang();
        const groups = r.pieces ? r.pieces.filter(p => p.frags?.length) : (r.frags ? [{ frags: r.frags }] : []);
        if (!groups.length) return '';
        const mix = Array.isArray(r.mix) && r.mix.length === 2 && r.mix.every(x => L.roots[x]) ? r.mix : null;
        // Merged names say which root each fragment came from: "Silv wood (Latin) + wick farm (Old English)".
        const one = f => {
            const mean = lang === 'ko' ? f.ko : f.en;
            const from = mix && L.roots[f.r] ? ` <span class="tbd-frag-root">(${escapeHtml(L.roots[f.r])})</span>` : '';
            return `<span class="tbd-frag"><b>${escapeHtml(f.t)}</b>${mean ? ` ${escapeHtml(mean)}` : ''}${from}</span>`;
        };
        // A part made from one root only (the family name of a merged name) says that root once.
        const side = p => (mix && r.root && L.roots[r.root] && !p.frags.some(f => f.r) ? ` <span class="tbd-frag-root">· ${escapeHtml(L.roots[r.root])}</span>` : '');
        const body = groups.map(p => p.frags.map(one).join(' + ')
            + (p.branch && L.branch?.[p.branch] ? ` <span class="tbd-frag-root">· ${escapeHtml(L.branch[p.branch])}</span>` : '') + side(p))
            .join('<span class="tbd-nick-dot" aria-hidden="true"> / </span>');
        const rootText = mix ? mix.map(x => L.roots[x]).join(' + ') : (r.root && L.roots[r.root]) || '';
        const root = rootText ? ` <span class="tbd-frag-root">· ${escapeHtml(rootText)}</span>` : '';
        // After an AI polish, show the name the fragments really made, so the change can be seen.
        const was = r.polished && r.orig && r.orig !== r.name ? ` <span class="tbd-frag-root">· ${escapeHtml(L.polishWas)}: ${escapeHtml(r.orig)}</span>` : '';
        return `<div class="tbd-frags"><span class="tbd-nicks-label">${escapeHtml(L.fragments)}:</span> ${body}${root}${was}</div>`;
    }
    // ✨ and swapping a variant still use the AI. It gets the roots in place of the hidden vibe,
    // and a full name goes as one whole name.
    function aiForm(form, src) {
        if (!isCache(form)) return form;
        const mix = Array.isArray(src?.mix) && src.mix.length === 2 ? src.mix : null;
        const roots = (mix || cacheRoots(form)).map(r => STRINGS.en.roots[r]).join(' and ');
        const full = form.target === 'person' && /\s/.test(String(src?.name || ''));
        return {
            ...form, method: 'ai', vibe: 'custom', customVibe: mix ? `blending ${roots} name roots in one name` : `built from ${roots} name roots`, realNames: 'invented', likeText: '', aiRoots: [], extras: [], parts: ['given'], wordMode: 'avoid',
            ...(full ? { target: 'other', kind: 'any', kindText: 'a full name for a person; keep the same number of words and any title or "of …" part' } : {}),
        };
    }

    // ---------- Cache + AI (polish) ----------
    // The cache builds the name; the AI only smooths the sound. Meanings stay the cache's own,
    // so the note is about feel only. Titles, particles, bynames and kept family names are not touched.
    const POLISH_ROLES = ['given', 'middle', 'family'];
    function polishRoles(n) {
        if (!n.pieces) return [];
        const only = Array.isArray(n.polishOnly) ? n.polishOnly : POLISH_ROLES;
        return n.pieces.filter(p => only.includes(p.role) && POLISH_ROLES.includes(p.role) && !p.fixed).map(p => p.role);
    }
    function buildPolishMessages(list, form, opts = {}) {
        const lang = opts.lang || 'en';
        const place = form.target === 'place';
        const roots = [...new Set(list.flatMap(n => (Array.isArray(n.mix) ? n.mix : [n.root])).filter(Boolean))].map(r => STRINGS.en.roots[r]).join(' and ');
        const full = list.some(n => n.pieces);
        const lines = [];
        lines.push(`These ${place ? 'place names' : 'names for people'} were built by joining real ${roots || 'old'} name elements. Some joins may sound stiff.`);
        lines.push("Polish each one lightly so it flows when said aloud: change only a letter or two, or the sound where two parts meet. Keep the elements recognizable and keep that root's spelling customs. If one already sounds natural, return it unchanged. Go by ear.");
        if (full) {
            lines.push('For a full name, change only the parts listed after it; every other word stays exactly as it is.');
            lines.push('Keep endings that mark a naming custom (such as -son, -ski, -ius, -ensis).');
        }
        const must = String(form.mustContain || '').trim();
        if (must) lines.push(`Keep the letters "${must}" in each name.`);
        lines.push('');
        list.forEach((n, i) => {
            const roles = polishRoles(n);
            if (n.pieces && roles.length) lines.push(`${i + 1}. "${n.name}" — change only: ${n.pieces.filter(p => roles.includes(p.role)).map(p => `${p.role} "${p.text}"`).join(', ')}`);
            else lines.push(`${i + 1}. "${n.name}"`);
        });
        lines.push('');
        lines.push(`For each add a short note (under 12 words) in ${noteLang(lang)} about its feel. ${ROOT_NOTE_RULE}`);
        if (opts.reading) lines.push(`Also add ${readingRule(lang, full)}.`);
        lines.push('Reply with ONLY a JSON array, one item per name in the same order, nothing else. Use "name" for a single name; for a full name use "parts" with only the listed parts:');
        const tail = `${opts.reading ? ', "read": "..."' : ''}, "note": "..."`;
        const first = list[0] && list[0].pieces && polishRoles(list[0]).length
            ? `{"n": 1, "parts": {${polishRoles(list[0]).map(r => `"${r}": "..."`).join(', ')}}${tail}}`
            : `{"n": 1, "name": "..."${tail}}`;
        lines.push(`[${first}]`);
        return [
            { role: 'system', content: 'You are a naming assistant for fiction writers who understands phonetics and old naming customs.' },
            { role: 'user', content: lines.join('\n') },
        ];
    }
    // The answer items, in order (by "n" when the AI gives it).
    function polishAnswers(raw, count) {
        const text = stripThinking(raw).replace(/```(?:json)?/gi, '');
        const start = text.indexOf('[');
        const end = text.lastIndexOf(']');
        let arr = null;
        if (start !== -1 && end > start) { try { arr = JSON.parse(text.slice(start, end + 1)); } catch { /* salvage below */ } }
        if (!Array.isArray(arr) && start !== -1) arr = salvageObjects(text);
        if (!Array.isArray(arr)) return [];
        const out = new Array(count).fill(null);
        arr.forEach((it, k) => {
            if (!it || typeof it !== 'object') return;
            const n = Number(it.n);
            const at = Number.isInteger(n) && n >= 1 && n <= count ? n - 1 : k;
            if (at < count && !out[at]) out[at] = it;
        });
        return out;
    }
    // A polished word must still be a plain name and close to the cache's own (light polish only).
    function polishOk(was, now) {
        if (!now || !looksLikeName(now) || now.length > 40) return false;
        // Same number of words ("Gornji Volkets" stays two words, a given name stays one).
        if (now.trim().split(/\s+/).length !== was.trim().split(/\s+/).length) return false;
        if (!sayable(now)) return false;
        const a = was.toLowerCase(), b = now.toLowerCase();
        // The first and last letters stay: the end carries the language and gender (Richier must not become Richie).
        return a[0] === b[0] && a.slice(-1) === b.slice(-1) && Math.abs(a.length - b.length) <= 3;
    }
    // One skeleton + one answer → the polished name, or null to keep the skeleton as it is.
    function applyPolish(n, ans, form, banned = new Set(), lang = 'en') {
        if (!ans) return null;
        const must = String(form.mustContain || '').trim().toLowerCase();
        const read = String(ans.read ?? ans.reading ?? '').trim().slice(0, 80);
        const note = String(ans.note ?? '').trim().slice(0, 120);
        let out;
        if (n.pieces) {
            const roles = polishRoles(n);
            const parts = ans.parts && typeof ans.parts === 'object' ? ans.parts : {};
            const pieces = n.pieces.map(p => {
                if (!roles.includes(p.role)) return p;
                const t = cleanPiece(parts[p.role]);
                if (!polishOk(p.text, t)) return p;
                if (t === p.text) return p;
                if (banned.has(t.toLowerCase())) return p;
                return { ...p, text: t, orig: p.text };
            });
            out = { ...n, pieces, name: pieces.map(p => p.text).join(' ') };
        } else {
            const t = cleanPiece(ans.name);
            const ok = polishOk(n.name, t) && !banned.has(t.toLowerCase());
            out = { ...n, name: ok ? t : n.name };
        }
        if (must && !out.name.toLowerCase().includes(must) && n.name.toLowerCase().includes(must)) out = { ...n };
        out.polished = true;
        out.orig = n.pieces ? n.pieces.map(p => p.orig || p.text).join(' ') : n.name;
        delete out.polishOnly;
        if (read) out.read = read; else delete out.read;
        if (note) out.note = note; else delete out.note;
        return out;
    }
    // Ask once for all of them. Never loses names: anything the AI didn't give back stays a plain Cache name.
    async function polishNames(list, form, st, signal) {
        const lang = detectLang();
        const messages = buildPolishMessages(list, form, { lang, reading: !!st.showReading });
        const raw = await requestLLM(messages, { profileId: st.profileId, sendPreset: !!st.sendPreset, reasoning: st.reasoning, maxTokens: tokensFor(list.length, st, list.some(n => n.pieces)), signal });
        const answers = polishAnswers(raw, list.length);
        const banned = new Set(avoidList(st, form).map(a => String(a).toLowerCase()));
        let done = 0;
        const names = list.map((n, i) => {
            const p = applyPolish(n, answers[i], form, banned, lang);
            if (p) { done++; return p; }
            return n;
        });
        return { names, done, raw };
    }

    // ---------- Found ⭐ (kept names) ----------
    // Saved in SillyTavern's settings. Each entry keeps what was shown for the name, without live state.
    const FOUND_MAX = 500;
    const FOUND_TARGETS = ['person', 'place', 'shop', 'item', 'other'];
    function foundKey(r) {
        return `${FOUND_TARGETS.includes(r.target) ? r.target : (r.form?.target || 'other')}|${String(r.name || '').toLowerCase()}`;
    }
    const str = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');
    function cleanFrags(list) {
        if (!Array.isArray(list)) return undefined;
        const out = list.filter(f => f && typeof f.t === 'string').slice(0, 12).map(f => ({ t: str(f.t, 30), en: str(f.en, 60), ko: str(f.ko, 60), ...(CACHE_ROOTS.includes(f.r) ? { r: f.r } : {}) }));
        return out.length ? out : undefined;
    }
    // Only known fields, of the right kind and size (also what makes an imported file safe to keep).
    function foundEntry(r, at = Date.now()) {
        if (typeof r.name !== 'string') return null;
        const name = cleanPiece(r.name).slice(0, 120);
        if (!name || !looksLikeName(name)) return null;
        const target = FOUND_TARGETS.includes(r.target) ? r.target : FOUND_TARGETS.includes(r.form?.target) ? r.form.target : 'other';
        const e = { name, target, at: Number.isFinite(Number(r.at)) ? Number(r.at) : at };
        const read = str(r.read, 80); if (read) e.read = read;
        const note = str(r.note, 200); if (note) e.note = note;
        if (Array.isArray(r.nicks)) { const n = cleanNicks(r.nicks, name); if (n.length) e.nicks = n; }
        if (r.real) e.real = true;
        const word = wordFrom(r.word); if (word) e.word = word;
        if (r.cache) e.cache = true;
        if (r.polished) e.polished = true;
        const orig = str(r.orig, 120); if (orig && orig !== name) e.orig = orig;
        if (CACHE_ROOTS.includes(r.root)) e.root = r.root;
        if (Array.isArray(r.mix) && r.mix.length === 2 && r.mix[0] !== r.mix[1] && r.mix.every(x => CACHE_ROOTS.includes(x))) e.mix = [r.mix[0], r.mix[1]];
        const frags = cleanFrags(r.frags); if (frags) e.frags = frags;
        if (typeof r.tag === 'string' && REFINE_DESC[r.tag]) e.tag = r.tag;
        const from = str(typeof r.from === 'object' && r.from ? r.from.name : r.from, 120); if (from) e.from = from;
        if (Array.isArray(r.pieces)) {
            const pieces = r.pieces.filter(p => p && typeof p.role === 'string' && typeof p.text === 'string').slice(0, 12).map(p => {
                const q = { role: str(p.role, 20), text: str(p.text, 60) };
                if (p.fixed) q.fixed = true;
                if (p.real) q.real = true;
                const f = cleanFrags(p.frags); if (f) q.frags = f;
                if (typeof p.branch === 'string') q.branch = str(p.branch, 20);
                return q;
            });
            if (pieces.length) e.pieces = pieces;
        }
        if (r.form && typeof r.form === 'object') {
            // The choices it was made with: small, plain values only.
            const f = {};
            for (const [k, v] of Object.entries(r.form)) {
                if (typeof v === 'string') f[k] = v.slice(0, 120);
                else if (Array.isArray(v)) f[k] = v.filter(x => typeof x === 'string').slice(0, 12).map(x => x.slice(0, 30));
            }
            e.form = f;
        }
        return e;
    }
    function isFound(r, st = settings()) {
        const key = foundKey({ ...r, target: r.form?.target || r.target });
        return st.found.some(e => foundKey(e) === key);
    }
    // ⭐ on a result: in or out. Returns 'in', 'out' or 'full'.
    function toggleFound(r, st = settings()) {
        const key = foundKey({ ...r, target: r.form?.target || r.target });
        const at = st.found.findIndex(e => foundKey(e) === key);
        if (at !== -1) { st.found.splice(at, 1); save(); return 'out'; }
        if (st.found.length >= FOUND_MAX) return 'full';
        const e = foundEntry(r);
        if (!e) return 'out';
        st.found.push(e);
        save();
        return 'in';
    }
    function foundExportText(st = settings()) {
        return JSON.stringify({ app: 'TBD-Name-Not-Found', type: 'found', version: 1, items: st.found }, null, 2);
    }
    // Adds what isn't there yet. Returns how many were added, or -1 when the file isn't a Found file.
    function foundImport(text, st = settings()) {
        let data;
        try { data = JSON.parse(String(text)); } catch { return -1; }
        const items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : null;
        if (!items) return -1;
        const have = new Set(st.found.map(foundKey));
        let added = 0;
        for (const it of items) {
            if (st.found.length >= FOUND_MAX) break;
            const e = it && typeof it === 'object' ? foundEntry(it) : null;
            if (!e || have.has(foundKey(e))) continue;
            st.found.push(e);
            have.add(foundKey(e));
            added++;
        }
        if (added) save();
        return added;
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
        found: [],
        banList: '',
        showReading: true,
        nicknames: false,
        autoCheck: false,
        extrasOpen: false,
        moreOpen: false,
        wordNames: 'mark',
        form: { target: 'person', vibe: 'fantasy', customVibe: '', gender: 'any', kind: 'any', kindText: '', length: 'any', sound: 'any', mustContain: '', likeText: '', likeMode: 'sound', realNames: 'invented', parts: ['given'], extras: [], fixedFamily: '', method: 'ai', roots: ['oldenglish'], ckinds: ['common'], aiRoots: [], rootMix: 'split', aiRootMix: 'split', wordMode: 'avoid' },
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
        if (!WORD_MODES.includes(st.form.wordMode)) st.form.wordMode = 'avoid';
        if (!METHODS.includes(st.form.method)) st.form.method = 'ai';
        st.form.roots = pickedRoots(st.form);
        st.form.ckinds = pickedKinds(st.form);
        st.form.aiRoots = (Array.isArray(st.form.aiRoots) ? st.form.aiRoots : []).filter(x => CACHE_ROOTS.includes(x));
        if (!ROOT_MIXES.includes(st.form.rootMix)) st.form.rootMix = 'split';
        if (!ROOT_MIXES.includes(st.form.aiRootMix)) st.form.aiRootMix = 'split';
        st.count = clampInt(st.count, 1, 30, 5);
        if (!Array.isArray(st.found)) st.found = [];
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
        // Word names "mostly": Luna or Aurora can be the word itself, so they are only marked then.
        const cliches = form && (realMode(form) === 'only' || wordUsed(form) === 'main') ? [] : CLICHES;
        // Names kept in Found never come back as new ones.
        const kept = Array.isArray(st.found) ? st.found.flatMap(memoryNames) : [];
        return [...new Set([...cliches, ...own, ...past, ...kept])];
    }
    // v0.2.21: the prompt only gets the AI favorites and the user's own list. Matching each new name against
    // 120+ past and kept names (and "close variants" of them) was the heaviest part of the AI's thinking,
    // and the extension filters those names out after the answer anyway (avoidList above).
    function promptAvoid(st = settings(), form = null, extra = []) {
        const cliches = form && (realMode(form) === 'only' || wordUsed(form) === 'main') ? [] : CLICHES;
        return [...new Set([...cliches, ...splitList(st.banList), ...extra])];
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
            // Picked roots bring their own place endings (-heim, -ville), so the old English-style list would fight them.
            else if (form.vibe !== 'custom' && form.vibe !== 'weird' && !aiRootsUsed(form).length) out.push('Old-world places often use landscape endings (-holm, -mere, -wick, -ford, -by, -moor…). Mix them; don\'t put the same ending on every name.');
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
        } else if (aiRootsUsed(form).length) {
            // v0.2.21: the roots line already says every real word comes from those roots' own languages,
            // and English words get the "word" mark after the answer. One rule fewer to check per name.
        } else if (wordUsed(form) === 'main' && !nameShape(form)) {
            // Word names: every name is a real word, so the plain-word rule would only argue with them.
        } else if (nameShape(form)) {
            out.push(`The given and middle names must not be plain existing English words (like "Mold" or "Salt"). Family names, epithets and titles may use real words (trades, places, deeds).${wordExcept(form)}`);
        } else if (form.target === 'person' || form.target === 'other') {
            out.push(`Never use a plain existing English word on its own as the name (like "Mold" or "Salt").${wordExcept(form)}`);
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
                // v0.2.21: "no two may share the same ending" made the AI tick every ending off by hand and start over
                // (an -ir and an -ar clash in round 23). Each name has its own ending seed, so a softer line is enough.
                out.push(shape.fixed
                    ? 'Across the batch, spread the given-name endings out; don\'t let many share one ending.'
                    : 'Across the batch, spread the given-name endings out; don\'t let many share one ending. No two family names may be the same.');
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
        // v0.2.21 dropped this with roots on (the roots line says much the same), and 8 of 13 names in round 23
        // came back as plain real names (Borys, Danilo). Saying it twice is what works, so it stays.
        if (mode === 'invented') out.push(`Invent the ${what}; don't hand back names that real people commonly have.${wordExcept(form)}`);
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
    // One short exception on the lines that say "invent" or "no plain words", so they don't fight word names.
    function wordExcept(form) {
        if (wordUsed(form) === 'avoid') return '';
        return nameShape(form) ? ' (A given name whose seed says "real word" is the exception.)' : ' (Names whose seed says "real word" are the exception.)';
    }
    function wordRule(form, lang) {
        const what = nameShape(form) ? 'given name' : 'name';
        return [
            `A ${what} whose seed says "real word" is made from a pretty real word with a nice meaning or sound, kept as it is or lightly changed so it reads as a name. A word people already use as a name is fine too.${nameShape(form) ? ' The other parts follow their own seeds and rules.' : ''}`,
            `For those names also add "word": {"meaning": "...", "lang": "..."}: what the ${what} word means and which language it comes from, both in ${noteLang(lang)}. Leave "word" out for the other names.`,
        ];
    }
    const NICK_RULE = 'Also add "nicks": 2 or 3 short nicknames for the given name, made the way English speakers shorten names (a clipped front or end, or -y/-ie added).';
    // The JSON to answer in, with the extra fields that are switched on.
    function answerJson(shape, { reading, real, nicks, word } = {}) {
        const bits = [];
        if (shape) bits.push(`"parts": {${shape.roles.map(r => `"${r}": "..."`).join(', ')}}`);
        else bits.push('"name": "..."');
        if (reading) bits.push('"read": "..."');
        bits.push('"note": "..."');
        if (real) bits.push(shape ? '"real": ["..."]' : '"real": false');
        if (nicks) bits.push('"nicks": ["...", "..."]');
        if (word) bits.push('"word": {"meaning": "...", "lang": "..."}');
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

    // Picked roots: one short line. The AI knows these roots, but may make up meanings, so the note stays on feel.
    function rootRule(form, roots) {
        const shape = nameShape(form);
        const what = form.target === 'place' ? 'place-name' : 'name';
        const each = roots.length > 1 ? '; each name below says which' : '';
        const hasFamily = shape && shape.roles.includes('family') && !shape.fixed;
        // v0.2.11: "naming customs" read as "give the culture's usual names" (15 of 20 were real Irish names).
        const invented = realMode(form) === 'invented';
        // Any real word in the name stays in the roots' own languages (no English "Weaverby" for Latin + Norse);
        // this sits fine with the line that lets family names use real words.
        // v0.2.12: Latin drifted into Italian and French (Ursari, Corvelli, Granet).
        // v0.2.18: Latin trade and looks family names came back as -a (Coriara, Lanaria, Hispida on a man's name).
        const latinFamily = hasFamily ? ' A Latin family name from a trade or from looks keeps its -us, -ius or -arius form (not -a), unless it belongs to a woman.' : '';
        const latinNote = roots.includes('latin') ? ` Latin means classical Latin forms (endings like -us, -ius, -a, -ia), not Italian or French ones.${latinFamily}` : '';
        // v0.2.20: Celtic family names came back as English and Scots words (Nailor, Souter, Cochmarsh),
        // and Slavic women got the men's form (Kalina Kudrev).
        const celticNote = !roots.includes('celtic') ? ''
            : aiMerge(form) ? ' Celtic means Welsh, Irish or Scottish Gaelic (each name below says which); its Celtic parts stay in that one language, with no English or Scots words.'
            : ` Celtic means Welsh, Irish or Scottish Gaelic (each name below says which); keep the whole name${hasFamily ? ', family name too,' : ''} in that one language, with no English or Scots words.`;
        const slavicNote = roots.includes('slavic') && hasFamily ? ' A Slavic family name takes its feminine form (-ova, -eva, -ina, -ska) when the name belongs to a woman.' : '';
        const fresh = latinNote + celticNote + slavicNote + (invented ? ` Put new ${what}s together from those parts, not ${what}s that already exist.${wordExcept(form)} Any real word in a ${what} comes from those roots' own languages, not from another language.` : '');
        if (aiMerge(form)) {
            const fam = hasFamily ? ' A family name follows the surname customs of one of its two roots.' : '';
            return `Name roots: blend two roots in each name, with word parts from both in the same ${what}: each name below says which of ${rootNames(roots, 'and')} gives its start and which gives its ending. Keep it easy to say.${fam}${fresh}`;
        }
        const family = hasFamily ? ' Family names follow that root\'s own surname customs too.' : '';
        const parts = invented ? 'word roots and endings' : 'word roots, endings and naming customs';
        return `Name roots: build each name from ${rootNames(roots)} ${what} elements (${parts})${each}.${family}${fresh}`;
    }
    const ROOT_NOTE_RULE = "Don't state what the name means or where it comes from; describe only its feel.";

    // One name's seed as the AI sees it. v0.2.17: also kept on the result for "Copy for review",
    // so a check can count what each name was asked for instead of guessing.
    function seedLine(form, s) {
        const sound = SOUND_DESC[form.sound];
        const phrase = form.target === 'shop' || form.target === 'item';
        const shape = nameShape(form);
        const main = shape ? (shape.roles.includes('given') ? 'given name: ' : 'main invented part: ') : '';
        const parts = [];
        // A word name says which language the word comes from: a bare "real word" seed would pull English (like v0.2.16).
        // v0.2.20: Celtic names say their one language (Welsh / Irish / Scottish Gaelic), and a Germanic
        // word says German: "a pretty Germanic word" came back English (Clove) and Norwegian (Tusse).
        const rn = (r, word) => r === 'celtic' && s.celtic ? s.celtic : word && r === 'germanic' ? 'German' : STRINGS.en.roots[r];
        if (s.word) {
            const from = s.root && s.root2 ? `${rn(s.root, true)} or ${rn(s.root2, true)}` : s.root ? rn(s.root, true) : '';
            parts.push(from ? `real word: a pretty ${from} word, as it is or lightly changed`
                : 'real word: a pretty word from any language that fits the setting (English is fine), as it is or lightly changed');
        } else if (s.root && s.root2) {
            // v0.2.24: "Latin + Norse roots" almost always came back as a Norse start + a Latin ending
            // (9 of 18 given names ended in -us). Saying which root gives which part, in turn, splits the endings.
            parts.push(`${rn(s.root)} start + ${rn(s.root2)} ending`);
        }
        else if (s.root) parts.push(`${rn(s.root)} roots`);
        if (s.shape) parts.push(`shape: ${s.shape}`);
        if (s.start) parts.push(`${phrase ? 'main word starts' : 'starts'} with "${s.start}"`);
        if (s.syllables) parts.push(`${phrase ? 'main word ' : ''}${s.syllables} syllable${s.syllables === 1 ? '' : 's'}`);
        if (s.ending) parts.push(`ends with "${s.ending}"`);
        if (s.noV) parts.push('no "v" or "w" sound');
        if (!sound && s.texture) parts.push(`${s.texture} sound`);
        if (s.likeFocus) parts.push(`echo the "like" word${likeWords(form).length > 1 ? 's' : ''} mostly in ${s.likeFocus}`);
        if (!parts.length) parts.push('follow the "like" words above');
        if (s.spark) parts.push(`inspiration: "${s.spark}"`);
        return `${main}${parts.join(', ')}${s.family ? `; family name: ${s.familyRoot ? `${rn(s.familyRoot)} words, ` : ''}${s.family}` : ''}`;
    }
    // Answers come back in seed order, so the n-th answer gets the n-th seed (before any filtering).
    function withSeeds(list, form, seeds) {
        list.forEach((n, i) => { if (n && seeds[i]) n.seed = seedLine(form, seeds[i]); });
        return list;
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
        const roots = aiRootsUsed(form);
        if (roots.length) lines.push(rootRule(form, roots));
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
            : roots.length
                ? 'What is being named comes first, then its name roots: they decide the sounds and word parts even where the setting would suggest others. The setting only adjusts spelling and flavor. Each name also has a seed that only adds variety:'
                : 'The setting and what is being named come first. Each name also has a seed that only adds variety:');
        // Sound-alike seeds carry only a part to echo; skipping rules that don't apply means less overthinking.
        const echoOnly = seeds.length > 0 && seeds.every(s => s.likeFocus && !s.spark);
        // Real names get no inspiration word, so those rules would only be noise there.
        // (Other cases keep them as before: the bread fix in v0.1.9 was checked with them in.)
        const noSparkRules = (realMode(form) !== 'invented' || roots.length > 0) && !seeds.some(s => s.spark);
        if (!echoOnly && !noSparkRules) {
            lines.push('follow its sound hints. An inspiration word is only a loose mood: bend it to fit what is being named and the setting, and ignore it if it doesn\'t fit.');
            lines.push('Never put the inspiration object itself into the name or the note when it isn\'t part of what is being named (no "bus stop" in the name of a bread).');
        } else if (!echoOnly) {
            lines.push('follow its hints.');
        } else {
            lines.push('follow its hint.');
        }
        // v0.2.21: a seed the roots can't meet (a Slavic word starting with E) sent the AI round in circles until
        // the answer ran out. v0.2.22: "use the nearest one and move on; don't search long" read as "anything goes"
        // (plain real names, no blending), so the way out is only for the start letter now.
        if (seeds.some(s => s.start && s.root)) lines.push('If a start letter doesn\'t suit the name\'s roots, a nearby letter is fine.');
        seeds.forEach((s, i) => lines.push(`${i + 1}. ${seedLine(form, s)}`));
        // v0.2.21: this line is for inspiration words, which roots turn off; with roots the AI still redid names over "same image".
        if (seeds.length > 1 && !echoOnly && !roots.length) lines.push('Across the batch, don\'t build two names or notes on the same idea or image (not three "neon" names).');
        // v0.2.14: Latin + Norse put a v sound in 17 of 20 given names (-val, -var, -lv-) and -mund in three.
        // v0.2.20: the "v" example also scared Slavic names off -slav and Vlad- (no v in 20 of 20), so it goes there.
        if (seeds.length > 1 && !echoOnly) lines.push(`Across the batch, vary the sounds too: don't let one sound or word part run through most of the names${aiRootsUsed(form).includes('slavic') ? '' : ' (not a "v" in nearly every name)'}.`);
        if (avoid.length) {
            lines.push('');
            lines.push(`Do NOT use these names: ${avoid.join(', ')}.`);
        }
        lines.push('');
        lines.push(`For each name add a short note (under 12 words) in ${noteLang(lang)} about how it fits this setting. ${roots.length ? ROOT_NOTE_RULE : "Don't claim a real meaning unless you are sure."}`);
        if (opts.reading) lines.push(`Also add ${readingRule(lang, !!shape)}.`);
        if (opts.nicks) lines.push(NICK_RULE);
        const words = seeds.some(s => s.word);
        if (words) lines.push(...wordRule(form, lang));
        lines.push('Reply with ONLY a JSON array, nothing else:');
        lines.push(answerJson(shape, { reading: opts.reading, real: mode !== 'invented' && realRoles(form).length > 0, nicks: opts.nicks, word: words }));
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
        const roots = aiRootsUsed(form);
        if (roots.length) lines.push(rootsPhrase(form, roots, 'keep'));
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
        lines.push(`For each variant add a short note (under 10 words) in ${noteLang(lang)} about what changed in the sound.`);
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
        const roots = aiRootsUsed({ ...form, target: 'person' });
        if (roots.length && REAL_ROLES.includes(role)) lines.push(rootsPhrase({ ...form, target: 'person' }, roots, 'build'));
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

    // "word": {"meaning", "lang"} for a name made from a real word (a plain string is taken as the meaning).
    // Short plain text only: JSON bits or brackets mean the answer got mixed up.
    function wordFrom(v) {
        const clean = x => (typeof x === 'string' ? x.replace(/\s+/g, ' ').trim().slice(0, 40) : '');
        const ok = x => x && !/[{}\[\]"]/.test(x);
        const w = typeof v === 'string' ? { meaning: clean(v), lang: '' } : v && typeof v === 'object' && !Array.isArray(v) ? { meaning: clean(v.meaning), lang: clean(v.lang ?? v.language) } : null;
        if (!w) return null;
        const out = {};
        if (ok(w.meaning)) out.meaning = w.meaning;
        if (ok(w.lang)) out.lang = w.lang;
        return out.meaning || out.lang ? out : null;
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
                        ...(wordFrom(it.word) ? { word: wordFrom(it.word) } : {}),
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
                // v0.2.12: full names come back as parts with no "name" yet, so compare with the parts too.
                const whole = name || (n.parts && typeof n.parts === 'object' ? Object.values(n.parts).filter(v => typeof v === 'string').join(' ') : '');
                const nicks = n.nicks ? cleanNicks(n.nicks, whole) : [];
                return {
                    name, note: n.note.trim(), read: read.slice(0, 80), ...(n.parts ? { parts: n.parts } : {}),
                    ...(n.real ? { real: true } : {}), ...(n.realParts ? { realParts: n.realParts } : {}), ...(nicks.length ? { nicks } : {}),
                    ...(n.word ? { word: n.word } : {}),
                };
            })
            .filter(n => n.parts || (n.name && n.name.length <= 40 && looksLikeName(n.name)));
    }

    // v0.2.24: family names are shared by many people, and trade and -son names repeat a lot. A family
    // name that was only seen before (past names, Found) no longer throws out the whole name: 2 of 20
    // went missing that way. When `familyAvoid` is given, family parts are checked only against it
    // (the user's own avoid list); the given name and the whole name still go against everything.
    const SHARED_ROLES = ['family', 'patronymic'];
    function filterNames(list, avoid, familyAvoid = null) {
        const banned = new Set(avoid.map(a => a.toLowerCase()));
        const famBanned = familyAvoid ? new Set(familyAvoid.map(a => a.toLowerCase())) : banned;
        const seen = new Set();
        return list.filter(n => {
            const key = n.name.toLowerCase();
            if (banned.has(key) || seen.has(key)) return false;
            if (n.pieces && n.pieces.some(p => NAME_ROLES.includes(p.role) && !p.fixed
                && (SHARED_ROLES.includes(p.role) ? famBanned : banned).has(String(p.text).toLowerCase()))) return false;
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
    let view = 'form';    // 'form', 'found' (kept names) or 'settings' (the ⚙ page inside the window)
    let foundFilter = 'all';

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
            ${form.target === 'person' ? wordModeHtml(form) : ''}
            ${canCache ? aiRootsHtml(form) : ''}
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
        const m = isPolish(form) ? 'polish' : isCache(form) ? 'cache' : 'ai';
        return `<div class="tbd-wide tbd-chipset"><div class="tbd-chips-label">${escapeHtml(L.method)}</div>
            <div class="tbd-chips">${METHODS.map(v => chipHtml('method', v, L.methods[v], m === v)).join('')}</div></div>`;
    }
    // Roots (and, for people, kinds of name). Several can be on; the last one stays on.
    function cacheChipsHtml(form) {
        const L = T();
        const roots = pickedRoots(form);
        const kinds = pickedKinds(form);
        const need = (id, key, on) => `<div class="tbd-note" id="${id}"${on ? '' : ' hidden'}>${escapeHtml(L.needPick[key])}</div>`;
        return `<div class="tbd-wide tbd-chipset"><div class="tbd-chips-label">${escapeHtml(L.rootsLabel)}</div>
            <div class="tbd-chips">${CACHE_ROOTS.map(v => chipHtml('root', v, L.roots[v], roots.includes(v))).join('')}</div>
            ${need('tbd_root_need', 'roots', !roots.length)}
            ${rootMixHtml('rootmix', 'tbd_rootmix', form.rootMix, roots.length > 1)}
            ${form.target === 'person' ? `<div class="tbd-chips-label">${escapeHtml(L.ckLabel)}</div>
            <div class="tbd-chips">${CACHE_KINDS.map(v => chipHtml('ckind', v, L.ck[v], kinds.includes(v))).join('')}</div>
            ${need('tbd_ckind_need', 'kinds', !kinds.length)}` : ''}</div>`;
    }

    // Roots for the AI: "Any" (default) or one or more roots. Tells when another choice wins.
    function aiRootsHtml(form) {
        const L = T();
        const roots = aiRoots(form);
        return `<div class="tbd-wide tbd-chipset tbd-ai-only" id="tbd_airoots"><div class="tbd-chips-label">${escapeHtml(L.rootsLabel)}</div>
            <div class="tbd-chips">${chipHtml('airoot', 'any', L.aiRootAny, !roots.length)}${CACHE_ROOTS.map(v => chipHtml('airoot', v, L.roots[v], roots.includes(v))).join('')}</div>
            ${rootMixHtml('airootmix', 'tbd_airootmix', form.aiRootMix, roots.length > 1)}
            ${aiRootNoteHtml(form)}</div>`;
    }
    // Split / Merge, right under the roots; only shown with two or more roots.
    function rootMixHtml(group, id, value, show) {
        const L = T();
        const v = value === 'merge' ? 'merge' : 'split';
        return `<div class="tbd-chips tbd-mix" id="${id}"${show ? '' : ' hidden'}>${ROOT_MIXES.map(m =>
            `<button type="button" class="tbd-chip" data-chip="${group}" data-v="${m}" aria-pressed="${v === m ? 'true' : 'false'}" title="${escapeHtml(L.rootMixTip[m])}">${escapeHtml(L.rootMix[m])}</button>`).join('')}</div>`;
    }
    function wordModeHtml(form) {
        const L = T();
        const m = wordMode(form);
        return `<div class="tbd-wide tbd-chipset tbd-ai-only" id="tbd_wordmode"><div class="tbd-chips-label">${escapeHtml(L.wordMode)}</div>
            <div class="tbd-chips">${WORD_MODES.map(v => `<button type="button" class="tbd-chip" data-chip="wordmode" data-v="${v}" aria-pressed="${m === v ? 'true' : 'false'}" title="${escapeHtml(L.wordModeTip[v])}">${escapeHtml(L.wordModes[v])}</button>`).join('')}</div>
            ${wordNoteHtml(form)}</div>`;
    }
    function wordNoteHtml(form) {
        const off = wordOff(form);
        return `<div class="tbd-note" id="tbd_word_note"${off ? '' : ' hidden'}>${off ? escapeHtml(T().wordOff[off]) : ''}</div>`;
    }
    function aiRootNoteHtml(form) {
        const off = aiRootsOff(form);
        return `<div class="tbd-note" id="tbd_airoot_note"${off ? '' : ' hidden'}>${off ? escapeHtml(T().aiRootOff[off]) : ''}</div>`;
    }
    // After a change that can switch the roots off or on: the fold line and the note.
    function refreshAiRoots(form) {
        $('#tbd_more_fold').replaceWith(moreFoldHtml(form));
        $('#tbd_airoot_note').replaceWith(aiRootNoteHtml(form));
        $('#tbd_word_note').replaceWith(wordNoteHtml(form));
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
        const wm = wordMode(form);
        const wordBit = wm !== 'avoid' ? `${L.wordMode}: ${L.wordModes[wm]}` : '';
        if (wordBit && !wordOff(form)) on.push(wordBit);
        const roots = aiRoots(form);
        const merged = roots.length > 1 && form.aiRootMix === 'merge';
        const rootsBit = roots.length ? `${L.rootsLabel}: ${roots.map(r => L.roots[r]).join(merged ? ' + ' : ', ')}${merged ? ` (${L.rootMix.merge})` : ''}` : '';
        // Roots another choice overrides show dimmed, so it's clear they're set but not used now.
        const offBit = rootsBit && aiRootsOff(form) ? `<span class="tbd-fold-off" title="${escapeHtml(L.aiRootOff[aiRootsOff(form)])}">${escapeHtml(rootsBit)}</span>` : '';
        if (rootsBit && !offBit) on.push(rootsBit);
        const wordOffBit = wordBit && wordOff(form) ? `<span class="tbd-fold-off" title="${escapeHtml(L.wordOff[wordOff(form)])}">${escapeHtml(wordBit)}</span>` : '';
        const text = [escapeHtml(on.join(' · ')), wordOffBit, offBit].filter(Boolean).join(' · ');
        const sum = !open && text ? `<span class="tbd-fold-sum">: ${text}</span>` : '';
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

    // The little marks after a name: variant, CACHE / AI polished, real, plain word, AI favorite, Lovecraft.
    function polishChanged(r) { return !!(r.polished && r.orig && r.orig !== r.name); }
    function tagsHtml(r, L = T()) {
        const tag = r.tag && L.r[r.tag] ? `<span class="tbd-tag">${escapeHtml(L.r[r.tag])}</span>` : '';
        const words = wordHits(r, r.form);
        const one = (on, tip, text) => (on ? `<span class="tbd-tag tbd-word-tag" title="${escapeHtml(tip)}">${escapeHtml(text)}</span>` : '');
        // v0.2.11: "AI polished" only when the spelling really changed; a name the AI left alone stays CACHE.
        const cacheTag = polishChanged(r) ? one(true, L.polishTip, L.polishTag)
            : one(r.cache, r.polished ? L.keptTip : L.cacheTip, L.cacheTag);
        // A word name shows its own meaning and language; the plain English word mark would say the same thing twice.
        const wordName = r.word && (r.word.meaning || r.word.lang) ? one(true, L.wordMeanTip, L.wordMeanTag(r.word.meaning, r.word.lang)) : '';
        return tag + cacheTag + one(r.real, L.realTip, L.realTag) + (wordName || (words.length ? one(true, L.wordTip, L.wordTag(words)) : ''))
            + one(clicheHit(r), L.clicheTip, L.clicheTag) + one(canonHit(r), L.canonTip, L.canonTag);
    }
    function nicksHtml(r, L = T()) {
        return `<div class="tbd-nicks"><span class="tbd-nicks-label">${escapeHtml(L.nicks)}:</span>${r.nicks.map((n, k) =>
            `${k ? '<span class="tbd-nick-dot" aria-hidden="true">·</span>' : ''}<button type="button" class="tbd-nick" data-n="${k}" title="${escapeHtml(L.nickCopy)}">${escapeHtml(n)}</button>`).join('')}</div>`;
    }
    // [Find names] [Found ⭐ 12] under the top.
    function tabsHtml(st = settings()) {
        const L = T();
        const tab = (id, label, on) => `<button type="button" class="tbd-tab" id="tbd_tab_${id}" data-tab="${id}" role="tab" aria-selected="${on}">${label}</button>`;
        return `<div class="tbd-tabs" role="tablist">${tab('form', escapeHtml(L.tabFind), view === 'form')}${tab('found', `${escapeHtml(L.tabFound)} <i class="fa-solid fa-star" aria-hidden="true"></i> <span class="tbd-tab-n">${st.found.length}</span>`, view === 'found')}</div>`;
    }
    function foundHtml(st = settings()) {
        const L = T();
        const reading = !!st.showReading;
        const counts = { all: st.found.length };
        for (const e of st.found) counts[e.target] = (counts[e.target] || 0) + 1;
        if (foundFilter !== 'all' && !counts[foundFilter]) foundFilter = 'all';
        const chips = ['all', ...FOUND_TARGETS.filter(t => counts[t])].map(t =>
            chipHtml('foundf', t, `${t === 'all' ? L.foundAll : L.t[t]} ${counts[t] || 0}`, foundFilter === t)).join('');
        // Newest first.
        const list = st.found.map((e, i) => ({ e, i })).filter(x => foundFilter === 'all' || x.e.target === foundFilter).reverse();
        const rows = list.map(({ e, i }) => `<div class="tbd-row tbd-frow" data-f="${i}">
                <div class="tbd-row-main">
                    <div class="tbd-row-text"><div class="tbd-name">${escapeHtml(e.name)}${reading && e.read ? `<span class="tbd-read">${escapeHtml(e.read)}</span>` : ''}${tagsHtml(e, L)}</div>${e.from ? `<div class="tbd-note">↳ ${escapeHtml(L.foundFrom)}: ${escapeHtml(e.from)}</div>` : ''}${st.nicknames && e.nicks?.length ? nicksHtml(e, L) : ''}${fragsHtml(e)}${e.note ? `<div class="tbd-note">${escapeHtml(e.note)}</div>` : ''}</div>
                    <button class="tbd-icon-btn tbd-fcopy" title="${escapeHtml(L.copy)}" aria-label="${escapeHtml(L.copy)}"><i class="fa-regular fa-copy"></i></button>
                    <button class="tbd-icon-btn tbd-fdel" title="${escapeHtml(L.foundRemove)}" aria-label="${escapeHtml(L.foundRemove)}"><i class="fa-solid fa-xmark"></i></button>
                </div></div>`).join('');
        return `<div class="tbd-found">
            ${st.found.length ? `<div class="tbd-chips tbd-found-filter">${chips}</div>` : ''}
            <div class="tbd-results">${rows || `<div class="tbd-empty">${escapeHtml(L.foundEmpty)}</div>`}</div>
            <div class="tbd-foot"><span class="tbd-status">${escapeHtml(L.foundHint)}</span>
                <button id="tbd_found_export" class="tbd-small-btn" title="${escapeHtml(L.foundExportTip)}"${st.found.length ? '' : ' disabled'}><i class="fa-solid fa-file-export"></i> ${escapeHtml(L.foundExport)}</button>
                <button id="tbd_found_import" class="tbd-small-btn" title="${escapeHtml(L.foundImportTip)}"><i class="fa-solid fa-file-import"></i> ${escapeHtml(L.foundImport)}</button>
                <input type="file" id="tbd_found_file" accept=".json,application/json" hidden></div>
        </div>`;
    }

    function resultsHtml() {
        const L = T();
        if (busy) return `<div class="tbd-log" id="tbd_log"></div>`;
        if (!results.length) return `<div class="tbd-empty">${escapeHtml(L.empty)}</div>`;
        const reading = !!settings().showReading;
        const showNicks = !!settings().nicknames;
        return results.map((r, i) => {
            const depth = r.depth || 0;
            const tags = tagsHtml(r, L);
            const star = isFound(r);
            const nicks = showNicks && r.nicks?.length ? nicksHtml(r, L) : '';

            const menu = menuFor === r ? `<div class="tbd-refine-menu">${REFINE_MODES.map(m =>
                `<button class="tbd-small-btn tbd-refine-pick" data-mode="${m}">${escapeHtml(L.r[m])}</button>`).join('')}</div>` : '';
            const working = refining && refining.src === r
                ? `<div class="tbd-refining tbd-log"><div>${refining.kind === 'reroll' ? escapeHtml(L.rerolling) : refining.kind === 'piece' ? escapeHtml(L.rerollingPiece) : `${escapeHtml(L.refining)} (${escapeHtml(L.r[refining.mode])})`}</div></div>
                   <div class="tbd-refine-menu"><button class="tbd-small-btn tbd-refine-cancel">${escapeHtml(L.refineCancel)}</button></div>` : '';
            return `<div class="tbd-row${depth ? ' tbd-variant' : ''}" data-i="${i}" style="--tbd-depth:${depth}">
                <div class="tbd-row-main">
                    <div class="tbd-row-text"><div class="tbd-name">${depth ? '<span class="tbd-branch">↳</span>' : ''}${escapeHtml(r.name)}${reading && r.read ? `<span class="tbd-read">${escapeHtml(r.read)}</span>` : ''}${tags}</div>${nicks}${fragsHtml(r)}${r.note ? `<div class="tbd-note">${escapeHtml(r.note)}</div>` : ''}</div>
                    <button class="tbd-icon-btn tbd-refine${menuFor === r ? ' tbd-on' : ''}" title="${escapeHtml(L.refineBtn)}" aria-label="${escapeHtml(L.refineBtn)}"${refining ? ' disabled' : ''}><i class="fa-solid fa-wand-magic-sparkles"></i></button>
                    <button class="tbd-icon-btn tbd-reroll" title="${escapeHtml(L.rerollBtn)}" aria-label="${escapeHtml(L.rerollBtn)}"${refining ? ' disabled' : ''}><i class="fa-solid fa-rotate-right"></i></button>
                    <button class="tbd-icon-btn tbd-copy" title="${escapeHtml(L.copy)}" aria-label="${escapeHtml(L.copy)}"><i class="fa-regular fa-copy"></i></button>
                    <button class="tbd-icon-btn tbd-star${star ? ' tbd-on' : ''}" title="${escapeHtml(star ? L.starRemove : L.starAdd)}" aria-label="${escapeHtml(star ? L.starRemove : L.starAdd)}" aria-pressed="${star}"><i class="fa-solid fa-star"></i></button>
                    <button class="tbd-icon-btn tbd-check-btn${r.check && !r.check.hidden && !r.check.quiet ? ' tbd-on' : ''}" title="${escapeHtml(L.checkBtn)}" aria-label="${escapeHtml(L.checkBtn)}"><i class="fa-solid fa-magnifying-glass"></i></button>
                </div>${checkHtml(r)}${piecesHtml(r)}${menu}${working}
            </div>`;
        }).join('');
    }

    // v0.2.9: every result as plain text, for pasting into a chat to check names in a language you don't read.
    // Always English (fragment meanings too), so it reads the same whatever the screen language.
    function reviewFormLine(form = {}) {
        const en = STRINGS.en;
        const bits = [];
        const cache = isCache(form);
        bits.push(`Made with: ${en.methods[isPolish(form) ? 'polish' : cache ? 'cache' : 'ai'] || 'AI'}`);
        bits.push(`Target: ${form.target || 'person'}`);
        if (!cache) bits.push(`Vibe: ${form.vibe === 'custom' ? `custom "${String(form.customVibe || '').slice(0, 60)}"` : form.vibe || 'fantasy'}`);
        if (form.target === 'person') bits.push(`Gender: ${form.gender || 'any'}`);
        else if (form.kind && form.kind !== 'any') bits.push(`Kind: ${form.kind}`);
        if (cache) {
            const roots = cacheRoots(form);
            bits.push(`Roots: ${roots.map(r => en.roots[r]).join(', ')}${roots.length > 1 ? ` (${cacheMerge(form) ? 'Merge' : 'Split'})` : ''}`);
            if (form.target === 'person') bits.push(`Kind of name: ${cacheKinds(form).map(k => en.ck[k]).join(', ')}`);
        } else {
            const roots = aiRoots(form);
            if (roots.length) bits.push(`Roots: ${roots.map(r => en.roots[r]).join(', ')}${roots.length > 1 ? ` (${form.aiRootMix === 'merge' ? 'Merge' : 'Split'})` : ''}${aiRootsOff(form) ? ' [not used now]' : ''}`);
            if (form.target === 'person' && realMode(form) !== 'invented') bits.push(`Real names: ${realMode(form)}`);
            if (likeWords(form).length) bits.push(`Like: ${likeWords(form).join(', ')} (${form.likeMode === 'feel' ? 'feel' : 'sound'})`);
            if (wordMode(form) !== 'avoid') bits.push(`Word names: ${wordMode(form)}${wordOff(form) ? ' [not used now]' : ''}`);
        }
        if (form.target === 'person') bits.push(`Parts: ${(Array.isArray(form.parts) ? form.parts : ['given']).join(', ')}${form.fixedFamily ? ` (family kept: ${form.fixedFamily})` : ''}`);
        if (form.length && form.length !== 'any') bits.push(`Length: ${form.length}`);
        if (form.sound && form.sound !== 'any') bits.push(`Sound: ${form.sound}`);
        if (String(form.mustContain || '').trim()) bits.push(`Must contain: ${String(form.mustContain).trim()}`);
        return bits.join(' · ');
    }
    function reviewFrags(frags = []) {
        return frags.map(f => `${f.t}${f.en ? ` (${f.en})` : ''}${f.r ? ` [${STRINGS.en.roots[f.r] || f.r}]` : ''}`).join(' + ');
    }
    function reviewText(list = results) {
        const en = STRINGS.en;
        const lines = ['TBD names for review'];
        let lastForm = '';
        list.forEach((r, i) => {
            const formLine = reviewFormLine(r.form || {});
            if (formLine !== lastForm) { lines.push('', `[${formLine}]`); lastForm = formLine; }
            const marks = [];
            if (r.tag) marks.push(`variant: ${r.tag}`);
            if (polishChanged(r)) marks.push('AI polished'); else if (r.polished) marks.push('ARCHIVE, AI read only'); else if (r.cache) marks.push('ARCHIVE');
            if (r.real) marks.push('real');
            if (r.word) marks.push(`word: ${[r.word.meaning, r.word.lang].filter(Boolean).join(', ')}`);
            else if (wordHits(r, r.form).length) marks.push(`plain word: ${wordHits(r, r.form).map(w => w.word).join(', ')}`);
            if (clicheHit(r)) marks.push('AI favorite');
            if (canonHit(r)) marks.push('Lovecraft');
            if (r.gender === 'm' || r.gender === 'f') marks.push(r.gender === 'm' ? 'male' : 'female');
            if (r.kind) marks.push(en.ck[r.kind] || r.kind);
            const indent = '  '.repeat(r.depth || 0);
            lines.push(`${indent}${i + 1}. ${r.name}${marks.length ? `  {${marks.join(', ')}}` : ''}`);
            const sub = `${indent}   `;
            if (r.from) lines.push(`${sub}from: ${typeof r.from === 'object' ? r.from.name : r.from}`);
            if (r.read) lines.push(`${sub}reading: ${r.read}`);
            if (r.note) lines.push(`${sub}note: ${r.note}`);
            if (r.cache) {
                const rootText = Array.isArray(r.mix) && r.mix.length === 2 ? r.mix.map(x => en.roots[x]).join(' + ') : (en.roots[r.root] || '');
                if (r.pieces) {
                    for (const p of r.pieces) {
                        const fr = p.frags?.length ? `: ${reviewFrags(p.frags)}` : '';
                        lines.push(`${sub}${p.role} "${p.text}"${p.fixed ? ' (kept as is)' : ''}${fr}${p.branch ? ` · ${en.branch[p.branch] || p.branch}` : ''}${p.orig && p.orig !== p.text ? ` · was "${p.orig}"` : ''}`);
                    }
                } else if (r.frags?.length) lines.push(`${sub}fragments: ${reviewFrags(r.frags)}`);
                if (rootText) lines.push(`${sub}roots: ${rootText}`);
                if (r.polished && r.orig && r.orig !== r.name) lines.push(`${sub}before polish: ${r.orig}`);
            } else if (r.pieces) {
                lines.push(`${sub}parts: ${r.pieces.map(p => `${p.role} "${p.text}"${p.real ? ' (real)' : ''}`).join(', ')}`);
            }
            if (r.nicks?.length) lines.push(`${sub}nicknames: ${r.nicks.join(', ')}`);
            if (r.seed) lines.push(`${sub}seed: ${r.seed}`);
        });
        return lines.join('\n');
    }

    function footerHtml() {
        const L = T();
        const again = results.length && !busy && !refining ? `<button id="tbd_again" class="tbd-small-btn"><i class="fa-solid fa-rotate"></i> ${escapeHtml(L.again)}</button>` : '';
        const review = results.length && !busy ? `<button id="tbd_review" class="tbd-small-btn" title="${escapeHtml(L.reviewTip)}"><i class="fa-solid fa-clipboard-list"></i> ${escapeHtml(L.reviewCopy)}</button>` : '';
        // When an answer couldn't be used, let the user see what actually came back.
        const hasRaw = status.kind === 'error' && typeof status.raw === 'string';
        const rawBtn = hasRaw ? `<button id="tbd_raw_btn" class="tbd-small-btn" aria-expanded="${rawOpen}">${escapeHtml(rawOpen ? L.hideRaw : L.showRaw)}</button>` : '';
        const rawBox = hasRaw && rawOpen ? `<pre class="tbd-raw">${escapeHtml(status.raw.trim() ? status.raw.slice(0, 20000) : L.rawEmpty)}</pre>` : '';
        return `<span class="tbd-status tbd-status-${status.kind}">${escapeHtml(status.text)}</span>${rawBtn}${review}${again}${rawBox}`;
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
        if (view === 'found') {
            $p.html(`${headerHtml(st.theme)}${tabsHtml(st)}${foundHtml(st)}`);
            return;
        }
        $p.html(`${headerHtml(st.theme)}${tabsHtml(st)}${formHtml(st.form)}
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
            method: METHODS.includes(st.form.method) ? st.form.method : 'ai',
            roots: pickedRoots(st.form),
            ckinds: pickedKinds(st.form),
            aiRoots: (Array.isArray(st.form.aiRoots) ? st.form.aiRoots : []).filter(x => CACHE_ROOTS.includes(x)),
            rootMix: st.form.rootMix === 'merge' ? 'merge' : 'split',
            aiRootMix: st.form.aiRootMix === 'merge' ? 'merge' : 'split',
            wordMode: WORD_MODES.includes(st.form.wordMode) ? st.form.wordMode : 'avoid',
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
        const need = cacheNeed(form);
        if (need) {
            status = { kind: 'error', text: T().needErr(T().needPick[need]) };
            rawOpen = false;
            renderResultsOnly();
            return;
        }
        if (isPolish(form)) { await polishGenerate(form, count, avoid, st); return; }
        if (isCache(form)) { cacheGenerate(form, count, avoid, st); return; }
        const seeds = rollSeeds(count, form);
        const messages = buildMessages(form, seeds, { lang, avoid: promptAvoid(st, form), reading: !!st.showReading, nicks: nickOn(form, st) });

        busy = true;
        controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const myController = controller;
        status = { kind: 'busy', text: '' }; rawOpen = false;
        renderResultsOnly();
        try {
            const raw = await requestLLM(messages, { profileId: st.profileId, sendPreset: !!st.sendPreset, reasoning: st.reasoning, maxTokens: tokensFor(count, st, !!nameShape(form)), signal: myController?.signal });
            if (myController && myController.signal.aborted) return;
            if (controller !== myController) return;
            const parsed = applyShape(withSeeds(parseNames(raw), form, seeds), form);
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

    // Cache + AI: the cache makes them, one request polishes them all.
    async function polishGenerate(form, count, avoid, st) {
        const made = cacheNames(form, count, avoid);
        rawOpen = false;
        if (!made.length) { status = { kind: 'error', text: T().err(T().cacheEmpty) }; renderResultsOnly(); return; }
        busy = true;
        controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const myController = controller;
        status = { kind: 'busy', text: '' };
        renderResultsOnly();
        let names = made, done = 0, raw;
        try {
            ({ names, done, raw } = await polishNames(made, form, st, myController?.signal));
        } catch (e) {
            if (controller !== myController) return;
            if (myController?.signal.aborted || e?.name === 'AbortError') {
                status = { kind: 'error', text: T().cancelled };
                busy = false; controller = null; renderResultsOnly();
                return;
            }
        }
        if (controller !== myController) return;
        const used = { ...form };
        results = names.map(n => ({ ...n, form: used }));
        rememberNames(results.flatMap(memoryNames), st); refreshHistory();
        save();
        const L = T();
        if (done === results.length) status = { kind: 'ok', text: L.found(results.length) };
        else if (!done) status = { kind: 'error', text: L.polishFail, ...(typeof raw === 'string' ? { raw } : {}) };
        else status = { kind: 'error', text: L.polishSome(done, results.length), ...(typeof raw === 'string' ? { raw } : {}) };
        busy = false;
        controller = null;
        renderResultsOnly();
        autoCheck(results);
    }

    // One polished name (🔄 or one part swapped): a running job like the other single-name swaps.
    async function polishOne(src, item, st, kind) {
        const L = T();
        const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const job = { src, ctl, kind };
        refining = job;
        menuFor = null;
        status = { kind: 'busy', text: '' }; rawOpen = false;
        renderResultsOnly();
        let out = { ...item }, done = 0, raw;
        delete out.polishOnly;
        try {
            const r = await polishNames([item], src.form || st.form, st, ctl?.signal);
            out = r.names[0]; done = r.done; raw = r.raw;
            delete out.polishOnly;
        } catch (e) {
            if (refining !== job) return null;
            if (ctl?.signal.aborted || e?.name === 'AbortError') { status = { kind: 'error', text: L.cancelled }; refining = null; renderResultsOnly(); return null; }
        }
        if (refining !== job) return null;
        refining = null;
        if (!done) {
            // Keep the new cache name, but say the polish didn't happen (and keep "was" honest).
            if (kind === 'piece' && src.polished) { out.polished = true; out.orig = out.pieces ? out.pieces.map(p => p.orig || p.text).join(' ') : out.name; }
            status = { kind: 'error', text: L.polishFail, ...(typeof raw === 'string' ? { raw } : {}) };
        } else status = { kind: 'ok', text: kind === 'piece' ? L.pieceRerolled : L.rerolled };
        return out;
    }
    async function polishReroll(src, st) {
        const form = src.form || st.form;
        const avoid = [...new Set([...avoidList(st, form), ...results.flatMap(memoryNames)])];
        const [n] = cacheNames(rerollForm(src, form), 1, avoid);
        if (!n) { status = { kind: 'error', text: T().err(T().cacheEmpty) }; renderResultsOnly(); return; }
        const fresh0 = await polishOne(src, n, st, 'reroll');
        const at = results.indexOf(src);
        if (!fresh0 || at === -1) { renderResultsOnly(); return; }
        const fresh = { ...fresh0, form: src.form };
        const depth = src.depth || 0;
        let end = at + 1;
        while (end < results.length && (results[end].depth || 0) > depth) end++;
        results.splice(at, end - at, fresh);
        rememberNames(memoryNames(fresh), st); refreshHistory();
        save();
        renderResultsOnly();
        autoCheck([fresh]);
    }
    async function polishRerollPiece(src, k, st) {
        const form = src.form || st.form;
        const avoid = [...new Set([...avoidList(st, form), ...results.flatMap(memoryNames)])];
        const old = src.pieces[k];
        const next = cachePiece(src, k, form, avoid);
        if (!next) { status = { kind: 'error', text: T().err(T().cacheEmpty) }; renderResultsOnly(); return; }
        delete next.orig;
        const pieces = src.pieces.map((p, j) => (j === k ? next : p));
        const item = { ...src, pieces, name: pieces.map(p => p.text).join(' '), polishOnly: [next.role] };
        const out = await polishOne(src, item, st, 'piece');
        if (!out || !results.includes(src) || src.pieces[k] !== old) { renderResultsOnly(); return; }
        src.pieces = out.pieces;
        src.name = out.name;
        if (out.orig) src.orig = out.orig;
        if (out.read) src.read = out.read;
        if (out.note) src.note = out.note;
        delete src.check;
        rememberNames([src.pieces[k].text], st); refreshHistory();
        save();
        renderResultsOnly();
        autoCheck([src]);
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
        const messages = buildRefineMessages(base, mode, form, { lang: detectLang(), avoid: promptAvoid(st, form, results.flatMap(memoryNames)), reading: !!st.showReading, nicks: nickOn(form, st) });
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
        if (!isVariant && src.cache && isPolish(src.form || st.form)) { polishReroll(src, st); return; }
        if (!isVariant && src.cache) { cacheReroll(src, st); return; }
        const from = isVariant && src.from.cache ? { ...src.from, pieces: undefined } : src.from;
        const form = aiForm(src.form || st.form, isVariant ? src.from : src);
        const avoid = [...new Set([...avoidList(st, form), ...results.flatMap(memoryNames)])];
        const nicks = nickOn(form, st);
        const askAvoid = promptAvoid(st, form, results.flatMap(memoryNames));
        const seeds1 = isVariant ? [] : rollSeeds(1, form);
        const messages = isVariant
            ? buildRefineMessages(from, src.tag, form, { lang, avoid: askAvoid, count: 1, reading: !!st.showReading, nicks })
            : buildMessages(form, seeds1, { lang, avoid: askAvoid, reading: !!st.showReading, nicks });
        const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const job = { src, ctl, kind: 'reroll' };
        refining = job;
        menuFor = null;
        status = { kind: 'busy', text: '' }; rawOpen = false;
        renderResultsOnly();
        try {
            const raw = await requestLLM(messages, { profileId: st.profileId, sendPreset: !!st.sendPreset, reasoning: st.reasoning, maxTokens: tokensFor(1, st, !!nameShape(form)), signal: ctl?.signal });
            if (refining !== job) return;
            const parsed = isVariant && !from.pieces ? parseNames(raw) : applyShape(withSeeds(parseNames(raw), form, seeds1), form);
            const kept = keepNames(parsed, avoid, form, st);
            const at = results.indexOf(src);
            if (!parsed.length) status = { kind: 'error', text: failText(raw, L), raw };
            else if (!kept.length) status = { kind: 'error', text: L.err(L.allFiltered), raw };
            else if (at !== -1) {
                const fresh = { ...src, name: kept[0].name, note: kept[0].note, read: kept[0].read, pieces: kept[0].pieces, real: kept[0].real, nicks: kept[0].nicks, seed: kept[0].seed, word: kept[0].word };
                for (const k of ['pieces', 'real', 'nicks', 'seed', 'word']) if (!fresh[k]) delete fresh[k];
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
        const one = rerollForm(src, form);
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
            if (src.polished) src.orig = src.pieces.map(p => p.orig || p.text).join(' ');
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
        if (src.cache && isPolish(src.form || settings().form) && POLISH_ROLES.includes(piece.role)) { polishRerollPiece(src, k, settings()); return; }
        if (src.cache) { cacheRerollPiece(src, k, settings()); return; }
        const st = settings();
        const L = T();
        const form = src.form || st.form;
        const avoid = [...new Set([...avoidList(st, form), ...results.flatMap(memoryNames)])];
        const reading = !!st.showReading;
        const nicks = nickOn(form, st);
        const messages = buildPieceMessages(src, piece.role, form, { lang: detectLang(), avoid: promptAvoid(st, form, results.flatMap(memoryNames)), reading, nicks });
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
                delete src.seed; // the seed was for the old whole name
                if (piece.role === 'given') delete src.word; // the word was the old given name
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
        $doc.on('click', '#tbd_review', async () => {
            if (await copyText(reviewText())) toastr.success(T().reviewCopied, 'TBD');
            else toastr.warning(T().copyFail, 'TBD');
        });
        $doc.on('change', '#tbd_target', () => { readForm(); render(); });
        $doc.on('change', '#tbd_kind', () => readForm());
        $doc.on('change', '#tbd_vibe', function () { $('#tbd_custom_wrap').prop('hidden', $(this).val() !== 'custom'); refreshAiRoots(readForm()); });
        $doc.on('change', '#tbd_gender, #tbd_length, #tbd_custom, #tbd_kindtext, #tbd_fixed', readForm);
        $doc.on('change', '#tbd_sound, #tbd_must, #tbd_like, #tbd_likemode, #tbd_realnames', () => refreshAiRoots(readForm()));
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
            if (group === 'foundf') { foundFilter = ['all', ...FOUND_TARGETS].includes(v0) ? v0 : 'all'; render(); return; }
            if (group === 'method') {
                if (form.method === v0) return;
                form.method = METHODS.includes(v0) ? v0 : 'ai';
                save();
                render();
                return;
            }
            if (group === 'airoot') {
                // "Any" clears the roots; a root turns "Any" off; the last root off means "Any" again.
                const set = new Set(v0 === 'any' ? [] : form.aiRoots);
                if (v0 !== 'any') { if (set.has(v0)) set.delete(v0); else set.add(v0); }
                form.aiRoots = CACHE_ROOTS.filter(x => set.has(x));
                $('#tbd_airootmix').prop('hidden', form.aiRoots.length < 2);
                $('#tbd_airoots .tbd-chip[data-chip=airoot]').each(function () {
                    const v = String($(this).data('v'));
                    $(this).attr('aria-pressed', (v === 'any' ? !form.aiRoots.length : set.has(v)) ? 'true' : 'false');
                });
                save();
                refreshAiRoots(form);
                return;
            }
            if (group === 'wordmode') {
                form.wordMode = WORD_MODES.includes(v0) ? v0 : 'avoid';
                $('#tbd_wordmode .tbd-chip').each(function () {
                    $(this).attr('aria-pressed', String($(this).data('v')) === form.wordMode ? 'true' : 'false');
                });
                save();
                refreshAiRoots(form);
                return;
            }
            if (group === 'rootmix' || group === 'airootmix') {
                const key = group === 'rootmix' ? 'rootMix' : 'aiRootMix';
                form[key] = v0 === 'merge' ? 'merge' : 'split';
                $(this).closest('.tbd-mix').find('.tbd-chip').each(function () {
                    $(this).attr('aria-pressed', String($(this).data('v')) === form[key] ? 'true' : 'false');
                });
                save();
                if (key === 'aiRootMix') refreshAiRoots(form);
                return;
            }
            if (group === 'root' || group === 'ckind') {
                const key = group === 'root' ? 'roots' : 'ckinds';
                const all = group === 'root' ? CACHE_ROOTS : CACHE_KINDS;
                // The last one can go off too: switching roots is then "off, on" in any order.
                const set = new Set(key === 'roots' ? pickedRoots(form) : pickedKinds(form));
                if (set.has(v0)) set.delete(v0); else set.add(v0);
                form[key] = all.filter(x => set.has(x));
                $(this).attr('aria-pressed', set.has(v0) ? 'true' : 'false');
                if (key === 'roots') { $('#tbd_rootmix').prop('hidden', form.roots.length < 2); $('#tbd_root_need').prop('hidden', form.roots.length > 0); }
                else $('#tbd_ckind_need').prop('hidden', form.ckinds.length > 0);
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
            const $row = $(this).closest('.tbd-row');
            const r = $row.hasClass('tbd-frow') ? settings().found[Number($row.data('f'))] : results[Number($row.data('i'))];
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
        // ---------- Found ⭐ ----------
        $doc.on('click', '#tbd_panel .tbd-star', function () {
            const r = results[Number($(this).closest('.tbd-row').data('i'))];
            if (!r) return;
            const st = settings();
            if (toggleFound(r, st) === 'full') toastr.warning(T().foundFull(FOUND_MAX), 'TBD');
            renderResultsOnly();
            $('#tbd_tab_found .tbd-tab-n').text(st.found.length);
        });
        $doc.on('click', '#tbd_panel .tbd-tab', function () {
            const to = String($(this).data('tab')) === 'found' ? 'found' : 'form';
            if (to === view) return;
            if (view === 'form') readForm();
            view = to;
            menuFor = null;
            render();
        });
        $doc.on('click', '#tbd_panel .tbd-fcopy', async function () {
            const e = settings().found[Number($(this).closest('.tbd-row').data('f'))];
            if (!e) return;
            if (await copyText(e.name)) toastr.success(T().copied, 'TBD');
            else toastr.warning(T().copyFail, 'TBD');
        });
        $doc.on('click', '#tbd_panel .tbd-fdel', function () {
            const st = settings();
            const k = Number($(this).closest('.tbd-row').data('f'));
            if (!st.found[k]) return;
            st.found.splice(k, 1);
            save();
            render();
        });
        $doc.on('click', '#tbd_found_export', () => {
            const st = settings();
            if (!st.found.length) return;
            const blob = new Blob([foundExportText(st)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tbd-found-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        });
        $doc.on('click', '#tbd_found_import', () => $('#tbd_found_file').trigger('click'));
        $doc.on('change', '#tbd_found_file', function () {
            const file = this.files?.[0];
            this.value = '';
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                const st = settings();
                const n = foundImport(reader.result, st);
                if (n < 0) toastr.warning(T().foundImportBad, 'TBD');
                else toastr.success(T().foundImported(n), 'TBD');
                if (n > 0 && st.found.length >= FOUND_MAX) toastr.warning(T().foundFull(FOUND_MAX), 'TBD');
                render();
            };
            reader.onerror = () => toastr.warning(T().foundImportBad, 'TBD');
            reader.readAsText(file);
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
            aiRoots, aiRootsOff, aiRootsUsed, rootRule, aiRootsHtml, pickedRoots, pickedKinds, cacheNeed, cacheChipsHtml, sharedStems, polishChanged, tagsHtml, pickOrdinal, reviewText, reviewFormLine, seedLine, withSeeds, wordMode, wordOff, wordUsed, wordFrom, wordModeHtml, avoidList, promptAvoid, keepNames, aiMerge, cacheMerge, rootPairs, rootsPhrase, rerollForm, rootMixHtml, ROOT_MIXES, sameSound, meaningClash, twoAdjectives, slavicAgree, latinGiven, noAccents, newDoubleVowel, slavicSki, echoSyllable, slavicOvo, scholarFamily,
            CACHE, CACHE_ROOTS, CACHE_KINDS, isCache, isPolish, polishRoles, foundEntry, foundKey, isFound, toggleFound, foundExportText, foundImport, foundHtml, tabsHtml, FOUND_MAX, buildPolishMessages, polishAnswers, polishOk, applyPolish, polishNames, METHODS, cacheRoots, cacheOne, cacheNames, cachePiece, cacheFamily, cacheFamilyBranch, cachePlace, royalEpithet, royalTitle, warEpithet, latinGiven, fragsHtml, aiForm, glue, sayable, soundScore,
            checkTargets, readWikiAnswer, wikiLookup, checkNames, checkHtml, checkWarns, buildCheckMessages, googleUrl,
            setResults: list => { results = list; },
        };
    } else {
        if (typeof $ === 'function' && document.body) settingsSlot();
        jQuery(() => init());
    }
})();
