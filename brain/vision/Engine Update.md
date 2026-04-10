Engine Update

Training sessions score drill totals, not session totals
instead of having one drill per session for each topic, we have a training session and inside it the tutor runs drills on topics.
drill types auto based on student phase x stability state currently - tutor doesn't choose what drill to run

they open the map, see where the student is in each topic, when its time for session = opens training session, sees topic + drill to run, runs it, submits observations, ends session or drill another topic (up to them depending on time and situation), session ends, totals out of /100 captured on each drill ran on each topic, and updates state for each topic according to drill total result, then session logs show how long session went, topics covered, outcome and state update on each topic covered.


Note:

Map tab updates normally as now. Only change is training sessions work


UPDATED REPORT GENERATION SYSTEM (FINAL)
Core shift
Before:

Session → Summary → Reports

Now:

Drill (per topic) → State update → Reports

Session is just:

time
grouping
context

The truth lives at drill level per topic.

DATA MODEL (CRITICAL)
Training Session
session_id
duration
topics_touched[]
Drill (CORE UNIT)

For each topic inside session:

topic
phase_before
stability_before
drill_type (auto from phase × stability)
observations[]
drill_score (/100)
stability_after
transition (regress / remain / advance)
next_action
GENERATION PRINCIPLE (UPDATED)

All outputs must be generated from:

👉 Drill-level state changes per topic

NOT session summaries.

1. SESSION SUMMARY/LOGS (UPDATED)
Purpose

Summarize what happened across drills inside the session

INPUT

All drills inside session:

For each topic:

phase_before → stability_before
drill_score
stability_after
transition
next_action
dominant observation pattern
OUTPUT STRUCTURE (UNCHANGED — JUST SOURCE CHANGED)
1. Session Scope

This session covered:
[Topic 1, Topic 2, Topic 3]

2. What Was Trained

(auto from drill types per topic)

Drills were run to train:

[behavior per topic]

Examples:

Fractions → step-by-step execution
Algebra → clarity of method
3. What Happened (Behavior Summary)

Aggregate across drills:

During the session, the student:

[pattern 1]
[pattern 2]
4. Performance Result (Per Topic)

For each topic:

[Topic]
Score: [X/100]
Stability: [before → after]

5. State Movement

The system:

[improved stability in X]
[maintained state in Y]
[regressed in Z]
6. What This Means

This means the student is:

[state interpretation per topic]
7. Next Move

Next session will focus on:
[next actions per topic]

2. WEEKLY REPORT (UPDATED — TOPIC-CENTERED)
Purpose

Show topic conditioning progress across drills over the week

NOT session summaries.

INPUT

All drills for the week, grouped by topic.

For each topic:

sequence of drill_scores
stability transitions
phase changes
observation patterns
OUTPUT STRUCTURE (LOCKED)
1. Topics Conditioned

This week focused on:
[topics]

2. Conditioning Progress (CORE)

For each topic:

[Topic]
Start of week: [Phase + Stability]
End of week: [Phase + Stability]

(Data comes from first drill vs last drill of week)

3. What Improved

Detect:

stability increases
score trend upward
reduction in weak observations

The student is becoming more consistent in:

[behavior per topic]
4. Response Pattern

Aggregate dominant behavior across drills:

During this week, the student typically:

[pattern 1]
[pattern 2]
per topic
5. Main Breakdown

From repeated weak observations across drills:

The main challenge this week was:
[dominant breakdown pattern]

6. System Movement

From drill transitions:

Across drills, the system:

[reinforced phase]
[improved stability]
[introduced next phase where applicable]
7. Next Focus

From latest drill state:

Next week will focus on:
[Next Action Engine outputs per topic]

3. MONTHLY REPORT (UPDATED — TOPIC-CENTERED)
Purpose

Show topic progression across time using drill-driven state changes

INPUT

Weekly aggregated topic states (built from drills).

For each topic:

week-by-week phase
week-by-week stability
score trends
repeated breakdowns
OUTPUT STRUCTURE (LOCKED)
1. Topics Conditioned

This month focused on:
[topics]

2. Topic Progression (CORE)

For each topic:

[Topic]
Start of month: [Phase + Stability]
End of month: [Phase + Stability]

3. What Became Stronger

From stability + phase progression:

