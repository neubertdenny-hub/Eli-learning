/**
 * Example Generator für Tipps
 * Generiert ANDERE Aufgaben als Beispiele (nicht die aktuelle!)
 * Damit die Schüler nicht einfach abschreiben können
 */

export interface ExampleTask {
  problem: string
  solution: string
}

export function generateExampleTask(
  originalProblem: string,
  taskType: string,
  difficulty: "einfach" | "mittel" | "schwer"
): ExampleTask {
  // Addition
  if (taskType === "addition") {
    if (difficulty === "einfach") {
      const examples = [
        { problem: "5 + 3 = ?", solution: "8" },
        { problem: "7 + 2 = ?", solution: "9" },
        { problem: "4 + 6 = ?", solution: "10" },
        { problem: "8 + 1 = ?", solution: "9" },
      ]
      return examples[Math.floor(Math.random() * examples.length)]
    }
    if (difficulty === "mittel" || difficulty === "schwer") {
      const examples = [
        { problem: "345 + 278 = ?", solution: "623" },
        { problem: "456 + 234 = ?", solution: "690" },
        { problem: "123 + 567 = ?", solution: "690" },
        { problem: "789 + 211 = ?", solution: "1000" },
        { problem: "234 + 345 = ?", solution: "579" },
      ]
      return examples[Math.floor(Math.random() * examples.length)]
    }
  }

  // Subtraktion
  if (taskType === "subtraction") {
    if (difficulty === "einfach") {
      const examples = [
        { problem: "8 - 3 = ?", solution: "5" },
        { problem: "9 - 2 = ?", solution: "7" },
        { problem: "10 - 4 = ?", solution: "6" },
        { problem: "7 - 5 = ?", solution: "2" },
      ]
      return examples[Math.floor(Math.random() * examples.length)]
    }
    if (difficulty === "schwer") {
      const examples = [
        { problem: "1000 - 567 = ?", solution: "433" },
        { problem: "800 - 234 = ?", solution: "566" },
        { problem: "900 - 456 = ?", solution: "444" },
        { problem: "1500 - 789 = ?", solution: "711" },
      ]
      return examples[Math.floor(Math.random() * examples.length)]
    }
  }

  // Multiplikation
  if (taskType === "multiplication") {
    if (difficulty === "einfach") {
      const examples = [
        { problem: "3 × 4 = ?", solution: "12" },
        { problem: "5 × 2 = ?", solution: "10" },
        { problem: "6 × 3 = ?", solution: "18" },
        { problem: "4 × 5 = ?", solution: "20" },
      ]
      return examples[Math.floor(Math.random() * examples.length)]
    }
    if (difficulty === "mittel" || difficulty === "schwer") {
      const examples = [
        { problem: "23 × 4 = ?", solution: "92" },
        { problem: "34 × 5 = ?", solution: "170" },
        { problem: "45 × 3 = ?", solution: "135" },
        { problem: "56 × 2 = ?", solution: "112" },
      ]
      return examples[Math.floor(Math.random() * examples.length)]
    }
  }

  // Division
  if (taskType === "division") {
    const examples = [
      { problem: "12 ÷ 3 = ?", solution: "4" },
      { problem: "20 ÷ 5 = ?", solution: "4" },
      { problem: "18 ÷ 6 = ?", solution: "3" },
      { problem: "24 ÷ 4 = ?", solution: "6" },
    ]
    return examples[Math.floor(Math.random() * examples.length)]
  }

  // Bruchrechnung
  if (taskType === "fraction") {
    const examples = [
      { problem: "1/4 + 2/4 = ?", solution: "3/4" },
      { problem: "2/5 + 1/5 = ?", solution: "3/5" },
      { problem: "1/6 + 2/6 = ?", solution: "3/6 oder 1/2" },
    ]
    return examples[Math.floor(Math.random() * examples.length)]
  }

  // Negative Zahlen
  if (taskType === "negative") {
    const examples = [
      { problem: "-5 + 3 = ?", solution: "-2" },
      { problem: "-7 + 4 = ?", solution: "-3" },
      { problem: "-2 + 8 = ?", solution: "6" },
      { problem: "-10 + 5 = ?", solution: "-5" },
    ]
    return examples[Math.floor(Math.random() * examples.length)]
  }

  // Fallback
  return {
    problem: "5 + 3 = ?",
    solution: "8",
  }
}
