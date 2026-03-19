# Armenian Transliteration

A TypeScript library for transliterating Armenian text to Latin characters.

## Features

- Transliterate Armenian words and text to Latin characters
- Preserve original casing (lowercase, uppercase, title case)
- Handle Armenian ligatures (ﬓ, ﬔ, ﬕ, ﬖ, ﬗ)
- Convert Armenian punctuation to English equivalents
- Process mixed text with both Armenian and non-Armenian characters

## Usage

```typescript
import transliterate from "armenian-transliteration";

transliterate("Հայաստան"); // "Hayastan"
transliterate("ԲԱՐԵՓՈԽՈՒՄ"); // "BAREPXUM"
transliterate("ողջույն, աշխարհ"); // "vołčyun, ašxarh"
```

## Acknowledgements

Based on
[lobotomoe/armenian-transliteration](https://github.com/lobotomoe/armenian-transliteration/)
