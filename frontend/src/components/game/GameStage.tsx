import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import { AnimatePresence, motion, useAnimationControls } from "motion/react";
import NeonArrow from "@/components/game/NeonArrow";
import { DIR_VECTOR, SWIPE_THRESHOLD_PX } from "@/lib/game";
import type { Direction, GameArrow } from "@/lib/game";
import type { GamePhase, Milestone } from "@/hooks/useGameEngine";

const SPRING = { type: "spring", stiffness: 450, damping: 30 } as const;

// Slot geometry inside the fixed 380px stack, measured from the arena center
// (arena center sits 250px from the stack top). Index 0 is the big playable
// arrow; 1 and 2 are the two move previews floating above it.
const SLOTS: Array<{ y: number; scale: number; opacity: number }> = [
  { y: 0, scale: 0.62, opacity: 1 },
  { y: -146, scale: 0.42, opacity: 0.9 },
  { y: -220, scale: 0.34, opacity: 0.5 },
];

const PARTICLE_SPREAD = [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5];

interface GameStageProps {
  phase: GamePhase;
  queue: GameArrow[];
  pulse: { key: number; dir: Direction };
  errorKey: number;
  milestone: Milestone;
  flyRef: RefObject<{ x: number; y: number }>;
  onSwipe: (dir: Direction) => void;
  subscribeTimer: (cb: (ratio: number) => void) => () => void;
}

