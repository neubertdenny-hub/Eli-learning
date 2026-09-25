# Phase 10A – CRITICAL ISSUES FOUND

**Date:** 2026-09-25
**Status:** 🔴 BLOCKER - Phase 11 CANNOT start until resolved

---

## BLOCKER #1: Invalid OpenAI Model Names

**Severity:** 🔴 CRITICAL - ALL AI FUNCTIONS FAIL

**Location:** `/lib/ai/models.config.ts` (lines 36-60+)

**Issue:**
```
Configured models that DON'T EXIST in OpenAI API:
- "gpt-6-astra" ❌ (no GPT-6 exists)
- "gpt-5.6-sol" ❌ (no sol variant)
- "gpt-5.6-terra" ❌ (no terra variant)  
- "gpt-5.6-luna" ❌ (no luna variant)
```

**Impact:**
- Document analysis (exams, school materials) will fail
- Image analysis (handwriting) will fail
- Math reasoning will fail
- Answer classification will fail
- Task generation will fail
- ALL parent coach AI endpoints will fail
- Exam system will fail

**Actual Available OpenAI Models (Sept 2026):**
```
- gpt-4o (most capable, recommended)
- gpt-4-turbo
- gpt-4
- o1 (reasoning)
- o1-mini (reasoning)
- gpt-3.5-turbo (legacy)
```

**Resolution Required:**
1. Update models.config.ts to use REAL model names
2. Verify with OpenAI API which models actually exist
3. Test all AI endpoints with real models
4. Update cost estimation based on real pricing
5. Verify structured output support for new models

**Before Phase 11:** FIX REQUIRED ✓

---

## BLOCKER #2: Model Fallback Chain Not Tested

**Severity:** 🔴 CRITICAL

**Location:** `/lib/ai/models.config.ts` + `/lib/ai/openai.ts`

**Issue:**
System references `FALLBACK_CHAIN` for when primary model fails, but:
- Fallback models also use invalid names
- No actual test of fallback behavior
- No verification fallbacks work with real OpenAI API

**Resolution:** Define actual fallback chain with real models

---

## ISSUE #3: Structured Output Schema Compatibility

**Severity:** 🟡 HIGH

**Location:** `/lib/ai/schemas.ts`

**Issue:**
Code uses Zod validation schemas for structured outputs.
These must work with selected OpenAI model's `response_format`.

**Check:**
- Does gpt-4o support `response_format: { type: "json_schema" }`?
- Are Zod schemas compatible?
- Need to test structured outputs with real models

**Resolution:** Verify schema compatibility with actual chosen model

---

## ISSUE #4: Vision API Compatibility

**Severity:** 🟡 HIGH

**Location:** `/lib/ai/vision-client.ts`

**Issue:**
Code assumes selected model supports vision (image + PDF analysis).

**Real Status (Sept 2026):**
- gpt-4o: ✓ supports vision
- gpt-4-turbo: ✓ supports vision
- gpt-4: ✓ supports vision
- o1: ❌ does NOT support vision
- o1-mini: ❌ does NOT support vision

**Resolution:** Ensure vision-using models are vision-capable

---

## ISSUE #5: Reasoning Effort Parameter

**Severity:** 🟡 MEDIUM

**Location:** `/lib/ai/models.config.ts` line 53

**Issue:**
```
reasoning_effort: "high" 
```

This parameter only works with `o1` and `o1-mini` models.
If using gpt-4o, this parameter will be rejected.

**Resolution:** Only use `reasoning_effort` for o1 models

---

## ISSUE #6: Temperature Restrictions

**Severity:** 🟡 MEDIUM

**Issue:**
- o1 models don't support `temperature` parameter (must be 1)
- Different models have different temperature ranges

**Current Config has:**
```
temperature: 0.2 - 0.5
```

**If using o1:** Will fail

**Resolution:** Align temperature with chosen model constraints

---

## CHECKLIST TO UNBLOCK

- [ ] 1. List actual available OpenAI models from API
- [ ] 2. Choose primary model for each use case
- [ ] 3. Define actual fallback chain
- [ ] 4. Update models.config.ts with real names
- [ ] 5. Verify vision support for image/PDF use cases
- [ ] 6. Verify structured output support
- [ ] 7. Align temperature/parameters per model
- [ ] 8. Test ALL AI endpoints with real models:
  - [ ] Document analysis
  - [ ] Image analysis
  - [ ] Answer classification
  - [ ] Task generation
  - [ ] Eli text generation
  - [ ] Error analysis
- [ ] 9. Update cost estimation
- [ ] 10. Test parent coach AI endpoints

---

## RECOMMENDATION

**Suggested Model Mapping (Sept 2026 OpenAI Availability):**

| Use Case | Model | Reason |
|----------|-------|--------|
| Document Analysis | gpt-4o | Vision + quality |
| Image Analysis | gpt-4o | Vision support |
| Math Reasoning | gpt-4o or o1 | Quality (o1 for complex) |
| Answer Classification | gpt-4o | Quality + speed |
| Task Generation | gpt-4o | Consistency |
| Eli Text | gpt-4o | Speed + cost |
| Error Analysis | gpt-4o | Analysis quality |

**Fallback Chain:**
1. gpt-4o (primary)
2. gpt-4-turbo (if quota exceeded)
3. gpt-4 (fallback)
4. gpt-3.5-turbo (minimal fallback)

---

## PHASE 10A STATUS

**GO/NO-GO:** 🔴 **NO-GO** for Phase 11

**Reason:** BLOCKER #1 and #2 prevent ANY AI functions from working

**Required Before Phase 11:**
1. Fix model configuration with REAL models
2. Test all AI endpoints
3. Re-run Phase 10A validation

**Phase 11 CANNOT start until these are resolved.**

---

**Next Action:** Update models.config.ts with real OpenAI models and test

