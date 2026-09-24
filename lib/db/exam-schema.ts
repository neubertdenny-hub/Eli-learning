/**
 * Phase 7A: Exam/Klassenarbeit Datenmodell
 * PostgreSQL Schema
 */

// Deutsche Notenschlüssel (Realschule Standard)
export const GERMAN_GRADING_SCALE = {
  "1": { min: 92, max: 100, label: "Sehr gut" },
  "2": { min: 81, max: 91, label: "Gut" },
  "3": { min: 67, max: 80, label: "Befriedigend" },
  "4": { min: 50, max: 66, label: "Ausreichend" },
  "5": { min: 30, max: 49, label: "Mangelhaft" },
  "6": { min: 0, max: 29, label: "Ungenügend" },
}

export type ExamStatus =
  | "PLANNING"           // Material wird hochgeladen, Themen werden bestätigt
  | "PREPARING"          // Lernplan erstellt, aktives Lernen
  | "READY_FOR_SIMULATION" // Bereit für Probe-Klassenarbeit
  | "SIMULATION_COMPLETED" // Probe absolviert
  | "EXAM_TAKEN"        // Echte Klassenarbeit geschrieben
  | "RESULT_ANALYZED"   // Ergebnis hochgeladen und analysiert
  | "COMPLETED"         // Abgeschlossen

export type ExamTopicSourceType =
  | "CONFIRMED"    // Im Material eindeutig vorhanden
  | "LIKELY"       // Wahrscheinlich vorhanden
  | "FOUNDATION"   // Mathematische Grundlage nötig
  | "USER_CONFIRMED" // Von Nutzer manuell hinzugefügt

