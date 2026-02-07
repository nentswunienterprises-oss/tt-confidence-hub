# Memory Questions

How your system works, what it cannot do, and what rules it follows.

## Architecture

- **What is the primary purpose of this system?**
- **Who is the owner or primary maintainer of this system?**
- **What are the major backend services or components, and what do they do?**
- **What language(s) and runtime(s) power the backend?**
- **What are the critical API endpoints or entry points?**
- **What frontend interfaces consume the backend (web, mobile, CLI)?**
- **How does the frontend authenticate with the backend?**
- **What is the data storage strategy (file-based, SQL, document DB, etc.)?**
- **Where is the primary snapshot or index of current state stored?**
- **What are the security and rate-limit considerations?**
- **What integrations exist with external systems?**
- **Are there privacy or compliance requirements that affect architecture?**

## Constraints

- **What changes require explicit human approval before implementation?**
- **What data or operations are destructive and need rollback plans?**
- **What types of secrets or credentials must never be committed?**
- **How is secret management handled in this system?**
- **What scripts or tools must be idempotent (safe to run multiple times)?**
- **Are there read-only vs. write-access modes, and when is each used?**
- **What external network operations are allowed, and how are they audited?**
- **Who has access to what parts of the system, and what is the principle?**
- **What CI/CD safeguards are in place to prevent violations?**
- **Are there data retention or archival policies?**

## Conventions

- **What naming conventions are used for files and folders?**
- **What naming conventions are used for functions and classes?**
- **What is the preferred code style or linter configuration?**
- **How should code be formatted (indent size, line length, etc.)?**
- **What export patterns are preferred for different file types?**
- **Where are tests placed relative to implementation files?**
- **How should test files be named and structured?**
- **What testing framework is used, and what is the expected test coverage?**
- **How should changes be committed, and what is the commit message format?**
- **Are there pre-commit or pre-push hooks to enforce style?**
- **How should dependencies be added or updated?**
- **What logging conventions are followed?**
