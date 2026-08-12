/**
 * App-level theme tokens shared between system screens. Game-specific tokens
 * live next to them in `gameTheme.ts`.
 */
import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#FFFFFF",
    background: "#1a0b2e",
    backgroundElement: "rgba(255,255,255,0.08)",
    backgroundSelected: "rgba(255,210,122,0.18)",
    textSecondary: "#D9CFEF",
  },
  dark: {
    text: "#FFFFFF",
    background: "#0f0524",
    backgroundElement: "rgba(255,255,255,0.08)",
    backgroundSelected: "rgba(255,210,122,0.18)",
    textSecondary: "#B0A6CB",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, sans-serif",
    serif: "ui-serif, Georgia, serif",
    rounded: "ui-rounded, 'SF Pro Rounded', sans-serif",
    mono: "ui-monospace, 'JetBrains Mono', monospace",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;

export const MaxContentWidth = 800;
