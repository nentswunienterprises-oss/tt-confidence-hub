# Current Report Output Matrix

This document reflects the current report-generation code in:

- [server/routes.ts](/abs/path/C:/Users/Thend/Downloads/Technology/PodDigitizer/server/routes.ts)
- [client/src/pages/client/parent/progress.tsx](/abs/path/C:/Users/Thend/Downloads/Technology/PodDigitizer/client/src/pages/client/parent/progress.tsx)
- [client/src/components/tutor/StudentReportsDialog.tsx](/abs/path/C:/Users/Thend/Downloads/Technology/PodDigitizer/client/src/components/tutor/StudentReportsDialog.tsx)
- [shared/topicConditioningEngine.ts](/abs/path/C:/Users/Thend/Downloads/Technology/PodDigitizer/shared/topicConditioningEngine.ts)

It documents the exact current outputs and the scenario rules that produce them.

## Weekly Report

Header:

- `Weekly Report`
- `{weekStartDate} - {weekEndDate}`
- `Sent {sentAt} by {tutor}`

Sections shown:

- `Sessions Completed`
- `Topics`
- `What Changed`
- `Breakdown Pattern`
- `What This Means`
- `Next Move`

### Weekly `What Changed`

Exact templates:

- State changed:
  - `{topic} moved from {phaseBefore} ({stabilityBefore}) to {phaseAfter} ({stabilityAfter}), with {behaviorShift}.`
- State unchanged:
  - `{topic} remained in {phaseAfter} ({stabilityAfter}), with {behaviorShift}.`

`behaviorShift` rules:

- Maximum 2 signals.
- Priority order:
  - reduced weak signals become `less {weakSignal}`
  - strengthened strong signals stay in comparative form
- If no shift is found, fallback becomes:
  - up to 2 strong signals in absolute form
  - otherwise `continued {weakSignal}`
  - otherwise `no consistent behavior shift recognized yet`

Examples:

- `less delayed starts and more reliable step execution`
- `less hesitation under pressure and stronger structure retention`
- `reliable step execution and independent starts`
- `continued early dependence`
- `no consistent behavior shift recognized yet`

### Weekly `Breakdown Pattern`

Exact template:

- `{topic}: {weak1} and {weak2}`
- `{topic}: {weak1}`
- `{topic}: no consistent breakdown pattern identified`

### Weekly `What This Means`

Rules:

- If phase progressed, use entry meaning by destination phase.
- If latest transition is `stability regress`, use the reinforcement warning.
- If final state is `Time Pressure Stability (High Maintenance)`, use the final-maintenance meaning.
- Otherwise use the state meaning matrix.

Phase-entry meanings:

- `Clarity`
  - `Entered foundation rebuilding before independent solving begins.`
- `Structured Execution`
  - `Entered independent execution, now building consistency without tutor carry.`
- `Controlled Discomfort`
  - `Entered the challenge phase, now learning to stay stable under difficulty.`
- `Time Pressure Stability`
  - `Entered timed stability, now learning to keep structure under urgency.`

Special-case meanings:

- Stability regress:
  - `Stability has dipped at this level and needs reinforcement before progression.`
- Final maintenance:
  - `Top-level stability is holding, now in maintenance and transfer.`

### Weekly `Next Move`

Exact matrix:

- `Clarity / Low`
  - `reinforce recognition and first-step decisions before increasing difficulty.`
- `Clarity / Medium`
  - `reinforce recognition and first-step decisions before increasing difficulty.`
- `Clarity / High`
  - `reinforce recognition and first-step decisions before increasing difficulty.`
- `Clarity / High Maintenance`
  - `introduce Structured Execution while protecting recognition and step choice.`
- `Structured Execution / Low`
  - `reinforce step order and independent starts before increasing difficulty.`
- `Structured Execution / Medium`
  - `reinforce step order and independent starts before increasing difficulty.`
- `Structured Execution / High`
  - `increase variation while protecting step order and independent starts.`
- `Structured Execution / High Maintenance`
  - `introduce Controlled Discomfort while protecting structure.`
- `Controlled Discomfort / Low`
  - `increase exposure to harder problems while maintaining structure.`
- `Controlled Discomfort / Medium`
  - `increase exposure to harder problems while maintaining structure.`
