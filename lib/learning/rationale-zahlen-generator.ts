/**
 * Task-Generator für Rationale Zahlen
 * Erzeugt echte Aufgaben zum Rechnen mit Tipps
 */

import { RATIONALE_ZAHLEN_CONTENT } from "./rationale-zahlen"

export function generateRationaleZahlenTasks(difficulty: number, count: number = 5) {
  const tasks = []
  const taskTypes = [
    "PLACE_ON_NUMBER_LINE",  // Zahlenstrahl first (neu!)
    "COMPARE_TEMPERATURES",
    "PLACE_ON_NUMBER_LINE",  // 2x Zahlenstrahl
    "TEMPERATURE_DIFFERENCE",
    "COMPARE_NEGATIVES",
    "PLACE_ON_NUMBER_LINE",  // 3x Zahlenstrahl
    "ORDER_TEMPERATURES",
  ]

  for (let i = 0; i < count; i++) {
    const typeIndex = i % taskTypes.length
    const taskType = taskTypes[typeIndex]
    const task = generateTask(taskType, difficulty)
    if (task) tasks.push(task)
  }

  return tasks
}

function generateTask(taskType: string, difficulty: number) {
  switch (taskType) {
    case "READ_THERMOMETER":
      return generateReadThermometer()

    case "COMPARE_TEMPERATURES":
      return generateCompareTempTask()

    case "ORDER_TEMPERATURES":
      return generateOrderTask()

    case "TEMPERATURE_DIFFERENCE":
      return generateDifferenceTask()

    case "COMPARE_NEGATIVES":
      return generateCompareNegatives()

    case "PLACE_ON_NUMBER_LINE":
      return generateNumberLineTask()

    default:
      return null
  }
}

function generateReadThermometer() {
  const temps = [-15, -9, -7, 0, 6, 12, 20]
  const temp = temps[Math.floor(Math.random() * temps.length)]
  return {
    id: `task-thermo-${Math.random()}`,
    title: "Thermometer ablesen",
    problem_statement: `Das Thermometer zeigt an: Welche Temperatur ist es?`,
    taskType: "READ_THERMOMETER",
    difficulty_level: 1,
    category: "conceptual",
    solution: `${temp}°C`,
    taskData: {
      thermometerMark: temp,
      hint1: `Schau auf die rote Flüssigkeit im Thermometer: Wie weit steigt sie nach oben? Folge der Linie von der Markierung nach links zur Temperaturskala.`,
      hint2: `Die Zahlen ÜBER 0 sind Plus-Grade (warm). Die Zahlen UNTER 0 sind Minus-Grade (kalt/Frost). Wo ist die rote Linie? Oben oder unten?`,
      hint3: `Die rote Linie zeigt auf ${temp}. Das bedeutet ${temp}°C (${temp > 0 ? "warm - über Null" : temp === 0 ? "genau Null (Gefrierpunkt)" : "kalt - unter Null"})`,
    },
  }
}

function generateCompareTempTask() {
  const pairs = [
    { t1: 6, t2: -7, colder: "-7", warmer: 6 },
    { t1: -9, t2: -15, colder: "-15", warmer: -9 },
    { t1: 12, t2: 5, colder: "5", warmer: 12 },
    { t1: -2, t2: 3, colder: "-2", warmer: 3 },
  ]
  const pair = pairs[Math.floor(Math.random() * pairs.length)]

  return {
    id: `task-compare-${Math.random()}`,
    title: "Temperaturen vergleichen",
    problem_statement: `Welche Temperatur ist kälter: ${pair.t1}°C oder ${pair.t2}°C?`,
    difficulty_level: 1,
    category: "conceptual",
    solution: `${pair.colder}°C ist kälter`,
    taskData: {
      hint1: `Schau dir beide Zahlen an: ${pair.t1}°C und ${pair.t2}°C. Frage dich: Welche ist negativ (Minus)? Welche ist positiv (Plus)?`,
      hint2: `REGEL zum Merken: Negative Zahlen sind IMMER kälter/kleiner als positive Zahlen. Wenn eine Zahl negativ ist (Minus-Zeichen), dann ist sie auf jeden Fall die kältere!`,
      hint3: `Lösung: Zwischen ${pair.t1}°C und ${pair.t2}°C ist ${pair.colder}°C die Antwort. Du kannst schreiben: "${pair.colder}" oder "${pair.colder}°C ist kälter".`,
    },
  }
}

