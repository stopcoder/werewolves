import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
 * Day phase. Shows the discussion timer (configurable in lobby) plus the
 * alive roster. The "Start vote" CTA moves to /vote. We don't auto-end the
 * timer — a real Werewolf game often lets the village wrap early or run
 * late. The host decides when to call the vote.
 */
export default function DayScreen() {
  const router = useRouter();
  const { players, alive, round, discussionSeconds, startVote } = useGame();
  const [remaining, setRemaining] = useState(discussionSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset the timer when entering a new round.
  useEffect(() => {
    setRemaining(discussionSeconds);
  }, [discussionSeconds, round]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  const handleStartVote = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    startVote();
    router.push("/vote");
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <PhaseBanner
            variant="day"
            title={`Day ${round}`}
            subtitle="Discuss. Accuse. Then call the vote."
          />

          <View style={styles.timerCard}>
            <Text style={styles.timerLabel}>DISCUSSION · REDEZEIT</Text>
            <Text style={styles.timer}>
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </Text>
            <Text style={styles.timerHint}>
              {remaining === 0
                ? "Time's up — call the vote when ready."
                : `${alive().length} players alive · ${discussionSeconds}s allotted`}
            </Text>
          </View>

          <Text style={styles.sectionLabel}>VILLAGE · DORF</Text>
          <View style={styles.row}>
            {players.map((p) => (
              <PlayerAvatar
                key={p.index}
                name={p.name}
                alive={p.alive}
                tone={p.alive ? "default" : "muted"}
                style={styles.seat}
              />
            ))}
          </View>

          <View style={styles.cta}>
            <PrimaryButton label="CALL THE VOTE · ABSTIMMUNG" onPress={handleStartVote} />
            <Text style={styles.tip}>
              Pass the phone to each living player in turn.
            </Text>
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
    gap: GameSpacing.lg,
  },
  timerCard: {
    backgroundColor: GameTheme.card.base,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: GameTheme.card.dayBorder,
    padding: GameSpacing.lg,
    alignItems: "center",
  },
  timerLabel: {
    color: GameTheme.accent.day,
    fontSize: FontSizes.caption,
    letterSpacing: 3,
    fontWeight: "700",
  },
  timer: {
    color: GameTheme.text.primary,
    fontSize: 64,
    fontWeight: "900",
    letterSpacing: 4,
    marginTop: GameSpacing.xs,
    fontVariant: ["tabular-nums"],
  },
  timerHint: {
    color: GameTheme.text.muted,
    fontSize: FontSizes.small,
    marginTop: GameSpacing.xs,
  },
  sectionLabel: {
    color: GameTheme.text.gold,
    fontSize: FontSizes.caption,
    letterSpacing: 3,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: GameSpacing.xs,
  },
  seat: { minWidth: 60, paddingVertical: 10, paddingHorizontal: 12 },
  cta: { alignItems: "center", gap: GameSpacing.xs },
  tip: {
    color: GameTheme.text.muted,
    fontSize: FontSizes.caption,
    textAlign: "center",
  },
});
