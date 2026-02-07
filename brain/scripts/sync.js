#!/usr/bin/env node
/*
  sync.js - generate a markdown snapshot of repository files.

  Usage: run `node brain/scripts/sync.js` from the repository root.
  This script is intentionally read-only and will NOT modify any source files.
*/

import fs from 'fs/promises';
import path from 'path';


const repoRoot = process.cwd(); // Expect to be run from repo root
const outputPath = path.join(repoRoot, 'brain', 'index', 'repo_snapshot.md');
const EXCLUDE_DIRS = new Set(['node_modules', '.git', 'brain']);

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results = [];

  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    const rel = path.relative(repoRoot, full);

    // Skip excluded directories at top-level or nested
    const parts = rel.split(path.sep);
    if (parts.some(p => EXCLUDE_DIRS.has(p))) {
      continue;
    }

    if (ent.isDirectory()) {
      const sub = await walk(full);
      results.push(...sub);
    } else if (ent.isFile()) {
      try {
        const stat = await fs.stat(full);
        results.push({ path: rel.replace(/\\/g, '/'), size: stat.size, mtime: stat.mtime.toISOString() });
      } catch (err) {
        // Ignore files that can't be stat'd
      }
    }
  }

  return results;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

async function main() {
  console.log('Scanning repository (this is read-only)...');
  const files = await walk(repoRoot);
  files.sort((a, b) => a.path.localeCompare(b.path));

  const lines = [];
  lines.push('# Repository Snapshot');
  lines.push('');
  lines.push(`_Generated: ${new Date().toISOString()}_`);
  lines.push('');
  lines.push('| Path | Size | Modified |');
  lines.push('|---|---:|---|');

  for (const f of files) {
    // Use string concatenation to avoid nested template literal escaping issues
    lines.push('| `' + f.path + '` | ' + formatBytes(f.size) + ' | ' + f.mtime + ' |');
  }

  lines.push('');
  lines.push('> Notes: This snapshot excludes `node_modules`, `.git`, and the Brain directory to avoid recursion.');

  // Ensure output directory exists
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  // Write snapshot file
  await fs.writeFile(outputPath, lines.join('\n'), 'utf8');
  console.log(`Wrote snapshot to ${outputPath}`);
}

main().catch(err => {
  console.error('Error generating snapshot:', err);
  process.exitCode = 1;
});
