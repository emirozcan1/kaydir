import type { ComponentProps } from "react";
import type { Direction } from "@/lib/game";

const ROTATION: Record<Direction, number> = { up: 0, right: 90, down: 180, left: 270 };

type NeonArrowProps = ComponentProps<"svg"> & {
  dir: Direction;
  reversed: boolean;
};

// The arrow glyph: drawn pointing up, rotated per direction. Cyan = follow the
// arrow, crimson = do the opposite — the rule the whole game hangs on.
export default function NeonArrow({ dir, reversed, className, style, ...rest }: NeonArrowProps) {
  const core = reversed ? "#FF5C8A" : "#7DD3FC";
  const glow = reversed ? "rgba(255, 51, 102, 0.55)" : "rgba(56, 189, 248, 0.55)";
  const rotation = ROTATION[dir];

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      style={{
        filter: `drop-shadow(0 0 10px ${glow}) drop-shadow(0 0 26px ${glow})`,
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
        ...style,
      }}
      aria-hidden="true"
      {...rest}
    >
      <path d="M50 10 L84 52 L66 52 L66 86 L34 86 L34 52 L16 52 Z" fill={core} />
    </svg>
  );
}
