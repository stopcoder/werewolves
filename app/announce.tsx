import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/game/GradientBackground";
import { PhaseBanner } from "@/components/game/PhaseBanner";
import { PrimaryButton } from "@/components/game/PrimaryButton";
import {
  FontSizes,
  GameSpacing,
  GameTheme,
} from "@/constants/gameTheme";
import { ROLES } from "@/data/roles";
import { useGame } from "@/state/GameContext";

/**
 * Shared resolution screen — used for both day-elimination results and
 * night-deaths results. We branch on phase to label the banner correctly.
 */
export default function AnnounceScreen() {
  const router = useRouter();
  const {
    phase,
    round,
    pendingDeaths,
    players,
    nightActions,
    proceed,
  } = useGame();

  // After a hunter's revenge, we route through /hunter and then back here.
  // If state has moved on (e.g. via the hunter pickup auto-routing), we
  // forward to the right place instead of rendering stale deaths.
  useEffect(() => {
    if (phase === "hunterPick") {
      router.replace("/hunter");
    } else if (phase === "nightIntro" || phase === "nightWolves" || phase === "nightSeer" || phase === "nightWitch") {
      router.replace("/night");
    } else if (phase === "day") {
      router.replace("/day");
    } else if (phase === "gameover") {
      router.replace("/gameover");
    }
    // We intentionally do not include router in deps — only phase changes
    // should trigger re-routing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const variant = phase === "resolveNight" ? "night" : "day";
  const title = phase === "resolveNight" ? `Night ${round} ends` : `Day ${round} verdict`;
  const subtitle =
    phase === "resolveNight"
      ? "Dawn breaks. See who survived."
      : "The village has spoken.";

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <PhaseBanner variant={variant} title={title} subtitle={subtitle} />

          {pendingDeaths.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.cardEyebrow}>No one died</Text>
              <Text style={styles.cardTitle}>A quiet round.</Text>
              {phase === "resolveNight" && nightActions.witchSaved ? (
                <Text style={styles.cardBody}>
                  The Witch's antidote found its mark.
                </Text>
              ) : (
                <Text style={styles.cardBody}>
                  The village — or the night — passed without blood.
                </Text>
              )}
            </View>
          ) : (
            pendingDeaths.map((d) => {
              const p = players[d.index];
              if (!p) return null;
              const causeLabel = {
                wolves: "Devoured by wolves",
                vote: "Executed by vote",
                witch: "Witch's poison",
                hunter: "Hunter's revenge",
              }[d.cause];
              return (
                <View key={d.index} style={styles.card}>
                  <Text style={styles.cardEyebrow}>{causeLabel}</Text>
                  <Text style={styles.cardTitle}>{p.name}</Text>
                  <Text style={styles.cardBody}>
                    was {ROLES[p.role].name.en} · {ROLES[p.role].name.de}
                  </Text>
                </View>
              );
            })
          )}

          <View style={styles.cta}>
            <PrimaryButton
              label="CONTINUE · WEITER"
              onPress={() => {
                proceed();
                // After proceed, phase will be one of: nightIntro, day, or
                // gameover. Route accordingly.
                if (phase === "resolveDay") router.replace("/night");
                else router.replace("/day");
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
  card: {
    backgroundColor: GameTheme.card.base,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: GameTheme.card.border,
    padding: GameSpacing.md,
    gap: GameSpacing.xs,
  },
  cardEyebrow: {
    color: GameTheme.text.danger,
    fontSize: FontSizes.caption,
    letterSpacing: 2,
    fontWeight: "700",
  },
  cardTitle: {
    color: GameTheme.text.primary,
    fontSize: FontSizes.h2,
    fontWeight: "800",
    letterSpacing: 1,
  },
  cardBody: {
    color: GameTheme.text.secondary,
    fontSize: FontSizes.body,
  },
  cta: { alignItems: "center", marginTop: GameSpacing.md },
});
