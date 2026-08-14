# Werewolf — project notes

Pass-and-play Werewolf game built on Expo SDK 54 (React Native Web for the browser build, native shell on iOS/Android).

## Web deployment to GitHub Pages

The site is served from a **subpath** (`https://<owner>.github.io/werewolves/`), not the domain root. This bites you out of the box: `experiments.basePath` in `app.json` does **not** rewrite the generated HTML's `<script src>` during `expo export` (SDK 54 limitation). Result: bundle 404s, JS never hydrates, every `Pressable` looks fine but does nothing — no `onPress` fires because no handlers are ever attached.

Symptom checklist (use to confirm this is the bug before chasing z-index or `pointerEvents`):

1. Page renders visually (HTML + CSS shipped fine).
2. Browser console shows `404` on `https://<owner>.github.io/_expo/static/js/web/entry-*.js`.
3. Fetching the same path **with** the project subpath returns 200.
4. No modal, overlay, or backdrop with non-`pointerEvents="none"` (verified — `GradientBackground` is correct).
5. All `Pressable` components (`PrimaryButton`, `Chip`, `PlayerAvatar`) are wired normally.

Fix lives in `scripts/prefix-basepath.js` (post-export script that prepends `/werewolves` to absolute-path asset URLs in every generated HTML file) plus `package.json`:

```jsonc
"build:web": "expo export --platform web --output-dir dist && node ./scripts/prefix-basepath.js",
"deploy:web": "npm run build:web && gh-pages -d dist --branch gh-pages --message 'Rebuild static export'"
```

The script is idempotent — skips URLs already prefixed. Basepath is hardcoded `/werewolves` (matches `app.json` `experiments.basePath`); override via `EXPO_BASE_PATH` env var if you fork this for a different repo name.

If you change the GitHub repo name, update **both** `app.json` (`experiments.basePath`) and `scripts/prefix-basepath.js` (default + the README/deploy URL).

## iOS Safari tap handling

RNW sets `touch-action: none` on the root, which silently swallows tap events on `Pressable` in iOS Safari. Override applied at runtime in `app/_layout.tsx` (web-only `useEffect`) — sets `touchAction: "manipulation"` on `documentElement` + `body`, plus `webkitTapHighlightColor: "transparent"` and `webkitTouchCallout: "none"`. Do **not** move this back to CSS — Tailwind removed from the project, and the JS path is the one that actually reaches iOS Safari.

## Native parity

The `_layout.tsx` effect also blocks `contextmenu` and `selectstart` globally on web to match the native feel. Side effect: if you ever add a `TextInput`, users won't be able to select inside it. Either narrow the listener to skip inputs or document this limitation in the input component when you add one.

## Build commands

- `npm run web` — local dev server
- `npm run build:web` — static export to `dist/` with basepath fix applied
- `npm run deploy:web` — build then push `dist/` to `gh-pages` branch (requires `gh-pages` CLI: `npm i -D gh-pages`)

`dist/` is gitignored by convention — never commit it; always rebuild before deploying.

## Common pitfalls

- **Buttons non-clickable on gh-pages** → see Web deployment section above. Don't waste time on overlay / z-index debugging; the JS bundle isn't loading.
- **Body `overflow: hidden` removed** from `src/global.css` in commit `7b2ae80`. Small phone landscape may scroll; intentional trade-off vs. Tailwind removal.
- **`PointerEvent` cleanup leak** in `app/_layout.tsx`: cleanup restores `root.style.touchAction` but `body.style.touchAction` keeps the modified value. Cosmetic only.