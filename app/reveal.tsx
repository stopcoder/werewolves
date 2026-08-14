import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/game/GradientBackground";
import { PlayerAvatar } from "@/components/game/PlayerAvatar";
import { PrimaryButton } from "@/components/game/PrimaryButton";
import { RoleCard } from "@/components/game/RoleCard";
import {
  FontSizes,
  GameSpacing,
  GameTheme,
} from "@/constants/gameTheme";
import { ROLES } from "@/data/roles";
import { useGame } from "@/state/GameContext";

/**
 * Role reveal flow. Two sub-states:
 *  - "pass": "Hand the phone to <name>. Tap when they're ready."
 *  - "show": The current player's role is visible. They tap "I saw it",
 *    advancing the seat. The screen hides itself behind the "pass" prompt
 *    again before the next player sees theirs.
 */
export default function RevealScreen() {
  const router = useRouter();
  const { players, revealIndex, confirmReveal } = useGame();
  const [showRole, setShowRole] = useState(false);
  const player = players[revealIndex];
  const isLast = revealIndex >= players.length - 1;

  if (!player) {
    // Defensive — should never hit since confirmReveal flips to day when done.
    return null;
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.container}>
          {!showRole ? (
            <View style={styles.center}>
              <Text style={styles.kicker}>ROLE REVEAL · ROLLE</Text>
              <Text style={styles.headline}>
                Hand the phone to{"\n"}
                <Text style={styles.headlineAccent}>{player.name}</Text>
              </Text>
              <Text style={styles.body}>
                Look away while {player.name} sees their role.
              </Text>
              <View style={styles.row}>
                {players.map((p, i) => (
                  <PlayerAvatar
                    key={p.index}
                    name={p.name}
                    alive={true}
                    style={styles.seat}
                    tone={i < revealIndex ? "muted" : "default"}
                  />
                ))}
              </View>
              <View style={styles.cta}>
                <PrimaryButton
                  label={`I'm ready · ${player.name}`}
                  onPress={() => setShowRole(true)}
                />
              </View>
            </View>
          ) : (
            <View style={styles.center}>
              <Text style={styles.kicker}>{player.name}, you are</Text>
              <RoleCard role={player.role} reveal />
              <View style={styles.cta}>
                <PrimaryButton
                  label={isLast ? "GOT IT · PASS TO HOST" : "GOT IT · PASS"}
                  onPress={() => {
                    setShowRole(false);
                    confirmReveal();
                    if (isLast) router.replace("/host-handoff");
                  }}
                />
                <Text style={styles.tip}>
                  {isLast
                    ? "Now hand the phone to the host."
                    : "Pass the phone to the next player."}
                </Text>
                <Text style={styles.roleHint}>
                  Role lore — {ROLES[player.role].name.de}
                </Text>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: GameSpacing.md,
    paddingVertical: GameSpacing.lg,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: GameSpacing.md },
  kicker: {
    color: GameTheme.text.gold,
    fontSize: FontSizes.caption,
    letterSpacing: 3,
    fontWeight: "700",
  },
  headline: {
    color: GameTheme.text.primary,
    fontSize: FontSizes.h2,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 1,
  },
  headlineAccent: { color: GameTheme.text.gold },
  body: {
    color: GameTheme.text.secondary,
    fontSize: FontSizes.small,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: GameSpacing.xs,
    marginVertical: GameSpacing.lg,
  },
  seat: { minWidth: 56, paddingVertical: 8, paddingHorizontal: 10 },
  cta: {
    width: "100%",
    alignItems: "center",
    gap: GameSpacing.xs,
    marginTop: GameSpacing.md,
  },
  tip: {
    color: GameTheme.text.muted,
    fontSize: FontSizes.caption,
    textAlign: "center",
  },
  roleHint: {
    color: GameTheme.text.muted,
    fontSize: FontSizes.caption,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: GameSpacing.xs,
  },
});
