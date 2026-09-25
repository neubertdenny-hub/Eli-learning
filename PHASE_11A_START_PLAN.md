# Phase 11A – Start Plan

**Status:** READY FOR EXECUTION

---

## PREREQUISITE CHECKLIST

BEFORE ANY CODE CHANGES:

- [ ] Database backup verified
- [ ] Rollback procedure documented
- [ ] Test restore successful
- [ ] Git baseline tagged (phase-11a-baseline)
- [ ] Latest commit: e2cf549

---

## PHASE 11A EXECUTION ROADMAP

### Step 1: Subject Schema Foundation
- Create `subjects` table
- Seed MATH (active=true)
- Seed ENGLISH (active=false)
- Create `SubjectRegistry`
- Create Subject validation functions

### Step 2: Table Classification
- Review all 26 tables per MIGRATION_PRECHECK.md
- Classify: GLOBAL / SUBJECT_SCOPED / SUBJECT_CONTENT / SUBJECT_FOUNDATION / DERIVED
- Document which need subject_id column
- Identify foreign key relationships

### Step 3: Migration Scripts
- Add subject_id columns where needed
- Migrate existing Math data (subject_id = 'MATH')
- Validate no data loss
- Create rollback script

### Step 4: Subject Context
- Create SubjectProvider
- Create useSubject() hook
- Implement localStorage persistence
- Add to app layout

### Step 5: UI Layer
- Create SubjectSwitcher component
- Update home page
- Prepare routing structure (/math, /english)
- Add subject badges

### Step 6: System Integration
- Subject context in AI requests
- Subject filter in queries
- Upload subject context
- Mastery subject scope
- Foundation subject scope

### Step 7: Migration Validation
- Run regression tests
- Verify Math data completeness
- Check for orphaned records
- Validate isolation

### Step 8: Reporting
- Create PHASE_11A_FINAL_REPORT.md
- Provide GO/NO-GO decision
- Document migration results

---

## CRITICAL SAFETY RULES

1. ✓ Backup before migration
2. ✓ Test in dev first
3. ✓ Validate data after each step
4. ✓ Keep rollback ready
5. ✓ Never modify Math content
6. ✓ Never lose Zoey's data
7. ✓ Document every change
8. ✓ Test regression at each step

---

## ESTIMATED EFFORT

- Database setup: 2-3 hours
- Migration: 3-4 hours
- Testing: 2-3 hours
- Documentation: 1-2 hours

**Total: ~10-12 hours**

---

## NEXT ACTION

Confirm:
1. Backup status ✓ or ❌
2. Rollback plan ready ✓ or ❌
3. Ready to proceed ✓ or ❌

Then execute Step 1 of roadmap.

---

**READY FOR PHASE 11A EXECUTION**

Awaiting confirmation before proceeding.
