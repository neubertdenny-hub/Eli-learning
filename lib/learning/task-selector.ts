/**
 * Task Selector
 *
 * Wählt konkrete Aufgaben basierend auf:
 * - Block Type (Current School, Foundation, Review, Challenge)
 * - Mastery Level
 * - Recent Performance
 * - Available School Materials
 */

export interface SchoolTask {
  id: string
  source: "school_upload" | "ai_generated"
  topicId: string
  problem: string
  solution: string
  difficulty: number // 1-5
  category: "calculation" | "conceptual" | "word_problem"
  uploadedAt: Date
  usageCount: number
}

export interface TaskSelectionContext {
  topicId: string
  blockType: string
  masteryLevel: number // 0-5
  recentErrorRate: number // 0-1
  needsDiagnostics: boolean
  preferSchoolMaterial: boolean
}

export class TaskSelector {
  private schoolTasks: SchoolTask[] = []

  constructor(schoolTasks?: SchoolTask[]) {
    this.schoolTasks = schoolTasks || []
  }

  /**
   * Wählt Aufgaben basierend auf Kontext
   * Priorität: Echte Schulaufgaben > Varianten > KI-generiert
   */
  selectTasks(
    context: TaskSelectionContext,
    taskCount: number,
    usedTaskIds: string[] = []
  ): SchoolTask[] {
    const selected: SchoolTask[] = []

    // 1. Versuche echte Schulaufgaben zu finden
    const schoolMaterial = this.findSchoolTasks(
      context.topicId,
      context.masteryLevel,
      usedTaskIds
    )

    if (schoolMaterial.length > 0) {
      // Nimm so viele echte Aufgaben wie möglich
      const schoolCount = Math.min(taskCount, schoolMaterial.length)
      selected.push(...schoolMaterial.slice(0, schoolCount))
    }

    // 2. Fülle Rest mit Varianten
    const variantCount = taskCount - selected.length
    if (variantCount > 0 && schoolMaterial.length > 0) {
      const variants = this.generateVariants(
        schoolMaterial[0],
        variantCount,
        context.masteryLevel
      )
      selected.push(...variants)
    }

    // 3. Fallback: KI-generierte Aufgaben
    if (selected.length < taskCount) {
      const generatedCount = taskCount - selected.length
      const generated = this.generateTasks(
        context.topicId,
        context.blockType,
        context.masteryLevel,
        generatedCount
      )
      selected.push(...generated)
    }

    return selected
  }

  /**
   * Findet echte Schulaufgaben
   */
  private findSchoolTasks(
    topicId: string,
    masteryLevel: number,
    usedIds: string[] = []
  ): SchoolTask[] {
    return this.schoolTasks
      .filter((t) =>
        t.topicId === topicId &&
        t.source === "school_upload" &&
        !usedIds.includes(t.id) &&
        this.difficultyFitsLevel(t.difficulty, masteryLevel)
      )
      .sort((a, b) => {
        // Neueste zuerst, dann weniger oft genutzt
        const dateDiff = b.uploadedAt.getTime() - a.uploadedAt.getTime()
        if (dateDiff !== 0) return dateDiff
        return a.usageCount - b.usageCount
      })
  }

  /**
   * Generiert Varianten einer Aufgabe
   * Beispiel: "3/5 + 1/5" → "4/7 + 2/7", "2/9 + 5/9"
   */
  private generateVariants(
    baseTask: SchoolTask,
    count: number,
    masteryLevel: number
  ): SchoolTask[] {
    const variants: SchoolTask[] = []

    for (let i = 0; i < count; i++) {
      const variant: SchoolTask = {
        id: `variant_${baseTask.id}_${i}`,
        source: "ai_generated",
        topicId: baseTask.topicId,
        problem: this.createVariant(baseTask.problem),
        solution: "", // Wird später berechnet
        difficulty: baseTask.difficulty,
        category: baseTask.category,
        uploadedAt: new Date(),
        usageCount: 0,
      }
      variants.push(variant)
    }

    return variants
  }

