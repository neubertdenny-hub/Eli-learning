/**
 * Handwriting Input System
 * Canvas-based drawing for mathematical input
 * - Natural pen experience
 * - Stylus pressure sensitivity
 * - Equation recognition & verification
 */

export interface DrawingStroke {
  id: string
  points: Point[]
  pressure: number[] // 0-1 for each point
  timestamp: number
  duration: number // milliseconds
}

export interface Point {
  x: number
  y: number
  timestamp: number
}

export interface HandwritingInput {
  id: string
  strokes: DrawingStroke[]
  imageData: string // Canvas image as data URL
  timestamp: Date
  duration: number // Total drawing time
  isComplete: boolean
}

export interface RecognitionResult {
  recognized_text: string
  confidence: number // 0-1
  alternatives: string[] // Other possible interpretations
  is_equation: boolean
  parsed_equation?: {
    left_side: string
    operator: string
    right_side: string
  }
  recognized_elements: RecognizedElement[]
}

export interface RecognizedElement {
  type: "digit" | "operator" | "fraction" | "radical" | "parenthesis"
  value: string
  confidence: number
  bounding_box?: {
    x: number
    y: number
    width: number
    height: number
  }
}

/**
 * Canvas Drawing Manager
 * Handles stylus input and drawing
 */
export class HandwritingCanvas {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private isDrawing = false
  private strokes: DrawingStroke[] = []
  private currentStroke: DrawingStroke | null = null
  private lastPressure = 0.5

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")!

    this.setupCanvas()
    this.setupEventListeners()

    // Re-setup canvas on window resize
    window.addEventListener("resize", () => this.setupCanvas())
  }

  private setupCanvas(): void {
    // Set canvas size
    this.canvas.width = this.canvas.offsetWidth * window.devicePixelRatio
    this.canvas.height = this.canvas.offsetHeight * window.devicePixelRatio

    // Scale context for high DPI
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Clear canvas
    this.clearCanvas()
  }

  private setupEventListeners(): void {
    // Pointer events for stylus + touch + mouse (preferred)
    this.canvas.addEventListener("pointerdown", (e) => {
      e.preventDefault()
      this.handlePointerDown(e)
    })
    this.canvas.addEventListener("pointermove", (e) => {
      e.preventDefault()
      this.handlePointerMove(e)
    })
    this.canvas.addEventListener("pointerup", (e) => {
      e.preventDefault()
      this.handlePointerUp(e)
    })
    this.canvas.addEventListener("pointercancel", (e) => {
      e.preventDefault()
      this.endStroke()
    })

    // Touch events fallback for older browsers
    this.canvas.addEventListener("touchstart", (e) => {
      e.preventDefault()
      this.handleTouchStart(e)
    })
    this.canvas.addEventListener("touchmove", (e) => {
      e.preventDefault()
      this.handleTouchMove(e)
    })
    this.canvas.addEventListener("touchend", (e) => {
      e.preventDefault()
      this.endStroke()
    })

    // Prevent default scroll/zoom on touch
    this.canvas.addEventListener("gesturestart", (e) => e.preventDefault())
  }

  private handlePointerDown(e: PointerEvent): void {
    if (e.pointerType !== "pen" && e.pointerType !== "touch" && e.pointerType !== "mouse") return

    this.isDrawing = true
    const point = this.getPoint(e)
    const pressure = (e as any).pressure ?? 0.5

    this.currentStroke = {
      id: `stroke_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      points: [point],
      pressure: [pressure],
      timestamp: Date.now(),
      duration: 0,
    }

    this.lastPressure = pressure

    // Visual feedback
    this.ctx.strokeStyle = this.getPressureColor(pressure)
    this.ctx.lineWidth = this.getPressureLineWidth(pressure)
    this.ctx.beginPath()
    this.ctx.moveTo(point.x, point.y)
  }

  private handlePointerMove(e: PointerEvent): void {
    if (!this.isDrawing || !this.currentStroke) return

    const point = this.getPoint(e)
    const pressure = (e as any).pressure ?? this.lastPressure

    this.currentStroke.points.push(point)
    this.currentStroke.pressure.push(pressure)
    this.lastPressure = pressure

    // Draw line
    this.ctx.strokeStyle = this.getPressureColor(pressure)
    this.ctx.lineWidth = this.getPressureLineWidth(pressure)
    this.ctx.lineTo(point.x, point.y)
    this.ctx.stroke()
  }

  private handlePointerUp(e: PointerEvent): void {
    if (!this.isDrawing) return
    this.endStroke()
  }

  private handleTouchStart(e: TouchEvent): void {
    const touch = e.touches[0]
    const point = this.getTouchPoint(touch)

    this.isDrawing = true
    this.currentStroke = {
      id: `stroke_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      points: [point],
      pressure: [0.5],
      timestamp: Date.now(),
      duration: 0,
    }

    this.ctx.strokeStyle = "#000000"
    this.ctx.lineWidth = 2
    this.ctx.beginPath()
    this.ctx.moveTo(point.x, point.y)
  }

  private handleTouchMove(e: TouchEvent): void {
    if (!this.isDrawing || !this.currentStroke) return

    const touch = e.touches[0]
    const point = this.getTouchPoint(touch)

    this.currentStroke.points.push(point)
    this.currentStroke.pressure.push(0.5)

    this.ctx.lineTo(point.x, point.y)
    this.ctx.stroke()
  }

  private endStroke(): void {
    if (!this.isDrawing || !this.currentStroke) return

    this.isDrawing = false
    this.ctx.closePath()

    this.currentStroke.duration = Date.now() - this.currentStroke.timestamp
    this.strokes.push(this.currentStroke)
    this.currentStroke = null
  }

  private getPoint(e: PointerEvent): Point {
    const rect = this.canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio
    return {
      x: (e.clientX - rect.left) * dpr,
      y: (e.clientY - rect.top) * dpr,
      timestamp: e.timeStamp,
    }
  }

  private getTouchPoint(touch: Touch): Point {
    const rect = this.canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio
    return {
      x: (touch.clientX - rect.left) * dpr,
      y: (touch.clientY - rect.top) * dpr,
      timestamp: Date.now(),
    }
  }

  private getPressureColor(pressure: number): string {
    // Darker with more pressure
    const opacity = 0.5 + pressure * 0.5
    return `rgba(0, 0, 0, ${opacity})`
  }

  private getPressureLineWidth(pressure: number): number {
    // 1-4px based on pressure
    return 1 + pressure * 3
  }

  public clearCanvas(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.strokes = []
    this.currentStroke = null
  }

  public getDrawing(): HandwritingInput {
    return {
      id: `drawing_${Date.now()}`,
      strokes: this.strokes,
      imageData: this.canvas.toDataURL("image/png"),
      timestamp: new Date(),
      duration: this.strokes.reduce((sum, s) => sum + s.duration, 0),
      isComplete: this.strokes.length > 0,
    }
  }

  public getStrokes(): DrawingStroke[] {
    return this.strokes
  }
}