The student has improved in:

[behavior per topic]
4. Response Trend 

Compare early drills vs late drills:

At the start of the month:
[pattern]

By the end of the month:
[pattern]

[response trend per topic]

5. Recurring Challenge

From repeated weak observations:

The main recurring challenge was:
[pattern]

[recurring pattern per topic]
6. System Outcome

From transitions:

Over the month, the system:

[advanced topics]
[improved stability]
[reinforced weak areas]
7. Current State Snapshot

From latest drill per topic:

Current conditioning state:

[Topic - Phase (Stability)]
8. Next Month Focus

From latest Next Action Engine outputs:

Next month will focus on:
[next actions per topic]

CRITICAL LOGIC (UPDATED)
1. State Source of Truth

State is updated per drill, not per session.

2. Weekly Aggregation

For each topic:

start = first drill of week
end = last drill of week
3. Monthly Aggregation

For each topic:

start = first drill of month
end = last drill of month
4. Pattern Detection

Across drills:

count weak vs partial vs clear
detect dominant behavior
5. Improvement Detection

Triggered when:

stability increases
score trend increases
weak signals decrease
6. Regression Detection

Triggered when:

stability drops
score drops below threshold
WHAT YOU JUST FIXED

This line is everything:

“Training sessions score drill totals, not session totals”

That removes noise.

Now:

sessions don’t distort data
tutors can run multiple topics
system remains precise
FINAL SYSTEM FLOW (UPDATED)
During session:

Topic → Drill → Observations → Score → State Update

After session:

System stores:

drill outputs per topic
Weekly:

System aggregates drills → topic state progression

Monthly:

System aggregates weekly → topic progression over time

FINAL DEV LINE

Reports must be generated from drill-level state transitions per topic, not from session summaries. Sessions are containers; drills are the source of truth. Weekly and monthly reports must aggregate topic progression using drill scores, stability transitions, and observation patterns

TT Drift Correction Spec

Implement TT as a drill-driven topic-state system where each drill updates phase/stability deterministically, High Maintenance acts as the required gate before phase progression, phase progression always enters the next phase at Low, reports remain topic-centered, and parent UI translates internal state into fixed meaning without leaking engine language.

1. Locked Transition Engine Update
Inputs
previous_phase
previous_stability
drill_total_out_of_100
Outputs
next_phase
next_stability
transition_reason
Stability ladder
Low = unstable
Medium = bridge
High = stable
High Maintenance = repeated confirmation
Phase Progress = permission to enter next phase
Transition rules
From Low
0–49 → Low
50–79 → Medium
80–100 → High
From Medium
0–44 → Low
45–79 → Medium
80–100 → High
From High
0–49 → Medium
50–84 → High
85–100 → High Maintenance
From High Maintenance
0–59 → High
60–84 → High Maintenance
85–100 → Phase Progress
Hard rule

Phase progress is only legal when:

previous_stability = High Maintenance
current drill_total_out_of_100 >= 85
Hard rule

High can become High Maintenance.
High cannot phase progress directly.

New hard rule

When phase progression happens:

next_phase = next phase
next_stability = Low

This must be hard-coded.

Example

If:

previous_phase = Clarity
previous_stability = High Maintenance
drill_total = 91

Then:

next_phase = Structured Execution
next_stability = Low
transition_reason = Phase Progress
2. Source of Truth Rule
Lock this

Sessions are containers.
Drills are the source of truth.

State updates must happen per drill, not per session.

Reports must aggregate from:

drill totals
drill observation patterns
drill transitions
topic state changes

Not from session summaries.

This matches the drill engine and transition spine in the library.

3. Observation Language Rule
Drift to remove

Loose summary labels such as:

stable execution
mixed response
breakdown under pressure

must not be used as raw system truth unless they are explicitly mapped outputs.

Correct rule

All report behavior language must be mapped from the observation engine.

The observation system already uses fixed rep-level fields by phase, such as start behavior, step execution, dependence, rescue behavior, pace, completion integrity, and structure retention.

Required implementation

Create a deterministic mapping layer:

Example

If dominant Execution weak signals are:

delayed start
skips steps
waits for help

Then generated weekly behavior summary might be:

delayed starting
inconsistent step discipline
dependence on help

Do not allow generic free phrases not tied to source observations.

