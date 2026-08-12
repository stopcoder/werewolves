/**
 * Single-device pass-and-play Werewolf state machine.
 *
 * Phase flow (single source of truth lives here):
 *   lobby → reveal → day → vote → resolveDay → (night or gameover)
 *                                       │
 *                                 nightIntro → nightWolves → nightSeer
 *                                          → nightWitch   → resolveNight
 *                                                                  │
 *                                                          (back to day or gameover)
 *
 * The device is passed between players in real life; screens only ever
 * address a single "current actor" by index, and that index advances as each
 * player confirms they have seen the screen / made their pick.
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
  ROLES,
  RoleId,
  buildRoleList,
  defaultComposition,
} from "@/data/roles";

// ---------- Types -----------------------------------------------------------

export type Phase =
  | "lobby"
  | "reveal"
  | "day"
  | "vote"
  | "resolveDay"
  | "nightIntro"
  | "nightWolves"
  | "nightSeer"
  | "nightWitch"
  | "resolveNight"
  | "hunterPick"
  | "gameover";

export interface Player {
  index: number; // 0-based seat
  name: string; // generated P1, P2, ...
  alive: boolean;
  role: RoleId;
  hasAntidote: boolean; // witch
  hasPoison: boolean; // witch
}

export interface Vote {
  voter: number;
  target: number;
}

export interface NightActions {
  wolfVotes: Record<number, number>; // wolfIndex -> targetPlayerIndex
  wolfTarget: number | null;
  seerTarget: number | null;
  seerResult: "wolf" | "not-wolf" | null;
  witchSaved: boolean;
  witchPoisoned: number | null;
}

export interface DeathEvent {
  index: number;
  cause: "wolves" | "vote" | "witch" | "hunter";
  by?: number; // for hunter: the hunter who died
}

export interface GameLogEntry {
  round: number;
  text: string;
  kind: "info" | "death" | "vote" | "wolf" | "seer" | "witch" | "hunter" | "win";
}

interface GameState {
  phase: Phase;
  round: number;
  playerCount: number;
  composition: Record<RoleId, number>;
  players: Player[];
  discussionSeconds: number; // configured at lobby

  // role reveal progress
  revealIndex: number;

  // day-vote progress
  voteIndex: number; // index into alivePlayers (not seat index)
  dayVotes: Vote[];

  // night
  nightActions: NightActions;
  nightStepIndex: number; // 0 = wolves, 1 = seer, 2 = witch

  // resolution — deaths happen to players.alive immediately, but we keep
  // the *event* in pendingDeaths so the resolve screen can show who died
  // until the user taps "continue".
  pendingDeaths: DeathEvent[];
  // After night resolution, if a hunter died they get to pick — we stash the
  // hunter's index here so the screen knows whose turn it is. `resumePhase`
  // remembers whether we came from resolveDay or resolveNight so the
  // post-hunter announce screen knows which banner to show.
  hunterToAct: number | null;
  resumePhase: Phase | null;

  winner: "village" | "wolves" | null;
  log: GameLogEntry[];
}

interface GameActions {
  setPlayerCount: (n: number) => void;
  setDiscussionSeconds: (n: number) => void;
  startGame: () => void;
  reset: () => void;

  // role reveal
  confirmReveal: () => void;

  // day
  startDay: () => void;
  startVote: () => void;
  submitVote: (target: number) => void;

  // night
  startNightIntro: () => void;
  advanceNightStep: () => void;
  submitWolfVote: (target: number) => void;
  submitSeerInspect: (target: number) => void;
  submitWitch: (opts: { save: boolean; poison: number | null }) => void;
  submitHunterPick: (target: number) => void;

  proceed: () => void; // generic advance after a resolution screen

  // selectors — returned as functions so the memoized array identity is
  // preserved across renders without forcing every consumer to memoize.
  alive: () => Player[];
  aliveIndices: () => number[];
}

// ---------- Defaults -------------------------------------------------------

const DEFAULT_DISCUSSION = 90;

function emptyNightActions(): NightActions {
  return {
    wolfVotes: {},
    wolfTarget: null,
    seerTarget: null,
    seerResult: null,
    witchSaved: false,
    witchPoisoned: null,
  };
}

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
    round: 0,
    playerCount: MIN_PLAYERS,
    composition: { ...COMPOSITIONS[MIN_PLAYERS] },
    players: [],
    discussionSeconds: DEFAULT_DISCUSSION,
    revealIndex: 0,
    voteIndex: 0,
    dayVotes: [],
    nightActions: emptyNightActions(),
    nightStepIndex: 0,
    pendingDeaths: [],
    hunterToAct: null,
    resumePhase: null,
    winner: null,
    log: [],
  };
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

  const setDiscussionSeconds = useCallback((n: number) => {
    setState((s) => ({
      ...s,
      discussionSeconds: Math.max(15, Math.min(600, n)),
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
        hasAntidote: role === "witch",
        hasPoison: role === "witch",
      }));
      return {
        ...initialState(),
        playerCount: s.playerCount,
        composition: comp,
        discussionSeconds: s.discussionSeconds,
        phase: "reveal",
        players,
        revealIndex: 0,
        round: 1,
        log: [
          {
            round: 1,
            text: `${players.length} players. ${
              players.filter((p) => p.role === "werewolf").length
            } werewolf(s) stalk the village.`,
            kind: "info",
          },
        ],
      };
    });
  }, []);

  const reset = useCallback(() => setState(initialState()), []);

  // --- Role reveal ---------------------------------------------------------

  const confirmReveal = useCallback(() => {
    setState((s) => {
      const next = s.revealIndex + 1;
      if (next >= s.players.length) {
        return {
          ...s,
          revealIndex: s.players.length,
          phase: "day",
        };
      }
      return { ...s, revealIndex: next };
    });
  }, []);

  // --- Day -----------------------------------------------------------------

  const startDay = useCallback(() => {
    setState((s) => ({ ...s, phase: "day" }));
  }, []);

  const startVote = useCallback(() => {
    setState((s) => ({
      ...s,
      phase: "vote",
      voteIndex: 0,
      dayVotes: [],
    }));
  }, []);

  const submitVote = useCallback((target: number) => {
    setState((s) => {
      const alive = s.players.filter((p) => p.alive);
      const voter = alive[s.voteIndex];
      if (!voter) return s;
      const votes = [...s.dayVotes, { voter: voter.index, target }];
      const nextIdx = s.voteIndex + 1;
      if (nextIdx >= alive.length) {
        // All voters have spoken — resolve immediately.
        return computeDayResolution({
          ...s,
          dayVotes: votes,
          voteIndex: nextIdx,
          phase: "resolveDay",
        });
      }
      return { ...s, dayVotes: votes, voteIndex: nextIdx };
    });
  }, []);

  // --- Night intro ---------------------------------------------------------

  const startNightIntro = useCallback(() => {
    setState((s) => ({
      ...s,
      phase: "nightIntro",
      nightActions: emptyNightActions(),
      nightStepIndex: 0,
    }));
  }, []);

  // --- Night sub-steps -----------------------------------------------------

  const advanceNightStep = useCallback(() => {
    setState((s) => {
      const stepOrder: Array<"wolves" | "seer" | "witch"> = ["wolves", "seer", "witch"];
      let idx = s.nightStepIndex;
      // Move to the next live actor. If none remain, resolve night.
      while (idx < stepOrder.length) {
        const actor = stepOrder[idx];
        const hasActor = s.players.some(
          (p) => p.alive && ROLES[p.role].nightAction === actor
        );
        if (hasActor) {
          return {
            ...s,
            nightStepIndex: idx,
            phase:
              actor === "wolves"
                ? "nightWolves"
                : actor === "seer"
                  ? "nightSeer"
                  : "nightWitch",
          };
        }
        idx += 1;
      }
      // Past the last step — resolve.
      return computeNightResolution({ ...s, nightStepIndex: idx });
    });
  }, []);

  const submitWolfVote = useCallback((target: number) => {
    setState((s) => {
      const wolves = s.players.filter((p) => p.alive && p.role === "werewolf");
      if (wolves.length === 0) return s;
      // For v1 we let any wolf's choice stick; consensus is handled socially.
      const voter = wolves[0];
      return {
        ...s,
        nightActions: {
          ...s.nightActions,
          wolfVotes: { [voter.index]: target },
          wolfTarget: target,
        },
      };
    });
  }, []);

  const submitSeerInspect = useCallback((target: number) => {
    setState((s) => {
      const tp = s.players[target];
      const result: "wolf" | "not-wolf" =
        tp && tp.role === "werewolf" ? "wolf" : "not-wolf";
      return {
        ...s,
        nightActions: {
          ...s.nightActions,
          seerTarget: target,
          seerResult: result,
        },
      };
    });
  }, []);

  const submitWitch = useCallback(
    (opts: { save: boolean; poison: number | null }) => {
      setState((s) => {
        const witchIdx = s.players.findIndex(
          (p) => p.alive && p.role === "witch"
        );
        if (witchIdx < 0) return s;
        const witch = s.players[witchIdx];
        let saved = false;
        let poisoned: number | null = null;
        let updatedAntidote = witch.hasAntidote;
        let updatedPoison = witch.hasPoison;
        if (opts.save && witch.hasAntidote) {
          saved = true;
          updatedAntidote = false;
        }
        if (opts.poison !== null && witch.hasPoison) {
          poisoned = opts.poison;
          updatedPoison = false;
        }
        const updatedPlayers = s.players.map((p) =>
          p.index === witchIdx
            ? { ...p, hasAntidote: updatedAntidote, hasPoison: updatedPoison }
            : p
        );
        return {
          ...s,
          players: updatedPlayers,
          nightActions: {
            ...s.nightActions,
            witchSaved: saved,
            witchPoisoned: poisoned,
          },
        };
      });
    },
    []
  );

  const submitHunterPick = useCallback((target: number) => {
    setState((s) => {
      if (s.hunterToAct === null) return s;
      const newDeath: DeathEvent = {
        index: target,
        cause: "hunter",
        by: s.hunterToAct,
      };
      const updatedPlayers = s.players.map((p) =>
        p.index === target ? { ...p, alive: false } : p
      );
      const t = s.players[target];
      const log = [
        ...s.log,
        {
          round: s.round,
          text: `${s.players[s.hunterToAct].name} the Hunter took ${
            t.name
          } down with them.`,
          kind: "hunter" as const,
        },
      ];
      const winner = checkWinner(updatedPlayers);
      if (winner) {
        return {
          ...s,
          players: updatedPlayers,
          pendingDeaths: [...s.pendingDeaths, newDeath],
          hunterToAct: null,
          resumePhase: null,
          phase: "gameover",
          winner,
          log: [
            ...log,
            {
              round: s.round,
              text:
                winner === "village"
                  ? "The village wins. The wolves are no more."
                  : "The wolves win. Darkness consumes the village.",
              kind: "win" as const,
            },
          ],
        };
      }
      // Resume the resolve screen that originally kicked off the hunter.
      const back =
        s.resumePhase === "resolveNight" ? "resolveNight" : "resolveDay";
      return {
        ...s,
        players: updatedPlayers,
        pendingDeaths: [...s.pendingDeaths, newDeath],
        hunterToAct: null,
        resumePhase: null,
        phase: back,
        log,
      };
    });
  }, []);

  // --- Generic advance after a resolution screen --------------------------

  const proceed = useCallback(() => {
    setState((s) => {
      const winner = checkWinner(s.players);
      if (winner) {
        const log = [
          ...s.log,
          {
            round: s.round,
            text:
              winner === "village"
                ? "The village wins. The wolves are no more."
                : "The wolves win. Darkness consumes the village.",
            kind: "win" as const,
          },
        ];
        return {
          ...s,
          phase: "gameover",
          winner,
          pendingDeaths: [],
          log,
        };
      }
      if (s.phase === "resolveDay") {
        return {
          ...s,
          phase: "nightIntro",
          nightStepIndex: 0,
          nightActions: emptyNightActions(),
          pendingDeaths: [],
        };
      }
      if (s.phase === "resolveNight") {
        return {
          ...s,
          phase: "day",
          round: s.round + 1,
          pendingDeaths: [],
        };
      }
      return { ...s, pendingDeaths: [] };
    });
  }, []);

  // --- Selectors -----------------------------------------------------------

  const alive = useMemo<Player[]>(
    () => state.players.filter((p) => p.alive),
    [state.players]
  );
  const aliveIndices = useMemo<number[]>(
    () => state.players.filter((p) => p.alive).map((p) => p.index),
    [state.players]
  );

  const value = useMemo(
    () => ({
      ...state,
      setPlayerCount,
      setDiscussionSeconds,
      startGame,
      reset,
      confirmReveal,
      startDay,
      startVote,
      submitVote,
      startNightIntro,
      advanceNightStep,
      submitWolfVote,
      submitSeerInspect,
      submitWitch,
      submitHunterPick,
      proceed,
      alive: () => alive,
      aliveIndices: () => aliveIndices,
    }),
    [
      state,
      setPlayerCount,
      setDiscussionSeconds,
      startGame,
      reset,
      confirmReveal,
      startDay,
      startVote,
      submitVote,
      startNightIntro,
      advanceNightStep,
      submitWolfVote,
      submitSeerInspect,
      submitWitch,
      submitHunterPick,
      proceed,
      alive,
      aliveIndices,
    ]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}

// ---------- Helpers --------------------------------------------------------

/** Compute who dies from the day's vote; apply to players.alive, stash the
 *  events in pendingDeaths for the resolve screen. */
