import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Github, Loader2 } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const GITHUB_USERNAME = "KleinLavina";

// Bubble configuration — each bubble has unique characteristics for genuine parallax depth.
// colorVar: one of "primary" | "secondary" | "accent" matching the site's CSS variable palette.
// yTravel: px to drift upward over the full pin duration (larger = faster apparent movement).
// scrub: ScrollTrigger scrub value — higher = more lag / smoother catch-up.
const BUBBLE_CONFIG = [
  // ── Large ambient blobs (slow, very subtle, heavy blur) ──────────────
  { size: 320, left: "-6%",  bottom: "18%", yTravel: 90,  scrub: 2.0, color: "primary",   opacity: 0.045, blur: 48 },
  { size: 240, left: "72%",  bottom: "30%", yTravel: 110, scrub: 1.8, color: "secondary", opacity: 0.05,  blur: 36 },
  { size: 180, left: "42%",  bottom: "5%",  yTravel: 80,  scrub: 2.2, color: "accent",    opacity: 0.04,  blur: 28 },
  // ── Mid-size bubbles (medium speed, moderate blur) ───────────────────
  { size: 90,  left: "8%",   bottom: "8%",  yTravel: 180, scrub: 1.2, color: "accent",    opacity: 0.09,  blur: 10 },
  { size: 70,  left: "82%",  bottom: "14%", yTravel: 150, scrub: 1.4, color: "primary",   opacity: 0.10,  blur: 8  },
  { size: 54,  left: "55%",  bottom: "3%",  yTravel: 220, scrub: 0.9, color: "secondary", opacity: 0.11,  blur: 5  },
  { size: 46,  left: "28%",  bottom: "12%", yTravel: 200, scrub: 1.0, color: "primary",   opacity: 0.10,  blur: 4  },
  // ── Small crisp dots (fast, almost no blur) ──────────────────────────
  { size: 22,  left: "63%",  bottom: "22%", yTravel: 280, scrub: 0.5, color: "primary",   opacity: 0.18,  blur: 1  },
  { size: 16,  left: "20%",  bottom: "38%", yTravel: 260, scrub: 0.6, color: "accent",    opacity: 0.20,  blur: 0  },
  { size: 12,  left: "90%",  bottom: "45%", yTravel: 300, scrub: 0.4, color: "secondary", opacity: 0.22,  blur: 0  },
  { size: 18,  left: "48%",  bottom: "50%", yTravel: 240, scrub: 0.7, color: "primary",   opacity: 0.16,  blur: 1  },
  { size: 10,  left: "35%",  bottom: "58%", yTravel: 320, scrub: 0.35,color: "accent",    opacity: 0.24,  blur: 0  },
] as const;

// How long (in additional scroll px) the section stays pinned while bubbles animate.
const PIN_SCROLL_DISTANCE = 700;

