# Brain Index -Decision Log & Architecture Decision Records (ADRs)

Track major technical decisions made in the project. This helps future developers understand the "why" behind the current architecture.

## How to Add a Decision

When you make a significant architectural or technical decision, create an entry in this log:

1. Record the date and decision made
2. Document the alternatives considered
3. Explain the reasoning and tradeoffs
4. Note any consequences or future implications
5. Link to relevant code or documentation

---

## Decision Log Template

For each major decision, fill in:

```
### Decision: [TITLE]

**Date**: [YYYY-MM-DD]

**Status**: Proposed | Accepted | Superseded | Deprecated

**Problem Statement**
[What problem were we trying to solve?]

**Alternatives Considered**
1. [Option A]: Pros, Cons, Cost
2. [Option B]: Pros, Cons, Cost
3. [Option C]: Pros, Cons, Cost

**Decision**
[Which option was chosen and why?]

**Reasoning**
[The core factors in the decision]

**Consequences**
- Positive: [What got better?]
- Negative: [What got worse or harder?]
- Neutral: [What changed?]

**Implementation**
- Timeline: [When was this done?]
- Owner: [@person]
- Related PRs: [Links to PRs]

**Affected Systems**
- [System 1]
- [System 2]

**Supersedes**
[Any previous decisions this overrides?]

**Revisit Date**
[When should we reconsider this?]

**Additional Notes**
[Anything else relevant?]
```

---

## Decisions Recorded

### Decision: [DECISION_TITLE_1]
**Date**: [Date]
**Status**: Accepted
[Full details here - use template above]

### Decision: [DECISION_TITLE_2]
**Date**: [Date]
**Status**: Accepted
[Full details here - use template above]

---

## How to Supersede a Decision

If a previous decision is no longer valid:

1. Create a new decision entry with "Status: Supersedes [Previous Decision]"
2. Reference the old decision clearly
3. Explain what changed and why
4. Update any affected documentation

---

## Reviewing Decisions

- **Monthly**: Review "active" decisions for ongoing relevance
- **During planning**: Check if any past decisions constrain new work
- **During retrospectives**: Discuss whether any decisions should be revisited
- **For new team members**: ADRs serve as great onboarding material

---

## When to Log a Decision

Log a decision if it:
- Affects the overall architecture
- Constrains future work significantly
- Required significant debate or tradeoffs
- Is likely to be questioned in the future
- Has long-term cost or operational implications

**Don't log**: trivial implementation details, feature flags, or temporary workarounds

