# TBD — Name Not Found

**English** | [한국어](README.ko.md)

> `404 — Name Not Found. Let's make one!`

A SillyTavern extension that invents names for people, places, shops and items.

AI models tend to give the same few names no matter which one you use. TBD rolls the randomness itself: every name gets its own seed (start letter, syllable count, ending sound, texture, a random "spark" word), so a batch spreads out instead of clustering around the usual picks. Overused AI names and names you've already received are avoided automatically.

## Features (v0.1.15)

- Opens from the wand menu (✨) → **TBD: Name generator**
- Conditions: target (person / place / shop / item / other), vibe (presets or your own words), gender feel, length, sound feel, letters the name must contain
- "Like this": type a name or word (Elric, Aldous) and get names that sound like it, or share its feel (same flavor and era, other sounds). The word itself never comes back. For full names it steers the given name
- Kind for places, shops and items, in everyday groups that fit any setting (street, station, repair shop, florist, vehicle, medicine, gadget…) or your own words
- Full names for people: pick the parts (given / middle / family) and extras (title, noble particle, place of origin, father's-name surname, nickname, religious name, codename, alias). Family names follow the vibe. Keep one family name to name a whole family. Extras fold into one line and show which ones are on
- Each part of a full name shows below it: tap to copy just that part, 🔄 to swap just that part
- An optional details box for places, shops and items (e.g. "a half-broken military drone"); "Other" asks what you're naming. With no kind picked, the details say what the thing itself is ("bread" names a bread, not a bakery or a bread basket)
- The vibe leads: random inspiration words are picked per vibe and never repeat in one batch, places are told not to sound like people and may use real words (Blackwater, Salt Flats), and a bare dictionary word on its own is avoided
- People sound like their setting too: sci-fi, modern, medieval, gothic and cozy each get their own name endings, rules and examples, so non-fantasy names don't drift into fantasy
- What you type wins: with your own vibe or details, no random inspiration word is added, and inspiration words never get pasted into the name as unrelated objects
- Names that are plain English words (Wren, Ox) get a small "word" mark instead of being hidden, so you can keep them or reshape them with ✨. A setting can leave them out instead. Only given/middle names and single-word person, place and other names are checked; exact matches only (Wrenna passes)
- How to read each name, next to it: Korean letters in Korean, a stress respelling in English (e.g. KWIL-uh). Can be turned off
- 1–30 names per search (default 5), each with a short note
- Copy a name with one tap
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
| Send the profile's preset too | Off by default. A roleplay preset can make the AI answer empty or in character; turn on only if your model needs it |
| Names per search | 1–30 |
| Max response tokens | Default 2000, raised automatically for big batches. Thinking models may need more; lower it for a very small local model |
| Theme / Moving effects | Look of the window |
| Show how to read each name | Reading next to each name (on by default) |
| Names that are plain English words | Mark them (default) or leave them out |
| Avoid names I already got | Remembers recent results so they don't come back |
| Names to always avoid | Your own list, separated by commas or new lines |

## Planned

- Name pools by root (Latin, Old English, Norman/French, Germanic, Celtic…) × kind (noble houses, monastic/saints, place names, given names)
- "Mix" mode that blends several roots into one name, with a ratio slider
- Random-only mode that works without any API
- Check a name against Wikipedia, with a Google search link
- Real names from Wikidata, a "dig deeper into this root" button, favorites, and skipping names already in your chat or lorebook
- More themes

## Running tests

```
node --test tests/*.cjs
```

## License

[AGPL-3.0](LICENSE)
