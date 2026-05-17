# Parent Dashboard State Output Matrix

This document captures the current parent-dashboard outputs after the diagnosis-vs-live copy split and the multi-topic refinement.

The parent dashboard currently has three layers of output:

1. `Topic Focus` cards
2. `What is Being Observed`
3. `Parent Role`

The output is driven by:

- `phase`
- `stability`
- whether the parent is still in `diagnosis-only` mode or has started `live training`
- whether there is `1 topic` or `multiple topics`

## Diagnosis vs Live

The dashboard treats the parent view as `diagnosis-only` when:

- `trainingSessionsCompleted === 0`

This means:

- the intro diagnosis does **not** count as live training
- first-time onboarding uses diagnosis wording
- once real training sessions exist, the dashboard switches to live-training wording

## Topic Focus Cards

These always render per topic.

For each topic card, the dashboard shows:

- `Current Status`
- `What This Means`
- `Current Focus`

These are phase/stability-specific.

### Example: Structured Execution / Medium / Diagnosis-only

- `Current Status`
  - `The intro diagnosis shows partial execution consistency in this topic.`
- `What This Means`
  - `Your child can use the correct method in many cases, but it is not yet stable enough to treat as trained performance.`
- `Current Focus`
  - `Training will begin by strengthening independent starts and more consistent method use.`

### Example: Structured Execution / Medium / Live

- `Current Status`
  - `Your child is becoming more consistent in solving problems.`
- `What This Means`
  - `They can follow the method in many cases, but still show occasional inconsistency.`
- `Current Focus`
  - `We are increasing independent practice to strengthen consistency.`

## What Is Being Observed

### Single-topic behavior

For one topic, this section renders a phase-specific observation list.

### Multiple-topic behavior

For two or more topics, this section renders compact per-topic grouped blocks.

It does **not** collapse the student into one fake global state.

## Parent Role

### Single-topic behavior

For one topic, this section renders phase-specific parent-role lines.

### Multiple-topic behavior

For two or more topics, this section renders:

- two shared base lines
- then compact per-topic grouped blocks

It stays subtle and does not duplicate the full `Topic Focus` cards.

## Phase Output Matrix

Below is the current phase-specific output logic used by the lower dashboard sections.

## Clarity

### Diagnosis-only

`What is Being Observed`

- `Clearer recognition of what the question is asking`
- `Earlier correct method selection`
- `Less confusion when beginning problems`
- `More accurate first steps`

`Parent Role`

- `Keep session attendance steady and protected.`
- `Use the tutor and training plan as the operating reference.`
- `Let your child explain what the question is asking before stepping in with the answer.`
- `Do not rush them into speed before the structure is clear.`

### Live

`What is Being Observed`

- `Clearer recognition of what the question is asking`
- `Earlier correct method selection`
- `Less confusion during setup`
- `More accurate first steps across sessions`

`Parent Role`

- `Keep session attendance steady and protected.`
- `Use the tutor and training plan as the operating reference.`
- `Look for clearer reading and better first-step recognition, not only marks.`
- `Do not rush them into speed before the structure is clear.`

## Structured Execution

### Diagnosis-only

`What is Being Observed`

- `Earlier independent starts`
- `Less hesitation when beginning problems`
- `More consistent method use`
- `More stable step order without prompting`

`Parent Role`

- `Keep session attendance steady and protected.`
- `Use the tutor and training plan as the operating reference.`
- `Let your child start the problem independently before stepping in.`
- `Look for steadier starts and method order, not speed or perfection yet.`

### Live

`What is Being Observed`

- `Earlier independent starts`
- `Less hesitation when beginning problems`
- `More consistent method use`
- `More stable step order without prompting`

`Parent Role`

- `Keep session attendance steady and protected.`
- `Use the tutor and training plan as the operating reference.`
- `Let your child start the problem independently before stepping in.`
- `Look for more repeatable method use and steadier starts, not only marks.`

## Controlled Discomfort

### Diagnosis-only

`What is Being Observed`

- `Calmer starts when questions feel less familiar`
- `Better structure holding in harder work`
- `Less visible shutdown under challenge`
- `More complete attempts on difficult questions`

`Parent Role`

- `Keep session attendance steady and protected.`
- `Use the tutor and training plan as the operating reference.`
- `Let discomfort happen before stepping in with reassurance.`
- `Look for calmer starts and steadier attempts when the work feels harder.`

