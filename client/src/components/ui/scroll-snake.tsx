import { memo, useEffect, useRef } from "react";

export const ScrollSnake = memo(function ScrollSnake() {
  const path1Ref = useRef<SVGPathElement>(null);
  const path2Ref = useRef<SVGPathElement>(null);
  const rafRef = useRef<number | null>(null);
  const currentX = useRef(0.5);
  const scrollRef = useRef(0);

  useEffect(() => {
    const scrollContainer = document.querySelector("main.flex-1") as HTMLElement | null;
    if (!scrollContainer) return;

    let rafActive = false;
    let lastWidth = 0;
    let lastHeight = 0;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const scheduleFrame = () => {
      if (rafActive) return;
      rafActive = true;
      rafRef.current = window.requestAnimationFrame(tick);
    };

    const tick = () => {
      rafActive = false;

      const width = window.innerWidth;
      const height = window.innerHeight;
      const maxScroll = Math.max(1, scrollContainer.scrollHeight - height);
      const percent = scrollRef.current / maxScroll;
      const resized = width !== lastWidth || height !== lastHeight;
      lastWidth = width;
      lastHeight = height;

      const targetX = 0.5 + Math.sin(percent * Math.PI * 6) * 0.38;
      currentX.current = lerp(currentX.current, targetX, 0.05);

      const currentCenter = width * currentX.current;
      const oppositeCenter = width * (1 - currentX.current);

      const d1 = `M ${width * 0.08} 0 C ${currentCenter} ${height * 0.35}, ${oppositeCenter} ${height * 0.65}, ${width * 0.92} ${height}`;
      const d2 = `M ${width * 0.08} 0 C ${currentCenter + 24} ${height * 0.3}, ${oppositeCenter - 24} ${height * 0.7}, ${width * 0.92} ${height}`;

      if (path1Ref.current) {
        path1Ref.current.setAttribute("d", d1);
        path1Ref.current.setAttribute("stroke-opacity", "0.13");
      }

      if (path2Ref.current) {
        path2Ref.current.setAttribute("d", d2);
        path2Ref.current.setAttribute("stroke-opacity", "0.06");
      }

      if (Math.abs(targetX - currentX.current) > 0.001 || resized) {
        scheduleFrame();
      }
    };

    const onScroll = () => {
      scrollRef.current = scrollContainer.scrollTop;
      scheduleFrame();
    };

    const onResize = () => {
      scheduleFrame();
    };

    scrollRef.current = scrollContainer.scrollTop;
    scrollContainer.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    scheduleFrame();

    return () => {
      scrollContainer.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <svg
      className="fixed inset-0 h-full w-full pointer-events-none"
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
});

ScrollSnake.displayName = "ScrollSnake";
