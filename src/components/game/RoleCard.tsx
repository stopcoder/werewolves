import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { FontSizes, GameSpacing, GameTheme, Radii, roleAccent } from "@/constants/gameTheme";
import { ROLES, RoleId } from "@/data/roles";

interface Props {
  role: RoleId;
  /** Show only the glyph + name (used on the night-step picker). */
  compact?: boolean;
  /** Show the "your role" framing on the reveal screen. */
  reveal?: boolean;
  style?: ViewStyle;
}

/**
 * Visual card that surfaces a single role. The reveal screen uses the full
 * variant; the night-step picker uses compact.
 */
export function RoleCard({ role, compact, reveal, style }: Props) {
  const def = ROLES[role];
  const accent = roleAccent(role);
  return (
    <View
      style={[
        styles.card,
        {
          borderColor: `${accent}88`,
          backgroundColor: `${accent}14`,
        },
        style,
      ]}
    >
      <Text style={styles.glyph}>{def.glyph}</Text>
      <Text style={[styles.name, { color: accent }]}>{def.name.en}</Text>
      {!compact ? (
        <>
          <Text style={styles.nameDe}>{def.name.de}</Text>
          <Text style={styles.flavor}>{def.flavor.en}</Text>
          <Text style={styles.power}>
            <Text style={{ color: GameTheme.text.gold }}>Power · </Text>
            {def.power.en}
          </Text>
        </>
      ) : null}
      {reveal ? (
        <Text style={styles.revealHint}>Memorize this. Pass the phone when ready.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radii.lg,
    paddingVertical: GameSpacing.lg,
    paddingHorizontal: GameSpacing.lg,
    alignItems: "center",
    gap: GameSpacing.xs,
  },
  glyph: { fontSize: 72, marginBottom: GameSpacing.xs },
  name: {
    fontSize: FontSizes.h2,
    fontWeight: "800",
    letterSpacing: 1,
  },
  nameDe: {
    color: GameTheme.text.muted,
    fontSize: FontSizes.body,
    letterSpacing: 1,
    marginTop: -4,
  },
  flavor: {
    color: GameTheme.text.secondary,
    fontSize: FontSizes.small,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: GameSpacing.xs,
  },
  power: {
    color: GameTheme.text.primary,
    fontSize: FontSizes.small,
    textAlign: "center",
    marginTop: GameSpacing.xs,
  },
  revealHint: {
    color: GameTheme.text.muted,
    fontSize: FontSizes.caption,
    marginTop: GameSpacing.md,
    letterSpacing: 1,
    textAlign: "center",
  },
});