function generateOrderTask() {
  const sets = [
    {
      temps: [5, -3, 0, 12, -7],
      ordered: "-7 < -3 < 0 < 5 < 12",
    },
    {
      temps: [20, -10, 8, -5, 0],
      ordered: "-10 < -5 < 0 < 8 < 20",
    },
    {
      temps: [3, -8, 15, -2, 6],
      ordered: "-8 < -2 < 3 < 6 < 15",
    },
  ]
  const set = sets[Math.floor(Math.random() * sets.length)]

  return {
    id: `task-order-${Math.random()}`,
    title: "Temperaturen ordnen",
    problem_statement: `Ordne diese Temperaturen von kalt zu warm: ${set.temps.join("°C | ")}°C`,
    difficulty_level: 2,
    category: "conceptual",
    solution: set.ordered,
    taskData: {
      hint1: "Beginne mit der kleinsten (kältesten) Zahl!",
      hint2: "Nutze: Negative < Null < Positive",
      hint3: `Die richtige Reihenfolge ist: ${set.ordered}`,
    },
  }
}

function generateDifferenceTask() {
  const examples = [
    {
      t1: 56.7,
      t2: -89.2,
      diff: 145.9,
      calc: "56,7 - (-89,2) = 56,7 + 89,2 = 145,9",
    },
    {
      t1: 20,
      t2: -10,
      diff: 30,
      calc: "20 - (-10) = 20 + 10 = 30",
    },
    {
      t1: 15,
      t2: -5,
      diff: 20,
      calc: "15 - (-5) = 15 + 5 = 20",
    },
  ]
  const ex = examples[Math.floor(Math.random() * examples.length)]

  return {
    id: `task-diff-${Math.random()}`,
    title: "Temperaturunterschiede berechnen",
    problem_statement: `Unterschied zwischen ${ex.t1}°C und ${ex.t2}°C?`,
    difficulty_level: 2,
    category: "calculation",
    solution: ex.diff.toString(),
    taskData: {
      hint1: `Die DIFFERENZ (der Unterschied) findest du durch MINUS rechnen: ${ex.t1} - (${ex.t2}). Beachte: Von der höheren Temperatur (${ex.t1}) subtrahierst du die tiefere (${ex.t2}).`,
      hint2: `WICHTIGE REGEL: MINUS vor einer Klammer mit negativer Zahl → wird zu PLUS! Also: - (${ex.t2}) wird zu + ${Math.abs(ex.t2)}. Deshalb: ${ex.t1} + ${Math.abs(ex.t2)} = ${ex.diff}`,
      hint3: `Schritt für Schritt: ${ex.calc} = ${ex.diff}. Das ist der Temperatur-Unterschied zwischen den beiden Orten!`,
    },
  }
}

function generateCompareNegatives() {
  const pairs = [
    { n1: -71.2, n2: -23.9, smaller: "-71.2" },
    { n1: -12, n2: -2, smaller: "-12" },
    { n1: -50, n2: -30, smaller: "-50" },
  ]
  const pair = pairs[Math.floor(Math.random() * pairs.length)]

  return {
    id: `task-cmpneg-${Math.random()}`,
    title: "Negative Zahlen vergleichen",
    problem_statement: `Welche Zahl ist KLEINER? ${pair.n1} oder ${pair.n2}?`,
    difficulty_level: 2,
    category: "conceptual",
    solution: pair.smaller,
    taskData: {
      hint1: `Beide Zahlen sind negativ: ${pair.n1} und ${pair.n2}. Tipp: Welche hat den größeren Abstand zu Null (0)?`,
      hint2: `Merke: Bei negativen Zahlen - Je WEITER WEG von Null (größerer Betrag), desto KLEINER die Zahl! Vergleich: |${pair.n1}| vs |${pair.n2}|. Welche ist größer?`,
      hint3: `Lösung: ${pair.smaller} ist die kleinere Zahl (hat den größeren Abstand zu Null).`,
    },
  }
}

function generateNumberLineTask() {
  const ranges = [
    { min: -10, max: 10, value: -3 },
    { min: -5, max: 5, value: 2 },
    { min: 0, max: 20, value: 8 },
  ]
  const range = ranges[Math.floor(Math.random() * ranges.length)]

  return {
    id: `task-nline-${Math.random()}`,
    title: "Zahlen auf der Zahlengerade",
    problem_statement: `Wo liegt die Zahl ${range.value}? (Zahlenstrahl: ${range.min} bis ${range.max})`,
    difficulty_level: 1,
    category: "conceptual",
    solution: range.value.toString(),
    taskData: {
      range: [range.min, range.max],
      value: range.value,
      hint1: "Schau auf den Zahlenstrahl!",
      hint2: `Positive Zahlen sind RECHTS von Null!`,
      hint3: `Die Antwort ist: ${range.value}`,
    },
  }
}
