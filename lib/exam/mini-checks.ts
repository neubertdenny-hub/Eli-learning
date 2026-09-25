/**
 * Phase 7E: Mini Checks & Transfer Tasks
 * Adaptive Wissenstests nach LEARN/PRACTICE Sessions
 * Transfer-Aufgaben kombinieren Multiple Topics
 */

export interface MiniCheckQuestion {
  id: string
  topicId: string
  topicName: string
  questionText: string
  questionType: "multiple-choice" | "short-answer" | "calculation"
  options?: string[] // Für multiple-choice
  correctAnswer: string
  explanation: string
  difficulty: "easy" | "medium" | "hard"
  estimatedSeconds: number
}

export interface TransferTask {
  id: string
  title: string
  description: string
  relatedTopicIds: string[]
  relatedTopicNames: string[]
  taskText: string
  steps: string[]
  expectedOutput: string
  difficulty: "medium" | "hard"
  estimatedMinutes: number
  hints: string[]
}

export interface MiniCheckSession {
  id: string
  topicId: string
  topicName: string
  startedAt: string
  completedAt?: string
  questions: MiniCheckQuestion[]
  userAnswers: Record<string, string> // questionId -> answer
  score?: number // 0-100
  timeSpent?: number // seconds
  isCorrect?: Record<string, boolean>
  nextAction?: "continue" | "practice-more" | "move-on"
}

/**
 * Generiere Mini-Check für ein Topic
 * 5-10 Minuten, 5-8 Fragen
 */
export function generateMiniCheck(
  topicId: string,
  topicName: string,
  mastery: number,
  difficulty: "easy" | "medium" | "hard" = "medium"
): MiniCheckSession {
  const questionCount = difficulty === "hard" ? 8 : difficulty === "medium" ? 6 : 5
  const questions = generateMiniCheckQuestions(topicId, topicName, questionCount, difficulty, mastery)

  return {
    id: `minicheck-${topicId}-${Date.now()}`,
    topicId,
    topicName,
    startedAt: new Date().toISOString(),
    questions,
    userAnswers: {},
  }
}

/**
 * Generiere Multiple-Choice Fragen für Mini-Check
 */
function generateMiniCheckQuestions(
  topicId: string,
  topicName: string,
  count: number,
  difficulty: "easy" | "medium" | "hard",
  mastery: number
): MiniCheckQuestion[] {
  const questions: MiniCheckQuestion[] = []

  // Topic-spezifische Fragen
  const questionTemplates = getQuestionTemplates(topicId, topicName, difficulty, mastery)

  for (let i = 0; i < Math.min(count, questionTemplates.length); i++) {
    const template = questionTemplates[i]
    questions.push({
      id: `q-${topicId}-${i}`,
      topicId,
      topicName,
      questionText: template.questionText ?? "Frage",
      questionType: template.questionType ?? "multiple-choice",
      options: template.options,
      correctAnswer: template.correctAnswer ?? "",
      explanation: template.explanation ?? "",
      difficulty: template.difficulty ?? "medium",
      estimatedSeconds: template.estimatedSeconds ?? 30,
    } as MiniCheckQuestion)
  }

  return questions
}

/**
 * Template-Fragen für verschiedene Math-Topics
 */
function getQuestionTemplates(
  topicId: string,
  topicName: string,
  difficulty: "easy" | "medium" | "hard",
  mastery: number
): Partial<MiniCheckQuestion>[] {
  const lower = topicId.toLowerCase()

  // Bruchrechnung
  if (lower.includes("bruch")) {
    return getBruchfragen(difficulty)
  }

  // Negative Zahlen
  if (lower.includes("negativ")) {
    return getNegativFragen(difficulty)
  }

  // Multiplikation/Division
  if (lower.includes("multiplik") || lower.includes("divid")) {
    return getMultiplikationFragen(difficulty)
  }

  // Prozentrechnung
  if (lower.includes("prozent")) {
    return getProzentFragen(difficulty)
  }

  // Fallback: Generische Fragen
  return getGenericFragen(topicName, difficulty)
}

