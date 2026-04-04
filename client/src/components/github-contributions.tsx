import { type CSSProperties, useLayoutEffect, useRef, useState } from "react";
import { Github, Loader2 } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const GITHUB_USERNAME = "KleinLavina";
const PIN_SCROLL_DISTANCE = 700;
const CHART_FRAME_MIN_HEIGHT = 220;

type BubbleSpec = {
  size: number;
  left: string;
  bottom: string;
  yTravel: number;
  xTravel: number;
  scaleTo: number;
  color: "primary" | "secondary" | "accent";
  opacity: number;
  blur: number;
  variant: "ring" | "glow" | "soft" | "solid";
};

const TOP_BUBBLE_CONFIG: BubbleSpec[] = [
  { size: 42, left: "7%", bottom: "18%", yTravel: 190, xTravel: 16, scaleTo: 1.12, color: "primary", opacity: 0.32, blur: 0, variant: "ring" },
  { size: 30, left: "23%", bottom: "56%", yTravel: 210, xTravel: -14, scaleTo: 1.1, color: "secondary", opacity: 0.36, blur: 0, variant: "solid" },
  { size: 22, left: "41%", bottom: "28%", yTravel: 240, xTravel: 12, scaleTo: 1.16, color: "accent", opacity: 0.4, blur: 0, variant: "solid" },
  { size: 16, left: "58%", bottom: "62%", yTravel: 220, xTravel: -8, scaleTo: 1.08, color: "primary", opacity: 0.46, blur: 0, variant: "solid" },
  { size: 14, left: "72%", bottom: "34%", yTravel: 250, xTravel: 10, scaleTo: 1.12, color: "secondary", opacity: 0.48, blur: 0, variant: "ring" },
  { size: 18, left: "86%", bottom: "54%", yTravel: 205, xTravel: -12, scaleTo: 1.1, color: "accent", opacity: 0.42, blur: 0, variant: "solid" },
];

const MAIN_BUBBLE_CONFIG: BubbleSpec[] = [
  { size: 148, left: "14%", bottom: "68%", yTravel: 210, xTravel: -22, scaleTo: 1.12, color: "secondary", opacity: 0.24, blur: 0, variant: "ring" },
  { size: 124, left: "79%", bottom: "18%", yTravel: 185, xTravel: 24, scaleTo: 1.06, color: "accent", opacity: 0.22, blur: 2, variant: "solid" },
  { size: 92, left: "88%", bottom: "56%", yTravel: 260, xTravel: -26, scaleTo: 1.09, color: "accent", opacity: 0.2, blur: 0, variant: "ring" },
  { size: 74, left: "49%", bottom: "82%", yTravel: 235, xTravel: -12, scaleTo: 1.1, color: "secondary", opacity: 0.28, blur: 0, variant: "solid" },
  { size: 62, left: "24%", bottom: "84%", yTravel: 255, xTravel: 20, scaleTo: 1.12, color: "primary", opacity: 0.3, blur: 0, variant: "ring" },
  { size: 50, left: "40%", bottom: "60%", yTravel: 265, xTravel: 12, scaleTo: 1.12, color: "primary", opacity: 0.34, blur: 0, variant: "solid" },
  { size: 42, left: "30%", bottom: "44%", yTravel: 360, xTravel: -16, scaleTo: 1.18, color: "primary", opacity: 0.28, blur: 0, variant: "ring" },
  { size: 36, left: "54%", bottom: "16%", yTravel: 390, xTravel: 18, scaleTo: 1.22, color: "accent", opacity: 0.34, blur: 1, variant: "glow" },
  { size: 34, left: "10%", bottom: "54%", yTravel: 330, xTravel: 14, scaleTo: 1.16, color: "primary", opacity: 0.38, blur: 0, variant: "solid" },
  { size: 32, left: "74%", bottom: "66%", yTravel: 350, xTravel: -20, scaleTo: 1.2, color: "secondary", opacity: 0.32, blur: 0, variant: "ring" },
  { size: 30, left: "44%", bottom: "88%", yTravel: 280, xTravel: -8, scaleTo: 1.08, color: "accent", opacity: 0.4, blur: 0, variant: "solid" },
  { size: 28, left: "1%", bottom: "20%", yTravel: 410, xTravel: 18, scaleTo: 1.24, color: "primary", opacity: 0.36, blur: 0, variant: "ring" },
  { size: 26, left: "94%", bottom: "72%", yTravel: 310, xTravel: -16, scaleTo: 1.13, color: "secondary", opacity: 0.42, blur: 0, variant: "solid" },
  { size: 24, left: "58%", bottom: "34%", yTravel: 430, xTravel: 12, scaleTo: 1.2, color: "accent", opacity: 0.38, blur: 0, variant: "solid" },
  { size: 22, left: "26%", bottom: "30%", yTravel: 375, xTravel: -14, scaleTo: 1.17, color: "primary", opacity: 0.4, blur: 0, variant: "glow" },
  { size: 20, left: "86%", bottom: "10%", yTravel: 450, xTravel: -22, scaleTo: 1.26, color: "secondary", opacity: 0.42, blur: 0, variant: "ring" },
  { size: 18, left: "36%", bottom: "72%", yTravel: 320, xTravel: 10, scaleTo: 1.12, color: "accent", opacity: 0.46, blur: 0, variant: "solid" },
  { size: 16, left: "68%", bottom: "88%", yTravel: 295, xTravel: -8, scaleTo: 1.1, color: "primary", opacity: 0.48, blur: 0, variant: "solid" },
  { size: 14, left: "16%", bottom: "90%", yTravel: 345, xTravel: 10, scaleTo: 1.14, color: "secondary", opacity: 0.5, blur: 0, variant: "ring" },
  { size: 12, left: "50%", bottom: "52%", yTravel: 470, xTravel: 14, scaleTo: 1.28, color: "accent", opacity: 0.52, blur: 0, variant: "solid" },
];

