const GREEK_SYMBOLS = [
  ["alpha", "α"],
  ["beta", "β"],
  ["gamma", "γ"],
  ["delta", "δ"],
  ["theta", "θ"],
  ["lambda", "λ"],
  ["mu", "μ"],
  ["pi", "π"],
  ["sigma", "σ"],
  ["phi", "φ"],
  ["omega", "ω"]
] as const;

const SUPERSCRIPT_DIGITS: Record<string, string> = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹"
};

export function formatAiDisplayText(value: string) {
  let formatted = value
    .normalize("NFC")
    .replace(/\bre\^\(\s*itheta\s*\)/gi, "r e^(iθ)")
    .replace(/\bre\^\(\s*i\s*theta\s*\)/gi, "r e^(iθ)")
    .replace(/\be\^\(\s*itheta\s*\)/gi, "e^(iθ)")
    .replace(/\be\^\(\s*i\s*theta\s*\)/gi, "e^(iθ)")
    .replace(
      /\br\s+por\s*\(\s*cos(?:eno)?\s+de\s+theta\s*\+\s*i\s+por\s+sen(?:o)?\s+de\s+theta\s*\)/gi,
      "r(cos theta + i sen theta)"
    )
    .replace(
      /\br\s+por\s*\(\s*cos\s+theta\s*\+\s*i\s+sen\s+theta\s*\)/gi,
      "r(cos theta + i sen theta)"
    )
    .replace(/\br\s+por\s+e\s+elevado\s+a\s*\(/gi, "r e^(")
    .replace(/\br\s+e\s+elevado\s+a\s*\(/gi, "r e^(")
    .replace(/\be\s+elevado\s+a\s*\(/gi, "e^(")
    .replace(/\b(?:raiz|raíz)\s+cuadrada\s+de\s*\(/gi, "√(")
    .replace(/\bsqrt\s*\(/gi, "√(")
    .replace(/\barcotangente\s+de\s*\(/gi, "arctan(")
    .replace(/\barcoseno\s+de\s+/gi, "cos ")
    .replace(/\bseno\s+de\s+/gi, "sen ")
    .replace(/\btangente\s+de\s+/gi, "tan ")
    .replace(/\bi\s+por\s+sen\b/gi, "i sen")
    .replace(/\bi\s+por\s+cos\b/gi, "i cos")
    .replace(/\bi\s+por\s+tan\b/gi, "i tan")
    .replace(/\bi\s+por\s+([a-z])\b/gi, "i$1")
    .replace(/\ba\s*\+\s*b\s+por\s+i\b/gi, "a + bi");

  for (const [name, symbol] of GREEK_SYMBOLS) {
    formatted = formatted.replace(new RegExp(`\\b${name}\\b`, "gi"), symbol);
  }

  return formatted
    .replace(/\be\^\(\s*i\s+([^)]+)\)/g, "e^(i$1)")
    .replace(/\br\s+e\^\(\s*i\s+([^)]+)\)/g, "r e^(i$1)")
    .replace(/\^(\d+)/g, (_, digits: string) => digitsToSuperscript(digits))
    .replace(/[ ]{2,}/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .trim();
}

function digitsToSuperscript(digits: string) {
  return digits
    .split("")
    .map((digit) => SUPERSCRIPT_DIGITS[digit] ?? digit)
    .join("");
}