- `Controlled Discomfort / High`
  - `increase timed demand while protecting structure under difficulty.`
- `Controlled Discomfort / High Maintenance`
  - `introduce Time Pressure Stability while protecting structure.`
- `Time Pressure Stability / Low`
  - `increase timed exposure while protecting structure and pace control.`
- `Time Pressure Stability / Medium`
  - `increase timed exposure while protecting structure and pace control.`
- `Time Pressure Stability / High`
  - `increase timed exposure while protecting structure and pace control.`
- `Time Pressure Stability / High Maintenance`
  - `maintain timed performance and begin transfer across related topics.`

## Monthly Report

Header:

- `{monthName} Report`
- `{monthStartDate} - {monthEndDate}`
- `Sent {sentAt} by {tutor}`

Sections shown:

- `Total Sessions Completed`
- `Topics`
- `System Movement`
- `What Became Stronger`
- `Breakdown Pattern`
- `Current Position`
- `What This Means`
- `Next Month Move`

### Monthly `System Movement`

Exact templates:

- Phase progress:
  - `{topic} advanced from {phaseBefore} to {phaseAfter}.`
- Stability advance:
  - `{topic} remained in {phaseAfter}, with stability improving across sessions.`
- Stability regress:
  - `{topic} remained in {phaseAfter} with reduced stability.`
- Final maintenance:
  - `{topic} remained in {phaseAfter} with sustained maintenance.`
- No movement:
  - `{topic} remained in {phaseAfter}.`

### Monthly `What Became Stronger`

Exact template:

- `{topic}: {strong1} and {strong2}`
- `{topic}: {strong1}`
- `No consistent strength pattern recognized yet`

### Monthly `Breakdown Pattern`

Exact template:

- `{topic}: {weak1} and {weak2}`
- `{topic}: {weak1}`
- `No recurring breakdown signal detected`

### Monthly `Current Position`

Render format:

- first line: `{topic}: {phase} ({stability})`
- second line: state-specific position line

Position matrix:

- `Clarity / Low`
  - `Recognition is improving, but independent execution is not yet stable.`
- `Clarity / Medium`
  - `Recognition is improving, but independent execution is not yet stable.`
- `Clarity / High`
  - `Recognition holds, but independent execution is not yet stable.`
- `Clarity / High Maintenance`
  - `Recognition holds, but independent execution is not yet stable.`
- `Structured Execution / Low`
  - `Execution is forming, but consistency is not yet stable.`
- `Structured Execution / Medium`
  - `Execution is forming, but consistency is not yet stable.`
- `Structured Execution / High`
  - `Execution is now holding independently.`
- `Structured Execution / High Maintenance`
  - `Execution is now holding independently.`
- `Controlled Discomfort / Low`
  - `Structure breaks when difficulty rises.`
- `Controlled Discomfort / Medium`
  - `Structure breaks when difficulty rises.`
- `Controlled Discomfort / High`
  - `Structure holds under difficulty, but timed pressure is not yet stable.`
- `Controlled Discomfort / High Maintenance`
  - `Structure holds under difficulty, but timed pressure is not yet stable.`
- `Time Pressure Stability / Low`
  - `Structure breaks when pace increases.`
- `Time Pressure Stability / Medium`
  - `Structure breaks when pace increases.`
- `Time Pressure Stability / High`
  - `Structure holds under pace pressure.`
- `Time Pressure Stability / High Maintenance`
  - `Structure holds under pace pressure.`

## State Meaning Matrix

Used by weekly and monthly `What This Means` unless overridden by:

- phase progression
- stability regress
- final maintenance

### Clarity

- `Low`
  - `Recognition is improving, but independent execution is not yet stable.`
- `Medium`
  - `Recognition is improving, but independent execution is not yet stable.`
- `High`
  - `Recognition holds, but execution is not yet stable on its own.`
- `High Maintenance`
  - `Recognition holds, but execution is not yet stable on its own.`

### Structured Execution

- `Low`
  - `Execution is forming, but consistency is not yet stable.`
- `Medium`
  - `Execution is forming, but consistency is not yet stable.`
- `High`
  - `Execution is now holding independently.`
- `High Maintenance`
  - `Execution is now holding independently.`

### Controlled Discomfort

