# PHASE 9 – ELI PARENT COACH & LONG-TERM LEARNING
## Full Requirements Document

**Status:** Ready for Implementation  
**Saved:** 2026-09-25  
**Scope:** Parent-facing insights layer + closed learning loop  

---

## CORE PRINCIPLE

**Phase 9 does NOT build new learning engines.**

Phase 9 reads Phase 8 data and makes it understandable for parents.

**Magic is the closed loop:**

School Material  
↓  
Phase 7: Exam Prep  
↓  
Practice Tasks (Phase 4-8)  
↓  
**Real Exam / Klassenarbeit**  
↓  
Upload Corrected Exam (Phase 9)  
↓  
AI Analyzes Errors  
↓  
Parent Confirms Findings  
↓  
Phase 8 Gets Feedback  
↓  
Next Training Optimized  

---

## KEY DELIVERABLES

✅ **Parent Dashboard 2.0** – Clean, iPad-friendly  
✅ **Weekly Reports** – Automated, evidence-based  
✅ **Long-Term Timeline** – 7-day, 21-day, 3-month, yearly  
✅ **School Assessments** – Real grades tracked separately  
✅ **Corrected Exam Analysis** – Upload + AI + human confirmation  
✅ **Closed Loop** – Exam feedback → Phase 8 optimization  
✅ **Parent Coach** – Q&A service (no AI hallucinations)  
✅ **Decision Transparency** – Why did ELI do that?  
✅ **School Material Hub** – Organize docs, track current topics  
✅ **Goals & Notifications** – Goals as guidance, not pressure  
✅ **3-Week Report** – Our MVP success metric  

---

## NON-NEGOTIABLE RULES

- ❌ Don't rebuild Phase 4, 5, 6, 7, or 8
- ❌ Don't create fake learning science (no "learning styles")
- ❌ Don't calculate grades without confirmed grading scale
- ❌ Don't claim ELI caused a school grade
- ❌ Don't send raw DB to OpenAI
- ❌ Don't let AI directly change mastery/learning state
- ❌ Don't make AI decisions without human confirmation (for school data)
- ✅ Reuse existing Phase 8 KPIs
- ✅ Verify all AI-generated insights with parent before save
- ✅ Show evidence + confidence with every claim
- ✅ Keep child UI simple, parent UI detailed

---

## CRITICAL: THE EXAM UPLOAD FLOW

**This is the MVP differentiator.**

1. Parent uploads photo/PDF of corrected exam
2. OpenAI analyzes:
   - Topics tested
   - Points per topic
   - Visible errors
   - Teacher feedback
3. **System shows findings**
4. **Parent confirms or corrects**
5. **Only then save to DB**
6. **Phase 8 gets feedback**: "Zoey failed at transfer questions in fractions despite good practice"
7. **Next week's training optimizes** for that weakness

Without this, ELI never knows how training translated to real school performance.

---

## IMPLEMENTATION ORDER (CRITICAL)

Don't try to build Phase 9 all at once.

### 9A: Parent Aggregation (read Phase 8 data)
### 9B: Weekly Reports (automated)
### 9C: Long-Term Timeline (charts)
### 9D: School Assessments (manual entry)
### 9E: Exam Upload + Analysis (THE KEY)
### 9F: Closed Loop Integration (feed back to Phase 8)
### 9G: Parent Coach Q&A
### 9H: Decision Transparency
### 9I: School Material Hub
### 9J: Goals & Notifications
### 9K: 3-Week Report
### 9L: Production Validation

Test after each subphase. Don't break Phase 4-8.

---

## WHY THIS MATTERS

**Without Phase 9:**  
- ELI trains Zoey  
- Zoey takes exam  
- We never know if training helped  
- We can't improve  

**With Phase 9:**  
- ELI trains Zoey  
- Zoey takes exam  
- Parent uploads corrected exam  
- System learns: "Fractions transfer failed despite good practice"  
- Phase 8 says: "Next week, more transfer tasks for fractions"  
- Learning gets *smarter* over time  

---

## CURRENT STATE

✅ Phase 1-8: Complete  
✅ Monitoring Dashboard: Live  
✅ Shadow Mode: Ready  
✅ Base data: Exists in Phase 8  

⏳ Phase 9: Ready to build (this session ended at Phase 8)

---

## NEXT SESSION

1. Start with Phase 9A (Parent Data Aggregation)
2. Follow implementation order
3. Test after each subphase
4. After Phase 9L: Complete & deploy

Good luck! This is where ELI becomes truly adaptive. 🚀

---

*Prepared by Claude for handover to next session.*  
*All Phase 1-8 code is deployed and live on main branch.*