LOCKED REPORT STRUCTURE (FINAL — DO NOT CHANGE)
SESSION SUMMARY
Topic + Focus
What Was Trained
What Happened (Behavior Summary)
Performance Result
State Movement
What This Means
Next Move
WEEKLY REPORT
Topics Worked On
Conditioning Progress
What Improved
Response Pattern
Main Breakdown
System Movement
Next Focus
MONTHLY REPORT
Topics Conditioned
Topic Progression
What Became Stronger
Response Trend
Recurring Challenge
System Outcome
Current State Snapshot
Next Month Focus
NOW — DEV SPEC (CLEAN, NO DRIFT)
1. GENERATION SOURCE (NON-NEGOTIABLE)

All report sections must generate from:

drill-level data
topic state transitions
observation patterns (mapped)
next action engine

NOT:

tutor writing
session summaries
loose interpretation
2. SECTION-LEVEL GENERATION RULES
SESSION SUMMARY
1. Topic + Focus

From:

topics touched in session
drill targets
2. What Was Trained

From:

drill type per topic
phase
3. What Happened (Behavior Summary)

From:

dominant mapped observation patterns across drills

❌ No generic labels
✅ Must be mapped from observation engine

4. Performance Result

From:

drill_score
stability_before → stability_after

Per topic.

5. State Movement

From:

transition output

Values:

remained
improved
regressed
phase progressed
6. What This Means

From:

phase + stability interpretation

Mapped meaning only.

7. Next Move

From:

next_action_engine output
WEEKLY REPORT
TOPIC-CENTERED — NOT SESSION-CENTERED
1. Topics Worked On

Unique topics with drills that week.

2. Conditioning Progress

For each topic:

first drill state of week
last drill state of week
3. What Improved

From:

stability increases
upward score trends
reduced weak signals
4. Response Pattern

From:

dominant observation patterns across drills
5. Main Breakdown

From:

most frequent weak observation signal
6. System Movement

From:

transitions across drills

Values:

reinforced phase
improved stability
introduced next phase
7. Next Focus

From:

latest next_action per topic
MONTHLY REPORT
TOPIC-CENTERED — AGGREGATED FROM DRILLS
1. Topics Conditioned

All topics trained during month.

2. Topic Progression

For each topic:

first drill state of month
last drill state of month
3. What Became Stronger

From:

phase movement
stability increases
4. Response Trend

From:

early drill patterns vs late drill patterns
5. Recurring Challenge

From:

repeated weak observation signals
6. System Outcome

From:

total transitions across month

Values:

advanced
improved
held
regressed
7. Current State Snapshot

From:

latest drill per topic
8. Next Month Focus

From:

next_action_engine outputs per topic
CRITICAL ENGINE RULES (RE-LOCKED)
1. DRILL IS THE ONLY SOURCE OF TRUTH
state updates happen per drill
reports aggregate drills
2. NO SESSION-BASED PERFORMANCE LANGUAGE

❌ REMOVE:

average session score
held sessions
session-based volatility

✅ USE:

drill score
topic progression
state transitions
3. OBSERVATION LANGUAGE MUST BE MAPPED

Dev must implement:

observation → label mapping

Example:

INPUT:

delayed start
skips steps
asks for help early

OUTPUT:

delayed starts
inconsistent step execution
early dependence

NO freestyle wording.

4. TRANSITION ENGINE (FINAL LOCK)
High → High Maintenance (85+)
High Maintenance → Phase Progress (85+)
Phase Progress → next phase enters at LOW

NO exceptions.

5. PARENT UI TRANSLATION

Internal:

High Maintenance

Parent sees:

“consistent”
“sustained”
“reliable”

Never expose:

“High Maintenance”
“phase progress”

Parent UI must translate it.

Parents should never see:

High Maintenance
phase progress
transition decision language
Add translated parent meanings for High Maintenance states
Clarity + High Maintenance

Status
Your child has held strong understanding in this topic consistently.

Meaning
They are showing reliable clarity across repeated training.

Focus
We are preparing to move this topic into independent execution.

Structured Execution + High Maintenance

Status
Your child is now applying the steps reliably in this topic.

Meaning
They have shown consistent execution across repeated training.

Focus
We are preparing to introduce more difficulty in this topic.

