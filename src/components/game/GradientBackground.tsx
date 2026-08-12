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
 * the root backdrop on every in-game screen.
 *
 * Three layers stacked via explicit z-index:
 *   z=0  gradient + orbs  (backdrop, marked pointerEvents="none")
 *   z=1  content wrapper  (interactive children live here)
 *
 * The z-index is explicit because iOS Safari can otherwise place absolutely
 * -positioned siblings above static-positioned ones, even when the static
 * sibling comes later in DOM order. Belt-and-suspenders alongside the
 * `pointerEvents="none"` props and the `touch-action: manipulation` reset
 * in global.css.
 */
export function GradientBackground({ children, style }: Props) {
  return (
    <View style={styles.root}>
      <View pointerEvents="none" style={styles.backdrop}>
        <LinearGradient
          colors={[GameTheme.bg.top, GameTheme.bg.mid, GameTheme.bg.bottom]}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[styles.orbGold, { backgroundColor: GameTheme.accent.gold }]}
        />
        <View
          style={[styles.orbPurple, { backgroundColor: GameTheme.accent.purple }]}
        />
      </View>
      <View style={[styles.container, style]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: GameTheme.bg.bottom },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  container: { flex: 1, zIndex: 1 },
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
