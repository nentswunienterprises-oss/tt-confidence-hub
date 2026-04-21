# Adaptive Diagnostic Implementation Proposal

## Purpose

This document proposes a more reliable intro diagnosis system for Topic Conditioning.

The direction is:

- use `parent signal`
- generate a `system recommendation`
- require `performance verification`

This means the system does not blindly trust the parent report, and it also does not rely too heavily on tutor judgment. The app should use both as inputs, but let student performance determine the final placement.

## Current System State

The codebase already contains:

- `4 separate diagnostic drill structures`
- one for each phase:
  - `Clarity`
  - `Structured Execution`
  - `Controlled Discomfort`
  - `Time Pressure Stability`

The intro drill runner supports phase-specific diagnosis. The backend also accepts a submitted diagnosis for a specific phase and scores that phase-specific drill.

However, the normal intro launch flow currently does not reliably choose between those 4 diagnostics in a smart way. In practice, the system behaves too much like a single default intro diagnostic instead of a guided placement system.

## What The System Is Missing

The missing layer is not the drill library.

The missing layer is the `decision layer before and during diagnosis`.

Right now the system lacks:

- a reliable way to choose the best starting diagnostic phase
- a reliable way to move `up` if the chosen diagnostic is too easy
- a reliable way to move `down` if the chosen diagnostic is too advanced
- a reliable way to stop diagnosis at the true first point of failure

So the system has phase drills, but not yet a strong placement engine.

## Core Bottleneck

The bottleneck is `launch and verification logic`.

More specifically:

- the app has 4 phase diagnostic drills
- but the intro flow does not yet operate as an adaptive diagnostic system
- it does not verify whether the chosen phase is actually correct

This creates a placement weakness:

- if the student is stronger than the chosen phase, they may be under-placed
- if the student is weaker than the chosen phase, they may be misread
- if the phase choice depends too much on human assumption, placement becomes inconsistent

## Why The Current Pattern Is Not Strong Enough

If parent signal is treated like truth:

- the system becomes vulnerable to inaccurate reporting
- the wrong phase can be launched
- later interpretation gets distorted

If tutor judgment is treated like truth:

- two tutors may place the same student differently
- placement quality depends too much on human intuition
- the product becomes less deterministic

That is not the direction TT should take.

TT should be a system that:

- listens to signals
- makes a recommendation
- verifies with performance
- places based on evidence

## Edge Cases In The Current Model

### 1. Strong student gets placed too low

Example:

- the student is actually ready for `Controlled Discomfort`
- the intro flow starts at `Clarity`
- the student scores strongly
- the system still treats Clarity as the diagnosis result

This wastes time and weakens the meaning of diagnosis.

### 2. Student gets started too high

Example:

- parent report suggests a higher-phase problem
- the student is launched into `Controlled Discomfort`
- the real issue is earlier, in `Structured Execution` or even `Clarity`

Now the student looks unstable in the wrong way because the system started too high.

### 3. Tutor inconsistency

If tutors decide launch phase informally:

- one tutor starts low
- another starts high
- the same student may receive different placement results

That weakens system integrity.

### 4. False confidence inside the wrong phase

A student may appear strong in one phase but still break immediately in the next one.

Example:

- strong in `Structured Execution`
- unstable in `Controlled Discomfort`

If diagnosis stops too early, the real break point is missed.

### 5. Parent signal is partially right but incomplete

The parent may accurately notice symptoms, but describe only the visible outcome, not the underlying layer.

Example:

- parent says the child falls apart under time pressure
- true root issue may be earlier: structure is not stable enough even before timing pressure is added

This is why parent signal is valuable, but cannot be the source of truth by itself.

## Proposed Direction

The target model is:

`Parent Signal -> System Recommendation -> Performance Verification -> Final Placement`

This creates a cleaner diagnostic pipeline.

### Parent Signal

The enrollment form should capture symptoms directly tied to phase behavior.

Examples:

