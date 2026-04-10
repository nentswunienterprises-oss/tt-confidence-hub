# Transition Engine Report + Parent UI Scenario Analysis

This document uses the current PodDigitizer engine logic to produce exact weekly and monthly parent-facing report outputs for 2-topic, 3-topic, and 5-topic scenarios. It also includes the parent dashboard state output for each topic, and it highlights where the auto-generated text becomes awkward or likely to need adjustment.

## Methodology

Reports are generated from `server/routes.ts` using:
- `createWeeklyStructuredDataFromDrills(chunk)` for every 2 drill submissions after the most recent weekly report
- `createMonthlyStructuredDataFromDrills(chunk)` for every 8 drill submissions after the most recent monthly report

Parent dashboard state copy is generated from `client/src/pages/client/parent/dashboard.tsx` via `PARENT_STATE_ENGINE`.

Every weekly report below uses 2 sessions. Every monthly report uses 8 sessions.

---

## Scenario 1 — 2 Topics: Clarity Low + Structured Execution Medium

### Student state at start of month
- `Fractions` — Clarity / Low
- `Ratios` — Structured Execution / Medium

### Session flow

Week 1 / Sessions 1-2
1. `Fractions` diagnosis drill, Clarity / Low, score 42, behavior summary `breakdown under pressure`, nextMove `Run Clarity drill`
2. `Ratios` training drill, Structured Execution / Medium, score 68, behavior summary `inconsistent execution`, nextMove `Run Structured Execution drill`

Week 2 / Sessions 3-4
3. `Fractions` training drill, Clarity / Medium, score 72, behavior summary `stable execution`, nextMove `Run Clarity drill`
4. `Ratios` training drill, Structured Execution / High, score 87, behavior summary `stable execution`, nextMove `Run Structured Execution High Maintenance drill`

Weeks 3-4 / Sessions 5-8
5. `Fractions` training drill, Clarity / Medium, score 70, behavior summary `stable execution`, nextMove `Run Clarity drill`
6. `Ratios` training drill, Structured Execution / High, score 83, behavior summary `stable execution`, nextMove `Run Structured Execution High Maintenance drill`
7. `Fractions` training drill, Clarity / Medium, score 85, behavior summary `stable execution`, nextMove `Run Clarity drill`
8. `Ratios` training drill, Structured Execution / High, score 90, behavior summary `stable execution`, nextMove `Run Structured Execution High Maintenance drill`

### Parent dashboard state at end of month
These are the exact `status` / `meaning` / `focus` strings for each topic.

- `Fractions` — Clarity / Medium
  - Status: "Your child is beginning to understand this topic more clearly."
  - Meaning: "They can follow explanations, but still need reinforcement to apply it independently."
  - Focus: "We are increasing practice and helping them apply the method more consistently."

- `Ratios` — Structured Execution / High
  - Status: "Your child can now solve problems consistently in this topic."
  - Meaning: "They are able to follow the correct steps independently with minimal support."
  - Focus: "We are introducing more challenging questions to strengthen their response under difficulty."

### Weekly report 1 (sessions 1-2)

- `weekStartDate`: first session date
- `weekEndDate`: second session date
- `sessionsCompletedThisWeek`: 2
- `Main Topics Covered`: `This week focused on: Fractions, Ratios.`
- `What Improved This Week`: `No level change this week. The student remained at the same conditioning level in current topics.`
- `Student Response Pattern This Week`: `During this week, the student typically had: breakdown under pressure. Performance remained stable with no level change.`
- `Main Misunderstanding This Week`: `The main challenge this week was breakdown under pressure.`
- `Main Correction That Helped`: `The student remained in Clarity (Low) for Fractions. The student remained in Structured Execution (Medium) for Ratios. Volatility: 0 upshifts, 0 downshifts, 0 held sessions.`
- `Boss Battle Summary This Week`:
  - `Fractions`
    - `Started: Clarity (Low)`
    - `Current: Clarity (Low)`

  - `Ratios`
    - `Started: Structured Execution (Medium)`
    - `Current: Structured Execution (Medium)`
- `What needs reinforcement next week`: `Next week will focus on: Running Clarity drill and Running Structured Execution drill.`

**Weakness / awkward point**
- The weekly summary is accurate, but it reads as a cold technical status rather than a parent-friendly explanation of why two different topic paths are both "stable".
- The report shows both topics equally even though one topic is actively failing and the other is just holding.

### Weekly report 2 (sessions 3-4)

