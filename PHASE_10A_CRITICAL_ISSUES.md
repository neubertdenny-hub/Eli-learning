# Phase 10A – CRITICAL ISSUES FOUND

**Date:** 2026-09-25
**Status:** 🔴 BLOCKER - Phase 11 CANNOT start until resolved

---

## ISSUE #1: Model Runtime Verification Required

**Severity:** 🟡 HIGH - Requires Live API Testing

**Location:** `/lib/ai/models.config.ts` (lines 36-60+)

**Status:** ⚠️ VERIFY AGAINST LIVE API / ACCOUNT ACCESS

**Background:**
Current OpenAI models verified as existing in official API documentation:
- `gpt-6-astra` ✓ (verified in OpenAI docs)
- `gpt-5.6-sol` ✓ (verified in OpenAI docs)
- `gpt-5.6-terra` ✓ (verified in OpenAI docs)
- `gpt-5.6-luna` ✓ (verified in OpenAI docs)

**What Still Needs Verification:**
1. OpenAI account/API project has access to these models
2. Current OpenAI SDK version supports these model IDs
3. Vision API compatibility (image/PDF input)
4. Structured output support (Zod schemas)
5. `reasoning_effort` parameter support
6. Actual API responses work with current syntax

**Testing Required:**
- Live smoke test for each model
- Image input functionality
- Structured output validation
- Error handling & fallback chain

**Resolution:**
Run Model Verification Smoke Tests → Document Results → Proceed with Phase 10A

**Before Phase 11:** TESTING REQUIRED ✓

---

## ISSUE #2: Model Fallback Chain Verification

**Severity:** 🟡 HIGH

**Location:** `/lib/ai/models.config.ts` + `/lib/ai/openai.ts`

**Issue:**
Fallback chain must be tested with actual models:
- Primary: gpt-6-astra
- Fallback 1: gpt-5.6-sol
- Fallback 2: gpt-5.6-terra
- Fallback 3: gpt-5.6-luna

**Resolution:** Test fallback behavior in smoke tests

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

**Status:** ⏳ **IN PROGRESS** - Model Verification Tests Required

**Not a blocker - proceeding with Phase 10A validation**

**Required Before Phase 11:**
1. ✓ Model names verified (exist in OpenAI docs)
2. ⏳ Live API smoke tests (in progress)
3. ⏳ Vision functionality verification
4. ⏳ Structured output validation
5. ⏳ Complete remaining Phase 10A checks
6. ⏳ Generate Final GO/NO-GO

**Phase 11 CANNOT start until Phase 10A is complete.**

---

**Next Action:** Create & run Model Verification Smoke Test

