import { useEffect, useRef } from "react";

export function ScrollSnake() {
  const path1Ref = useRef<SVGPathElement>(null);
  const path2Ref = useRef<SVGPathElement>(null);
  const rafRef = useRef<number | null>(null);
  const currentX = useRef(0.5);
  const scrollRef = useRef(0);

  useEffect(() => {
    const scrollContainer = document.querySelector("main.flex-1");
    if (!scrollContainer) return;

    const onScroll = () => { scrollRef.current = (scrollContainer as HTMLElement).scrollTop; };
    scrollContainer.addEventListener("scroll", onScroll, { passive: true });

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const el = scrollContainer as HTMLElement;
      const maxScroll = Math.max(1, el.scrollHeight - H);
      const pct = scrollRef.current / maxScroll;

      const targetX = 0.5 + Math.sin(pct * Math.PI * 6) * 0.38;
      currentX.current = lerp(currentX.current, targetX, 0.05);

      const cx = W * currentX.current;
      const oppCx = W * (1 - currentX.current);

      const d1 = `M ${W * 0.08} 0 C ${cx} ${H * 0.35}, ${oppCx} ${H * 0.65}, ${W * 0.92} ${H}`;
      const d2 = `M ${W * 0.08} 0 C ${cx + 24} ${H * 0.3}, ${oppCx - 24} ${H * 0.7}, ${W * 0.92} ${H}`;

      const op1 = 0.13;
      const op2 = 0.06;

      if (path1Ref.current) {
        path1Ref.current.setAttribute("d", d1);
        path1Ref.current.setAttribute("stroke-opacity", String(op1));
      }
      if (path2Ref.current) {
        path2Ref.current.setAttribute("d", d2);
        path2Ref.current.setAttribute("stroke-opacity", String(op2));
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      scrollContainer.removeEventListener("scroll", onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <svg
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 4, opacity: "var(--ambient-bg-opacity, 1)", transition: "opacity 500ms ease-out" }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="snakeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(137,66%,52%)" />
          <stop offset="50%" stopColor="hsl(194,63%,71%)" />
          <stop offset="100%" stopColor="hsl(216,64%,61%)" />
        </linearGradient>
      </defs>
      <path
        ref={path1Ref}
        d=""
        fill="none"
        stroke="url(#snakeGrad)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="6 14"
      />
      <path
        ref={path2Ref}
        d=""
        fill="none"
        stroke="url(#snakeGrad)"
        strokeWidth="1"
        strokeLinecap="round"
        strokeDasharray="3 18"
      />
    </svg>
  );
}
