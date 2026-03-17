import { romanizeBengali } from "@/language/romanizers/bengali";
import { romanizeChinese } from "@/language/romanizers/chinese";
import { romanizeCyrillic } from "@/language/romanizers/cyrillic";
import { romanizeGreek } from "@/language/romanizers/greek";
import { romanizeGujarati } from "@/language/romanizers/gujarati";
import { romanizeHindi } from "@/language/romanizers/hindi";
import { romanizeJapanese } from "@/language/romanizers/japanese";
import { romanizeKorean } from "@/language/romanizers/korean";
import { romanizeMalayalam } from "@/language/romanizers/malayalam";
import { romanizePunjabi } from "@/language/romanizers/punjabi";
import { romanizeTamil } from "@/language/romanizers/tamil";
import { romanizeTelugu } from "@/language/romanizers/telugu";
import { romanizeGeorgian } from "@/language/romanizers/georgian";
import type { SupportedLanguage } from "@/language";

export const Romanizers: Record<SupportedLanguage, (text: string) => Promise<string> | string> = {
  hindi: romanizeHindi,
  japanese: romanizeJapanese,
  korean: romanizeKorean,
  chinese: romanizeChinese,
  cyrillic: romanizeCyrillic,
  punjabi: romanizePunjabi,
  tamil: romanizeTamil,
  telugu: romanizeTelugu,
  bengali: romanizeBengali,
  malayalam: romanizeMalayalam,
  gujarati: romanizeGujarati,
  greek: romanizeGreek,
  georgian: romanizeGeorgian,
};
