import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface HowToPlayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function HowToPlayDialog({ open, onOpenChange }: HowToPlayDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="rule-dialog-content"
        className="max-w-[320px] rounded-2xl border-slate-800 bg-slate-900 text-slate-100"
      >
        <DialogHeader>
          <DialogTitle className="font-heading tracking-tight text-white">How to play</DialogTitle>
          <DialogDescription className="text-slate-400">
            Four directions. One rule. Don&apos;t blink.
          </DialogDescription>
        </DialogHeader>
        <ol className="space-y-3 text-sm leading-relaxed text-slate-300">
          <li className="flex gap-2.5">
            <span className="font-mono font-bold text-sky-400">1</span>
            Swipe in the direction the cyan arrow points.
          </li>
          <li className="flex gap-2.5">
            <span className="font-mono font-bold text-rose-400">2</span>
            Red arrow? Swipe the <strong className="text-rose-300">opposite</strong> direction.
          </li>
          <li className="flex gap-2.5">
            <span className="font-mono font-bold text-sky-400">3</span>
            The two small arrows preview your next two moves — same color rules.
          </li>
          <li className="flex gap-2.5">
            <span className="font-mono font-bold text-amber-400">4</span>
            Every point shrinks the time limit. One wrong move — or one beat too slow — ends the
            run.
          </li>
        </ol>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
          Touch: swipe · Desktop: press and drag
        </p>
      </DialogContent>
    </Dialog>
  );
}
