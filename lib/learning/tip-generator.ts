/**
 * Tip Generator - WICHTIG: Tipps zeigen NIEMALS die aktuelle Aufgabe!
 *
 * Tipps zeigen die METHODE mit ANDEREN Beispiel-Zahlen.
 * Schüler müssen selbst die aktuelle Aufgabe lösen!
 */

export function generateTipForAddition(difficulty: string): string {
  if (difficulty === "einfach") {
    return `➕ ADDITION MIT KLEINEN ZAHLEN - Methode mit Beispiel:

💡 BEISPIEL MIT ANDEREN ZAHLEN (NICHT DEINE AUFGABE!):
Aufgabe: 7 + 4 = ?

📝 SCHRITT 1: Stell dir eine Zahlenlinie vor
   0 - 1 - 2 - 3 - 4 - 5 - 6 - 7 - 8 - 9 - 10 - 11

📝 SCHRITT 2: Start bei der ERSTEN Zahl (7)
   Du fängst bei der 7 an!

📝 SCHRITT 3: Zähle so viele Schritte NACH OBEN wie die ZWEITE Zahl (4)
   • Start: 7
   • +1: 8
   • +2: 9
   • +3: 10
   • +4: 11 ← FERTIG!

✅ BEISPIEL-ERGEBNIS: 7 + 4 = 11

📌 JETZT DEINE AUFGABE:
   Nutze die gleiche Methode für DEINE Zahlen!
   - Fang bei der ERSTEN Zahl an
   - Zähle so viele Schritte nach oben wie die ZWEITE Zahl
   - Du schaffst das! 💪

💡 MERKSATZ: "Addieren heißt: Von der ersten Zahl aus nach oben zählen!"`
  }

  return `➕ SPALTENWEISE ADDITION - So geht's:

💡 BEISPIEL MIT ANDEREN ZAHLEN:
Aufgabe: 345 + 278 = ?

📝 SCHRITT 1: Schreib die Zahlen UNTEREINANDER
      345
    + 278
    -----

📝 SCHRITT 2: Rechne RECHTS ZUERST (die hinteren Zahlen)
   • 5 + 8 = 13
   • Schreib 3 unten, merke 1

📝 SCHRITT 3: Rechne die MITTLEREN Zahlen (Zehner)
   • 4 + 7 = 11
   • Plus die 1 von oben = 12
   • Schreib 2 unten, merke 1

📝 SCHRITT 4: Rechne die LINKEN Zahlen (Hunderter)
   • 3 + 2 = 5
   • Plus die 1 von oben = 6
   • Schreib 6 unten

      345
    + 278
    -----
      623

✅ ERGEBNIS: 345 + 278 = 623

📌 DEINE AUFGABE: Mach das Gleiche!
   1. Schreib untereinander
   2. Rechne VON RECHTS NACH LINKS
   3. Wenn eine Summe ≥ 10 ist, merke die vordere Ziffer!

💡 MERKSATZ: "Immer von rechts anfangen, von unten nach oben!"

⚠️ WICHTIG: Dieses Beispiel hat ANDERE Zahlen!
   Du musst deine Aufgabe selbst rechnen! 🔒`
}

export function generateTipForSubtraction(difficulty: string): string {
  if (difficulty === "einfach") {
    return `➖ SUBTRAKTION MIT KLEINEN ZAHLEN - Methode mit Beispiel:

💡 BEISPIEL MIT ANDEREN ZAHLEN (NICHT DEINE AUFGABE!):
Aufgabe: 9 - 3 = ?

📝 SCHRITT 1: Stell dir eine Zahlenlinie vor
   0 - 1 - 2 - 3 - 4 - 5 - 6 - 7 - 8 - 9 - 10

📝 SCHRITT 2: Start bei der ERSTEN Zahl (9)
   Du fängst bei der 9 an!

📝 SCHRITT 3: Zähle so viele Schritte NACH UNTEN wie die ZWEITE Zahl (3)
   • Start: 9
   • -1: 8
   • -2: 7
   • -3: 6 ← FERTIG!

✅ BEISPIEL-ERGEBNIS: 9 - 3 = 6

📌 JETZT DEINE AUFGABE:
   Nutze die gleiche Methode für DEINE Zahlen!
   - Fang bei der ERSTEN Zahl an
   - Zähle so viele Schritte nach unten wie die ZWEITE Zahl
   - Du schaffst das! 💪

💡 MERKSATZ: "Subtrahieren heißt: Von der ersten Zahl aus nach unten zählen!"`
  }

  return `➖ SPALTENWEISE SUBTRAKTION - So geht's:

💡 BEISPIEL MIT ANDEREN ZAHLEN:
Aufgabe: 800 - 234 = ?

📝 SCHRITT 1: Schreib die Zahlen UNTEREINANDER (große oben!)

      800
    - 234
    -----

📝 SCHRITT 2: Rechne RECHTS ZUERST
   • 0 - 4 geht nicht!
   • "Borge" 1 von den Zehnern: 10 - 4 = 6
   • Schreib 6 unten

📝 SCHRITT 3: Rechne die MITTLEREN Zahlen
   • Du hast 1 geborgt, also nur noch 0 - 1 = -1
   • Das geht nicht!
   • Borge wieder: 10 - 1 - 3 = 6
   • Schreib 6 unten

📝 SCHRITT 4: Rechne die LINKEN Zahlen
   • Du hast 1 geborgt, also 8 - 1 = 7
   • 7 - 2 = 5
   • Schreib 5 unten

      800
    - 234
    -----
      566

✅ ERGEBNIS: 800 - 234 = 566

📌 DEINE AUFGABE: Mach das Gleiche!
   1. Schreib untereinander
   2. Rechne VON RECHTS NACH LINKS
   3. Wenn oben kleiner ist: Borge von links!

💡 MERKSATZ: "Wenn es nicht reicht, borge von der nächsten Stelle!"

⚠️ WICHTIG: Dieses Beispiel hat ANDERE Zahlen!
   Du musst deine Aufgabe selbst rechnen! 🔒`
}