### Live

`What is Being Observed`

- `Calmer starts when questions feel less familiar`
- `Better structure holding in harder work`
- `Less visible shutdown under challenge`
- `More complete attempts on difficult questions`

`Parent Role`

- `Keep session attendance steady and protected.`
- `Use the tutor and training plan as the operating reference.`
- `Let discomfort happen before stepping in with reassurance.`
- `Look for calmer starts and steadier attempts when the work feels harder.`

## Time Pressure Stability

### Diagnosis-only

`What is Being Observed`

- `Stronger structure while work is timed`
- `Fewer rushed breakdowns`
- `More reliable decisions under pace pressure`
- `Less instability when speed is added`

`Parent Role`

- `Keep session attendance steady and protected.`
- `Use the tutor and training plan as the operating reference.`
- `Protect focused timed work without adding extra panic from outside the session.`
- `Look for structure under pace, not just whether the answer was finished quickly.`

### Live

`What is Being Observed`

- `Stronger structure while work is timed`
- `Fewer rushed breakdowns`
- `More reliable decisions under pace pressure`
- `Less instability when speed is added`

`Parent Role`

- `Keep session attendance steady and protected.`
- `Use the tutor and training plan as the operating reference.`
- `Protect focused timed work without adding extra panic from outside the session.`
- `Look for structure under pace, not just whether the answer was finished quickly.`

## Scenario Examples

## 2 Topics

Example:

- `Algebra = Structured Execution / Medium`
- `Functions = Controlled Discomfort / Low`

`What is Being Observed`

- `Algebra`
  - `Earlier independent starts`
  - `Less hesitation when beginning problems`
- `Functions`
  - `Calmer starts when questions feel less familiar`
  - `Better structure holding in harder work`

`Parent Role`

- shared
  - `Keep session attendance steady and protected.`
  - `Use the tutor and training plan as the operating reference.`
- per topic
  - `Algebra`
    - `Let your child start the problem independently before stepping in.`
    - diagnosis-only:
      - `Look for steadier starts and method order, not speed or perfection yet.`
    - live:
      - `Look for more repeatable method use and steadier starts, not only marks.`
  - `Functions`
    - `Let discomfort happen before stepping in with reassurance.`
    - `Look for calmer starts and steadier attempts when the work feels harder.`

## 4 Topics

Example:

- `Algebra = Clarity / Medium`
- `Functions = Structured Execution / High`
- `Geometry = Controlled Discomfort / Low`
- `Trigonometry = Time Pressure Stability / Medium`

`What is Being Observed`

- `Algebra`
  - `Clearer recognition of what the question is asking`
  - `Earlier correct method selection`
- `Functions`
  - `Earlier independent starts`
  - `Less hesitation when beginning problems`
- `Geometry`
  - `Calmer starts when questions feel less familiar`
  - `Better structure holding in harder work`
- `Trigonometry`
  - `Stronger structure while work is timed`
  - `Fewer rushed breakdowns`

`Parent Role`

- shared
  - `Keep session attendance steady and protected.`
  - `Use the tutor and training plan as the operating reference.`
- per topic
  - `Algebra`
    - diagnosis-only:
      - `Let your child explain what the question is asking before stepping in with the answer.`
    - live:
      - `Look for clearer reading and better first-step recognition, not only marks.`
    - both:
      - `Do not rush them into speed before the structure is clear.`
  - `Functions`
    - `Let your child start the problem independently before stepping in.`
    - diagnosis-only:
      - `Look for steadier starts and method order, not speed or perfection yet.`
    - live:
      - `Look for more repeatable method use and steadier starts, not only marks.`
  - `Geometry`
    - `Let discomfort happen before stepping in with reassurance.`
    - `Look for calmer starts and steadier attempts when the work feels harder.`
  - `Trigonometry`
    - `Protect focused timed work without adding extra panic from outside the session.`
    - `Look for structure under pace, not just whether the answer was finished quickly.`

## Current Limitation

For multi-topic views, the lower dashboard sections intentionally stay compact.

That means:

- they show only a subset of the full per-topic guidance
- the complete per-topic state still lives in the `Topic Focus` cards above

This is intentional to avoid turning the lower half of the dashboard into a second full topic-card system.
