import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Chip, ChipRow } from "@/components/game/Chip";
import { GradientBackground } from "@/components/game/GradientBackground";
import { PrimaryButton } from "@/components/game/PrimaryButton";
import {
  FontSizes,
  GameSpacing,
  GameTheme,
} from "@/constants/gameTheme";
import {
  COMPOSITIONS,
  MAX_PLAYERS,
  MIN_PLAYERS,
  ROLES,
  RoleId,
} from "@/data/roles";
import { useGame } from "@/state/GameContext";

const PLAYER_OPTIONS = [5, 6, 7, 8, 9, 10];
const TIMER_OPTIONS = [60, 90, 120, 180];

export default function LobbyScreen() {
  const router = useRouter();
  const {
    playerCount,
    setPlayerCount,
    composition,
    discussionSeconds,
    setDiscussionSeconds,
    startGame,
    reset,
  } = useGame();

  const handleStart = () => {
    startGame();
    router.push("/reveal");
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>WEREWOLF</Text>
            <Text style={styles.subtitle}>Werwolf · One village. Many lies.</Text>
          </View>

          <Section title="PLAYERS · SPIELER">
            <ChipRow>
              {PLAYER_OPTIONS.map((n) => (
                <Chip
                  key={n}
                  label={`${n}`}
                  active={playerCount === n}
                  onPress={() => setPlayerCount(n)}
                />
              ))}
            </ChipRow>
          </Section>

          <Section title="DISCUSSION TIMER · REDEZEIT (sec)">
            <ChipRow>
              {TIMER_OPTIONS.map((n) => (
                <Chip
                  key={n}
                  label={`${n}s`}
                  active={discussionSeconds === n}
                  onPress={() => setDiscussionSeconds(n)}
                />
              ))}
            </ChipRow>
          </Section>

          <Section title="ROLES · ROLLEN">
            <CompositionReadout
              playerCount={playerCount}
              composition={composition}
            />
          </Section>

          <View style={styles.cta}>
            <PrimaryButton label="BEGIN · START" onPress={handleStart} />
            <Text style={styles.tip}>
              Pass the phone between players. Each will see their role in
              private.
            </Text>
          </View>

          {playerCount > MAX_PLAYERS || playerCount < MIN_PLAYERS ? (
            <PrimaryButton
              label="Reset"
              variant="ghost"
              onPress={reset}
              style={{ marginTop: GameSpacing.md }}
            />
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function CompositionReadout({
  playerCount,
  composition,
}: {
  playerCount: number;
  composition: Record<RoleId, number>;
}) {
  // Read-only preview; the lobby picks a balanced default per player count.
  // For v1 we don't expose per-role editing — keeps the UX small and the
  // game well-balanced.
  const live = COMPOSITIONS[playerCount] ?? composition;
  return (
    <View style={styles.composition}>
      {(Object.keys(ROLES) as RoleId[]).map((id) => (
        <View key={id} style={styles.compositionRow}>
          <Text style={styles.compositionGlyph}>{ROLES[id].glyph}</Text>
          <Text style={styles.compositionName}>{ROLES[id].name.en}</Text>
          <Text style={styles.compositionCount}>×{live[id]}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: GameSpacing.md,
    paddingBottom: GameSpacing.xl,
    gap: GameSpacing.lg,
  },
  header: {
    paddingTop: GameSpacing.lg,
    paddingBottom: GameSpacing.xs,
    alignItems: "center",
  },
  title: {
    color: GameTheme.text.primary,
    fontSize: FontSizes.h1,
    fontWeight: "900",
    letterSpacing: 8,
  },
  subtitle: {
    color: GameTheme.text.gold,
    fontSize: FontSizes.small,
    letterSpacing: 2,
    marginTop: GameSpacing.xs,
    textAlign: "center",
  },
  section: { gap: GameSpacing.xs },
  sectionTitle: {
    color: GameTheme.text.gold,
    fontSize: FontSizes.small,
    fontWeight: "700",
    letterSpacing: 2,
  },
  composition: {
    backgroundColor: GameTheme.card.base,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    padding: GameSpacing.sm,
    gap: 6,
  },
  compositionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: GameSpacing.sm,
  },
  compositionGlyph: { fontSize: 22, width: 28, textAlign: "center" },
  compositionName: {
    flex: 1,
    color: GameTheme.text.primary,
    fontSize: FontSizes.body,
    fontWeight: "600",
  },
  compositionCount: {
    color: GameTheme.text.gold,
    fontSize: FontSizes.body,
    fontWeight: "700",
  },
  cta: {
    marginTop: GameSpacing.md,
    gap: GameSpacing.xs,
    alignItems: "center",
  },
  tip: {
    color: GameTheme.text.muted,
    fontSize: FontSizes.caption,
    textAlign: "center",
  },
});
