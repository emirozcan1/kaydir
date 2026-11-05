import { useCallback, useEffect, useRef, useState } from "react";
import {
  DIR_VECTOR,
  REVERSE_UNLOCK_SCORE,
  BASE_TIME_MS,
  expectedSwipe,
  loadBest,
  makeArrow,
  makeQueue,
  saveBest,
  timeLimitMs,
  vibrate,
} from "@/lib/game";
import type { Direction, GameArrow } from "@/lib/game";
import { sfx } from "@/lib/audio";

export type GamePhase = "idle" | "playing" | "over";
export type FailReason = "wrong" | "timeout";

export interface Milestone {
  key: number;
  score: number;
}

// The game engine: a three-arrow queue (playable arrow + two previews), a
// requestAnimationFrame deadline loop and pure input handling. Animations never
// gate the logic — input is judged against the queue the instant it lands.
export function useGameEngine() {
  const [phase, setPhase] = useState<GamePhase>("idle");
  const [queue, setQueue] = useState<GameArrow[]>(() => makeQueue(0, 3));
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => loadBest());
  const [reason, setReason] = useState<FailReason | null>(null);
  const [isRecord, setIsRecord] = useState(false);
  const [pulse, setPulse] = useState({ key: 0, dir: "up" as Direction });
  const [errorKey, setErrorKey] = useState(0);
  const [milestone, setMilestone] = useState<Milestone>({ key: 0, score: 0 });

  // Mirrors for the rAF loop and event handlers — stale closures would kill input.
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const queueRef = useRef(queue);
  queueRef.current = queue;
  const scoreRef = useRef(score);
  scoreRef.current = score;
  const bestRef = useRef(best);
  bestRef.current = best;
  const deadlineRef = useRef(0);
  const limitRef = useRef(BASE_TIME_MS);
  // Direction the solved arrow should fly out towards (screen-space px).
  const flyRef = useRef({ x: 0, y: -90 });
  const timerListeners = useRef(new Set<(ratio: number) => void>());

  const end = useCallback((why: FailReason) => {
    if (phaseRef.current !== "playing") return;
    phaseRef.current = "over";
    setPhase("over");
    setReason(why);
    sfx.gameOver();
    vibrate([60, 40, 120]);
    if (scoreRef.current > bestRef.current) {
      bestRef.current = scoreRef.current;
      setBest(scoreRef.current);
      saveBest(scoreRef.current);
      setIsRecord(true);
      window.setTimeout(() => sfx.newRecord(), 700);
    } else {
      setIsRecord(false);
    }
  }, []);

  const start = useCallback(() => {
    if (phaseRef.current === "playing") return;
    const fresh = makeQueue(0, 3);
    queueRef.current = fresh;
    setQueue(fresh);
    scoreRef.current = 0;
    setScore(0);
    setReason(null);
    setIsRecord(false);
    const limit = timeLimitMs(0);
    limitRef.current = limit;
    deadlineRef.current = performance.now() + limit;
    phaseRef.current = "playing";
    setPhase("playing");
    timerListeners.current.forEach((cb) => cb(1));
    sfx.start();
  }, []);

  const submit = useCallback(
    (dir: Direction) => {
      if (phaseRef.current !== "playing") return;
      const current = queueRef.current[0];
      if (!current) return;

      if (dir !== expectedSwipe(current)) {
        setErrorKey((k) => k + 1);
        end("wrong");
        return;
      }

      const v = DIR_VECTOR[dir];
      flyRef.current = { x: v.x * 90, y: v.y * 90 };
      setPulse((p) => ({ key: p.key + 1, dir }));

      const next = scoreRef.current + 1;
      scoreRef.current = next;
      setScore(next);
      if (next % 10 === 0) {
        setMilestone({ key: next / 10, score: next });
        sfx.milestone();
      } else if (current.reversed) {
        sfx.reverse();
      } else {
        sfx.correct();
      }
      vibrate(8);

      // Pop the queue: preview 1 slides into the main slot, a new tail spawns.
      const tail = makeArrow(queueRef.current[2], next + 2 >= REVERSE_UNLOCK_SCORE);
      const grown = [...queueRef.current.slice(1), tail];
      queueRef.current = grown;
      setQueue(grown);

      const limit = timeLimitMs(next);
      limitRef.current = limit;
      deadlineRef.current = performance.now() + limit;
    },
    [end],
  );

  // Subscribers get the raw timer ratio each frame and paint it straight to the
  // DOM — the timer never triggers a React render.
  const subscribeTimer = useCallback((cb: (ratio: number) => void) => {
    timerListeners.current.add(cb);
    return () => {
      timerListeners.current.delete(cb);
    };
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    let raf = 0;
    const tick = () => {
      const ratio = Math.max(0, (deadlineRef.current - performance.now()) / limitRef.current);
      timerListeners.current.forEach((cb) => cb(ratio));
      if (ratio <= 0) {
        end("timeout");
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, end]);

  return {
    phase,
    queue,
    score,
    best,
    reason,
    isRecord,
    pulse,
    errorKey,
    milestone,
    flyRef,
    start,
    submit,
    subscribeTimer,
  };
}
