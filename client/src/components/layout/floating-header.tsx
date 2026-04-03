import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FolderGit2,
  Mail,
  Menu,
  Moon,
  Sun,
  User,
  X,
} from "lucide-react";

import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "About Me", href: "#about", icon: User, section: "about" },
  { title: "Projects", href: "#projects", icon: FolderGit2, section: "projects" },
  { title: "Contact Me", href: "#contact", icon: Mail, section: "contact" },
] as const;

function ThemeToggle({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "group flex items-center gap-2 rounded-full border border-border/35 bg-muted/35 text-foreground transition-all duration-300 hover:border-primary/35 hover:bg-muted/55",
        compact ? "h-11 px-3" : "h-11 px-3.5",
        className,
      )}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      type="button"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "sun" : "moon"}
          initial={{ rotate: -24, opacity: 0, scale: 0.82 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 24, opacity: 0, scale: 0.82 }}
          transition={{ duration: 0.18 }}
          className="shrink-0"
        >
          {isDark ? (
            <Sun className="h-4 w-4 text-yellow-400" />
          ) : (
            <Moon className="h-4 w-4 text-slate-500" />
          )}
        </motion.span>
      </AnimatePresence>

      {!compact && (
        <>
          <span className="text-[11px] font-semibold text-muted-foreground transition-colors group-hover:text-foreground">
            {isDark ? "Dark" : "Light"}
          </span>
          <span className="relative flex h-[18px] w-8 items-center rounded-full bg-border/55 px-0.5 transition-colors group-hover:bg-border/80">
            <motion.span
              className="h-3.5 w-3.5 rounded-full bg-primary shadow-md shadow-primary/35"
              animate={{ x: isDark ? 14 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </span>
        </>
      )}
    </button>
  );
}

export function FloatingHeader({
  activeSection,
  isScrolled,
}: {
  activeSection: string;
  isScrolled: boolean;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const isOnContactSection = activeSection === "contact";

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!mobileMenuRef.current) return;
      const target = event.target;
      if (target instanceof Node && !mobileMenuRef.current.contains(target)) {
        setMobileOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [activeSection]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-40 flex justify-center px-4 sm:top-5 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="pointer-events-auto w-full md:w-auto md:max-w-none"
        ref={mobileMenuRef}
      >
        <div
          className={cn(
            "rounded-[1.85rem] border shadow-2xl transition-all duration-300",
            isOnContactSection
              ? "bg-card dark:bg-card backdrop-blur-sm"
              : "bg-background/78 dark:bg-card/58 backdrop-blur-2xl",
            isOnContactSection
              ? "border-card-border dark:border-card-border"
              : "border-white/10 dark:border-white/10",
            "w-full md:w-auto",
            isOnContactSection
              ? "shadow-[0_28px_70px_-32px_hsl(var(--foreground)/0.68)]"
              : isScrolled
              ? "shadow-[0_26px_60px_-34px_hsl(var(--foreground)/0.55)]"
              : "shadow-[0_22px_50px_-34px_hsl(var(--foreground)/0.42)]",
          )}
        >
          <div
            className={cn(
              "relative flex items-center justify-between gap-3 px-3 sm:px-4 md:justify-center md:gap-2 transition-all duration-300",
              isScrolled ? "py-2.5" : "py-3",
            )}
          >
            <nav className="hidden items-center gap-1.5 md:flex">
              {navItems.map((item) => {
                const isActive = activeSection === item.section;
                const isContact = item.section === "contact";
                return (
                  <a
                    key={item.title}
                    href={item.href}
                    className={cn(
                      "group relative flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition-all duration-300",
                      isContact
                        ? isActive
                          ? "border border-primary bg-primary/22 text-primary shadow-[0_0_24px_hsl(var(--primary)/0.18)] ring-1 ring-primary/30"
                          : "border border-primary/60 bg-transparent text-primary shadow-[0_0_18px_hsl(var(--primary)/0.12)] hover:border-primary hover:bg-primary/12 hover:text-primary hover:shadow-[0_0_24px_hsl(var(--primary)/0.22)]"
                        : isActive
                        ? "bg-primary/14 text-primary border border-primary/20 shadow-[inset_0_1px_0_hsl(var(--primary)/0.08)]"
                        : "border border-transparent text-muted-foreground hover:border-border/35 hover:bg-muted/35 hover:text-foreground",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 transition-colors",
                        isContact
                          ? isActive
                            ? "text-primary"
                            : "text-primary group-hover:text-primary"
                          : isActive
                          ? "text-primary"
                          : "text-muted-foreground/80 group-hover:text-foreground",
                      )}
                    />
                    <span>{item.title}</span>
                  </a>
                );
              })}
            </nav>

            <div className="flex items-center gap-2 md:ml-2">
              <div className="hidden md:block">
                <ThemeToggle />
              </div>

              <div className="md:hidden">
                <ThemeToggle compact />
              </div>

              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border/35 bg-muted/35 text-foreground transition-all duration-300 hover:border-primary/35 hover:bg-muted/55 md:hidden"
                onClick={() => setMobileOpen((open) => !open)}
                aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={mobileOpen}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={mobileOpen ? "close" : "menu"}
                    initial={{ rotate: -18, opacity: 0, scale: 0.82 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 18, opacity: 0, scale: 0.82 }}
                    transition={{ duration: 0.18 }}
                    className="flex"
                  >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          </div>

          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="border-t border-border/35 px-3 pb-3 pt-2 md:hidden"
              >
                <div className="flex flex-col gap-1.5">
                  {navItems.map((item) => {
                    const isActive = activeSection === item.section;
                    const isContact = item.section === "contact";
                    return (
                      <a
                        key={item.title}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300",
                          isContact
                            ? isActive
                              ? "border border-primary bg-primary/22 text-primary shadow-[0_0_18px_hsl(var(--primary)/0.16)] ring-1 ring-primary/25"
                              : "border border-primary/60 bg-transparent text-primary hover:border-primary hover:bg-primary/12 hover:text-primary"
                            : isActive
                            ? "border border-primary/20 bg-primary/12 text-primary"
                            : "border border-transparent text-muted-foreground hover:border-border/35 hover:bg-muted/35 hover:text-foreground",
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-4 w-4",
                            isContact
                              ? isActive
                                ? "text-primary"
                                : "text-primary"
                              : isActive
                              ? "text-primary"
                              : "text-muted-foreground/80",
                          )}
                        />
                        <span>{item.title}</span>
                      </a>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