- `Main Topics Covered`: `This week focused on: Fractions, Ratios.`
- `What Improved This Week`: `The student showed level gains in Fractions, Ratios.`
- `Student Response Pattern This Week`: `During this week, the student typically had: stable execution. These patterns supported level gains in Fractions and Ratios.`
- `Main Misunderstanding This Week`: `No recurring breakdown signal was detected this week.`
- `Main Correction That Helped`: `The student moved from Clarity (Low) to Clarity (Medium) in Fractions. The student moved from Structured Execution (Medium) to Structured Execution (High) in Ratios. Volatility: 2 upshifts, 0 downshifts, 0 held sessions.`
- `Boss Battle Summary This Week`:
  - `Fractions`
    - `Started: Clarity (Low)`
    - `Current: Clarity (Medium)`

  - `Ratios`
    - `Started: Structured Execution (Medium)`
    - `Current: Structured Execution (High)`
- `Next Focus`: `Next week will focus on: Running Clarity drill and Running Structured Execution High Maintenance drill.`

**Weakness / awkward point**
- The parent-facing text is fine for a positive week, but the use of raw start/end lines in `Boss Battle Summary` becomes repetitive and may look too technical.
- The phrase `Running Structured Execution High Maintenance drill.` is accurate but not very natural in parent copy.

### Monthly report (sessions 1-8)

- `mainAreasCoveredThisMonth`: `This month focused on: Fractions, Ratios.`
- `What Became Stronger`: `The student strengthened 2 topics this month (Fractions, Ratios). Average session score this month: 76/100.`
- `Response Trend`: `Across the month, the student typically showed: stable execution. These patterns supported level gains in Fractions and Ratios.`
- `Recurring Challenge`: `No recurring breakdown signal was detected this month.`
- `System Outcome`: `The student moved from Clarity (Low) to Clarity (Medium) in Fractions. The student moved from Structured Execution (Medium) to Structured Execution (High) in Ratios. Volatility: 2 upshifts, 0 downshifts, 4 held sessions.`
- `Topic Progression`:
  - `Fractions`
    - `Start: Clarity (Low)`
    - `End: Clarity (Medium)`

  - `Ratios`
    - `Start: Structured Execution (Medium)`
    - `End: Structured Execution (High)`
- `Next Month Focus`: `Next month will focus on: Maintaining with mixed practice in Fractions and Maintaining with mixed practice in Ratios.`

**Weakness / awkward point**
- `Next Month Focus` is literal from the engine and reads oddly in parent copy. It does not say what specific skill or topic to emphasize, only a generic process phrase.
- The `System Outcome` line is correct but mechanical: it says state transitions clearly, but it may feel too internal and not emotionally reassuring.

---

## Scenario 2 — 3 Topics: Clarity High + Controlled Discomfort Medium + Time Pressure Stability Low

### Student state at start of month
- `Algebra` — Clarity / High
- `Geometry` — Structured Execution / Medium
- `Probability` — Time Pressure Stability / Low

### Session flow

Week 1 / Sessions 1-2
1. `Algebra` diagnosis drill, Clarity / High, score 84, behavior summary `stable execution`, nextMove `Run Clarity drill`
2. `Probability` training drill, Time Pressure Stability / Low, score 44, behavior summary `breakdown under pressure`, nextMove `Run Time Pressure Stability drill`

Week 2 / Sessions 3-4
3. `Geometry` training drill, Structured Execution / Medium, score 66, behavior summary `mixed response`, nextMove `Run Structured Execution drill`
4. `Algebra` training drill, Clarity / High Maintenance, score 87, behavior summary `stable execution`, nextMove `Run Structured Execution drill`

Weeks 3-4 / Sessions 5-8
5. `Probability` training drill, Time Pressure Stability / Low, score 39, behavior summary `breakdown under pressure`, nextMove `Run Time Pressure Stability drill`
6. `Geometry` training drill, Structured Execution / Low, score 42, behavior summary `breakdown under pressure`, nextMove `Run Structured Execution drill`
7. `Algebra` training drill, Clarity / High Maintenance, score 92, behavior summary `stable execution`, nextMove `Run Structured Execution drill`
8. `Probability` training drill, Time Pressure Stability / Low, score 47, behavior summary `breakdown under pressure`, nextMove `Run Time Pressure Stability drill`

### Parent dashboard state at end of month

- `Algebra` — Clarity / High Maintenance
  - Status: "Your child has sustained strong clarity in this topic."
  - Meaning: "They have held high performance consistently and are ready for progression decisions."
  - Focus: "We are now transitioning into Structured Execution training."

