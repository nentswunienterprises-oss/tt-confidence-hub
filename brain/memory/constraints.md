# Brain Constraints

These constraints are intended to protect code integrity, user data, and developer workflows.

1. No destructive changes without explicit human approval
   - Migrations that DROP data or ALTER production schemas require a signed-off plan and a rollback path.

2. Secrets must never be committed to the repository
   - Use environment variables or a secret manager. Add a check in CI to fail on common secret patterns.

3. Scripts must be idempotent and read-only by default
   - Tools like `sync.js` should only collect metadata and write to the Brain index; they must not modify source files unless explicitly asked.

4. Network operations must be opt-in and auditable
   - Any external HTTP requests or remote actions must be clearly documented and gated behind a flag.

5. Access control and least privilege
   - Brain components should follow least-privilege principles; restrict who can trigger changes or accept automated PRs.
