/**
 * Rationale Zahlen
 * The "hard case": Negative numbers with real-world context (temperatures)
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
  ],

  tasks: [
    {
      type: "ORDER_TEMPERATURES",
      text: "Ordne die Temperaturen von kalt zu warm: 56,7°C | -66,1°C | -23,9°C | 53,9°C | -89,2°C",
      correctAnswer: "-89,2 < -66,1 < -23,9 < 53,9 < 56,7",
      concept: "Negative Zahlen sind KLEINER als positive Zahlen",
    },
    {
      type: "TEMPERATURE_DIFFERENCE",
      text: "Unterschied zwischen Tal des Todes (+56,7°C) und Station Wostok (-89,2°C)?",
      correctAnswer: 145.9,
      concept: "Differenz berechnen: 56,7 - (-89,2) = 145,9",
    },
    {
      type: "COMPARE_NEGATIVES",
      text: "Welche ist kälter? -71,2°C oder -23,9°C?",
      correctAnswer: "-71,2°C ist kälter",
      concept: "Je kleiner die negative Zahl, desto kälter",
    },
  ],

  explanations: {
    why_negative: "Negative Zahlen zeigen Werte unter Null. Bei Temperatur: unter 0°C ist Frost!",
    comparison:
      "-71,2 < -23,9 weil -71,2 weiter weg von Null ist (kälter)",
    number_line:
      "Auf dem Zahlenstrahl: je weiter LINKS, desto kleiner. Je weiter RECHTS, desto größer.",
  },
};
