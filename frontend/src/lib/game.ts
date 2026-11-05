// Pure game logic for Reverse Arcade — no React, no DOM. The engine hook and the
// stage components both import from here so the rules live in exactly one place.

export type Direction = "up" | "down" | "left" | "right";

export interface GameArrow {
  id: string;
  dir: Direction;
  reversed: boolean;
}

export const DIRECTIONS: Direction[] = ["up", "down", "left", "right"];

export const OPPOSITE: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

// Unit vector of each direction in screen space (y grows downward).
export const DIR_VECTOR: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

// Difficulty curve: every point shaves 45ms off the next arrow's time limit, floor 650ms.
export const BASE_TIME_MS = 2000;
export const MIN_TIME_MS = 650;
export const TIME_STEP_MS = 45;
export const REVERSE_CHANCE = 0.25;
export const REVERSE_UNLOCK_SCORE = 5; // red arrows only appear after 5 clean points
export const SWIPE_THRESHOLD_PX = 30;

export function timeLimitMs(score: number): number {
  return Math.max(MIN_TIME_MS, BASE_TIME_MS - score * TIME_STEP_MS);
}

// The one rule of the game: a normal arrow wants a swipe along its direction,
// a red arrow wants exactly the opposite.
export function expectedSwipe(arrow: GameArrow): Direction {
  return arrow.reversed ? OPPOSITE[arrow.dir] : arrow.dir;
}

let seq = 0;
export function makeArrow(prev?: GameArrow, allowReverse = true): GameArrow {
  let dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
  let reversed = allowReverse && Math.random() < REVERSE_CHANCE;
  // Never serve the exact same puzzle twice in a row.
  let guard = 0;
  while (prev && dir === prev.dir && reversed === prev.reversed && guard++ < 16) {
    dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
    reversed = allowReverse && Math.random() < REVERSE_CHANCE;
  }
  seq += 1;
  return { id: `a${Date.now().toString(36)}-${seq.toString(36)}`, dir, reversed };
}

export function makeQueue(startScore = 0, length = 3): GameArrow[] {
  const queue: GameArrow[] = [];
  for (let i = 0; i < length; i += 1) {
    queue.push(makeArrow(queue[i - 1], startScore + i >= REVERSE_UNLOCK_SCORE));
  }
  return queue;
}

// Device-only persistence (per spec: no server features).
const BEST_KEY = "ra_best_score";

export function loadBest(): number {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

export function saveBest(score: number): void {
  try {
    localStorage.setItem(BEST_KEY, String(score));
  } catch {
    // private mode / storage disabled — the session still plays fine
  }
}

export function vibrate(ms: number | number[]): void {
  try {
    navigator.vibrate?.(ms);
  } catch {
    // unsupported — haptics are a bonus, never a dependency
  }
}
