# Tutor Handover Verification Design

## Purpose

This document defines how TT should handle student reassignment from one tutor to another after intro diagnosis and active training have already begun.

The core principle is:

`Handover is verification, not re-onboarding.`

That means:

- do not restart the student
- do not rerun intro diagnosis by default
- do not discard previous topic-state history
- do verify that inherited state is still trustworthy before the new tutor continues

## Why This Is Needed

Once a student has:

- completed intro diagnosis
- entered active training
- accumulated topic drill history

the system source of truth is no longer the tutor alone.

The source of truth is now:

- topic history
- phase/stability history
- drill results
- recent trends
- next actions
- constraints
- parent-facing proposal context

If a new tutor is assigned and the system simply restarts intro diagnosis, the product creates false resets and weakens state integrity.

## What We Must Avoid

### 1. Re-intro by default

This is wrong because:

- intro is for initial placement
- reassignment is not initial placement
- the student may already have validated topic-state history

### 2. Blind continuation with no verification

This is also weak because:

- the new tutor may inherit stale or unclear state
- there may have been a gap in training
- previous logging quality may not be strong enough

So the answer is not:

- full restart

and not:

- blind trust

The answer is:

- handover verification

## Core Model

When a tutor is reassigned to an active student, the system should:

1. preserve all prior intro diagnosis and training history
2. mark the student as entering `handover verification`
3. require the new tutor to run short verification checks on inherited active topics
4. decide whether current stored topic-state:
   - holds
   - needs a small adjustment
   - needs targeted re-diagnosis
5. only after verification, allow standard active training to resume

## Handover Verification vs Intro Diagnosis

These are not the same thing.

### Intro diagnosis

Purpose:

- initial placement
- find entry phase
- find entry stability

Used when:

- student first enters topic conditioning

### Handover verification

Purpose:

- validate inherited topic-state
- ensure continuity is still safe
- protect against stale or misleading carryover

Used when:

- student already has phase/stability history
- tutor changes

So handover verification is not a weaker intro.
It is a different system event with a different question.

## The Question Handover Verification Must Answer

`Can the new tutor safely continue from the current stored topic-state?`

That is the only core question.

Not:

- where should the student begin for the first time?

But:

- is the current state still trustworthy enough to continue from?

## Trigger Conditions

Handover verification should trigger when:

- a student with existing TT topic-state is assigned to a new tutor

The requirement should apply when at least one of these is true:

- there is a prior intro diagnosis on record
- there are active topic conditioning entries
- there are prior training drills for the student

## Parent Experience Rule

The parent should not experience reassignment as re-onboarding.

That means the UI must not imply:

- your child is starting over
- your child is being re-evaluated from scratch
- the previous training did not count

Instead, parent-facing language should communicate:

- your child’s training history remains intact
- the new tutor is reviewing current progress
- a short continuity check may happen before sessions continue

## Parent Reassignment UI State

We should introduce a specific parent-visible state for reassigned active students.

Recommended state:

`Tutor Reassignment In Progress`

After tutor accepts:

`Continuity Check`

Then:

`Active`

### Parent-facing copy

#### State: Tutor Reassignment In Progress

Suggested wording:

`A new tutor is being assigned to continue your child’s TT program. Your child’s progress and training history remain in place.`

#### State: Continuity Check

Suggested wording:

`Your child’s new tutor is completing a short continuity check to confirm the current training state before continuing. This is not a restart of the program.`

#### State: Active

Suggested wording:

`Training has resumed with the new tutor using your child’s existing TT progress history.`

This keeps the parent oriented correctly.

## Tutor Experience Rule

The tutor should not be asked to guess whether to trust the inherited state.

The system should give the tutor:

- inherited active topics
- current phase/stability per topic
- last few drill results
- trend
- next action
- constraints
- original diagnosis summary
- handover verification tasks

The tutor’s job is:

- run verification
- observe honestly
- let the system confirm or correct the state

## Handover Verification Scope

Handover verification should be:

- topic-specific
- phase-aware
- short
- non-training

This is not a full session rebuild.

It is a targeted continuity check.

## Which Topics Should Be Verified

By default:

- verify the student’s currently active topics

If too many topics are active:

- prioritize top 1 to 2 topics by:
  - most recent work
  - highest friction
  - phase sensitivity

This avoids making reassignment too heavy.

## Verification Unit

Like adaptive diagnosis, handover verification should be short and decisive.

It should not use full training drill structure.

Recommended model:

- one short verification block per selected topic
- block is built from the topic’s current stored phase
- score block out of `100`
- decide whether inherited state holds

