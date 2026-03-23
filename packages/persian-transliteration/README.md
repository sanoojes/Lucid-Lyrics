# Persian Transliteration

A TypeScript library for transliterating Persian text to Latin characters.

## Features

- Transliterate Persian words and text to Latin characters
- Handles Persian diacritics (fatha, kasra, damma, sukun)
- Preserves spaces, punctuation, and non-Persian characters

## Usage

```typescript
import romanizePersian from "persian-transliteration";

romanizePersian("سلام"); // "salām"
romanizePersian("ایران"); // "Irān"
romanizePersian("کتاب"); // "ketāb"
```