- `Low`
  - `Structure breaks when difficulty rises.`
- `Medium`
  - `Structure breaks when difficulty rises.`
- `High`
  - `Structure is holding under difficulty.`
- `High Maintenance`
  - `Structure is holding under difficulty.`

### Time Pressure Stability

- `Low`
  - `Structure breaks when pace increases.`
- `Medium`
  - `Structure breaks when pace increases.`
- `High`
  - `Structure is holding under pace pressure.`
- `High Maintenance`
  - `Structure is holding under pace pressure.`

## Behavior Signal Matrix

Raw observations map into these behavior labels.

Weak labels:

- `clarity breakdown`
- `inconsistent step execution`
- `early dependence`
- `delayed starts`
- `hesitation under pressure`
- `structure breakdown`
- `pace loss`

Strong labels before absolute conversion:

- `clearer concept recall`
- `more reliable step execution`
- `more independent execution`
- `earlier independent starts`
- `better control under difficulty`
- `stronger structure retention`
- `more controlled pace`

Absolute-form strong labels used in monthly strengths and weekly fallbacks:

- `clear concept recall`
- `reliable step execution`
- `independent execution`
- `independent starts`
- `control under difficulty`
- `structure retention`
- `controlled pace`

Weak classification regex:

- `breakdown`
- `dependence`
- `hesitation`
- `delayed`
- `pace loss`
- `inconsistent`

Everything else is treated as strong.

## Exact Scenario Examples

Assume topic is `Linear Equations`.

## Single-Topic Weekly Scenarios

These scenarios assume the report contains one topic only.

### 1. Weekly: Phase Progress

- Header:
  - `Weekly Report`
  - `{weekStartDate} - {weekEndDate}`
  - `Sent {sentAt} by {tutor}`
- `Sessions Completed`
  - `{n}`
- `Topics`
  - `Linear Equations`
- `What Changed`
  - `Linear Equations moved from Structured Execution (High Maintenance) to Controlled Discomfort (Low), with control under difficulty and structure retention.`
- `Breakdown Pattern`
  - `Linear Equations: hesitation under pressure`
- `What This Means`
  - `Entered the challenge phase, now learning to stay stable under difficulty.`
- `Next Move`
  - `Linear Equations: increase exposure to harder problems while maintaining structure.`

### 2. Weekly: Stability Advance In Same Phase

- Header:
  - `Weekly Report`
  - `{weekStartDate} - {weekEndDate}`
  - `Sent {sentAt} by {tutor}`
- `Sessions Completed`
  - `{n}`
- `Topics`
  - `Linear Equations`
- `What Changed`
  - `Linear Equations moved from Structured Execution (Medium) to Structured Execution (High), with less delayed starts and more reliable step execution.`
- `Breakdown Pattern`
  - `Linear Equations: early dependence`
- `What This Means`
  - `Execution is now holding independently.`
- `Next Move`
  - `Linear Equations: increase variation while protecting step order and independent starts.`

### 3. Weekly: No State Change

- Header:
  - `Weekly Report`
  - `{weekStartDate} - {weekEndDate}`
  - `Sent {sentAt} by {tutor}`
- `Sessions Completed`
  - `{n}`
- `Topics`
  - `Linear Equations`
- `What Changed`
  - `Linear Equations remained in Clarity (Medium), with clear concept recall and continued delayed starts.`
- `Breakdown Pattern`
  - `Linear Equations: delayed starts`
- `What This Means`
  - `Recognition is improving, but independent execution is not yet stable.`
- `Next Move`
  - `Linear Equations: reinforce recognition and first-step decisions before increasing difficulty.`

### 4. Weekly: Stability Regress

- Header:
  - `Weekly Report`
  - `{weekStartDate} - {weekEndDate}`
  - `Sent {sentAt} by {tutor}`
- `Sessions Completed`
  - `{n}`
- `Topics`
  - `Linear Equations`
- `What Changed`
  - `Linear Equations moved from Controlled Discomfort (High) to Controlled Discomfort (Medium), with continued hesitation under pressure.`
- `Breakdown Pattern`
  - `Linear Equations: hesitation under pressure and structure breakdown`
- `What This Means`
  - `This topic needs reinforcement at the current level before moving forward again.`
