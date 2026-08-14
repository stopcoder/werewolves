# Werewolf — project notes

Pass-and-play Werewolf game built on Expo SDK 54 (React Native Web for the browser build, native shell on iOS/Android).

## Web deployment to GitHub Pages

Site lives at `https://stopcoder.github.io/werewolves/` (a subpath of the domain). The key config is **`experiments.baseUrl`** (NOT `basePath`) in `app.json`:

```jsonc
"experiments": {
  "typedRoutes": true,
  "baseUrl": "/werewolves"
}
```

With `baseUrl` set, `expo export --platform web` natively emits all `<script src>`, image URLs, and bundle-internal `require()` URIs prefixed with `/werewolves/`. No post-export patching required.

### Symptom of getting this wrong (commit `192a38e` used `basePath`)

The wrong key silently fails:

- Static export emits absolute-path asset URLs at root (`/_expo/...`) instead of subpath-prefixed.
- Bundle 404s → JS never hydrates → page renders as static HTML shell only → buttons visually present but `onPress` never fires (no event handlers attached because no React mounted).
- Once you fix the asset paths but the runtime router still doesn't know about the basePath, you get "Unmatched Route" on every page (router thinks `/werewolves/` doesn't match the root route `/`).

### Deploy flow

```bash
npm run deploy:web
```

Runs `scripts/deploy.sh`:
1. `expo export --platform web` → `dist/`
2. Copies `dist/index.html` to `dist/404.html` (SPA fallback so deep links like `/werewolves/reveal` work — GitHub Pages serves `404.html` for unknown paths, then the client router resolves).
3. `touch dist/.nojekyll` (opt out of Jekyll so `_expo/` assets aren't filtered).
4. Force-push `dist/` contents to the `gh-pages` branch.

### Reference implementation

The companion project `who-lies` (`/Users/D051016/SAPDevelop/who-lies`) uses the same pattern correctly. Its `scripts/deploy.sh` adds PWA icon generation and meta-tag injection — pull those in here if PWA support is needed later.

## iOS Safari tap handling

RNW sets `touch-action: none` on the root, which silently swallows tap events on `Pressable` in iOS Safari. Override applied at runtime in `app/_layout.tsx` (web-only `useEffect`) — sets `touchAction: "manipulation"` on `documentElement` + `body`, plus `webkitTapHighlightColor: "transparent"` and `webkitTouchCallout: "none"`. Do **not** move this back to CSS — the JS path is the one that actually reaches iOS Safari.

## Native parity

The `_layout.tsx` effect also blocks `contextmenu` and `selectstart` globally on web to match the native feel. Side effect: if you ever add a `TextInput`, users won't be able to select inside it. Either narrow the listener to skip inputs or document this limitation in the input component when you add one.

## Build commands

- `npm run web` — local dev server
- `npm run build:web` — static export to `dist/`
- `npm run deploy:web` — deploy `dist/` to `gh-pages` branch via `scripts/deploy.sh`

`dist/` is gitignored — never commit it; always rebuild before deploying.

## Common pitfalls

- **Buttons non-clickable on gh-pages** → wrong `experiments.basePath` instead of `experiments.baseUrl`. Don't waste time on overlay / z-index debugging; the JS bundle isn't loading.
- **`/werewolves/reveal` shows "Unmatched Route"** → missing `dist/404.html` copy of `index.html`. SPA fallback needed for deep links.
- **`_expo/` assets return 404** → missing `.nojekyll` file in deploy.
- **Body `overflow: hidden` removed** from `src/global.css` in commit `7b2ae80`. Small phone landscape may scroll; intentional trade-off vs. Tailwind removal.
- **`PointerEvent` cleanup leak** in `app/_layout.tsx`: cleanup restores `root.style.touchAction` but `body.style.touchAction` keeps the modified value. Cosmetic only.