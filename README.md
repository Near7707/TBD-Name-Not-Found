# TBD — Name Not Found

**English** | [한국어](README.ko.md)

> `404 — Name Not Found. Let's make one!`

A SillyTavern extension that invents names for people, places, shops and items.

AI models tend to give the same few names no matter which one you use. TBD rolls the randomness itself: every name gets its own seed (start letter, syllable count, ending sound, texture, a random "spark" word), so a batch spreads out instead of clustering around the usual picks (the AI is also asked not to run one sound through most of the names). Overused AI names and names you've already received are avoided automatically.

## Features (v0.2.22)

- Opens from the wand menu (✨) → **TBD: Name generator**
- **Made with: AI, Cache or Cache + AI** (people and places). **Cache** builds names from fragments kept inside the extension, with no AI and no cost: pick roots (Latin, Old English, Norman / French, Germanic, Celtic, Norse, Ancient Greek, Slavic) and, for people, the kind of name: common name, noble house, monastic / saint, royal / ruler (`King Godwald the Good`, `Rex Marus II`, `Duc Huault le Hardi`, `Herzogin Helmgard die Große`: several ruler titles per root, and Norman / German bynames in their own language), warrior / byname (`Thorgeir Ironhand`) or scholar (Latinized, `Ethelwinus Ashfordensis`). Common family names come from five kinds: father's name, home place, where they lived (`Atwood` = at the wood), trade (`Thatcher`) or looks (`Armstrong`), and the fragments line says which. Places now and then get an extra word (`Great …`, `…-on-Sea`, `Ober…`) or a saint (`St. Edwin's`, `Kilbranan`). The meanings were checked against name and place-name references. Places follow the place kind (forest, lake, mountain…). Each name shows its **fragments** and what they mean, e.g. `Ash ash tree + ford river crossing · Old English`. Roots and kinds can all be switched off while you change them (Find then asks for one). A family name never reuses a part of the given name (Greek -os parts included). One list never gives the same byname twice while there are others left, and rulers mostly get small numbers (II, III; IX is rare). With several roots, pick **Split** (each name takes one root in turn, the default) or **Merge** (each name mixes two different roots: a given name takes its first part from one and its ending from the other, a place its head from one and its tail from the other; the family name, title and bynames follow one of the two). The fragments line then says which root each fragment came from, e.g. `Pont bridge (Latin) + rigg ridge (Norse) · Latin + Norse`, and 🔄 keeps the same two roots. Length, sound feel and must-contain letters still apply; vibe, "Like this" and real names are hidden in Cache mode. 🔄 and swapping a part stay in the cache; ✨ uses the AI. Cache names have no reading yet
- **Cache + AI** (the third "Made with" button): the cache builds each name, then one AI request polishes the sound lightly (a letter or two, or where two parts meet; the first and last letters always stay) and adds a reading and a short note about the feel. Meanings still come only from the cache, never the AI. Titles, particles, bynames and a kept family name are left alone. A name the AI really changed is marked **AI polished**, and the fragments line ends with `was: …`; a name it left as it was stays **CACHE**, with the AI's reading and note. If the AI fails, you still get the plain Cache names. 🔄 and swapping a part are polished too; ✨ works as before
- **Copy for review**: a small button next to the status line copies every name on screen as plain text: the choices it was made with (once per group), each name with its marks, gender and kind of name, for AI names the seed each one was asked for (roots, start, syllables, kind of family name), and for Cache names every part with its fragments, meanings (in English) and roots. Paste it into a chat to have names in a language you don't read checked, without screenshots
- **Found ⭐**: tap ☆ next to a name to keep it. The **Found** tab at the top lists kept names newest first, with filters by target (person, place…), copy and remove. A kept name keeps its reading, note, nicknames, marks and fragments. Kept names never come back as new results. **Export** saves Found as a file (a backup, or to move it); **Import** adds names from such a file and skips ones you already have. Up to 500 names, saved in SillyTavern's settings
- Conditions: target (person / place / shop / item / other), vibe (presets or your own words), gender feel, length. Less-used ones (sound feel, letters the name must contain, "Like this", real names, word names) fold into **More options**; folded, the line still shows what you changed
- "Like this": type a name or word (Elric, Aldous) and get names that sound like it (similar rhythm, and each name echoes a different part: start, vowels, ending…; it wins over the vibe), or share its feel (same flavor and era, other sounds). The word itself never comes back. For full names it steers the given name
- Kind for places, shops and items, in everyday groups that fit any setting (street, station, repair shop, florist, vehicle, medicine, gadget…) or your own words
- Full names for people: pick the parts (given / middle / family) and extras (title, noble particle, place of origin, father's-name surname, nickname, religious name, codename, alias). Family names follow the vibe. Keep one family name to name a whole family. Extras fold into one line and show which ones are on. With only the given name on, no family name comes back
- Each part of a full name shows below it: tap to copy just that part, 🔄 to swap just that part
- An optional details box for places, shops and items (e.g. "a half-broken military drone"); "Other" asks what you're naming. With no kind picked, the details say what the thing itself is ("bread" names a bread, not a bakery or a bread basket)
- The vibe leads: random inspiration words are picked per vibe and never repeat in one batch, places are told not to sound like people and may use real words (Blackwater, Salt Flats), and a bare dictionary word on its own is avoided
- Vibes: fantasy, medieval, sci-fi, modern, gothic, cozy, myth & legend, fantasy game, Lovecraftian, weird, or your own words. Lovecraftian names are eldritch (even for people), and with a real-names choice people become the plain old-town folk of those stories; weird names can be as strange as they like but stay sayable
- Game-style favorites (Shadowfang) get the small "AI favorite" mark, and names from Lovecraft's own stories (Innsmouth) get a "Lovecraft" mark. Both are only marked, never hidden
- People sound like their setting too: every preset vibe gets their own name endings, rules and examples, so non-fantasy names don't drift into fantasy
- What you type wins: with your own vibe or details, no random inspiration word is added, and inspiration words never get pasted into the name as unrelated objects
- Names that are plain English words (Wren, Ox) get a small "word" mark instead of being hidden, so you can keep them or reshape them with ✨. A setting can leave them out instead. Only given/middle names and single-word person, place and other names are checked; exact matches only (Wrenna passes)
- **Real names** (people): invented only (default), close to real names, mix in real names, or real names only. In myth "real" means names from real legends, in weird rare real names that sound strange, in fantasy game real names used like game heroes. It applies to given, middle and family names; extras like codenames stay invented, and a kept family name stays as it is. Names the AI says are real get a small "real" mark (the AI can be wrong: check with 🔎). With a real-names choice, a real name that is also a word (Rose) stays even when plain words are left out; with "real names only", common AI picks (Luna) are marked instead of avoided
- **Word names** (people, AI): Avoid (default, invented names as before) / Mix in (about one name in three) / Mostly (nearly all). A word name is made from a pretty real word from any language (English too), kept as it is or lightly changed. With roots on, the word comes from those roots' languages. Each one gets a small mark with its meaning and language, like `word: star · Latin` (the AI's guess). It applies to the given name; family names follow their own choices. "Like this" words and "Real names only" win over it (the row says "Not used now"). Word names are never left out as plain words, and with "Mostly" common AI picks (Luna) are marked instead of avoided
- **Roots for the AI** (people and places, under "More options"): Any (default, no change) or one or more of the Cache roots. The AI then builds new names from those roots' word parts (not existing names, and no words from other languages; Latin stays classical Latin, not Italian or French; with any length, people get at least two syllables, so no blunt one-syllable names; each name is handed its own kind of family name in turn (place, father's name, looks, trade) and, with Merge, which of its two roots the family name's words come from, so they don't all come out alike or slip into English; Celtic names are each given one language, Welsh, Irish or Scottish Gaelic, so they don't mix or slip into English and Scots; Slavic family names take the feminine form for women), and the vibe only adjusts spelling and flavor. No random inspiration word is added then, so its object doesn't end up inside the name; with several roots, Split gives each name one in turn and Merge asks for two roots blended in each name (Cache and AI keep their own Split / Merge choice). No web search is needed: the AI already knows these roots. It may get meanings wrong, so notes describe only the feel and never claim what a name means (for real meanings, use Cache). When another choice says the opposite, only one goes to the AI: typed "Like this" words lead, and Lovecraftian invented people stay eldritch. The folded line then shows the roots crossed out
- **Nicknames** (setting, off by default): each person name also comes with 2–3 nicknames under it (never the name itself). Tap one to copy it
- How to read each name, next to it: Korean letters in Korean, a stress respelling in English (e.g. KWIL-uh). Can be turned off
- 1–30 names per search (default 5), each with a short note
- Copy a name with one tap
- **Check a name** (🔎 next to it): looks for a page with exactly the same name on Wikipedia, plus a Google search link. For a full name, the whole name and each part (given, middle, family) are checked; a kept family name and extras aren't. With the Korean interface, Korean Wikipedia is searched too, using the Korean reading. A page about the name itself ("a given name") just means people really use it. **Ask the AI too** asks whether it clashes with a famous brand, character or place, or means something bad in another language (marked as an AI guess). The name is sent to Wikipedia only when you tap 🔎 (or turn on automatic checks). This is not a legal trademark check
- Reshape a name's sound (✨ button next to it): softer, harder, sharper, brighter, darker, shorter or longer. You get 3 variants under the original, and variants can be reshaped again
- Swap just one name (🔄 next to it): a variant is remade the same way it was made; a first-round name is remade with the search it came from
- Sound groups follow phonetics: soft = l, r, m, n, w, y and vowels; hard = k, t, p, d, g, b; sharp = s, z, x, f, v, sh, th; bright = i, e; dark = o, u, a. The AI judges by sound, not spelling
- Uses the current API or a connection profile you pick
- If an answer gets cut off, the finished names are still kept and the status line says to raise max response tokens. If a thinking model uses up all its tokens on thinking, or the answer comes back empty, the status line says what to try
- When an answer can't be used, **See the answer** shows exactly what the AI sent back
- Avoid list: common AI clichés + your own list + names you got before (can be turned off or cleared). See past names in settings and forget them one by one. Only the AI clichés and your own list go to the AI; past and kept names are filtered out after the answer, so the AI has less to check
- Themes: Follow SillyTavern (default), Terminal, Blue screen, Kernel panic, Glass (dark), Glass (clear), Old error box, Warning tape, Neon glitch
- The top bar (⚙ and ✕) stays in place while you scroll
- Moving effects can be turned off; they're lighter on phones and respect "reduce motion"
- English and Korean interface

## Install

In SillyTavern: **Extensions → Install extension** and paste:

```
https://github.com/Near7707/TBD-Name-Not-Found
```

## Settings

Find **TBD — Name Not Found** in the Extensions panel, or press ⚙ next to ✕ in the window. Both show the same settings and stay in sync.

| Setting | What it does |
|---|---|
| Language | Follow SillyTavern, English, or Korean |
| Connection profile | Which API to ask. Empty = the one you're using now |
| Thinking effort | For thinking models. Default sends nothing; pick Low if a thinking model answers empty or slowly (it may spend every token on thinking). On a Custom (OpenAI-compatible) connection SillyTavern sends it only for OpenAI models, so use the service's own connection or a non-thinking model. Minimal asks the model not to think at all, so models that always think may refuse it: use Low then. If it seems to do nothing, another extension may be changing the request on its way out |
| Send the profile's preset too | Off by default. A roleplay preset can make the AI answer empty or in character; turn on only if your model needs it |
| Names per search | 1–30 |
| Max response tokens | Default 2000, raised automatically for big batches. Up to 65000. Thinking models may need more, but a very high limit can let them think for a long time: set it just high enough that answers aren't cut off. Lower it for a very small local model |
| Theme / Moving effects | Look of the window |
| Show how to read each name | Reading next to each name (on by default) |
| Show nicknames | 2–3 nicknames under each person name (off by default, uses a few more tokens) |
| Check new names automatically | Looks every new name up on Wikipedia and shows ⚠ only when a page has the same name (off by default) |
| Names that are plain English words | Mark them (default) or leave them out |
| Avoid names I already got | Remembers recent results so they don't come back |
| Names to always avoid | Your own list, separated by commas or new lines |

## Planned

- My cache for your own name lists
- Real names from Wikidata, a "dig deeper into this root" button, and skipping names already in your chat or lorebook
- More themes

## Running tests

```
node --test tests/*.cjs
```

## License

[AGPL-3.0](LICENSE)
