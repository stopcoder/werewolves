#!/usr/bin/env node
/**
 * Reset the project by moving src/app and src/components back to a starter state.
 * Mirrors the Expo template reset-project behavior.
 */
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const srcDir = path.join(root, 'src');
const appDir = path.join(srcDir, 'app');
const compDir = path.join(srcDir, 'components');

const placeholderApp = `export default function Index() { return null; }
`;
const placeholderComp = `export function Placeholder() { return null; }
`;

if (fs.existsSync(appDir)) {
  fs.rmSync(appDir, { recursive: true, force: true });
}
fs.mkdirSync(appDir, { recursive: true });
fs.writeFileSync(path.join(appDir, 'index.tsx'), placeholderApp);

if (fs.existsSync(compDir)) {
  fs.rmSync(compDir, { recursive: true, force: true });
}
fs.mkdirSync(compDir, { recursive: true });
fs.writeFileSync(path.join(compDir, 'Placeholder.tsx'), placeholderComp);

console.log('Project reset to a blank slate.');
