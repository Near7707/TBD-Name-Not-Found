# TBD — Name Not Found

**English** | [한국어](README.ko.md)

> `404 — Name Not Found. Let's make one!`

A SillyTavern extension that invents names for people, places, shops and items.

AI models tend to give the same few names no matter which one you use. TBD rolls the randomness itself: every name gets its own seed (start letter, syllable count, ending sound, texture, a random "spark" word), so a batch spreads out instead of clustering around the usual picks. Overused AI names and names you've already received are avoided automatically.

## Features (v0.1.6)

- Opens from the wand menu (✨) → **TBD: Name generator**
- Conditions: target (person / place / shop / item / other), vibe (presets or your own words), gender feel, length, sound feel, letters the name must contain
- Kind for places, shops and items (city, planet, bakery, tavern, ring, potion…) or your own words; "Other" asks what you're naming
- The vibe leads: random inspiration words are picked per vibe, places are told not to sound like people and may use real words (Blackwater, Salt Flats), and a bare dictionary word on its own is avoided
- How to read each name, next to it: Korean letters in Korean, a stress respelling in English (e.g. KWIL-uh). Can be turned off
- 1–30 names per search (default 5), each with a short note
- Copy a name, or drop it into the chat input at the cursor
- Reshape a name's sound (✨ button next to it): softer, harder, sharper, brighter, darker, shorter or longer. You get 3 variants under the original, and variants can be reshaped again
- Swap just one name (🔄 next to it): a variant is remade the same way it was made; a first-round name is remade with the search it came from
- Sound groups follow phonetics: soft = l, r, m, n, w, y and vowels; hard = k, t, p, d, g, b; sharp = s, z, x, f, v, sh, th; bright = i, e; dark = o, u, a. The AI judges by sound, not spelling
- Uses the current API or a connection profile you pick
- Avoid list: common AI clichés + your own list + names you got before (can be turned off or cleared)
- Themes: Follow SillyTavern (default), Terminal, Blue screen, Kernel panic, Glass (dark), Glass (clear), Old error box, Warning tape, Neon glitch
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
| Names per search | 1–30 |
| Max response tokens | Raised automatically for big batches. Thinking models may need more |
| Theme / Moving effects | Look of the window |
| Show how to read each name | Reading next to each name (on by default) |
| Avoid names I already got | Remembers recent results so they don't come back |
| Names to always avoid | Your own list, separated by commas or new lines |

## Planned

- Name pools by root (Latin, Old English, Norman/French, Germanic, Celtic…) × kind (noble houses, monastic/saints, place names, given names)
- "Mix" mode that blends several roots into one name, with a ratio slider
- Random-only mode that works without any API
- Real names from Wikidata, a "dig deeper into this root" button, favorites, and skipping names already in your chat or lorebook
- More themes

## Running tests

```
node --test tests/*.cjs
```

## License

[AGPL-3.0](LICENSE)
