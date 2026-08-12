import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { FontSizes, GameSpacing, GameTheme } from "@/constants/gameTheme";

interface Props {
  title: string;
  subtitle?: string;
  /** A small round counter, e.g. "2 / 7". */
  counter?: string;
  style?: ViewStyle;
}

/** Compact header used by the per-player walkthrough screens. */
export function ScreenHeader({ title, subtitle, counter, style }: Props) {
  return (
    <View style={[styles.row, style]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {counter ? (
        <View style={styles.counter}>
          <Text style={styles.counterText}>{counter}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: GameSpacing.sm,
  },
  title: {
    color: GameTheme.text.primary,
    fontSize: FontSizes.h3,
    fontWeight: "800",
    letterSpacing: 1,
  },
  subtitle: {
    color: GameTheme.text.muted,
    fontSize: FontSizes.small,
    marginTop: 2,
  },
  counter: {
    minWidth: 56,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: GameTheme.card.elevated,
    borderWidth: 1,
    borderColor: GameTheme.card.border,
    alignItems: "center",
  },
  counterText: {
    color: GameTheme.text.gold,
    fontWeight: "700",
    letterSpacing: 1,
  },
});