Controlled Discomfort + High Maintenance

Status
Your child is handling difficult questions with strong stability.

Meaning
They are showing reliable control when problems become less familiar.

Focus
We are preparing to introduce time pressure.

Time Pressure Stability + High Maintenance

Status
Your child has sustained strong performance under time pressure.

Meaning
They are showing repeated control and structure under timed conditions.

Focus
We are preparing to maintain this pattern and transfer it into new topics.

6. Reporting Metadata Rule
Allowed metadata

Reports may include:

sessions completed this week
total sessions this month
drill count per topic
week range
month range
Not allowed as core reporting logic

Do not anchor performance language to:

average session score
held sessions
session-based volatility
Correct

If numeric rollups are used, they must be:

drill averages
topic-level drill counts
topic-level upshifts / downshifts / holds

Not session-centric summaries.

7. Drift Corrections from Tested Scenarios
Global drifts detected
Drift A

Using average session score in monthly reports.

Fix
Replace with:

average drill score by topic
or
topic progression summary only
Drift B

Using “held sessions” language.

Fix
Replace with:

held topic states
or
topics with no state change
Drift C

Using “Main Correction That Helped” to describe transitions.

Fix
That field must describe intervention, not state movement.

Drift D

Using Boss Battle Summary as a topic state table.

Fix
Move start/end state tables into Conditioning Progress or Topic Progression.

Drift E

Using internal state names in parent dashboard.

Fix
Translate all internal engine states into fixed parent-facing meaning blocks.

Drift F

Allowing impossible transitions.

Fix
Hard-code:

High → can only become High Maintenance
High Maintenance + 85+ → phase progress
phase progress enters next phase at Low
8. Specific Logic Errors to Correct
Error pattern 1

If previous_stability = High and score >= 85:
Current implementation sometimes keeps:

stability_after = High
transition = remain/advance vaguely

Correct behavior

stability_after = High Maintenance
transition_reason = stability advance
Error pattern 2

If previous_stability = High Maintenance and score >= 85:
Current implementation sometimes keeps:

same phase
same stability
says “transitioning soon”

Correct behavior

next_phase = next phase
next_stability = Low
transition_reason = phase progress
Error pattern 3

If previous_stability = Medium and score 80+:
Current implementation sometimes leaves Medium.

Correct behavior

next_stability = High
Error pattern 4

If previous_stability = Medium and score is inside hold band:
Current implementation sometimes marks advance.

Correct behavior

remain Medium
Error pattern 5

If start state and end state are identical:
Current implementation sometimes says regression.

Correct behavior

no regression
remain
9. Implementation Rules for Weekly and Monthly Reports
Weekly reports

Must be generated from:

first drill state per topic that week
last drill state per topic that week
drill observation patterns for that topic
drill transitions for that topic
latest next action for that topic

Weekly reports must be topic-centered.

Monthly reports

Must be generated from:

first drill state per topic that month
last drill state per topic that month
drill sequence trend by topic
recurring mapped breakdown signals by topic
current next action by topic

Monthly reports must be topic-centered.

required dev actions:

Parent UI must translate it.

Parents should never see:

High Maintenance
phase progress
transition decision language
Add translated parent meanings for High Maintenance states
Clarity + High Maintenance

Status
Your child has held strong understanding in this topic consistently.

Meaning
They are showing reliable clarity across repeated training.

Focus
We are preparing to move this topic into independent execution.

Structured Execution + High Maintenance

Status
Your child is now applying the steps reliably in this topic.

Meaning
They have shown consistent execution across repeated training.

Focus
We are preparing to introduce more difficulty in this topic.

Controlled Discomfort + High Maintenance

Status
Your child is handling difficult questions with strong stability.

Meaning
They are showing reliable control when problems become less familiar.

Focus
We are preparing to introduce time pressure.

Time Pressure Stability + High Maintenance

Status
Your child has sustained strong performance under time pressure.

Meaning
They are showing repeated control and structure under timed conditions.

Focus
We are preparing to maintain this pattern and transfer it into new topics.

6. Reporting Metadata Rule
Allowed metadata

Reports may include:

sessions completed this week
total sessions this month
drill count per topic
week range
month range
Not allowed as core reporting logic

Do not anchor performance language to:

average session score
held sessions
session-based volatility
Correct

