# Arabic Transliteration

Convert Arabic script (Arabic, Farsi, Urdu) to romanized Latin text.

## Features

- Supports Arabic, Farsi, and Urdu transliteration
- Handles diacritical marks and special characters
- Proper spacing after punctuation

## Usage

```typescript
import { arabicRomanize } from "arabic-transliteration";

arabicRomanize("مرحبا");
// Output: "marḥaba"

arabicRomanize("الله");
// Output: "Allāh"
```

## Acknowledgements

Based on work from:

- [Vyshantha/arabic-transliterate](https://github.com/Vyshantha/arabic-transliterate)
- [rejyoung/romanize-string](https://github.com/rejyoung/romanize-string)
