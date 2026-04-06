import { useEffect, useRef, type FC, type RefObject } from "react";
import gsap from "gsap";

import {
  BarShape,
  CircleShape,
  CrossShape,
  DiamondShape,
  HexShape,
  IShape,
  KShape,
  NShape,
  TriangleShape,
} from "@/components/loading-blocker-morph-shapes";

type CharConfig = {
  Shape: FC;
  enterFrom: Record<string, unknown>;
  enterDuration: number;
  enterEase: string;
  morphDelay: number;
};

const KLEIN_CONFIGS: CharConfig[] = [
  { Shape: KShape, enterFrom: { y: -180, rotation: -90, scale: 0.3, opacity: 0 }, enterDuration: 0.6, enterEase: "expo.out", morphDelay: 0 },
  { Shape: BarShape, enterFrom: { x: 200, scaleY: 0.3, opacity: 0 }, enterDuration: 0.5, enterEase: "power3.out", morphDelay: 0.05 },
  { Shape: CircleShape, enterFrom: { scale: 0, rotation: 180, opacity: 0 }, enterDuration: 0.55, enterEase: "back.out(2)", morphDelay: 0.1 },
  { Shape: IShape, enterFrom: { y: 120, scale: 0.5, opacity: 0 }, enterDuration: 0.5, enterEase: "elastic.out(1, 0.6)", morphDelay: 0.03 },
  { Shape: NShape, enterFrom: { x: -150, rotationY: 90, opacity: 0 }, enterDuration: 0.6, enterEase: "power4.out", morphDelay: 0.08 },
];

const LAVINA_CONFIGS: CharConfig[] = [
  { Shape: CrossShape, enterFrom: { y: -200, scaleY: 2.5, opacity: 0 }, enterDuration: 0.6, enterEase: "expo.out", morphDelay: 0.06 },
  { Shape: TriangleShape, enterFrom: { scale: 0, rotation: -120, opacity: 0 }, enterDuration: 0.5, enterEase: "back.out(2.5)", morphDelay: 0 },
  { Shape: DiamondShape, enterFrom: { x: 150, y: 150, rotation: 45, opacity: 0 }, enterDuration: 0.55, enterEase: "power3.out", morphDelay: 0.12 },
  { Shape: IShape, enterFrom: { scaleY: 0, opacity: 0 }, enterDuration: 0.5, enterEase: "elastic.out(1, 0.5)", morphDelay: 0.04 },
  { Shape: NShape, enterFrom: { x: -120, clipPath: "inset(0% 100% 0% 0%)", opacity: 0 }, enterDuration: 0.6, enterEase: "power4.out", morphDelay: 0.09 },
  { Shape: HexShape, enterFrom: { scale: 0.1, rotation: -180, opacity: 0 }, enterDuration: 0.6, enterEase: "expo.out", morphDelay: 0.05 },
];

const MORPH_TIMELINE_SPEED = 1.45;