export interface Exam {
  id: string
  userId: string
  title: string              // z.B. "Mathe Klassenarbeit"
  subject: "mathematik"      // MVP: nur Mathe
  examDate: string           // ISO 8601: "2026-10-15"
  examDateGerman: string     // Display: "15.10.2026"
  status: ExamStatus
  gradingSchemeId?: string   // Notenschlüssel (optional)
  description?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface ExamMaterial {
  id: string
  examId: string
  documentId: string         // Referenz zu bestehendem Upload-System
  fileName: string
  materialType: "WORKSHEET" | "CHEAT_SHEET" | "TEXTBOOK" | "NOTEBOOK" | "OTHER"
  uploadedAt: string
  analyzedAt?: string
  confidence?: number        // 0-1: wie sicher ist die Analyse
}

export interface ExamTopic {
  id: string
  examId: string
  topicId: string           // Referenz zu bestehendem Topic-System (z.B. "bruchrechnung")
  subtopicId?: string
  sourceType: ExamTopicSourceType
  confidence: number         // 0-1: Wie sicher erkannt
  confirmed: boolean         // Nutzer hat bestätigt
  priority: number          // 1-10: Wichtigkeit für Klassenarbeit
  estimatedLearningMinutes?: number
  createdAt: string
  confirmedAt?: string
}

export interface GradingScheme {
  id: string
  userId: string
  name: string              // z.B. "Realschule Standard"
  scale: Record<string, { min: number; max: number; label: string }>
  isDefault: boolean
  createdAt: string
}

export interface ExamLearningPlan {
  id: string
  examId: string
  version: number          // Neuplanung erhöht version
  generatedAt: string
  status: "ACTIVE" | "SUPERSEDED"
  totalDays: number
  priorityTopics: string[] // topicIds, höchste Priorität
  reviewTopics: string[]
  foundationTopics: string[]
}

export interface ExamPlanItem {
  id: string
  planId: string
  date: string             // ISO 8601
  topicId?: string
  foundationId?: string
  activityType: "LEARN" | "PRACTICE" | "TRANSFER" | "REVIEW" | "MINI_CHECK"
  priority: 1 | 2 | 3      // 1=highest
  selectionReason: string
}

export interface ExamSimulation {
  id: string
  examId: string
  startedAt: string
  submittedAt?: string
  status: "IN_PROGRESS" | "SUBMITTED" | "ANALYZED"
  totalPoints?: number
  earnedPoints?: number
  duration?: number        // Sekunden
  createdAt: string
}

export interface ExamSimulationTask {
  id: string
  simulationId: string
  taskId: string
  taskOrder: number
  pointsPossible?: number
  pointsEarned?: number
  userAnswer?: string
  isCorrect?: boolean
  submittedAt?: string
}

export interface ExamResult {
  id: string
  examId: string
  examDate: string         // Wann war die echte Klassenarbeit
  sourceDocumentId?: string // Korrigierte Arbeit (hochgeladen)
  totalPoints?: number
  earnedPoints?: number
  gradingSchemeId?: string
  grade?: string           // "1", "2", etc.
  analyzedAt: string
  confidence: number       // 0-1: Wie sicher die Analyse
  createdAt: string
}

/**
 * SQL Migrations
 *
 * CREATE TABLE exams (
 *   id TEXT PRIMARY KEY,
 *   user_id TEXT NOT NULL REFERENCES users(id),
 *   title TEXT NOT NULL,
 *   subject TEXT NOT NULL DEFAULT 'mathematik',
 *   exam_date TEXT NOT NULL,
 *   exam_date_german TEXT NOT NULL,
 *   status TEXT NOT NULL DEFAULT 'PLANNING',
 *   grading_scheme_id TEXT,
 *   description TEXT,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   completed_at TIMESTAMP
 * );
 *
 * CREATE TABLE exam_materials (
 *   id TEXT PRIMARY KEY,
 *   exam_id TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
 *   document_id TEXT NOT NULL,
 *   file_name TEXT NOT NULL,
 *   material_type TEXT NOT NULL,
 *   uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   analyzed_at TIMESTAMP,
 *   confidence FLOAT
 * );
 *
 * CREATE TABLE exam_topics (
 *   id TEXT PRIMARY KEY,
 *   exam_id TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
 *   topic_id TEXT NOT NULL,
 *   subtopic_id TEXT,
 *   source_type TEXT NOT NULL,
 *   confidence FLOAT NOT NULL,
 *   confirmed BOOLEAN DEFAULT false,
 *   priority INTEGER NOT NULL DEFAULT 5,
 *   estimated_learning_minutes INTEGER,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   confirmed_at TIMESTAMP
 * );
 *
 * CREATE TABLE grading_schemes (
 *   id TEXT PRIMARY KEY,
 *   user_id TEXT NOT NULL REFERENCES users(id),
 *   name TEXT NOT NULL,
 *   scale JSONB NOT NULL,
 *   is_default BOOLEAN DEFAULT false,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * );
 *
 * CREATE TABLE exam_learning_plans (
 *   id TEXT PRIMARY KEY,
 *   exam_id TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
 *   version INTEGER NOT NULL DEFAULT 1,
 *   generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   status TEXT NOT NULL DEFAULT 'ACTIVE',
 *   total_days INTEGER NOT NULL,
 *   priority_topics TEXT[] NOT NULL,
 *   review_topics TEXT[] NOT NULL,
 *   foundation_topics TEXT[] NOT NULL
 * );
 *
 * CREATE TABLE exam_plan_items (
 *   id TEXT PRIMARY KEY,
 *   plan_id TEXT NOT NULL REFERENCES exam_learning_plans(id) ON DELETE CASCADE,
 *   date TEXT NOT NULL,
 *   topic_id TEXT,
 *   foundation_id TEXT,
 *   activity_type TEXT NOT NULL,
 *   priority INTEGER NOT NULL,
 *   selection_reason TEXT NOT NULL
 * );
 *
 * CREATE TABLE exam_simulations (
 *   id TEXT PRIMARY KEY,
 *   exam_id TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
 *   started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   submitted_at TIMESTAMP,
 *   status TEXT NOT NULL DEFAULT 'IN_PROGRESS',
 *   total_points FLOAT,
 *   earned_points FLOAT,
 *   duration INTEGER,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * );
 *
 * CREATE TABLE exam_simulation_tasks (
 *   id TEXT PRIMARY KEY,
 *   simulation_id TEXT NOT NULL REFERENCES exam_simulations(id) ON DELETE CASCADE,
 *   task_id TEXT NOT NULL,
 *   task_order INTEGER NOT NULL,
 *   points_possible FLOAT,
 *   points_earned FLOAT,
 *   user_answer TEXT,
 *   is_correct BOOLEAN,
 *   submitted_at TIMESTAMP
 * );
 *
 * CREATE TABLE exam_results (
 *   id TEXT PRIMARY KEY,
 *   exam_id TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
 *   exam_date TEXT NOT NULL,
 *   source_document_id TEXT,
 *   total_points FLOAT,
 *   earned_points FLOAT,
 *   grading_scheme_id TEXT,
 *   grade TEXT,
 *   analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   confidence FLOAT NOT NULL,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * );
 */
