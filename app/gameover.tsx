import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/game/GradientBackground";
import { PrimaryButton } from "@/components/game/PrimaryButton";
import {
  FontSizes,
  GameSpacing,
  GameTheme,
} from "@/constants/gameTheme";
import { ROLES } from "@/data/roles";
import { useGame } from "@/state/GameContext";

export default function GameOverScreen() {
  const router = useRouter();
  const { winner, players, round, reset } = useGame();

  // Out-of-band guard: if we land here without a winner, send to lobby.
  useEffect(() => {
    if (winner === null) router.replace("/");
  }, [winner, router]);

  const villagesWon = winner === "village";
  const wolves = players.filter((p) => p.role === "werewolf");
  const villagers = players.filter((p) => p.role !== "werewolf");

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View
            style={[
              styles.banner,
              {
                borderColor: villagesWon ? GameTheme.text.civilian : GameTheme.text.danger,
                backgroundColor: villagesWon
                  ? "rgba(122,226,199,0.10)"
                  : "rgba(255,122,138,0.10)",
              },
            ]}
          >
            <Text style={styles.eyebrow}>GAME OVER · SPIEL ENDE</Text>
            <Text
              style={[
                styles.winner,
                { color: villagesWon ? GameTheme.text.civilian : GameTheme.text.danger },
              ]}
            >
              {villagesWon ? "VILLAGE WINS" : "WOLVES WIN"}
            </Text>
            <Text style={styles.subtitle}>
              {villagesWon
                ? "Every wolf has been silenced."
                : "Darkness swallows the village."}
            </Text>
            <Text style={styles.round}>after round {round}</Text>
          </View>

          <View style={styles.revealBlock}>
            <Text style={styles.blockTitle}>🐺 Werewolves</Text>
            {wolves.map((p) => (
              <Text key={p.index} style={styles.revealRow}>
                {p.name} — {ROLES[p.role].name.en}
              </Text>
            ))}
          </View>
          <View style={styles.revealBlock}>
            <Text style={styles.blockTitle}>🧑‍🌾 Village</Text>
            {villagers.map((p) => (
              <Text key={p.index} style={styles.revealRow}>
                {p.name} — {ROLES[p.role].name.en} {p.alive ? "" : "(dead)"}
              </Text>
            ))}
          </View>

          <View style={styles.cta}>
            <PrimaryButton label="PLAY AGAIN · NOCHMAL" onPress={() => { reset(); router.replace("/"); }} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: GameSpacing.md,
    paddingVertical: GameSpacing.lg,
    gap: GameSpacing.md,
  },
  banner: {
    padding: GameSpacing.lg,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    gap: GameSpacing.xs,
  },
  eyebrow: {
    color: GameTheme.text.muted,
    fontSize: FontSizes.caption,
    letterSpacing: 3,
    fontWeight: "700",
  },
  winner: {
    fontSize: FontSizes.h1,
    fontWeight: "900",
    letterSpacing: 4,
  },
  subtitle: {
    color: GameTheme.text.secondary,
    fontSize: FontSizes.body,
    textAlign: "center",
  },
  round: {
    color: GameTheme.text.muted,
    fontSize: FontSizes.small,
  },
  revealBlock: {
    backgroundColor: GameTheme.card.base,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: GameTheme.card.border,
    padding: GameSpacing.md,
    gap: 4,
  },
  blockTitle: {
    color: GameTheme.text.gold,
    fontSize: FontSizes.body,
    fontWeight: "700",
    marginBottom: GameSpacing.xs,
  },
  revealRow: {
    color: GameTheme.text.primary,
    fontSize: FontSizes.body,
  },
  cta: { alignItems: "center", marginTop: GameSpacing.md },
});
