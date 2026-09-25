"use client"

import React, { useState, useEffect } from "react"

interface MonitoringData {
  userId: string
  totalDecisions: number
  avgConfidence: number
  recentDecisions: Array<{
    taskId?: string
    strategy: string
    helpLevel: number
    confidence: number
    reasonCodes: string[]
    timestamp: string
  }>
  strategyEffectiveness: Array<{
    strategy: string
    effectiveness: number
    confidence: number
    usageCount: number
  }>
  summary: {
    topStrategy: string
    readyForActivation: boolean
    qualityAssessment: "GOOD" | "FAIR" | "NEEDS_WORK"
  }
}

export default function AdaptiveMonitoringPage() {
  const [data, setData] = useState<MonitoringData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMonitoring = async () => {
      try {
        const res = await fetch("/api/admin/adaptive-monitoring?userId=test-user")
        const result = await res.json()
        if (result.success) {
          setData(result.monitoring)
        }
      } catch (error) {
        console.error("Failed to fetch monitoring:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMonitoring()
    const interval = setInterval(fetchMonitoring, 5000) // Refresh every 5s
    return () => clearInterval(interval)
  }, [])

  if (loading || !data) return <div className="p-8">Loading...</div>

  const statusColor =
    data.summary.qualityAssessment === "GOOD"
      ? "bg-green-100"
      : data.summary.qualityAssessment === "FAIR"
        ? "bg-yellow-100"
        : "bg-red-100"

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">📊 Phase 8: Adaptive Intelligence Monitoring</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className={`p-4 rounded ${statusColor}`}>
          <div className="text-sm text-gray-600">Quality Assessment</div>
          <div className="text-2xl font-bold">{data.summary.qualityAssessment}</div>
        </div>
        <div className="bg-blue-100 p-4 rounded">
          <div className="text-sm text-gray-600">Avg Confidence</div>
          <div className="text-2xl font-bold">{(data.avgConfidence * 100).toFixed(0)}%</div>
        </div>
        <div className="bg-purple-100 p-4 rounded">
          <div className="text-sm text-gray-600">Total Decisions</div>
          <div className="text-2xl font-bold">{data.totalDecisions}</div>
        </div>
        <div className={`p-4 rounded ${data.summary.readyForActivation ? "bg-green-100" : "bg-gray-100"}`}>
          <div className="text-sm text-gray-600">Ready for Activation</div>
          <div className="text-2xl font-bold">{data.summary.readyForActivation ? "✅ YES" : "⏳ NO"}</div>
        </div>
      </div>

      {/* Strategy Effectiveness */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-bold mb-4">📈 Strategy Effectiveness</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Strategy</th>
              <th className="text-center py-2">Effectiveness</th>
              <th className="text-center py-2">Confidence</th>
              <th className="text-center py-2">Uses</th>
            </tr>
          </thead>
          <tbody>
            {data.strategyEffectiveness.slice(0, 5).map((s) => (
              <tr key={s.strategy} className="border-b hover:bg-gray-50">
                <td className="py-2">{s.strategy}</td>
                <td className="text-center">
                  <div className="inline-block bg-blue-200 px-2 py-1 rounded">
                    {(s.effectiveness * 100).toFixed(0)}%
                  </div>
                </td>
                <td className="text-center">
                  <div className="inline-block bg-purple-200 px-2 py-1 rounded">
                    {(s.confidence * 100).toFixed(0)}%
                  </div>
                </td>
                <td className="text-center">{s.usageCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent Decisions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">🔄 Recent Adaptive Decisions</h2>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {data.recentDecisions.slice(0, 10).map((d, i) => (
            <div key={i} className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex justify-between">
                <div className="font-mono text-sm text-gray-600">{d.strategy}</div>
                <div className="text-sm">
                  Confidence: <strong>{(d.confidence * 100).toFixed(0)}%</strong>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {d.reasonCodes.join(" • ")}
              </div>
              <div className="text-xs text-gray-400">
                {new Date(d.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Auto-refresh indicator */}
      <div className="text-sm text-gray-500 mt-8 text-center">
        Auto-refreshing every 5 seconds... Last update: {new Date().toLocaleTimeString()}
      </div>
    </div>
  )
}
