import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./sidebar";
import { motion, useScroll, useSpring } from "framer-motion";
import { MessageCircle } from "lucide-react";

export function Shell({ children }: { children: ReactNode }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <SidebarProvider style={{ "--sidebar-width": "18rem" } as React.CSSProperties}>
      <div className="flex h-screen w-full bg-background overflow-hidden relative">
        {/* Scroll Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-brand z-50 origin-left"
          style={{ scaleX }}
        />
        
        <AppSidebar />
        
        <div className="flex flex-col flex-1 relative h-full">
          {/* Mobile Header with Trigger */}
          <header className="md:hidden flex items-center p-4 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-40">
            <SidebarTrigger className="hover-glow text-foreground" />
            <span className="ml-4 font-bold text-lg text-gradient">Klein F. Lavina</span>
          </header>
          
          <main className="flex-1 overflow-y-auto scroll-smooth w-full">
            <div className="max-w-6xl mx-auto p-4 sm:p-8 lg:p-12 relative">
              {children}
            </div>
            
            {/* Footer */}
            <footer className="w-full py-8 text-center border-t border-border/50 mt-20">
              <p className="text-muted-foreground font-medium">
                © 2026 Klein F. Lavina <span className="mx-2 text-primary">•</span> Designed by Corey Hu
              </p>
            </footer>
          </main>
        </div>

        {/* Floating WhatsApp Button */}
        <a 
          href="https://wa.me/1234567890" 
          target="_blank" 
          rel="noreferrer"
          className="fixed bottom-8 right-8 z-50 p-4 bg-gradient-brand text-white rounded-full shadow-[0_10px_30px_rgba(53,211,97,0.4)] hover:shadow-[0_10px_40px_rgba(53,211,97,0.6)] hover:-translate-y-1 transition-all duration-300 group"
        >
          <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
        </a>
      </div>
    </SidebarProvider>
  );
}