export function GithubContributions() {
  const [loading, setLoading] = useState(true);

  const sectionRef   = useRef<HTMLElement>(null);
  const contentRef   = useRef<HTMLDivElement>(null);
  const bubblesRef   = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // The scroll container in this project is <main>, not window.
    const scroller = document.querySelector("main") as HTMLElement | null;
    if (!scroller) return;

    const mm = gsap.matchMedia();

    // ── Desktop / tablet — full pin + parallax ──────────────────────────
    mm.add("(min-width: 768px)", () => {
      const ctx = gsap.context(() => {
        // Pin the section for PIN_SCROLL_DISTANCE of scroll travel.
        ScrollTrigger.create({
          trigger:      section,
          scroller,
          start:        "top top",
          end:          `+=${PIN_SCROLL_DISTANCE}`,
          pin:          true,
          pinSpacing:   true,
          anticipatePin: 1,
        });

        // Each bubble gets its own scroll-linked tween for independent parallax.
        bubblesRef.current.forEach((bubble, i) => {
          if (!bubble) return;
          const cfg = BUBBLE_CONFIG[i];
          gsap.fromTo(
            bubble,
            { y: 0 },
            {
              y: -cfg.yTravel,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                scroller,
                start:   "top top",
                end:     `+=${PIN_SCROLL_DISTANCE}`,
                scrub:   cfg.scrub,
              },
            },
          );
        });

        // Subtle content parallax — content drifts up ever so slightly (depth cue).
        if (contentRef.current) {
          gsap.fromTo(
            contentRef.current,
            { y: 0 },
            {
              y: -28,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                scroller,
                start:   "top top",
                end:     `+=${PIN_SCROLL_DISTANCE}`,
                scrub:   3,
              },
            },
          );
        }
      }, section);

      return () => ctx.revert();
    });

    // ── Mobile — no pin, just a lighter parallax on bubbles ─────────────
    mm.add("(max-width: 767px)", () => {
      const ctx = gsap.context(() => {
        bubblesRef.current.forEach((bubble, i) => {
          if (!bubble) return;
          const travel = Math.round(BUBBLE_CONFIG[i].yTravel * 0.35);
          gsap.fromTo(
            bubble,
            { y: 0 },
            {
              y: -travel,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                scroller,
                start:   "top bottom",
                end:     "bottom top",
                scrub:   true,
              },
            },
          );
        });
      }, section);

      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="github"
      className="relative flex flex-col justify-center overflow-hidden py-16"
      style={{ minHeight: "100svh" }}
    >
      {/* ── Decorative bubble layer ─────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        {BUBBLE_CONFIG.map((cfg, i) => (
          <div
            key={i}
            ref={(el) => { bubblesRef.current[i] = el; }}
            className="absolute rounded-full will-change-transform"
            style={{
              width:  cfg.size,
              height: cfg.size,
              left:   cfg.left,
              bottom: cfg.bottom,
              background: `hsl(var(--${cfg.color}) / ${cfg.opacity})`,
              filter: cfg.blur > 0 ? `blur(${cfg.blur}px)` : undefined,
              // Organic, non-uniform shapes on the large blobs
              borderRadius:
                i < 3
                  ? i === 0
                    ? "45% 55% 60% 40% / 50% 45% 55% 50%"
                    : i === 1
                    ? "60% 40% 45% 55% / 40% 60% 40% 60%"
                    : "50% 50% 40% 60% / 55% 45% 55% 45%"
                  : "50%",
            }}
          />
        ))}
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div
        ref={contentRef}
        className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 will-change-transform"
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
              <Github className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">The Days I Code</h3>
              <p className="text-sm text-muted-foreground">@{GITHUB_USERNAME}</p>
              <a
                href={`https://github.com/${GITHUB_USERNAME}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1 mt-1"
              >
                View full activity on GitHub (including private contributions)
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* Contribution card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-6 rounded-3xl glass-card overflow-hidden"
          >
            {loading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-muted-foreground">
                  GitHub Contribution Activity
                </p>

                {/* Legend */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="text-white">Less</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-sm bg-[#ebedf0] dark:bg-[#161b22]" />
                    <div className="w-3 h-3 rounded-sm bg-[#d6e685]" />
                    <div className="w-3 h-3 rounded-sm bg-[#8cc665]" />
                    <div className="w-3 h-3 rounded-sm bg-[#44a340]" />
                    <div className="w-3 h-3 rounded-sm bg-[#1e6823]" />
                  </div>
                  <span>More</span>
                </div>
              </div>

              {/* Chart */}
              <div className="flex justify-center items-center bg-background/50 rounded-2xl p-4 overflow-x-auto">
                <img
                  src={`https://ghchart.rshah.org/${GITHUB_USERNAME}`}
                  alt={`${GITHUB_USERNAME}'s GitHub Contributions`}
                  className="max-w-full h-auto"
                  style={{ imageRendering: "crisp-edges" }}
                  onLoad={() => setLoading(false)}
                />
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Contribution graph powered by GitHub
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
