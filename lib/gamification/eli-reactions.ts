/**
 * Eli Reactions für Phase 6C
 *
 * Eli reagiert auf Lernerereignisse mit verschiedenen Moods und Nachrichten
 * WICHTIG: Nachrichten sind kurz, positiv und unterstützend
 */

export type EliMood =
  | "happy"
  | "excited"
  | "proud"
  | "thinking"
  | "surprised"
  | "celebrating"
  | "encouraging"

export interface EliReaction {
  mood: EliMood
  message: string
  duration?: number // ms - wie lange anzeigen
}

/**
 * Eli reagiert auf TASK_CORRECT_INDEPENDENT
 */
export function getReactionTaskCorrectIndependent(): EliReaction {
  const reactions: EliReaction[] = [
    { mood: "excited", message: "YES! Ganz alleine! 🚀", duration: 2000 },
    { mood: "proud", message: "Stark gemacht! 💪", duration: 2000 },
    { mood: "happy", message: "Perfekt gelöst! ✨", duration: 2000 },
    { mood: "celebrating", message: "Top! Du bist eine Mathe-Rakete! 🚀", duration: 2000 },
  ]
  return reactions[Math.floor(Math.random() * reactions.length)]
}

/**
 * Eli reagiert auf SELF_CORRECTION
 */
export function getReactionSelfCorrection(): EliReaction {
  const reactions: EliReaction[] = [
    {
      mood: "proud",
      message: "Du hast deinen Fehler gefunden! Sehr clever! 🧠",
      duration: 2500,
    },
    {
      mood: "happy",
      message: "Selbst korrigiert - genau das ist Lernen! 💡",
      duration: 2500,
    },
    {
      mood: "excited",
      message: "Das ist echte Mathe-Kraft! 💪",
      duration: 2500,
    },
  ]
  return reactions[Math.floor(Math.random() * reactions.length)]
}

/**
 * Eli reagiert auf LEVEL_UP
 */
export function getReactionLevelUp(newLevel: number): EliReaction {
  return {
    mood: "celebrating",
    message: `LEVEL UP! 🎉 Du bist jetzt Level ${newLevel}!`,
    duration: 3000,
  }
}

/**
 * Eli reagiert auf BADGE_UNLOCK
 */
export function getReactionBadgeUnlock(badgeName: string): EliReaction {
  const reactions: EliReaction[] = [
    { mood: "excited", message: `🏆 ${badgeName} freigeschaltet!`, duration: 2500 },
    { mood: "celebrating", message: `Wow! ${badgeName}! 🎉`, duration: 2500 },
    { mood: "proud", message: `Du verdienst ${badgeName}! 👑`, duration: 2500 },
  ]
  return reactions[Math.floor(Math.random() * reactions.length)]
}

/**
 * Eli reagiert auf MISSION_COMPLETED
 */
export function getReactionMissionCompleted(missionName: string): EliReaction {
  const reactions: EliReaction[] = [
    {
      mood: "celebrating",
      message: `Mission komplett! 🎉 ${missionName} geschafft!`,
      duration: 3000,
    },
    {
      mood: "excited",
      message: `${missionName} - perfekt gelöst! 🚀`,
      duration: 3000,
    },
    { mood: "proud", message: `Du rockst! Mission ${missionName}! 👑`, duration: 3000 },
  ]
  return reactions[Math.floor(Math.random() * reactions.length)]
}

/**
 * Eli reagiert auf mehrere Fehler (unterstützend, NICHT bestrafend!)
 */
export function getReactionMultipleErrors(): EliReaction {
  const reactions: EliReaction[] = [
    {
      mood: "encouraging",
      message: "Okay, wir probieren einen anderen Weg. 🤖",
      duration: 2000,
    },
    {
      mood: "thinking",
      message: "Lass mich dir helfen! 💡",
      duration: 2000,
    },
    {
      mood: "happy",
      message: "Keine Sorge - Fehler helfen beim Lernen! 📚",
      duration: 2000,
    },
  ]
  return reactions[Math.floor(Math.random() * reactions.length)]
}

/**
 * Eli reagiert auf STREAK_MILESTONE (3, 7, 14, 30 Tage)
 */
export function getReactionStreakMilestone(dayCount: number): EliReaction {
  if (dayCount === 3) {
    return {
      mood: "excited",
      message: "🔥 3 Tage Lernfeuer! Weiter so!",
      duration: 2500,
    }
  }
  if (dayCount === 7) {
    return {
      mood: "celebrating",
      message: "🔥🔥 Eine ganze Woche! Du bist unschlagbar! 👑",
      duration: 3000,
    }
  }
  if (dayCount === 14) {
    return {
      mood: "celebrating",
      message: "🔥🔥🔥 2 Wochen Feuer! Das ist Legende! 🚀",
      duration: 3000,
    }
  }
  if (dayCount === 30) {
    return {
      mood: "celebrating",
      message: "👑 EIN MONAT! Du bist eine Lern-Maschine! 👑",
      duration: 3000,
    }
  }
  return {
    mood: "proud",
    message: `🔥 ${dayCount} Tage - du bist auf Feuer!`,
    duration: 2500,
  }
}

/**
 * Eli reagiert auf Learner, der nach Pause zurückkommt
 */
export function getReactionWelcomeBack(): EliReaction {
  const reactions: EliReaction[] = [
    { mood: "happy", message: "Hey! Schön, dass du zurück bist! 🚀", duration: 2000 },
    { mood: "excited", message: "Welcome back! Lass uns weitermachen! 💪", duration: 2000 },
    { mood: "happy", message: "Du bist wieder da! Heute starten wir neu! 🌟", duration: 2000 },
  ]
  return reactions[Math.floor(Math.random() * reactions.length)]
}