function getBruchfragen(difficulty: "easy" | "medium" | "hard"): Partial<MiniCheckQuestion>[] {
  if (difficulty === "easy") {
    return [
      {
        questionText: "Kürze den Bruch: 2/4 = ?",
        questionType: "multiple-choice",
        options: ["1/2", "1/3", "2/3", "1/4"],
        correctAnswer: "1/2",
        explanation: "Beide Zahlen sind durch 2 teilbar: 2÷2=1, 4÷2=2",
        difficulty: "easy",
        estimatedSeconds: 30,
      },
      {
        questionText: "Was ist 1/3 + 1/3?",
        questionType: "multiple-choice",
        options: ["1/6", "2/3", "2/6", "1/3"],
        correctAnswer: "2/3",
        explanation: "Gleiche Nenner: 1+1=2, Nenner bleibt 3 → 2/3",
        difficulty: "easy",
        estimatedSeconds: 30,
      },
    ]
  }

  return [
    {
      questionText: "Addiere: 3/4 + 2/5 = ?",
      questionType: "multiple-choice",
      options: ["5/9", "23/20", "5/20", "1"],
      correctAnswer: "23/20",
      explanation: "Hauptnenner: 20. 3/4 = 15/20, 2/5 = 8/20. 15+8=23 → 23/20",
      difficulty: difficulty === "hard" ? "hard" : "medium",
      estimatedSeconds: 60,
    },
    {
      questionText: "Multipliziere: 2/3 × 3/4 = ?",
      questionType: "multiple-choice",
      options: ["6/12", "1/2", "5/7", "6/7"],
      correctAnswer: "1/2",
      explanation: "Zaehler: 2×3=6. Nenner: 3×4=12. Kuerzen: 6/12 = 1/2",
      difficulty: "medium",
      estimatedSeconds: 45,
    },
  ]
}

function getNegativFragen(difficulty: "easy" | "medium" | "hard"): Partial<MiniCheckQuestion>[] {
  return [
    {
      questionText: "Berechne: -5 + 3 = ?",
      questionType: "multiple-choice",
      options: ["-2", "2", "-8", "8"],
      correctAnswer: "-2",
      explanation: "Von -5 aus gehen wir 3 nach rechts: -5 + 3 = -2",
      difficulty: "easy",
      estimatedSeconds: 30,
    },
    {
      questionText: "Berechne: -4 × -3 = ?",
      questionType: "multiple-choice",
      options: ["-12", "12", "-7", "7"],
      correctAnswer: "12",
      explanation: "Minus mal Minus ergibt Plus: (-4) × (-3) = +12",
      difficulty: "medium",
      estimatedSeconds: 45,
    },
  ]
}

function getMultiplikationFragen(difficulty: "easy" | "medium" | "hard"): Partial<MiniCheckQuestion>[] {
  return [
    {
      questionText: "Berechne: 7 × 8 = ?",
      questionType: "multiple-choice",
      options: ["54", "56", "64", "72"],
      correctAnswer: "56",
      explanation: "7 × 8 = 56",
      difficulty: "easy",
      estimatedSeconds: 20,
    },
  ]
}

function getProzentFragen(difficulty: "easy" | "medium" | "hard"): Partial<MiniCheckQuestion>[] {
  return [
    {
      questionText: "Berechne: 10% von 50 = ?",
      questionType: "multiple-choice",
      options: ["5", "10", "50", "100"],
      correctAnswer: "5",
      explanation: "10% = 0,1. 0,1 × 50 = 5",
      difficulty: "easy",
      estimatedSeconds: 30,
    },
  ]
}

function getGenericFragen(topicName: string, difficulty: "easy" | "medium" | "hard"): Partial<MiniCheckQuestion>[] {
  return [
    {
      questionText: `Erklaere das Wichtigste bei ${topicName} in einem Satz.`,
      questionType: "short-answer",
      correctAnswer: "Student-generierte Antwort",
      explanation: "Dies ist eine offene Frage - deine Antwort wird manuell bewertet.",
      difficulty,
      estimatedSeconds: 120,
    },
  ]
}

/**
 * Generiere Transfer-Aufgaben zwischen Topics
 */
export function generateTransferTask(
  topicIds: string[],
  topicNames: string[],
  mastery: Record<string, number>,
  difficulty: "medium" | "hard" = "medium"
): TransferTask {
  const primary = topicIds[0]
  const secondary = topicIds.slice(1)

  return {
    id: `transfer-${primary}-${Date.now()}`,
    title: `${topicNames[0]} + ${topicNames[1] || "andere Topics"}`,
    description: `Kombiniere ${topicNames.join(" und ")} in einer realistischen Aufgabe`,
    relatedTopicIds: topicIds,
    relatedTopicNames: topicNames,
    taskText: generateTransferTaskText(topicNames, difficulty),
    steps: generateTransferSteps(topicNames, difficulty),
    expectedOutput: generateExpectedOutput(topicNames),
    difficulty,
    estimatedMinutes: difficulty === "hard" ? 15 : 10,
    hints: generateTransferHints(topicNames),
  }
}

