import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SITE_ORIGIN, sitemapPaths } from "../client/src/lib/publicSeo";

function renderUrl(pathname: string) {
  return `  <url>\n    <loc>${SITE_ORIGIN}${pathname}</loc>\n  </url>`;
}

async function main() {
  const scriptPath = fileURLToPath(import.meta.url);
  const rootDir = path.resolve(path.dirname(scriptPath), "..");
  const publicDir = path.join(rootDir, "client", "public");
  const outputPath = path.join(publicDir, "sitemap.xml");
  const orderedPaths = [...new Set(sitemapPaths)];
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...orderedPaths.map(renderUrl),
    "</urlset>",
    "",
  ].join("\n");

  await mkdir(publicDir, { recursive: true });
  await writeFile(outputPath, xml, "utf8");
  console.log(`Generated ${path.relative(rootDir, outputPath)}`);
}

main().catch((error) => {
  console.error("Failed to generate sitemap.");
  console.error(error);
  process.exitCode = 1;
});