function computeDayResolution(s: GameState): GameState {
  const tally: Record<number, number> = {};
  s.dayVotes.forEach((v) => {
    tally[v.target] = (tally[v.target] ?? 0) + 1;
  });
  let topTarget: number | null = null;
  let topCount = 0;
  let tied = false;
  Object.entries(tally).forEach(([k, n]) => {
    if (n > topCount) {
      topTarget = Number(k);
      topCount = n;
      tied = false;
    } else if (n === topCount) {
      tied = true;
    }
  });

  const deaths: DeathEvent[] = [];
  let log: GameLogEntry[] = [...s.log];

  if (topTarget !== null && !tied) {
    deaths.push({ index: topTarget, cause: "vote" });
    const target = s.players[topTarget];
    log = [
      ...log,
      {
        round: s.round,
        text: `The village executed ${target.name} (${ROLES[target.role].name.en}).`,
        kind: "vote",
      },
    ];
  } else {
    log = [
      ...log,
      {
        round: s.round,
        text: "The vote was tied — no one is executed.",
        kind: "vote",
      },
    ];
  }

  return applyDeaths({
    ...s,
    pendingDeaths: deaths,
    log,
  });
}

/** Compute night deaths from collected actions; apply, stash. */
function computeNightResolution(s: GameState): GameState {
  const deaths: DeathEvent[] = [];
  const log = [...s.log];

  const wolfTarget = s.nightActions.wolfTarget;
  if (
    wolfTarget !== null &&
    !s.nightActions.witchSaved &&
    s.players[wolfTarget]?.alive
  ) {
    deaths.push({ index: wolfTarget, cause: "wolves" });
    const t = s.players[wolfTarget];
    log.push({
      round: s.round,
      text: `Wolves devoured ${t.name} (${ROLES[t.role].name.en}) during the night.`,
      kind: "death",
    });
  } else if (wolfTarget !== null && s.nightActions.witchSaved) {
    const t = s.players[wolfTarget];
    log.push({
      round: s.round,
      text: `The Witch saved ${
        t ? t.name : "the victim"
      } from the wolves' jaws.`,
      kind: "witch",
    });
  }

  const poisoned = s.nightActions.witchPoisoned;
  if (poisoned !== null && s.players[poisoned]?.alive) {
    deaths.push({ index: poisoned, cause: "witch" });
    const t = s.players[poisoned];
    log.push({
      round: s.round,
      text: `The Witch poisoned ${t.name} (${ROLES[t.role].name.en}).`,
      kind: "witch",
    });
  }

  return applyDeaths({
    ...s,
    pendingDeaths: deaths,
    phase: "resolveNight",
    log,
  });
}