const BOTTOM_BUBBLE_CONFIG: BubbleSpec[] = [
  { size: 18, left: "8%", bottom: "18%", yTravel: 210, xTravel: 10, scaleTo: 1.1, color: "primary", opacity: 0.36, blur: 0, variant: "solid" },
  { size: 16, left: "19%", bottom: "60%", yTravel: 230, xTravel: -8, scaleTo: 1.12, color: "secondary", opacity: 0.42, blur: 0, variant: "ring" },
  { size: 14, left: "31%", bottom: "28%", yTravel: 260, xTravel: 12, scaleTo: 1.16, color: "accent", opacity: 0.44, blur: 0, variant: "solid" },
  { size: 12, left: "43%", bottom: "72%", yTravel: 250, xTravel: -10, scaleTo: 1.12, color: "primary", opacity: 0.46, blur: 0, variant: "solid" },
  { size: 14, left: "54%", bottom: "18%", yTravel: 280, xTravel: 10, scaleTo: 1.18, color: "secondary", opacity: 0.4, blur: 0, variant: "ring" },
  { size: 10, left: "61%", bottom: "56%", yTravel: 300, xTravel: 8, scaleTo: 1.2, color: "accent", opacity: 0.5, blur: 0, variant: "solid" },
  { size: 16, left: "70%", bottom: "34%", yTravel: 240, xTravel: -12, scaleTo: 1.1, color: "primary", opacity: 0.38, blur: 0, variant: "glow" },
  { size: 12, left: "79%", bottom: "74%", yTravel: 270, xTravel: 10, scaleTo: 1.16, color: "secondary", opacity: 0.44, blur: 0, variant: "solid" },
  { size: 10, left: "88%", bottom: "22%", yTravel: 320, xTravel: -10, scaleTo: 1.22, color: "accent", opacity: 0.52, blur: 0, variant: "ring" },
  { size: 8, left: "95%", bottom: "58%", yTravel: 290, xTravel: -6, scaleTo: 1.16, color: "primary", opacity: 0.56, blur: 0, variant: "solid" },
];

const TOP_BUBBLES = TOP_BUBBLE_CONFIG.map((bubble, index) => ({ ...bubble, index }));
const MAIN_BUBBLES = MAIN_BUBBLE_CONFIG.map((bubble, index) => ({ ...bubble, index }));
const BOTTOM_BUBBLES = BOTTOM_BUBBLE_CONFIG.map((bubble, index) => ({ ...bubble, index }));

