"use client"

import React, { useState, useRef, useEffect } from "react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function AiTutorChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initial greeting
      setMessages([
        {
          id: "greeting",
          role: "assistant",
          content: "Hallo! 👋 Ich bin Eli, dein persönlicher Nachhilfelehrer! 🤖\n\nIch helfe dir bei Matheaufgaben, erkläre Konzepte in einfacher Sprache und gebe dir Tipps, wie du Aufgaben selbst lösen kannst.\n\nWas kann ich für dich tun?",
          timestamp: new Date(),
        },
      ])
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          conversationHistory: messages,
        }),
      })

      if (!response.ok) throw new Error("Chat failed")

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Chat error:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Entschuldigung, es gab einen Fehler. Bitte versuche es nochmal! 😟",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Chat Widget Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center text-2xl"
        title="Nachhilfelehrer öffnen"
      >
        {isOpen ? "✕" : "🤖"}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-80 sm:w-96 h-96 sm:h-[500px] rounded-2xl bg-white shadow-2xl flex flex-col border border-indigo-200 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <div>
                <h3 className="font-bold text-lg">Eli's Nachhilfe</h3>
                <p className="text-xs opacity-90">Dein AI-Tutor</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-lg ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-none"
                      : "bg-white text-gray-900 rounded-bl-none border-2 border-gray-200"
                  }`}
                >
                  <p className="text-base font-semibold leading-relaxed whitespace-pre-wrap text-black">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-900 px-4 py-3 rounded-lg rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Frag mich was..."
                disabled={isLoading}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm"
                autoFocus
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:shadow-lg disabled:opacity-50 transition-all text-sm"
              >
                ↑
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
