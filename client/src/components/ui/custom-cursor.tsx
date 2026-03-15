import { useEffect, useRef, useState } from "react";

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
  const [hidden, setHidden]   = useState(true);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (hidden) setHidden(false);

      const target = e.target as Element;
      setHovered(!!target.closest(INTERACTIVE));
    };

    const onLeave = () => setHidden(true);
    const onEnter = () => setHidden(false);

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      ring.current.x = lerp(ring.current.x, pos.current.x, 0.12);
      ring.current.y = lerp(ring.current.y, pos.current.y, 0.12);

      if (dotRef.current) {
        dotRef.current.style.transform =
          `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform =
          `translate(${ring.current.x}px, ${ring.current.y}px) translate(-50%, -50%)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [hidden]);

  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  return (
    <>
      {/* Small dot — snaps instantly */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full will-change-transform"
        style={{
          width: hovered ? 10 : 6,
          height: hovered ? 10 : 6,
          background: "white",
          mixBlendMode: "difference",
          opacity: hidden ? 0 : 1,
          transition: "width 0.2s ease, height 0.2s ease, opacity 0.2s ease",
        }}
      />

      {/* Outer ring — lags behind with lerp */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full will-change-transform"
        style={{
          width: hovered ? 48 : 28,
          height: hovered ? 48 : 28,
          background: hovered ? "white" : "transparent",
          border: "1.5px solid white",
          mixBlendMode: "difference",
          opacity: hidden ? 0 : 1,
          transition: "width 0.25s ease, height 0.25s ease, background 0.2s ease, opacity 0.2s ease",
        }}
      />
    </>
  );
}
