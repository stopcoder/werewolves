import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { FontSizes, GameTheme, Radii } from "@/constants/gameTheme";

interface ChipProps {
  label: string;
  sublabel?: string;
  active?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

/** Square chip used by the lobby for player-count and composition picks. */
export function Chip({
  label,
  sublabel,
  active,
  disabled,
  onPress,
  style,
}: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.chip,
        active && styles.chipActive,
        pressed && !disabled && { opacity: 0.85 },
        disabled && styles.chipDisabled,
        style,
      ]}
    >
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
      {sublabel ? (
        <Text style={[styles.sub, active && styles.subActive]}>{sublabel}</Text>
      ) : null}
    </Pressable>
  );
}

interface RowProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function ChipRow({ children, style }: RowProps) {
  return <View style={[styles.row, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    minWidth: 44,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radii.sm,
    backgroundColor: GameTheme.card.base,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: {
    backgroundColor: "rgba(255,210,122,0.18)",
    borderColor: GameTheme.accent.gold,
  },
  chipDisabled: { opacity: 0.3 },
  label: {
    color: GameTheme.text.secondary,
    fontSize: FontSizes.body,
    fontWeight: "600",
  },
  labelActive: { color: GameTheme.text.gold },
  sub: {
    color: GameTheme.text.muted,
    fontSize: 10,
    marginTop: 1,
  },
  subActive: { color: GameTheme.text.secondary },
});