- `Next Move`
  - `Linear Equations: increase exposure to harder problems while maintaining structure.`

### 5. Weekly: Final Maintenance

- Header:
  - `Weekly Report`
  - `{weekStartDate} - {weekEndDate}`
  - `Sent {sentAt} by {tutor}`
- `Sessions Completed`
  - `{n}`
- `Topics`
  - `Linear Equations`
- `What Changed`
  - `Linear Equations remained in Time Pressure Stability (High Maintenance), with controlled pace and structure retention.`
- `Breakdown Pattern`
  - `No consistent breakdown pattern identified`
- `What This Means`
  - `Top-level stability is holding, now in maintenance and transfer.`
- `Next Move`
  - `Linear Equations: maintain timed performance and begin transfer across related topics.`

## Single-Topic Monthly Scenarios

These scenarios assume the report contains one topic only.

### 1. Monthly: Phase Progress

- Header:
  - `{monthName} Report`
  - `{monthStartDate} - {monthEndDate}`
  - `Sent {sentAt} by {tutor}`
- `Total Sessions Completed`
  - `{n}`
- `Topics`
  - `Linear Equations`
- `System Movement`
  - `Linear Equations advanced from Structured Execution to Controlled Discomfort.`
- `What Became Stronger`
  - `Linear Equations: control under difficulty and structure retention`
- `Breakdown Pattern`
  - `Linear Equations: hesitation under pressure`
- `Current Position`
  - `Linear Equations: Controlled Discomfort (Low)`
  - `Structure breaks when difficulty rises.`
- `What This Means`
  - `Entered the challenge phase, now learning to stay stable under difficulty.`
- `Next Month Move`
  - `Linear Equations: increase exposure to harder problems while maintaining structure.`

### 2. Monthly: Stability Advance In Same Phase

- Header:
  - `{monthName} Report`
  - `{monthStartDate} - {monthEndDate}`
  - `Sent {sentAt} by {tutor}`
- `Total Sessions Completed`
  - `{n}`
- `Topics`
  - `Linear Equations`
- `System Movement`
  - `Remained in Structured Execution, with stability improving across sessions.`
- `What Became Stronger`
  - `Linear Equations: reliable step execution and independent starts`
- `Breakdown Pattern`
  - `Linear Equations: early dependence`
- `Current Position`
  - `Linear Equations: Structured Execution (High)`
  - `Execution is now holding independently.`
- `What This Means`
  - `Execution is now holding independently.`
- `Next Month Move`
  - `Linear Equations: increase variation while protecting step order and independent starts.`

### 3. Monthly: No State Change

- Header:
  - `{monthName} Report`
  - `{monthStartDate} - {monthEndDate}`
  - `Sent {sentAt} by {tutor}`
- `Total Sessions Completed`
  - `{n}`
- `Topics`
  - `Linear Equations`
- `System Movement`
  - `Linear Equations remained in Clarity.`
- `What Became Stronger`
  - `Linear Equations: clear concept recall`
- `Breakdown Pattern`
  - `Linear Equations: delayed starts`
- `Current Position`
  - `Linear Equations: Clarity (Medium)`
  - `Recognition is improving, but independent execution is not yet stable.`
- `What This Means`
  - `Recognition is improving, but independent execution is not yet stable.`
- `Next Month Move`
  - `Linear Equations: reinforce recognition and first-step decisions before increasing difficulty.`

### 4. Monthly: Stability Regress

- Header:
  - `{monthName} Report`
  - `{monthStartDate} - {monthEndDate}`
  - `Sent {sentAt} by {tutor}`
- `Total Sessions Completed`
  - `{n}`
- `Topics`
  - `Linear Equations`
- `System Movement`
  - `Linear Equations remained in Controlled Discomfort with reduced stability.`
- `What Became Stronger`
  - `No consistent strength pattern recognized yet`
- `Breakdown Pattern`
  - `Linear Equations: hesitation under pressure and structure breakdown`
- `Current Position`
  - `Linear Equations: Controlled Discomfort (Medium)`
  - `Structure breaks when difficulty rises.`
- `What This Means`
  - `This topic needs reinforcement at the current level before moving forward again.`
- `Next Month Move`
  - `Linear Equations: increase exposure to harder problems while maintaining structure.`

