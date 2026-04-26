TT Drill System -Developer Brief

We are building a response-conditioning system, not a tutoring session tracker.

The app must understand and control drills.

A drill is the smallest controlled training unit in the system.

Each drill has:

a fixed purpose
a fixed set structure
fixed reps
fixed observation blocks
fixed scoring logic
fixed state update rules

The tutor does not design the drill.
The tutor only:

sees which drill to run
prepares matching problems
runs the drill
taps observations
submits

The system does the rest.

1. What the app must know about a drill

Each drill should exist as a real system object.

Each drill must store:

Core Identity
drill_id
drill_name
drill_type
phase
stability_band
purpose
Structure
total_sets
total_reps
set_order
reps_per_set
rep_type_per_set
difficulty_type_per_set
Tutor Instructions
what kind of problems to prepare
what not to do
what the session target is
which observations matter
Observation Logic
which observation block belongs to each set
which fields are required
how each field scores
Scoring Logic
set score rules
weighted final drill score
assignment modifier if applicable
stability update logic
progression / regression rules
Output Logic
next action
state explanation
parent-facing meaning
whether topic remains / advances / regresses
2. Current drills we already have defined
A. Intro Session -Clarity Diagnostic Drill

Purpose:
Determine where the student stands in a topic before activation.

Structure:

Set 1: Recognition Probe -3 reps
Set 2: Light Apply Probe -3 reps

Total:

6 reps

Output:

topic phase
topic stability
breakdown summary
training proposal input

This drill is for diagnosis only, not active training.

B. Active Training -Clarity Session Drill

Purpose:
Build clarity in a topic through full 3-Layer Lens exposure, recognition, and light application.

Structure:

Set 1: Modeling Set -2 reps
Set 2: Identification Set -4 reps
Set 3: Light Apply Set -3 reps

Total:

9 reps

This is the first fully controlled phase drill.

3. What the app must know about sets

Each drill contains sets.

A set is not just a section on screen.
It is a training block with a fixed role.

Each set should store:

set_id
drill_id
set_name
purpose
rep_count
rep_type
tutor_mode
observation_block_id
scoring_rule_id
Example for Clarity Session Drill
Set 1 -Modeling Set
purpose: build mental map
rep_count: 2
rep_type: modeled problem
tutor_mode: full 3-layer modeling
Set 2 -Identification Set
purpose: test if student can see without solving
rep_count: 4
rep_type: recognition only
tutor_mode: student identifies, does not fully solve
Set 3 -Light Apply Set
purpose: test whether clarity holds during solving
rep_count: 3
rep_type: light application
tutor_mode: minimal guidance
4. What the app must know about reps

Reps are the actual attempts inside each set.

The system does not need to know the actual math content.
The tutor prepares that.

But the system must know:

rep number
rep role
rep difficulty type
whether it is model / identify / apply / boss battle / timed
which observation fields belong to that rep

So for the Clarity Session Drill:

Set 1 reps

Rep 1 = modeled problem
Rep 2 = modeled problem

Set 2 reps

Rep 1–4 = identification problems

Set 3 reps

Rep 1–3 = light apply problems

The app must walk the tutor through these rep by rep.

5. Session UI behavior

The session UI should no longer behave like a blank tutoring session.

It should behave like a drill runner.

Before session starts, tutor sees:
active topic
current phase
current stability
drill to run
session target
work type needed
total sets
total reps
Example:

Topic: Algebra
Phase: Clarity
Stability: Medium
Drill: Clarity Session Drill
Target: Student repeats the modeled process independently on similar problems with reduced prompting.
Prepare:

2 modeled examples
4 recognition problems
3 light apply problems

That should be fixed.

6. How session UI should run live

The tutor should be guided set by set.

Screen structure

At minimum, the session UI should show:

topic
phase
stability
drill name
current set
current rep
progress through drill
Example:

Set 2 of 3
Rep 3 of 4
Identification Set

Then the app should show:

what tutor must do now
what kind of problem this rep is
what to observe after rep

After each rep, tutor taps observation fields.

Then:

next rep
next rep
next set

No open notes required.

7. Observation block system

Observation blocks should be tied to set type, not to generic session notes.

Each set has its own observation block.

Example: Modeling Set observation block
vocabulary recognition
method awareness
reason awareness
engagement
Example: Identification Set observation block
type recognition
step recall
reason recall
response behavior
Example: Light Apply Set observation block
start behavior
step execution
vocabulary usage
reason usage

The tutor only sees the observation block that belongs to the active set.

This is critical.

8. Scoring logic

Scoring should happen in layers.

Layer 1 -Set score

Each set produces its own score.

Layer 2 -Drill score

The system combines set scores using fixed weighting.

For Clarity Session Drill:

Set 1 score = Exposure
Set 2 score = Recognition
Set 3 score = Application

Weighted into final drill score.

Layer 3 -State update

The final drill score updates:

current stability
remain / advance / regress
next action

The tutor should not score anything manually.

9. What happens after session submission

After the tutor completes all sets and submits observations, the app should automatically:

calculate set scores
calculate drill score
update topic stability
decide if topic remains in current phase or moves
generate session summary
generate next action
update Maps

This has to be automatic.

10. What the Map should display

The Map is not for logging. It is for clarity.

For each active topic, it should show:

topic name
current phase
current stability
current drill
next action
constraints
transition status
Example:

Fractions
Phase: Clarity
Stability: Medium
Current Drill: Clarity Session Drill
Next Action: Continue 3-Layer Lens, increase apply volume
Constraint: No time pressure
Transition Status: Building

That way the tutor always knows what system state they are in.

11. Topic activation flow

After intro session:

tutor completes diagnostic drill
system determines recommended topic phase + stability
system generates training proposal
parent accepts
tutor clicks “Activate Topic”

Only after activation does the topic enter:

Topic Management
Map
drill cycle
reports
scoring engine
integrity layer

Activation is the moment the topic becomes live in the OS.


13. What not to build

Do not build:

open-ended session notes as the main system
flexible tutor-designed session flows
free typing everywhere
manual phase selection during active training
generic “progress” trackers without drill logic

That will break TT.

14. What to build next, in order

The immediate next build should be:

Phase 1

Build Clarity Diagnostic Drill

2 sets
6 reps
fixed observation blocks
scoring output for topic activation
Phase 2

Build Clarity Session Drill

3 sets
9 reps
fixed observation blocks
scoring + state update
Phase 3

Build Map sync

phase
stability
next action
current drill
Phase 4

Build session summary + reports from drill outputs

Do not jump to all phases yet.

Lock clarity first.

Final principle

The app must know this:

A session is not a blank event.
A session is the execution of a specific drill attached to a topic-state.

That is the product logic.

Final instruction

Build the app so the tutor experiences this:

“The system tells me what drill to run, what work to prepare, what to observe, and what happens next.”

If the tutor still needs to invent the session, the system is incomplete.