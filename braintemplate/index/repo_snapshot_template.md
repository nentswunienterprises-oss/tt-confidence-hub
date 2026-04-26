# Brain Index -Repository Snapshot & Mapping

Use these questions to generate and maintain a quick reference of your repository structure and contents.

## 1. Repository Map (High-Level)

- **What are the top-level directories and their purposes?**
  - e.g., `client/` = frontend code, `server/` = backend, `tests/` = test suite
- **Where is the main application entry point?**
- **Where are configuration files stored?**
- **Where is documentation located?**
- **Where are build artifacts or generated files stored?**

## 2. Key Files & Locations

- **Where is package.json or equivalent?**
- **Where is the tsconfig.json or build config?**
- **Where are environment variable examples (.env.example)?**
- **Where is the CI/CD configuration?** (`.github/workflows/`, `.gitlab-ci.yml`, etc.)
- **Where are Dockerfiles or deployment configs?**
- **Where are database migrations?**
- **Where is the main README?**

## 3. Source Code Breakdown

- **How many files are in the codebase?** (roughly)
- **What is the main language(s)?**
- **What is the total codebase size?**
- **Which directories have the most code?**
- **Which directories are least maintained?**
- **What percentage is test code vs. application code?**

## 4. Dependencies & Imports

- **What are the critical dependencies?** (most-used packages)
- **What are the heaviest dependencies?** (by bundle size)
- **Are there circular dependencies?**
- **What internal modules are most depended on?**
- **What external APIs or services are integrated?**

## 5. Configuration & Environment

- **What environment variables are required?**
- **Where is each environment configured?** (dev, staging, prod)
- **What secrets are needed?** (don't list the values, just the names)
- **What configuration files exist?** (and what do they do)
- **How is feature flagging done?** (if at all)

## 6. Asset & Resource Inventory

- **Where are images, fonts, and static assets?**
- **What is the total size of assets?**
- **Are there CDN-hosted resources?**
- **What media formats are used?**
- **Are there icons, logos, or branding assets?**

## 7. Test Coverage

- **Where are unit tests?**
- **Where are integration tests?**
- **Where are e2e tests?**
- **How many test files exist?**
- **What is the test coverage?** (percentage)
- **Are there flaky or skipped tests?**

## 8. Documentation Files

- **What documentation exists?** (list .md files and their purposes)
- **Are there architecture decision records (ADRs)?**
- **Are there design docs or proposals?**
- **Is there API documentation?**
- **Is there a changelog or release notes?**

## 9. Size & Performance Metrics

- **Total lines of code?** (roughly)
- **Bundle size (if applicable)?**
- **Build time?**
- **Test suite runtime?**
- **Database size (if applicable)?**
- **Memory/CPU usage under load?**

## 10. Snapshot Generation

- **When was the last snapshot taken?**
- **What tool generates the snapshot?** (provide script name or command)
- **What does the snapshot capture?** (files, sizes, modification dates, etc.)
- **How often should snapshots be regenerated?**
- **Who has access to the snapshot?**

---

## How to Generate a Repository Snapshot

Run this command periodically to capture the state of your repository:

```bash
# Example: Node.js/JavaScript project
find . -type f ! -path '*/\.*' ! -path '*/node_modules/*' ! -path '*/dist/*' \
  -exec ls -lh {} \; | awk '{print $9, $5, $6, $7, $8}' | sort > repo_snapshot.md

# Or use a custom script if your project has one
npm run snapshot
# or
yarn snapshot
```

Store the output in `brain/index/repo_snapshot.md` and commit it periodically.

