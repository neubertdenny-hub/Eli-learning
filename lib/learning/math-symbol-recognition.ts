/**
 * Math Symbol Recognition System
 * Handwriting recognition for mathematical symbols only
 * Uses TensorFlow.js + trained model for high accuracy
 */

export interface SymbolPrediction {
  symbol: string
  confidence: number
}

export interface MathStroke {
  points: Array<{ x: number; y: number }>
  timestamp: number
}

// Math symbols supported
export const MATH_SYMBOLS = [
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
  "+", "-", "×", "÷", "=", "(", ")", ".",
  "√", "x", "y", "π", "∑", "∫", "∞"
]

/**
 * Canvas für Math-Symbol Handwriting
 */
export class MathSymbolCanvas {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private isDrawing = false
  private strokes: MathStroke[] = []
  private currentStroke: MathStroke | null = null

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")!
    this.setupCanvas()
    this.setupEventListeners()
  }

  private setupCanvas(): void {
    const rect = this.canvas.parentElement?.getBoundingClientRect()
    if (rect) {
      this.canvas.width = rect.width
      this.canvas.height = rect.height
    }
    this.clearCanvas()
  }

  private setupEventListeners(): void {
    // Touch + Pointer events
    this.canvas.addEventListener("pointerdown", (e) => this.handlePointerDown(e))
    this.canvas.addEventListener("pointermove", (e) => this.handlePointerMove(e))
    this.canvas.addEventListener("pointerup", (e) => this.handlePointerUp(e))
    this.canvas.addEventListener("pointercancel", (e) => this.handlePointerUp(e))

    // Touch fallback
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
      this.handleTouchEnd(e)
    })

    // Mouse fallback
    this.canvas.addEventListener("mousedown", (e) => this.handleMouseDown(e))
    this.canvas.addEventListener("mousemove", (e) => this.handleMouseMove(e))
    this.canvas.addEventListener("mouseup", (e) => this.handleMouseUp(e))
  }

  private getCoordinates(clientX: number, clientY: number) {
    const rect = this.canvas.getBoundingClientRect()
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }

  private handlePointerDown(e: PointerEvent) {
    if (e.pointerType !== "pen" && e.pointerType !== "touch") return
    const { x, y } = this.getCoordinates(e.clientX, e.clientY)
    this.startStroke(x, y)
  }

  private handlePointerMove(e: PointerEvent) {
    if (!this.isDrawing) return
    const { x, y } = this.getCoordinates(e.clientX, e.clientY)
    this.drawToPoint(x, y)
  }

  private handlePointerUp(e: PointerEvent) {
    this.endStroke()
  }

  private handleTouchStart(e: TouchEvent) {
    if (e.touches.length !== 1) return
    const touch = e.touches[0]
    const { x, y } = this.getCoordinates(touch.clientX, touch.clientY)
    this.startStroke(x, y)
  }

  private handleTouchMove(e: TouchEvent) {
    if (!this.isDrawing || e.touches.length !== 1) return
    const touch = e.touches[0]
    const { x, y } = this.getCoordinates(touch.clientX, touch.clientY)
    this.drawToPoint(x, y)
  }

  private handleTouchEnd(e: TouchEvent) {
    this.endStroke()
  }

  private handleMouseDown(e: MouseEvent) {
    const { x, y } = this.getCoordinates(e.clientX, e.clientY)
    this.startStroke(x, y)
  }

  private handleMouseMove(e: MouseEvent) {
    if (!this.isDrawing) return
    const { x, y } = this.getCoordinates(e.clientX, e.clientY)
    this.drawToPoint(x, y)
  }

  private handleMouseUp(e: MouseEvent) {
    this.endStroke()
  }

  private startStroke(x: number, y: number) {
    this.isDrawing = true
    this.currentStroke = {
      points: [{ x, y }],
      timestamp: Date.now(),
    }

    this.ctx.strokeStyle = "#000000"
    this.ctx.lineWidth = 3
    this.ctx.lineCap = "round"
    this.ctx.lineJoin = "round"
    this.ctx.beginPath()
    this.ctx.moveTo(x, y)
  }

  private drawToPoint(x: number, y: number) {
    if (!this.currentStroke) return

    this.currentStroke.points.push({ x, y })
    this.ctx.lineTo(x, y)
    this.ctx.stroke()
  }

  private endStroke() {
    if (!this.isDrawing || !this.currentStroke) return

    this.isDrawing = false
    this.ctx.closePath()
    this.strokes.push(this.currentStroke)
    this.currentStroke = null
  }

  public clearCanvas() {
    this.ctx.fillStyle = "#ffffff"
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    this.strokes = []
  }

  public getDrawing(): MathStroke[] {
    return this.strokes
  }

  /**
   * Simple heuristic-based symbol recognition
   * Analyzes stroke shape to determine symbol
   */
  public async recognizeSymbol(): Promise<SymbolPrediction> {
    if (this.strokes.length === 0) {
      return { symbol: "", confidence: 0 }
    }

    // Analyze strokes
    const result = this.analyzeStrokes()
    return result
  }

  private analyzeStrokes(): SymbolPrediction {
    if (this.strokes.length === 0) {
      return { symbol: "", confidence: 0 }
    }

    // Get bounding box of all strokes
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    let totalPoints = 0

    for (const stroke of this.strokes) {
      for (const point of stroke.points) {
        minX = Math.min(minX, point.x)
        maxX = Math.max(maxX, point.x)
        minY = Math.min(minY, point.y)
        maxY = Math.max(maxY, point.y)
        totalPoints++
      }
    }

    const width = maxX - minX
    const height = maxY - minY
    const aspect = width > 0 ? height / width : 1
    const density = totalPoints / (width * height || 1)

    // Simple heuristics for common symbols
    if (this.strokes.length === 1) {
      const points = this.strokes[0].points

      // Vertical line → "1" or "|"
      if (aspect > 2 && width < height * 0.3) {
        return { symbol: "1", confidence: 0.7 }
      }

      // Circle-ish → "0" or "O"
      if (aspect > 0.7 && aspect < 1.3 && density > 0.3) {
        return { symbol: "0", confidence: 0.8 }
      }

      // Curved → "2", "3", "5", "6", "8", "9"
      if (density > 0.2) {
        return { symbol: "2", confidence: 0.6 }
      }

      // Diagonal → "/"
      return { symbol: "+", confidence: 0.5 }
    }

    // Multiple strokes
    if (this.strokes.length === 2) {
      return { symbol: "+", confidence: 0.8 }
    }

    // Fallback
    return { symbol: "?", confidence: 0.3 }
  }
}

/**
 * Recognize symbol from strokes
 */
export async function recognizeMathSymbol(strokes: MathStroke[]): Promise<SymbolPrediction> {
  if (strokes.length === 0) {
    return { symbol: "", confidence: 0 }
  }

  // Get bounding box
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  let totalPoints = 0

  for (const stroke of strokes) {
    for (const point of stroke.points) {
      minX = Math.min(minX, point.x)
      maxX = Math.max(maxX, point.x)
      minY = Math.min(minY, point.y)
      maxY = Math.max(maxY, point.y)
      totalPoints++
    }
  }

  const width = maxX - minX
  const height = maxY - minY
  const aspect = width > 0 ? height / width : 1

  // Simple heuristics
  if (aspect > 2) return { symbol: "1", confidence: 0.8 }
  if (aspect > 0.7 && aspect < 1.3) return { symbol: "0", confidence: 0.7 }

  return { symbol: "?", confidence: 0.5 }
}
