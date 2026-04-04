import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Github, Loader2 } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const GITHUB_USERNAME = "KleinLavina";

// ── Bubble configuration ────────────────────────────────────────────────────
// layer: "back" = renders behind the content card (z-0)
//        "front" = renders above the content card (z-20), adding depth
// yTravel: px to travel upward over the full pin scroll distance
// scrub: higher = more lag / softer catch-up (keeps movement smooth)
// opacity: 0-1 colour fill — intentionally more solid per user request
const BUBBLE_CONFIG = [
  // ── Large ambient blobs — background only, soft and slow ───────────────
  { size: 340, left: "-8%",  bottom: "10%", yTravel: 80,  scrub: 2.5, color: "primary",   opacity: 0.18, blur: 52, layer: "back"  },
  { size: 260, left: "70%",  bottom: "25%", yTravel: 100, scrub: 2.2, color: "secondary", opacity: 0.20, blur: 40, layer: "back"  },
  { size: 200, left: "40%",  bottom: "2%",  yTravel: 75,  scrub: 2.8, color: "accent",    opacity: 0.16, blur: 32, layer: "back"  },
  { size: 160, left: "15%",  bottom: "55%", yTravel: 65,  scrub: 3.0, color: "secondary", opacity: 0.14, blur: 28, layer: "back"  },
  { size: 190, left: "82%",  bottom: "60%", yTravel: 70,  scrub: 2.6, color: "primary",   opacity: 0.16, blur: 30, layer: "back"  },
  // ── Mid-size background orbs ────────────────────────────────────────────
  { size: 95,  left: "6%",   bottom: "6%",  yTravel: 190, scrub: 1.4, color: "accent",    opacity: 0.28, blur: 12, layer: "back"  },
  { size: 80,  left: "88%",  bottom: "18%", yTravel: 160, scrub: 1.6, color: "primary",   opacity: 0.30, blur: 10, layer: "back"  },
  { size: 65,  left: "52%",  bottom: "4%",  yTravel: 210, scrub: 1.1, color: "secondary", opacity: 0.26, blur: 7,  layer: "back"  },
  { size: 55,  left: "30%",  bottom: "15%", yTravel: 195, scrub: 1.3, color: "primary",   opacity: 0.25, blur: 6,  layer: "back"  },
  { size: 75,  left: "62%",  bottom: "70%", yTravel: 140, scrub: 1.7, color: "accent",    opacity: 0.22, blur: 9,  layer: "back"  },
  // ── Foreground orbs — appear above the card, semi-solid ─────────────────
  { size: 36,  left: "78%",  bottom: "78%", yTravel: 230, scrub: 0.9, color: "primary",   opacity: 0.42, blur: 0,  layer: "front" },
  { size: 24,  left: "5%",   bottom: "65%", yTravel: 270, scrub: 0.8, color: "secondary", opacity: 0.45, blur: 0,  layer: "front" },
  { size: 18,  left: "93%",  bottom: "48%", yTravel: 310, scrub: 0.6, color: "accent",    opacity: 0.50, blur: 0,  layer: "front" },
  { size: 14,  left: "45%",  bottom: "82%", yTravel: 290, scrub: 0.7, color: "primary",   opacity: 0.48, blur: 0,  layer: "front" },
  { size: 28,  left: "22%",  bottom: "72%", yTravel: 250, scrub: 1.0, color: "accent",    opacity: 0.40, blur: 1,  layer: "front" },
  { size: 20,  left: "58%",  bottom: "88%", yTravel: 300, scrub: 0.65,color: "secondary", opacity: 0.44, blur: 0,  layer: "front" },
  { size: 10,  left: "35%",  bottom: "55%", yTravel: 340, scrub: 0.5, color: "primary",   opacity: 0.55, blur: 0,  layer: "front" },
  { size: 12,  left: "70%",  bottom: "42%", yTravel: 320, scrub: 0.55,color: "accent",    opacity: 0.52, blur: 0,  layer: "front" },
  // ── Extra mid-size foreground pops for density ──────────────────────────
  { size: 44,  left: "50%",  bottom: "20%", yTravel: 175, scrub: 1.2, color: "secondary", opacity: 0.35, blur: 3,  layer: "front" },
  { size: 32,  left: "12%",  bottom: "35%", yTravel: 220, scrub: 0.95,color: "primary",   opacity: 0.38, blur: 2,  layer: "front" },
  { size: 16,  left: "84%",  bottom: "32%", yTravel: 280, scrub: 0.75,color: "secondary", opacity: 0.46, blur: 0,  layer: "front" },
  { size: 22,  left: "38%",  bottom: "40%", yTravel: 260, scrub: 0.85,color: "accent",    opacity: 0.43, blur: 1,  layer: "front" },
] as const;

