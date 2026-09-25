/**
 * Phase 8H: Parent Dashboard Insights
 * Concrete observations without psychologizing
 */

export interface ParentInsight {
  title: string
  observation: string
  evidence: string[]
  timeframe: string
  category: "PROGRESS" | "ATTENTION" | "STRENGTH" | "NOTE"
  isReliable: boolean // Only if sufficient data
}

/**
 * Generate insights for parent dashboard
 */
export function generateParentInsights(data: {
  independentSuccessRate: { current: number; previous: number }
  averageHelpLevel: { current: number; previous: number }
  transferSuccessRate: { current: number; previous: number }
  topicsAttempted: number
  topicsMastered: number
  foundationGaps: number
  daysActive: number
  activeLearningMinutes: number
  selfCorrectionRate: number
  reviewRetentionRate: number
}): ParentInsight[] {
  const insights: ParentInsight[] = []

  // Check 1: Improving independence
  if (data.independentSuccessRate.current > data.independentSuccessRate.previous + 0.1) {
    insights.push({
      title: "Wird selbstständiger",
      observation: `Zoey löst mehr Aufgaben ohne Hilfe. Vorher ${Math.round(data.independentSuccessRate.previous * 100)}%, jetzt ${Math.round(data.independentSuccessRate.current * 100)}%.`,
      evidence: [
        `${Math.round((data.independentSuccessRate.current - data.independentSuccessRate.previous) * 100)}% Steigerung`,
        `Über ${data.daysActive} Tage beobachtet`,
      ],
      timeframe: "letzte 7-21 Tage",
      category: "PROGRESS",
      isReliable: data.daysActive >= 3,
    })
  }

  // Check 2: Needing less help
  if (data.averageHelpLevel.current < data.averageHelpLevel.previous - 0.3) {
    insights.push({
      title: "Benötigt weniger Unterstützung",
      observation: `Durchschnittliche Hilfestufe gesunken: von ${data.averageHelpLevel.previous.toFixed(1)} auf ${data.averageHelpLevel.current.toFixed(1)}.`,
      evidence: [
        `Reduktion um ${(data.averageHelpLevel.previous - data.averageHelpLevel.current).toFixed(1)} Stufen`,
      ],
      timeframe: "letzte 7-21 Tage",
      category: "PROGRESS",
      isReliable: data.daysActive >= 3,
    })
  }

  // Check 3: Transfer improving
  if (data.transferSuccessRate.current > 0.5 && data.transferSuccessRate.current > data.transferSuccessRate.previous + 0.15) {
    insights.push({
      title: "Wendet Wissen an",
      observation: `Zoey wendet Gelerntes auf neue Aufgaben an. Erfolgsquote: ${Math.round(data.transferSuccessRate.current * 100)}%.`,
      evidence: [
        "Das ist ein gutes Zeichen für echtes Verständnis",
        `${Math.round((data.transferSuccessRate.current - data.transferSuccessRate.previous) * 100)}% Verbesserung`,
      ],
      timeframe: "letzte 7-21 Tage",
      category: "STRENGTH",
      isReliable: data.transferSuccessRate.current >= 0.5 && data.daysActive >= 5,
    })
  }

  // Check 4: Foundation gaps
  if (data.foundationGaps > 0) {
    insights.push({
      title: "Grundlagen beobachten",
      observation: `Bei ${data.foundationGaps} Thema(en) treten wiederholt ähnliche Fehler auf. Das könnte auf Lückeln in Grundlagen hinweisen.`,
      evidence: [
        "Fehler treten in mehreren Aufgaben auf",
        "ELI hat tiefere Grundlagen identifiziert",
        "Kurze Überprüfungen werden durchgeführt",
      ],
      timeframe: "aktuelle Beobachtung",
      category: "ATTENTION",
      isReliable: data.foundationGaps >= 1,
    })
  }

  // Check 5: Self correction
  if (data.selfCorrectionRate > 0.3) {
    insights.push({
      title: "Korrigiert sich selbst",
      observation: `Zoey bemerkt und korrigiert ${Math.round(data.selfCorrectionRate * 100)}% der Fehler selbst.`,
      evidence: [
        "Das zeigt Selbstreflexion",
        "Ein Zeichen für aktives Lernen",
      ],
      timeframe: "letzte Aktivitäten",
      category: "STRENGTH",
      isReliable: data.daysActive >= 2,
    })
  }

  // Check 6: Low review retention
  if (data.reviewRetentionRate < 0.6 && data.reviewRetentionRate > 0) {
    insights.push({
      title: "Mögliches Vergessen",
      observation: `Nach längerer Pause zeigt Zoey schwächere Leistung bei früher beherrschten Themen. Retention: ${Math.round(data.reviewRetentionRate * 100)}%.`,
      evidence: [
        "Themen werden schneller vergessen als typisch",
        "ELI erhöht automatisch die Wiederholungsfrequenz",
      ],
      timeframe: "über mehrere Wochen",
      category: "NOTE",
      isReliable: data.daysActive >= 14,
    })
  }

  // Check 7: High active learning
  if (data.activeLearningMinutes > 300) {
    insights.push({
      title: "Engagiert beim Lernen",
      observation: `Zoey hat über ${Math.round(data.activeLearningMinutes / 60)} Stunden aktiv gelernt. Das ist solide Lerneinsatz.`,
      evidence: [
        `${data.topicsAttempted} verschiedene Themen`,
        `${data.topicsMastered} Topics beherrscht`,
      ],
      timeframe: "letzte 21 Tage",
      category: "PROGRESS",
      isReliable: data.daysActive >= 5,
    })
  }

  // Check 8: Topics mastered
  if (data.topicsMastered >= 3) {
    insights.push({
      title: "Themen beherrscht",
      observation: `Zoey hat ${data.topicsMastered} Themen stabil gemeistert.`,
      evidence: [
        "Einschließlich Transfer-Aufgaben erfolgreich gelöst",
        "Mastery stabil nach mehreren Tagen",
      ],
      timeframe: "aktuelle Periode",
      category: "PROGRESS",
      isReliable: true,
    })
  }

  return insights.filter((i) => i.isReliable)
}

