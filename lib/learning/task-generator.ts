interface MathTask {
  id: string
  question: string
  answer: number | string
  type: string
  difficulty: "einfach" | "mittel" | "schwer"
  geometry?: {
    shape: "rectangle" | "square" | "triangle" | "circle" | "trapez" | "cylinder"
    data: Record<string, number>
  }
}

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomDifficulty(): "einfach" | "mittel" | "schwer" {
  const rand = Math.random()
  if (rand < 0.4) return "einfach"
  if (rand < 0.7) return "mittel"
  return "schwer"
}

export function generateAdditionTask(): MathTask {
  const difficulty = getRandomDifficulty()
  let num1, num2

  if (difficulty === "einfach") {
    num1 = getRandomNumber(10, 100)
    num2 = getRandomNumber(10, 100)
  } else if (difficulty === "mittel") {
    num1 = getRandomNumber(100, 500)
    num2 = getRandomNumber(100, 500)
  } else {
    num1 = getRandomNumber(500, 2000)
    num2 = getRandomNumber(500, 2000)
  }

  const answer = num1 + num2

  return {
    id: `add-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    question: `${num1} + ${num2} = ?`,
    answer,
    type: "addition",
    difficulty,
  }
}

export function generateSubtractionTask(): MathTask {
  const difficulty = getRandomDifficulty()
  let num1, num2

  if (difficulty === "einfach") {
    num1 = getRandomNumber(100, 200)
    num2 = getRandomNumber(10, 100)
  } else if (difficulty === "mittel") {
    num1 = getRandomNumber(500, 1000)
    num2 = getRandomNumber(100, 500)
  } else {
    num1 = getRandomNumber(1000, 5000)
    num2 = getRandomNumber(500, 1000)
  }

  num2 = Math.min(num2, num1 - 1)
  const answer = num1 - num2

  return {
    id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    question: `${num1} - ${num2} = ?`,
    answer,
    type: "subtraction",
    difficulty,
  }
}

export function generateMultiplicationTask(): MathTask {
  const difficulty = getRandomDifficulty()
  let num1, num2

  if (difficulty === "einfach") {
    num1 = parseFloat((Math.random() * 5 + 1).toFixed(1))
    num2 = getRandomNumber(2, 10)
  } else if (difficulty === "mittel") {
    num1 = parseFloat((Math.random() * 5 + 1).toFixed(1))
    num2 = getRandomNumber(5, 20)
  } else {
    num1 = parseFloat((Math.random() * 10 + 1).toFixed(2))
    num2 = parseFloat((Math.random() * 10 + 1).toFixed(1))
  }

  const answer = parseFloat((num1 * num2).toFixed(2))

  return {
    id: `mul-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    question: `${num1} × ${num2} = ?`,
    answer,
    type: "decimal",
    difficulty,
  }
}

export function generateDivisionTask(): MathTask {
  const difficulty = getRandomDifficulty()
  let divisor, dividend

  if (difficulty === "einfach") {
    divisor = getRandomNumber(2, 5)
    dividend = divisor * getRandomNumber(2, 10)
  } else if (difficulty === "mittel") {
    divisor = getRandomNumber(2, 10)
    dividend = divisor * getRandomNumber(5, 20)
  } else {
    divisor = parseFloat((Math.random() * 5 + 1).toFixed(1))
    dividend = parseFloat((divisor * (Math.random() * 20 + 10)).toFixed(1))
  }

  const answer = parseFloat((dividend / divisor).toFixed(2))

  return {
    id: `div-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    question: `${dividend} ÷ ${divisor} = ?`,
    answer,
    type: "decimal",
    difficulty,
  }
}

export function generateFractionTask(): MathTask {
  const difficulty = getRandomDifficulty()
  let num1, denom1, num2, denom2

  if (difficulty === "einfach") {
    denom1 = getRandomNumber(2, 8)
    num1 = getRandomNumber(1, denom1 - 1)
    denom2 = denom1
    num2 = getRandomNumber(1, denom1 - 1)
  } else {
    denom1 = getRandomNumber(2, 12)
    denom2 = getRandomNumber(2, 12)
    num1 = getRandomNumber(1, Math.min(denom1 - 1, 5))
    num2 = getRandomNumber(1, Math.min(denom2 - 1, 5))
  }

  const answer = parseFloat(((num1 / denom1 + num2 / denom2) * 100 / 100).toFixed(2))

  return {
    id: `frac-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    question: `${num1}/${denom1} + ${num2}/${denom2} = ?`,
    answer,
    type: "fraction",
    difficulty,
  }
}

