import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  headline: string;
  highlightPhrases?: string[];
  className?: string;
}

export function ScrollRevealColorBarSection({ headline, highlightPhrases = [], className }: Props) {
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

  // Function to render text with highlighted phrases - ensuring identical structure
  const renderTextWithHighlights = (text: string, isColored: boolean = false) => {
    if (highlightPhrases.length === 0) {
      return <span>{text}</span>;
    }

    let parts = [text];
    
    highlightPhrases.forEach((phrase) => {
      const newParts: (string | JSX.Element)[] = [];
      parts.forEach((part, index) => {
        if (typeof part === 'string') {
          const splitParts = part.split(new RegExp(`(${phrase})`, 'gi'));
          splitParts.forEach((splitPart, splitIndex) => {
            if (splitPart.toLowerCase() === phrase.toLowerCase()) {
              newParts.push(
                <span 
                  key={`${index}-${splitIndex}`}
                  className={isColored ? "highlight-colored" : "highlight-base"}
                >
                  {splitPart}
                </span>
              );
            } else if (splitPart) {
              newParts.push(splitPart);
            }
          });
        } else {
          newParts.push(part);
        }
      });
      parts = newParts;
    });

    return <>{parts}</>;
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full", className)}
      style={{ height: "220vh" }}
    >
      <style jsx>{`
        .highlight-base {
          color: hsl(var(--primary));
          font-weight: 700;
        }
        .highlight-colored {
          background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--accent)));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
        }
      `}</style>
      
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="relative max-w-4xl mx-auto px-8 text-center select-none">

          {/* Grey base with highlighted phrases - fixed positioning */}
          <p className="text-[clamp(1.1rem,2.8vw,2rem)] font-bold leading-[1.65] tracking-tight text-foreground/15 whitespace-pre-wrap relative">
            {renderTextWithHighlights(headline, false)}
          </p>

          {/* Colored overlay — clips left to right with scroll - identical positioning */}
          <motion.div
            className="absolute inset-0 overflow-hidden"
            style={{ width: clipWidth }}
          >
            <p className="text-[clamp(1.1rem,2.8vw,2rem)] font-bold leading-[1.65] tracking-tight whitespace-pre-wrap text-foreground absolute inset-0">
              {renderTextWithHighlights(headline, true)}
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
