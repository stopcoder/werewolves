import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { FontSizes, GameSpacing, GameTheme } from "@/constants/gameTheme";

interface Props {
  /** "day" or "night" — drives the banner's accent. */
  variant: "day" | "night";
  title: string;
  subtitle?: string;
}

/**
 * Large banner that labels the current phase of the game. Pinned to the
 * top of every phase screen so the player always knows which loop they're in.
 */
export function PhaseBanner({ variant, title, subtitle }: Props) {
  const isNight = variant === "night";
  const accent = isNight ? GameTheme.accent.night : GameTheme.accent.day;
  const label = isNight ? "NIGHT · NACHT" : "DAY · TAG";
  return (
    <View
      style={[
        styles.banner,
        {
          borderColor: isNight ? GameTheme.card.nightBorder : GameTheme.card.dayBorder,
          backgroundColor: isNight ? GameTheme.card.night : GameTheme.card.day,
        },
      ]}
    >
      <Text style={[styles.label, { color: accent }]}>{label}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingVertical: GameSpacing.md,
    paddingHorizontal: GameSpacing.lg,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
  },
  label: {
    fontSize: FontSizes.caption,
    letterSpacing: 3,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  title: {
    color: GameTheme.text.primary,
    fontSize: FontSizes.h2,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 1,
  },
  subtitle: {
    color: GameTheme.text.muted,
    fontSize: FontSizes.small,
    marginTop: 6,
    textAlign: "center",
  },
});
