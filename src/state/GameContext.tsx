/**
 * Single-device host-driven Werewolf eliminator.
 *
 * Phase flow:
 *   lobby → reveal → hostOverview → gameover
 *
 * The app dispatches roles at lobby, runs the pass-and-play reveal, then
 * hands the phone to the host. The host sees every player's role on
 * /host-overview and taps to eliminate players. When the win condition
 * is met (no wolves alive → village wins; wolves ≥ villagers → wolves
 * win) the app auto-routes to /gameover.
 *
 * No day/night/vote/role-action phases — all in-game action happens at
 * the real-world table; this app only handles role distribution and
 * outcome bookkeeping.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  COMPOSITIONS,
  MAX_PLAYERS,
  MIN_PLAYERS,
  RoleId,
  buildRoleList,
  defaultComposition,
} from "@/data/roles";

// ---------- Types -----------------------------------------------------------

export type Phase = "lobby" | "reveal" | "hostOverview" | "gameover";

export interface Player {
  index: number; // 0-based seat
  name: string; // generated P1, P2, ...
  alive: boolean;
  role: RoleId;
}

interface GameState {
  phase: Phase;
  playerCount: number;
  composition: Record<RoleId, number>;
  players: Player[];
  revealIndex: number;
  winner: "village" | "wolves" | null;
}

interface GameActions {
  setPlayerCount: (n: number) => void;
  startGame: () => void;
  reset: () => void;
  confirmReveal: () => void;
  eliminate: (playerIndex: number) => void;
  alive: () => Player[];
}

// ---------- Helpers ---------------------------------------------------------

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function initialState(): GameState {
  return {
    phase: "lobby",
    playerCount: MIN_PLAYERS,
    composition: { ...COMPOSITIONS[MIN_PLAYERS] },
    players: [],
    revealIndex: 0,
    winner: null,
  };
}

/** Win condition: all wolves dead → village; wolves ≥ villagers → wolves. */
export function checkWinner(players: Player[]): "village" | "wolves" | null {
  const wolves = players.filter((p) => p.alive && p.role === "werewolf").length;
  const villagers = players.filter((p) => p.alive && p.role !== "werewolf").length;
  if (wolves === 0) return "village";
  if (wolves >= villagers) return "wolves";
  return null;
}

// ---------- Context --------------------------------------------------------

const GameContext = createContext<(GameState & GameActions) | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(initialState);

  const setPlayerCount = useCallback((n: number) => {
    setState((s) => ({
      ...s,
      playerCount: Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, n)),
      composition: { ...(COMPOSITIONS[n] ?? defaultComposition(n)) },
    }));
  }, []);

  const startGame = useCallback(() => {
    setState((s) => {
      const comp = s.composition;
      const roles = shuffle(buildRoleList(comp));
      const players: Player[] = roles.map((role, i) => ({
        index: i,
        name: `P${i + 1}`,
        alive: true,
        role,
      }));
      return {
        ...initialState(),
        playerCount: s.playerCount,
        composition: comp,
        phase: "reveal",
        players,
        revealIndex: 0,
      };
    });
  }, []);

  const reset = useCallback(() => setState(initialState()), []);

  const confirmReveal = useCallback(() => {
    setState((s) => {
      const next = s.revealIndex + 1;
      if (next >= s.players.length) {
        return {
          ...s,
          revealIndex: s.players.length,
          phase: "hostOverview",
        };
      }
      return { ...s, revealIndex: next };
    });
  }, []);

  const eliminate = useCallback((playerIndex: number) => {
    setState((s) => {
      if (s.phase !== "hostOverview") return s;
      const target = s.players[playerIndex];
      if (!target || !target.alive) return s;
      const players = s.players.map((p) =>
        p.index === playerIndex ? { ...p, alive: false } : p
      );
      const winner = checkWinner(players);
      if (winner) {
        return { ...s, players, phase: "gameover", winner };
      }
      return { ...s, players };
    });
  }, []);

  // --- Selectors -----------------------------------------------------------

  const alive = useMemo<Player[]>(
    () => state.players.filter((p) => p.alive),
    [state.players]
  );

  const value = useMemo(
    () => ({
      ...state,
      setPlayerCount,
      startGame,
      reset,
      confirmReveal,
      eliminate,
      alive: () => alive,
    }),
    [state, setPlayerCount, startGame, reset, confirmReveal, eliminate, alive]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}