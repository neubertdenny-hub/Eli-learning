# 🧠 Phase 4C: Mastery Engine + Eli Memory + Spaced Repetition

**Date**: 2026-09-23  
**Status**: ✅ IMPLEMENTED  
**Components**: 3 new modules + 1 orchestrator + comprehensive test suite

---

## Overview

Phase 4C implements an intelligent **adaptive learning system** that:
1. Tracks **mastery progression** (Level 0-5) based on performance
2. Maintains **Eli's contextual memory** of Zoey's learning journey
3. Schedules **spaced repetition** reviews using Ebbinghaus Forgetting Curve
4. Personalizes **every interaction** based on learning profile

---

## Components

### 1. Mastery Engine (`mastery-engine.ts`)

**Purpose**: Track and progress skill mastery levels

#### Mastery Levels (0-5):
```
Level 0: Not attempted yet 🤔
Level 1: Attempted (with help) 🤝
Level 2: Solved (with support) 💪
Level 3: Fluent (reliable) ⭐
Level 4: Expert (can teach) 🌟
Level 5: Mastery (automatic) 🏆
```

#### Key Functions:

**`calculateMasteryLevel()`**
- Input: Current level, correctness, help used, attempt #
- Logic: Only 1st-try correct or minimal help (≤1) causes progression
- Output: New mastery level (0-5)

**`calculateNextReview()`** - Spaced Repetition
```
Level 0-1: Review daily (need reinforcement)
Level 2:   Review every 2 days
Level 3:   Review every 3 days (weekly pattern)
Level 4:   Review weekly (consolidation)
Level 5:   Review biweekly (maintenance only)

On failure: Always review next day
```

**`calculateConfidence()`**
- Grows with attempts, plateaus at high levels
- Includes consistency bonus for perfect recent streak
- Range: 0 (no attempts) → 1.0 (high confidence)

**`calculateMasteryProgress()`** - Dashboard Summary
- Total skills & distribution (mastered, expert, learning, not started)
- Average mastery level (0-5)
- Skills practiced today
- Next focus areas (overdue reviews)

### 2. Eli Memory (`eli-memory.ts`)

**Purpose**: Personalize learning experience based on Zoey's profile

#### Learning Profile Tracking:
```typescript
{
  favorite_topics: ["Addition", "Geometrie"],
  struggling_areas: ["Bruchrechnung"],
  learning_speed: "quick" | "steady" | "gradual",
  preferred_help_level: 2, // How much help they like
  current_streak_days: 7,
  total_practice_hours: 12.5
}
```

#### Conversation Memory:
```typescript
{
  recent_achievements: ["Multiplikation Level 5!", "10er Streak!"],
  recent_struggles: ["Negative Zahlen schwierig"],
  learning_personality: "schnell und motiviert! 🚀",
  jokes_or_interests: ["Likes celebrating wins"],
  mentor_tips: ["Loves challenges", "Perfectionist"]
}
```

#### Learning Personality Detection:
- **Visual Learner**: Uses diagrams/shapes (0-1 score)
- **Verbal Learner**: Requests explanations (0-1 score)
- **Kinesthetic**: Learns by doing, many attempts (0-1 score)
- **Perfectionist**: Frustrated by small errors (boolean)
- **Independent**: Low help-seeking (0-1 score)

#### Personalized Messages:
```typescript
createPersonalizedMessage(memory, "greeting")
→ "Hallo Zoey! 👋 Bereit, heute wieder was zu lernen?"

createPersonalizedMessage(memory, "encouragement")
→ "Du bist auf Feuer heute, Zoey! 🔥"

createPersonalizedMessage(memory, "celebration")
→ "🎉 Zoey! Das ist dein 5. Erfolg! 🏆"
```

### 3. Learning Session Manager (`learning-session.ts`)

**Purpose**: Orchestrate complete learning flow

#### Flow:
```
Answer Classification (4A)
    ↓
Calculate Mastery Progression
    ↓
Update Confidence Score
    ↓
Calculate Next Review Date (Spaced Rep)
    ↓
Track Error Patterns
    ↓
Generate Personalized Message (Memory)
    ↓
Record in Eli's Memory
```

#### Key Functions:

