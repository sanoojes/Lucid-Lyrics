// This content is from the NPM package: "greek-transliteration"
// Author: charlesloder

class Schema {
  constructor(schema) {
    // uppercase
    this.CAPITAL_ALPHA = schema.CAPITAL_ALPHA || schema.SMALL_ALPHA.toUpperCase();
    this.CAPITAL_BETA = schema.CAPITAL_BETA || schema.SMALL_BETA.toUpperCase();
    this.CAPITAL_GAMMA = schema.CAPITAL_GAMMA || schema.SMALL_GAMMA.toUpperCase();
    this.CAPITAL_DELTA = schema.CAPITAL_DELTA || schema.SMALL_DELTA.toUpperCase();
    this.CAPITAL_EPSILON = schema.CAPITAL_EPSILON || schema.SMALL_EPSILON.toUpperCase();
    this.CAPITAL_ZETA = schema.CAPITAL_ZETA || schema.SMALL_ZETA.toUpperCase();
    this.CAPITAL_ETA = schema.CAPITAL_ETA || schema.SMALL_ETA.toUpperCase();
    this.CAPITAL_THETA = schema.CAPITAL_THETA || schema.SMALL_THETA.toUpperCase();
    this.CAPITAL_IOTA = schema.CAPITAL_IOTA || schema.SMALL_IOTA.toUpperCase();
    this.CAPITAL_KAPPA = schema.CAPITAL_KAPPA || schema.SMALL_KAPPA.toUpperCase();
    this.CAPITAL_LAMDA = schema.CAPITAL_LAMDA || schema.SMALL_LAMDA.toUpperCase();
    this.CAPITAL_MU = schema.CAPITAL_MU || schema.SMALL_MU.toUpperCase();
    this.CAPITAL_NU = schema.CAPITAL_NU || schema.SMALL_NU.toUpperCase();
    this.CAPITAL_XI = schema.CAPITAL_XI || schema.SMALL_XI.toUpperCase();
    this.CAPITAL_OMICRON = schema.CAPITAL_OMICRON || schema.SMALL_OMICRON.toUpperCase();
    this.CAPITAL_PI = schema.CAPITAL_PI || schema.SMALL_PI.toUpperCase();
    this.CAPITAL_RHO = schema.CAPITAL_RHO || schema.SMALL_RHO.toUpperCase();
    this.CAPITAL_SIGMA = schema.CAPITAL_SIGMA || schema.SMALL_SIGMA.toUpperCase();
    this.CAPITAL_TAU = schema.CAPITAL_TAU || schema.SMALL_TAU.toUpperCase();
    this.CAPITAL_UPSILON = schema.CAPITAL_UPSILON || schema.SMALL_UPSILON.toUpperCase();
    this.CAPITAL_PHI = schema.CAPITAL_PHI || schema.SMALL_PHI.toUpperCase();
    this.CAPITAL_CHI = schema.CAPITAL_CHI || schema.SMALL_CHI.toUpperCase();
    this.CAPITAL_PSI = schema.CAPITAL_PSI || schema.SMALL_PSI.toUpperCase();
    this.CAPITAL_OMEGA = schema.CAPITAL_OMEGA || schema.SMALL_OMEGA.toUpperCase();
    // lowercase
    this.SMALL_ALPHA = schema.SMALL_ALPHA;
    this.SMALL_BETA = schema.SMALL_BETA;
    this.SMALL_GAMMA = schema.SMALL_GAMMA;
    this.SMALL_DELTA = schema.SMALL_DELTA;
    this.SMALL_EPSILON = schema.SMALL_EPSILON;
    this.SMALL_ZETA = schema.SMALL_ZETA;
    this.SMALL_ETA = schema.SMALL_ETA;
    this.SMALL_THETA = schema.SMALL_THETA;
    this.SMALL_IOTA = schema.SMALL_IOTA;
    this.SMALL_KAPPA = schema.SMALL_KAPPA;
    this.SMALL_LAMDA = schema.SMALL_LAMDA;
    this.SMALL_MU = schema.SMALL_MU;
    this.SMALL_NU = schema.SMALL_NU;
    this.SMALL_XI = schema.SMALL_XI;
    this.SMALL_OMICRON = schema.SMALL_OMICRON;
    this.SMALL_PI = schema.SMALL_PI;
    this.SMALL_RHO = schema.SMALL_RHO;
    this.SMALL_FINAL_SIGMA = schema.SMALL_FINAL_SIGMA;
    this.SMALL_SIGMA = schema.SMALL_SIGMA;
    this.SMALL_TAU = schema.SMALL_TAU;
    this.SMALL_UPSILON = schema.SMALL_UPSILON;
    this.SMALL_PHI = schema.SMALL_PHI;
    this.SMALL_CHI = schema.SMALL_CHI;
    this.SMALL_PSI = schema.SMALL_PSI;
    this.SMALL_OMEGA = schema.SMALL_OMEGA;
    // orthographies
    this.SMALL_GAMMA_NASAL = schema.SMALL_GAMMA_NASAL || schema.SMALL_GAMMA;
    this.CAPITAL_GAMMA_NASAL = schema.CAPITAL_GAMMA_NASAL || this.SMALL_GAMMA_NASAL.toUpperCase();
    this.SMALL_DOUBLE_RHO = schema.SMALL_DOUBLE_RHO;
    this.CAPITAL_DOUBLE_RHO = schema.CAPITAL_DOUBLE_RHO || schema.SMALL_DOUBLE_RHO.toUpperCase();
    this.SMALL_UPSILON_DIPTHONG = schema.SMALL_UPSILON_DIPTHONG;
    this.CAPITAL_UPSILON_DIPTHONG =
      schema.CAPITAL_UPSILON_DIPTHONG || this.SMALL_UPSILON_DIPTHONG.toUpperCase();
    this.ROUGH_BREATHING_MARK = schema.ROUGH_BREATHING_MARK;
    // functionality
    this.preserveCapitals = schema.preserveCapitals ?? true;
  }
}