  /**
   * Erstellt eine Variante aus einem Problem
   * (Vereinfacht - sollte später via OpenAI erfolgen)
   */
  private createVariant(problem: string): string {
    // Beispiel: "3/5 + 1/5" → "4/7 + 2/7"
    // In echter Version: OpenAI API mit Prompt für Varianten

    // Finde Zahlen und ersetze sie mit ähnlichen
    return problem
      .replace(/\d+/g, (match) => {
        const num = parseInt(match)
        const variance = Math.floor(Math.random() * 4) - 2 // -2 bis +2
        return String(Math.max(1, num + variance))
      })
  }

  /**
   * Generiert neue KI-Aufgaben
   */
  private generateTasks(
    topicId: string,
    blockType: string,
    masteryLevel: number,
    count: number
  ): SchoolTask[] {
    const tasks: SchoolTask[] = []

    for (let i = 0; i < count; i++) {
      const task: SchoolTask = {
        id: `generated_${topicId}_${Date.now()}_${i}`,
        source: "ai_generated",
        topicId,
        problem: `[${topicId} - Aufgabe ${i + 1}]`, // Placeholder
        solution: "",
        difficulty: this.calculateDifficulty(masteryLevel, blockType),
        category: "calculation",
        uploadedAt: new Date(),
        usageCount: 0,
      }
      tasks.push(task)
    }

    return tasks
  }

  /**
   * Bestimmt Schwierigkeit basierend auf Mastery und Block Type
   */
  private calculateDifficulty(masteryLevel: number, blockType: string): number {
    const baseDifficulty: Record<string, number> = {
      WARM_UP: 1,
      CURRENT_SCHOOL_TOPIC: masteryLevel + 1,
      FOUNDATION_REPAIR: Math.max(1, masteryLevel),
      REVIEW: masteryLevel,
      PRACTICE: masteryLevel,
      CHALLENGE: Math.min(5, masteryLevel + 2),
      TRANSFER_CHECK: masteryLevel + 1,
      DIAGNOSIS: 2,
    }

    return Math.min(5, Math.max(1, baseDifficulty[blockType] || 2))
  }

  /**
   * Prüft ob Schwierigkeit zum Mastery Level passt
   */
  private difficultyFitsLevel(difficulty: number, masteryLevel: number): boolean {
    // Mastery 0-1: Difficulty 1-2
    // Mastery 2: Difficulty 1-3
    // Mastery 3-4: Difficulty 2-5
    // Mastery 5: Difficulty 3-5

    if (masteryLevel <= 1) return difficulty <= 2
    if (masteryLevel === 2) return difficulty <= 3
    if (masteryLevel <= 4) return difficulty >= 2
    return difficulty >= 3
  }

  /**
   * Transfer Check Task
   * Gibt eine ähnliche aber andere Aufgabe nach erfolgreicher Hilfe
   */
  createTransferCheckTask(originalTask: SchoolTask): SchoolTask {
    return {
      id: `transfer_${originalTask.id}_${Date.now()}`,
      source: "ai_generated",
      topicId: originalTask.topicId,
      problem: this.createVariant(originalTask.problem),
      solution: "", // Wird später berechnet
      difficulty: originalTask.difficulty,
      category: originalTask.category,
      uploadedAt: new Date(),
      usageCount: 0,
    }
  }

  /**
   * Diagnose Task - kurze Aufgabe um Foundation zu testen
   */
  createDiagnosisTask(topicId: string): SchoolTask {
    return {
      id: `diagnosis_${topicId}_${Date.now()}`,
      source: "ai_generated",
      topicId,
      problem: `[Diagnose: ${topicId}]`,
      solution: "",
      difficulty: 2,
      category: "calculation",
      uploadedAt: new Date(),
      usageCount: 0,
    }
  }
}
