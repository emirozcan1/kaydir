import { useCallback, useState } from "react";
import { AnimatePresence } from "motion/react";
import { HelpCircle, RotateCcw, Trophy, Volume2, VolumeX, Zap } from "lucide-react";
import { useGameEngine } from "@/hooks/useGameEngine";
import { sfx } from "@/lib/audio";
import GameStage from "@/components/game/GameStage";
import StartOverlay from "@/components/game/StartOverlay";
import GameOverOverlay from "@/components/game/GameOverOverlay";
import HowToPlayDialog from "@/components/game/HowToPlayDialog";
import { Button } from "@/components/ui/button";

export default function Game() {
  const engine = useGameEngine();
  const [soundOn, setSoundOn] = useState(sfx.enabled);
  const [helpOpen, setHelpOpen] = useState(false);

  const toggleSound = useCallback(() => {
    setSoundOn((prev) => {
      const next = !prev;
      sfx.setEnabled(next);
      return next;
    });
  }, []);

  return (
    <div
      data-testid="game-container"
      className="relative flex min-h-dvh flex-col items-center overflow-hidden bg-[#0B0F19] text-slate-100 sm:justify-center"
    >
      {/* ambience: drifting grid + neon auras */}
      <div className="pointer-events-none fixed inset-0">
        <div className="ra-grid absolute inset-0 opacity-[0.06]" />
        <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-sky-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-rose-500/10 blur-[120px]" />
      </div>

      <div className="ios-app-shell relative flex h-dvh w-full max-w-md flex-col overflow-hidden sm:h-[min(100dvh-2.5rem,880px)] sm:rounded-3xl sm:border sm:border-slate-800/80 sm:shadow-[0_0_60px_rgba(0,0,0,0.8)]">
        <header
          data-testid="game-header"
          className="z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-800/80 bg-slate-900/60 px-4 backdrop-blur-md"
        >
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-sky-500/15 ring-1 ring-sky-400/40">
              <Zap className="size-4 text-sky-300" />
            </div>
            <p className="font-heading text-sm font-bold uppercase tracking-[0.18em] text-white">
              Reverse <span className="text-sky-400">Arcade</span>
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              data-testid="sound-toggle-button"
              onClick={toggleSound}
              aria-label={soundOn ? "Mute sound" : "Unmute sound"}
            >
              {soundOn ? (
                <Volume2 className="size-4 text-sky-300" />
              ) : (
                <VolumeX className="size-4 text-slate-500" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              data-testid="help-header-button"
              onClick={() => setHelpOpen(true)}
              aria-label="How to play"
            >
              <HelpCircle className="size-4 text-slate-400" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              data-testid="restart-header-button"
              onClick={engine.start}
              disabled={engine.phase !== "playing"}
              aria-label="Restart run"
            >
              <RotateCcw className="size-4 text-slate-400" />
            </Button>
          </div>
        </header>

        {/* score HUD */}
        <div
          data-testid="score-hud"
          className="z-20 grid shrink-0 grid-cols-2 border-b border-slate-800/40 bg-slate-900/30 py-2 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">
              Score
            </p>
            <p
              data-testid="current-score-display"
              className="font-mono text-2xl font-black tracking-tight text-sky-400"
            >
              {engine.score}
            </p>
          </div>
          <div className="flex flex-col items-center">
            <p className="flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">
              <Trophy className="size-3 text-amber-400" /> Best
            </p>
            <p
              data-testid="best-score-display"
              className="font-mono text-2xl font-black tracking-tight text-amber-300"
            >
              {engine.best}
            </p>
          </div>
        </div>

        {/* swipe arena */}
        <main data-testid="swipe-stage" className="relative min-h-0 flex-1 overflow-hidden">
          <GameStage
            phase={engine.phase}
            queue={engine.queue}
            pulse={engine.pulse}
            errorKey={engine.errorKey}
            milestone={engine.milestone}
            flyRef={engine.flyRef}
            onSwipe={engine.submit}
            subscribeTimer={engine.subscribeTimer}
          />
        </main>

        <footer className="z-20 flex h-12 shrink-0 items-center justify-center border-t border-slate-800/60 bg-slate-950/80">
          <p className="px-4 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">
            Drag or swipe fast — red arrows go the opposite way
          </p>
        </footer>

        <AnimatePresence>
          {engine.phase === "idle" && (
            <StartOverlay
              key="start"
              best={engine.best}
              onStart={engine.start}
              onHowTo={() => setHelpOpen(true)}
            />
          )}
          {engine.phase === "over" && (
            <GameOverOverlay
              key="over"
              score={engine.score}
              best={engine.best}
              isRecord={engine.isRecord}
              reason={engine.reason ?? "wrong"}
              onRestart={engine.start}
            />
          )}
        </AnimatePresence>
      </div>

      <HowToPlayDialog open={helpOpen} onOpenChange={setHelpOpen} />
    </div>
  );
}