class SBL extends Schema {
  constructor(schema) {
    super({
      // uppercase
      CAPITAL_ALPHA: schema.CAPITAL_ALPHA || 'A',
      CAPITAL_BETA: schema.CAPITAL_BETA || 'B',
      CAPITAL_GAMMA: schema.CAPITAL_GAMMA || 'G',
      CAPITAL_DELTA: schema.CAPITAL_DELTA || 'D',
      CAPITAL_EPSILON: schema.CAPITAL_EPSILON || 'E',
      CAPITAL_ZETA: schema.CAPITAL_ZETA || 'Z',
      CAPITAL_ETA: schema.CAPITAL_ETA || 'Ē',
      CAPITAL_THETA: schema.CAPITAL_THETA || 'TH',
      CAPITAL_IOTA: schema.CAPITAL_IOTA || 'I',
      CAPITAL_KAPPA: schema.CAPITAL_KAPPA || 'K',
      CAPITAL_LAMDA: schema.CAPITAL_LAMDA || 'L',
      CAPITAL_MU: schema.CAPITAL_MU || 'M',
      CAPITAL_NU: schema.CAPITAL_NU || 'N',
      CAPITAL_XI: schema.CAPITAL_XI || 'X',
      CAPITAL_OMICRON: schema.CAPITAL_OMICRON || 'O',
      CAPITAL_PI: schema.CAPITAL_PI || 'P',
      CAPITAL_RHO: schema.CAPITAL_RHO || 'R',
      CAPITAL_SIGMA: schema.CAPITAL_SIGMA || 'S',
      CAPITAL_TAU: schema.CAPITAL_TAU || 'T',
      CAPITAL_UPSILON: schema.CAPITAL_UPSILON || 'Y',
      CAPITAL_PHI: schema.CAPITAL_PHI || 'PH',
      CAPITAL_CHI: schema.CAPITAL_CHI || 'CH',
      CAPITAL_PSI: schema.CAPITAL_PSI || 'PS',
      CAPITAL_OMEGA: schema.CAPITAL_OMEGA || 'Ō',
      // lowercase
      SMALL_ALPHA: schema.SMALL_ALPHA || 'a',
      SMALL_BETA: schema.SMALL_BETA || 'b',
      SMALL_GAMMA: schema.SMALL_GAMMA || 'g',
      SMALL_DELTA: schema.SMALL_DELTA || 'd',
      SMALL_EPSILON: schema.SMALL_EPSILON || 'e',
      SMALL_ZETA: schema.SMALL_ZETA || 'z',
      SMALL_ETA: schema.SMALL_ETA || 'ē',
      SMALL_THETA: schema.SMALL_THETA || 'th',
      SMALL_IOTA: schema.SMALL_IOTA || 'i',
      SMALL_KAPPA: schema.SMALL_KAPPA || 'k',
      SMALL_LAMDA: schema.SMALL_LAMDA || 'l',
      SMALL_MU: schema.SMALL_MU || 'm',
      SMALL_NU: schema.SMALL_NU || 'n',
      SMALL_XI: schema.SMALL_XI || 'x',
      SMALL_OMICRON: schema.SMALL_OMICRON || 'o',
      SMALL_PI: schema.SMALL_PI || 'p',
      SMALL_RHO: schema.SMALL_RHO || 'r',
      SMALL_FINAL_SIGMA: schema.SMALL_FINAL_SIGMA || 's',
      SMALL_SIGMA: schema.SMALL_SIGMA || 's',
      SMALL_TAU: schema.SMALL_TAU || 't',
      SMALL_UPSILON: schema.SMALL_UPSILON || 'y',
      SMALL_PHI: schema.SMALL_PHI || 'ph',
      SMALL_CHI: schema.SMALL_CHI || 'ch',
      SMALL_PSI: schema.SMALL_PSI || 'ps',
      SMALL_OMEGA: schema.SMALL_OMEGA || 'ō',
      // orthographies
      SMALL_GAMMA_NASAL: schema.SMALL_GAMMA_NASAL || 'n',
      CAPITAL_GAMMA_NASAL: schema.CAPITAL_GAMMA_NASAL || 'N',
      SMALL_DOUBLE_RHO: schema.SMALL_DOUBLE_RHO || 'rrh',
      CAPITAL_DOUBLE_RHO: schema.CAPITAL_DOUBLE_RHO || 'RRH',
      SMALL_UPSILON_DIPTHONG: schema.SMALL_UPSILON_DIPTHONG || 'u',
      CAPITAL_UPSILON_DIPTHONG: schema.CAPITAL_UPSILON_DIPTHONG || 'U',
      ROUGH_BREATHING_MARK: schema.ROUGH_BREATHING_MARK || 'h',
      // functionality
      preserveCapitals: schema.preserveCapitals ?? true,
    });
  }
}