**`processLearningSession()`** - Full pipeline
```typescript
Input:
  - skillMastery: Current state
  - classification: A-F from Phase 4A
  - helpLevelUsed: 0-5
  - timeSpent: Seconds
  - learnerProfile: Student's profile
  - learnerMemory: Conversation history

Output: SessionResponse {
  mastery_before / mastery_after
  mastery_progressed: boolean
  next_review: Date (spaced rep scheduled)
  confidence: 0-1
  eli_message: Personalized response
}
```

**`getSkillsDueForReview()`**
- Returns skills where `next_review <= today`
- Used to populate daily practice queue

**`recommendNextSkill()`**
- Prioritizes: Overdue reviews → Favorite topics → Random
- Ensures balanced practice schedule

**`updateStreak()`** - Motivation tracking
```typescript
{
  current_streak: 7,        // Days in a row
  longest_streak: 14,       // Personal record
  last_session_date: Date,
  sessions_this_week: 5,
  sessions_this_month: 18
}
```

---

## Integration Points

### With Phase 4A (Classification):
```
TaskRunner submits answer
    ↓
/api/classify-answer returns Classification (A-F)
    ↓
Phase 4C: processLearningSession()
    ↓
Mastery + Memory + Spaced Rep updated
    ↓
Personalized Eli message + next_review scheduled
```

### With Phase 4B (Foundation Gaps):
```
Classification D (Foundation Gap) detected
    ↓
Bridge tasks generated
    ↓
After bridge tasks complete:
    → Retry original skill
    → If success: mastery progresses normally
    → Eli remembers: "You struggled with negatives but learned!"
```

### With Phase 4D (Missions):
```
Mission Structure (5 tasks, 20 min):
  Task 1: Due for review (spaced rep)
  Task 2: Favorite topic (engagement)
  Task 3: Challenge (push difficulty)
  Task 4: Recovery (build confidence)
  Task 5: Celebration (streak + achievement)
```

---

## Mastery Progression Examples

### Example 1: Quick Learner (Addition)
```
Day 1, Attempt 1: Answer "234+156=390" ✅ (no help)
  → Level 0→1, Next review: 1 day

Day 2: Answer correct again ✅ (no help)
  → Level 1→2, Next review: 2 days

Day 4: Answer correct ✅ + challenged with larger numbers
  → Level 2→3 (FLUENT!), Next review: 3 days

Day 7: Still confident ✅
  → Level 3→4 (EXPERT!), Next review: 7 days

Day 14: Maintenance review ✅
  → Level 4→5 (MASTERY!), Next review: 14 days
```

### Example 2: Foundation Gap → Bridge → Mastery
```
Day 1: Answer "-5 + 3 = -8" ❌ (Foundation Gap D)
  → Level 0→0 (stays), Triggers bridge tasks

Days 1-2: Bridge tasks (3 progressive problems) ✅✅✅
  → "I learned negative numbers!"

Day 3: Original task again "-5 + 3 = -2" ✅ (no help)
  → Level 0→2 (jumps! Bridge accelerated progress)
  → Memory: "Struggled with negatives but conquered it! 💪"

Day 5: Review again ✅
  → Level 2→3 (FLUENT!)
```

---

## Spaced Repetition Schedule

Using **Ebbinghaus Forgetting Curve**:

```
Without Review:
  ~50% forgotten by 1 day
  ~70% forgotten by 1 week
  
With Spaced Repetition:
  Day 1: Learn (100%)
  Day 2: Review (90% retained)
  Day 3: Review (80% retained) 
  Day 5: Review (75% retained)
  Day 7: Review (70% retained)
  → Long-term retention achieved!
```

**Implementation**:
- Level 0-1: Daily (fresh skills need reinforcement)
- Level 2: Every 2 days (building fluency)
- Level 3: Every 3 days (weekly rotation)
- Level 4: Weekly (consolidation)
- Level 5: Biweekly (maintenance only)

---

## Personalization Examples

### Greeting (Based on Profile):
```
Quick learner:
"Bereit für Herausforderung heute, Zoey? 🎯"

Struggling area:
"Wir üben heute Bruchrechnung - du wirst besser! 💪"

Long streak:
"7-Tage-Streak! Du rockst, Zoey! 🔥"
```

### Feedback (Based on Mastery):
```
Incorrect, still Level 0:
"Versuch es nochmal! Das schaffst du! 💪"

Correct, Level 0→1 progression:
"Super! Du hast es gelöst! 🎉"

Correct, Level 2→3 FLUENT:
"🌟 Du bist jetzt fließend in Addition!"

Correct, Level 4→5 MASTERY:
"🏆 MEISTERY LEVEL! Du kannst das anderen erklären!"
```

