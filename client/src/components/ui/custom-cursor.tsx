import { useEffect, useRef, useState, useCallback } from "react";

const INTERACTIVE = [
  "a", "button", "label", "input", "textarea", "select",
  "[role='button']", "[tabindex]", "h1", "h2", "h3", "p",
  "span", "li", "[data-cursor]",
].join(", ");

export function CustomCursor() {
  const dotRef   = useRef<HTMLDivElement>(null);
  const ringRef  = useRef<HTMLDivElement>(null);
  const pos      = useRef({ x: -100, y: -100 });
  const ring     = useRef({ x: -100, y: -100 });
  const rafRef   = useRef<number | null>(null);
  const lastMoveTime = useRef<number>(0);
  const isMoving = useRef<boolean>(false);
  const [hidden, setHidden]   = useState(true);
  const [hovered, setHovered] = useState(false);

  // Throttle mousemove events for better performance
  const throttledMouseMove = useCallback((e: MouseEvent) => {
    const now = performance.now();
    if (now - lastMoveTime.current < 8) return; // ~120fps max
    lastMoveTime.current = now;

    pos.current = { x: e.clientX, y: e.clientY };
    isMoving.current = true;
    
    if (hidden) setHidden(false);

    const target = e.target as Element;
    const isInteractive = !!target.closest(INTERACTIVE);
    if (hovered !== isInteractive) {
      setHovered(isInteractive);
    }
  }, [hidden, hovered]);

  useEffect(() => {
    const onLeave = () => setHidden(true);
    const onEnter = () => setHidden(false);

    window.addEventListener("mousemove", throttledMouseMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      // Higher lerp factor for less lag (0.25 instead of 0.12)
      const lerpFactor = 0.25;
      
      const prevRingX = ring.current.x;
      const prevRingY = ring.current.y;
      
      ring.current.x = lerp(ring.current.x, pos.current.x, lerpFactor);
      ring.current.y = lerp(ring.current.y, pos.current.y, lerpFactor);

      // Update dot position immediately (no lag)
      if (dotRef.current) {
        dotRef.current.style.transform =
          `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) translate(-50%, -50%)`;
      }

      // Update ring position with smooth following
      if (ringRef.current) {
        ringRef.current.style.transform =
          `translate3d(${ring.current.x}px, ${ring.current.y}px, 0) translate(-50%, -50%)`;
      }

      // Check if ring has reached close enough to target position
      const distance = Math.sqrt(
        Math.pow(pos.current.x - ring.current.x, 2) + 
        Math.pow(pos.current.y - ring.current.y, 2)
      );

      // Continue animation if moving or ring hasn't caught up
      if (isMoving.current || distance > 0.5) {
        isMoving.current = false; // Reset for next frame
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // Stop animation when cursor is idle and ring has caught up
        rafRef.current = null;
      }
    };

    // Start the animation loop
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", throttledMouseMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [throttledMouseMove]);

  // Hide cursor on touch devices
  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  return (
    <>
      {/* Small dot — snaps instantly */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full will-change-transform transform-gpu"
        style={{
          width: hovered ? 10 : 6,
          height: hovered ? 10 : 6,
          background: "white",
          mixBlendMode: "difference",
          opacity: hidden ? 0 : 1,
          transition: "width 0.15s ease-out, height 0.15s ease-out, opacity 0.15s ease-out",
        }}
      />

      {/* Outer ring — follows with smooth lag */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full will-change-transform transform-gpu"
        style={{
          width: hovered ? 48 : 28,
          height: hovered ? 48 : 28,
          background: hovered ? "white" : "transparent",
          border: "1.5px solid white",
          mixBlendMode: "difference",
          opacity: hidden ? 0 : 1,
          transition: "width 0.2s ease-out, height 0.2s ease-out, background 0.15s ease-out, opacity 0.15s ease-out",
        }}
      />
    </>
  );
}
