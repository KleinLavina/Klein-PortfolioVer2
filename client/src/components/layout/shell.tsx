import { ReactNode, useEffect, useRef, useState } from "react";
import { ScrollWave } from "@/components/ui/scroll-wave";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { ScrollSnake } from "@/components/ui/scroll-snake";
import { motion, useScroll, useSpring } from "framer-motion";
import { FloatingHeader } from "./floating-header";
import { useDynamicTitle } from "@/hooks/use-dynamic-title";

export function Shell({ children }: { children: ReactNode }) {
  const scrollRef = useRef<HTMLElement>(null);
  const [activeSection, setActiveSection] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false);
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

    const trackedSectionIds = ["home", "about", "skills", "projects", "github", "contact"];
    const sections = trackedSectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleSections[0]) {
          setActiveSection(visibleSections[0].target.id);
        }
      },
      {
        root,
        threshold: [0.12, 0.24, 0.4, 0.65],
        rootMargin: "-18% 0px -18% 0px",
      },
    );

    sections.forEach((section) => observer.observe(section));

    const onScroll = () => {
      setIsScrolled(root.scrollTop > 18);
    };

    onScroll();
    root.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      root.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background relative">
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 h-1.5 origin-left bg-gradient-brand"
        style={{ scaleX }}
      />

      <CustomCursor />
      <ScrollWave />
      <ScrollSnake />
      <FloatingHeader activeSection={activeSection} isScrolled={isScrolled} />

      <main
        ref={scrollRef}
        className="relative flex-1 overflow-y-auto scroll-smooth scroll-pt-28 w-full pt-24 md:scroll-pt-32 md:pt-28"
      >
        {children}
      </main>
    </div>
  );
}