const PIN_SCROLL_DISTANCE = 700;

// Pre-split for rendering — defined at module level so React never re-creates them.
const BACK_BUBBLES  = BUBBLE_CONFIG.map((b, i) => ({ ...b, i })).filter((b) => b.layer === "back");
const FRONT_BUBBLES = BUBBLE_CONFIG.map((b, i) => ({ ...b, i })).filter((b) => b.layer === "front");

// Organic shapes for the large blobs (indices 0-4).
const BLOB_RADII = [
  "45% 55% 60% 40% / 50% 45% 55% 50%",
  "60% 40% 45% 55% / 40% 60% 40% 60%",
  "50% 50% 40% 60% / 55% 45% 55% 45%",
  "55% 45% 55% 45% / 45% 55% 45% 55%",
  "40% 60% 50% 50% / 60% 40% 60% 40%",
];

export function GithubContributions() {
  const [loading, setLoading] = useState(true);

  const sectionRef  = useRef<HTMLElement>(null);
  const bubblesRef  = useRef<(HTMLDivElement | null)[]>(
    new Array(BUBBLE_CONFIG.length).fill(null),
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // The scroll container in this project is <main>, not window.
    const scroller = document.querySelector("main") as HTMLElement | null;
    if (!scroller) return;

    const mm = gsap.matchMedia();

    // ── Desktop / tablet ── full pin + parallax ──────────────────────────
    mm.add("(min-width: 768px)", () => {
      const ctx = gsap.context(() => {
        // ① Pin the section — NO anticipatePin (causes jitter with custom scrollers).
        ScrollTrigger.create({
          trigger:    section,
          scroller,
          start:      "top top",
          end:        `+=${PIN_SCROLL_DISTANCE}`,
          pin:        true,
          pinSpacing: true,
          // anticipatePin deliberately omitted — it overshoots on non-window scrollers.
        });

        // ② Per-bubble scroll tweens — only translate bubbles, never the content.
        bubblesRef.current.forEach((bubble, i) => {
          if (!bubble) return;
          const cfg = BUBBLE_CONFIG[i];
          gsap.fromTo(
            bubble,
            { y: 0 },
            {
              y:    -cfg.yTravel,
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
        // ③ The content wrapper is intentionally NOT animated — it stays rock-solid
        //    during the pin so text and card never vibrate.
      }, section);

      return () => ctx.revert();
    });

    // ── Mobile — no pin; lighter parallax only ────────────────────────────
    mm.add("(max-width: 767px)", () => {
      const ctx = gsap.context(() => {
        bubblesRef.current.forEach((bubble, i) => {
          if (!bubble) return;
          const travel = Math.round(BUBBLE_CONFIG[i].yTravel * 0.3);
          gsap.fromTo(
            bubble,
            { y: 0 },
            {
              y:    -travel,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                scroller,
                start:   "top bottom",
                end:     "bottom top",
                scrub:   1.5,
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
      className="relative flex flex-col justify-center py-16"
      style={{ minHeight: "100svh", overflow: "hidden" }}
    >
      {/* ── Background bubbles (behind the card) ─────────────────────── */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        {BACK_BUBBLES.map((b) => (
          <div
            key={b.i}
            ref={(el) => { bubblesRef.current[b.i] = el; }}
            className="absolute rounded-full will-change-transform"
            style={{
              width:        b.size,
              height:       b.size,
              left:         b.left,
              bottom:       b.bottom,
              background:   `hsl(var(--${b.color}) / ${b.opacity})`,
              filter:       b.blur > 0 ? `blur(${b.blur}px)` : undefined,
              borderRadius: b.i < 5 ? BLOB_RADII[b.i] : "50%",
            }}
          />
        ))}
      </div>

      {/* ── Content — static during pin, NO GSAP transform on this element ── */}
      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
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

      {/* ── Foreground bubbles (above the card) ──────────────────────── */}
      <div className="pointer-events-none absolute inset-0 z-20" aria-hidden>
        {FRONT_BUBBLES.map((b) => (
          <div
            key={b.i}
            ref={(el) => { bubblesRef.current[b.i] = el; }}
            className="absolute rounded-full will-change-transform"
            style={{
              width:        b.size,
              height:       b.size,
              left:         b.left,
              bottom:       b.bottom,
              background:   `hsl(var(--${b.color}) / ${b.opacity})`,
              filter:       b.blur > 0 ? `blur(${b.blur}px)` : undefined,
              borderRadius: "50%",
            }}
          />
        ))}
      </div>
    </section>
  );
}
