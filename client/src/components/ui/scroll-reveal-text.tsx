import { memo, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  headline: string;
  highlightColor?: string;
  className?: string;
}

const FLOATING_DOTS = [
  { x: "8%", y: "20%", delay: 0, size: 5 },
  { x: "90%", y: "15%", delay: 0.8, size: 3 },
  { x: "15%", y: "75%", delay: 1.4, size: 4 },
  { x: "85%", y: "70%", delay: 0.3, size: 6 },
  { x: "50%", y: "10%", delay: 1.1, size: 3 },
  { x: "72%", y: "85%", delay: 0.6, size: 4 },
] as const;

const FloatingDot = memo(function FloatingDot({ x, y, delay, size = 4 }: { x: string; y: string; delay: number; size?: number }) {
  return (
    <motion.div
      className="absolute rounded-full bg-primary/30 pointer-events-none"
      style={{ left: x, top: y, width: size, height: size }}
      animate={{ y: [0, -12, 0], opacity: [0.3, 0.7, 0.3] }}
      transition={{ duration: 3.5 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
});

FloatingDot.displayName = "FloatingDot";

export const ScrollRevealTextSection = memo(function ScrollRevealTextSection({ headline, highlightColor, className }: Props) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const progressMV    = useMotionValue(0);

  const clipWidth     = useTransform(progressMV, [0.05, 0.95], ["0%", "100%"]);
  const glowOpacity   = useTransform(progressMV, [0, 0.4, 0.9, 1], [0, 0.07, 0.07, 0]);
  const hintOpacity   = useTransform(progressMV, [0, 0.15, 0.85, 1], [0.8, 0.4, 0.4, 0]);
  const dotsOpacity   = useTransform(progressMV, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

  useEffect(() => {
    const scrollEl = document.querySelector("main") as HTMLElement | null;
    const section  = containerRef.current;
    if (!scrollEl || !section) return;

    const onScroll = () => {
      const scrollTop    = scrollEl.scrollTop;
      const sectionTop   = section.offsetTop;
      const sectionH     = section.offsetHeight;
      const viewH        = scrollEl.clientHeight;

      const start  = sectionTop;
      const end    = sectionTop + sectionH - viewH;
      const raw    = (scrollTop - start) / Math.max(end - start, 1);
      const clamped = Math.min(1, Math.max(0, raw));

      progressMV.set(clamped);
    };

    scrollEl.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => scrollEl.removeEventListener("scroll", onScroll);
  }, [progressMV]);

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full", className)}
      style={{ height: "180vh" }}
    >
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">

        {/* Ambient glow */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: glowOpacity }}
        >
          <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-accent blur-3xl" />
        </motion.div>

        {/* Floating dots */}
        <motion.div className="absolute inset-0 pointer-events-none" style={{ opacity: dotsOpacity }}>
          {FLOATING_DOTS.map((dot) => (
            <FloatingDot key={`${dot.x}-${dot.y}-${dot.delay}`} {...dot} />
          ))}
        </motion.div>

        {/* Accent lines */}
        {/* <motion.div
          className="absolute top-12 left-1/2 -translate-x-1/2 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
          style={{ width: clipWidth }}
        />
        <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent"
          style={{ width: clipWidth }}
        /> */}

        {/* Text */}
        <div className="relative max-w-5xl mx-auto px-8 text-center select-none">
          {/* Muted base */}
          <p className="text-[clamp(1.6rem,4.5vw,3.8rem)] font-black leading-[1.2] tracking-tight text-foreground/10 blur-sm">
            {headline}
          </p>

          {/* Highlighted reveal — clips left → right */}
          <motion.div
            className="absolute inset-0 overflow-hidden"
            style={{ width: clipWidth }}
          >
            <p
              className="text-[clamp(1.6rem,4.5vw,3.8rem)] font-black leading-[1.2] tracking-tight whitespace-pre-wrap"
              style={{
                color: highlightColor ?? undefined,
                background: highlightColor
                  ? undefined
                  : "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--accent)))",
                WebkitBackgroundClip: highlightColor ? undefined : "text",
                WebkitTextFillColor: highlightColor ? undefined : "transparent",
                backgroundClip: highlightColor ? undefined : "text",
                minWidth: "100%",
              }}
            >
              {headline}
            </p>
          </motion.div>

          {/* Scroll hint */}
          <motion.p
            className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-[10px] font-mono tracking-[0.25em] uppercase text-muted-foreground/40 whitespace-nowrap"
            style={{ opacity: hintOpacity }}
          >
            scroll to reveal
          </motion.p>
        </div>
      </div>
    </div>
  );
});

ScrollRevealTextSection.displayName = "ScrollRevealTextSection";
