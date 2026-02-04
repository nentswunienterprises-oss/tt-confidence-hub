# Urgent Security: Rotate credentials and remove sensitive data

Status: **High priority — rotate exposed credentials immediately**

Summary
- The repo contains a hard-coded Postgres connection string in a few scripts and migration files. These credentials should be considered compromised and rotated now.

Immediate steps (same day)
1. **Rotate DB/Service keys now**
   - In Supabase: rotate `postgres` password and any service role keys.
   - In hosting (Vercel/Railway): rotate API keys and env vars referencing Supabase.
   - Revoke the old keys immediately.

2. **Remove credentials from repo and history**
   - Remove credentials from working tree (commit a removal). Example: `git rm --cached path/to/file` and replace the literal with `process.env.*` references.
   - Rewrite history to remove the secrets using `git filter-repo` or BFG. Example:
     - Using git-filter-repo (recommended):
       `git clone --mirror <repo> repo-mirror.git`
       `cd repo-mirror.git`
       `git filter-repo --replace-text ../passwords.txt`
       `git push --force --all`
     - Or BFG: `bfg --replace-text passwords.txt repo.git`
   - NOTE: history rewrite requires coordination with team and CI; communicate before pushing rewritten history.

3. **Add secret scanning to CI**
   - Add `gitleaks` to run on push/PR (a workflow is added in `.github/workflows/gitleaks.yml`).

4. **Check and update all deployments and third-party integrations**
   - Ensure new keys are updated in Vercel, Railway, Supabase, and any other services.

5. **Audit for further leaks**
   - Run `gitleaks` locally and review all matches. Search for `postgresql://`, `SUPABASE_SERVICE_ROLE_KEY`, and other tokens.

6. **Post-rotation verification**
   - Validate deployments (staging first), confirm apps can connect with rotated creds.
   - Run smoke tests for auth and critical endpoints.

Longer-term (this sprint)
- Add automated secret scanning to PR checks and pre-commit hooks.
- Avoid committing any environment files; use env var stores in the platform.
- Create a runbook for secret rotation and CI workflow for secret detection.

If you want, I can:
- Prepare the PR to add secret scanning and the `.gitignore` updates (done on the cleanup branch).
- Prepare a BFG/git-filter-repo job (script) to remove the exact known secret strings and provide the commands to rotate.