const transliterateMap = {
  Α: 'CAPITAL_ALPHA',
  Β: 'CAPITAL_BETA',
  Γ: 'CAPITAL_GAMMA',
  Δ: 'CAPITAL_DELTA',
  Ε: 'CAPITAL_EPSILON',
  Ζ: 'CAPITAL_ZETA',
  Η: 'CAPITAL_ETA',
  Θ: 'CAPITAL_THETA',
  Ι: 'CAPITAL_IOTA',
  Κ: 'CAPITAL_KAPPA',
  Λ: 'CAPITAL_LAMDA',
  Μ: 'CAPITAL_MU',
  Ν: 'CAPITAL_NU',
  Ξ: 'CAPITAL_XI',
  Ο: 'CAPITAL_OMICRON',
  Π: 'CAPITAL_PI',
  Ρ: 'CAPITAL_RHO',
  Σ: 'CAPITAL_SIGMA',
  Τ: 'CAPITAL_TAU',
  Υ: 'CAPITAL_UPSILON',
  Φ: 'CAPITAL_PHI',
  Χ: 'CAPITAL_CHI',
  Ψ: 'CAPITAL_PSI',
  Ω: 'CAPITAL_OMEGA',
  α: 'SMALL_ALPHA',
  β: 'SMALL_BETA',
  γ: 'SMALL_GAMMA',
  δ: 'SMALL_DELTA',
  ε: 'SMALL_EPSILON',
  ζ: 'SMALL_ZETA',
  η: 'SMALL_ETA',
  θ: 'SMALL_THETA',
  ι: 'SMALL_IOTA',
  κ: 'SMALL_KAPPA',
  λ: 'SMALL_LAMDA',
  μ: 'SMALL_MU',
  ν: 'SMALL_NU',
  ξ: 'SMALL_XI',
  ο: 'SMALL_OMICRON',
  π: 'SMALL_PI',
  ρ: 'SMALL_RHO',
  ς: 'SMALL_FINAL_SIGMA',
  σ: 'SMALL_SIGMA',
  τ: 'SMALL_TAU',
  υ: 'SMALL_UPSILON',
  φ: 'SMALL_PHI',
  χ: 'SMALL_CHI',
  ψ: 'SMALL_PSI',
  ω: 'SMALL_OMEGA', // GREEK SMALL LETTER OMEGA (U+03C9)
};
// Characters from NFKD normalization
// "\u{00B7}": "", // GREEK ANO TELEIA (U+0387) > MIDDLE DOT
// "\u{0300}": "", // VARIA > COMBINING GRAVE ACCENT
// "\u{0301}": "", // TONOS/OXIA > COMBINING ACUTE ACCENT
// "\u{0304}": "", // MACRON > COMBINING MACRON
// "\u{0306}": "", // VRACHY > COMBINING BREVE
// "\u{0313}": "", // PSILI > COMBINING COMMA ABOVE
// //   "\u{0314}": "\u{0314}", // DASIA (i.e. rough breathing mark) > COMBINING REVERSED COMMA ABOVE
// "\u{0342}": "", // PERISPOMENI > COMBINING GREEK PERISPOMENI
// "\u{0345}": "" // YPOGEGRAMMENI > COMBINING GREEK YPOGEGRAMMENI

