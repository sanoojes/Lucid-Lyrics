import { Schema } from "../schema";

export const romaniote: Schema = {
  ADDITIONAL_FEATURES: [
    {
      FEATURE: "cluster",
      HEBREW: "זּ",
      TRANSLITERATION: "τζ",
    },
    {
      FEATURE: "cluster",
      // final shin or samekh
      HEBREW: /(\u{05E9}\u{05C2}|\u{05E9}|\u{05E1})$/u,
      TRANSLITERATION: "ς",
    },
    {
      FEATURE: "syllable",
      // final sin
      HEBREW: /\u{05E9}\u{05C1}$/u,
      TRANSLITERATION: (syllable, hebrew) => {
        if (syllable.isFinal) {
          return syllable.text.replace(hebrew, "σς");
        }
        return syllable.text;
      },
    },
    {
      FEATURE: "syllable",
      // patach or qamats yod
      HEBREW:
        /(?<patachYod>[\u{05B7}\u{05B8}][\u{0591}-\u{05AF}\u{05BD}\u{05BF}]?\u{05D9}[\u{0590}-\u{05AF}\u{05BD}\u{05BF}]?)(?!\u{05D5})(?<maqqaf>\u{05BE}?)/u,
      TRANSLITERATION: (syllable, hebrew) => {
        const match = syllable.text.match(hebrew);

        const groups = match?.groups;
        if (!groups) {
          return syllable.text;
        }
        const { patachYod } = groups;

        return syllable.text.replace(patachYod, "αη");
      },
    },
    {
      FEATURE: "cluster",
      // consonantal yod with hiriq as vowel
      HEBREW: /(\u{05D9}\u{05B4})/u,
      TRANSLITERATION: "γι",
    },
    {
      FEATURE: "syllable",
      // tsere yod
      HEBREW:
        /(?<tsereYod>\u{05B5}[\u{0590}-\u{05AF}\u{05BD}\u{05BF}]?\u{05D9}[\u{0590}-\u{05AF}\u{05BD}\u{05BF}]?)(?<maqqaf>\u{05BE}?)$/u,
      TRANSLITERATION: (syllable, hebrew) => {
        const match = syllable.text.match(hebrew);

        const groups = match?.groups;
        if (!groups) {
          return syllable.text;
        }
        const { tsereYod } = groups;

        if (syllable.isFinal) {
          return syllable.text.replace(tsereYod, "αι\u{301}");
        }
        return syllable.text.replace(tsereYod, "ε");
      },
    },
    {
      FEATURE: "syllable",
      // hiriq yod
      HEBREW:
        /(?<hiriqYod>\u{05B4}[\u{0590}-\u{05AF}\u{05BD}\u{05BF}]?\u{05D9}[\u{0590}-\u{05AF}\u{05BD}\u{05BF}]?)(?<maqqaf>\u{05BE}?)$/u,
      TRANSLITERATION: (syllable, hebrew) => {
        const match = syllable.text.match(hebrew);

        const groups = match?.groups;
        if (!groups) {
          return syllable.text;
        }
        const { hiriqYod } = groups;

        if (syllable.isFinal) {
          const finalHiriqYod = syllable.isAccented ? "ή" : "η";
          return syllable.text.replace(hiriqYod, finalHiriqYod);
        }
        return syllable.isAccented
          ? syllable.text.replace(hiriqYod, "ί")
          : syllable.text.replace(hiriqYod, "ι");
      },
    },
    {
      FEATURE: "syllable",
      // masculine plural marker
      HEBREW: /(\u{05B4}[\u{0590}-\u{05AF}\u{05BD}\u{05BF}]?\u{05D9}\u{05DD})/u,
      TRANSLITERATION: (syllable, hebrew) => {
        return syllable.text.replace(hebrew, "ει\u{301}μ");
      },
    },
  ],
  ALEF: "",
  AYIN: "",
  BET: "β",
  BET_DAGESH: "μπ",
  DAGESH: "",
  DAGESH_CHAZAQ: false,
  DALET: "δ",
  DALET_DAGESH: "ντ",
  DIVINE_NAME: "Αδωνάη",
  FINAL_KAF: "χ",
  FINAL_MEM: "μ",
  FINAL_NUN: "ν",
  FINAL_PE: "φ",
  FINAL_TSADI: "τς",
  FURTIVE_PATAH: "a",
  GIMEL: "γ",
  GIMEL_DAGESH: "γκ",
  HATAF_PATAH: "α",
  HATAF_QAMATS: "ο",
  HATAF_SEGOL: "ε",
  HE: "",
  HET: "χ",
  HIRIQ: "ι",
  HIRIQ_YOD: "ι",
  HOLAM: "ω",
  HOLAM_HASER: "ω",
  HOLAM_VAV: "ω",
  KAF: "χ",
  KAF_DAGESH: "κ",
  LAMED: "λ",
  MAQAF: "-",
  MEM: "μ",
  MS_SUFX: "άβ",
  NUN: "ν",
  PASEQ: "",
  PATAH: "α",
  PE: "φ",
  PE_DAGESH: "π",
  QAMATS: "α",
  QAMATS_HE: "α",
  QAMATS_QATAN: "ο",
  QOF: "κ",
  QUBUTS: "ου",
  RESH: "ρ",
  SAMEKH: "σ",
  SEGOL: "ε",
  SEGOL_HE: "ε",
  SEGOL_YOD: "ε",
  SHIN: "σσ",
  SHUREQ: "ου",
  SIN: "σ",
  SOF_PASUQ: "",
  STRESS_MARKER: {
    exclude: "single",
    location: "after-vowel",
    mark: "\u{301}",
  },
  TAV: "θ",
  TAV_DAGESH: "τ",
  TET: "τ",
  TSADI: "τσ",
  TSERE: "ε",
  TSERE_HE: "ε",
  TSERE_YOD: "ε",
  VAV: "β",
  VOCAL_SHEVA: "ε",
  YOD: "γι",
  ZAYIN: "ζ",
  allowNoNiqqud: true,
  article: true,
  holemHaser: "remove",
  longVowels: true,
  qametsQatan: true,
  shevaAfterMeteg: true,
  sqnmlvy: true,
  strict: false,
  wawShureq: true,
};
