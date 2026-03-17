import { ReactNode, useRef } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./sidebar";
import { ScrollWave } from "@/components/ui/scroll-wave";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { ScrollSnake } from "@/components/ui/scroll-snake";
import { motion, useScroll, useSpring } from "framer-motion";

export function Shell({ children }: { children: ReactNode }) {
  const scrollRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    container: scrollRef
  });
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <SidebarProvider style={{ "--sidebar-width": "13.5rem" } as React.CSSProperties}>
      <div className="flex h-screen w-full bg-background overflow-hidden relative">
        {/* Scroll Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-brand z-50 origin-left"
          style={{ scaleX }}
        />
        
        <CustomCursor />
        <ScrollWave />
        <ScrollSnake />
        <AppSidebar />
        
        <div className="flex flex-col flex-1 relative h-full">
          {/* Mobile Header with Trigger */}
          <header className="md:hidden flex items-center p-4 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-40">
            <SidebarTrigger className="hover-glow text-foreground" />
            <span className="ml-4 font-bold text-lg text-gradient">Klein F. Lavina</span>
          </header>
          
          <main ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth w-full relative">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
