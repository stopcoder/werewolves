import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { FontSizes, GameSpacing, GameTheme, Radii } from "@/constants/gameTheme";

interface Props {
  name: string;
  alive: boolean;
  selected?: boolean;
  disabled?: boolean;
  /** Optional accent (e.g. dead-state danger color). */
  tone?: "default" | "danger" | "muted";
  onPress?: () => void;
  style?: ViewStyle;
  /** Show a small "you" badge on the corner — used by voter screens. */
  marker?: string;
}

/**
 * Single tappable player chip used by voting, wolf/seer/witch pickers, and
 * the role-reveal seat list.
 */
export function PlayerAvatar({
  name,
  alive,
  selected,
  disabled,
  tone = "default",
  onPress,
  style,
  marker,
}: Props) {
  const accent =
    tone === "danger"
      ? GameTheme.text.danger
      : tone === "muted"
        ? GameTheme.text.muted
        : GameTheme.text.gold;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      style={({ pressed }) => [
        styles.chip,
        !alive && styles.dead,
        selected && styles.selected,
        pressed && !disabled && { opacity: 0.85 },
        style,
      ]}
    >
      <Text
        style={[
          styles.name,
          !alive && styles.deadText,
          selected && { color: GameTheme.text.primary },
        ]}
      >
        {name}
      </Text>
      {!alive ? (
        <Text style={[styles.status, { color: GameTheme.text.danger }]}>DEAD</Text>
      ) : null}
      {marker ? <Text style={[styles.marker, { color: accent }]}>{marker}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minWidth: 84,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: Radii.md,
    backgroundColor: GameTheme.card.base,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  selected: {
    backgroundColor: "rgba(255,210,122,0.18)",
    borderColor: GameTheme.accent.gold,
  },
  dead: {
    opacity: 0.4,
    borderStyle: "dashed",
  },
  name: {
    color: GameTheme.text.primary,
    fontSize: FontSizes.body,
    fontWeight: "700",
    letterSpacing: 1,
  },
  deadText: {
    textDecorationLine: "line-through",
    color: GameTheme.text.muted,
  },
  status: {
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "700",
  },
  marker: {
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "700",
  },
});
