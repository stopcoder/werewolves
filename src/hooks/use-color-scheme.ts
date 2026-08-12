import { useColorScheme as _useColorScheme } from "react-native";

/** Native stub. The app forces dark mode, but keeping the platform split
 * matches the reference layout. */
export function useColorScheme(): "light" | "dark" | null | undefined {
  return _useColorScheme();
}
