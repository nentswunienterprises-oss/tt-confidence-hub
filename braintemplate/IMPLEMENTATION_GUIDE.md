# Brain Template — Implementation Guide

This folder is a reusable question framework extracted from the Territorial Tutoring Brain.

## What is the Brain Template?

The Brain Template provides a structured set of questions organized into 5 core categories:

1. **Index** — Repository knowledge (structure, inventory, size)
2. **Memory** — System internals (architecture, constraints, conventions)
3. **Prompts** — Execution instructions (tasks, strategy, long-term vision)
4. **Context** — Current state (goals, priorities, blockers)
5. **Vision** — Mission and principles (identity, mission, brand, business model, pillars, constitution)

## How to Use It

### For a New Repository

1. Copy `/braintemplate` to your new project as `/brain`.
2. Open each `QUESTIONS.md` file and answer every question.
3. Create companion documents (e.g., `architecture.md`, `constraints.md`, etc.) with your answers.
4. Commit both the questions and answers to version control.
5. Use the Brain when onboarding, planning features, or working with AI assistants.

### For an Existing Repository

1. Add `/braintemplate` to your repo.
2. For each question you can answer from existing documentation, extract the answer.
3. For unanswered questions, assign an owner to research and fill in the gap.
4. Convert questions into a living brain by creating the supporting documents.

## Folder Breakdown

### `index/QUESTIONS.md`
Maps repository structure and generates snapshots. Answers to these questions create:
- `brain/index/repo-map.md` — Human-readable repository overview
- `brain/index/repo_snapshot.md` — Automated file inventory

### `memory/QUESTIONS.md`
Documents system design and operational rules. Answers create:
- `brain/memory/architecture.md` — Backend, frontend, storage, auth design
- `brain/memory/constraints.md` — Destructive changes, secrets, access control
- `brain/memory/conventions.md` — Code style, naming, testing, commits

### `prompts/QUESTIONS.md`
Structures how to instruct execution. Answers create:
- `brain/prompts/execution.md` — Task format and approval gates
- `brain/prompts/strategy.md` — Long-term vision and strategic alignment

### `context/QUESTIONS.md`
Captures the current state and priorities. Answers create:
- `brain/context/active_context.md` — Live goal, blockers, and next steps

### `vision/QUESTIONS.md`
Defines mission, brand, and constitutional rules. Answers create:
- `brain/vision/WHO_WE_ARE.md` — Identity and positioning
- `brain/vision/our_mission.md` — What you build and for whom
- `brain/vision/BRAND_GUIDE.md` — Tone, language, voice
- `brain/vision/TT_Business_Model.md` — Revenue, offers, economics
- `brain/vision/ttpillars.md` — Core institutional pillars
- `brain/vision/TT_CONSTITUTION.md` — Inviolable rules and principles

## Key Principles

1. **Answer before building.** The Brain is discovery, not documentation-after-the-fact.
2. **Be specific.** Vague answers produce ambiguous systems.
3. **Assign ownership.** Every question should have an owner who can update it.
4. **Keep it readable.** The Brain is for humans and AI; clarity is essential.
5. **Version and review.** Treat the Brain like code; review changes before merging.

## Template Quality Metrics

A good Brain should answer these about itself:
- Can a new contributor understand the system in under an hour from the Brain alone?
- Can an AI agent execute tasks with zero clarification questions?
- Does every design decision have a reason documented in the Brain?
- Is every constraint explained and enforced somewhere in the Brain?
- Can you find any fact about the system in under 3 minutes?

---

*This guide is part of the `/braintemplate` — a reusable framework for building structured, question-driven project knowledge.*
