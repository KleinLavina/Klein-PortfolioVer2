import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  headline: string;
  className?: string;
}

const BAR_W = 90; // px width of the sweeping color bar

export function ScrollRevealColorBarSection({ headline, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef      = useRef<HTMLDivElement>(null);
  const progressMV   = useMotionValue(0);

  /* ---------- scroll tracking ---------- */
  useEffect(() => {
    const scrollEl = document.querySelector("main") as HTMLElement | null;
    const section  = containerRef.current;
    if (!scrollEl || !section) return;

    const onScroll = () => {
      const sectionTop = section.offsetTop;
      const sectionH   = section.offsetHeight;
      const viewH      = scrollEl.clientHeight;
      const raw = (scrollEl.scrollTop - sectionTop) / Math.max(sectionH - viewH, 1);
      progressMV.set(Math.min(1, Math.max(0, raw)));
    };

    scrollEl.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => scrollEl.removeEventListener("scroll", onScroll);
  }, [progressMV]);

  /* ---------- derived motion values ---------- */

  // bar's left edge as a percentage of the text container width (goes from -barW to 100%)
  const barLeftPct  = useTransform(progressMV, [0.03, 0.97], ["-5%", "105%"]);

  // revealed text clips up to bar's leading edge
  const clipPct     = useTransform(progressMV, [0.03, 0.97], ["0%", "110%"]);

  const hintOpacity = useTransform(progressMV, [0, 0.15, 0.85, 1], [0.8, 0.3, 0.3, 0]);
  const glowOp      = useTransform(progressMV, [0, 0.3, 0.8, 1], [0, 0.12, 0.12, 0]);
  const dotsOp      = useTransform(progressMV, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

  /* ---------- render ---------- */
  return (
    <div
      ref={containerRef}
      className={cn("relative w-full", className)}
      style={{ height: "220vh" }}
    >
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">

        {/* Ambient glow follows the bar */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: glowOp }}
        >
          <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-secondary blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/3 w-96 h-96 rounded-full bg-primary blur-[100px]" />
        </motion.div>

        {/* Floating decorative dots */}
        <motion.div className="absolute inset-0 pointer-events-none" style={{ opacity: dotsOp }}>
          {[
            { x:"6%",  y:"18%", d:0,   s:5 },
            { x:"92%", y:"22%", d:0.7, s:3 },
            { x:"12%", y:"72%", d:1.3, s:4 },
            { x:"88%", y:"68%", d:0.4, s:6 },
            { x:"50%", y:"8%",  d:1.0, s:3 },
            { x:"74%", y:"88%", d:0.6, s:4 },
            { x:"30%", y:"90%", d:1.6, s:3 },
            { x:"70%", y:"12%", d:0.2, s:5 },
          ].map(({ x, y, d, s }, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-secondary/40"
              style={{ left: x, top: y, width: s, height: s }}
              animate={{ y: [0, -10, 0], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 3 + d, repeat: Infinity, ease: "easeInOut", delay: d }}
            />
          ))}
        </motion.div>

        {/* ── Text block ── */}
        <div ref={textRef} className="relative w-full max-w-4xl mx-auto px-8 text-center select-none">

          {/* Layer 1 — muted ghost text */}
          <p className="text-[clamp(1.1rem,2.8vw,2rem)] font-bold leading-[1.65] tracking-tight text-foreground/10 whitespace-pre-wrap">
            {headline}
          </p>

          {/* Layer 2 — revealed foreground text (clips to bar's left edge) */}
          <motion.div
            className="absolute inset-0 overflow-hidden"
            style={{ width: clipPct }}
          >
            <p className="text-[clamp(1.1rem,2.8vw,2rem)] font-bold leading-[1.65] tracking-tight text-foreground whitespace-pre-wrap">
              {headline}
            </p>
          </motion.div>

          {/* Layer 3 — the sweeping color bar */}
          <motion.div
            className="absolute top-0 bottom-0 pointer-events-none"
            style={{
              left: barLeftPct,
              width: BAR_W,
              background: `linear-gradient(
                180deg,
                hsl(var(--primary))   0%,
                hsl(var(--secondary)) 45%,
                hsl(var(--accent))    100%
              )`,
              mixBlendMode: "normal",
              borderRadius: 6,
              opacity: 0.85,
              filter: "blur(1px)",
              boxShadow: [
                "0 0 24px 6px hsl(var(--primary)  / 0.5)",
                "0 0 48px 12px hsl(var(--secondary)/ 0.3)",
                "0 0 80px 20px hsl(var(--accent)   / 0.15)",
              ].join(", "),
            }}
          />

          {/* Bar leading-edge sparkle line */}
          <motion.div
            className="absolute top-0 bottom-0 w-px pointer-events-none"
            style={{
              left: barLeftPct,
              background: "linear-gradient(180deg, transparent, white 30%, white 70%, transparent)",
              opacity: 0.6,
              filter: "blur(0.5px)",
            }}
          />
        </div>

        {/* Bottom accent line that grows with progress */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 h-px"
          style={{
            width: clipPct,
            background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--accent)))",
            opacity: 0.5,
          }}
        />

        {/* Scroll hint */}
        <motion.p
          className="absolute bottom-16 left-1/2 -translate-x-1/2 text-[10px] font-mono tracking-[0.25em] uppercase text-muted-foreground/40 whitespace-nowrap"
          style={{ opacity: hintOpacity }}
        >
          scroll to reveal
        </motion.p>
      </div>
    </div>
  );
}