- confusion with terms, methods, and why -> likely `Clarity`
- knows the work but cannot execute alone -> likely `Structured Execution`
- breaks when work becomes unfamiliar or difficult -> likely `Controlled Discomfort`
- loses structure when timed -> likely `Time Pressure Stability`

The parent is not selecting the final phase. The parent is only supplying evidence.

### System Recommendation

The app maps selected symptoms to a recommended starting phase.

This recommendation is useful because it:

- reduces wasted diagnostic time
- prevents always starting at the lowest phase
- gives the tutor a reasoned starting point

But this recommendation is still not final placement.

### Performance Verification

This is the most important layer.

The student runs one adaptive diagnostic flow starting from the recommended phase. The system then decides:

- `go down`
- `place here`
- `go up`

This turns diagnosis into a guided staircase instead of a static guess.

## Important Adjustment To The Diagnostic Model

Adaptive movement during diagnosis should be `set-based`, not `full-drill-based`.

That means:

- diagnosis should not require the student to complete a full multi-set phase drill and only then move
- diagnosis should use a lighter verification structure
- each phase check should total to `/100`
- that score should immediately determine whether to:
  - go down
  - place here
  - go up

This is the correct direction because diagnosis is not training.

Training can use larger multi-set drill structures because training is about:

- exposure
- repetition
- reinforcement
- state change

Diagnosis is different. Diagnosis is only trying to answer:

- where does the student break?
- where should training begin?

So diagnostic friction should be lower than training friction.

## Revised Diagnostic Shape

The system should behave like:

- one guided diagnostic flow
- made up of phase verification sets
- each set produces one phase score out of `100`
- band result determines next move
- diagnosis stops as soon as the true entry point is found

This means the escalation and de-escalation logic belongs to the diagnostic flow itself, not to separate relaunches of whole drills.

In practical terms:

- start at recommended phase
- run that phase's diagnostic set block
- score it out of `100`
- apply band logic
- either move to adjacent phase or stop

That is cleaner than making the tutor repeatedly launch separate diagnostics.

## Practical Verification Logic

At each diagnosed phase, the system asks one question:

`Is this phase too hard, about right, or too easy for the student?`

That determines movement.

### If the score is too low

Interpretation:

- this phase is too advanced
- the student likely breaks earlier

System action:

- de-escalate to the previous phase verification set

Meaning:

- the current phase is not the right starting point
- the system must inspect the earlier layer

### If the score is in the middle band

Interpretation:

- this is the correct break zone
- the student is showing the expected instability for this phase

System action:

- stop diagnosis
- assign this phase as the entry phase
- assign starting stability based on the diagnosis score

Meaning:

- the system found the correct placement

### If the score is too high

Interpretation:

- this phase is too easy
- the student is likely stronger than this layer

System action:

- escalate to the next phase verification set

Meaning:

- the real break point is probably later

## Important Clarification

This is `diagnostic movement`, not `training progression`.

That distinction matters.

During diagnosis:

- the system is not saying the student has earned progression through the TT model
- the system is only verifying the correct entry point

So if the student moves from one diagnostic phase to another during intro, that is not phase advancement in the training sense. It is only placement verification.

## Recommended Diagnostic Band Logic

The exact score bands can be tuned later, but the directional logic should be:

- `Low band` -> go down
- `Middle band` -> place here
- `High band` -> go up

Example working version:

- `0-44` -> too weak for this phase -> de-escalate
- `45-79` -> this phase matches -> place here
- `80-100` -> too strong for this phase -> escalate

This is the current implementation direction for adaptive placement logic.

For now, the working diagnosis bands should be:

- `0-44` -> too weak for this phase -> de-escalate
- `45-79` -> this phase matches -> place here
- `80-100` -> too strong for this phase -> escalate

These bands are appropriate for diagnosis because they make the system decide quickly and keep the intro flow efficient.

## Example Walkthrough

Parent reports:

- child knows the method when guided
- shuts down when the problem is unfamiliar

System recommendation:

- start at `Controlled Discomfort`

### Scenario A: Student scores very low

Interpretation:

- this phase is too advanced

Action:

