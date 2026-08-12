import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { GameProvider } from "@/state/GameContext";

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const block = (e: Event) => e.preventDefault();
    document.addEventListener("contextmenu", block);
    document.addEventListener("selectstart", block);
    return () => {
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("selectstart", block);
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
