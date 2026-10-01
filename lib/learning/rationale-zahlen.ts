/**
 * Rationale Zahlen
 * Comprehensive curriculum: negative & positive numbers via real-world temperatures
 * Based on German "Alles klar" textbook (Rationale Zahlen - Seiten 10, 14)
 */

export const RATIONALE_ZAHLEN_CONTENT = {
  themeId: "rationale-zahlen",
  themeName: "Rationale Zahlen",
  description: "Positive und negative Zahlen verstehen durch Temperaturen der Welt",
  difficulty: "medium",
  icon: "🌡️",

  foundations: [
    "positive_numbers",
    "negative_numbers",
    "number_line",
    "comparison_integers",
    "absolute_value",
  ],

  realWorldExamples: [
    {
      location: "Tal des Todes, USA",
      temperature: 56.7,
      context: "Heißester Ort der Welt",
    },
    {
      location: "Oimjakon, Sibirien",
      temperature: -71.2,
      context: "Einer der kältesten bewohnten Orte",
    },
    {
      location: "Station Wostok, Antarktis",
      temperature: -89.2,
      context: "Der kälteste Ort der Erde",
    },
    {
      location: "Ifrane, Marokko",
      temperature: -23.9,
      context: "Kälteste Temperatur in Afrika",
    },
    {
      location: "Tirat Zvi, Israel",
      temperature: 53.9,
      context: "Höchste Temperatur in Asien",
    },
    {
      location: "El Azizia, Libyen",
      temperature: 58.0,
      context: "Höchste gemessene Temperatur",
    },
    {
      location: "Rivadavia, Argentinien",
      temperature: -48.9,
      context: "Kälteste Temperatur in Südamerika",
    },
    {
      location: "North-Ice, Grönland",
      temperature: -66.1,
      context: "Extrem kalte Region",
    },
  ],

  // Section 1: Understanding Rational Numbers (Introduction)
  section1_introduction: {
    title: "Rationale Zahlen",
    learningGoals: [
      "was rationale Zahlen sind",
      "wie man rationale Zahlen addiert und subtrahiert",
      "wie man rationale Zahlen multipliziert und dividiert",
      "welche Bedeutung Klammern in Rechnungen haben",
      "in welcher Reihenfolge man Rechenausdrücke berechnet",
    ],
    keyMerke: {
      negative_numbers: "Negative Zahlen sind KLEINER als null. Bei Temperaturen: unter 0°C ist Frost!",
      positive_numbers: "Positive Zahlen sind GRÖSSER als null.",
      zero: "Null (0) ist weder positiv noch negativ.",
      number_line: "Auf dem Zahlenstrahl: je weiter LINKS, desto kleiner. Je weiter RECHTS, desto größer.",
    },
  },

  // Section 2: Comparing and Ordering Rational Numbers
  section2_comparing: {
    title: "Rationale Zahlen vergleichen und ordnen",
    context: "Rationale Zahlen lassen sich wie Temperaturangaben vergleichen.",
    key_insight: "Die kleinere von zwei rationalen Zahlen liegt auf der Zahlengerade weiter LINKS.",
  },

  tasks: [
    // === SECTION 1: INTRODUCTION TASKS ===

    // Task 1: Read temperatures from thermometers
    {
      type: "READ_THERMOMETER",
      section: 1,
      difficulty: "easy",
      text: "Liest die Temperatur ab: Das Thermometer zeigt zwischen 0°C und 20°C.",
      correctAnswer: "6°C",
      concept: "Temperaturen von Thermometern ablesen",
      thermometerMark: 6,
    },

    {
      type: "READ_THERMOMETER",
      section: 1,
      difficulty: "easy",
      text: "Liest die Temperatur ab: Das Thermometer zeigt zwischen -15°C und 0°C.",
      correctAnswer: "-9°C",
      concept: "Negative Temperaturen ablesen",
      thermometerMark: -9,
    },

    // Task 2: Simple temperature comparison
    {
      type: "COMPARE_TEMPERATURES",
      section: 1,
      difficulty: "easy",
      text: "Vergleiche: Welche Temperatur ist kälter? 6°C oder -7°C?",
      correctAnswer: "-7°C ist kälter",
      concept: "Negative Temperaturen sind KÄLTER als positive",
      options: ["6°C ist kälter", "-7°C ist kälter", "Sie sind gleich"],
    },

    {
      type: "COMPARE_TEMPERATURES",
      section: 1,
      difficulty: "easy",
      text: "Vergleiche: Welche Temperatur ist wärmer? -9°C oder -15°C?",
      correctAnswer: "-9°C ist wärmer",
      concept: "Je näher an Null, desto wärmer (bei Negativen)",
      options: ["-9°C ist wärmer", "-15°C ist wärmer", "Sie sind gleich"],
    },

    // Task 3: Place on number line
    {
      type: "PLACE_ON_NUMBER_LINE",
      section: 1,
      difficulty: "easy",
      text: "Wo liegt -3 auf dem Zahlenstrahl? (zwischen -5 und 0)",
      correctAnswer: "-3",
      concept: "Negative Zahlen auf der Zahlengerade darstellen",
      range: [-5, 0],
      value: -3,
    },

    {
      type: "PLACE_ON_NUMBER_LINE",
      section: 1,
      difficulty: "easy",
      text: "Wo liegt +4 auf dem Zahlenstrahl? (zwischen 0 und +10)",
      correctAnswer: "+4 oder 4",
      concept: "Positive Zahlen auf der Zahlengerade darstellen",
      range: [0, 10],
      value: 4,
    },

    // Task 4: Temperature differences (Addition with negatives)
    {
      type: "TEMPERATURE_DIFFERENCE",
      section: 1,
      difficulty: "medium",
      text: "Unterschied zwischen +56,7°C und -89,2°C? (Höchste und tiefste Temperatur)",
      correctAnswer: 145.9,
      concept: "Differenz berechnen: 56,7 - (-89,2) = 56,7 + 89,2 = 145,9",
    },

    {
      type: "TEMPERATURE_DIFFERENCE",
      section: 1,
      difficulty: "medium",
      text: "Unterschied zwischen 6°C und -7°C?",
      correctAnswer: 13,
      concept: "Differenz mit Vorzeichen: 6 - (-7) = 13",
    },

    // Task 5: Ordering on number line
    {
      type: "ORDER_ON_NUMBER_LINE",
      section: 1,
      difficulty: "medium",
      text: "Ordne auf einer Zahlengerade: -4, -2, 0, +2, +4",
      correctAnswer: "-4 < -2 < 0 < +2 < +4",
      concept: "Alle Zahlen in richtiger Reihenfolge von klein zu groß",
    },

    // === SECTION 2: COMPARING AND ORDERING TASKS ===

    // Task 6: European temperature comparison (from map context)
    {
      type: "COMPARE_EUROPEAN_TEMPS",
      section: 2,
      difficulty: "medium",
      text: "In welchen Städten ist es kälter als in Berlin? Berlin: -5°C",
      correctAnswer: "Alle mit Werten < -5°C",
      concept: "Rationale Zahlen in realem Kontext (Europa) vergleichen",
      cities: {
        Berlin: -5,
        Paris: -3,
        London: -1,
        Moskau: -15,
        Istanbul: 5,
      },
    },

    // Task 7: Order multiple temperatures
    {
      type: "ORDER_TEMPERATURES",
      section: 2,
      difficulty: "medium",
      text: "Ordne die Temperaturen von kalt zu warm: 56,7°C | -66,1°C | -23,9°C | 53,9°C | -89,2°C",
      correctAnswer: "-89,2 < -66,1 < -23,9 < 53,9 < 56,7",
      concept: "Rationale Zahlen der Größe nach ordnen (ganze Liste)",
    },

    // Task 8: Compare negative numbers (crucial insight)
    {
      type: "COMPARE_NEGATIVES",
      section: 2,
      difficulty: "hard",
      text: "Welche ist kälter? -71,2°C oder -23,9°C?",
      correctAnswer: "-71,2°C ist kälter (weil -71,2 < -23,9)",
      concept: "Je weiter LINKS von Null, desto KÄLTER. -71,2 ist viel weiter weg von Null.",
      explanation: "-71,2 < -23,9 weil -71,2 weiter weg von Null ist (größerer Abstand zum Nullpunkt)",
    },

    {
      type: "COMPARE_NEGATIVES",
      section: 2,
      difficulty: "hard",
      text: "Welche Zahl ist kleiner? -12 oder -2?",
      correctAnswer: "-12 ist kleiner",
      concept: "Bei negativen Zahlen: größerer Betrag = kleinere Zahl",
      explanation: "-12 liegt weiter LINKS auf dem Zahlenstrahl als -2",
    },

    // Task 9: Using comparison symbols (<, >, =)
    {
      type: "COMPARISON_SYMBOLS",
      section: 2,
      difficulty: "easy",
      text: "Setze das richtige Zeichen: -5 ⬚ -3",
      correctAnswer: "<",
      concept: "Vergleichssymbole korrekt anwenden",
      options: ["<", ">", "="],
    },

    {
      type: "COMPARISON_SYMBOLS",
      section: 2,
      difficulty: "easy",
      text: "Setze das richtige Zeichen: +8 ⬚ -8",
      correctAnswer: ">",
      concept: "Positive Zahlen sind IMMER größer als negative",
      options: ["<", ">", "="],
    },

    // Task 10: Between two numbers
    {
      type: "FIND_BETWEEN",
      section: 2,
      difficulty: "medium",
      text: "Welche Zahl liegt zwischen -5 und -3? (-5 < ⬚ < -3)",
      correctAnswer: "-4",
      concept: "Rationale Zahlen zwischen zwei gegebenen Werten finden",
      options: ["-6", "-4", "-2", "-1"],
    },

    // Task 11: Reading temperatures with ordering
    {
      type: "READ_AND_ORDER_TEMPS",
      section: 2,
      difficulty: "medium",
      text: "Ordne nach der Größe (von klein zu groß): -2°C, 8°C, -11°C, -6°C, 3°C",
      correctAnswer: "-11°C < -6°C < -2°C < 3°C < 8°C",
      concept: "Mehrere Temperaturen nach Größe sortieren",
    },

    // Task 12: Absolute value / Distance from zero
    {
      type: "DISTANCE_FROM_ZERO",
      section: 2,
      difficulty: "medium",
      text: "Welche Zahl hat den größeren Abstand zu Null? -71,2 oder +56,7?",
      correctAnswer: "-71,2 (Abstand ≈ 71,2)",
      concept: "Abstand zur Null verstehen (Betrag, aber intuitiv erklärt)",
    },
  ],

  explanations: {
    why_negative: "Negative Zahlen zeigen Werte unter Null. Bei Temperatur: unter 0°C ist Frost!",
    comparison_rule:
      "Auf dem Zahlenstrahl: Je weiter LINKS, desto KLEINER. Je weiter RECHTS, desto GRÖSSER.",
    negative_comparison:
      "-71,2 < -23,9 weil -71,2 weiter weg von Null ist (kälter/kleinerer Wert)",
    zero_reference:
      "Null ist der Referenzpunkt. Alles LINKS ist negativ (kleiner). Alles RECHTS ist positiv (größer).",
    positive_vs_negative:
      "Jede positive Zahl ist GRÖSSER als jede negative Zahl. Beispiel: -1000 < 1",
  },

  // Teaching strategy tips
  pedagogical_notes: {
    thermometer_concrete: "Start with real thermometers. Students see -7°C is colder than -2°C intuitively.",
    number_line_essential:
      "The number line is KEY. Draw it constantly. Show that LEFTNESS = smallness.",
    avoid_sign_confusion:
      "Many students confuse 'negative = smaller' with 'negative number looks bigger'. Use thermometers to anchor understanding.",
    european_context:
      "The Europe temperature map helps students see these are real, comparable quantities (Berlin vs Moscow is a natural comparison).",
    spacing_matters:
      "Students often think -100 is 'bigger' because of the magnitude. Emphasize the position on the line, not the magnitude.",
  },
};
