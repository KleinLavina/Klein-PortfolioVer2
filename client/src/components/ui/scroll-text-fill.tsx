import { useEffect, useRef } from "react";
import { useMotionValue, useTransform, motion } from "framer-motion";

const LINES = [
  "I'm passionate about building",
  "scalable full stack apps",
  "and writing clean, efficient code",
  "to solve real problems.",
];

export function ScrollTextFill() {
  const containerRef = useRef<HTMLDivElement>(null);
  // 0 = start, 1 = fully revealed
  const progress = useMotionValue(0);

  // Clip-path: start fully hidden on the right, open to fully visible
  const clipRight = useTransform(progress, [0.04, 0.93], [100, 0]);
  const clipPath = useTransform(clipRight, (v) => `inset(0 ${v}% 0 0)`);

  // Subtle letter-spacing shift as text fills
  const letterSpacing = useTransform(progress, [0.04, 0.93], ["-0.01em", "0.025em"]);

  // Grey base fades slightly as color takes over
  const greyOpacity = useTransform(progress, [0.04, 0.93], [0.5, 0.15]);

  // Scroll hint fades out early
  const hintOpacity = useTransform(progress, [0, 0.18], [1, 0]);

  useEffect(() => {
    const scrollEl = document.querySelector("main") as HTMLElement | null;
    const section = containerRef.current;
    if (!scrollEl || !section) return;

    const onScroll = () => {
      const scrollTop = scrollEl.scrollTop;
      const sectionTop = section.offsetTop;
      const sectionH = section.offsetHeight;
      const viewH = scrollEl.clientHeight;

      // progress goes 0→1 as user scrolls through the sticky section
      const start = sectionTop;
      const end = sectionTop + sectionH - viewH;
      const raw = (scrollTop - start) / Math.max(end - start, 1);
      progress.set(Math.min(1, Math.max(0, raw)));
    };

    scrollEl.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // initial read

    return () => scrollEl.removeEventListener("scroll", onScroll);
  }, [progress]);

  return (
    <div
      ref={containerRef}
      style={{ height: "280vh" }}
      aria-label="Scroll to reveal statement"
    >
      {/* Sticky frame — stays pinned while user scrolls the 280vh buffer */}
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden px-6 sm:px-16">
        <div className="relative w-full max-w-5xl select-none">

          {/* ── Layer 1: grey base (always visible, accessible fallback) ── */}
          <motion.div style={{ opacity: greyOpacity }} aria-hidden="true">
            {LINES.map((line, i) => (
              <div
                key={i}
                className="font-black leading-[1.1] text-[clamp(2.4rem,6vw,5.5rem)] tracking-tight"
                style={{ color: "hsl(var(--muted-foreground) / 0.35)" }}
              >
                {line}
              </div>
            ))}
          </motion.div>

          {/* ── Layer 2: colored fill, revealed left→right by scroll ── */}
          <motion.div
            style={{ clipPath }}
            aria-hidden="true"
            className="absolute inset-0 overflow-hidden"
          >
            <motion.div style={{ letterSpacing }}>
              {LINES.map((line, i) => (
                <div
                  key={i}
                  className="font-black leading-[1.1] text-[clamp(2.4rem,6vw,5.5rem)] text-gradient whitespace-nowrap"
                >
                  {line}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Screen-reader accessible text ── */}
          <p className="sr-only">{LINES.join(" ")}</p>

          {/* ── Scroll hint ── */}
          <motion.p
            style={{ opacity: hintOpacity }}
            className="absolute -bottom-12 left-0 text-[10px] font-mono text-muted-foreground/40 tracking-[0.25em] uppercase whitespace-nowrap"
          >
            scroll to reveal
          </motion.p>
        </div>
      </div>
    </div>
  );
}