/**
 * Handwriting Recognition via Claude Vision
 * Send drawing image to Claude for OCR
 */
export async function recognizeHandwriting(
  drawing: HandwritingInput
): Promise<RecognitionResult> {
  try {
    const response = await fetch("/api/recognize-handwriting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_data: drawing.imageData,
        strokes_count: drawing.strokes.length,
        duration: drawing.duration,
      }),
    })

    if (!response.ok) throw new Error("Recognition failed")

    const result: RecognitionResult = await response.json()
    return result
  } catch (error) {
    console.error("Handwriting recognition error:", error)
    return {
      recognized_text: "",
      confidence: 0,
      alternatives: [],
      is_equation: false,
      recognized_elements: [],
    }
  }
}

/**
 * Verify if recognized text matches expected answer
 */
export function verifyHandwrittenAnswer(
  recognizedText: string,
  expectedAnswer: string,
  tolerance: number = 0.85
): {
  matches: boolean
  confidence: number
  feedback: string
} {
  // Normalize both strings
  const normalized1 = normalizeEquation(recognizedText)
  const normalized2 = normalizeEquation(expectedAnswer)

  // Exact match
  if (normalized1 === normalized2) {
    return {
      matches: true,
      confidence: 1.0,
      feedback: "✅ Perfect handwriting recognition!",
    }
  }

  // Fuzzy matching
  const similarity = calculateSimilarity(normalized1, normalized2)

  if (similarity >= tolerance) {
    return {
      matches: true,
      confidence: similarity,
      feedback: `✅ Close match! (${Math.round(similarity * 100)}% confidence)`,
    }
  }

  return {
    matches: false,
    confidence: similarity,
    feedback: `Recognized: "${recognizedText}" - Did you mean something else?`,
  }
}

/**
 * Normalize equation for comparison
 * Remove spaces, standardize operators
 */
function normalizeEquation(equation: string): string {
  return equation
    .replace(/\s/g, "") // Remove spaces
    .replace(/×/g, "*") // Standardize multiply
    .replace(/÷/g, "/") // Standardize divide
    .replace(/−/g, "-") // Standardize minus
    .toLowerCase()
}

/**
 * Calculate string similarity (Levenshtein distance)
 */
function calculateSimilarity(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1 : s2
  const shorter = s1.length > s2.length ? s2 : s1

  if (longer.length === 0) return 1.0

  const editDistance = levenshteinDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

function levenshteinDistance(s1: string, s2: string): number {
  const costs: number[] = []

  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j
      } else if (j > 0) {
        let newValue = costs[j - 1]
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1
        }
        costs[j - 1] = lastValue
        lastValue = newValue
      }
    }
    if (i > 0) costs[s2.length] = lastValue
  }

  return costs[s2.length]
}

/**
 * Handwriting feedback for Zoey
 */
export function getHandwritingFeedback(result: RecognitionResult): string {
  if (result.confidence < 0.5) {
    return `🤔 Ich bin mir nicht ganz sicher... Dein Schrieb: "${result.recognized_text}" - War das korrekt? ✍️`
  }

  if (result.confidence < 0.85) {
    return `📝 Fast! Ich erkenne: "${result.recognized_text}" - Sieht das richtig aus?`
  }

  if (result.is_equation) {
    return `✅ Ich habe deine Gleichung erkannt: ${result.recognized_text}`
  }

  return `✅ Klar geschrieben! Ich erkenne: ${result.recognized_text}`
}
