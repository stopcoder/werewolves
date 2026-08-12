import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { GameTheme } from "@/constants/gameTheme";

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Full-screen purple→indigo gradient with two soft decorative orbs. Used as
 * the root backdrop on every in-game screen — matches the reference repo's
 * mystery atmosphere.
 */
export function GradientBackground({ children, style }: Props) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[GameTheme.bg.top, GameTheme.bg.mid, GameTheme.bg.bottom]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.orbGold, { backgroundColor: GameTheme.accent.gold }]} />
      <View style={[styles.orbPurple, { backgroundColor: GameTheme.accent.purple }]} />
      <View style={[styles.container, style]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: GameTheme.bg.bottom },
  container: { flex: 1 },
  orbGold: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    opacity: 0.18,
  },
  orbPurple: {
    position: "absolute",
    bottom: -120,
    left: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    opacity: 0.22,
  },
});
