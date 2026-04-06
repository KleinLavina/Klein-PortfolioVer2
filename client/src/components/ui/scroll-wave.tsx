import { memo, useEffect, useRef } from "react";

const WAVE_DEFINITIONS = [
  { amp: 28, freq: 0.008, speed: 1.0, yFrac: 0.25 },
  { amp: 18, freq: 0.012, speed: 1.6, yFrac: 0.45 },
  { amp: 22, freq: 0.006, speed: 0.7, yFrac: 0.65 },
  { amp: 12, freq: 0.015, speed: 2.1, yFrac: 0.8 },
] as const;

const WAVE_PATH_META = [
  { stroke: "url(#wg1)", strokeWidth: 1.2, opacity: 0.55 },
  { stroke: "url(#wg2)", strokeWidth: 0.8, opacity: 0.35 },
  { stroke: "url(#wg1)", strokeWidth: 1.0, opacity: 0.4 },
  { stroke: "url(#wg3)", strokeWidth: 0.6, opacity: 0.25 },
] as const;

function buildWavePath(
  width: number,
  height: number,
  wave: (typeof WAVE_DEFINITIONS)[number],
  phase: number,
) {
  const baseY = height * wave.yFrac;
  const points: string[] = [];
  const steps = 60;

  for (let index = 0; index <= steps; index += 1) {
    const x = (width * index) / steps;
    const y = baseY + Math.sin(x * wave.freq + phase * wave.speed) * wave.amp;
    points.push(`${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }

  return points.join(" ");
}

export const ScrollWave = memo(function ScrollWave() {
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const scrollContainer = document.querySelector("main.flex-1") as HTMLElement | null;

    let targetPhase = 0;
    let phase = 0;
    let lastScroll = scrollContainer?.scrollTop ?? window.scrollY;
    let lastWidth = 0;
    let lastHeight = 0;
    let rafActive = false;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const scheduleFrame = () => {
      if (rafActive) return;
      rafActive = true;
      rafRef.current = window.requestAnimationFrame(tick);
    };

    const tick = () => {
      rafActive = false;
      phase = lerp(phase, targetPhase, 0.04);

      const width = window.innerWidth;
      const height = window.innerHeight;
      const resized = width !== lastWidth || height !== lastHeight;
      lastWidth = width;
      lastHeight = height;

      WAVE_DEFINITIONS.forEach((wave, index) => {
        const element = pathRefs.current[index];
        if (element) {
          element.setAttribute("d", buildWavePath(width, height, wave, phase));
        }
      });

      if (Math.abs(targetPhase - phase) > 0.001 || resized) {
        scheduleFrame();
      }
    };

    const onScroll = () => {
      const current = scrollContainer?.scrollTop ?? window.scrollY;
      const delta = current - lastScroll;
      lastScroll = current;
      targetPhase += delta * 0.003;
      scheduleFrame();
    };

    const onResize = () => {
      scheduleFrame();
    };

    scrollContainer?.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    scheduleFrame();

    return () => {
      scrollContainer?.removeEventListener("scroll", onScroll);
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
        <linearGradient id="wg1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(137,66%,52%)" stopOpacity="0" />
          <stop offset="20%" stopColor="hsl(137,66%,52%)" stopOpacity="1" />
          <stop offset="70%" stopColor="hsl(194,63%,71%)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="hsl(194,63%,71%)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="wg2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(194,63%,71%)" stopOpacity="0" />
          <stop offset="30%" stopColor="hsl(194,63%,71%)" stopOpacity="0.8" />
          <stop offset="80%" stopColor="hsl(216,64%,61%)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="hsl(216,64%,61%)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="wg3" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(216,64%,61%)" stopOpacity="0" />
          <stop offset="40%" stopColor="hsl(216,64%,61%)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="hsl(137,66%,52%)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {WAVE_PATH_META.map((path, index) => (
        <path
          key={index}
          ref={(element) => {
            pathRefs.current[index] = element;
          }}
          d=""
          fill="none"
          stroke={path.stroke}
          strokeWidth={path.strokeWidth}
          strokeLinecap="round"
          opacity={path.opacity}
        />
      ))}
    </svg>
  );
});

ScrollWave.displayName = "ScrollWave";