function generateTransferTaskText(topics: string[], difficulty: "medium" | "hard"): string {
  if (topics.includes("Bruchrechnung") && topics.includes("Prozentrechnung")) {
    return `Eine Klasse hat 20 Schueler. 3/5 der Schueler bekamen eine 1, 2/5 bekamen eine 2.
    Wie viel Prozent der Klasse haben eine 1?`
  }

  if (topics.includes("Negative Zahlen") && topics.includes("Multiplikation")) {
    return `In einer Stadt wird es taeglich um 2 Grad kälter. Heute sind es 5 Grad.
    Wie kalt ist es in 3 Tagen?`
  }

  return `Kombiniere deine Faehigkeiten bei ${topics[0]} und ${topics[1] || "weiteren Topics"} in dieser Aufgabe.`
}

function generateTransferSteps(topics: string[], difficulty: "medium" | "hard"): string[] {
  return [
    `1. Identifiziere welche Techniken aus ${topics[0]} du brauchst`,
    ...(topics[1] ? [`2. Nutze auch Konzepte aus ${topics[1]}`] : []),
    `${topics[1] ? "3" : "2"}. Löse Schritt fuer Schritt`,
    `${topics[1] ? "4" : "3"}. Ueberprüfe dein Ergebnis`,
  ]
}

function generateExpectedOutput(topics: string[]): string {
  return `Eine vollständige Lösung mit allen Rechenschritten, die sowohl ${topics[0]}${
    topics[1] ? ` als auch ${topics[1]}` : ""
  } nutzt.`
}

function generateTransferHints(topics: string[]): string[] {
  return [
    `💡 Tipp 1: Beginne mit dem wichtigsten Konzept aus ${topics[0]}.`,
    ...(topics[1] ? [`💡 Tipp 2: Dann wende ${topics[1]} an.`] : []),
    `💡 Tipp 3: Schreibe alle Schritte auf.`,
  ]
}

/**
 * Bewerte Mini-Check Antworten
 */
export function scoreMiniCheck(session: MiniCheckSession): MiniCheckSession {
  let correctCount = 0
  const isCorrect: Record<string, boolean> = {}

  for (const question of session.questions) {
    const userAnswer = session.userAnswers[question.id]
    const correct: boolean = !!(userAnswer && normalizeAnswer(userAnswer) === normalizeAnswer(question.correctAnswer))

    isCorrect[question.id] = correct
    if (correct) correctCount++
  }

  const score = Math.round((correctCount / session.questions.length) * 100)
  const timeSpent = session.completedAt
    ? (new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime()) / 1000
    : 0

  // Bestimme nächste Aktion
  let nextAction: "continue" | "practice-more" | "move-on" = "move-on"
  if (score < 60) {
    nextAction = "practice-more" // Zu viele Fehler
  } else if (score < 80) {
    nextAction = "continue" // Noch Verbesserungspotential
  }

  return {
    ...session,
    completedAt: new Date().toISOString(),
    score,
    timeSpent,
    isCorrect,
    nextAction,
  }
}

/**
 * Normalisiere Antworten für Vergleich
 */
function normalizeAnswer(answer: string): string {
  return answer
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:]/g, "")
    .replace(/\s+/g, " ")
}

/**
 * Bestimme ob Mini-Check bestanden
 */
export function isMiniCheckPassed(session: MiniCheckSession): boolean {
  return session.score !== undefined && session.score >= 70
}

/**
 * Generiere Feedback nach Mini-Check
 */
export function generateMiniCheckFeedback(session: MiniCheckSession): string {
  if (!session.score) return "Test nicht bewertet"

  if (session.score >= 90) {
    return `Ausgezeichnet! Du beherrschst ${session.topicName} sehr gut (${session.score}%).`
  }

  if (session.score >= 80) {
    return `Sehr gut! Du kennst ${session.topicName} gut (${session.score}%). Kleine Wiederholung koennte helfen.`
  }

  if (session.score >= 70) {
    return `Bestanden! Du verstehst ${session.topicName} (${session.score}%). Aber uebe noch etwas mehr.`
  }

  if (session.score >= 50) {
    return `Du hast einige Luecken bei ${session.topicName} (${session.score}%). Lass uns nochmal ueben.`
  }

  return `${session.topicName} braucht noch Arbeit (${session.score}%). Lass uns von vorne beginnen.`
}
