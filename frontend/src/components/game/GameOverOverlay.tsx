import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import type { FailReason } from "@/hooks/useGameEngine";

interface GameOverOverlayProps {
  score: number;
  best: number;
  isRecord: boolean;
  reason: FailReason;
  onRestart: () => void;
}

export default function GameOverOverlay({
  score,
  best,
  isRecord,
  reason,
  onRestart,
}: GameOverOverlayProps) {
  return (
    <motion.div
      data-testid="game-over-modal"
      initial={{ opacity: 0, scale: 0.85, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className="pointer-events-none absolute inset-x-0 bottom-0 top-16 z-40 flex flex-col items-center justify-center gap-5 bg-slate-950/85 px-6 text-center backdrop-blur-xl"
    >
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-rose-400">
        {reason === "timeout" ? "Time's up" : "Wrong direction"}
      </p>
      <h2 className="font-heading text-4xl font-black tracking-tight text-white">GAME OVER</h2>

      {isRecord && (
        <motion.span
          data-testid="new-record-indicator"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 18, delay: 0.2 }}
          className="rounded-full border border-amber-300/60 bg-amber-400/15 px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-[0.2em] text-amber-300 shadow-[0_0_30px_rgba(250,204,21,0.35)]"
        >
          ★ New record ★
        </motion.span>
      )}

      <div className="flex items-end gap-10">
        <div className="flex flex-col items-center">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">
            Final score
          </p>
          <p
            data-testid="final-score-value"
            className="font-mono text-6xl font-black tracking-tight text-sky-400 [text-shadow:0_0_24px_rgba(56,189,248,0.4)]"
          >
            {score}
          </p>
        </div>
        <div className="flex flex-col items-center">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">
            Best
          </p>
          <p
            data-testid="game-over-best-score"
            className="font-mono text-3xl font-black tracking-tight text-amber-300"
          >
            {best}
          </p>
        </div>
      </div>

      <Button
        data-testid="play-again-button"
        size="lg"
        onClick={onRestart}
        className="pointer-events-auto h-14 rounded-2xl bg-sky-500 px-10 font-heading text-base font-bold uppercase tracking-[0.2em] text-slate-950 shadow-[0_0_36px_rgba(56,189,248,0.4)] hover:bg-sky-400"
      >
        Play again
      </Button>
    </motion.div>
  );
}