- `Geometry` — Structured Execution / Low
  - Status: "Your child is learning to apply the steps correctly."
  - Meaning: "They understand the topic but struggle to follow the method consistently on their own."
  - Focus: "We are reinforcing a clear step-by-step approach so they can start and complete problems reliably."

- `Probability` — Time Pressure Stability / Low
  - Status: "Your child is learning to stay structured under time pressure."
  - Meaning: "They can solve problems, but may lose structure when working against the clock."
  - Focus: "We are helping them maintain their method while working within time limits."

### Weekly report 1 (sessions 1-2)

- `Main Topics Covered`: `This week focused on: Algebra, Probability.`
- `What Improved This Week`: `No level change this week. The student remained at the same conditioning level in current topics.`
- `Student Response Pattern This Week`: `During this week, the student typically had: breakdown under pressure. Performance remained stable with no level change.`
- `Main Misunderstanding This Week`: `The main challenge this week was breakdown under pressure.`
- `Main Correction That Helped`: `The student remained in Clarity (High) for Algebra. The student remained in Time Pressure Stability (Low) for Probability. Volatility: 0 upshifts, 0 downshifts, 0 held sessions.`
- `Boss Battle Summary This Week`:
  - `Algebra`
    - `Started: Clarity (High)`
    - `Current: Clarity (High)`

  - `Probability`
    - `Started: Time Pressure Stability (Low)`
    - `Current: Time Pressure Stability (Low)`
- `Next Focus`: `Next week will focus on: Running Clarity drill and Running Time Pressure Stability drill.`

**Weakness / awkward point**
- `Geometry` is absent from the first weekly report because it was not in either session. This can make the parent feel the weekly report is incomplete if they know the topic should be active.

### Weekly report 2 (sessions 3-4)

- `Main Topics Covered`: `This week focused on: Geometry, Algebra.`
- `What Improved This Week`: `The student showed level gains in Algebra.`
- `Student Response Pattern This Week`: `During this week, the student typically had: mixed response. These patterns supported level gains in Algebra.`
- `Main Misunderstanding This Week`: `No recurring breakdown signal was detected this week.`
- `Main Correction That Helped`: `The student remained in Structured Execution (Medium) for Geometry. The student moved from Clarity (High) to Clarity (High Maintenance) in Algebra. Volatility: 1 upshift, 0 downshifts, 0 held sessions.`
- `Boss Battle Summary This Week`:
  - `Geometry`
    - `Started: Structured Execution (Medium)`
    - `Current: Structured Execution (Medium)`

  - `Algebra`
    - `Started: Clarity (High)`
    - `Current: Clarity (High Maintenance)`
- `Next Focus`: `Next week will focus on: Running Structured Execution drill and Running Structured Execution drill.`

**Weakness / awkward point**
- The repeated `Running Structured Execution drill` in `Next Focus` is redundant. It should collapse duplicate actions or make them topic-specific.
- `Probability` is still not represented in this report, reinforcing the risk that weekly summaries feel disconnected from the full topic set.

### Monthly report (sessions 1-8)

- `mainAreasCoveredThisMonth`: `This month focused on: Algebra, Probability, Geometry.`
- `What Became Stronger`: `This month was mixed: improved in 1 topic (Algebra), regressed in 1, and held in 1. Average session score this month: 65/100.`
- `Response Trend`: `Across the month, the student showed mixed responses (stable execution and breakdown under pressure), but the overall trend improved in Algebra.`
- `Recurring Challenge`: `The main recurring challenge this month was breakdown under pressure.`
- `System Outcome`: `The student moved from Clarity (High) to Clarity (High Maintenance) in Algebra. The student regressed from Structured Execution (Medium) to Structured Execution (Low) in Geometry. Volatility: 1 upshift, 1 downshift, 3 held sessions.`
- `Topic Progression`:
  - `Algebra`
    - `Start: Clarity (High)`
    - `End: Clarity (High Maintenance)`

  - `Probability`
    - `Start: Time Pressure Stability (Low)`
    - `End: Time Pressure Stability (Low)`

  - `Geometry`
    - `Start: Structured Execution (Medium)`
    - `End: Structured Execution (Low)`
- `Next Month Focus`: `Next month will focus on: Maintaining with mixed practice in Algebra, rebuilding stability in Geometry, and Maintaining with mixed practice in Probability.`

**Weakness / awkward point**
- The monthly summary is logically correct, but the parent sees a mixture of very different agendas in one sentence.
- `Topic Progression` will contain a topic held steady, a progress topic, and a regressed topic; the raw line format may feel too dense for a parent.

---

## Scenario 3 — 5 Topics: Full Phase Coverage

