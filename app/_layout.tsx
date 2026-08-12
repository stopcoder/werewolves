import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { GameProvider } from "@/state/GameContext";

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS !== "web") return;
    // Block native context menu + text selection (parity with native).
    const block = (e: Event) => e.preventDefault();
    document.addEventListener("contextmenu", block);
    document.addEventListener("selectstart", block);
    // Override RNW's default `touch-action: none` on the root, which on
    // iOS Safari silently swallows tap events on Pressables. `manipulation`
    // keeps pinch / double-tap zoom but lets the browser fire click.
    // We also disable the iOS callout and tap-highlight so the UI feels
    // app-native rather than web-ish.
    const root = document.documentElement;
    const body = document.body;
    const prevTouchAction = root.style.touchAction;
    const prevHighlight = (root.style as any).webkitTapHighlightColor;
    const prevCallout = (root.style as any).webkitTouchCallout;
    root.style.touchAction = "manipulation";
    body.style.touchAction = "manipulation";
    (root.style as any).webkitTapHighlightColor = "transparent";
    (root.style as any).webkitTouchCallout = "none";
    return () => {
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("selectstart", block);
      root.style.touchAction = prevTouchAction;
      body.style.touchAction = prevTouchAction;
      (root.style as any).webkitTapHighlightColor = prevHighlight ?? "";
      (root.style as any).webkitTouchCallout = prevCallout ?? "";
    };
  }, []);

  return (
    <GameProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0f0524" },
          animation: "fade",
        }}
      />
    </GameProvider>
  );
}