const mapChars = (text, schema) =>
  [...text].map((char) => schema[transliterateMap[char]] ?? char).join('');
const changeElementSplit = (input, split, join) => input.split(split).join(join);
const changeElementSubstr = (input, index, join) => {
  return (
    input.substring(0, index - 1) +
    join +
    input.substring(index - 1, index) +
    input.substring(index + 1)
  );
};
const gammaNasalRules = (word, schema, checkCapitals = false) => {
  // maybe move out of function scope?
  const nasals = ['γγ', 'γκ', 'γξ', 'γχ'];
  const [gamma, kappa, xi, chi] = [...nasals.map((n) => new RegExp(n))];
  if (gamma.test(word)) word = word.replace(gamma, schema.SMALL_GAMMA_NASAL + schema.SMALL_GAMMA);
  if (kappa.test(word)) word = word.replace(kappa, schema.SMALL_GAMMA_NASAL + schema.SMALL_KAPPA);
  if (xi.test(word)) word = word.replace(xi, schema.SMALL_GAMMA_NASAL + schema.SMALL_XI);
  if (chi.test(word)) word = word.replace(chi, schema.SMALL_GAMMA_NASAL + schema.SMALL_CHI);
  if (checkCapitals) {
    const capitalNasals = ['γγ', 'γκ', 'γξ', 'γχ'].map((n) => n.toUpperCase());
    const [cGamma, cKappa, cXi, cChi] = [...capitalNasals.map((n) => new RegExp(n))];
    if (cGamma.test(word))
      word = word.replace(cGamma, schema.CAPITAL_GAMMA_NASAL + schema.CAPITAL_GAMMA);
    if (cKappa.test(word))
      word = word.replace(cKappa, schema.CAPITAL_GAMMA_NASAL + schema.CAPITAL_KAPPA);
    if (cXi.test(word)) word = word.replace(cXi, schema.CAPITAL_GAMMA_NASAL + schema.CAPITAL_XI);
    if (cChi.test(word)) word = word.replace(cChi, schema.CAPITAL_GAMMA_NASAL + schema.CAPITAL_CHI);
  }
  return word;
};
const rhoRules = (word, schema, checkCapitals = false) => {
  if (/ρ\u{0314}/u.test(word))
    word = word.replace(/ρ\u{0314}/u, schema.SMALL_RHO + schema.ROUGH_BREATHING_MARK);
  if (/ρρ/.test(word)) word = word.replace(/ρρ/, schema.SMALL_DOUBLE_RHO);
  if (checkCapitals) {
    if (/Ρ\u{0314}/u.test(word))
      word = word.replace(/Ρ\u{0314}/u, schema.CAPITAL_RHO + schema.ROUGH_BREATHING_MARK);
    if (/ΡΡ/.test(word)) word = word.replace(/Ρ/, schema.CAPITAL_DOUBLE_RHO);
  }
  return word;
};
const diphtongRules = (word, schema, checkCapitals = false) => {
  const dipthongs = ['αυ', 'ευ', 'ηυ', 'ου', 'υι'];
  const [alpha, epsilon, eta, omicron, iota] = [...dipthongs.map((d) => new RegExp(d))];
  if (alpha.test(word))
    word = word.replace(alpha, schema.SMALL_ALPHA + schema.SMALL_UPSILON_DIPTHONG);
  if (epsilon.test(word))
    word = word.replace(epsilon, schema.SMALL_EPSILON + schema.SMALL_UPSILON_DIPTHONG);
  if (eta.test(word)) word = word.replace(eta, schema.SMALL_ETA + schema.SMALL_UPSILON_DIPTHONG);
  if (omicron.test(word))
    word = word.replace(omicron, schema.SMALL_OMICRON + schema.SMALL_UPSILON_DIPTHONG);
  if (iota.test(word)) word = word.replace(iota, schema.SMALL_UPSILON_DIPTHONG + schema.SMALL_IOTA);
  if (checkCapitals) {
    const cDipthongs = ['αυ', 'ευ', 'ηυ', 'ου', 'υι'].map((d) => d.toUpperCase());
    const [cAlpha, cEpsilon, cEta, cOmicron, cIota] = [...cDipthongs.map((d) => new RegExp(d))];
    if (cAlpha.test(word))
      word = word.replace(cAlpha, schema.CAPITAL_ALPHA + schema.CAPITAL_UPSILON_DIPTHONG);
    if (cEpsilon.test(word))
      word = word.replace(cEpsilon, schema.CAPITAL_EPSILON + schema.CAPITAL_UPSILON_DIPTHONG);
    if (cEta.test(word))
      word = word.replace(cEta, schema.CAPITAL_ETA + schema.CAPITAL_UPSILON_DIPTHONG);
    if (cOmicron.test(word))
      word = word.replace(cOmicron, schema.CAPITAL_OMICRON + schema.CAPITAL_UPSILON_DIPTHONG);
    if (cIota.test(word))
      word = word.replace(cIota, schema.CAPITAL_UPSILON_DIPTHONG + schema.CAPITAL_IOTA);
  }
  return word;
};