### Student state at start of month
- `Fractions` — Clarity / Low
- `Ratios` — Clarity / High Maintenance
- `Algebra` — Structured Execution / Medium
- `Geometry` — Controlled Discomfort / High
- `Time` — Time Pressure Stability / Low

### Session flow

Week 1 / Sessions 1-2
1. `Fractions` diagnosis drill, Clarity / Low, score 38, behavior summary `breakdown under pressure`, nextMove `Run Clarity drill`
2. `Ratios` training drill, Clarity / High Maintenance, score 91, behavior summary `stable execution`, nextMove `Run Clarify High Maintenance drill`

Week 2 / Sessions 3-4
3. `Algebra` training drill, Structured Execution / Medium, score 65, behavior summary `mixed response`, nextMove `Run Structured Execution drill`
4. `Geometry` training drill, Controlled Discomfort / High, score 82, behavior summary `stable execution`, nextMove `Run Controlled Discomfort High Maintenance drill`

Weeks 3-4 / Sessions 5-8
5. `Time` training drill, Time Pressure Stability / Low, score 45, behavior summary `breakdown under pressure`, nextMove `Run Time Pressure Stability drill`
6. `Fractions` training drill, Clarity / Medium, score 73, behavior summary `stable execution`, nextMove `Run Clarity drill`
7. `Ratios` training drill, Clarity / High Maintenance, score 88, behavior summary `stable execution`, nextMove `Run Structured Execution drill`
8. `Algebra` training drill, Structured Execution / High, score 86, behavior summary `stable execution`, nextMove `Run Structured Execution High Maintenance drill`

### Parent dashboard state at end of month

- `Fractions` — Clarity / Medium
  - Status: "Your child is beginning to understand this topic more clearly."
  - Meaning: "They can follow explanations, but still need reinforcement to apply it independently."
  - Focus: "We are increasing practice and helping them apply the method more consistently."

- `Ratios` — Clarity / High Maintenance
  - Status: "Your child has sustained strong clarity in this topic."
  - Meaning: "They have held high performance consistently and are ready for progression decisions."
  - Focus: "We are now transitioning into Structured Execution training."

- `Algebra` — Structured Execution / High
  - Status: "Your child can now solve problems consistently in this topic."
  - Meaning: "They are able to follow the correct steps independently with minimal support."
  - Focus: "We are introducing more challenging questions to strengthen their response under difficulty."

- `Geometry` — Controlled Discomfort / High
  - Status: "Your child is handling difficult problems well."
  - Meaning: "They are able to stay structured and solve unfamiliar questions with stability."
  - Focus: "We are preparing them to perform under time pressure."

- `Time` — Time Pressure Stability / Low
  - Status: "Your child is learning to stay structured under time pressure."
  - Meaning: "They can solve problems, but may lose structure when working against the clock."
  - Focus: "We are helping them maintain their method while working within time limits."

### Weekly report 1 (sessions 1-2)

- `Main Topics Covered`: `This week focused on: Fractions, Ratios.`
- `What Improved This Week`: `No level change this week. The student remained at the same conditioning level in current topics.`
- `Student Response Pattern This Week`: `During this week, the student typically had: breakdown under pressure. Performance remained stable with no level change.`
- `Main Misunderstanding This Week`: `The main challenge this week was breakdown under pressure.`
- `Main Correction That Helped`: `The student remained in Clarity (Low) for Fractions. The student remained in Clarity (High Maintenance) for Ratios. Volatility: 0 upshifts, 0 downshifts, 0 held sessions.`
- `Boss Battle Summary This Week`:
  - `Fractions`
    - `Started: Clarity (Low)`
    - `Current: Clarity (Low)`

  - `Ratios`
    - `Started: Clarity (High Maintenance)`
    - `Current: Clarity (High Maintenance)`
- `Next Focus`: `Next week will focus on: Running Clarity drill and Running Clarify High Maintenance drill.`

**Weakness / awkward point**
- The second action phrase is impossible because it should be `Run Clarity High Maintenance drill` but the engine is using raw action text. This will likely need normalization for parent copy.

### Weekly report 2 (sessions 3-4)

- `Main Topics Covered`: `This week focused on: Algebra, Geometry.`
- `What Improved This Week`: `No level change this week. The student remained at the same conditioning level in current topics.`
- `Student Response Pattern This Week`: `During this week, the student typically had: mixed response. Performance remained stable with no level change.`
- `Main Misunderstanding This Week`: `No recurring breakdown signal was detected this week.`
- `Main Correction That Helped`: `The student remained in Structured Execution (Medium) for Algebra. The student remained in Controlled Discomfort (High) for Geometry. Volatility: 0 upshifts, 0 downshifts, 0 held sessions.`
- `Boss Battle Summary This Week`:
  - `Algebra`
    - `Started: Structured Execution (Medium)`
    - `Current: Structured Execution (Medium)`

  - `Geometry`
    - `Started: Controlled Discomfort (High)`
    - `Current: Controlled Discomfort (High)`
