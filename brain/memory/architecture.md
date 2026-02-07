# Brain Architecture (template)

> High-level architecture notes for the local Brain system. Replace placeholders with concrete details.

## Overview
- Purpose: Provide situational awareness to ChatGPT and generate precise implementation instructions for VS Code Copilot.
- Owner: @replace-with-owner
- Last updated: YYYY-MM-DD

## Backend
- Services: (e.g., sync service, memory store API, task queue)
- Language/runtime: (e.g., Node.js 18+, TypeScript)
- Key endpoints: /sync, /memory/query, /tasks
- Add notes about safety, rate limits, and access controls.

## Frontend
- Interfaces that consume Brain outputs (e.g., VS Code extension, admin UI)
- Authentication: tokens or SSH keyed access

## Database / Storage
- Memory store: file-based (markdown), sqlite, or document DB
- Snapshot location: `brain/index/repo_snapshot.md`

## Authentication
- How the Brain authenticates callers (local-only, API keys, ephemeral tokens)
- Secrets storage: DO NOT store secrets in repo; use OS-level env or secret managers

## Notes
- Keep the Brain minimal and auditable.
- Prefer append-only logs for critical operations.
- List integration and privacy considerations here.
