// From: https://github.com/greensock/GSAP/blob/e830e8fc16fafa10644a93d341613ef54133eb5f/src/SplitText.ts#L80
export const EMOJI_SAFE_REGEX: RegExp =
  /\p{RI}\p{RI}|\p{Emoji}(\p{EMod}|\u{FE0F}\u{20E3}?|[\u{E0020}-\u{E007E}]+\u{E007F})?(\u{200D}\p{Emoji}(\p{EMod}|\u{FE0F}\u{20E3}?|[\u{E0020}-\u{E007E}]+\u{E007F})?)*|./gu; // accommodates emojis like 👨‍👨‍👦‍👦 which the more simple /./gu RegExp does not.
// alternate regex for emojis:
// const EMOJI_SAFE_REGEX: RegExp = /\p{RI}\p{RI}|\p{Emoji}(\p{Emoji_Modifier}+|\u{FE0F}\u{20E3}?|[\u{E0020}-\u{E007E}]+\u{E007F})?(\u{200D}\p{Emoji}(\p{Emoji_Modifier}+|\u{FE0F}\u{20E3}?|[\u{E0020}-\u{E007E}]+\u{E007F})?)+|\p{EPres}(\p{Emoji_Modifier}+|\u{FE0F}\u{20E3}?|[\u{E0020}-\u{E007E}]+\u{E007F})?|\p{Emoji}(\p{Emoji_Modifier}+|\u{FE0F}\u{20E3}?|[\u{E0020}-\u{E007E}]+\u{E007F})*|./gu,

export const SPACE_REGEX = /\s+/;
export const SPACE_REGEX_GLOBAL: RegExp = /\s+/g;
