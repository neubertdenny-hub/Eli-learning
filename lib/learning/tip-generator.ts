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

  return `➕ SPALTENWEISE ADDITION - Methode mit Beispiel:

💡 BEISPIEL MIT ANDEREN ZAHLEN (NICHT DEINE AUFGABE!):
Aufgabe: 345 + 278 = ?

📝 SCHRITT 1: Schreib die Zahlen UNTEREINANDER
   Wichtig: Die Stellen müssen perfekt ausgerichtet sein!

      345
    + 278
    -----

📝 SCHRITT 2: Fang RECHTS an (bei den EINERN)
   • Addiere die Einer-Ziffern (rechts)
   • 5 + 8 = 13
   • Schreib nur die 3 unten, merke die 1 (Übertrag!)

📝 SCHRITT 3: Rechne die ZEHNER (mit Übertrag!)
   • Addiere die Zehner + Übertrag
   • 4 + 7 + 1 = 12
   • Schreib die 2 unten, merke die 1

📝 SCHRITT 4: Rechne die HUNDERTER (mit Übertrag!)
   • Addiere die Hunderter + Übertrag
   • 3 + 2 + 1 = 6
   • Schreib die 6 unten

      345
    + 278
    -----
      623

✅ BEISPIEL-ERGEBNIS: 345 + 278 = 623

📌 JETZT DEINE AUFGABE:
   Nutze diese Methode für DEINE Zahlen!
   - Schreib untereinander
   - Rechne spaltenweise von RECHTS nach LINKS
   - Vergiss Überträge nicht!

💡 MERKSATZ: "Immer von RECHTS nach LINKS! Überträge nicht vergessen!"

⚠️ WICHTIG: Diese Aufgabe hat ANDERE Zahlen als das Beispiel!
   Du musst selbst rechnen, nicht abschreiben! 🔒`
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

  return `➖ SPALTENWEISE SUBTRAKTION - Methode mit Beispiel:

💡 BEISPIEL MIT ANDEREN ZAHLEN (NICHT DEINE AUFGABE!):
Aufgabe: 800 - 234 = ?

📝 SCHRITT 1: Schreib die Zahlen UNTEREINANDER (größere oben!)

      800
    - 234
    -----

📝 SCHRITT 2: Fang RECHTS an (bei den EINERN)
   • 0 - 4 geht nicht!
   • "Borge" 1 Zehner → 10 - 4 = 6

📝 SCHRITT 3: Rechne die ZEHNER (mit Borgen!)
   • 0 - 1 Borgen - 3 geht nicht!
   • "Borge" 1 Hunderter → 10 - 1 - 3 = 6

📝 SCHRITT 4: Rechne die HUNDERTER (mit Borgen!)
   • 8 - 1 Borgen - 2 = 5

✅ BEISPIEL-ERGEBNIS: 800 - 234 = 566

📌 JETZT DEINE AUFGABE:
   Nutze diese Methode für DEINE Zahlen!
   - Schreib untereinander
   - Rechne spaltenweise von RECHTS nach LINKS
   - Wenn oben kleiner als unten: BORGEN! 🔒

💡 MERKSATZ: "Wenn oben kleiner als unten: BORGEN von links!"`
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

  return `✖️ SCHRIFTLICHE MULTIPLIKATION - Methode mit Beispiel:

💡 BEISPIEL MIT ANDEREN ZAHLEN (NICHT DEINE AUFGABE!):
Aufgabe: 23 × 4 = ?

📝 SCHRITT 1: Zerlege die erste Zahl
   23 = 20 + 3

📝 SCHRITT 2: Multipliziere JEDEN Teil
   • 20 × 4 = 80
   • 3 × 4 = 12

📝 SCHRITT 3: Addiere die Ergebnisse
   80 + 12 = 92

✅ BEISPIEL-ERGEBNIS: 23 × 4 = 92

📌 JETZT DEINE AUFGABE:
   Nutze diese Methode für DEINE Zahlen! 🔒

💡 MERKSATZ: "Zerlegen, Multiplizieren, Addieren!"`
}

export function generateTipForDivision(): string {
  return `➗ DIVISION - Methode mit Beispiel:

💡 BEISPIEL MIT ANDEREN ZAHLEN (NICHT DEINE AUFGABE!):
Aufgabe: 20 ÷ 5 = ?

📝 SCHRITT 1: Verstehe Division
   20 ÷ 5 bedeutet: "Teile 20 in 5 gleiche Teile"

📝 SCHRITT 2: Verteile fair
   • Du hast 20 Sachen
   • 5 Personen
   • Jeder bekommt: ?

📝 SCHRITT 3: Teile auf
   Jede Person bekommt 4 Sachen

📝 SCHRITT 4: Kontrolle
   5 × 4 = 20 ✓

✅ BEISPIEL-ERGEBNIS: 20 ÷ 5 = 4

📌 JETZT DEINE AUFGABE:
   Nutze diese Methode für DEINE Zahlen! 🔒

💡 MERKSATZ: "Division = Fair verteilen in gleiche Teile!"`
}