## Verification Logic

Handover verification should inherit the topic’s current state as the starting assumption.

Example:

- Topic: Fractions
- Current stored state: `Structured Execution / Medium`

The verification block should check:

- does observed performance still look like Structured Execution?
- does the current stability still make sense?

## Recommended Verification Outcomes

Handover verification should support 4 outcomes.

### 1. Hold

Meaning:

- inherited phase is correct
- inherited stability is still acceptable

Action:

- continue from current stored state

### 2. Stability adjust

Meaning:

- phase still looks correct
- but stability is slightly off

Action:

- adjust stability within the same phase

Example:

- Structured Execution / Medium -> Structured Execution / Low
- Controlled Discomfort / High -> Controlled Discomfort / Medium

### 3. Targeted re-diagnosis required

Meaning:

- the stored phase itself now looks questionable
- topic likely needs sharper reclassification

Action:

- run targeted topic re-diagnosis for that topic only

This is not full intro re-onboarding.

### 4. Severe mismatch / stale state

Meaning:

- inherited data is too weak, too old, or too contradictory

Action:

- escalate to a larger reset decision
- still avoid full re-intro unless absolutely necessary

This should be rare.

## Suggested Scoring Bands

The exact law can be refined later, but a clean first version is:

- `0-39` -> severe mismatch -> targeted re-diagnosis
- `40-59` -> phase likely holds, but reduce stability
- `60-84` -> hold current state
- `85-100` -> hold and mark confidence strong

This is different from adaptive intro diagnosis because handover verification is not trying to discover first entry phase across the whole ladder.

It is trying to validate an existing state assumption.

## Practical Example

Student history:

- Topic: Linear Equations
- Stored state: `Controlled Discomfort / Medium`
- Tutor changes

New tutor runs handover verification.

### Outcome A: Score 72

Interpretation:

- current phase looks right
- current stability looks usable

Action:

- keep `Controlled Discomfort / Medium`
- continue training

### Outcome B: Score 48

Interpretation:

- current phase may still be right
- but stability is too optimistic

Action:

- adjust to `Controlled Discomfort / Low`
- continue with reinforcement

### Outcome C: Score 28

Interpretation:

- current state does not look trustworthy

Action:

- trigger targeted re-diagnosis on `Linear Equations`

## Data Integrity Rule

Handover verification must not overwrite intro history.

That means:

- original intro diagnosis remains intact
- training history remains intact
- handover verification is stored as its own drill/event type

Recommended event type:

`handover_verification`

This is important because:

- intro must remain the first placement event
- handover verification is a continuity event
- reporting and audits should be able to distinguish them

## Recommended Stored Data

Each handover verification event should store:

- student_id
- previous_tutor_id
- new_tutor_id
- topic
- phase_at_verification
- stability_at_verification
- verification_score
- verification_outcome
- resulting_phase
- resulting_stability
- whether re-diagnosis was triggered
- timestamp

## Tutor UI State

When a tutor inherits an active student, the tutor UI should show:

`Handover Verification Required`

Inside the student card or session launcher, show:

- inherited topics
- current stored state
- last updated time
- last drill trend
- verification required banner

Suggested tutor copy:

`This student is continuing from a previous tutor. Run handover verification before standard training resumes.`

## Session Access Rule

Until handover verification is complete, the system should:

- allow handover verification launch
- block normal training drill launch

This is important.

Otherwise tutors may skip verification and immediately continue training from a state they have not validated.

## Parent Portal Behavior

The parent portal should reflect continuity.

Recommended behavior:

- retain prior completed session history
- retain reports
- retain progress state
- show tutor reassignment status
- show continuity check as a short transitional step

Do not:

- reset progress bars
- relabel the student as newly enrolled
- require proposal re-acceptance unless the commercial logic actually changed

## System Rule Summary

When tutor changes for an already active TT student:

1. preserve all diagnosis and training history
2. mark student as reassigned
3. require handover verification
4. validate inherited topic-state
5. then unlock normal training

## Final Recommendation

The product should implement:

`Tutor Reassignment -> Handover Verification -> Continue Training`

Not:

`Tutor Reassignment -> Re-Intro Session`

This is the strongest design because it:

- preserves system continuity
- protects state integrity
- avoids false resets
- gives the new tutor a controlled entry point
- gives parents confidence that progress is continuing, not restarting

## Implementation Direction

The next implementation layer should include:

- new workflow state for reassigned active students
- parent UI reassignment state
- tutor UI handover verification gate
- new verification event type
- topic-state update rules for verification outcomes
- targeted re-diagnosis trigger path where needed