export function generateTipForMultiplication(difficulty: string, isDecimal: boolean): string {
  if (isDecimal) {
    return `✖️ DEZIMAL-MULTIPLIKATION - Methode mit Beispiel:

💡 BEISPIEL MIT ANDEREN ZAHLEN (NICHT DEINE AUFGABE!):
Aufgabe: 3,5 × 2 = ?

📝 SCHRITT 1: Ignoriere ERST die Kommas!
   Rechne: 35 × 2

📝 SCHRITT 2: Normale Multiplikation
   35 × 2 = 70

📝 SCHRITT 3: Zähle die Dezimalstellen
   • 3,5 hat 1 Dezimalstelle
   • 2 hat 0 Dezimalstellen
   • Insgesamt: 1 Dezimalstelle

📝 SCHRITT 4: Setze das Komma
   • 70 mit 1 Dezimalstelle = 7,0 = 7

✅ BEISPIEL-ERGEBNIS: 3,5 × 2 = 7

📌 JETZT DEINE AUFGABE:
   Nutze diese Methode für DEINE Zahlen!
   - Kommas ignorieren
   - Normal rechnen
   - Komma zurückzählen! 🔒

💡 MERKSATZ: "Kommas ignorieren, rechnen, dann Komma zurückzählen!"`
  }

  if (difficulty === "einfach") {
    return `✖️ MULTIPLIKATION MIT KLEINEN ZAHLEN - Methode mit Beispiel:

💡 BEISPIEL MIT ANDEREN ZAHLEN (NICHT DEINE AUFGABE!):
Aufgabe: 4 × 3 = ?

📝 SCHRITT 1: Verstehe Multiplikation
   4 × 3 bedeutet: "Nimm die 3 genau 4-mal"

📝 SCHRITT 2: Schreib als Addition
   3 + 3 + 3 + 3 = ?

📝 SCHRITT 3: Zähle zusammen
   3 + 3 = 6
   6 + 3 = 9
   9 + 3 = 12

✅ BEISPIEL-ERGEBNIS: 4 × 3 = 12

📌 JETZT DEINE AUFGABE:
   Nutze diese Methode für DEINE Zahlen! 🔒

💡 MERKSATZ: "Multiplikation = Die Zahl wird mehrfach addiert!"`
  }

  return `✖️ SCHRIFTLICHE MULTIPLIKATION - So geht's:

💡 BEISPIEL MIT ANDEREN ZAHLEN:
Aufgabe: 23 × 4 = ?

📝 SCHRITT 1: Zerlege die erste Zahl in Zehner + Einer
   23 = 20 + 3

📝 SCHRITT 2: Multipliziere jeden Teil einzeln
   • 20 × 4 = 80
   • 3 × 4 = 12

📝 SCHRITT 3: Addiere die Ergebnisse
   80 + 12 = 92

✅ ERGEBNIS: 23 × 4 = 92

📌 DEINE AUFGABE: Mach das Gleiche!
   1. Zerlege die erste Zahl
   2. Multipliziere die Teile
   3. Addiere die Ergebnisse!

💡 MERKSATZ: "Zerlegen → Multiplizieren → Addieren!"

⚠️ WICHTIG: Dieses Beispiel hat ANDERE Zahlen!
   Du musst deine Aufgabe selbst rechnen! 🔒`
}

export function generateTipForDivision(): string {
  return `➗ DIVISION - So geht's:

💡 BEISPIEL MIT ANDEREN ZAHLEN:
Aufgabe: 20 ÷ 5 = ?

📝 SCHRITT 1: Was bedeutet Division?
   20 ÷ 5 = "Teile 20 in 5 gleiche Teile"

📝 SCHRITT 2: Denk daran: "Wie viel bekommt jeder?"
   • Du hast 20
   • 5 Personen
   • Jeder bekommt: ?

📝 SCHRITT 3: Verteile fair
   Wenn jeder 4 bekommt: 5 × 4 = 20 ✓
   Also: 20 ÷ 5 = 4

✅ ERGEBNIS: 20 ÷ 5 = 4

📌 DEINE AUFGABE: Mach das Gleiche!
   1. Wie viele sind oben? (die erste Zahl)
   2. Wie viele Teile? (die zweite Zahl)
   3. Wie viel pro Teil?
   4. Kontrolle: Teil × Anzahl = oben?

💡 MERKSATZ: "Division = Fair verteilen!"

⚠️ WICHTIG: Dieses Beispiel hat ANDERE Zahlen!
   Du musst deine Aufgabe selbst rechnen! 🔒`
}