export function generateNegativeNumberTask(): MathTask {
  const difficulty = getRandomDifficulty()
  const num1 = -getRandomNumber(2, 15)
  const num2 = getRandomNumber(-10, 10)

  const answer = num1 + num2

  return {
    id: `neg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    question: `${num1} + ${num2 >= 0 ? num2 : `(${num2})`} = ?`,
    answer,
    type: "negative",
    difficulty,
  }
}

export function generateEquationTask(): MathTask {
  const difficulty = getRandomDifficulty()
  const x = getRandomNumber(2, 20)
  let b, answer

  if (difficulty === "einfach") {
    b = getRandomNumber(5, 15)
    answer = x
    return {
      id: `eq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      question: `x + ${b} = ${x + b}, x = ?`,
      answer,
      type: "equation",
      difficulty,
    }
  } else if (difficulty === "mittel") {
    const coeff = getRandomNumber(2, 5)
    b = getRandomNumber(5, 10)
    answer = x
    return {
      id: `eq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      question: `${coeff}x + ${b} = ${coeff * x + b}, x = ?`,
      answer,
      type: "equation",
      difficulty,
    }
  } else {
    const coeff1 = getRandomNumber(2, 4)
    const coeff2 = getRandomNumber(1, 3)
    const c = getRandomNumber(5, 15)
    answer = getRandomNumber(5, 15)
    return {
      id: `eq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      question: `${coeff1}x + ${c} = ${coeff2}x + ${coeff1 * answer + c - coeff2 * answer}, x = ?`,
      answer,
      type: "equation",
      difficulty,
    }
  }
}

export function generateGeometryTask(): MathTask {
  const difficulty = getRandomDifficulty()
  const shapes: Array<"rectangle" | "square" | "triangle" | "circle" | "trapez" | "cylinder"> = [
    "rectangle",
    "square",
    "triangle",
    "circle",
    "trapez",
  ]
  const shape = shapes[Math.floor(Math.random() * shapes.length)]

  if (shape === "rectangle") {
    const length = getRandomNumber(2, 15)
    const width = getRandomNumber(2, 10)
    return {
      id: `geo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      question: `📏 Rechteck: Länge=${length}cm, Breite=${width}cm. Umfang = ?`,
      answer: 2 * (length + width),
      type: "geometry",
      difficulty,
      geometry: { shape, data: { length, width } },
    }
  } else if (shape === "square") {
    const side = getRandomNumber(2, 12)
    return {
      id: `geo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      question: `⬛ Quadrat: Seite=${side}cm. Fläche = ?`,
      answer: side * side,
      type: "geometry",
      difficulty,
      geometry: { shape, data: { side } },
    }
  } else if (shape === "triangle") {
    const base = getRandomNumber(3, 12)
    const height = getRandomNumber(2, 10)
    return {
      id: `geo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      question: `🔺 Dreieck: Basis=${base}cm, Höhe=${height}cm. Fläche = ?`,
      answer: (base * height) / 2,
      type: "geometry",
      difficulty,
      geometry: { shape, data: { base, height } },
    }
  } else if (shape === "circle") {
    const radius = getRandomNumber(2, 10)
    const answer = parseFloat((2 * radius * 3.14).toFixed(2))
    return {
      id: `geo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      question: `⭕ Kreis: Radius=${radius}cm. Umfang = ? (π≈3,14)`,
      answer,
      type: "geometry",
      difficulty,
      geometry: { shape, data: { radius } },
    }
  }

  return generateAdditionTask()
}

export function generateNewTask(topic: string): MathTask {
  switch (topic) {
    case "grundrechenarten":
      return Math.random() > 0.5 ? generateAdditionTask() : generateSubtractionTask()
    case "bruchrechnung":
      return generateFractionTask()
    case "negative-zahlen":
      return generateNegativeNumberTask()
    case "multiplikation":
      return generateMultiplicationTask()
    case "division":
      return generateDivisionTask()
    case "gleichungen":
      return generateEquationTask()
    case "geometrie":
      return generateGeometryTask()
    default:
      return generateAdditionTask()
  }
}
