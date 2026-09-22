/**
 * User-Friendly Error Messages
 * Never show technical details to Zoey
 */

export function getFriendlyErrorMessage(error: string | Error): string {
  const msg = error instanceof Error ? error.message : String(error)

  // Network errors
  if (msg.includes("ECONNREFUSED") || msg.includes("connect")) {
    return "Hmm 🤖 Ich konnte mich nicht verbinden. Prüfe deine Internetverbindung!"
  }

  // Timeout
  if (msg.includes("timeout") || msg.includes("TIMEOUT")) {
    return "Das hat zu lange gedauert 😴 Bitte versuch es nochmal."
  }

  // File too large
  if (msg.includes("too large") || msg.includes("size")) {
    return "Das Bild ist zu groß 📸 Mach ein kleineres Foto."
  }

  // Invalid file type
  if (msg.includes("Invalid file type") || msg.includes("supported")) {
    return "Diesen Dateityp kann ich nicht lesen 🤷 Versuch ein Foto oder PDF."
  }

  // OpenAI errors
  if (msg.includes("OpenAI") || msg.includes("API")) {
    return "Hmm 🤖 Ich bin gerade müde. Versuch es in ein paar Sekunden nochmal."
  }

  // Database errors
  if (msg.includes("database") || msg.includes("Database")) {
    return "Hmm 🤖 Ich kann gerade nicht auf meine Notizen zugreifen. Versuch es nochmal."
  }

  // Poor image quality
  if (msg.includes("quality") || msg.includes("blur") || msg.includes("unclear")) {
    return "Hmm 🤖 Das Bild kann ich nicht gut lesen. Mach bitte noch ein Foto mit besserer Auflösung."
  }

  // Unreadable document
  if (msg.includes("readable") || msg.includes("OCR")) {
    return "Ich kann diese Aufgabe nicht lesen 👀 Kannst du das Bild nochmal aufnehmen?"
  }

  // Uncertain analysis
  if (msg.includes("uncertain") || msg.includes("unsure") || msg.includes("confidence")) {
    return "Hmm 🤖 Ich bin mir nicht ganz sicher, was ich auf dem Bild sehe. Versuch's nochmal!"
  }

  // Generic fallback
  return "Oops 🤖 Da ist etwas schief gelaufen. Versuch's nochmal!"
}

export function getEliEncouragement(): string {
  const messages = [
    "Du schaffst das! 💪",
    "Große Klasse! 🌟",
    "Super gemacht! ✨",
    "Weiter so! 🚀",
    "Du bist toll! 😊",
  ]

  return messages[Math.floor(Math.random() * messages.length)]
}