function getBubbleStyle(bubble: BubbleSpec): CSSProperties {
  const baseColor = `hsl(var(--${bubble.color}) / ${bubble.opacity})`;

  if (bubble.variant === "ring") {
    return {
      width: bubble.size,
      height: bubble.size,
      left: bubble.left,
      bottom: bubble.bottom,
      borderRadius: "9999px",
      border: `1.5px solid hsl(var(--${bubble.color}) / ${Math.min(bubble.opacity + 0.12, 0.65)})`,
      background: `radial-gradient(circle, transparent 58%, hsl(var(--${bubble.color}) / 0.08) 100%)`,
      boxShadow: `0 0 0 1px hsl(var(--${bubble.color}) / 0.08), 0 0 28px hsl(var(--${bubble.color}) / 0.12)`,
      backdropFilter: "blur(4px)",
    };
  }

  if (bubble.variant === "glow") {
    return {
      width: bubble.size,
      height: bubble.size,
      left: bubble.left,
      bottom: bubble.bottom,
      borderRadius: "9999px",
      background: `radial-gradient(circle at 35% 35%, hsl(var(--${bubble.color}) / ${Math.min(bubble.opacity + 0.18, 0.62)}), ${baseColor} 58%, hsl(var(--${bubble.color}) / 0.06) 100%)`,
      filter: `blur(${Math.max(bubble.blur, 6)}px)`,
      boxShadow: `0 0 42px hsl(var(--${bubble.color}) / 0.18)`,
    };
  }

  if (bubble.variant === "soft") {
    return {
      width: bubble.size,
      height: bubble.size,
      left: bubble.left,
      bottom: bubble.bottom,
      borderRadius: "9999px",
      background: `radial-gradient(circle at 30% 30%, hsl(var(--${bubble.color}) / ${Math.min(bubble.opacity + 0.12, 0.56)}), ${baseColor} 60%, hsl(var(--${bubble.color}) / 0.04) 100%)`,
      filter: `blur(${Math.max(bubble.blur, 3)}px)`,
      boxShadow: `0 14px 30px -18px hsl(var(--${bubble.color}) / 0.22)`,
    };
  }

  return {
    width: bubble.size,
    height: bubble.size,
    left: bubble.left,
    bottom: bubble.bottom,
    borderRadius: "9999px",
    background: `radial-gradient(circle at 30% 30%, hsl(var(--${bubble.color}) / ${Math.min(bubble.opacity + 0.15, 0.6)}), ${baseColor} 62%, hsl(var(--${bubble.color}) / 0.08) 100%)`,
    filter: bubble.blur > 0 ? `blur(${bubble.blur}px)` : undefined,
    boxShadow: `0 0 0 1px hsl(var(--${bubble.color}) / 0.1) inset`,
  };
}