If numeric rollups are used, they must be:

drill averages
topic-level drill counts
topic-level upshifts / downshifts / holds

Not session-centric summaries.

7. Drift Corrections from Tested Scenarios
Global drifts detected
Drift A

Using average session score in monthly reports.

Fix
Replace with:

average drill score by topic
or
topic progression summary only
Drift B

Using “held sessions” language.

Fix
Replace with:

held topic states
or
topics with no state change
Drift C

Using “Main Correction That Helped” to describe transitions.

Fix
That field must describe intervention, not state movement.

Drift D

Using Boss Battle Summary as a topic state table.

Fix
Move start/end state tables into Conditioning Progress or Topic Progression.

Drift E

Using internal state names in parent dashboard.

Fix
Translate all internal engine states into fixed parent-facing meaning blocks.

Drift F

Allowing impossible transitions.

Fix
Hard-code:

High → can only become High Maintenance
High Maintenance + 85+ → phase progress
phase progress enters next phase at Low
8. Specific Logic Errors to Correct
Error pattern 1

If previous_stability = High and score >= 85:
Current implementation sometimes keeps:

stability_after = High
transition = remain/advance vaguely

Correct behavior

stability_after = High Maintenance
transition_reason = stability advance
Error pattern 2

If previous_stability = High Maintenance and score >= 85:
Current implementation sometimes keeps:

same phase
same stability
says “transitioning soon”

Correct behavior

next_phase = next phase
next_stability = Low
transition_reason = phase progress
Error pattern 3

If previous_stability = Medium and score 80+:
Current implementation sometimes leaves Medium.

Correct behavior

next_stability = High
Error pattern 4

If previous_stability = Medium and score is inside hold band:
Current implementation sometimes marks advance.

Correct behavior

remain Medium
Error pattern 5

If start state and end state are identical:
Current implementation sometimes says regression.

Correct behavior

no regression
remain
9. Implementation Rules for Weekly and Monthly Reports
Weekly reports

Must be generated from:

first drill state per topic that week
last drill state per topic that week
drill observation patterns for that topic
drill transitions for that topic
latest next action for that topic

Weekly reports must be topic-centered.

Monthly reports

Must be generated from:

first drill state per topic that month
last drill state per topic that month
drill sequence trend by topic
recurring mapped breakdown signals by topic
current next action by topic

Monthly reports must be topic-centered.

Final implementation sentence

Implement TT as a drill-driven topic-state system where each drill updates phase/stability deterministically, High Maintenance acts as the required gate before phase progression, phase progression always enters the next phase at Low, reports remain topic-centered, and parent UI translates internal state into fixed meaning without leaking engine language.



CRITICAL ENGINE RULES (RE-LOCKED)
1. DRILL IS THE ONLY SOURCE OF TRUTH
state updates happen per drill
reports aggregate drills
2. NO SESSION-BASED PERFORMANCE LANGUAGE

❌ REMOVE:

average session score
held sessions
session-based volatility

✅ USE:

drill score
topic progression
state transitions
3. OBSERVATION LANGUAGE MUST BE MAPPED

Dev must implement:

observation → label mapping

Example:

INPUT:

delayed start
skips steps
asks for help early

OUTPUT:

delayed starts
inconsistent step execution
early dependence

NO freestyle wording.

4. TRANSITION ENGINE (FINAL LOCK)
High → High Maintenance (85+)
High Maintenance → Phase Progress (85+)
Phase Progress → next phase enters at LOW

NO exceptions.

5. PARENT UI TRANSLATION

Internal:

High Maintenance

Parent sees:

“consistent”
“sustained”
“reliable”

Never expose:

“High Maintenance”
“phase progress”
DRIFT THAT IS NOW REMOVED

You explicitly remve:

Boss Battle Summary ❌
Main Correction That Helped ❌
Volatility language ❌
Session-based metrics ❌

Summary of Changes by Category
Category	Files
Transition Logic	topicConditioningEngine.ts, routes.ts
Observation Mapping	topicConditioningEngine.ts, routes.ts
Parent UI Translation	topicConditioningEngine.ts, routes.ts
Report Generation	routes.ts
Multi-Topic Sessions	StudentTopicConditioningDialog.tsx, IntroSessionDrillRunner.tsx