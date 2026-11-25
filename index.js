// TBD — Name Not Found v0.1.16
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
            thinkFail: 'The AI only thought and wrote no answer. Raise "Max response tokens" in settings (thinking models may need 6000+).',
            emptyFail: 'The AI sent back an empty answer. If you use a connection profile, turn off "Send the connection profile\'s preset too" in settings.',
            showRaw: 'See the answer', hideRaw: 'Hide the answer', rawEmpty: '(empty — nothing came back but the thinking, if any)',
            sPreset: "Send the connection profile's preset too", sPresetHint: 'Off by default. A roleplay preset can make the AI answer empty or in character. Turn on only if your model needs its preset.',
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
            parts: 'Name parts', extras: 'Extras',
            pc: { given: 'Given', middle: 'Middle', family: 'Family' },
            ex: { title: 'Title', particle: 'Noble particle', origin: 'Place of origin', patronymic: "Father's-name surname", epithet: 'Nickname / epithet', religious: 'Religious name', codename: 'Codename', alias: 'Alias / stage name' },
            fixedFamily: 'Keep this family name (optional)', fixedFamilyPh: 'e.g. Holloway',
            copyPiece: 'Copy this part', rerollPiece: 'Swap just this part', rerollingPiece: 'Swapping one part…', pieceRerolled: '200 OK — part swapped',
            gear: 'Settings', back: 'Back',
            // settings
            sTitle: 'TBD — Name Not Found',
            sLang: 'Language', sLangAuto: 'Follow SillyTavern',
            sProfile: 'Connection profile', sProfileCurrent: '(Use current API)', sProfileMissing: '⚠️ Profile not found — pick again',
            sCount: 'Names per search (1–30)',
            sTokens: 'Max response tokens',
            sTokensHint: 'Raised automatically for big batches. Thinking models may need more; lower it for a very small local model.',
            sTheme: 'Theme', sEffects: 'Moving effects (glitch, flicker, scanlines)',
            sReading: 'Show how to read each name',
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
            thinkFail: 'AI가 생각만 하고 답을 안 썼어요. 설정에서 최대 응답 토큰을 늘려 보세요(생각하는 모델은 6000 이상 필요할 수 있어요).',
            emptyFail: 'AI가 빈 답을 보냈어요. 연결 프로필을 쓰면 설정에서 "연결 프로필의 프리셋도 같이 보내기"를 꺼 보세요.',
            showRaw: '받은 답 보기', hideRaw: '받은 답 접기', rawEmpty: '(비어 있음 — 생각 말고는 아무것도 안 왔어요)',
            sPreset: '연결 프로필의 프리셋도 같이 보내기', sPresetHint: '기본은 꺼짐이에요. 롤플레이 프리셋을 같이 보내면 AI가 빈 답이나 롤플레이로 답할 수 있어요. 모델에 프리셋이 꼭 필요할 때만 켜세요.',
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
            parts: '이름 구성', extras: '특수한 이름',
            pc: { given: '이름', middle: '미들네임', family: '성' },
            ex: { title: '직함·존칭', particle: '귀족 표시', origin: '출신지', patronymic: '아버지 이름 성', epithet: '별명·칭호', religious: '세례명·수도명', codename: '코드네임', alias: '가명·예명' },
            fixedFamily: '성 고정 (안 써도 됨)', fixedFamilyPh: '예: Holloway',
            copyPiece: '이 조각 복사', rerollPiece: '이 조각만 다시 뽑기', rerollingPiece: '조각 하나 바꾸는 중…', pieceRerolled: '200 OK — 조각 바꿈',
            gear: '설정', back: '돌아가기',
            sTitle: 'TBD — Name Not Found',
            sLang: '언어', sLangAuto: '실리태번 따라가기',
            sProfile: '연결 프로필', sProfileCurrent: '(현재 연결된 API 사용)', sProfileMissing: '⚠️ 찾을 수 없는 프로필 — 다시 골라 주세요',
            sCount: '한 번에 뽑을 이름 수 (1~30)',
            sTokens: '최대 응답 토큰',
            sTokensHint: '많이 뽑을 땐 자동으로 늘어나요. 생각하는 모델은 더 필요할 수 있고, 아주 작은 로컬 모델이면 줄이세요.',
            sTheme: '테마', sEffects: '움직이는 효과 (글리치, 깜빡임, 스캔라인)',
            sReading: '이름 읽는 법 보기',
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
    // Avoid list + repeats + copies of the "like this" words, then real words too when the user chose to filter them.
    function keepNames(list, avoid, form, st = settings()) {
        const out = filterNames(list, avoid).filter(n => !isLikeCopy(n, form || {}));
        return st.wordNames === 'filter' ? out.filter(n => !wordHits(n, form).length) : out;
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
    };
    const ENDINGS = {
        placeOld: ['-holm', '-mere', '-wick', '-ford', '-by', '-thorpe', '-moor', '-crag', '-ley', '-stead', '-gate', '-combe', '-den', '-wold', '-fell', '-bury'],
        placeTech: ['-ex', '-ion', '-ax', '-on', '-ar', '-is', ' Station', ' Array', ' Prime', ' Hub', ' Sector', '-7', '-IX', ' Spire'],
        placeModern: ['-ton', '-field', '-ville', ' Heights', ' Park', ' Bay', ' Point', '-burg', '-dale', ' Junction', ' Cross', '-side'],
    };
    function endingsFor(target, vibe) {
        // A typed vibe decides the sound itself, so no person ending is pushed on it.
        if (target === 'person') return vibe === 'custom' ? null : (PERSON_ENDINGS[vibe] || PERSON_ENDINGS.fantasy);
        if (target !== 'place') return null;
        if (vibe === 'scifi') return ENDINGS.placeTech;
        if (vibe === 'modern') return ENDINGS.placeModern;
        if (vibe === 'custom') return [...ENDINGS.placeOld, ...ENDINGS.placeModern];
        return ENDINGS.placeOld;
    }
    // Shops and items are often phrases, so they get a shape instead of an ending.
    const SHAPES = {
        shop: ['one invented word', 'The + adjective + noun', "an invented owner's name + 's", 'a short pun on the trade', 'noun & noun', 'an invented word + the kind of shop'],
        // "A word for what it is" keeps the name on the thing (bread → loaf, bun), not on a random object.
        item: ['one invented word', 'an invented word + a plain word for what it is', "an invented maker's name + 's + a plain word for what it is", 'a short descriptive phrase'],
        itemOld: ['"the … of …"', 'a title-like epithet'],
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
            if (['fantasy', 'medieval', 'gothic'].includes(vibe)) return [...SHAPES.item, ...SHAPES.itemOld];
            return SHAPES.item;
        }
        return null;
    }
    const TEXTURES = ['soft', 'sharp', 'earthy', 'airy', 'heavy', 'bright', 'old-fashioned', 'clipped', 'rolling', 'rough', 'playful', 'stern'];
    // Old-world textures pulled sci-fi and modern names back toward fantasy.
    function texturesFor(vibe) {
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
    };
    const ALL_SPARKS = [...new Set(Object.values(SPARKS).flat())];
    const SYLLABLES = { short: [1, 2], medium: [2, 3], long: [3, 4], any: [1, 4] };

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
        const sparks = opts.vibe === 'custom' || typedDetail || like ? null : (SPARKS[opts.vibe] || ALL_SPARKS);
        const textures = texturesFor(opts.vibe);
        const endings = endingsFor(target, opts.vibe);
        const shapes = shapesFor(target, opts.vibe);
        const shape = nameShape(opts);
        const familyStyles = shape && shape.roles.includes('family') && !shape.fixed ? (FAMILY_STYLES[opts.vibe] || ALL_FAMILY_STYLES) : null;
        const seeds = [];
        const usedEndings = new Set();
        const usedFamily = new Set();
        const usedSparks = new Set();
        for (let i = 0; i < count; i++) {
            const seed = {};
            // Sound-alike keeps the typed word's rhythm, so no random syllable count then.
            if (like !== 'sound') seed.syllables = lo + Math.floor(rnd() * (hi - lo + 1));
            if (!like) seed.texture = pick(textures, rnd);
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
            if (endings && !like && rnd() < 0.5) {
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
                pieces.push(fixed ? { role, text, fixed: true } : { role, text });
            }
            if (!pieces.length) return null;
            return { name: joinPieces(pieces), note: n.note, read: n.read, pieces };
        }).filter(n => n && n.name.length <= 120);
    }
    // The parts worth remembering and avoiding next time (not "Sir", not a kept family name).
    function memoryNames(r) {
        if (!r.pieces) return [r.name];
        return r.pieces.filter(p => NAME_ROLES.includes(p.role) && !p.fixed).map(p => p.text);
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
        historySize: 200,
        history: [],
        banList: '',
        showReading: true,
        extrasOpen: false,
        wordNames: 'mark',
        form: { target: 'person', vibe: 'fantasy', customVibe: '', gender: 'any', kind: 'any', kindText: '', length: 'any', sound: 'any', mustContain: '', likeText: '', likeMode: 'sound', parts: ['given'], extras: [], fixedFamily: '' },
    };

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
        for (const n of names) if (looksLikeName(n) && !seen.has(n.toLowerCase())) { st.history.push(n); seen.add(n.toLowerCase()); }
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
    };

    // How people sound in each setting. Without this, every setting drifted toward fantasy.
    const PERSON_VIBE_RULES = {
        fantasy: 'Fantasy names may be freely invented, but avoid the overused elvish style.',
        medieval: 'Medieval people sound like old European village or church records, not magical fantasy.',
        gothic: 'Gothic people sound old, formal and aristocratic or churchly; dark but believable, not elvish.',
        scifi: 'Sci-fi people sound like the future: a mix of world cultures, short clipped forms, or slightly altered real names. Never like fantasy elves, knights or wizards.',
        modern: 'Modern people sound like someone you could meet today: uncommon is fine, but it must be believable on a real passport. Nothing fantasy-like.',
        cozy: 'Cozy people sound warm, simple and friendly; small and cute rather than grand or epic.',
    };
    function personVibeRule(form) {
        return form.target === 'person' ? (PERSON_VIBE_RULES[form.vibe] || '') : '';
    }

    // What the name has to sound like, so a place doesn't come back as a person's name.
    function shapeRules(form) {
        const out = [];
        if (personVibeRule(form)) out.push(personVibeRule(form));
        if (form.target === 'place') {
            out.push("It must sound like a place, not like a person's first name.");
            if (form.vibe === 'scifi') out.push('Sci-fi places can use tech or corporate roots, designations and numbers (a station, array, sector, hub, a "-7" suffix).');
            else if (form.vibe === 'modern') out.push('Modern places can sound like real towns, streets or districts (-ton, -field, Heights, Bay, Park…).');
            else if (form.vibe !== 'custom') out.push('Old-world places often use landscape endings (-holm, -mere, -wick, -ford, -by, -moor…). Mix them; don\'t put the same ending on every name.');
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
        } else if (nameShape(form)) {
            out.push('The given and middle names must not be plain existing English words (like "Mold" or "Salt"). Family names, epithets and titles may use real words (trades, places, deeds).');
        } else if (form.target === 'person' || form.target === 'other') {
            out.push('Never use a plain existing English word on its own as the name (like "Mold" or "Salt").');
        }
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
            out.push('Across the batch, no two names may be the same or share the same last word.');
        } else {
            out.push('Across the batch, no two names may share the same ending or the same last word (not two "… Array" or two "-ex").');
        }
        return out;
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
    function shapeJson(shape, reading) {
        const parts = shape.roles.map(r => `"${r}": "..."`).join(', ');
        return `[{"parts": {${parts}}${reading ? ', "read": "..."' : ''}, "note": "..."}]`;
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
            : `Make each ${what} sound like ${list}${many ? ' (somewhere between them)' : ''}: the same number of syllables and the same stressed syllable, and keep at least two of its key sounds (vowels or consonants) in the same places, so anyone hearing both would call them alike (e.g. "Morvane" → "Torvale", "Marvine").`;
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
        if (shape) {
            lines.push(`Invent ${seeds.length} original full name${seeds.length === 1 ? '' : 's'} for a person.`);
            lines.push(...shapeLines(shape, form.vibe));
        } else {
            lines.push(`Invent ${seeds.length} original name${seeds.length === 1 ? '' : 's'} for ${targetText(form)}.`);
        }
        lines.push(`Setting / vibe: ${vibe}.`);
        lines.push('Style: Western, English-readable spelling.');
        lines.push(...shapeRules(form));
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
        lines.push('follow its sound hints. An inspiration word is only a loose mood: bend it to fit what is being named and the setting, and ignore it if it doesn\'t fit.');
        lines.push('Never put the inspiration object itself into the name or the note when it isn\'t part of what is being named (no "bus stop" in the name of a bread).');
        const main = shape ? (shape.roles.includes('given') ? 'given name: ' : 'main invented part: ') : '';
        seeds.forEach((s, i) => {
            const parts = [];
            if (s.shape) parts.push(`shape: ${s.shape}`);
            if (s.start) parts.push(`${phrase ? 'main word starts' : 'starts'} with "${s.start}"`);
            if (s.syllables) parts.push(`${phrase ? 'main word ' : ''}${s.syllables} syllable${s.syllables === 1 ? '' : 's'}`);
            if (s.ending) parts.push(`ends with "${s.ending}"`);
            if (!sound && s.texture) parts.push(`${s.texture} sound`);
            if (!parts.length) parts.push('follow the "like" words above');
            if (s.spark) parts.push(`inspiration: "${s.spark}"`);
            lines.push(`${i + 1}. ${main}${parts.join(', ')}${s.family ? `; family name: ${s.family}` : ''}`);
        });
        if (seeds.length > 1) lines.push('Across the batch, don\'t build two names or notes on the same idea or image (not three "neon" names).');
        if (avoid.length) {
            lines.push('');
            lines.push(`Do NOT use these names or close variants: ${avoid.join(', ')}.`);
        }
        lines.push('');
        lines.push(`For each name add a short note (under 12 words) in ${lang === 'ko' ? 'Korean' : 'English'} about how it fits this setting. Don't claim a real meaning unless you are sure.`);
        if (opts.reading) lines.push(`Also add ${readingRule(lang, !!shape)}.`);
        lines.push('Reply with ONLY a JSON array, nothing else:');
        lines.push(shape ? shapeJson(shape, opts.reading) : opts.reading ? '[{"name": "...", "read": "...", "note": "..."}]' : '[{"name": "...", "note": "..."}]');
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
        lines.push('Avoid anything only a letter or two away from a well-known real or mythological name (like Bridget or Thor).');
        if (avoid.length) lines.push(`Do NOT use these names or close variants: ${avoid.join(', ')}.`);
        lines.push('');
        lines.push(`For each variant add a short note (under 10 words) in ${lang === 'ko' ? 'Korean' : 'English'} about what changed in the sound.`);
        if (opts.reading) lines.push(`Also add ${readingRule(lang, !!shape)}.`);
        lines.push('Reply with ONLY a JSON array, nothing else:');
        lines.push(shape ? shapeJson(shape, opts.reading) : opts.reading ? '[{"name": "...", "read": "...", "note": "..."}]' : '[{"name": "...", "note": "..."}]');
        return [
            { role: 'system', content: 'You are a naming assistant for fiction writers who understands phonetics and how sounds feel.' },
            { role: 'user', content: lines.join('\n') },
        ];
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
        if (avoid.length) lines.push(`Do NOT use these names or close variants: ${avoid.join(', ')}.`);
        lines.push('');
        if (opts.reading) lines.push(`Also add ${readingRule(lang, true)} — the whole name with the new part.`);
        lines.push('Reply with ONLY a JSON array with one item, nothing else. "name" is the new part only, without quotes or brackets:');
        lines.push(opts.reading ? '[{"name": "...", "read": "..."}]' : '[{"name": "..."}]');
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
                    out.push({ name: String(it.name ?? ''), note: String(it.note ?? it.meaning ?? ''), read: String(it.read ?? it.reading ?? it.pronunciation ?? ''), ...(parts ? { parts } : {}) });
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
                return { name, note: n.note.trim(), read: read.slice(0, 80), ...(n.parts ? { parts: n.parts } : {}) };
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

    async function requestLLM(messages, { profileId, maxTokens, signal, sendPreset = false } = {}) {
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

        if (profileId) {
            const svc = c.ConnectionManagerRequestService;
            if (!svc) throw new Error(T().noProfileApi);
            const res = await svc.sendRequest(profileId, messages, maxTokens, {
                stream: false, signal, extractData: true, includePreset: !!sendPreset, includeInstruct: true,
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

    function tokensFor(count, st = settings(), heavy = false) {
        return Math.max(clampInt(st.maxTokens, 200, 16000, DEFAULTS.maxTokens), 300 + count * (heavy ? 160 : 100));
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
        return `<div class="tbd-form">
            <label>${escapeHtml(L.target)}${selectHtml('tbd_target', L.t, form.target)}</label>
            <label>${escapeHtml(L.vibe)}${selectHtml('tbd_vibe', L.v, form.vibe)}</label>
            <label class="tbd-wide" id="tbd_custom_wrap"${form.vibe === 'custom' ? '' : ' hidden'}><input id="tbd_custom" class="text_pole" type="text" maxlength="80" placeholder="${escapeHtml(L.customVibePh)}" value="${escapeHtml(form.customVibe)}"></label>
            <label id="tbd_gender_wrap"${form.target === 'person' ? '' : ' hidden'}>${escapeHtml(L.gender)}${selectHtml('tbd_gender', L.g, form.gender)}</label>
            ${kinds ? `<label id="tbd_kind_wrap">${escapeHtml(L.kind)}${selectHtml('tbd_kind', L.k[form.target], kind)}</label>` : ''}
            <label>${escapeHtml(L.length)}${selectHtml('tbd_length', L.l, form.length)}</label>
            <label>${escapeHtml(L.sound)}${selectHtml('tbd_sound', L.s, form.sound || 'any')}</label>
            <label>${escapeHtml(L.mustContain)}<input id="tbd_must" class="text_pole" type="text" maxlength="20" placeholder="${escapeHtml(L.mustContainPh)}" value="${escapeHtml(form.mustContain)}"></label>
            <label>${escapeHtml(L.like)}<input id="tbd_like" class="text_pole" type="text" maxlength="${LIKE_MAX}" placeholder="${escapeHtml(L.likePh)}" value="${escapeHtml(form.likeText || '')}"></label>
            <label>${escapeHtml(L.likeMode)}${selectHtml('tbd_likemode', L.likeModes, form.likeMode === 'feel' ? 'feel' : 'sound')}</label>
            ${form.target === 'person' ? personPartsHtml(form) : ''}
            ${detailLabel ? `<label class="tbd-wide" id="tbd_kindtext_wrap">${escapeHtml(detailLabel)}<input id="tbd_kindtext" class="text_pole" type="text" maxlength="${DETAIL_MAX}" placeholder="${escapeHtml(detailPh)}" value="${escapeHtml(form.kindText || '')}"></label>` : ''}
            <button id="tbd_go" class="tbd-go menu_button">${escapeHtml(busy ? L.cancel : L.find)}</button>
        </div>`;
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
                <div class="tbd-chips" id="tbd_extras_chips"${settings().extrasOpen ? '' : ' hidden'}>${NAME_EXTRAS.map(v => chip('extra', v, L.ex[v], extras.includes(v))).join('')}</div>
            </div>
            <label class="tbd-wide" id="tbd_fixed_wrap"${parts.includes('family') ? '' : ' hidden'}>${escapeHtml(L.fixedFamily)}<input id="tbd_fixed" class="text_pole" type="text" maxlength="40" placeholder="${escapeHtml(L.fixedFamilyPh)}" value="${escapeHtml(form.fixedFamily || '')}"></label>`;
    }

    // Extras fold away to one line; when folded, the ones that are on still show.
    function extrasFoldHtml(extras) {
        const L = T();
        const open = !!settings().extrasOpen;
        const on = NAME_EXTRAS.filter(v => extras.includes(v)).map(v => L.ex[v]);
        const sum = !open && on.length ? `<span class="tbd-fold-sum">: ${escapeHtml(on.join(', '))}</span>` : '';
        return `<button type="button" id="tbd_extras_fold" class="tbd-fold" aria-expanded="${open ? 'true' : 'false'}"><i class="fa-solid fa-chevron-${open ? 'down' : 'right'}" aria-hidden="true"></i><span>${escapeHtml(L.extras)}${sum}</span></button>`;
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
        return results.map((r, i) => {
            const depth = r.depth || 0;
            const tag = r.tag && L.r[r.tag] ? `<span class="tbd-tag">${escapeHtml(L.r[r.tag])}</span>` : '';
            const words = wordHits(r);
            const wordTag = words.length ? `<span class="tbd-tag tbd-word-tag" title="${escapeHtml(L.wordTip)}">${escapeHtml(L.wordTag(words))}</span>` : '';
            const menu = menuFor === r ? `<div class="tbd-refine-menu">${REFINE_MODES.map(m =>
                `<button class="tbd-small-btn tbd-refine-pick" data-mode="${m}">${escapeHtml(L.r[m])}</button>`).join('')}</div>` : '';
            const working = refining && refining.src === r
                ? `<div class="tbd-refining tbd-log"><div>${refining.kind === 'reroll' ? escapeHtml(L.rerolling) : refining.kind === 'piece' ? escapeHtml(L.rerollingPiece) : `${escapeHtml(L.refining)} (${escapeHtml(L.r[refining.mode])})`}</div></div>
                   <div class="tbd-refine-menu"><button class="tbd-small-btn tbd-refine-cancel">${escapeHtml(L.refineCancel)}</button></div>` : '';
            return `<div class="tbd-row${depth ? ' tbd-variant' : ''}" data-i="${i}" style="--tbd-depth:${depth}">
                <div class="tbd-row-main">
                    <div class="tbd-row-text"><div class="tbd-name">${depth ? '<span class="tbd-branch">↳</span>' : ''}${escapeHtml(r.name)}${reading && r.read ? `<span class="tbd-read">${escapeHtml(r.read)}</span>` : ''}${tag}${wordTag}</div>${r.note ? `<div class="tbd-note">${escapeHtml(r.note)}</div>` : ''}</div>
                    <button class="tbd-icon-btn tbd-refine${menuFor === r ? ' tbd-on' : ''}" title="${escapeHtml(L.refineBtn)}" aria-label="${escapeHtml(L.refineBtn)}"${refining ? ' disabled' : ''}><i class="fa-solid fa-wand-magic-sparkles"></i></button>
                    <button class="tbd-icon-btn tbd-reroll" title="${escapeHtml(L.rerollBtn)}" aria-label="${escapeHtml(L.rerollBtn)}"${refining ? ' disabled' : ''}><i class="fa-solid fa-rotate-right"></i></button>
                    <button class="tbd-icon-btn tbd-copy" title="${escapeHtml(L.copy)}" aria-label="${escapeHtml(L.copy)}"><i class="fa-regular fa-copy"></i></button>
                </div>${piecesHtml(r)}${menu}${working}
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
            parts: Array.isArray(st.form.parts) ? st.form.parts : ['given'],
            extras: Array.isArray(st.form.extras) ? st.form.extras : [],
            fixedFamily: String($('#tbd_fixed').val() ?? st.form.fixedFamily ?? '').slice(0, 40),
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
        status = { kind: 'busy', text: '' }; rawOpen = false;
        renderResultsOnly();
        try {
            const raw = await requestLLM(messages, { profileId: st.profileId, sendPreset: !!st.sendPreset, maxTokens: tokensFor(count, st, !!nameShape(form)), signal: myController?.signal });
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
        const form = src.form || st.form;
        const avoid = [...new Set([...avoidList(st), ...results.flatMap(memoryNames)])];
        const messages = buildRefineMessages(src, mode, form, { lang: detectLang(), avoid, reading: !!st.showReading });
        const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const job = { src, mode, ctl, kind: 'refine' };
        refining = job;
        menuFor = null;
        status = { kind: 'busy', text: '' }; rawOpen = false;
        renderResultsOnly();
        try {
            const raw = await requestLLM(messages, { profileId: st.profileId, sendPreset: !!st.sendPreset, maxTokens: tokensFor(3, st, !!src.pieces), signal: ctl?.signal });
            if (refining !== job) return;
            const parsed = src.pieces ? applyShape(parseNames(raw), form) : parseNames(raw);
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
        const avoid = [...new Set([...avoidList(st), ...results.flatMap(memoryNames)])];
        const isVariant = (src.depth || 0) > 0 && src.from && REFINE_DESC[src.tag];
        const messages = isVariant
            ? buildRefineMessages(src.from, src.tag, form, { lang, avoid, count: 1, reading: !!st.showReading })
            : buildMessages(form, rollSeeds(1, form), { lang, avoid, reading: !!st.showReading });
        const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const job = { src, ctl, kind: 'reroll' };
        refining = job;
        menuFor = null;
        status = { kind: 'busy', text: '' }; rawOpen = false;
        renderResultsOnly();
        try {
            const raw = await requestLLM(messages, { profileId: st.profileId, sendPreset: !!st.sendPreset, maxTokens: tokensFor(1, st, !!nameShape(form)), signal: ctl?.signal });
            if (refining !== job) return;
            const parsed = applyShape(parseNames(raw), form);
            const kept = keepNames(parsed, avoid, form, st);
            const at = results.indexOf(src);
            if (!parsed.length) status = { kind: 'error', text: failText(raw, L), raw };
            else if (!kept.length) status = { kind: 'error', text: L.err(L.allFiltered), raw };
            else if (at !== -1) {
                const fresh = { ...src, name: kept[0].name, note: kept[0].note, read: kept[0].read, pieces: kept[0].pieces };
                if (!fresh.pieces) delete fresh.pieces;
                // Variants hanging under the old name no longer fit, so they go with it.
                const depth = src.depth || 0;
                let end = at + 1;
                while (end < results.length && (results[end].depth || 0) > depth) end++;
                results.splice(at, end - at, fresh);
                rememberNames(memoryNames(fresh), st); refreshHistory();
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

    // Swap one part of a full name (keep "Holloway", swap "Mira").
    async function rerollPiece(src, k) {
        if (busy || refining || !results.includes(src)) return;
        const piece = src.pieces?.[k];
        if (!piece || piece.fixed) return;
        const st = settings();
        const L = T();
        const form = src.form || st.form;
        const avoid = [...new Set([...avoidList(st), ...results.flatMap(memoryNames)])];
        const reading = !!st.showReading;
        const messages = buildPieceMessages(src, piece.role, form, { lang: detectLang(), avoid, reading });
        const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const job = { src, ctl, kind: 'piece' };
        refining = job;
        menuFor = null;
        status = { kind: 'busy', text: '' }; rawOpen = false;
        renderResultsOnly();
        try {
            const raw = await requestLLM(messages, { profileId: st.profileId, sendPreset: !!st.sendPreset, maxTokens: tokensFor(1, st), signal: ctl?.signal });
            if (refining !== job) return;
            const parsed = parseNames(raw);
            const text = cleanPiece(parsed[0]?.name);
            const banned = new Set(avoid.map(a => a.toLowerCase()));
            if (!text) status = { kind: 'error', text: failText(raw, L), raw };
            else if (text.toLowerCase() === piece.text.toLowerCase() || (NAME_ROLES.includes(piece.role) && banned.has(text.toLowerCase()))
                || likeWords(form).some(w => w.toLowerCase() === text.toLowerCase())
                || (st.wordNames === 'filter' && WORD_CHECK_ROLES.includes(piece.role) && WORD_NAMES.has(text.toLowerCase()))) {
                status = { kind: 'error', text: L.err(L.allFiltered) };
            } else if (results.includes(src) && src.pieces[k] === piece) {
                src.pieces = src.pieces.map((p, j) => (j === k ? { ...p, text } : p));
                src.name = joinPieces(src.pieces);
                src.read = reading ? String(parsed[0].read || '').slice(0, 80) : '';
                if (NAME_ROLES.includes(piece.role)) { rememberNames([text], st); refreshHistory(); }
                save();
                status = { kind: 'ok', text: L.pieceRerolled };
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
            <input id="${id('tokens')}" class="text_pole" type="number" min="200" max="16000" step="100" data-tbd-set="tokens">
            <small>${escapeHtml(L.sTokensHint)}</small>
            <label for="${id('theme')}">${escapeHtml(L.sTheme)}</label>${sel('theme', optionList(L.th, st.theme))}
            <label class="checkbox_label"><input id="${id('fx')}" type="checkbox" data-tbd-set="fx"><span>${escapeHtml(L.sEffects)}</span></label>
            <label class="checkbox_label"><input id="${id('reading')}" type="checkbox" data-tbd-set="reading"><span>${escapeHtml(L.sReading)}</span></label>
            <label for="${id('words')}">${escapeHtml(L.sWords)}</label>${sel('words', optionList(L.sWordOpts, st.wordNames))}
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
            lang: st.language, profile: st.profileId, words: st.wordNames, count: st.count, tokens: st.maxTokens, theme: st.theme, ban: st.banList,
        };
        const checks = { fx: !!st.effects, reading: !!st.showReading, hist: !!st.rememberHistory, preset: !!st.sendPreset };
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
            case 'tokens': st.maxTokens = clampInt($el.val(), 200, 16000, DEFAULTS.maxTokens); $el.val(st.maxTokens); break;
            case 'theme': st.theme = THEMES.includes($el.val()) ? $el.val() : 'st'; save(); render(); syncSettingFields(); return;
            case 'fx': st.effects = !!$el.prop('checked'); save(); render(); syncSettingFields(); return;
            case 'reading': st.showReading = !!$el.prop('checked'); save(); render(); syncSettingFields(); return;
            case 'words': st.wordNames = $el.val() === 'filter' ? 'filter' : 'mark'; save(); renderResultsOnly(); syncSettingFields(); return;
            case 'hist': st.rememberHistory = !!$el.prop('checked'); break;
            case 'preset': st.sendPreset = !!$el.prop('checked'); break;
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
        $doc.on('change', '#tbd_gender, #tbd_length, #tbd_sound, #tbd_custom, #tbd_must, #tbd_like, #tbd_likemode, #tbd_kindtext, #tbd_fixed', readForm);
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
            const key = $(this).data('chip') === 'part' ? 'parts' : 'extras';
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
        };
    } else {
        if (typeof $ === 'function' && document.body) settingsSlot();
        jQuery(() => init());
    }
})();
