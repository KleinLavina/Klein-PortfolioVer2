import { ReactNode, useEffect, useRef, useState } from "react";
import { ScrollWave } from "@/components/ui/scroll-wave";
import { ScrollSnake } from "@/components/ui/scroll-snake";
import { motion, useScroll, useSpring } from "framer-motion";
import { FloatingHeader } from "./floating-header";
import { useDynamicTitle } from "@/hooks/use-dynamic-title";

export function Shell({ children }: { children: ReactNode }) {
  const scrollRef = useRef<HTMLElement>(null);
  const [activeSection, setActiveSection] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false);
  const activeSectionRef = useRef("home");
  const isScrolledRef = useRef(false);
  const { scrollYProgress } = useScroll({
    container: scrollRef
  });
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useDynamicTitle(activeSection);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    let frameId: number | null = null;

    const trackedSectionIds = ["home", "skills", "github", "projects", "contact"];
    const sections = trackedSectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    const updateScrollState = () => {
      frameId = null;
      const nextIsScrolled = root.scrollTop > 18;
      if (nextIsScrolled !== isScrolledRef.current) {
        isScrolledRef.current = nextIsScrolled;
        setIsScrolled(nextIsScrolled);
      }

      const probe = root.scrollTop + root.clientHeight * 0.36;
      let nextSection = sections[0]?.id ?? "home";

      for (const section of sections) {
        if (probe >= section.offsetTop) {
          nextSection = section.id;
        } else {
          break;
        }
      }

      if (root.scrollTop + root.clientHeight >= root.scrollHeight - 8) {
        nextSection = sections[sections.length - 1]?.id ?? nextSection;
      }

      if (nextSection !== activeSectionRef.current) {
        activeSectionRef.current = nextSection;
        setActiveSection(nextSection);
      }
    };

    const onScroll = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(updateScrollState);
    };

    updateScrollState();
    root.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      root.removeEventListener("scroll", onScroll);
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background relative">
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 h-1.5 origin-left bg-gradient-brand"
        style={{ scaleX }}
      />

      <ScrollWave />
      <ScrollSnake />
      <FloatingHeader activeSection={activeSection} isScrolled={isScrolled} />

      <main
        ref={scrollRef}
        className="relative flex-1 overflow-y-auto scroll-smooth scroll-pt-20 w-full pt-16 md:scroll-pt-24 md:pt-20"
      >
        {children}
      </main>
    </div>
  );
}