export function LoadingBlockerMorph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const kleinRef = useRef<HTMLDivElement>(null);
  const lavinaRef = useRef<HTMLDivElement>(null);
  const bgGradientRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      const animateShapesIn = (
        cells: NodeListOf<Element> | undefined,
        configs: CharConfig[],
        label: "klein" | "lavina",
      ) => {
        if (!cells) return;

        cells.forEach((cell, index) => {
          const config = configs[index];
          const shape = cell.querySelector(".shape-layer");
          if (!config || !shape) return;

          const offset = label === "klein"
            ? (index === 0 ? "-=0.35" : "-=0.45")
            : (index === 0 ? "-=0.2" : "-=0.4");

          tl.fromTo(
            shape,
            { ...config.enterFrom, filter: "blur(12px)" },
            {
              x: 0,
              y: 0,
              scale: 1,
              scaleX: 1,
              scaleY: 1,
              rotation: 0,
              rotationY: 0,
              opacity: 1,
              clipPath: "inset(0% 0% 0% 0%)",
              filter: "blur(0px)",
              duration: config.enterDuration,
              ease: config.enterEase,
            },
            offset,
          );
        });
      };

      const typewriterReveal = (
        cells: NodeListOf<Element> | undefined,
        configs: CharConfig[],
        label: "klein" | "lavina",
      ) => {
        if (!cells) return;

        const phaseLabel = `type-${label}`;
        tl.addLabel(phaseLabel);

        cells.forEach((cell, index) => {
          const config = configs[index];
          const shape = cell.querySelector(".shape-layer");
          if (!config || !shape) return;

          tl.to(
            shape,
            {
              scale: 1.1,
              opacity: 0,
              filter: "blur(8px)",
              duration: 0.25,
              ease: "power2.in",
            },
            `${phaseLabel}+=${index * 0.03 + config.morphDelay}`,
          );
        });

        const typeLabel = `${phaseLabel}-letters`;
        tl.addLabel(typeLabel, `${phaseLabel}+=0.2`);

        cells.forEach((cell, index) => {
          const letter = cell.querySelector(".letter-layer");
          if (!letter) return;

          tl.to(
            letter,
            {
              opacity: 1,
              duration: 0.01,
              ease: "none",
            },
            `${typeLabel}+=${index * 0.06}`,
          );
        });
      };

      tl.fromTo(
        bgGradientRef.current,
        { opacity: 0, scale: 1.5 },
        { opacity: 0.5, scale: 1, duration: 0.6, ease: "expo.out" },
      );

      const kleinCells = kleinRef.current?.querySelectorAll(".char-cell");
      const lavinaCells = lavinaRef.current?.querySelectorAll(".char-cell");

      animateShapesIn(kleinCells, KLEIN_CONFIGS, "klein");
      animateShapesIn(lavinaCells, LAVINA_CONFIGS, "lavina");

      tl.to({}, { duration: 0.15 });

      typewriterReveal(kleinCells, KLEIN_CONFIGS, "klein");
      typewriterReveal(lavinaCells, LAVINA_CONFIGS, "lavina");

      tl.to(
        bgGradientRef.current,
        { scale: 1.3, opacity: 0.75, duration: 0.3, ease: "power2.out" },
        "-=0.2",
      );

      tl.timeScale(MORPH_TIMELINE_SPEED);
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  const renderWord = (
    text: string,
    configs: CharConfig[],
    refObj: RefObject<HTMLDivElement>,
    className: string,
  ) => (
    <div ref={refObj} className={className}>
      {text.split("").map((char, index) => {
        const config = configs[index];

        return (
          <span
            key={`${text}-${index}`}
            className="char-cell relative inline-block"
            style={{ willChange: "transform, opacity, filter", perspective: "800px" }}
          >
            {config ? (
              <span
                className="shape-layer absolute inset-0 flex items-center justify-center text-primary/35"
                style={{ opacity: 0 }}
              >
                <span className="block h-[0.85em] w-[0.85em]">
                  <config.Shape />
                </span>
              </span>
            ) : null}

            <span className="letter-layer inline-block" style={{ opacity: 0 }}>
              {char === " " ? "\u00A0" : char}
            </span>
          </span>
        );
      })}
    </div>
  );

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center px-6"
    >
      <div className="relative flex h-full w-full items-center justify-center">
        <div
          ref={bgGradientRef}
          className="absolute h-[20rem] w-[20rem] rounded-full opacity-0 blur-3xl"
          style={{
            background:
              "radial-gradient(circle at center, hsl(var(--primary) / 0.18) 0%, hsl(var(--secondary) / 0.08) 42%, transparent 72%)",
          }}
        />

        <div className="relative flex flex-col items-center gap-1 sm:gap-2">
          <div style={{ fontSize: "clamp(1.5rem, 5vw, 4rem)", lineHeight: 1 }}>
            {renderWord(
              "Klein",
              KLEIN_CONFIGS,
              kleinRef,
              "font-sans font-medium uppercase tracking-[0.02em] text-primary",
            )}
          </div>
          <div style={{ fontSize: "clamp(1rem, 3.5vw, 2.75rem)", lineHeight: 1 }}>
            {renderWord(
              "Lavina",
              LAVINA_CONFIGS,
              lavinaRef,
              "font-sans font-light uppercase tracking-[0.06em] text-primary/90",
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
