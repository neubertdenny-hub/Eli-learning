import React from "react"

interface DiagramProps {
  type: "rectangle" | "square" | "triangle" | "circle" | "trapez" | "cylinder"
  data: Record<string, number>
}

export function GeometryDiagram({ type, data }: DiagramProps) {
  switch (type) {
    case "rectangle":
      return (
        <svg width="200" height="150" viewBox="0 0 200 150" className="mx-auto">
          {/* Rectangle */}
          <rect x="40" y="30" width="120" height="70" fill="none" stroke="#4f46e5" strokeWidth="2" />

          {/* Length labels */}
          <text x="100" y="120" textAnchor="middle" className="text-sm font-bold fill-indigo-600">
            L = {data.length}cm
          </text>
          <text x="20" y="70" textAnchor="middle" className="text-sm font-bold fill-indigo-600">
            B = {data.width}cm
          </text>

          {/* Dimension lines */}
          <line x1="40" y1="115" x2="160" y2="115" stroke="#999" strokeWidth="1" />
          <line x1="30" y1="30" x2="30" y2="100" stroke="#999" strokeWidth="1" />
        </svg>
      )

    case "square":
      return (
        <svg width="200" height="180" viewBox="0 0 200 180" className="mx-auto">
          {/* Square */}
          <rect x="50" y="30" width="100" height="100" fill="none" stroke="#4f46e5" strokeWidth="2" />

          {/* Side label */}
          <text x="100" y="150" textAnchor="middle" className="text-sm font-bold fill-indigo-600">
            Seite = {data.side}cm
          </text>

          {/* Dimension line */}
          <line x1="50" y1="140" x2="150" y2="140" stroke="#999" strokeWidth="1" />
        </svg>
      )

    case "triangle":
      return (
        <svg width="240" height="200" viewBox="0 0 240 200" className="mx-auto">
          {/* Triangle */}
          <polygon points="120,20 40,160 200,160" fill="none" stroke="#4f46e5" strokeWidth="2" />

          {/* Height line (dashed) */}
          <line x1="120" y1="20" x2="120" y2="160" stroke="#999" strokeWidth="1" strokeDasharray="3,3" />

          {/* Labels - Better positioning and sizing */}
          <text x="120" y="185" textAnchor="middle" className="text-base font-bold fill-indigo-600">
            Basis = {data.base}cm
          </text>
          <text x="20" y="95" className="text-base font-bold fill-indigo-600">
            h = {data.height}cm
          </text>
        </svg>
      )

    case "circle":
      return (
        <svg width="200" height="180" viewBox="0 0 200 180" className="mx-auto">
          {/* Circle */}
          <circle cx="100" cy="60" r={data.radius * 2} fill="none" stroke="#4f46e5" strokeWidth="2" />

          {/* Radius line */}
          <line x1="100" y1="60" x2="100" y2={60 - data.radius * 2} stroke="#999" strokeWidth="1" />

          {/* Labels */}
          <text x="110" y="50" className="text-sm font-bold fill-indigo-600">
            r = {data.radius}cm
          </text>
          <text x="100" y="150" textAnchor="middle" className="text-sm font-bold fill-indigo-600">
            Radius = {data.radius}cm
          </text>
        </svg>
      )

    case "trapez":
      return (
        <svg width="200" height="180" viewBox="0 0 200 180" className="mx-auto">
          {/* Trapez */}
          <polygon points="60,40 140,40 170,110 30,110" fill="none" stroke="#4f46e5" strokeWidth="2" />

          {/* Height line (dashed) */}
          <line x1="100" y1="40" x2="100" y2="110" stroke="#999" strokeWidth="1" strokeDasharray="3,3" />

          {/* Labels */}
          <text x="100" y="30" textAnchor="middle" className="text-xs font-bold fill-indigo-600">
            a = {data.a}cm
          </text>
          <text x="100" y="135" textAnchor="middle" className="text-xs font-bold fill-indigo-600">
            b = {data.b}cm
          </text>
          <text x="115" y="75" className="text-xs font-bold fill-indigo-600">
            h = {data.height}cm
          </text>
        </svg>
      )

    case "cylinder":
      return (
        <svg width="200" height="180" viewBox="0 0 200 180" className="mx-auto">
          {/* Top circle (ellipse) */}
          <ellipse cx="100" cy="40" rx="30" ry="15" fill="none" stroke="#4f46e5" strokeWidth="2" />

          {/* Side lines */}
          <line x1="70" y1="40" x2="60" y2="120" stroke="#4f46e5" strokeWidth="2" />
          <line x1="130" y1="40" x2="140" y2="120" stroke="#4f46e5" strokeWidth="2" />

          {/* Bottom circle (ellipse) */}
          <ellipse cx="100" cy="120" rx="30" ry="15" fill="none" stroke="#4f46e5" strokeWidth="2" />

          {/* Labels */}
          <text x="45" y="80" className="text-xs font-bold fill-indigo-600">
            h = {data.height}cm
          </text>
          <text x="100" y="150" textAnchor="middle" className="text-sm font-bold fill-indigo-600">
            r = {data.radius}cm
          </text>
        </svg>
      )

    default:
      return null
  }
}
