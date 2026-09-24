/**
 * Smart Tips Generator
 * Intelligente, aufgabenspezifische Tipps für ALLE Aufgaben
 * Schwierigkeits-adaptiv (nicht zu einfach, nicht zu kompliziert)
 */

export interface SmartTipOptions {
  problem: string
  solution?: string
  difficulty?: "einfach" | "mittel" | "schwer"
  level?: 1 | 2 | 3 // 1=kleiner Tipp, 2=Richtung, 3=Erklärung
}

/**
 * Generiere intelligente, aufgabenspezifische Tipps
 * WICHTIG: Zeigt ANDERE Beispiele, nicht die aktuelle Aufgabe lösen!
 * Damit der Schüler nicht einfach abschreiben kann
 */

function generateExampleNumbers(
  operationType: string,
  difficulty: string
): { a: number; b: number } {
  // Generiere ANDERE Zahlen für Beispiele
  // Nicht die Zahlen aus der aktuellen Aufgabe verwenden!

  if (difficulty === "einfach") {
    return {
      a: Math.floor(Math.random() * 5) + 3, // 3-7
      b: Math.floor(Math.random() * 4) + 2, // 2-5
    }
  }

  if (difficulty === "mittel" || difficulty === "schwer") {
    return {
      a: Math.floor(Math.random() * 400) + 100, // 100-500
      b: Math.floor(Math.random() * 400) + 100, // 100-500
    }
  }

  return { a: 5, b: 3 }
}