- `Next Focus`: `Next week will focus on: Running Structured Execution drill and Running Controlled Discomfort High Maintenance drill.`

**Weakness / awkward point**
- `Next Focus` again contains a raw action string that is not parent-oriented.
- The weekly report omits `Time` entirely, creating the risk that parents think it is not being addressed.

### Monthly report (sessions 1-8)

- `mainAreasCoveredThisMonth`: `This month focused on: Fractions, Ratios, Algebra, Geometry, Time.`
- `What Became Stronger`: `This month was mixed: improved in 2 topics (Fractions, Algebra), regressed in 1, and held in 2. Average session score this month: 68/100.`
- `Response Trend`: `Across the month, the student showed mixed responses (stable execution and breakdown under pressure), but the overall trend improved in Fractions and Algebra.`
- `Recurring Challenge`: `The main recurring challenge this month was breakdown under pressure.`
- `System Outcome`: `The student moved from Clarity (Low) to Clarity (Medium) in Fractions. The student moved from Structured Execution (Medium) to Structured Execution (High) in Algebra. The student regressed from Time Pressure Stability (Low) to Time Pressure Stability (Low). Volatility: 2 upshifts, 1 downshift, 3 held sessions.`
- `Topic Progression` (raw lines):
  - `Fractions`
    - `Start: Clarity (Low)`
    - `End: Clarity (Medium)`

  - `Ratios`
    - `Start: Clarity (High Maintenance)`
    - `End: Clarity (High Maintenance)`

  - `Algebra`
    - `Start: Structured Execution (Medium)`
    - `End: Structured Execution (High)`

  - `Geometry`
    - `Start: Controlled Discomfort (High)`
    - `End: Controlled Discomfort (High)`

  - `Time`
    - `Start: Time Pressure Stability (Low)`
    - `End: Time Pressure Stability (Low)`
- `Next Month Focus`: `Next month will focus on: Maintaining with mixed practice in Fractions, Maintaining with mixed practice in Ratios, rebuilding stability in Time, Maintaining with mixed practice in Algebra, and Maintaining with mixed practice in Geometry.`

**Weakness / awkward point**
- `Next Month Focus` becomes overly long and repetitive with 5 topics. It is likely to feel cluttered and unfocused.
- `Topic Progression` raw text is functional but may read as a dense state dump rather than a human narrative.
- The monthly summary does not distinguish the sustained hold of `Ratios` and `Geometry` from the active regression of `Time`, except by raw line order.

---

## Cross-scenario observations and weak points

1. `Main Topics Covered` only reflects the topics present in the 2 selected drill submissions for that week. If a topic is not drilled during the 2-session window, it will not appear in that weekly report. This can cause the parent to feel the weekly report is incomplete.

2. `Next Focus` is generated from raw drill next-action text. When multiple topics share the same action, the text can repeat. When the action label itself is not parent-friendly, the report output becomes awkward.

3. `Boss Battle Summary` / `Topic Progression` is raw state text (`Started: Phase (Stability)`, `Current: Phase (Stability)`). It is accurate, but this line-oriented format is likely too technical for many parents.

4. Mixed trend weeks produce correct engine text, but the phrasing can feel mechanical. Examples:
   - `This week was mixed: improved in X, with regression in Y.`
   - `Across the month, the student showed mixed responses (stable execution and breakdown under pressure), but the overall trend improved in X.`

5. The monthly `Next Month Focus` is especially brittle in larger topic sets. It directly concatenates topic-level phrases and can become a long list of mostly identical starting clauses.

6. Stable topics that are not part of the current 2-session weekly chunk are not represented, even though the parent would expect a continuity summary.

7. The parent dashboard state copy itself is clean and consistent, but it is independent of the report text. If the report summary says `mixed` while the parent dashboard shows several stable topic states, the two may feel slightly mismatched.

---

## Recommendation

For the auto-report loop to be human-ready, these three adjustments are the highest priority:

1. Normalize `nextFocus` text into a parent-friendly action phrase, collapsing duplicates and removing raw drill labels.
2. Render `Boss Battle Summary` / `Topic Progression` into simpler parent prose when more than 2 topics are present.
3. Add an explicit note when a topic was not included in that week’s report because it did not receive a drill submission during the 2-session chunk.