---

## Confidence Scoring

**How confident are we about this mastery level?**

```typescript
Confidence = (Success Rate + Attempt Factor + Consistency Bonus) / 2

Examples:
  5 attempts, 4 correct, recent 100% streak
  → (80% + 50% + 10%) / 2 = 70% confidence

  15 attempts, 14 correct, mixed recent performance
  → (93% + 100% + 0%) / 2 = 96% confidence
```

**Usage**:
- High confidence (>90%): Can advance to harder problems
- Medium confidence (60-90%): Review regularly, stay in zone
- Low confidence (<60%): More practice needed, use help

---

## Database Schema (PostgreSQL)

```sql
CREATE TABLE skill_mastery (
  id UUID PRIMARY KEY,
  student_id UUID NOT NULL,
  skill_id STRING NOT NULL,
  skill_name STRING NOT NULL,
  current_level INT (0-5),
  attempts INT,
  correct_attempts INT,
  last_practiced TIMESTAMP,
  next_review TIMESTAMP,        -- Spaced repetition
  confidence FLOAT (0-1),
  time_spent_minutes FLOAT,
  error_patterns TEXT[] ARRAY,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE learning_profile (
  student_id UUID PRIMARY KEY,
  favorite_topics TEXT[] ARRAY,
  struggling_areas TEXT[] ARRAY,
  learning_speed STRING,
  preferred_help_level INT,
  current_streak_days INT,
  longest_streak_days INT,
  total_practice_hours FLOAT
);

CREATE TABLE conversation_memory (
  student_id UUID PRIMARY KEY,
  recent_achievements TEXT[] ARRAY,  -- Last 5
  recent_struggles TEXT[] ARRAY,     -- Last 3
  learning_personality TEXT,
  jokes_or_interests TEXT[] ARRAY,
  updated_at TIMESTAMP
);
```

---

## Test Coverage

### Unit Tests (`phase-4c-mastery.test.ts`):

✅ **Mastery Level Calculation** (7 tests)
- Level progression logic
- Regressions on failure
- Maximum level capping

✅ **Spaced Repetition Scheduling** (6 tests)
- Review intervals per level
- Failure-triggered immediate review
- Biweekly maintenance for Level 5

✅ **Confidence Calculation** (4 tests)
- Growth with attempts
- Consistency bonus
- Ceiling at 1.0

✅ **Learning Personality Detection** (3 tests)
- Visual/verbal/kinesthetic scores
- Perfectionist detection
- Independence detection

✅ **Celebration Logic** (3 tests)
- Milestone celebrations
- Every-3rd-correct pattern
- No over-celebration

✅ **Streak Tracking** (2 tests)
- New streak vs continuation
- Longest streak records

---

## Next Phases

### Phase 4D: 20-Minute Mission + XP System
- Mission structure (5 tasks per session)
- XP rewards (based on mastery progression)
- Dynamic difficulty (adapts to learner level)

### Phase 4E: Apple Pencil + Handwriting
- Handwriting input capture
- Digit/symbol recognition
- Handwritten equation verification

### Phase 4F: Dashboard + Parent Reports
- Progress visualization (mastery by skill)
- Weekly/monthly reports for parents
- Learning analytics & insights

---

## Key Design Principles

1. **Mastery First**: Level progression only on genuine understanding (0 help)
2. **Personalization Always**: Every message adapts to learner profile
3. **Memory Matters**: Eli "remembers" Zoey's journey—builds rapport
4. **Spaced Smartly**: Reviews scheduled by forgetting curve, not random
5. **Celebrate Growth**: Every progression recognized & celebrated
6. **Independence Goal**: Goal is Level 5 mastery with 0 help needed

---

## Summary

Phase 4C transforms Eli from a grader to a **learning coach**:
- 📊 Tracks mastery scientifically (0-5 levels)
- 🧠 Remembers everything (learning profile + memory)
- 📅 Plans reviews intelligently (spaced repetition)
- 🎉 Celebrates growth (personalized messages)
- 💪 Builds independence (goal: Level 5 autonomy)

**Result**: Zoey practices smarter, learns faster, stays motivated! ✨
