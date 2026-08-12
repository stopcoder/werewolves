/**
 * Visual tokens for the in-game surfaces. Kept separate from `theme.ts` so
 * host/utility screens can sit on a calmer palette without affecting the
 * mystery atmosphere inside a round.
 */
export const GameTheme = {
  bg: {
    top: "#1a0b2e",
    mid: "#2d1b4e",
    bottom: "#0f0524",
  },
  card: {
    base: "rgba(255,255,255,0.08)",
    border: "rgba(255,215,128,0.35)",
    elevated: "rgba(255,255,255,0.14)",
    day: "rgba(122,226,199,0.10)",
    dayBorder: "rgba(122,226,199,0.45)",
    night: "rgba(138,92,255,0.12)",
    nightBorder: "rgba(138,92,255,0.50)",
  },
  text: {
    primary: "#FFFFFF",
    secondary: "#D9CFEF",
    muted: "#8A7FB0",
    gold: "#FFD27A",
    danger: "#FF7A8A",
    civilian: "#7AE2C7",
    wolf: "#FF7A8A",
    seer: "#B89CFF",
    witch: "#C8A4FF",
    hunter: "#FFD27A",
    villager: "#7AE2C7",
  },
  accent: {
    gold: "#FFD27A",
    goldDeep: "#E0A85C",
    purple: "#8A5CFF",
    purpleDeep: "#5B2EE0",
    day: "#7AE2C7",
    night: "#8A5CFF",
    danger: "#FF7A8A",
  },
  shadow: "rgba(0,0,0,0.6)",
} as const;

export const Radii = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 32,
  pill: 999,
} as const;

export const FontSizes = {
  caption: 12,
  small: 14,
  body: 16,
  lead: 18,
  h3: 22,
  h2: 28,
  h1: 36,
  display: 56,
} as const;

export const GameSpacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/**
 * Per-role accent color, mapped onto GameTheme tokens. Kept here (not in
 * roles.ts) so the data file has zero color coupling and stays portable.
 */
import type { RoleId } from "@/data/roles";
export const roleAccent = (id: RoleId): string =>
  ({
    werewolf: GameTheme.text.wolf,
    villager: GameTheme.text.villager,
    seer: GameTheme.text.seer,
    witch: GameTheme.text.witch,
    hunter: GameTheme.text.hunter,
  })[id];
