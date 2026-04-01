1. THE CORE SCORING MODEL
A. Rep-level scoring

Each rep has fixed fields.
Each field is scored:

weak = 0
partial = 1
clear = 2

Then convert each field to its weighted contribution for that phase.


B. Set-level scoring

Each set is just an aggregation layer.

For each set:

calculate weighted score for each rep
average rep scores in that set
output Set Score / 100

No tutor decides the set result. The system averages the reps.

C. Session-level scoring



Set 1 × 1
Set 2 × 2
Set 3 × 2

Then normalize back to 0–100.

For diagnosis sessions:

Set 1 × 1
Set 2 × 1

Then normalize to 0–100.



2. THE REAL TRANSITION LOGIC

This is the engine:

Master rule
Advance only when current phase reaches High and the score meets the phase’s forward threshold
Remain when score shows the student still belongs in the same stability band
Regress when current stability drops below the phase’s hold threshold
If stability drops, move one level back and reinforce.

That’s your system law. Not a suggestion.

3. PHASE-SPECIFIC WEIGHTS

These come from the observation system.

Clarity weights
Vocabulary = 30
Method = 30
Reason = 20
Immediate Apply = 20
Execution weights
Start Behavior = 25
Step Execution = 30
Repeatability = 25
Independence = 20
Controlled Discomfort weights
Initial Response = 30
First-Step Control = 25
Discomfort Tolerance = 25
Rescue Dependence = 20
Time Pressure weights
Start Under Time = 20
Structure Under Time = 35
Pace Control = 20
Completion Integrity = 25
4. HOW TO SCORE EACH REP

Use the same formula for every phase:

For each field in the rep:

weak = 0% of that field’s weight
partial = intermediate % of that field’s weight
clear = 100% of that field’s weight

drill library uses 3-level rep scoring, the clean dev implementation is:

weak = 0.00 × weight
partial = 0.60 × weight
clear = 1.00 × weight

That gives enough separation without making “partial” too generous.

So example for an Execution rep:

Start = immediate → 25
Step Execution = partial → 18
Repeatability = stable → 25
Independence = light support → 12

Rep score = 25 + 18 + 25 + 12 = 80/100



5. TRANSITION MATRIX BY PHASE


A. If previous stability = LOW

Question the system is asking:

Is the student still fundamentally unstable here?

Rule:

0–49 → remain Low
50–69 → advance to Medium
70–100 → advance to High only if phase-specific guardrail is passed
Guardrails by phase
Clarity: no category scored 0
Execution: no guessing and no avoidance
Discomfort: no avoid/freeze and first step identified
Time Pressure: structure and pace both controlled

If the guardrail fails, do not jump to High.
Keep them at Medium even if score is 70+.

That’s important.

B. If previous stability = MEDIUM

Question the system is asking:

Is this phase becoming consistent?

Rule:

0–44 → regress to Low
45–74 → remain Medium
75–100 → advance to High


C. If previous stability = HIGH

Question the system is asking:

Is the phase holding reliably enough to move forward?

Rule for Clarity / Execution / Discomfort:

0–49 → regress to Medium
50–79 → remain High
80–100 → advance to next phase

Rule for Time Pressure:

0–49 → regress to Medium
50–79 → remain High
80–100 → remain High and mark transfer-ready if repeated

Important:
Time Pressure does not advance to another core phase.
It shifts into:

maintain
mixed practice
variation
transfer readiness
6. WHAT “REGRESS / REMAIN / ADVANCE” SHOULD MEAN IN THE APP
Regress
stability drops one level inside the same phase
next action becomes reinforcement drill for that phase
phase does not change backward unless you explicitly add cross-phase regression later

Example:

Execution High scores 42
new state = Execution Medium
next session = Execution drill
Remain
same phase
same stability
next action follows that stability’s action block

Example:

Discomfort Medium scores 61
new state = Discomfort Medium
next action = increase Boss Battle frequency, reduce hesitation time, push independent starts
Advance

Two kinds:

1. Stability advance inside same phase

Example:

Clarity Low → Clarity Medium
Execution Medium → Execution High
2. Phase advance

Only when current phase is High and forward threshold is met:

Clarity High + 80–100 → Execution
Execution High + 80–100 → Discomfort
Discomfort High + 80–100 → Time Pressure
Time High + 80–100 repeated → Transfer Ready / Maintain Track
7. HOW THIS APPLIES TO DIAGNOSIS VS TRAINING
Diagnosis drill

Diagnosis should determine:

entry phase
entry stability

It should not phase-advance.

Use it to classify where the student breaks first in the topic. That’s aligned with our topic conditioning doctrine: the first point of failure becomes the entry phase.

So diagnosis result should be:

if symptom-triggered diagnosis confirms the phase, assign:
Phase = diagnosed phase
Stability = Low / Medium / High from diagnosis score

Then the next real session loads the correct training drill for that phase/stability.

Training drill

Training is where:

regress
remain
advance
all happen.

That is the real state update engine.

8. DEV-READY RULESET


Session scoring pipeline
Tutor logs rep observations
System converts observation values to weighted field scores
System sums to rep score / 100
System averages reps into set score / 100
System applies set weighting into final session score / 100
System reads previous stability
System applies phase-specific threshold logic
System outputs:
new stability
remain / regress / advance
next action
constraints
9. FINAL IMPLEMENTATION

This is the sharpest version:

Diagnosis
keep simple
classify only
no regression logic
output: phase + stability
Training
use full weighted 0–100 engine
use previous stability + guardrails
allow regress / remain / advance

That keeps diagnosis clean and training serious.

10. THE CLEAN TABLE
Low
0–49 remain Low
50–69 move to Medium
70–100 move to High only if guardrail passes
Medium
0–44 regress to Low
45–74 remain Medium
75–100 move to High
High
0–49 regress to Medium
50–79 remain High
80–100 advance to next phase
except Time Pressure, which becomes maintain/transfer-ready if repeated

That’s the scoring and transition spine.