/** Mark players dead, fire hunter pickup if a hunter just died. */
function applyDeaths(s: GameState): GameState {
  if (s.pendingDeaths.length === 0) return s;
  let players = s.players.map((p) => ({ ...p }));
  const deadSet = new Set<number>();
  s.pendingDeaths.forEach((d) => {
    if (players[d.index]?.alive) deadSet.add(d.index);
  });
  deadSet.forEach((idx) => {
    players[idx] = { ...players[idx], alive: false };
  });
  const hunterDied = s.pendingDeaths.some(
    (d) => players[d.index]?.role === "hunter"
  );
  if (hunterDied) {
    const hunterIdx = s.pendingDeaths.find(
      (d) => players[d.index]?.role === "hunter"
    )!.index;
    return {
      ...s,
      players,
      phase: "hunterPick",
      hunterToAct: hunterIdx,
      resumePhase: s.phase,
    };
  }
  return { ...s, players };
}

/** Check end conditions against the current player list. */
export function checkWinner(players: Player[]): "village" | "wolves" | null {
  const wolves = players.filter((p) => p.alive && p.role === "werewolf").length;
  const village = players.filter((p) => p.alive && p.role !== "werewolf").length;
  if (wolves === 0) return "village";
  if (wolves >= village) return "wolves";
  return null;
}
