import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/game/GradientBackground";
import { PhaseBanner } from "@/components/game/PhaseBanner";
import { PlayerAvatar } from "@/components/game/PlayerAvatar";
import { PrimaryButton } from "@/components/game/PrimaryButton";
import { RoleCard } from "@/components/game/RoleCard";
import { ScreenHeader } from "@/components/game/ScreenHeader";
import {
  FontSizes,
  GameSpacing,
  GameTheme,
} from "@/constants/gameTheme";
import { ROLES, RoleId } from "@/data/roles";
import { useGame } from "@/state/GameContext";

/**
 * Night orchestrator. The state machine advances through wolves → seer →
 * witch in order, skipping any step whose actor role is dead. This screen
 * renders whichever sub-step is current.
 *
 * Routing: if the user lands on /night while the phase is something else
 * (e.g. gameover, resolveNight), we forward to the right place.
 */
export default function NightScreen() {
  const router = useRouter();
  const {
    phase,
    round,
    players,
    nightActions,
    advanceNightStep,
    submitWolfVote,
    submitSeerInspect,
    submitWitch,
    startNightIntro,
  } = useGame();

  // Initial-mount guard: if we somehow land on /night while in lobby/day,
  // route the player to the correct phase.
  useEffect(() => {
    if (phase === "lobby") router.replace("/");
    else if (phase === "day" || phase === "reveal") router.replace("/day");
    else if (phase === "vote") router.replace("/vote");
    else if (phase === "resolveDay" || phase === "resolveNight")
      router.replace("/announce");
    else if (phase === "gameover") router.replace("/gameover");
    else if (phase === "hunterPick") router.replace("/hunter");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (phase === "nightIntro") {
    return <NightIntro onBegin={() => advanceNightStep()} onCancel={() => router.replace("/day")} />;
  }

  if (phase === "nightWolves") {
    const wolves = players.filter((p) => p.alive && p.role === "werewolf");
    const targets = players.filter((p) => p.alive && p.role !== "werewolf");
    return (
      <ActionScreen
        title="Wolves · Wölfe"
        subtitle="All others: close your eyes. Wolves choose a victim."
        counter={`${wolves.length} wolf${wolves.length === 1 ? "" : "s"} awake`}
        done={nightActions.wolfTarget !== null}
        doneLabel="CONFIRM KILL · BESTÄTIGEN"
        onDone={() => advanceNightStep()}
      >
        <View style={styles.grid}>
          {targets.map((p) => (
            <PlayerAvatar
              key={p.index}
              name={p.name}
              alive
              selected={nightActions.wolfTarget === p.index}
              onPress={() => submitWolfVote(p.index)}
              style={styles.avatar}
              marker="PREY"
              tone="danger"
            />
          ))}
        </View>
      </ActionScreen>
    );
  }

  if (phase === "nightSeer") {
    const seer = players.find((p) => p.alive && p.role === "seer");
    const inspected = nightActions.seerTarget;
    const result = nightActions.seerResult;
    return (
      <ActionScreen
        title="Seer · Seherin"
        subtitle="Wake the Seer. Choose one soul to inspect."
        counter="Seer only"
        done={inspected !== null}
        doneLabel="CONTINUE · WEITER"
        onDone={() => advanceNightStep()}
      >
        <View style={styles.grid}>
          {players
            .filter((p) => p.alive && p.index !== seer?.index)
            .map((p) => (
              <PlayerAvatar
                key={p.index}
                name={p.name}
                alive
                selected={inspected === p.index}
                onPress={() => submitSeerInspect(p.index)}
                style={styles.avatar}
                marker="INSPECT"
              />
            ))}
        </View>
        {inspected !== null && result !== null ? (
          <View
            style={[
              styles.verdict,
              {
                borderColor: result === "wolf" ? GameTheme.text.danger : GameTheme.text.civilian,
              },
            ]}
          >
            <Text style={styles.verdictLabel}>REVELATION · OFFENBARUNG</Text>
            <Text
              style={[
                styles.verdictValue,
                { color: result === "wolf" ? GameTheme.text.danger : GameTheme.text.civilian },
              ]}
            >
              {players[inspected]?.name} is{" "}
              {result === "wolf" ? "🐺 WEREWOLF" : "✅ NOT A WOLF"}
            </Text>
          </View>
        ) : null}
      </ActionScreen>
    );
  }

  if (phase === "nightWitch") {
    const witch = players.find((p) => p.alive && p.role === "witch");
    const wolfTarget = nightActions.wolfTarget;
    const wolfTargetPlayer = wolfTarget !== null ? players[wolfTarget] : null;
    const victimAlive =
      wolfTarget !== null && !nightActions.witchSaved && players[wolfTarget]?.alive;
    const possiblePoisonTargets = players.filter(
      (p) => p.alive && p.index !== witch?.index
    );
    return (
      <ActionScreen
        title="Witch · Hexe"
        subtitle="Wake the Witch. Save the victim? Poison another?"
        counter="Witch only"
        done
        doneLabel="DONE · FERTIG"
        onDone={() => advanceNightStep()}
      >
        <View style={styles.witchCard}>
          <RoleCard role="witch" compact />
          <View style={styles.witchRow}>
            <View style={styles.witchStat}>
              <Text style={styles.witchLabel}>ANTIDOTE</Text>
              <Text
                style={[
                  styles.witchValue,
                  witch?.hasAntidote ? styles.witchOn : styles.witchOff,
                ]}
              >
                {witch?.hasAntidote ? "AVAILABLE" : "USED"}
              </Text>
            </View>
            <View style={styles.witchStat}>
              <Text style={styles.witchLabel}>POISON</Text>
              <Text
                style={[
                  styles.witchValue,
                  witch?.hasPoison ? styles.witchOn : styles.witchOff,
                ]}
              >
                {witch?.hasPoison ? "AVAILABLE" : "USED"}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>VICTIM · OPFER</Text>
        <View style={styles.row}>
          {wolfTargetPlayer ? (
            <PlayerAvatar
              name={wolfTargetPlayer.name}
              alive
              tone="danger"
              marker="PREY"
              selected={nightActions.witchSaved}
              disabled={!witch?.hasAntidote || !victimAlive}
              onPress={() => {
                if (!witch?.hasAntidote) return;
                submitWitch({
                  save: !nightActions.witchSaved,
                  poison: nightActions.witchPoisoned,
                });
              }}
              style={styles.avatar}
            />
          ) : (
            <Text style={styles.muted}>
              No victim this night (wolves skipped or already eaten).
            </Text>
          )}
        </View>

        <Text style={styles.sectionLabel}>POISON · GIFT</Text>
        <View style={styles.grid}>
          {witch?.hasPoison
            ? possiblePoisonTargets.map((p) => (
                <PlayerAvatar
                  key={p.index}
                  name={p.name}
                  alive
                  tone="danger"
                  selected={nightActions.witchPoisoned === p.index}
                  onPress={() => {
                    submitWitch({
                      save: nightActions.witchSaved,
                      poison:
                        nightActions.witchPoisoned === p.index ? null : p.index,
                    });
                  }}
                  style={styles.avatar}
                  marker="POISON"
                />
              ))
            : [
                <Text key="no-poison" style={styles.muted}>
                  No poison remaining.
                </Text>,
              ]}

          {nightActions.witchPoisoned !== null ? (
            <PrimaryButton
              label="CLEAR POISON · VERWERFEN"
              variant="ghost"
              onPress={() =>
                submitWitch({
                  save: nightActions.witchSaved,
                  poison: null,
                })
              }
              style={{ marginTop: GameSpacing.sm }}
            />
          ) : null}
        </View>
      </ActionScreen>
    );
  }

  // Defensive fallback: any other phase should be redirected by the effect.
  return null;
}

function NightIntro({
  onBegin,
  onCancel,
}: {
  onBegin: () => void;
  onCancel: () => void;
}) {
  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.container}>
          <PhaseBanner
            variant="night"
            title="Night falls"
            subtitle="All players: close your eyes."
          />
          <View style={styles.intro}>
            <Text style={styles.introBody}>
              When everyone is asleep, tap Begin. The Host will pass the phone
              to each night-active role in turn.
            </Text>
          </View>
          <View style={styles.cta}>
            <PrimaryButton label="BEGIN NIGHT · START" variant="night" onPress={onBegin} />
            <PrimaryButton label="BACK · ZURÜCK" variant="ghost" onPress={onCancel} />
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

function ActionScreen({
  title,
  subtitle,
  counter,
  done,
  doneLabel,
  onDone,
  children,
}: {
  title: string;
  subtitle: string;
  counter?: string;
  done: boolean;
  doneLabel: string;
  onDone: () => void;
  children: React.ReactNode;
}) {
  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <PhaseBanner variant="night" title={title} subtitle={subtitle} />
          <ScreenHeader title="" counter={counter} style={{ marginBottom: GameSpacing.sm }} />
          {children}
          <View style={styles.cta}>
            <PrimaryButton
              label={doneLabel}
              variant="night"
              disabled={!done}
              onPress={onDone}
            />
          </View>
        </ScrollView>
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
  scroll: {
    paddingHorizontal: GameSpacing.md,
    paddingVertical: GameSpacing.lg,
    gap: GameSpacing.md,
  },
  intro: {
    backgroundColor: GameTheme.card.base,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: GameTheme.card.nightBorder,
    padding: GameSpacing.md,
  },
  introBody: {
    color: GameTheme.text.secondary,
    fontSize: FontSizes.body,
    textAlign: "center",
    lineHeight: 22,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: GameSpacing.sm,
    paddingVertical: GameSpacing.sm,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: GameSpacing.sm,
    paddingVertical: GameSpacing.sm,
  },
  avatar: { minWidth: 96 },
  cta: { alignItems: "center", gap: GameSpacing.sm, marginTop: GameSpacing.md },
  verdict: {
    marginTop: GameSpacing.md,
    padding: GameSpacing.md,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    gap: GameSpacing.xs,
  },
  verdictLabel: {
    color: GameTheme.text.muted,
    fontSize: FontSizes.caption,
    letterSpacing: 2,
    fontWeight: "700",
  },
  verdictValue: {
    fontSize: FontSizes.h3,
    fontWeight: "800",
    letterSpacing: 1,
  },
  sectionLabel: {
    color: GameTheme.text.gold,
    fontSize: FontSizes.caption,
    letterSpacing: 3,
    fontWeight: "700",
    marginTop: GameSpacing.md,
  },
  witchCard: {
    backgroundColor: GameTheme.card.night,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: GameTheme.card.nightBorder,
    padding: GameSpacing.md,
    gap: GameSpacing.sm,
  },
  witchRow: { flexDirection: "row", gap: GameSpacing.md, justifyContent: "space-around" },
  witchStat: { alignItems: "center" },
  witchLabel: {
    color: GameTheme.text.muted,
    fontSize: FontSizes.caption,
    letterSpacing: 2,
    fontWeight: "700",
  },
  witchValue: {
    fontSize: FontSizes.body,
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 4,
  },
  witchOn: { color: GameTheme.accent.gold },
  witchOff: { color: GameTheme.text.muted },
  muted: {
    color: GameTheme.text.muted,
    fontSize: FontSizes.small,
    textAlign: "center",
  },
});
