#!/usr/bin/env node
/**
 * Post-export step: prepend the configured basePath to absolute-path asset
 * URLs in the generated static HTML. Expo SDK 54's `experiments.basePath`
 * does NOT propagate to script src in `expo export` output (known issue),
 * so we patch it here.
 *
 * Idempotent — safe to run multiple times.
 */
const fs = require("fs");
const path = require("path");

const basePath = process.env.EXPO_BASE_PATH || "/werewolves";
const distDir = path.join(process.cwd(), "dist");

if (!fs.existsSync(distDir)) {
  console.error(`[prefix-basepath] dist/ not found at ${distDir}`);
  process.exit(1);
}

const htmlFiles = fs
  .readdirSync(distDir)
  .filter((f) => f.endsWith(".html"));

// Match attribute values that start with "/" but are NOT "/" alone and
// don't already begin with the basePath. Skips things like `href="/"` or
// JSON-like fragments. Targets src + href attributes specifically.
const assetRe = new RegExp(
  `((?:src|href))="(/(?!${escapeRe(basePath)}|/)[^"]+)"`,
  "g"
);

let totalPatched = 0;
for (const file of htmlFiles) {
  const filePath = path.join(distDir, file);
  const original = fs.readFileSync(filePath, "utf8");
  const patched = original.replace(assetRe, (_, attr, url) => {
    return `${attr}="${basePath}${url}"`;
  });
  if (patched !== original) {
    fs.writeFileSync(filePath, patched, "utf8");
    totalPatched += 1;
  }
}

console.log(
  `[prefix-basepath] prefixed ${totalPatched}/${htmlFiles.length} html file(s) with ${basePath}`
);

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}