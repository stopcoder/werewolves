/**
 * Werewolf game domain — roles, composition rules, and night-action
 * resolution helpers. Pure data + pure functions; no React imports here.
 */

export type RoleId = "werewolf" | "villager" | "seer" | "witch" | "hunter";
export type Team = "village" | "wolves";

export interface RoleDef {
  id: RoleId;
  /** Bilingual display name (English · Deutsch). */
  name: { en: string; de: string };
  /** One-line flavor shown on the role reveal screen. */
  flavor: { en: string; de: string };
  /** Short power summary used in the night-step picker. */
  power: { en: string; de: string };
  /** Glyph shown on cards. */
  glyph: string;
  /** Card accent — maps onto GameTheme accent keys. */
  accent: "purple" | "gold" | "civilian" | "undercover" | "danger";
  team: Team;
  /** Roles acted on at night. Seer + witch + wolves are wakeful. */
  nightAction: "wolves" | "seer" | "witch" | null;
}

export const ROLES: Record<RoleId, RoleDef> = {
  werewolf: {
    id: "werewolf",
    name: { en: "Werewolf", de: "Werwolf" },
    flavor: {
      en: "By night you hunt. By day you lie.",
      de: "Nachts jagst du. Tags lügst du.",
    },
    power: {
      en: "Choose a villager to devour.",
      de: "Wähle einen Dorfbewohner.",
    },
    glyph: "🐺",
    accent: "danger",
    team: "wolves",
    nightAction: "wolves",
  },
  villager: {
    id: "villager",
    name: { en: "Villager", de: "Dorfbewohner" },
    flavor: {
      en: "No power — only your vote and your voice.",
      de: "Keine Kraft — nur Stimme und Stimme.",
    },
    power: { en: "Vote to eliminate.", de: "Abstimmen." },
    glyph: "🧑‍🌾",
    accent: "civilian",
    team: "village",
    nightAction: null,
  },
  seer: {
    id: "seer",
    name: { en: "Seer", de: "Seherin" },
    flavor: {
      en: "Each night, one soul lies bare.",
      de: "Jede Nacht liegt eine Seele frei.",
    },
    power: {
      en: "Inspect one player: wolf or not?",
      de: "Spieler prüfen: Wolf oder nicht?",
    },
    glyph: "🔮",
    accent: "purple",
    team: "village",
    nightAction: "seer",
  },
  witch: {
    id: "witch",
    name: { en: "Witch", de: "Hexe" },
    flavor: {
      en: "Two potions. One night. Choose.",
      de: "Zwei Tränke. Eine Nacht. Wähle.",
    },
    power: {
      en: "Save the wolves' victim once, and poison once.",
      de: "Opfer retten und einmal vergiften.",
    },
    glyph: "🧪",
    accent: "purple",
    team: "village",
    nightAction: "witch",
  },
  hunter: {
    id: "hunter",
    name: { en: "Hunter", de: "Jäger" },
    flavor: {
      en: "Drag someone with you when you fall.",
      de: "Nimm jemanden mit, wenn du fällst.",
    },
    power: {
      en: "On death, take one player with you.",
      de: "Im Tod: nimm einen Spieler mit.",
    },
    glyph: "🏹",
    accent: "gold",
    team: "village",
    nightAction: null,
  },
};

/**
 * Per-player-count composition. Keeps wolves at ~⅓, fills villagers, then
 * special roles. The host can override in the lobby.
 */
export const COMPOSITIONS: Record<number, Record<RoleId, number>> = {
  5: { werewolf: 1, villager: 2, seer: 1, witch: 1, hunter: 0 },
  6: { werewolf: 2, villager: 2, seer: 1, witch: 1, hunter: 0 },
  7: { werewolf: 2, villager: 3, seer: 1, witch: 1, hunter: 0 },
  8: { werewolf: 2, villager: 3, seer: 1, witch: 1, hunter: 1 },
  9: { werewolf: 3, villager: 3, seer: 1, witch: 1, hunter: 1 },
  10: { werewolf: 3, villager: 4, seer: 1, witch: 1, hunter: 1 },
};

export const MIN_PLAYERS = 5;
export const MAX_PLAYERS = 10;

/** Default composition for a count; caller can substitute if user edits. */
export function defaultComposition(n: number): Record<RoleId, number> {
  if (COMPOSITIONS[n]) return { ...COMPOSITIONS[n] };
  // Fallback: scale wolves with a floor of ceil(n/4), fill rest as villagers
  // plus one of each special role. Rare branch — only if user picks an
  // out-of-range count that the lobby nonetheless allows.
  const wolves = Math.max(1, Math.ceil(n / 4));
  const rest = n - wolves;
  const special = Math.min(rest, 4); // seer, witch, hunter + spare
  const villagers = rest - special;
  return {
    werewolf: wolves,
    villager: villagers + Math.max(0, special - 3),
    seer: 1,
    witch: 1,
    hunter: special >= 3 ? 1 : 0,
  };
}

/** Build a flat role-list of length `n` from a composition. */
export function buildRoleList(c: Record<RoleId, number>): RoleId[] {
  const list: RoleId[] = [];
  (Object.keys(ROLES) as RoleId[]).forEach((id) => {
    for (let i = 0; i < c[id]; i++) list.push(id);
  });
  return list;
}