export function getSmartTip(options: SmartTipOptions): string {
  const {
    problem = "",
    solution = "",
    difficulty = "mittel",
    level = 1,
  } = options

  const q = problem.toLowerCase()

  // Erkenne Aufgaben-Typen
  const isAddition = q.includes("+") && !q.includes("(")
  const isSubtraction = q.includes("-") && !q.includes("(")
  const isMultiplication = q.includes("*") || q.includes("×")
  const isDivision = q.includes("/") || q.includes("÷")
  const isNegative = q.includes("(") && q.includes("-")
  const isFraction = q.includes("/") && (q.includes("+") || q.includes("-"))
  const isEquation = q.includes("x") || q.includes("=")
  const isDecimal = q.includes(",")

  // Extrahiere Zahlen um Komplexität zu erkennen
  const numbers = problem.match(/\d+/g) || []
  const hasBigNumbers = numbers.some((n) => parseInt(n) > 50)

  // ============ NEGATIVE ZAHLEN ============
  if (isNegative) {
    if (level === 1) return `➖ Tipp: Negative Zahl = in die andere Richtung!`
    if (level === 2)
      return `🧭 Methode: Positive nach rechts, negative nach links auf Zahlenstrahl. Beispiel: -5 + 3 → start -5, dann +3 Schritte = -2`
    return `📚 Erklärung: (-5) + 3 bedeutet: Start bei -5, gehe 3 Schritte nach rechts → -2. Oder: subtrahieren statt addieren: 5 - 3 = 2, aber negativ: -2`
  }

  // ============ BRUCHRECHNUNG ============
  if (isFraction) {
    if (level === 1) return `💡 Tipp: Gleiche Nenner? Nur Zähler addieren!`
    if (level === 2)
      return `🧭 Regel: Nenner (unten) gleich → addiere nur Zähler (oben). Nenner bleibt! Beispiel: 3/5 + 1/5 = 4/5`
    return `📚 Erklärung: 3/5 bedeutet: 3 von 5 Teilen. Wenn du 1/5 addierst, sind es 4/5 insgesamt. Der Nenner 5 ändert sich nicht!`
  }

  // ============ MULTIPLIKATION ============
  if (isMultiplication) {
    if (isDecimal) {
      if (level === 1) return `💡 Tipp: Ignoriere Kommas, rechne normal!`
      if (level === 2)
        return `🧭 Methode: Rechne ohne Kommas (25 × 2 = 50), dann setze Komma korrekt. Beispiel: 2,5 × 2 = 5,0 = 5`
      return `📚 Erklärung: 2,5 × 2 → Rechne 25 × 2 = 50 → Zähle Dezimalstellen (1) → Setze Komma: 5,0 = 5`
    }
    if (hasBigNumbers || difficulty === "schwer") {
      if (level === 1) return `💡 Tipp: Zerlege in einfachere Teile!`
      if (level === 2)
        return `🧭 Methode: Multipliziere schriftlich oder zerlege. Beispiel: 23 × 4 = (20 × 4) + (3 × 4) = 80 + 12 = 92`
      return `📚 Erklärung: 23 × 4 = du multiplizierst zuerst die Zehner (20 × 4 = 80) und dann die Einer (3 × 4 = 12), dann addierst: 80 + 12 = 92`
    }
    if (level === 1) return `💡 Tipp: Multiplikation = Wiederholung!`
    if (level === 2)
      return `🧭 Methode: 3 × 4 bedeutet: 4 vier Mal addieren. Rechne: 4 + 4 + 4 = 12`
    return `📚 Erklärung: Multiplikation ist wiederholte Addition. 3 × 4 = "nimm die 4 genau 3 Mal" = 4 + 4 + 4 = 12`
  }

  // ============ DIVISION ============
  if (isDivision) {
    if (level === 1) return `💡 Tipp: Division = verteilen in gleiche Teile!`
    if (level === 2)
      return `🧭 Methode: 12 ÷ 3 = "teile 12 in 3 gleiche Teile" = 4 pro Teil. Wie viel bekommt jedes Teil?`
    return `📚 Erklärung: 12 ÷ 3 bedeutet: Du hast 12 Sachen und teilst sie fair auf 3 Personen. Jede Person bekommt 4. Kontrolle: 3 × 4 = 12 ✓`
  }

  // ============ ADDITION ============
  if (isAddition) {
    if (hasBigNumbers || difficulty === "schwer" || difficulty === "mittel") {
      if (level === 1) return `💡 Tipp: Zerlege in Einer, Zehner, Hunderter!`
      if (level === 2)
        return `🧭 Methode: Spaltenweise rechnen. Schreib Zahlen untereinander. 234 + 156 → Erst 4+6=10, dann 3+5=8, dann 2+1=3 → 390`
      return `📚 Erklärung: 234 + 156: Schreib untereinander, rechne rechts anfang (Einer: 4+6=10, schreib 0 und 1 Übertrag), dann Zehner+Übertrag (3+5+1=9), dann Hunderter (2+1=3) → Ergebnis: 390`
    }
    if (level === 1) return `💡 Tipp: Zähle von der ersten Zahl weiter!`
    if (level === 2)
      return `🧭 Methode: 5 + 3 = "start bei 5, zähle 3 Schritte hoch: 6, 7, 8" = 8`
    return `📚 Erklärung: Addition bedeutet "zusammen zählen". 5 + 3 = starte bei 5, gehe 3 Schritte nach oben = 8`
  }

  // ============ SUBTRAKTION ============
  if (isSubtraction) {
    if (hasBigNumbers || difficulty === "schwer") {
      if (level === 1) return `💡 Tipp: Spaltenweise rechnen, notfalls "borgen"!`
      if (level === 2)
        return `🧭 Methode: Schreib untereinander. Wenn unten größer als oben, "borge" vom nächsten Platz. Beispiel: 1000 - 567 → rechne von rechts nach links`
      return `📚 Erklärung: 1000 - 567: Schreib untereinander. Von rechts (Einer): 0 - 7? Geht nicht! "Borge" von den Zehnern: 10 - 7 = 3. Rechne so weiter für Zehner und Hunderter.`
    }
    if (level === 1) return `💡 Tipp: Zähle von der ersten Zahl zurück!`
    if (level === 2)
      return `🧭 Methode: 8 - 3 = "start bei 8, zähle 3 Schritte zurück: 7, 6, 5" = 5`
    return `📚 Erklärung: Subtraktion bedeutet "zurückzählen". 8 - 3 = starte bei 8, gehe 3 Schritte nach unten = 5`
  }

  // ============ GLEICHUNGEN ============
  if (isEquation) {
    if (level === 1) return `💡 Tipp: x ist eine unbekannte Zahl - finde sie!`
    if (level === 2)
      return `🧭 Methode: x + 5 = 12 → "Welche Zahl + 5 gibt 12?" → Denk: 12 - 5 = 7 → Also x = 7. Kontrolle: 7 + 5 = 12 ✓`
    return `📚 Erklärung: x ist eine Zahl, die du nicht kennst. Du musst sie finden! Bei x + 5 = 12: "Welche Zahl + 5 = 12?" Antwort: 7. Beweise: 7 + 5 = 12 ✓`
  }

  // ============ FALLBACK ============
  if (level === 1)
    return `💡 Hinweis: Schau alle Zahlen und Symbole genau an!`
  if (level === 2)
    return `🧭 Methode: Erkenne die Rechenart (+, -, ×, ÷) und wende die richtige Methode an`
  return `📚 Erklärung: Schreib alle Schritte auf: 1) Was ist die Aufgabe? 2) Welche Methode? 3) Rechne. 4) Kontrolle!`
}

/**
 * Batch: Generiere alle 3 Tipp-Level auf einmal
 */
export function getSmartTipAllLevels(
  options: Omit<SmartTipOptions, "level">
): { level1: string; level2: string; level3: string } {
  return {
    level1: getSmartTip({ ...options, level: 1 }),
    level2: getSmartTip({ ...options, level: 2 }),
    level3: getSmartTip({ ...options, level: 3 }),
  }
}

/**
 * Anti-Cheat-Hinweis für Tipps
 * Reminder: Tipps zeigen Methode + Beispiel, nicht die Lösung der aktuellen Aufgabe!
 */
export function addAntiCheatWarning(tipText: string): string {
  return `${tipText}

⚠️ WICHTIG FÜR SCHÜLER:
   Diese Tipps zeigen die METHODE mit anderen Zahlen!
   Deine Aufgabe hat ANDERE Zahlen!
   🔒 Nutze die Methode, um DEINE Aufgabe SELBST zu lösen!
   Du schaffst das! 💪`
}
