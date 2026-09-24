/**
 * Mathematische Ausdrücke zu verständlichem Text konvertieren
 *
 * Beispiele:
 * "-3,5 + 1,2" → "Minus drei Komma fünf plus eins Komma zwei"
 * "3/4" → "drei Viertel"
 * "3 × 8" → "drei mal acht"
 * "x²" → "x Quadrat"
 */

const DIGIT_NAMES: Record<string, string> = {
  "0": "null",
  "1": "eins",
  "2": "zwei",
  "3": "drei",
  "4": "vier",
  "5": "fünf",
  "6": "sechs",
  "7": "sieben",
  "8": "acht",
  "9": "neun",
}

const FRACTION_NAMES: Record<string, string> = {
  "1/2": "ein Halb",
  "1/3": "ein Drittel",
  "1/4": "ein Viertel",
  "2/3": "zwei Drittel",
  "3/4": "drei Viertel",
  "3/5": "drei Fünftel",
  "5/6": "fünf Sechstel",
  "7/8": "sieben Achtel",
}

export function mathToSpeech(expression: string): string {
  if (!expression) return ""

  let result = expression
    // Fractions: 3/4 → "drei Viertel"
    .replace(/(\d+)\/(\d+)/g, (match) => {
      return FRACTION_NAMES[match] || `${match.split("/")[0]} durch ${match.split("/")[1]}`
    })
    // Multiplications: × oder * → "mal"
    .replace(/[×*]/g, "mal")
    // Division: ÷ oder / → "geteilt durch"
    .replace(/[÷]/g, "geteilt durch")
    // Powers: x² → "x Quadrat", x³ → "x Kubik"
    .replace(/\^2/g, "Quadrat")
    .replace(/²/g, "Quadrat")
    .replace(/\^3/g, "Kubik")
    .replace(/³/g, "Kubik")
    .replace(/\^(\d+)/g, "hoch $1")
    // Decimal comma: 3,5 → "drei Komma fünf"
    .replace(/(\d+),(\d+)/g, (match, before, after) => {
      const beforeWords = spelledOutNumber(before)
      const afterWords = after.split("").map((d: string) => DIGIT_NAMES[d]).join(" ")
      return `${beforeWords} Komma ${afterWords}`
    })
    // Negative: -3 → "Minus drei"
    .replace(/^-/, "Minus ")
    .replace(/\s-/g, " Minus ")
    // Plus: + → "plus"
    .replace(/\+/g, "plus")
    // Equals: = → "gleich"
    .replace(/=/g, "gleich")
    // Parentheses
    .replace(/\(/g, "Klammer auf")
    .replace(/\)/g, "Klammer zu")
    // Square root: √ → "Quadratwurzel"
    .replace(/√/g, "Quadratwurzel")
    // π → "pi"
    .replace(/π/g, "pi")
    // Clean up multiple spaces
    .replace(/\s+/g, " ")
    .trim()

  return result
}

function spelledOutNumber(num: string): string {
  if (!num) return ""

  const n = parseInt(num, 10)

  if (n === 0) return "null"
  if (n === 1) return "eins"
  if (n === 2) return "zwei"
  if (n === 3) return "drei"
  if (n === 4) return "vier"
  if (n === 5) return "fünf"
  if (n === 6) return "sechs"
  if (n === 7) return "sieben"
  if (n === 8) return "acht"
  if (n === 9) return "neun"
  if (n === 10) return "zehn"

  // Multi-digit: concatenate
  return num.split("").map((d: string) => DIGIT_NAMES[d]).join(" ")
}

/**
 * Bestimme ob Text automatisch gesprochen werden sollte
 */
export function shouldAutoSpeak(eventType: string): boolean {
  const autoSpeakEvents = [
    "greeting",
    "foundation_gap",
    "level_up",
    "badge_unlock",
    "mission_completed",
    "self_correction",
  ]

  return autoSpeakEvents.includes(eventType)
}

/**
 * Combine Eli Text für mehrere Events
 */
export function combineVoiceEvents(
  events: Array<{ text: string; type: string }>
): string {
  return events.map((e) => e.text).join(" ")
}
