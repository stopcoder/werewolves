import { useColorScheme as _useColorScheme } from "react-native";

/** Web variant — RN's hook already reads matchMedia on web, so we just
 * forward. Kept as a separate file to match the Expo template convention. */
export function useColorScheme(): "light" | "dark" | null | undefined {
  return _useColorScheme();
}
