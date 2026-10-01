/**
 * Task-Generator für Rationale Zahlen - BUCH-NIVEAU
 * Echte Nachhilfe-Lehrer Tipps + Realschul-Aufgaben
 */

import { RATIONALE_ZAHLEN_CONTENT } from "./rationale-zahlen"

export function generateRationaleZahlenTasks(difficulty: number, count: number = 5) {
  const tasks = []
  const taskTypes = [
    "READ_THERMOMETER", "COMPARE_TEMPERATURES", "PLACE_ON_NUMBER_LINE",
    "TEMPERATURE_DIFFERENCE", "COMPARE_NEGATIVES", "ORDER_TEMPERATURES",
  ]
  for (let i = 0; i < count; i++) {
    const taskType = taskTypes[i % taskTypes.length]
    const task = generateTask(taskType, difficulty)
    if (task) tasks.push(task)
  }
  return tasks
}

function generateTask(taskType: string, difficulty: number) {
  switch (taskType) {
    case "READ_THERMOMETER": return generateReadThermometer()
    case "COMPARE_TEMPERATURES": return generateCompareTempTask()
    case "ORDER_TEMPERATURES": return generateOrderTask()
    case "TEMPERATURE_DIFFERENCE": return generateDifferenceTask()
    case "COMPARE_NEGATIVES": return generateCompareNegatives()
    case "PLACE_ON_NUMBER_LINE": return generateNumberLineTask()
    default: return null
  }
}

function generateReadThermometer() {
  // NUR Werte die DIREKT auf Markierungen liegen - leicht ablesbar!
  const temps = [-20, -10, 0, 10, 20, 30]
  const temp = temps[Math.floor(Math.random() * temps.length)]
  return {
    id: `task-thermo-${Math.random()}`,
    title: "📖 Aufgabe: Thermometer ablesen",
    problem_statement: `Schaue auf das Thermometer. Die Flüssigkeit zeigt auf eine Markierung. Welche Temperatur zeigt das Thermometer an?`,
    taskType: "READ_THERMOMETER",
    difficulty_level: 1,
    category: "conceptual",
    solution: `${temp}°C`,
    taskData: {
      thermometerMark: temp,
      hint1: `STRATEGIE: Folge mit deinem Finger der Flüssigkeit nach LINKS zur Zahlenskala. Welche Zahl ist es?`,
      hint2: `MERKE: Die Skala hat zwei Seiten - POSITIVE Zahlen (oben) und NEGATIVE Zahlen (unten). Auf welcher Seite ist die Flüssigkeit?`,
      hint3: `Die Antwort: ${temp}°C. Das ist ${temp > 0 ? `${Math.abs(temp)} Grad ÜBER Null (warm)` : temp === 0 ? `genau NULL Grad (Gefrierpunkt)` : `${Math.abs(temp)} Grad UNTER Null (kalt)`}.`,
    },
  }
}

function generateCompareTempTask() {
  const pairs = [
    { t1: 6, t2: -7, colder: "-7", warmer: 6, rule: "negativ" },
    { t1: -9, t2: -15, colder: "-15", warmer: -9, rule: "betrag" },
    { t1: 12, t2: 5, colder: "5", warmer: 12, rule: "positiv" },
    { t1: -2, t2: 3, colder: "-2", warmer: 3, rule: "negativ" },
  ]
  const pair = pairs[Math.floor(Math.random() * pairs.length)]
  return {
    id: `task-compare-${Math.random()}`,
    title: "📖 Aufgabe: Zwei Temperaturen vergleichen",
    problem_statement: `Vergleiche: ${pair.t1}°C oder ${pair.t2}°C - Welche ist KÄLTER?`,
    difficulty_level: 2,
    category: "conceptual",
    solution: `${pair.colder}°C ist kälter`,
    taskData: {
      hint1: `SCHRITT 1 - BEOBACHTE: ${pair.t1}°C und ${pair.t2}°C. Hat eine Zahl ein Minus-Zeichen?`,
      hint2: `REGEL: ${pair.rule === "negativ" ? `Negative Zahlen sind IMMER kälter als positive!` : `Bei zwei negativen Zahlen: Je größer der Abstand zu Null, desto kälter!`}`,
      hint3: `LÖSUNG: ${pair.colder}°C ist kälter.`,
    },
  }
}

