# TBD — Name Not Found

**English** | [한국어](README.ko.md)

> `404 — Name Not Found. Let's make one!`

A SillyTavern extension that invents names for people, places, shops and items.

AI models tend to give the same few names no matter which one you use. TBD rolls the randomness itself: every name gets its own seed (start letter, syllable count, ending sound, texture, a random "spark" word), so a batch spreads out instead of clustering around the usual picks. Overused AI names and names you've already received are avoided automatically.

## Features (v0.2.0)

- Opens from the wand menu (✨) → **TBD: Name generator**
- **Made with: AI or Cache** (people and places). **Cache** builds names from fragments kept inside the extension, with no AI and no cost: pick roots (Latin, Old English, Norman / French, Germanic, Celtic, Norse) and, for people, the kind of name (common name, noble house, monastic / saint). Places follow the place kind (forest, lake, mountain…). Each name shows its **fragments** and what they mean, e.g. `Ash ash tree + ford river crossing · Old English`. With several roots, each name takes one root in turn. Length, sound feel and must-contain letters still apply; vibe, "Like this" and real names are hidden in Cache mode. 🔄 and swapping a part stay in the cache; ✨ uses the AI. Cache names have no reading yet
- Conditions: target (person / place / shop / item / other), vibe (presets or your own words), gender feel, length. Less-used ones (sound feel, letters the name must contain, "Like this", real names) fold into **More options**; folded, the line still shows what you changed
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
- **Nicknames** (setting, off by default): each person name also comes with 2–3 nicknames under it. Tap one to copy it
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
- Avoid list: common AI clichés + your own list + names you got before (can be turned off or cleared). See past names in settings and forget them one by one
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

- Cache + AI: fragments as a skeleton, the AI smooths the sound (with readings and notes)
- Several roots in one name ("mix"), and My cache for your own name lists
- Real names from Wikidata, a "dig deeper into this root" button, favorites, and skipping names already in your chat or lorebook
- More themes

## Running tests

```
node --test tests/*.cjs
```

## License

[AGPL-3.0](LICENSE)
