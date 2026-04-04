import React from "react";
import { cn } from "@/lib/utils";

interface RippleProps {
  mainCircleSize?: number;
  mainCircleOpacity?: number;
  numCircles?: number;
  circleGap?: number;
  className?: string;
  origin?: "center" | "top-left";
  originOffsetX?: string;
  originOffsetY?: string;
  showOverlay?: boolean;
}

const Ripple = React.memo(function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 8,
  circleGap = 70,
  className,
  origin = "center",
  originOffsetX = "0px",
  originOffsetY = "0px",
  showOverlay = true,
}: RippleProps) {
  const isTopLeft = origin === "top-left";

  return (
    <div
      className={cn(
        "absolute inset-0",
        showOverlay && "bg-white/5 [mask-image:linear-gradient(to_bottom,white,transparent)]",
        className,
      )}
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * circleGap;
        const opacity = mainCircleOpacity - i * 0.03;
        const animationDelay = `${i * 0.06}s`;
        const borderStyle = i === numCircles - 1 ? "dashed" : "solid";
        const borderOpacity = 5 + i * 5;

        return (
          <div
            key={i}
            className={`absolute animate-ripple rounded-full bg-foreground/25 shadow-xl border`}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              opacity,
              animationDelay,
              borderStyle,
              borderWidth: "1px",
              borderColor: `hsl(var(--foreground), ${borderOpacity / 100})`,
              top: isTopLeft ? originOffsetY : "50%",
              left: isTopLeft ? originOffsetX : "50%",
              transform: "translate(-50%, -50%) scale(1)",
            }}
          />
        );
      })}
    </div>
  );
});

Ripple.displayName = "Ripple";

export default Ripple;
