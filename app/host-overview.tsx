import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/game/GradientBackground";
import { PhaseBanner } from "@/components/game/PhaseBanner";
import { PrimaryButton } from "@/components/game/PrimaryButton";
import {
  FontSizes,
  GameSpacing,
  GameTheme,
  Radii,
} from "@/constants/gameTheme";
import { ROLES, RoleId } from "@/data/roles";
import { useGame } from "@/state/GameContext";

/**
 * Host's central screen. Lists every player's seat + role + alive status.
 * Tap a row to mark them out (eliminate). When the win condition is met
 * (no wolves alive, or wolves ≥ villagers) the app auto-routes to
 * /gameover via the phase change in eliminate().
 */
export default function HostOverviewScreen() {
  const router = useRouter();
  const { players, phase, eliminate, reset, alive } = useGame();

  // When the win condition fires, eliminate() flips phase to "gameover".
  // Push the route so the host sees the winner banner.
  useEffect(() => {
    if (phase === "gameover") {
      router.replace("/gameover");
    }
  }, [phase, router]);

  const aliveCount = alive().length;

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <PhaseBanner
            variant="info"
            title="Host overview"
            subtitle={`Tap a player to mark them out. ${aliveCount} alive.`}
          />

          <View style={styles.list}>
            {players.map((p) => (
              <PlayerRow
                key={p.index}
                index={p.index}
                role={p.role}
                alive={p.alive}
                onEliminate={() => eliminate(p.index)}
              />
            ))}
          </View>

          <View style={styles.cta}>
            <PrimaryButton
              label="RESTART · NEU STARTEN"
              variant="ghost"
              onPress={() => {
                reset();
                router.replace("/");
              }}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

function PlayerRow({
  index,
  role,
  alive,
  onEliminate,
}: {
  index: number;
  role: RoleId;
  alive: boolean;
  onEliminate: () => void;
}) {
  const def = ROLES[role];
  return (
    <Pressable
      onPress={alive ? onEliminate : undefined}
      disabled={!alive}
      style={({ pressed }) => [
        styles.row,
        !alive && styles.rowDead,
        pressed && alive && styles.rowPressed,
      ]}
    >
      <Text style={styles.seat}>P{index + 1}</Text>
      <Text style={styles.glyph}>{def.glyph}</Text>
      <View style={styles.roleBlock}>
        <Text style={[styles.roleName, !alive && styles.textMuted]}>
          {def.name.en}
        </Text>
        <Text style={styles.roleDe}>{def.name.de}</Text>
      </View>
      <View style={styles.statusCol}>
        {alive ? (
          <Text style={styles.aliveLabel}>ALIVE</Text>
        ) : (
          <Text style={styles.outLabel}>OUT</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: GameSpacing.md,
    paddingVertical: GameSpacing.lg,
    gap: GameSpacing.lg,
  },
  list: { gap: GameSpacing.xs },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: GameSpacing.md,
    paddingVertical: GameSpacing.md,
    paddingHorizontal: GameSpacing.md,
    borderRadius: Radii.md,
    backgroundColor: GameTheme.card.base,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  rowDead: {
    opacity: 0.45,
    borderStyle: "dashed",
  },
  rowPressed: {
    backgroundColor: "rgba(255,122,138,0.12)",
    borderColor: GameTheme.text.danger,
  },
  seat: {
    color: GameTheme.text.gold,
    fontSize: FontSizes.small,
    fontWeight: "800",
    letterSpacing: 2,
    minWidth: 36,
  },
  glyph: {
    fontSize: 28,
    width: 36,
    textAlign: "center",
  },
  roleBlock: { flex: 1, gap: 2 },
  roleName: {
    color: GameTheme.text.primary,
    fontSize: FontSizes.body,
    fontWeight: "700",
  },
  roleDe: {
    color: GameTheme.text.muted,
    fontSize: FontSizes.caption,
    fontStyle: "italic",
  },
  textMuted: {
    color: GameTheme.text.muted,
    textDecorationLine: "line-through",
  },
  statusCol: { minWidth: 56, alignItems: "flex-end" },
  aliveLabel: {
    color: GameTheme.text.civilian,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "800",
  },
  outLabel: {
    color: GameTheme.text.danger,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "800",
  },
  cta: { alignItems: "center", marginTop: GameSpacing.md },
});