# Repo Map (template)

This file is a small, human-editable map of important parts of the repository. Keep this short and update it when modules move.

Example structure:

- `client/` — Frontend React application serving the public site and portal.
- `server/` — Backend services and APIs (Node/TypeScript).
- `migrations/` — SQL migrations and helpers.
- `scripts/` — Developer scripts for setup, local testing, tooling.
- `brain/` — Local Brain: memory, context, prompts, scripts, vision.

> Tip: Run `node brain/scripts/sync.js` from the repository root to generate a full `repo_snapshot.md` with the current file list.
