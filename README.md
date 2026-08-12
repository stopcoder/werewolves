# Werewolf · Werwolf

A pass-and-play party game for the classic social-deduction game **Werewolf**.
Single device, no networking — the phone is passed between players for role
reveal, night actions, and votes. Built with Expo SDK 54 + Expo Router + React
Native + TypeScript.

## Play

```bash
npm install --legacy-peer-deps
npm run web        # local dev at http://localhost:19006
```

For production:

```bash
npx expo export -p web      # builds static bundle to dist/
```

Then serve `dist/` from any static host (GitHub Pages, Netlify, etc.).

## Roles

| Role       | Team    | Power                                       |
|------------|---------|---------------------------------------------|
| Werewolf   | Wolves  | Each night, devour one villager.            |
| Villager   | Village | Vote and voice.                             |
| Seer       | Village | Each night, inspect one soul.               |
| Witch      | Village | Antidote (save) once, poison (kill) once.   |
| Hunter     | Village | On death, take one player down with you.    |

Composition auto-balances for 5–10 players. Wolves target ≈ ⅓ of the table.

## Phase flow

```
lobby → reveal → day → vote → resolveDay
                              ↓
                            nightIntro → nightWolves → nightSeer
                                                       → nightWitch → resolveNight
                                                                          ↓
                                                                  (day or gameover)
```

Each night step is auto-skipped if its actor role is dead (no living wolves →
no wolf pick, etc.).

## Architecture

```
app/                    Expo Router file-based routes
  _layout.tsx           Root layout (GameProvider, Stack)
  index.tsx             Lobby (player count, timer)
  reveal.tsx            Per-player role reveal (pass-the-phone)
  day.tsx               Day phase (discussion timer)
  vote.tsx              Day vote (walk-through each voter)
  announce.tsx          Death announcement (handles both day & night)
  night.tsx             Night orchestrator (wolves → seer → witch)
  hunter.tsx            Hunter's revenge pick
  gameover.tsx          Final winner + role reveal

src/
  state/GameContext.tsx State machine (single source of truth)
  data/roles.ts         Role definitions + composition tables
  constants/            Theme tokens (gameTheme + system theme)
  components/game/      GradientBackground, PrimaryButton, Chip,
                        PhaseBanner, PlayerAvatar, RoleCard, ScreenHeader
  hooks/                use-color-scheme (native + web split)
  global.css            Web-only resets
```

## Tech

- Expo SDK 54, Expo Router 6 (file-based routing)
- React 19.1, React Native 0.81, React Native Web 0.21
- TypeScript 5.9 (strict)
- expo-linear-gradient, expo-image, expo-glass-effect

## License

MIT — see [LICENSE](./LICENSE).
