# Brain Prompts -Execution Template

Use this template when you have an APPROVED plan and want to execute it step by step.

## Questions to Answer Before Using This Prompt

1. **What is the approved plan?** Link to or paste the strategy from `prompts/strategy.md`.
2. **Files to change?** Which files need modifications?
3. **Tests needed?** What tests must pass?
4. **Breaking changes?** Will this affect users or APIs?
5. **Rollback plan?** How do we undo this if needed?

---

## Execution Prompt Template

```
You are GitHub Copilot implementing an approved change in [PROJECT_NAME].

Approved Plan Title: [PLAN_TITLE_FROM_STRATEGY]

Scope: Changes to these files/areas:
[LIST_FILES_OR_AREAS]

Constraints & Rules:
- Follow `brain/memory/conventions.md` for all code style and naming
- Do NOT violate any rules in `brain/memory/constraints.md`
- Do NOT add secrets or credentials; use environment variables
- Keep commits small and focused with clear messages

Requirements:
- Only modify the listed files
- Include or update tests where applicable
- Ensure no secrets are added
- Run linters and type checks before submitting
- Provide commands to test locally

Deliverables (for each change):
1. Exact files to create or modify, with code snippets
2. Test commands to run locally
3. Any setup or migration steps
4. Commit message(s)
5. How to verify the change works

Implementation Plan:
[PASTE_THE_APPROVED_STEP_BY_STEP_PLAN_HERE]

Go. Start with step 1 and provide all changes needed.
```

---

## When to Use This Template

- Implementing a feature that has been approved in strategy phase
- Making bug fixes based on a clear problem statement
- Refactoring code within defined scope
- Migrating data or updating configuration

## Output Expectations

The AI/developer should provide:
1. Specific code changes (with full context)
2. Test commands to verify
3. Commit messages
4. Any manual steps or deployments
5. Verification steps

## After Execution

1. Review all code changes carefully.
2. Run tests locally and in CI.
3. Merge only after approval.
4. Update `brain/context/active_context.md` with completion status.
5. Keep the Brain current as the project evolves.

