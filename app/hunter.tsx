import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/game/GradientBackground";
import { PhaseBanner } from "@/components/game/PhaseBanner";
import { PlayerAvatar } from "@/components/game/PlayerAvatar";
import { PrimaryButton } from "@/components/game/PrimaryButton";
import {
  FontSizes,
  GameSpacing,
  GameTheme,
} from "@/constants/gameTheme";
import { useGame } from "@/state/GameContext";

/**
 * The Hunter's revenge. When a hunter dies (by day vote or night), they get
 * one last pick: any still-alive player joins them in death.
 */
export default function HunterScreen() {
  const router = useRouter();
  const {
    hunterToAct,
    players,
    submitHunterPick,
  } = useGame();
  const [target, setTarget] = React.useState<number | null>(null);

  useEffect(() => {
    if (hunterToAct === null) {
      // Out-of-band resolution — go to the announcement screen.
      router.replace("/announce");
    }
  }, [hunterToAct, router]);

  if (hunterToAct === null) return null;

  const hunter = players[hunterToAct];
  const choices = players.filter((p) => p.alive);

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <PhaseBanner
            variant="night"
            title="Hunter's revenge"
            subtitle={`${hunter?.name ?? "Hunter"}, take one with you.`}
          />

          <View style={styles.hunterCard}>
            <Text style={styles.eyebrow}>FINAL SHOT · LETZTER SCHUSS</Text>
            <Text style={styles.body}>
              Choose a living player. They fall with you.
            </Text>
          </View>

          <View style={styles.grid}>
            {choices.map((p) => (
              <PlayerAvatar
                key={p.index}
                name={p.name}
                alive
                selected={target === p.index}
                onPress={() => setTarget(p.index)}
                style={styles.avatar}
                marker="TAKE"
                tone="danger"
              />
            ))}
          </View>

          <View style={styles.cta}>
            <PrimaryButton
              label="FIRE · SCHIESSEN"
              variant="danger"
              disabled={target === null}
              onPress={() => {
                if (target === null) return;
                submitHunterPick(target);
                setTarget(null);
                router.replace("/announce");
              }}
            />
            <PrimaryButton
              label="SPARE · VERSCHONEN"
              variant="ghost"
              onPress={() => {
                setTarget(null);
                // Submitting "no target" by passing the hunter's own index is
                // a no-op for the death list — easier than splitting the
                // contract. Here we just route onward.
                router.replace("/announce");
              }}
            />
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
  hunterCard: {
    backgroundColor: GameTheme.card.night,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: GameTheme.card.nightBorder,
    padding: GameSpacing.md,
    gap: GameSpacing.xs,
  },
  eyebrow: {
    color: GameTheme.text.danger,
    fontSize: FontSizes.caption,
    letterSpacing: 3,
    fontWeight: "700",
  },
  body: {
    color: GameTheme.text.primary,
    fontSize: FontSizes.body,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: GameSpacing.sm,
    paddingVertical: GameSpacing.sm,
  },
  avatar: { minWidth: 96 },
  cta: { alignItems: "center", gap: GameSpacing.sm, marginTop: GameSpacing.md },
});
