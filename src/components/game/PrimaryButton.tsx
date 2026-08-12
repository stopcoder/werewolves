import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { FontSizes, GameTheme, Radii } from "@/constants/gameTheme";

interface Props {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: "primary" | "ghost" | "danger" | "night";
  style?: ViewStyle;
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  variant = "primary",
  style,
}: Props) {
  const isPrimary = variant === "primary";
  const isDanger = variant === "danger";
  const isNight = variant === "night";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.wrapper,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {isPrimary ? (
        <LinearGradient
          colors={[GameTheme.accent.gold, GameTheme.accent.goldDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fill}
        >
          <Text style={[styles.label, styles.labelDark]}>{label}</Text>
        </LinearGradient>
      ) : isNight ? (
        <LinearGradient
          colors={[GameTheme.accent.purple, GameTheme.accent.purpleDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fill}
        >
          <Text style={[styles.label, styles.labelLight]}>{label}</Text>
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.fill,
            styles.ghost,
            isDanger && styles.danger,
          ]}
        >
          <Text
            style={[
              styles.label,
              isDanger ? styles.labelDanger : styles.labelLight,
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: Radii.pill,
    overflow: "hidden",
    shadowColor: GameTheme.accent.gold,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  pressed: { transform: [{ scale: 0.97 }], opacity: 0.92 },
  disabled: { opacity: 0.4 },
  fill: {
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: Radii.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  ghost: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  danger: {
    backgroundColor: "rgba(255,122,138,0.12)",
    borderColor: "rgba(255,122,138,0.4)",
  },
  label: {
    fontSize: FontSizes.lead,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  labelDark: { color: "#1a0b2e" },
  labelLight: { color: GameTheme.text.primary },
  labelDanger: { color: GameTheme.text.danger },
});
