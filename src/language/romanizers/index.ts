import { romanizeBengali } from "~/language/romanizers/bengali";
import { romanizeChinese } from "~/language/romanizers/chinese";
import { romanizeCyrillic } from "~/language/romanizers/cyrillic";
import { romanizeGreek } from "~/language/romanizers/greek";
import { romanizeGujarati } from "~/language/romanizers/gujarati";
import { romanizeHindi } from "~/language/romanizers/hindi";
import { romanizeJapanese } from "~/language/romanizers/japanese";
import { romanizeKorean } from "~/language/romanizers/korean";
import { romanizeMalayalam } from "~/language/romanizers/malayalam";
import { romanizePunjabi } from "~/language/romanizers/punjabi";
import { romanizeTamil } from "~/language/romanizers/tamil";
import { romanizeTelugu } from "~/language/romanizers/telugu";
import { romanizeGeorgian } from "~/language/romanizers/georgian";
import { romanizeArmenian } from "~/language/romanizers/armenian";
import { romanizeArabic } from "~/language/romanizers/arabic";
import { romanizeHebrew } from "~/language/romanizers/hebrew";
import { romanizeGothic } from "~/language/romanizers/gothic";
import { romanizePersian } from "~/language/romanizers/persian";
import { romanizeUrdu } from "~/language/romanizers/urdu";
import type { SupportedLanguage } from "~/language";

export const Romanizers: Record<SupportedLanguage, (text: string) => Promise<string> | string> = {
  arabic: romanizeArabic,
  armenian: romanizeArmenian,
  bengali: romanizeBengali,
  chinese: romanizeChinese,
  cyrillic: romanizeCyrillic,
  georgian: romanizeGeorgian,
  gothic: romanizeGothic,
  greek: romanizeGreek,
  gujarati: romanizeGujarati,
  hebrew: romanizeHebrew,
  hindi: romanizeHindi,
  japanese: romanizeJapanese,
  korean: romanizeKorean,
  malayalam: romanizeMalayalam,
  persian: romanizePersian,
  punjabi: romanizePunjabi,
  tamil: romanizeTamil,
  telugu: romanizeTelugu,
  urdu: romanizeUrdu,
};