export function GithubContributions() {
  const [loading, setLoading] = useState(true);

  const sectionRef = useRef<HTMLElement>(null);
  const mainSectionRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const topBubblesRef = useRef<(HTMLDivElement | null)[]>(new Array(TOP_BUBBLE_CONFIG.length).fill(null));
  const mainBubblesRef = useRef<(HTMLDivElement | null)[]>(new Array(MAIN_BUBBLE_CONFIG.length).fill(null));
  const bottomBubblesRef = useRef<(HTMLDivElement | null)[]>(new Array(BOTTOM_BUBBLE_CONFIG.length).fill(null));

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const mainSection = mainSectionRef.current;
    const scene = sceneRef.current;
    if (!section || !mainSection || !scene) return;

    const scroller = section.closest("main") as HTMLElement | null;
    if (!scroller) return;

    const mm = gsap.matchMedia();

    const addLayerTimeline = (
      elements: (HTMLDivElement | null)[],
      config: BubbleSpec[],
      trigger: HTMLElement,
      start: string,
      end: string,
      scrub: number,
      xFactor: number,
      yFactor: number,
      scaleFactor: number,
    ) => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger,
          scroller,
          start,
          end,
          scrub,
          invalidateOnRefresh: true,
        },
      });

      elements.forEach((bubble, index) => {
        if (!bubble) return;

        timeline.to(
          bubble,
          {
            x: Math.round(config[index].xTravel * xFactor),
            y: -Math.round(config[index].yTravel * yFactor),
            scale: 1 + (config[index].scaleTo - 1) * scaleFactor,
            ease: "none",
            force3D: true,
          },
          0,
        );
      });
    };

    mm.add("(min-width: 768px)", () => {
      const ctx = gsap.context(() => {
        addLayerTimeline(topBubblesRef.current, TOP_BUBBLE_CONFIG, section, "top bottom", "center center", 0.9, 1, 0.7, 0.75);
        addLayerTimeline(mainBubblesRef.current, MAIN_BUBBLE_CONFIG, mainSection, "top top", "bottom bottom", 0.8, 1, 1, 1);
        addLayerTimeline(bottomBubblesRef.current, BOTTOM_BUBBLE_CONFIG, section, "center center", "bottom top", 1, 1, 0.8, 0.9);
      }, section);

      return () => ctx.revert();
    });

    mm.add("(max-width: 767px)", () => {
      const ctx = gsap.context(() => {
        addLayerTimeline(topBubblesRef.current, TOP_BUBBLE_CONFIG, section, "top bottom", "center center", 1.1, 0.45, 0.3, 0.35);
        addLayerTimeline(mainBubblesRef.current, MAIN_BUBBLE_CONFIG, mainSection, "top bottom", "bottom top", 1.2, 0.45, 0.3, 0.45);
        addLayerTimeline(bottomBubblesRef.current, BOTTOM_BUBBLE_CONFIG, section, "center center", "bottom top", 1.2, 0.45, 0.35, 0.4);
      }, section);

      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  const handleChartLoad = () => {
    setLoading(false);
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };

    return (
    <section ref={sectionRef} id="github" className="relative" style={{ "--pin-distance": `${PIN_SCROLL_DISTANCE}px` } as CSSProperties}>
      <div className="relative h-28 overflow-hidden md:h-44">
        <div className="pointer-events-none absolute inset-0 z-10" aria-hidden>
          {TOP_BUBBLES.map((bubble) => (
            <div
              key={`top-${bubble.index}`}
              ref={(element) => {
                topBubblesRef.current[bubble.index] = element;
              }}
              className="absolute rounded-full will-change-transform"
              style={getBubbleStyle(bubble)}
            />
          ))}
        </div>
      </div>

      <div
        ref={mainSectionRef}
        className="relative min-h-[100svh] md:h-[calc(100svh+var(--pin-distance))]"
      >
        <div
          ref={sceneRef}
          className="relative box-border flex min-h-[100svh] flex-col justify-center overflow-hidden py-16 md:sticky md:top-0 md:h-[100svh]"
        >
        <div className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3">
                <Github className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">The Days I Code</h3>
                <p className="text-sm text-muted-foreground">@{GITHUB_USERNAME}</p>
                <a
                  href={`https://github.com/${GITHUB_USERNAME}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-xs text-primary transition-colors hover:text-primary/80"
                >
                  View full activity on GitHub (including private contributions)
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            <div className="glass-card overflow-hidden rounded-3xl p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-muted-foreground">
                    GitHub Contribution Activity
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="text-white">Less</span>
                    <div className="flex gap-1">
                      <div className="h-3 w-3 rounded-sm bg-[#ebedf0] dark:bg-[#161b22]" />
                      <div className="h-3 w-3 rounded-sm bg-[#d6e685]" />
                      <div className="h-3 w-3 rounded-sm bg-[#8cc665]" />
                      <div className="h-3 w-3 rounded-sm bg-[#44a340]" />
                      <div className="h-3 w-3 rounded-sm bg-[#1e6823]" />
                    </div>
                    <span>More</span>
                  </div>
                </div>

                <div
                  className="relative flex items-center justify-center overflow-x-auto rounded-2xl bg-background/50 p-4"
                  style={{ minHeight: `${CHART_FRAME_MIN_HEIGHT}px` }}
                >
                  {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : null}

                  <img
                    src={`https://ghchart.rshah.org/${GITHUB_USERNAME}`}
                    alt={`${GITHUB_USERNAME}'s GitHub Contributions`}
                    className="h-auto max-w-full"
                    style={{
                      imageRendering: "crisp-edges",
                      opacity: loading ? 0 : 1,
                    }}
                    onLoad={handleChartLoad}
                    onError={handleChartLoad}
                  />
                </div>

                <p className="text-center text-xs text-muted-foreground">
                  Contribution graph powered by GitHub
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 z-20" aria-hidden>
          {MAIN_BUBBLES.map((bubble) => (
            <div
              key={`main-${bubble.index}`}
              ref={(element) => {
                mainBubblesRef.current[bubble.index] = element;
              }}
              className="absolute rounded-full will-change-transform"
              style={getBubbleStyle(bubble)}
            />
          ))}
        </div>
      </div>
      </div>

      <div className="relative h-36 overflow-hidden md:h-56">
        <div className="pointer-events-none absolute inset-0 z-10" aria-hidden>
          {BOTTOM_BUBBLES.map((bubble) => (
            <div
              key={`bottom-${bubble.index}`}
              ref={(element) => {
                bottomBubblesRef.current[bubble.index] = element;
              }}
              className="absolute rounded-full will-change-transform"
              style={getBubbleStyle(bubble)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
