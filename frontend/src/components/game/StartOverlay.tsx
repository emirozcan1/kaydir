import { motion } from "motion/react";
import { Trophy } from "lucide-react";
import NeonArrow from "@/components/game/NeonArrow";
import { Button } from "@/components/ui/button";

interface StartOverlayProps {
  best: number;
  onStart: () => void;
  onHowTo: () => void;
}

export default function StartOverlay({ best, onStart, onHowTo }: StartOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25 }}
      className="pointer-events-none absolute inset-x-0 bottom-0 top-16 z-40 flex flex-col items-center justify-center gap-6 bg-slate-950/85 px-6 text-center backdrop-blur-xl"
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, type: "spring", stiffness: 300, damping: 26 }}
      >
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-sky-400">
          A neon reflex game
        </p>
        <h1 className="mt-2 font-heading text-5xl font-black leading-none tracking-tight text-white">
          REVERSE
          <span className="block text-sky-400 [text-shadow:0_0_28px_rgba(56,189,248,0.45)]">
            ARCADE
          </span>
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, type: "spring", stiffness: 300, damping: 26 }}
        className="w-full max-w-xs space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <NeonArrow dir="up" reversed={false} className="h-9 w-9 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-white">Follow the arrow</p>
            <p className="text-xs text-slate-400">Swipe the way it points</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <NeonArrow dir="up" reversed className="h-9 w-9 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-white">Red means reverse</p>
            <p className="text-xs text-slate-400">Swipe the opposite way</p>
          </div>
        </div>
      </motion.div>

      {best > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, type: "spring", stiffness: 300, damping: 26 }}
          className="flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-amber-300"
        >
          <Trophy className="size-3.5" /> Best {best}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24, type: "spring", stiffness: 300, damping: 26 }}
        className="flex w-full max-w-xs flex-col items-center gap-3"
      >
        <Button
          data-testid="start-game-button"
          size="lg"
          onClick={onStart}
          className="ra-glow-pulse pointer-events-auto h-14 w-full rounded-2xl bg-sky-500 font-heading text-base font-bold uppercase tracking-[0.2em] text-slate-950 hover:bg-sky-400"
        >
          Play
        </Button>
        <button
          data-testid="how-to-play-button"
          onClick={onHowTo}
          className="pointer-events-auto text-xs font-medium text-slate-400 underline-offset-4 hover:text-slate-200 hover:underline"
        >
          How to play
        </button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500"
      >
        Drag or swipe anywhere to steer
      </motion.p>
    </motion.div>
  );
}