### 5. Monthly: Final Maintenance

- Header:
  - `{monthName} Report`
  - `{monthStartDate} - {monthEndDate}`
  - `Sent {sentAt} by {tutor}`
- `Total Sessions Completed`
  - `{n}`
- `Topics`
  - `Linear Equations`
- `System Movement`
  - `Linear Equations remained in Time Pressure Stability with sustained maintenance.`
- `What Became Stronger`
  - `Linear Equations: controlled pace and structure retention`
- `Breakdown Pattern`
  - `No consistent breakdown pattern identified`
- `Current Position`
  - `Linear Equations: Time Pressure Stability (High Maintenance)`
  - `Structure holds under pace pressure.`
- `What This Means`
  - `Top-level stability is holding, now in maintenance and transfer.`
- `Next Month Move`
  - `Linear Equations: maintain timed performance and begin transfer across related topics.`

### Weekly: Phase Progress

- `What Changed`
  - `Linear Equations moved from Structured Execution (High Maintenance) to Controlled Discomfort (Low), with control under difficulty and structure retention.`
- `What This Means`
  - `Entered the challenge phase, now learning to stay stable under difficulty.`
- `Next Move`
  - `Linear Equations: increase exposure to harder problems while maintaining structure.`

### Weekly: Stability Advance

- `What Changed`
  - `Linear Equations moved from Structured Execution (Medium) to Structured Execution (High), with less delayed starts and more reliable step execution.`
- `What This Means`
  - `Execution is now holding independently.`
- `Next Move`
  - `Linear Equations: increase variation while protecting step order and independent starts.`

### Weekly: No State Change

- `What Changed`
  - `Linear Equations remained in Clarity (Medium), with clear concept recall and continued delayed starts.`
- `What This Means`
  - `Recognition is improving, but independent execution is not yet stable.`
- `Next Move`
  - `Linear Equations: reinforce recognition and first-step decisions before increasing difficulty.`

### Weekly: Stability Regress

- `What Changed`
  - `Linear Equations moved from Controlled Discomfort (High) to Controlled Discomfort (Medium), with continued hesitation under pressure.`
- `What This Means`
  - `This topic needs reinforcement at the current level before moving forward again.`
- `Next Move`
  - `Linear Equations: increase exposure to harder problems while maintaining structure.`

### Monthly: Phase Progress

- `System Movement`
  - `Linear Equations advanced from Structured Execution to Controlled Discomfort.`
- `What Became Stronger`
  - `Linear Equations: control under difficulty and structure retention`
- `Current Position`
  - `Linear Equations: Controlled Discomfort (Low)`
  - `Structure breaks when difficulty rises.`

### Monthly: Stability Advance

- `System Movement`
  - `Linear Equations remained in Structured Execution, with stability improving across sessions.`
- `What Became Stronger`
  - `Linear Equations: reliable step execution and independent starts`
- `Current Position`
  - `Linear Equations: Structured Execution (High)`
  - `Execution is now holding independently.`

### Monthly: Stability Regress

- `System Movement`
  - `Linear Equations remained in Controlled Discomfort with reduced stability.`
- `What This Means`
  - `This topic needs reinforcement at the current level before moving forward again.`

### Monthly: Final Maintenance

- `System Movement`
  - `Linear Equations remained in Time Pressure Stability with sustained maintenance.`
- `Current Position`
  - `Linear Equations: Time Pressure Stability (High Maintenance)`
  - `Structure holds under pace pressure.`
- `What This Means`
  - `Top-level stability is holding, now in maintenance and transfer.`
- `Next Month Move`
  - `Linear Equations: maintain timed performance and begin transfer across related topics.`

## Multi-Topic Output

Every topic produces its own line in every section.

Example monthly:

- `Topics`
  - `Linear Equations`
  - `Fractions`
- `System Movement`
  - `Linear Equations advanced from Structured Execution to Controlled Discomfort.`
  - `Fractions remained in Clarity, with stability improving across sessions.`
- `What Became Stronger`
  - `Linear Equations: control under difficulty and structure retention`
  - `Fractions: clear concept recall`
- `Breakdown Pattern`
  - `Linear Equations: hesitation under pressure`
  - `Fractions: delayed starts and early dependence`
