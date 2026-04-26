# Brain Memory -Constraints

Answer these questions to document the hard rules and constraints that must be enforced during development and automation.

## 1. Code Changes

- **What types of changes require explicit human approval before execution?**
- **Are there files or directories that should never be modified automatically?**
- **What refactorings are off-limits without discussion?**
- **Are there breaking changes that need special handling?**

## 2. Data Integrity & Safety

- **What data must never be deleted or modified without a signed approval process?**
- **Are there migrations that require rollback paths?**
- **What data operations require backups before execution?**
- **Are there audit logs or compliance requirements?**

## 3. Production & Deployment

- **What changes cannot be deployed without testing?**
- **Are there deployments that require manual steps or approval?**
- **What is the minimum notice period for breaking changes?**
- **Are there blackout windows when deployments are forbidden?**

## 4. Secrets & Credentials

- **What secrets must never be committed to the repository?**
- **How are secrets distributed?** (environment variables, secret manager, SSH keys, etc.)
- **How are secrets rotated?**
- **What CI checks exist to prevent secret leaks?**
- **Who has access to production secrets?**

## 5. Script & Automation Safety

- **What scripts are read-only and cannot modify source files?**
- **What automation must be idempotent?**
- **Are there destructive operations that require confirmation?**
- **How are rollbacks handled?**
- **What logging is required for automated changes?**

## 6. Network & External Calls

- **What external HTTP requests or API calls are allowed?**
- **Are there rate limits or quotas that must be respected?**
- **What retries or timeouts are configured?**
- **Are all external calls logged and auditable?**
- **What happens if an external service is unreachable?**

## 7. Access Control & Least Privilege

- **Who can trigger changes?** (developers, CI/CD, operations, etc.)
- **Who can approve changes?**
- **Are there role-based access controls?**
- **What actions require multi-person approval?**
- **How are access rights revoked?**

## 8. Environment Isolation

- **Can development/staging changes affect production?**
- **Are there isolated test environments?**
- **How is data from production protected from leaking into lower environments?**
- **Are there namespace or network policies isolating environments?**

## 9. Third‑Party Dependencies

- **Can new dependencies be added without review?**
- **Are there prohibited dependencies?**
- **What license types are acceptable?**
- **How are dependency updates tested?**
- **What is the process for removing dependencies?**

## 10. Performance & Cost Constraints

- **Are there SLAs that cannot be violated?**
- **What performance targets are mandatory?**
- **Are there cost limits or budgets?**
- **What resource quotas exist?**
- **How are over-quota situations handled?**

## 11. Compliance & Legal

- **Are there regulatory requirements?** (GDPR, HIPAA, SOC 2, etc.)
- **What data residency requirements exist?**
- **Are there encryption mandates?**
- **What audit trails must be maintained?**
- **How are compliance violations detected and reported?**
