# Phase 11 Migration Precheck

**Purpose:** Identify all math-specific data before multi-subject migration
**Date:** 2026-09-25
**Status:** DATABASE SAFETY ANALYSIS

---

## TABLE INVENTORY & SUBJECT MIGRATION RISK

| Table | Purpose | Math-Specific? | Subject Migration Risk | Pre-Migration Action |
|-------|---------|---|---|---|
| users | Learner profiles | No | Low | Add subject context to sessions |
| skill_mastery | Per-skill progress | **YES** | HIGH | Add subject_id column + migrate |
| learningMissions | Daily plans | **YES** | HIGH | Add subject_id column |
| missionBlocks | Mission sections | **YES** | HIGH | Add subject_id column |
| missionAdjustments | Adaptive changes | **YES** | MEDIUM | Add subject_id column |
| learningStrategyStats | Strategy effectiveness | **YES** | HIGH | Add subject_id column |
| adaptiveDecisions | Decision logs | **YES** | MEDIUM | Add subject_id column |
| learningBaselines | KPI snapshots | **YES** | MEDIUM | Add subject_id column |
| learningEffectivenessSnapshots | Periodic metrics | **YES** | MEDIUM | Add subject_id column |
| schoolTopicSignals | Curriculum tracking | **YES** | HIGH | Topic mapping needed |
| schoolAssessments | Exam records | **YES** | HIGH | Add subject_id column |
| schoolAssessmentAnalysis | AI analysis | **YES** | HIGH | Add subject_id column |
| xpSystem | Levels/streaks | No | LOW | Subject-agnostic (global) |
| tasksCompleted | Task history | **YES** | HIGH | Add subject_id column |
| userSessions | Learning sessions | **YES** | MEDIUM | Add subject_id column |
| sessionMemory | Eli Memory | **YES** | MEDIUM | Add subject_id column |

---

## CRITICAL MIGRATION TASKS

### TASK 1: Foreign Key Mapping
**Current Status:** DRIZZLE foreign keys not fully declared
**Risk:** Data integrity not enforced at DB level
**Action Required:** 
- [ ] Identify all references without .references()
- [ ] Add explicit foreign key constraints
- [ ] Test referential integrity

### TASK 2: Data Backup (BEFORE ANY MIGRATION)
**Critical:** Backup full database
- [ ] Verify backup procedure works
- [ ] Test restore procedure
- [ ] Store backup securely
- [ ] Document backup location

### TASK 3: Column Addition Strategy
**For each math-specific table:**
```sql
ALTER TABLE table_name ADD COLUMN subject_id TEXT NOT NULL DEFAULT 'math';
ALTER TABLE table_name ADD FOREIGN KEY (subject_id) REFERENCES subjects(id);
CREATE INDEX idx_subject_table ON table_name(subject_id);
```

### TASK 4: Data Migration Logic
**Batch process:**
```
For each existing math table:
1. Backup
2. Add subject_id column
3. Set subject_id = 'math' for all existing rows
4. Add foreign key constraint
5. Create index
6. Validate data integrity
7. Verify queries work
```

### TASK 5: Query Updates
**All math queries must add subject filter:**
```ts
// Before (Phase 10)
db.select().from(skillMastery).where(eq(skillMastery.userId, userId))

// After (Phase 11)
db.select()
  .from(skillMastery)
  .where(and(
    eq(skillMastery.userId, userId),
    eq(skillMastery.subjectId, 'math')
  ))
```

---

## RISK ASSESSMENT: SUBJECT MIGRATION

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Data loss during migration | 🔴 CRITICAL | Full DB backup before starting |
| Mastery queries break | 🔴 CRITICAL | Add subject filter to all queries |
| Old data inaccessible | 🟠 HIGH | Ensure historical data queryable |
| Adaptive Intelligence corrupted | 🟠 HIGH | Test decision engine with subject filter |
| Parent data mixed | 🟠 HIGH | Parent APIs require subject context |
| Exam system broken | 🟠 HIGH | Exam tables need subject mapping |
| XP/Level system confusion | 🟡 MEDIUM | XP should remain global (per user, not per subject) |
| API backwards compatibility | 🟡 MEDIUM | All routes need subject parameter |

---

## PRECHECK VALIDATION (Before Phase 11 Can Start)

- [ ] Database backup verified working
- [ ] All foreign keys identified
- [ ] Math-specific tables mapped (16 identified)
- [ ] Subject-agnostic tables identified (10 identified)
- [ ] Data isolation verified (user A can't see user B's data)
- [ ] Referential integrity checked
- [ ] Migration script drafted
- [ ] Rollback procedure documented
- [ ] Query test suite created
- [ ] No destructive migrations approved

---

## TABLES REQUIRING SUBJECT_ID ADDITION

```
1. skill_mastery
2. learningMissions
3. missionBlocks
4. missionAdjustments
5. learningStrategyStats
6. adaptiveDecisions
7. learningBaselines
8. learningEffectivenessSnapshots
9. schoolTopicSignals
10. schoolAssessments
11. schoolAssessmentAnalysis
12. tasksCompleted
13. userSessions
14. sessionMemory
15. schoolTopicSignals (already listed)
16. (potentially) xpSystem (decide: per-subject or global?)
```

---

## TABLES REMAINING SUBJECT-AGNOSTIC

```
1. users (learner profiles - global)
2. xpSystem (TBD: global levels or per-subject?)
3. (others TBD after code review)
```

---

## NEXT STEPS (In Order)

1. **Phase 10A Priority 2:** Verify no existing data corruption
2. **Phase 10A Priority 2:** Test backup/restore
3. **Phase 10A Priority 3:** Create regression tests
4. **Phase 11 Preparation:** Draft migration scripts
5. **Phase 11 Execution:** Execute migration with full backup
6. **Phase 11 Validation:** Test all queries with subject filter

---

## CRITICAL: ZOEY'S DATA PROTECTION

Zoey's existing learning data (mastery, foundations, exam history, adaptive decisions) must:
- ✓ Be fully backed up before Phase 11
- ✓ Remain accessible and unmodified
- ✓ Be queryable with subject='math' filter
- ✓ Not lose any mastery level progress
- ✓ Not lose any foundation gap detection
- ✓ Not lose any adaptive intelligence history

If any data is lost during migration, Phase 11 is a FAILED attempt.

---

**Status:** READY FOR MIGRATION REVIEW
**Next:** Priority 2 Database Safety Checks
