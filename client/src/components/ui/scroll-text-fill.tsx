import { useEffect, useRef } from "react";
import { useMotionValue, useTransform, motion } from "framer-motion";

// Shared text styles — MUST be identical on both layers to prevent drift
const TEXT_CLASS =
  "font-black leading-[1.1] text-[clamp(2rem,5.5vw,5rem)] tracking-tight whitespace-pre-wrap break-words";

const LINES: { text: string; fill: boolean }[] = [
  { text: "I'm passionate about building", fill: false },
  { text: "scalable full stack apps", fill: true },
  { text: "and writing clean, efficient code", fill: false },
  { text: "to solve real problems.", fill: false },
];

export function ScrollTextFill() {
  const containerRef = useRef<HTMLDivElement>(null);
  // 0 = scroll hasn't started, 1 = fully revealed
  const progress = useMotionValue(0);

  // The fill phrase: clip reveals left → right
  const clipRight = useTransform(progress, [0.04, 0.93], [100, 0]);
  const clipPath = useTransform(clipRight, (v) => `inset(0 ${v}% 0 0)`);

  // Fill phrase grey base: starts low-opacity, disappears as color takes over
  const fillGreyOpacity = useTransform(progress, [0.04, 0.93], [0.22, 0]);

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
      const start = sectionTop;
      const end = sectionTop + sectionH - viewH;
      const raw = (scrollTop - start) / Math.max(end - start, 1);
      progress.set(Math.min(1, Math.max(0, raw)));
    };

    scrollEl.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => scrollEl.removeEventListener("scroll", onScroll);
  }, [progress]);

  return (
    <div
      ref={containerRef}
      style={{ height: "280vh" }}
      aria-label="Scroll to reveal"
    >
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden px-6 sm:px-16">
        <div className="w-full max-w-5xl select-none">

          {LINES.map((line, i) =>
            line.fill ? (
              // ── FILL PHRASE: starts faint, fills left→right with gradient ──
              <div key={i} className="relative">
                {/* Layer 1: grey placeholder — same exact CSS as layer 2, no divergence */}
                <motion.div
                  aria-hidden="true"
                  style={{ opacity: fillGreyOpacity, color: "#666" }}
                  className={TEXT_CLASS}
                >
                  {line.text}
                </motion.div>

                {/* Layer 2: gradient text, absolutely stacked on layer 1, clipped */}
                <motion.div
                  aria-hidden="true"
                  style={{ clipPath }}
                  className="absolute inset-0 overflow-hidden"
                >
                  {/*
                    This div MUST match Layer 1 exactly:
                    same TEXT_CLASS, no extra transforms, no letterSpacing animation
                  */}
                  <div className={`${TEXT_CLASS} text-gradient`}>
                    {line.text}
                  </div>
                </motion.div>

                {/* Accessible text */}
                <span className="sr-only">{line.text}</span>
              </div>
            ) : (
              // ── NORMAL PHRASE: always strong, full foreground ──
              <div key={i} className={`${TEXT_CLASS} text-foreground`}>
                {line.text}
              </div>
            )
          )}

          {/* Scroll hint */}
          <motion.p
            style={{ opacity: hintOpacity }}
            className="mt-8 text-[10px] font-mono text-muted-foreground/40 tracking-[0.25em] uppercase"
          >
            scroll to reveal
          </motion.p>
        </div>
      </div>
    </div>
  );
}
