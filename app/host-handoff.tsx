import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/game/GradientBackground";
import { PhaseBanner } from "@/components/game/PhaseBanner";
import { PrimaryButton } from "@/components/game/PrimaryButton";
import {
  FontSizes,
  GameSpacing,
  GameTheme,
} from "@/constants/gameTheme";

/**
 * Gate between the pass-and-play reveal and the host's overview. Forces a
 * deliberate handoff so players don't accidentally see the full role list.
 */
export default function HostHandoffScreen() {
  const router = useRouter();

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.container}>
          <PhaseBanner
            variant="info"
            title="Hand off to host"
            subtitle="Every player has seen their role."
          />

          <View style={styles.center}>
            <Text style={styles.headline}>
              Pass the phone{"\n"}
              <Text style={styles.headlineAccent}>to the host.</Text>
            </Text>
            <Text style={styles.body}>
              The host will see everyone's role and mark players out as the
              game progresses.
            </Text>
          </View>

          <View style={styles.cta}>
            <PrimaryButton
              label="I have the phone · I am the host"
              onPress={() => router.replace("/host-overview")}
            />
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: GameSpacing.md,
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
    paddingHorizontal: GameSpacing.md,
  },
  cta: { gap: GameSpacing.xs, alignItems: "center" },
});