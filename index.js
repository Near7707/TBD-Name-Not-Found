// TBD — Name Not Found v0.1.0
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
            target: 'Target', vibe: 'Vibe', gender: 'Gender', length: 'Length', mustContain: 'Must contain',
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
            // settings
            sTitle: 'TBD — Name Not Found',
            sLang: 'Language', sLangAuto: 'Follow SillyTavern',
            sProfile: 'Connection profile', sProfileCurrent: '(Use current API)', sProfileMissing: '⚠️ Profile not found — pick again',
            sCount: 'Names per search (1–30)',
            sTokens: 'Max response tokens',
            sTokensHint: 'Raised automatically for big batches. Thinking models may need more.',
            sTheme: 'Theme', sEffects: 'Moving effects (glitch, flicker, scanlines)',
            sHistory: 'Avoid names I already got',
            sHistoryClear: 'Forget past names', sHistoryCleared: 'Past names forgotten',
            sBan: 'Names to always avoid (comma or new line)',
            sBanHint: 'Common AI picks are already avoided.',
            th: { st: 'Follow SillyTavern', terminal: 'Terminal', bsod: 'Blue screen', panic: 'Kernel panic' },
        },
        ko: {
            menu: 'TBD: 이름 짓기',
            tagline: 'Name Not Found. 하나 지어 볼까요?',
            target: '대상', vibe: '분위기', gender: '성별', length: '길이', mustContain: '꼭 들어갈 글자',
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
            sTitle: 'TBD — Name Not Found',
            sLang: '언어', sLangAuto: '실리태번 따라가기',
            sProfile: '연결 프로필', sProfileCurrent: '(현재 연결된 API 사용)', sProfileMissing: '⚠️ 찾을 수 없는 프로필 — 다시 골라 주세요',
            sCount: '한 번에 뽑을 이름 수 (1~30)',
            sTokens: '최대 응답 토큰',
            sTokensHint: '많이 뽑을 땐 자동으로 늘어나요. 생각하는 모델은 더 필요할 수 있어요.',
            sTheme: '테마', sEffects: '움직이는 효과 (글리치, 깜빡임, 스캔라인)',
            sHistory: '이미 나온 이름은 피하기',
            sHistoryClear: '지난 이름 잊기', sHistoryCleared: '지난 이름을 잊었어요',
            sBan: '항상 피할 이름 (쉼표나 줄바꿈으로 구분)',
            sBanHint: 'AI가 자주 내는 뻔한 이름은 이미 피하고 있어요.',
            th: { st: '실리태번 따라가기', terminal: '터미널', bsod: '블루스크린', panic: '커널 패닉' },
        },
    };

    // How each theme talks while it works.
    const THEME_TEXT = {
        st:       { code: '404', title: 'TBD', loading: ['404… searching'] },
        terminal: { code: '404', title: 'TBD > name not found_', loading: ['$ find --name', '$ scanning syllables…'] },
        bsod:     { code: ':(', title: 'TBD ran into a missing name', loading: ['Collecting name info… 0% complete', 'Collecting name info… 37% complete', 'Collecting name info… 82% complete'] },
        panic:    { code: 'FATAL 0x404', title: 'KERNEL PANIC — TBD', loading: ['> name == undefined', '> memory dump… OK', '> recovering name from fragments_'] },
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
    const ENDINGS = ['-an', '-el', '-ick', '-or', '-wyn', '-ard', '-is', '-et', '-um', '-ow', '-ane', '-ith', '-ock', '-ess', '-ry', '-ay', '-ond', '-ix', '-ler', '-ia'];
    const TEXTURES = ['soft', 'sharp', 'earthy', 'airy', 'heavy', 'bright', 'old-fashioned', 'clipped', 'rolling', 'rough', 'playful', 'stern'];
    const SPARKS = [
        'moss', 'rusted bell', 'night train', 'salt', 'lantern', 'thistle', 'flint', 'river ford', 'wool', 'copper',
        'chalk', 'hearth', 'ash', 'frost', 'bramble', 'ledger', 'kiln', 'harbor', 'owl', 'rye', 'slate', 'tallow',
        'quill', 'cistern', 'orchard', 'gravel', 'ember', 'marsh', 'loom', 'anvil', 'cider', 'bell tower', 'ferry',
        'wax seal', 'shale', 'heron', 'nettle', 'millstone', 'pewter', 'compass', 'clover', 'tidepool', 'sundial',
        'barley', 'iron gate', 'static', 'neon sign', 'fuse box', 'radio tower', 'chess clock',
    ];
    const SYLLABLES = { short: [1, 2], medium: [2, 3], long: [3, 4], any: [1, 4] };

    function pick(arr, rnd = Math.random) { return arr[Math.floor(rnd() * arr.length)]; }

    // One seed per name. Each name gets its own nudge so the batch spreads out.
    function rollSeeds(count, opts = {}, rnd = Math.random) {
        const [lo, hi] = SYLLABLES[opts.length] || SYLLABLES.any;
        const seeds = [];
        for (let i = 0; i < count; i++) {
            const seed = {
                syllables: lo + Math.floor(rnd() * (hi - lo + 1)),
                texture: pick(TEXTURES, rnd),
                spark: pick(SPARKS, rnd),
            };
            // A forced start letter would fight "must contain", so skip it then.
            if (!opts.mustContain) seed.start = pick(START_LETTERS, rnd);
            // Only nudge the ending about half the time; always forcing it sounds samey too.
            if (rnd() < 0.5) seed.ending = pick(ENDINGS, rnd);
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
        form: { target: 'person', vibe: 'fantasy', customVibe: '', gender: 'any', length: 'any', mustContain: '' },
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
        place: 'a place (town, region, landmark or street)',
        shop: 'a shop, inn, tavern or business',
        item: 'an item, artifact, weapon, potion or tool',
        other: 'something in a story (group, ship, creature, event…)',
    };
    const VIBE_DESC = {
        fantasy: 'fantasy', medieval: 'grounded medieval European', scifi: 'sci-fi / cyberpunk',
        modern: 'modern-day', gothic: 'gothic, dark and old', cozy: 'cozy, whimsical and warm',
    };

    function buildMessages(form, seeds, opts = {}) {
        const lang = opts.lang || 'en';
        const avoid = opts.avoid || [];
        const vibe = form.vibe === 'custom' ? (String(form.customVibe || '').trim() || 'any') : (VIBE_DESC[form.vibe] || 'any');
        const lines = [];
        lines.push(`Invent ${seeds.length} original name${seeds.length === 1 ? '' : 's'} for ${TARGET_DESC[form.target] || TARGET_DESC.other}.`);
        lines.push(`Setting / vibe: ${vibe}.`);
        lines.push('Style: Western, English-readable spelling.');
        if (form.target === 'person' && form.gender && form.gender !== 'any') lines.push(`Gender feel: ${form.gender}.`);
        if (form.mustContain) lines.push(`Every name must contain the letters "${String(form.mustContain).trim()}" (any position).`);
        lines.push('');
        lines.push('Each name has its own seed. Follow the seed closely; it is there to keep the names varied.');
        seeds.forEach((s, i) => {
            const parts = [];
            if (s.start) parts.push(`starts with "${s.start}"`);
            parts.push(`${s.syllables} syllable${s.syllables === 1 ? '' : 's'}`);
            if (s.ending) parts.push(`ends with a "${s.ending}" sound`);
            parts.push(`${s.texture} sound`);
            parts.push(`loosely inspired by "${s.spark}"`);
            lines.push(`${i + 1}. ${parts.join(', ')}`);
        });
        if (avoid.length) {
            lines.push('');
            lines.push(`Do NOT use these names or close variants: ${avoid.join(', ')}.`);
        }
        lines.push('');
        lines.push(`For each name add a short note (under 12 words) in ${lang === 'ko' ? 'Korean' : 'English'} about its feel or made-up roots. Don't claim a real meaning unless you are sure.`);
        lines.push('Reply with ONLY a JSON array, nothing else:');
        lines.push('[{"name": "...", "note": "..."}]');
        return [
            { role: 'system', content: 'You are a naming assistant for fiction writers. You invent fresh, pronounceable names and avoid overused fantasy clichés.' },
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
                        else if (it && typeof it === 'object') out.push({ name: String(it.name ?? ''), note: String(it.note ?? it.meaning ?? '') });
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
            .map(n => ({ name: n.name.replace(/^["'*\s]+|["'*\s]+$/g, '').trim(), note: n.note.trim() }))
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
        return Math.max(clampInt(st.maxTokens, 200, 16000, 1000), 300 + count * 80);
    }

    // ---------- state ----------
    let busy = false;
    let controller = null;
    let results = [];
    let status = { kind: 'idle', text: '' };
    let loadingTimer = null;

    // ---------- the panel ----------
    function optionList(map, current) {
        return Object.entries(map).map(([k, label]) =>
            `<option value="${escapeHtml(k)}"${k === current ? ' selected' : ''}>${escapeHtml(label)}</option>`).join('');
    }

    function headerHtml(theme) {
        const tt = THEME_TEXT[theme] || THEME_TEXT.st;
        const L = T();
        const closeBtn = `<button id="tbd_close" class="tbd-icon-btn" title="${escapeHtml(L.close)}" aria-label="${escapeHtml(L.close)}"><i class="fa-solid fa-xmark"></i></button>`;
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

    function formHtml(form) {
        const L = T();
        return `<div class="tbd-form">
            <label>${escapeHtml(L.target)}<select id="tbd_target" class="text_pole">${optionList(L.t, form.target)}</select></label>
            <label>${escapeHtml(L.vibe)}<select id="tbd_vibe" class="text_pole">${optionList(L.v, form.vibe)}</select></label>
            <label class="tbd-wide" id="tbd_custom_wrap"${form.vibe === 'custom' ? '' : ' hidden'}><input id="tbd_custom" class="text_pole" type="text" maxlength="80" placeholder="${escapeHtml(L.customVibePh)}" value="${escapeHtml(form.customVibe)}"></label>
            <label id="tbd_gender_wrap"${form.target === 'person' ? '' : ' hidden'}>${escapeHtml(L.gender)}<select id="tbd_gender" class="text_pole">${optionList(L.g, form.gender)}</select></label>
            <label>${escapeHtml(L.length)}<select id="tbd_length" class="text_pole">${optionList(L.l, form.length)}</select></label>
            <label class="tbd-wide">${escapeHtml(L.mustContain)}<input id="tbd_must" class="text_pole" type="text" maxlength="20" placeholder="${escapeHtml(L.mustContainPh)}" value="${escapeHtml(form.mustContain)}"></label>
            <button id="tbd_go" class="tbd-go menu_button">${escapeHtml(busy ? L.cancel : L.find)}</button>
        </div>`;
    }

    function resultsHtml() {
        const L = T();
        if (busy) return `<div class="tbd-log" id="tbd_log"></div>`;
        if (!results.length) return `<div class="tbd-empty">${escapeHtml(L.empty)}</div>`;
        return results.map((r, i) => `<div class="tbd-row" data-i="${i}">
                <div class="tbd-row-text"><div class="tbd-name">${escapeHtml(r.name)}</div>${r.note ? `<div class="tbd-note">${escapeHtml(r.note)}</div>` : ''}</div>
                <button class="tbd-icon-btn tbd-copy" title="${escapeHtml(L.copy)}" aria-label="${escapeHtml(L.copy)}"><i class="fa-regular fa-copy"></i></button>
                <button class="tbd-icon-btn tbd-insert" title="${escapeHtml(L.insert)}" aria-label="${escapeHtml(L.insert)}"><i class="fa-solid fa-pen-to-square"></i></button>
            </div>`).join('');
    }

    function footerHtml() {
        const L = T();
        const again = results.length && !busy ? `<button id="tbd_again" class="tbd-small-btn"><i class="fa-solid fa-rotate"></i> ${escapeHtml(L.again)}</button>` : '';
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
        render();
        $('#tbd_panel').show();
    }
    function closePanel() { $('#tbd_panel').hide(); }

    function readForm() {
        const st = settings();
        st.form = {
            target: $('#tbd_target').val() || 'person',
            vibe: $('#tbd_vibe').val() || 'fantasy',
            customVibe: String($('#tbd_custom').val() || '').slice(0, 80),
            gender: $('#tbd_gender').val() || 'any',
            length: $('#tbd_length').val() || 'any',
            mustContain: String($('#tbd_must').val() || '').trim().slice(0, 20),
        };
        save();
        return st.form;
    }

    // ---------- actions ----------
    async function generate() {
        if (busy) { cancel(); return; }
        const st = settings();
        const form = readForm();
        const lang = detectLang();
        const count = st.count;
        const avoid = avoidList(st);
        const messages = buildMessages(form, rollSeeds(count, form), { lang, avoid });

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
                results = kept.slice(0, count);
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

    // ---------- settings drawer ----------
    function settingsHtml() {
        const L = T();
        const st = settings();
        const themeOpts = optionList(L.th, st.theme);
        return `<div id="tbd_settings" class="tbd-settings">
            <div class="inline-drawer">
                <div class="inline-drawer-toggle inline-drawer-header">
                    <b>${escapeHtml(L.sTitle)}</b>
                    <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
                </div>
                <div class="inline-drawer-content">
                    <label for="tbd_s_lang">${escapeHtml(L.sLang)}</label>
                    <select id="tbd_s_lang" class="text_pole">
                        <option value="auto">${escapeHtml(L.sLangAuto)}</option>
                        <option value="en">English</option>
                        <option value="ko">한국어</option>
                    </select>
                    <label for="tbd_s_profile">${escapeHtml(L.sProfile)}</label>
                    <select id="tbd_s_profile" class="text_pole"></select>
                    <label for="tbd_s_count">${escapeHtml(L.sCount)}</label>
                    <input id="tbd_s_count" class="text_pole" type="number" min="1" max="30" step="1">
                    <label for="tbd_s_tokens">${escapeHtml(L.sTokens)}</label>
                    <input id="tbd_s_tokens" class="text_pole" type="number" min="200" max="16000" step="100">
                    <small>${escapeHtml(L.sTokensHint)}</small>
                    <label for="tbd_s_theme">${escapeHtml(L.sTheme)}</label>
                    <select id="tbd_s_theme" class="text_pole">${themeOpts}</select>
                    <label class="checkbox_label"><input id="tbd_s_fx" type="checkbox"><span>${escapeHtml(L.sEffects)}</span></label>
                    <label class="checkbox_label"><input id="tbd_s_hist" type="checkbox"><span>${escapeHtml(L.sHistory)}</span></label>
                    <div><button id="tbd_s_hist_clear" class="menu_button">${escapeHtml(L.sHistoryClear)}</button></div>
                    <label for="tbd_s_ban">${escapeHtml(L.sBan)}</label>
                    <textarea id="tbd_s_ban" class="text_pole" rows="3"></textarea>
                    <small>${escapeHtml(L.sBanHint)}</small>
                </div>
            </div>
        </div>`;
    }

    function fillProfileSelect() {
        const st = settings();
        const L = T();
        const $sel = $('#tbd_s_profile');
        $sel.empty();
        $sel.append(`<option value="">${escapeHtml(L.sProfileCurrent)}</option>`);
        const profiles = getProfiles();
        for (const p of profiles) $sel.append(`<option value="${escapeHtml(p.id)}">${escapeHtml(p.name)}</option>`);
        // Keep the saved choice even if the list is empty right now.
        if (st.profileId && !profiles.some(p => p.id === st.profileId)) {
            $sel.append(`<option value="${escapeHtml(st.profileId)}">${escapeHtml(L.sProfileMissing)}</option>`);
        }
        $sel.val(st.profileId);
    }

    function bindSettings() {
        const st = settings();
        $('#tbd_s_lang').val(st.language).on('change', function () {
            st.language = $(this).val();
            save();
            // Rebuild the drawer and menu so the words switch language.
            $('#tbd_settings').remove();
            $('#extensions_settings2').append(settingsHtml());
            bindSettings();
            $('#tbd_menu_label').text(T().menu);
            render();
        });
        fillProfileSelect();
        $('#tbd_s_profile').on('focus', fillProfileSelect).on('change', function () { st.profileId = $(this).val(); save(); });
        $('#tbd_s_count').val(st.count).on('change', function () { st.count = clampInt($(this).val(), 1, 30, 5); $(this).val(st.count); save(); });
        $('#tbd_s_tokens').val(st.maxTokens).on('change', function () { st.maxTokens = clampInt($(this).val(), 200, 16000, 1000); $(this).val(st.maxTokens); save(); });
        $('#tbd_s_theme').val(st.theme).on('change', function () { st.theme = THEMES.includes($(this).val()) ? $(this).val() : 'st'; save(); render(); });
        $('#tbd_s_fx').prop('checked', !!st.effects).on('change', function () { st.effects = !!$(this).prop('checked'); save(); render(); });
        $('#tbd_s_hist').prop('checked', !!st.rememberHistory).on('change', function () { st.rememberHistory = !!$(this).prop('checked'); save(); });
        $('#tbd_s_hist_clear').on('click', () => { st.history = []; save(); toastr.info(T().sHistoryCleared, 'TBD'); });
        $('#tbd_s_ban').val(st.banList).on('input', function () { st.banList = String($(this).val() || ''); save(); });
    }

    // ---------- start ----------
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
        $('#extensions_settings2').append(settingsHtml());
        bindSettings();

        if (!addMenuItem()) {
            // The wand menu can appear a little later on slow loads.
            let tries = 0;
            const timer = setInterval(() => { if (addMenuItem() || ++tries > 20) clearInterval(timer); }, 500);
        }

        const $doc = $(document);
        $doc.on('click', '#tbd_menu', () => openPanel());
        $doc.on('click', '#tbd_close', closePanel);
        $doc.on('click', '#tbd_go', generate);
        $doc.on('click', '#tbd_again', generate);
        $doc.on('change', '#tbd_target', function () { $('#tbd_gender_wrap').prop('hidden', $(this).val() !== 'person'); readForm(); });
        $doc.on('change', '#tbd_vibe', function () { $('#tbd_custom_wrap').prop('hidden', $(this).val() !== 'custom'); readForm(); });
        $doc.on('change', '#tbd_gender, #tbd_length, #tbd_custom, #tbd_must', readForm);
        $doc.on('keydown', '#tbd_must, #tbd_custom', (e) => { if (e.key === 'Enter') { e.preventDefault(); generate(); } });
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
            rollSeeds, buildMessages, parseNames, filterNames, avoidList, rememberNames, detectLang,
            tokensFor, insertAtCursor, settings, STRINGS, THEMES, CLICHES,
        };
    } else {
        jQuery(() => init());
    }
})();
