# Brain Conventions

These conventions help the Brain produce consistent and predictable outputs.

- File naming: use kebab-case for files and folders (e.g., `repo-map.md`, `sync.js`).
- Code style: use the repository's existing style (prefer ESLint/Prettier defaults); keep changes small and focused.
- Function naming: use camelCase for functions and PascalCase for classes.
- Exports: prefer named exports for libraries; default exports are acceptable for single-component files only.
- Tests: place tests beside implementation in `__tests__` or `*.test.js/ts` files and include quick verification steps.