- move down to `Structured Execution` verification inside the same adaptive diagnosis flow

If the student then lands in the middle band there:

- final placement = `Structured Execution`

### Scenario B: Student scores in the middle band

Interpretation:

- this is the real break point

Action:

- stop diagnosis
- final placement = `Controlled Discomfort`

### Scenario C: Student scores very high

Interpretation:

- this phase is below the real break point

Action:

- move up to `Time Pressure Stability` verification inside the same adaptive diagnosis flow

If the student then lands in the middle band there:

- final placement = `Time Pressure Stability`

## Why This Approach Is Stronger

### More robust

It does not depend on a single assumption.

It combines:

- outside signal from the parent
- structured recommendation from the app
- direct evidence from student performance

### More secure

It prevents low-quality placement decisions caused by:

- inaccurate parent interpretation
- inconsistent tutor intuition
- default launch behavior

This is operational security, not just technical security. It protects the integrity of phase placement.

### More intelligent

It uses the parent report as an input, not as truth.

It uses tutor awareness as support, not as the scoring engine.

It lets the system verify reality through performance.

That is stronger logic than either of these weaker models:

- `parent decides phase`
- `tutor decides phase`
- `system always starts at Clarity`

## Why We Should Not Trust Parent Signal Alone

Parents often see symptoms correctly, but symptoms can belong to more than one layer.

Examples:

- “freezes when timed” may be a true time-pressure issue, or may expose a weaker execution layer
- “does not know what to do” may be a clarity issue, or may reflect panic under discomfort

So parent signal is useful for:

- recommendation
- speed
- context

But not for final placement.

## Why We Should Not Trust Tutor Judgment Alone

Tutors are valuable, but tutor-led phase selection alone makes the system weaker because:

- interpretation can vary tutor to tutor
- some tutors start conservatively, others aggressively
- operational consistency gets lost

The tutor should be a guided operator of the system, not the hidden placement engine.

## Recommended Product Direction

### Short-term fix

Add a starting-phase recommendation and phase-aware launch flow.

This means:

- parent form captures phase-linked symptoms
- system recommends a starting phase
- tutor sees the recommendation before launch
- intro diagnosis begins from that recommended phase

This is the smallest strong fix.

### Medium-term fix

Convert the existing diagnosis logic into one adaptive diagnostic flow made of phase verification set blocks.

This means:

- after scoring one phase block out of `100`, the app decides whether to go up, place, or go down
- diagnosis continues inside the same flow
- tutor does not relaunch separate phase diagnostics

This is likely the best implementation path because it preserves the four phase categories while reducing friction.

### Long-term ideal

Create a single guided intro diagnostic experience powered by lightweight phase verification blocks rather than full training-style drill structures.

This would behave like one flow to the tutor, while internally preserving phase-specific scoring logic.

The tutor experience becomes:

- add topic
- review parent signal
- launch guided diagnosis
- follow the system
- receive final verified placement

## Recommended Implementation Principle

The system should follow this rule:

`Signal informs. Performance verifies. System decides.`

That principle protects the integrity of TT.

It preserves:

- determinism
- consistency
- phase meaning
- drill meaning

It also makes the product more scalable because placement logic becomes part of the system rather than being hidden in human judgment.

## Final Recommendation

We should move toward an `adaptive cross-phase diagnostic` that begins from a `parent-signal-based system recommendation` and ends only after `performance verification` finds the true placement.

This is the strongest direction because:

- it uses parent insight without trusting it blindly
- it reduces dependence on tutor intuition
- it prevents under-placement and over-placement
- it makes diagnosis evidence-based
- it fits TT's deterministic system identity

The implementation direction is not to use training-style full drills as the movement unit during diagnosis.

The implementation direction is to:

- keep the 4 phase categories
- create lighter phase verification blocks for diagnosis
- add recommendation logic before launch
- add set-based escalation/de-escalation inside the same diagnostic flow
- stop at the first verified break point

That gives the team a clear long-term architecture:

`4 phase verification blocks + adaptive guidance = one intelligent diagnostic system`
