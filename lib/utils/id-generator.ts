/**
 * Generate unique IDs with prefixes
 */

export function generateId(prefix: string = "id"): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `${prefix}_${timestamp}_${random}`
}

export function generateExamId(): string {
  return generateId("exam")
}

export function generateTopicId(): string {
  return generateId("topic")
}

export function generatePlanId(): string {
  return generateId("plan")
}

export function generateSimulationId(): string {
  return generateId("sim")
}