const rules = (word, schema) => {
  if (/γ/i.test(word)) {
    word = gammaNasalRules(word, schema, schema.preserveCapitals);
  }
  if (/ρ/i.test(word)) {
    word = rhoRules(word, schema, schema.preserveCapitals);
  }
  // if DIAERESIS, place between vowels to avoid dipthong
  const hasDiaeresis = /\u{0308}/u.test(word);
  if (hasDiaeresis) {
    const pos = word.indexOf('\u{0308}');
    word = changeElementSubstr(word, pos, '\u{0308}');
  }
  // \u{0314} is rough breathing mark
  if (/\u{0314}/u.test(word)) {
    const pos = word.indexOf('\u{0314}');
    word = `${schema.ROUGH_BREATHING_MARK}${changeElementSplit(word, /\u{0314}/u, '')}`;
  }
  if (/υ/i.test(word)) {
    word = diphtongRules(word, schema, schema.preserveCapitals);
  }
  // removes remaining DIAERESIS after diphthongs have been combined
  if (hasDiaeresis) word = word.replace(/\u{0308}/u, '');
  return mapChars(word, schema);
};

const transliterate = (text, schema = undefined) => {
  const transSchema = schema instanceof Schema ? schema : new SBL(schema ?? {});
  const normalize = text.normalize('NFKD');
  // removes unused characters from NFKD normalization
  const unused = /[\u{00B7}\u{0300}\u{0301}\u{0304}\u{0306}\u{0313}\u{0342}\u{0345}]/gu;
  const sanitized = normalize.replace(unused, '');
  const textCase = transSchema.preserveCapitals ? sanitized : sanitized.toLowerCase();
  return textCase
    .split(' ')
    .map((w) => (0, rules)(w, transSchema))
    .join(' ');
};

const greekRomanization = (text) => {
  return transliterate(text);
};

export default greekRomanization;