export default function GameStage({
  phase,
  queue,
  pulse,
  errorKey,
  milestone,
  flyRef,
  onSwipe,
  subscribeTimer,
}: GameStageProps) {
  const shake = useAnimationControls();
  const [urgent, setUrgent] = useState(false);
  const urgentRef = useRef(false);
  const fillRef = useRef<HTMLDivElement | null>(null);
  const timerColorRef = useRef("");
  const [trail, setTrail] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(
    null,
  );
  const dragRef = useRef<{ id: number; x: number; y: number; mouse: boolean; done: boolean } | null>(
    null,
  );
  const [showMilestone, setShowMilestone] = useState(false);

  // The timer paints straight to the bar's transform each frame — no React
  // renders in the hot path, so the game logic is never blocked by visuals.
  useEffect(
    () =>
      subscribeTimer((r) => {
        const el = fillRef.current;
        if (el) {
          el.style.transform = `scaleX(${r})`;
          const nextColor = r > 0.5 ? "#38BDF8" : r > 0.25 ? "#F59E0B" : "#FF3366";
          if (timerColorRef.current !== nextColor) {
            timerColorRef.current = nextColor;
            el.style.backgroundColor = nextColor;
          }
        }
        const nowUrgent = r <= 0.25;
        if (nowUrgent !== urgentRef.current) {
          urgentRef.current = nowUrgent;
          setUrgent(nowUrgent);
        }
      }),
    [subscribeTimer],
  );

  // Wrong-move feedback: one aggressive shake + crimson flash, nothing more.
  useEffect(() => {
    if (errorKey === 0) return;
    void shake.start({ x: [-12, 12, -8, 8, 0], transition: { duration: 0.35 } });
  }, [errorKey, shake]);

  useEffect(() => {
    if (milestone.key === 0) return;
    setShowMilestone(true);
    const t = window.setTimeout(() => setShowMilestone(false), 1100);
    return () => window.clearTimeout(t);
  }, [milestone]);

  const playing = phase === "playing";

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!playing || dragRef.current) return;
    dragRef.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      mouse: e.pointerType === "mouse",
      done: false,
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // capture is best-effort — gestures still work inside the surface
    }
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.done || e.pointerId !== drag.id) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x1 = e.clientX - rect.left;
    const y1 = e.clientY - rect.top;
    if (drag.mouse) {
      setTrail({ x0: drag.x - rect.left, y0: drag.y - rect.top, x1, y1 });
    }
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (Math.hypot(dx, dy) < SWIPE_THRESHOLD_PX) return;
    drag.done = true; // one move per press — lift to swipe again
    onSwipe(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
  };

  const onPointerUp = () => {
    dragRef.current = null;
    setTrail(null);
  };

  const current = queue[0];

  return (
    <div
      data-testid="swipe-surface"
      className="absolute inset-0 flex touch-none select-none items-center justify-center active:cursor-grabbing" style={{ touchAction: "none", WebkitUserSelect: "none", WebkitTouchCallout: "none" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* streak badge — pops at every 10-point milestone */}
      <div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex justify-center">
        <AnimatePresence>
          {showMilestone && (
            <motion.span
              data-testid="combo-multiplier-badge"
              initial={{ opacity: 0, y: -14, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}
              className="rounded-full border border-amber-400/50 bg-amber-400/15 px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-amber-300 shadow-[0_0_24px_rgba(250,204,21,0.25)]"
            >
              Streak ×{milestone.score}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="game-stack relative h-[380px] w-full max-w-[340px]">
        <motion.div animate={shake} className="absolute inset-0">
          {/* arena plate — also carries the machine-readable current puzzle state
              (always exactly one element, never stale during queue transitions) */}
          <div
            data-testid="main-arrow-box"
            data-dir={current?.dir}
            data-reversed={current ? (current.reversed ? "true" : "false") : "false"}
            className={`absolute left-1/2 top-[250px] z-0 flex h-48 w-48 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-3xl border backdrop-blur-sm transition-colors duration-200 ${
              urgent
                ? "border-rose-500/70 bg-slate-900/75 shadow-[inset_0_2px_16px_rgba(0,0,0,0.65),0_0_32px_rgba(255,51,102,0.25)]"
                : "border-slate-700/60 bg-slate-900/70 shadow-[inset_0_2px_16px_rgba(0,0,0,0.65)]"
            }`}
          >
            {/* depleting timer bar — color steps cyan → amber → crimson */}
            <div className="absolute inset-x-5 bottom-3 h-1.5 overflow-hidden rounded-full bg-[#1F2937]">
              <div
                ref={fillRef}
                data-testid="timer-progress-bar"
                className="h-full w-full origin-left rounded-full"
                style={{ transform: "scaleX(1)", backgroundColor: "#38BDF8" }}
              />
            </div>
          </div>

          {/* rule pill under the plate */}
          <div className="absolute left-1/2 top-[356px] z-10 -translate-x-1/2">
            <AnimatePresence mode="wait">
              {current && (
                <motion.span
                  key={current.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className={`block whitespace-nowrap rounded-full px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] ${
                    current.reversed ? "bg-rose-700/80 text-rose-50" : "bg-sky-600/80 text-sky-50"
                  }`}
                >
                  {current.reversed ? "Swipe opposite" : "Swipe same"}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* ping ring on every correct answer */}
          {pulse.key > 0 && (
            <div className="pointer-events-none absolute left-1/2 top-[250px] z-10 h-48 w-48 -translate-x-1/2 -translate-y-1/2">
              <motion.div
                key={`ring-${pulse.key}`}
                className="h-full w-full rounded-3xl border-2 border-sky-400/70"
                initial={{ opacity: 0.7, scale: 1 }}
                animate={{ opacity: 0, scale: 1.3 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
          )}

          {/* directional particle burst along the swipe vector */}
          {pulse.key > 0 && (
            <div className="pointer-events-none absolute left-1/2 top-[250px] z-10">
              {(() => {
                const v = DIR_VECTOR[pulse.dir];
                const perp = { x: -v.y, y: v.x };
                return PARTICLE_SPREAD.map((k) => (
                  <motion.span
                    key={`p-${pulse.key}-${k}`}
                    className="absolute h-1.5 w-1.5 rounded-full bg-sky-300"
                    initial={{ x: 0, y: 0, opacity: 0.9, scale: 1 }}
                    animate={{
                      x: v.x * 70 + perp.x * k * 13,
                      y: v.y * 70 + perp.y * k * 13,
                      opacity: 0,
                      scale: 0.3,
                    }}
                    transition={{ duration: 0.32, ease: "easeOut" }}
                  />
                ));
              })()}
            </div>
          )}

          {/* red flash on game over */}
          {errorKey > 0 && (
            <motion.div
              key={`flash-${errorKey}`}
              className="pointer-events-none absolute inset-0 z-20 bg-rose-500/15"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            />
          )}

          {/* the arrow queue: solved arrows fly out, previews advance into the main slot */}
          <AnimatePresence>
            {queue.map((arrow, i) => (
              <motion.div
                key={arrow.id}
                className="absolute left-1/2 top-[170px] z-10"
                initial={{ x: "-50%", y: SLOTS[i].y, scale: SLOTS[i].scale, opacity: 0 }}
                animate={{
                  x: "-50%",
                  y: SLOTS[i].y,
                  scale: SLOTS[i].scale,
                  opacity: SLOTS[i].opacity,
                }}
                exit={{ opacity: 0, transition: { duration: 0.18 } }}
                transition={SPRING}
              >
                <motion.div
                  className="flex h-40 w-40 items-center justify-center"
                  initial={{ scale: 0.5, rotate: -8, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  exit={{
                    x: flyRef.current.x,
                    y: flyRef.current.y,
                    scale: 1.25,
                    opacity: 0,
                    transition: { duration: 0.22, ease: "easeOut" },
                  }}
                  transition={{ duration: 0.3, ease: "backOut" }}
                >
                  <NeonArrow
                    dir={arrow.dir}
                    reversed={arrow.reversed}
                    className="h-24 w-24"
                    data-dir={arrow.dir}
                    data-reversed={arrow.reversed ? "true" : "false"}
                    data-testid={i === 0 ? "main-arrow-svg" : i === 1 ? "preview-arrow-1" : "preview-arrow-2"}
                  />
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* mouse drag ghost trail (desktop) */}
      <svg className="pointer-events-none absolute inset-0 z-30 h-full w-full">
        {trail && (
          <>
            <circle cx={trail.x0} cy={trail.y0} r={5} fill="rgba(125,211,252,0.6)" />
            <line
              x1={trail.x0}
              y1={trail.y0}
              x2={trail.x1}
              y2={trail.y1}
              stroke="rgba(125,211,252,0.5)"
              strokeWidth={3}
              strokeLinecap="round"
            />
          </>
        )}
      </svg>
    </div>
  );
}
