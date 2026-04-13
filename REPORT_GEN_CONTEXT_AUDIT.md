# Report Generation Context Audit

This file identifies where report/session-log wording is grammatically correct on its own, but wrong for the actual drill context.

The problem is not the existence of sections like:

- `Behavior Summary`
- `Performance Result`
- `State Update`
- `What This Means`

The problem is that the text inside those sections is often generated without enough context.

That creates outputs like:

- comparative wording on a first entry into a phase
- stability-only wording when the real event was phase progression
- "still needs..." wording when the student has just entered a phase for the first time
- generic monthly/weekly phrases that flatten very different outcomes

## Example of the Problem

After a topic progresses from `Clarity + High Maintenance` into `Structured Execution + Low`, the current output can read like:

- `The student showed clearer concept recall and more reliable step execution during the drill.`
- `Based on performance, stability is now Low (100/100).`
- `phase progressed`
- `Student can begin but still needs consistency without tutor carry.`

Why this is confusing:

- `clearer` implies a comparison baseline that may not exist in the new phase
- `stability is now Low` hides the more important event: phase changed
- `phase progressed` is too abstract
- `still needs` sounds like the student was already in Structured Execution before this session

---

## Main Problems and Fixes

## 1. Comparative behavior language used when there is no real comparison

### Current issue

Behavior labels in the shared engine include phrases like:

- `clearer concept recall`
- `more reliable step execution`
- `more independent execution`
- `more controlled pace`

These are fine only when there is a real earlier baseline being compared against.

### Why it is awkward

If this is:

- the first drill in a new phase
- the first drill ever on that topic
- the first reportable entry into a new state

then comparative wording sounds false or confusing.

### Recommended fix

Use 2 behavior-language modes:

#### Absolute mode

Use when there is no same-context baseline:

- `clear concept recall`
- `reliable step execution`
- `independent execution`
- `controlled pace`

#### Comparative mode

Use only when there is a valid earlier baseline:

- `clearer concept recall`
- `more reliable step execution`
- `more independent execution`
- `more controlled pace`

### Rule

Only use comparative wording when comparing against earlier drill evidence in the same topic context.

---

## 2. Performance Result hides phase progression

### Current issue

The current session log says:

- `Based on performance, stability is now Low (100/100).`

even when the topic progressed into a new phase.

### Why it is awkward

If the topic moved from:

- `Clarity + High Maintenance`

to:

- `Structured Execution + Low`

then the important result is not just `Low`.

The real result is:

- the phase is now `Structured Execution`
- the new phase starts at `Low`

### Recommended fix

Use context-aware templates.

#### If phase did not change

- `Based on performance, stability is now High in Structured Execution (83/100).`

#### If phase progressed

- `Based on performance, phase is now Structured Execution and stability is Low (100/100).`

#### If final-phase maintenance held

- `Based on performance, phase remains Time Pressure Stability at High Maintenance (91/100).`

---

## 3. State Update is too abstract

### Current issue

Current output:

- `phase progressed`
- `improved`
- `regressed`
- `remained`

### Why it is awkward

This is engine language, not human language.

It tells the system decision, but not the actual movement.

### Recommended fix

Make `State Update` explicit.

#### Better templates

- `Phase progressed from Clarity to Structured Execution.`
- `Stability improved from Medium to High within Controlled Discomfort.`
- `State remained at Time Pressure Stability High Maintenance.`
- `Stability regressed from High to Medium within Structured Execution.`

---

## 4. What This Means ignores whether the state is new or ongoing

### Current issue

Current output is pulled from phase meaning tables and often reads like:

- `Student can begin but still needs consistency without tutor carry.`

### Why it is awkward

`still needs` sounds like the topic has already spent time in that phase.

That is wrong if this was:

- first entry into Structured Execution

### Recommended fix

Generate `What This Means` from both:

- resulting state
- transition context

### Meaning modes needed

#### Entry meaning

Use when topic has just entered the phase:

- `Student can begin Structured Execution but needs consistency without tutor carry.`

#### Ongoing meaning

Use when topic remained inside the phase:

- `Student is in Structured Execution and still needs consistency without tutor carry.`

#### Regression meaning

Use when topic dropped:

- `Student showed enough instability that Structured Execution must be reinforced before progressing.`

#### Final maintenance meaning

Use when topic is in final maintenance:

- `Student is sustaining final-phase control and is now in maintenance and transfer territory.`

---

## Weekly Report Problems

## 5. `What Improved` can miss the real event

### Current issue

Weekly summaries currently prefer behavior-shift language, for example:

