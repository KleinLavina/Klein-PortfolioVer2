import { useEffect, useRef } from "react";

export function CursorWave() {
  const svgRef = useRef<SVGSVGElement>(null);
  const path1Ref = useRef<SVGPathElement>(null);
  const path2Ref = useRef<SVGPathElement>(null);
  const rafRef = useRef<number | null>(null);
  const scrollRef = useRef(0);

  useEffect(() => {
    const scrollContainer = document.querySelector("main.flex-1");
    const mouse = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.4 };
    const cp1 = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.4 };
    const cp2 = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.6 };

    const drift = {
      y1: 0.35, v1: 0.00015,
      y2: 0.65, v2: -0.00012,
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    const onScroll = () => {
      if (scrollContainer) scrollRef.current = (scrollContainer as HTMLElement).scrollTop;
    };
    scrollContainer?.addEventListener("scroll", onScroll, { passive: true });

    const tick = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;

      cp1.x = lerp(cp1.x, mouse.x + 60, 0.04);
      cp1.y = lerp(cp1.y, mouse.y - 80, 0.04);
      cp2.x = lerp(cp2.x, mouse.x - 60, 0.025);
      cp2.y = lerp(cp2.y, mouse.y + 80, 0.025);

      drift.y1 += drift.v1;
      drift.y2 += drift.v2;
      if (drift.y1 < 0.15 || drift.y1 > 0.85) drift.v1 *= -1;
      if (drift.y2 < 0.15 || drift.y2 > 0.85) drift.v2 *= -1;

      const y1 = H * drift.y1;
      const y2 = H * drift.y2;

      const d1 = `M 0 ${y1} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${W} ${y2}`;
      const d2 = `M 0 ${y1 + 40} C ${cp1.x - 20} ${cp1.y + 60}, ${cp2.x + 20} ${cp2.y - 60}, ${W} ${y2 + 40}`;

      const opacity = 0.5;

      if (svgRef.current) svgRef.current.style.opacity = String(opacity);
      if (path1Ref.current) path1Ref.current.setAttribute("d", d1);
      if (path2Ref.current) path2Ref.current.setAttribute("d", d2);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      scrollContainer?.removeEventListener("scroll", onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 5, opacity: 0.5 }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(137,66%,52%)" stopOpacity="0" />
          <stop offset="30%" stopColor="hsl(137,66%,52%)" stopOpacity="1" />
          <stop offset="70%" stopColor="hsl(194,63%,71%)" stopOpacity="1" />
          <stop offset="100%" stopColor="hsl(216,64%,61%)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(194,63%,71%)" stopOpacity="0" />
          <stop offset="40%" stopColor="hsl(194,63%,71%)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="hsl(216,64%,61%)" stopOpacity="0" />
        </linearGradient>
      </defs>

      <path
        ref={path1Ref}
        d=""
        fill="none"
        stroke="url(#waveGrad1)"
        strokeWidth="1"
        strokeLinecap="round"
      />

      <path
        ref={path2Ref}
        d=""
        fill="none"
        stroke="url(#waveGrad2)"
        strokeWidth="0.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
