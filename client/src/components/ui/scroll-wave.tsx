import { useEffect, useRef } from "react";

export function ScrollWave() {
  const svgRef   = useRef<SVGSVGElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const rafRef   = useRef<number | null>(null);

  useEffect(() => {
    const scrollContainer = document.querySelector("main.flex-1") as HTMLElement | null;

    let scrollY     = 0;
    let targetPhase = 0;
    let phase       = 0;
    let lastScroll  = 0;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const onScroll = () => {
      const current = scrollContainer ? scrollContainer.scrollTop : window.scrollY;
      const delta   = current - lastScroll;
      lastScroll    = current;
      scrollY       = current;
      targetPhase  += delta * 0.003;
    };

    scrollContainer?.addEventListener("scroll", onScroll, { passive: true });

    /* Wave definitions — each wave has own amplitude, frequency, speed multiplier, y‑position */
    const waves = [
      { amp: 28,  freq: 0.008, speed: 1.0,  yFrac: 0.25, opacity: 0.55, color: "url(#wg1)", width: 1.2   },
      { amp: 18,  freq: 0.012, speed: 1.6,  yFrac: 0.45, opacity: 0.35, color: "url(#wg2)", width: 0.8   },
      { amp: 22,  freq: 0.006, speed: 0.7,  yFrac: 0.65, opacity: 0.40, color: "url(#wg1)", width: 1.0   },
      { amp: 12,  freq: 0.015, speed: 2.1,  yFrac: 0.80, opacity: 0.25, color: "url(#wg3)", width: 0.6   },
    ];

    const buildPath = (W: number, H: number, wave: typeof waves[0], ph: number) => {
      const baseY = H * wave.yFrac;
      const pts: string[] = [];
      const steps = 60;
      for (let i = 0; i <= steps; i++) {
        const x = (W * i) / steps;
        const y = baseY + Math.sin(x * wave.freq + ph * wave.speed) * wave.amp;
        pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
      }
      return pts.join(" ");
    };

    const tick = () => {
      phase = lerp(phase, targetPhase, 0.04);

      const W = window.innerWidth;
      const H = window.innerHeight;

      waves.forEach((wave, i) => {
        const el = pathRefs.current[i];
        if (el) el.setAttribute("d", buildPath(W, H, wave, phase));
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      scrollContainer?.removeEventListener("scroll", onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 4, opacity: "var(--ambient-bg-opacity, 1)", transition: "opacity 500ms ease-out" }}
      aria-hidden="true"
    >
      <defs>
        {/* Primary green → secondary blue */}
        <linearGradient id="wg1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="hsl(137,66%,52%)" stopOpacity="0"   />
          <stop offset="20%"  stopColor="hsl(137,66%,52%)" stopOpacity="1"   />
          <stop offset="70%"  stopColor="hsl(194,63%,71%)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="hsl(194,63%,71%)" stopOpacity="0"   />
        </linearGradient>
        {/* Secondary blue → accent */}
        <linearGradient id="wg2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="hsl(194,63%,71%)" stopOpacity="0"   />
          <stop offset="30%"  stopColor="hsl(194,63%,71%)" stopOpacity="0.8" />
          <stop offset="80%"  stopColor="hsl(216,64%,61%)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="hsl(216,64%,61%)" stopOpacity="0"   />
        </linearGradient>
        {/* Accent blue */}
        <linearGradient id="wg3" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="hsl(216,64%,61%)" stopOpacity="0"   />
          <stop offset="40%"  stopColor="hsl(216,64%,61%)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="hsl(137,66%,52%)" stopOpacity="0"   />
        </linearGradient>
      </defs>

      {[0,1,2,3].map((i) => (
        <path
          key={i}
          ref={(el) => { pathRefs.current[i] = el; }}
          d=""
          fill="none"
          stroke={["url(#wg1)","url(#wg2)","url(#wg1)","url(#wg3)"][i]}
          strokeWidth={[1.2, 0.8, 1.0, 0.6][i]}
          strokeLinecap="round"
          opacity={[0.55, 0.35, 0.40, 0.25][i]}
        />
      ))}
    </svg>
  );
}