/**
 * Format insights for display
 */
export function formatInsightsForDisplay(insights: ParentInsight[]): {
  byCategory: Record<string, ParentInsight[]>
  summary: string
} {
  const byCategory: Record<string, ParentInsight[]> = {
    PROGRESS: [],
    STRENGTH: [],
    ATTENTION: [],
    NOTE: [],
  }

  insights.forEach((insight) => {
    byCategory[insight.category].push(insight)
  })

  // Create summary
  const progressCount = byCategory.PROGRESS.length
  const attentionCount = byCategory.ATTENTION.length
  let summary = ""

  if (progressCount >= 3) {
    summary = "Zoey macht gute Fortschritte! 🚀"
  } else if (progressCount >= 1 && attentionCount === 0) {
    summary = "Zoey lernt kontinuierlich. 👍"
  } else if (attentionCount > 0) {
    summary = "Gutes Lernen, aber ein paar Punkte zu beobachten. 👀"
  } else {
    summary = "Zoey arbeitet am Lernen. 💪"
  }

  return { byCategory, summary }
}

/**
 * Comparison message for KPI changes
 */
export function formatKPIComparison(
  metric: string,
  previous: number,
  current: number,
  isPercentage: boolean = true
): string {
  const unit = isPercentage ? "%" : ""
  const change = current - previous
  const direction = change > 0 ? "↑" : change < 0 ? "↓" : "="
  const absChange = Math.abs(change)

  return `${metric}: ${direction} ${absChange.toFixed(isPercentage ? 0 : 1)}${unit}`
}

/**
 * Disclaimer for all insights
 */
export const PARENT_INSIGHT_DISCLAIMER = `Diese Beobachtungen basieren auf Zoeys Aktivität in ELI. Sie zeigen Lernfortschritt in der App.
Echte Schulnoten hängen von vielen Faktoren ab und sind nicht direkt mit ELI-Leistung gleichzusetzen.`
