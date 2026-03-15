import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  headline: string;
  className?: string;
}

export function ScrollRevealColorBarSection({ headline, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressMV   = useMotionValue(0);

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

  const clipWidth   = useTransform(progressMV, [0.03, 0.97], ["0%", "100%"]);
  const hintOpacity = useTransform(progressMV, [0, 0.12, 0.88, 1], [0.8, 0.3, 0.3, 0]);

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full", className)}
      style={{ height: "220vh" }}
    >
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="relative max-w-4xl mx-auto px-8 text-center select-none">

          {/* Grey base — always visible and static */}
          <p className="text-[clamp(1.1rem,2.8vw,2rem)] font-bold leading-[1.65] tracking-tight text-foreground/15 whitespace-pre-wrap">
            {headline}
          </p>

          {/* Colored overlay — clips left to right with scroll, text stays static */}
          <motion.div
            className="absolute inset-0 overflow-hidden"
            style={{ width: clipWidth }}
          >
            <p
              className="text-[clamp(1.1rem,2.8vw,2rem)] font-bold leading-[1.65] tracking-tight whitespace-pre-wrap"
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--accent)))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
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
}
