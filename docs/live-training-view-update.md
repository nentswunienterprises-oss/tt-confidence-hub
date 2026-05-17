# Live Training View Update

## What changed

The live-state branch in `client/src/components/parent/ProposalView.tsx` was rewritten to match the approved clean format.

The older version still sounded like the system explaining itself. It repeated state labels, repeated topic names, and used section names that pushed the view back toward internal-system language.

The current version is stricter:

- single-topic uses `Current Focus`, not `Current Training Context`
- multi-topic stays modular by topic
- `Focus Area` and every `Training Is At` line are removed
- `What We Are Observing` replaces `What We Have Observed`
- `How Progress Will Show` replaces `How We Will Know It Is Improving`
- `Parent Note` replaces `Parent Alignment`
- `Structure` replaces `Conditioning Structure`

## Locked structure

### Single topic

- `{student} Training Plan`
- `Live Operating Plan`
- `Current Focus`
- `{student} is currently training in {topic}.`
- `She is operating at {phase} ({stability}) - meaning {translated meaning}.`
- `Current Position`
- `{position}`
- `What We Are Observing`
- phase/stability observation bullets
- `Training Direction`
- `{direction}`
- `How Progress Will Show`
- phase/stability progress bullets
- `Structure`
- `2 sessions per week (8 per month)`
- `Method-first execution`
- `Immediate correction where needed`
- `Repetition within the active training set`
- `Difficulty increases only after stability is proven`
- `Commitment`
- `Consistency is required`
- `{student} must attempt before guidance`
- `Discomfort is part of strengthening execution`
- `Parent Note`
- `This plan reflects {student}'s current training position, not a fixed program.`
- `As her execution stabilizes, the training phase will advance.`

### Multi topic

- `{student} Training Plan`
- `Live Operating Plan`
- `Current Focus`
- `{student} is currently training across {topicSummary}.`
- `Each topic is being handled from its current position.`
- topic blocks with:
- topic name
- `She is operating at {phase} ({stability}) - meaning {translated meaning}.`
- `Current Position`
- topic blocks with `{position}`
- `What We Are Observing`
- topic blocks with observation bullets
- `Training Direction`
- topic blocks with `{direction}`
- `How Progress Will Show`
- `{topic}: {bullet}`
- `Structure`
- unchanged
- `Commitment`
- unchanged
- `Parent Note`
- `This plan reflects {student}'s current live training position across {topicSummary}.`
- `Each topic advances according to its own stability.`

## Exact current outputs

The strings below reflect the current formatter in `client/src/components/parent/ProposalView.tsx`.

For all examples below:

- student name: `Kwenadi`

### Shared static sections

`Structure`

- 2 sessions per week (8 per month)
- Method-first execution
- Immediate correction where needed
- Repetition within the active training set
- Difficulty increases only after stability is proven

`Commitment`

- Consistency is required
- Kwenadi must attempt before guidance
- Discomfort is part of strengthening execution

### Single-topic examples

#### Structured Execution / High Maintenance

`Kwenadi Training Plan`

`Live Operating Plan`

`Current Focus`

- Kwenadi is currently training in `{topic}`.
- She is operating at `Structured Execution (High Maintenance)` - meaning she is consistently applying the correct method, and we are now confirming that it holds under repetition.

`Current Position`

- Kwenadi is no longer learning how to solve. She is now proving that execution holds under repetition.

`What We Are Observing`

- Strong, repeatable method execution
- Consistent step order across sessions
- Minimal breakdown during guided work
- Consistency is visible across repeated sessions

`Training Direction`

- We are running maintenance checks to confirm that this stability is reliable enough to introduce pressure. Controlled Discomfort will only begin once this level is consistently maintained.

`How Progress Will Show`

- Faster independent starts
- More consistent step order without correction
- Stability holding across repeated sessions

`Parent Note`

- This plan reflects Kwenadi's current training position, not a fixed program.
- As her execution stabilizes, the training phase will advance.

#### Clarity / Medium

`Current Focus`

- Kwenadi is currently training in `{topic}`.
- She is operating at `Clarity (Medium)` - meaning she is still learning to recognise what the question is asking and to choose the right structure early.

`Current Position`

- Kwenadi is still building reliable recognition before faster or harder execution is added.

`What We Are Observing`

- Stronger recognition of what the question is asking
- More reliable identification of the right structure
- Less hesitation before the first step
- The current response is not yet fully stable

`Training Direction`

- Sessions are focused on recognition, language, and first-step structure before speed or pressure are added.

`How Progress Will Show`

- Clearer recognition of what questions are asking
- Earlier correct method selection
- Less volatility from one session to the next

### Multi-topic exact example

Example active topics:

- `Linear Equations = Structured Execution / High Maintenance`
- `Fractions = Clarity / Medium`

This renders as:

`Kwenadi Training Plan`

`Live Operating Plan`

`Current Focus`

- Kwenadi is currently training across Linear Equations and Fractions.
- Each topic is being handled from its current position.

`Linear Equations`

- She is operating at `Structured Execution (High Maintenance)` - meaning she is consistently applying the correct method, and we are now confirming that it holds under repetition.

`Fractions`

- She is operating at `Clarity (Medium)` - meaning she is still learning to recognise what the question is asking and to choose the right structure early.

`Current Position`

`Linear Equations`

- Kwenadi is no longer learning how to solve. She is now proving that execution holds under repetition.

`Fractions`

- Kwenadi is still building reliable recognition before faster or harder execution is added.

`What We Are Observing`

`Linear Equations`

- Strong, repeatable method execution
- Consistent step order across sessions
- Minimal breakdown during guided work
- Consistency is visible across repeated sessions

`Fractions`

- Stronger recognition of what the question is asking
- More reliable identification of the right structure
- Less hesitation before the first step
- The current response is not yet fully stable

`Training Direction`

`Linear Equations`

- We are running maintenance checks to confirm that this stability is reliable enough to introduce pressure. Controlled Discomfort will only begin once this level is consistently maintained.

`Fractions`

- Sessions are focused on recognition, language, and first-step structure before speed or pressure are added.

`How Progress Will Show`

- Linear Equations: Faster independent starts
- Linear Equations: More consistent step order without correction
- Linear Equations: Stability holding across repeated sessions
- Fractions: Clearer recognition of what questions are asking
- Fractions: Earlier correct method selection
- Fractions: Less volatility from one session to the next

`Parent Note`

- This plan reflects Kwenadi's current live training position across Linear Equations and Fractions.
- Each topic advances according to its own stability.
