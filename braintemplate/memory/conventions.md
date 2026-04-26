# Brain Memory -Conventions

Answer these questions to document the coding and operational standards your team follows.

## 1. Code Style & Formatting

- **What language(s) are used in this project?**
- **What linter(s) are configured?** (ESLint, Prettier, Ruff, etc.)
- **What formatter is standard?**
- **Are there style guide documents?** (link them)
- **What line length is preferred?**
- **How are imports organized?**
- **What naming conventions are used for files, folders, functions, variables, classes?**

## 2. File Organization

- **How are files and folders named?** (kebab-case, camelCase, PascalCase)
- **How is the source code organized?** (by feature, by layer, by domain, etc.)
- **Where do tests go?** (`__tests__` folder, `.test.js` suffix, etc.)
- **Where do configuration files go?**
- **Are there conventions for documentation files?**

## 3. Naming Conventions

- **Files:** kebab-case or camelCase or other?
- **Folders:** kebab-case or camelCase or other?
- **Functions/Methods:** camelCase or snake_case or other?
- **Classes:** PascalCase or other?
- **Constants:** UPPER_CASE or other?
- **Variables:** what naming pattern?
- **Database tables/columns:** what naming pattern?
- **API endpoints:** what naming pattern?**API fields/JSON keys:** camelCase, snake_case, or kebab-case?

## 4. Module & Export Patterns

- **Are named exports or default exports preferred?**
- **How are modules organized?** (single responsibility, barrel exports, etc.)
- **Are there circular dependency rules?**
- **How are shared utilities structured?**

## 5. Testing Conventions

- **Where are unit tests placed?**
- **Where are integration tests placed?**
- **Where are e2e tests placed?**
- **What test framework(s) are used?**
- **What assertion library(ies) are used?**
- **How are tests named?** (describe/it, test, it('should...'), etc.)
- **What is the test coverage target?**
- **Are there fixtures or test data conventions?**

## 6. Git & Version Control

- **What branch naming convention?** (feature/xyz, bugfix/xyz, etc.)
- **What commit message format?** (conventional commits, semantic, etc.)
- **Is there a PR template?**
- **What is the review process?** (who must approve, how many)
- **Are rebases or merge commits preferred?**
- **How are release branches handled?**
- **What tagging convention for releases?**

## 7. Documentation

- **Where is documentation stored?** (README, wiki, docs/ folder, etc.)
- **What should be documented?** (architecture, APIs, setup, etc.)
- **What format?** (Markdown, AsciiDoc, HTML, etc.)
- **How are docs kept in sync with code?**
- **Are there inline comments expected?**
- **What about API documentation?** (auto-generated, hand-written, etc.)
- **How are changelogs maintained?**

## 8. Error Handling

- **How are errors logged?**
- **What log levels are used?** (debug, info, warn, error, etc.)
- **How are error messages formatted?**
- **What stack traces are exposed?** (production vs. dev)
- **How are errors reported?** (Sentry, logging service, etc.)

## 9. Build & Compilation

- **What build tool(s)? (Webpack, Vite, esbuild, Babel, etc.)**
- **What compiler settings are standard?**
- **Are there build scripts?** (npm/yarn scripts, Makefile, etc.)
- **How are build artifacts managed?**
- **What is the build output structure?**

## 10. Environment & Configuration

- **How is environment configuration managed?** (.env files, environment variables, config files)
- **What environment variables are required?**
- **Are there example .env files?**
- **How are secrets different from config?**
- **Are there different configs for dev, staging, production?**

## 11. Dependency Management

- **What package manager?** (npm, yarn, pnpm, pip, etc.)
- **Are there version pinning rules?**
- **How are dependency updates handled?**
- **Are there approved vs. unapproved packages?**
- **How are transitive dependencies managed?**
- **What is the policy on major version bumps?**

## 12. Deprecation & Cleanup

- **How are features marked as deprecated?**
- **What is the deprecation timeline?**
- **How are breaking changes communicated?**
- **How are old code patterns cleaned up?**
- **Are there rules about removing code?**

## 13. Performance Standards

- **What are performance targets?** (bundle size, load time, API latency, etc.)
- **How are performance regressions caught?**
- **Are there optimization patterns that should be followed?**
- **How is performance monitored?**

## 14. Security Practices

- **How are security issues reported?**
- **Are there security reviews for sensitive code?**
- **What encryption standards are used?**
- **How are dependencies scanned for vulnerabilities?**
- **What is the security incident response process?**
