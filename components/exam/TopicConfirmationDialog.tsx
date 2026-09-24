"use client"

import React, { useState } from "react"
import type { AnalyzedTopic } from "@/lib/exam/material-analyzer"
import { SOURCE_TYPE_LABELS } from "@/lib/exam/exam-manager"

interface TopicConfirmationDialogProps {
  topics: AnalyzedTopic[]
  onConfirm: (confirmed: AnalyzedTopic[]) => void
  isOpen: boolean
}

export function TopicConfirmationDialog({
  topics,
  onConfirm,
  isOpen,
}: TopicConfirmationDialogProps) {
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(
    new Set(topics.map(t => t.topicName))
  )
  const [newTopic, setNewTopic] = useState("")

  if (!isOpen) return null

  const handleToggleTopic = (topicName: string) => {
    const updated = new Set(selectedTopics)
    if (updated.has(topicName)) {
      updated.delete(topicName)
    } else {
      updated.add(topicName)
    }
    setSelectedTopics(updated)
  }

  const handleAddTopic = () => {
    if (newTopic.trim()) {
      setSelectedTopics(new Set([...selectedTopics, newTopic.trim()]))
      setNewTopic("")
    }
  }

  const handleConfirm = () => {
    const confirmed = topics.filter(t => selectedTopics.has(t.topicName))
    onConfirm(confirmed)
  }

  const lowConfidenceTopics = topics.filter(t => t.confidence < 0.7)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 p-6 sm:p-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            🤔 Bitte überprüfe die erkannten Themen
          </h2>
          <p className="text-gray-600">
            {lowConfidenceTopics.length} Thema(ta) sind unsicher. Bestätige oder entferne sie.
          </p>
        </div>

        {/* Low Confidence Topics */}
        {lowConfidenceTopics.length > 0 && (
          <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-200 space-y-4">
            <h3 className="font-bold text-gray-900">⚠️ Unsichere Themen</h3>
            {lowConfidenceTopics.map(topic => (
              <div
                key={topic.topicName}
                className="bg-white rounded-lg p-4 border-2 border-yellow-100 space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{topic.topicName}</p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                        {SOURCE_TYPE_LABELS[topic.sourceType]}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {(topic.confidence * 100).toFixed(0)}% sicher
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedTopics.has(topic.topicName)}
                    onChange={() => handleToggleTopic(topic.topicName)}
                    className="w-6 h-6 mt-1 cursor-pointer"
                  />
                </div>

                {topic.reasoning && (
                  <p className="text-sm text-gray-600">{topic.reasoning}</p>
                )}

                {topic.subtopics.length > 0 && (
                  <div className="text-sm">
                    <p className="text-gray-600 font-semibold mb-1">Unterthemen:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {topic.subtopics.map((sub, idx) => (
                        <li key={idx} className="text-gray-700">
                          {sub}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {topic.examples && topic.examples.length > 0 && (
                  <div className="text-sm">
                    <p className="text-gray-600 font-semibold mb-1">Beispiele:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {topic.examples.map((ex, idx) => (
                        <li key={idx} className="text-gray-700">
                          {ex}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Confirmed Topics */}
        {topics.filter(t => t.confidence >= 0.7).length > 0 && (
          <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200 space-y-4">
            <h3 className="font-bold text-gray-900">✅ Sichere Themen</h3>
            {topics
              .filter(t => t.confidence >= 0.7)
              .map(topic => (
                <div
                  key={topic.topicName}
                  className="bg-white rounded-lg p-4 border-2 border-green-100 flex justify-between items-start"
                >
                  <div>
                    <p className="font-bold text-gray-900">{topic.topicName}</p>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded inline-block mt-1">
                      {(topic.confidence * 100).toFixed(0)}% sicher
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedTopics.has(topic.topicName)}
                    onChange={() => handleToggleTopic(topic.topicName)}
                    className="w-6 h-6 cursor-pointer"
                  />
                </div>
              ))}
          </div>
        )}

        {/* Add Manual Topic */}
        <div className="space-y-3 border-t pt-4">
          <p className="font-bold text-gray-900">➕ Thema ergänzen</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTopic}
              onChange={e => setNewTopic(e.target.value)}
              onKeyPress={e => {
                if (e.key === "Enter") handleAddTopic()
              }}
              placeholder="z.B. Prozentrechnung"
              className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={handleAddTopic}
              disabled={!newTopic.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg disabled:opacity-50 transition-colors"
            >
              ➕
            </button>
          </div>

          {/* Added Topics */}
          {Array.from(selectedTopics)
            .filter(t => !topics.some(topic => topic.topicName === t))
            .map(topic => (
              <div
                key={topic}
                className="bg-blue-50 rounded-lg p-3 border-2 border-blue-200 flex justify-between items-center"
              >
                <p className="font-bold text-gray-900">{topic}</p>
                <button
                  onClick={() => {
                    const updated = new Set(selectedTopics)
                    updated.delete(topic)
                    setSelectedTopics(updated)
                  }}
                  className="text-red-600 hover:text-red-700 font-bold text-lg"
                >
                  ✕
                </button>
              </div>
            ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 border-t pt-4">
          <button
            onClick={() => handleConfirm()}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-xl transition-all"
          >
            ✅ {selectedTopics.size} Thema(ta) bestätigen
          </button>
        </div>
      </div>
    </div>
  )
}