function generateOrderTask() {
  const sets = [
    { temps: [5, -3, 0, 12, -7], ordered: "-7, -3, 0, 5, 12" },
    { temps: [20, -10, 8, -5, 0], ordered: "-10, -5, 0, 8, 20" },
    { temps: [3, -8, 15, -2, 6], ordered: "-8, -2, 3, 6, 15" },
  ]
  const set = sets[Math.floor(Math.random() * sets.length)]
  return {
    id: `task-order-${Math.random()}`,
    title: "📖 Aufgabe: 5 Temperaturen ordnen (SCHWER!)",
    problem_statement: `Ordne diese 5 Temperaturen von KÄLTESTE zu WÄRMSTE: ${set.temps.join("°C | ")}°C\n\nSchreib: -8, -2, 3, 6, 15 (mit Kommas)`,
    difficulty_level: 3,
    category: "conceptual",
    solution: set.ordered,
    taskData: {
      hint1: `STRATEGIE: Teile in ZWEI GRUPPEN!\n• NEGATIVE: ${set.temps.filter(t => t < 0).sort((a,b) => a-b).join(", ")}\n• POSITIVE: ${set.temps.filter(t => t >= 0).sort((a,b) => a-b).join(", ")}\nWelche Gruppe kommt ZUERST?`,
      hint2: `ZAHLENSTRAHL VISUALISIEREN: Negative (LINKS) → Null → Positive (RECHTS). Ordne von LINKS nach RECHTS!`,
      hint3: `LÖSUNG: ${set.ordered}`,
    },
  }
}

function generateDifferenceTask() {
  const examples = [
    { t1: 20, t2: -10, diff: 30, calc: "20 - (-10) = 20 + 10 = 30" },
    { t1: 15, t2: -5, diff: 20, calc: "15 - (-5) = 15 + 5 = 20" },
    { t1: 25, t2: -15, diff: 40, calc: "25 - (-15) = 25 + 15 = 40" },
  ]
  const ex = examples[Math.floor(Math.random() * examples.length)]
  return {
    id: `task-diff-${Math.random()}`,
    title: "📖 Aufgabe: Temperaturunterschied berechnen",
    problem_statement: `Berechne den Unterschied zwischen ${ex.t1}°C und ${ex.t2}°C\n\nFormel: ${ex.t1} - (${ex.t2}) = ?`,
    difficulty_level: 3,
    category: "calculation",
    solution: ex.diff.toString(),
    taskData: {
      hint1: `SCHRITT 1: Schreib die Rechnung auf: ${ex.t1} - (${ex.t2})\n MERKE: Minus vor Klammer mit negativ = wird zu PLUS!`,
      hint2: `SCHRITT 2: - (${ex.t2}) wird zu + ${Math.abs(ex.t2)}\n Neue Rechnung: ${ex.t1} + ${Math.abs(ex.t2)}`,
      hint3: `SCHRITT 3 - LÖSUNG: ${ex.t1} + ${Math.abs(ex.t2)} = ${ex.diff}°C Unterschied!`,
    },
  }
}

function generateCompareNegatives() {
  const pairs = [
    { n1: -12, n2: -2, smaller: "-12" },
    { n1: -50, n2: -30, smaller: "-50" },
    { n1: -25, n2: -10, smaller: "-25" },
  ]
  const pair = pairs[Math.floor(Math.random() * pairs.length)]
  return {
    id: `task-cmpneg-${Math.random()}`,
    title: "📖 Aufgabe: Zwei negative Zahlen vergleichen (HART!)",
    problem_statement: `Welche Zahl ist KLEINER? ${pair.n1} oder ${pair.n2}?`,
    difficulty_level: 3,
    category: "conceptual",
    solution: pair.smaller,
    taskData: {
      hint1: `BEOBACHTE: Beide sind NEGATIV (Minus). Das ist der Knackpunkt! \n${pair.n1} und ${pair.n2} - Welche ist weiter weg von Null?`,
      hint2: `REGEL - MEMORIZE DIES: Bei negativen Zahlen gilt UMGEKEHRT!\n-50 ist KLEINER als -10, weil |-50| > |-10|!\nJe GRÖSSER der Abstand zu Null, desto KLEINER die negative Zahl!`,
      hint3: `LÖSUNG: ${pair.smaller} ist die kleinere Zahl. Der Abstand zu Null ist größer, deshalb ist es kleiner!`,
    },
  }
}

function generateNumberLineTask() {
  const ranges = [
    { min: -10, max: 10, value: -3 },
    { min: -5, max: 5, value: 2 },
    { min: -15, max: 15, value: -8 },
    { min: 0, max: 20, value: 12 },
  ]
  const range = ranges[Math.floor(Math.random() * ranges.length)]
  return {
    id: `task-nline-${Math.random()}`,
    title: "📖 Aufgabe: Zahl auf Zahlenstrahl platzieren",
    problem_statement: `Klick auf die richtige Position! Wo liegt ${range.value} auf dem Zahlenstrahl von ${range.min} bis ${range.max}?`,
    difficulty_level: 2,
    category: "conceptual",
    solution: range.value.toString(),
    taskData: {
      range: [range.min, range.max],
      value: range.value,
      hint1: `STRATEGIE: Schau die Zahlen an:\n• ${range.min} (LINKS/klein)\n• ${range.max} (RECHTS/groß)\n• ${range.value} - wo liegt es DAZWISCHEN?`,
      hint2: `REGEL: ${range.value < 0 ? `${range.value} ist NEGATIV → liegt LINKS von Null` : `${range.value} ist POSITIV → liegt RECHTS von Null`}`,
      hint3: `LÖSUNG: Klick auf die Markierung bei ${range.value}!`,
    },
  }
}