- `Fractions: less clarity breakdown, more reliable step execution`

### Why it is awkward

If the important event this week was:

- crossing from `Clarity` into `Structured Execution`

then that should be the lead idea.

### Recommended fix

If a topic had phase progress during the week, lead with the phase event first.

#### Better weekly wording

- `Fractions: progressed from Clarity into Structured Execution after holding high clarity consistently.`

Optional second sentence or clause:

- `Observed clear concept recall and reliable step execution at the point of entry.`

---

## 6. `System Movement` is too flattened

### Current issue

Current weekly movement phrases collapse multiple topics into generic labels like:

- `introduced next phase`
- `reinforced phase`

### Why it is awkward

That loses topic-specific meaning.

### Recommended fix

Make movement topic-specific:

- `Fractions: entered Structured Execution`
- `Equations: reinforced Controlled Discomfort`
- `Word Problems: improved stability inside Time Pressure Stability`

---

## 7. Weekly `What This Means` is too generic

### Current issue

Weekly `What This Means` currently reflects only the end state.

### Why it is awkward

It does not distinguish:

- first entry
- hold
- regress
- final maintenance hold

### Recommended fix

Use context-aware meaning:

- first entry into a phase
- held in same phase
- regressed into an earlier state
- sustained final-phase maintenance

---

## Monthly Report Problems

## 8. `What Became Stronger` can undersell real progression

### Current issue

Monthly wording often stays behavior-based even when the month’s main story was progression.

### Why it is awkward

If a topic moved from:

- `Clarity`

to:

- `Structured Execution`

that should be the headline.

### Recommended fix

Use a hierarchy:

1. phase progression
2. stability trend
3. behavior trend

#### Better monthly wording

- `Fractions: moved from Clarity into Structured Execution this month, with stable concept recognition and more consistent first-step execution.`

---

## 9. `Response Trend` fallback is too vague

### Current issue

Current fallback wording like:

- `consistent mapped response pattern`

is system-ish and unclear.

### Recommended fix

Use plain-language trend phrases:

- `more consistent starts and step follow-through`
- `more stable response under challenge`
- `more controlled execution under time`

---

## 10. `System Outcome` is too blunt

### Current issue

Current monthly outcome phrases are too bare:

- `advanced`
- `held`
- `regressed`

### Recommended fix

Expand them:

- `Fractions: advanced into Structured Execution`
- `Algebra: held in Controlled Discomfort while building stability`
- `Speed Drills: remained in final-phase maintenance`

---

## 11. `Next Month Focus` is weak in final maintenance

### Current issue

Current wording can reduce to generic phrases like:

- `Continue training phase-specific behavior`

### Why it is awkward

That is weak if the topic is already in:

- `Time Pressure Stability + High Maintenance`

### Recommended fix

Make focus depend on state:

#### Early or middle phases

- reinforce current phase target

#### Newly entered phase

- stabilize the new phase

#### Final maintenance

- maintain with lower-volume checks
- introduce transfer to new variations/topics

---

## Core Logic Fix Needed

The copy engine needs context flags before it writes text.

## Recommended context flags

- `isPhaseProgress`
- `isFirstEntryToPhase`
- `isSamePhaseStabilityChange`
- `isRegression`
- `isFinalPhaseMaintenance`
- `hasPriorComparableBaseline`

Then the formatter can choose the right wording.

---

## Practical Rule Set

## Behavior Summary

- Use absolute wording if no valid comparison baseline exists
- Use comparative wording only if baseline exists

## Performance Result

- If phase changed: mention phase and stability
- If phase did not change: mention stability within phase
- If final maintenance held: mention phase remained at maintenance

## State Update

- Always describe the actual movement explicitly
- Never use bare engine labels alone

## What This Means

- If first entry: use entry wording
- If hold: use ongoing wording
- If regress: use corrective wording
- If final maintenance: use maintenance/transfer wording

## Weekly / Monthly summaries

- If there was phase progression, lead with that
- Then mention stability or behavior trend
- Do not let behavior language hide the real state movement

---

## Highest Priority Fixes

1. Make `Performance Result` phase-aware.
2. Make `State Update` explicit.
3. Make `What This Means` transition-aware.
4. Split behavior wording into absolute vs comparative.
5. Make weekly/monthly summaries lead with phase entry when that is the real event.

---

## Short version

The reports are not wrong because the sections are wrong.

They are wrong because the wording inside those sections does not know:

- whether this is first entry or ongoing state
- whether the event was progression or just stability change
- whether the wording should be absolute or comparative
- whether the topic is in final maintenance

That is the main thing to fix.
