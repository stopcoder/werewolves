import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/game/GradientBackground";
import { PhaseBanner } from "@/components/game/PhaseBanner";
import { PlayerAvatar } from "@/components/game/PlayerAvatar";
import { PrimaryButton } from "@/components/game/PrimaryButton";
import { ScreenHeader } from "@/components/game/ScreenHeader";
import {
  FontSizes,
  GameSpacing,
  GameTheme,
} from "@/constants/gameTheme";
import { useGame } from "@/state/GameContext";

/**
 * Day vote. The device is passed to each alive voter in turn — they pick a
 * target (anyone alive, including themselves). The screen advances to the
 * next voter; once all have voted, the state machine flips to resolveDay.
 */
export default function VoteScreen() {
  const router = useRouter();
  const {
    players,
    alive,
    voteIndex,
    submitVote,
    round,
    phase,
  } = useGame();

  const voters = alive();
  const voter = voters[voteIndex];

  // When the last voter submits, submitVote auto-flips phase to resolveDay
  // (or hunterPick if the executed player was a hunter). Forward to the
  // right place so we don't sit on an empty screen.
  useEffect(() => {
    if (phase === "resolveDay") router.replace("/announce");
    else if (phase === "hunterPick") router.replace("/hunter");
    else if (phase === "gameover") router.replace("/gameover");
    else if (phase === "day") router.replace("/day");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (!voter) {
    return null;
  }
  const choices = voters.filter((p) => p.index !== voter.index);

  const handlePick = (targetIndex: number) => {
    submitVote(targetIndex);
    // If this was the last voter, submitVote will have moved us to
    // resolveDay. Otherwise the next render shows the next voter.
  };

  // When the voter count shifts mid-screen (e.g. role-reveal anomaly), the
  // state machine may auto-resolve. Detect that by phase via the alive list
  // shrinking under voteIndex.
  if (voteIndex >= voters.length) {
    return null;
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.container}>
          <PhaseBanner
            variant="day"
            title="Voting · Abstimmung"
            subtitle={`Day ${round} — eliminate a suspect.`}
          />

          <ScreenHeader
            title={`${voter.name}, pick a suspect`}
            subtitle="Tap a name to vote them out."
            counter={`${voteIndex + 1} / ${voters.length}`}
            style={styles.header}
          />

          <View style={styles.grid}>
            {choices.map((p) => (
              <PlayerAvatar
                key={p.index}
                name={p.name}
                alive={p.alive}
                onPress={() => handlePick(p.index)}
                style={styles.avatar}
                marker="VOTE"
              />
            ))}
          </View>

          <View style={styles.cta}>
            <PrimaryButton
              label="SKIP · NO VOTE"
              variant="ghost"
              onPress={() => handlePick(voter.index)}
            />
            <Text style={styles.tip}>
              Voting for yourself counts as "no vote" and skips elimination.
            </Text>
          </View>
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
    gap: GameSpacing.lg,
  },
  header: { marginTop: GameSpacing.sm },
  grid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: GameSpacing.sm,
    paddingTop: GameSpacing.md,
  },
  avatar: { minWidth: 96 },
  cta: { alignItems: "center", gap: GameSpacing.xs },
  tip: {
    color: GameTheme.text.muted,
    fontSize: FontSizes.caption,
    textAlign: "center",
  },
});
