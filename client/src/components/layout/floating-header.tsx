import { AnimatePresence, motion } from "framer-motion";
import {
  FolderGit2,
  Mail,
  Moon,
  Sun,
  User,
} from "lucide-react";
import { useLocation } from "wouter";
import type { MouseEvent } from "react";

import { useTheme } from "@/components/theme-provider";
import { smoothScrollToTarget } from "@/lib/smooth-scroll";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "About Me", href: "#home", icon: User, section: "about" },
  { title: "Projects", href: "#projects", icon: FolderGit2, section: "projects" },
  { title: "Contact Me", href: "#contact", icon: Mail, section: "contact" },
] as const;

function isNavItemActive(section: (typeof navItems)[number]["section"], activeSection: string) {
  if (section === "about") {
    return activeSection !== "projects" && activeSection !== "contact";
  }

  return activeSection === section;
}

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
          <span
            aria-hidden="true"
            className={cn(
              "h-5 w-px transition-colors",
              isDark ? "bg-white/24 group-hover:bg-white/36" : "bg-black/24 group-hover:bg-black/38",
            )}
          />
          <span
            className={cn(
              "relative flex h-[18px] w-8 items-center rounded-full px-0.5 transition-colors",
              isDark
                ? "border border-white/35 bg-border/55 group-hover:border-white/50 group-hover:bg-border/80"
                : "border border-black/35 bg-border/55 group-hover:border-black/50 group-hover:bg-border/80",
            )}
          >
            <motion.span
              className={cn(
                "h-3.5 w-3.5 rounded-full bg-primary shadow-md shadow-primary/35",
                isDark ? "border border-white/40" : "border border-black/35",
              )}
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
  const [location] = useLocation();
  const isOnContactSection = activeSection === "contact";
  const homeHrefPrefix = location === "/" ? "" : "/";

  const handleNavClick = (
    event: MouseEvent<HTMLAnchorElement>,
    item: (typeof navItems)[number],
  ) => {
    if (location !== "/") {
      return;
    }

    event.preventDefault();

    const target = document.getElementById(item.section === "about" ? "home" : item.section);
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const headerOffset = 88;
    smoothScrollToTarget(target, {
      durationMs: 720,
      offset: headerOffset,
    });

    window.history.replaceState(null, "", item.href);

    if (item.section === "contact") {
      window.dispatchEvent(new CustomEvent("portfolio:navigate-contact"));
    }
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-40 flex justify-center px-2.5 sm:top-5 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="pointer-events-auto w-auto max-w-full"
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
            "w-auto max-w-full",
            isOnContactSection
              ? "shadow-[0_28px_70px_-32px_hsl(var(--foreground)/0.68)]"
              : isScrolled
              ? "shadow-[0_26px_60px_-34px_hsl(var(--foreground)/0.55)]"
              : "shadow-[0_22px_50px_-34px_hsl(var(--foreground)/0.42)]",
          )}
        >
          <div
            className={cn(
              "relative flex items-center justify-center px-2.5 sm:px-4 transition-all duration-300",
              isScrolled ? "py-2.5" : "py-3",
            )}
          >
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <nav className="flex min-w-0 items-center gap-1 sm:gap-1.5">
                {navItems.map((item) => {
                  const isActive = isNavItemActive(item.section, activeSection);
                  const isContact = item.section === "contact";
                  return (
                    <a
                      key={item.title}
                      href={`${homeHrefPrefix}${item.href}`}
                      aria-label={item.title}
                      title={item.title}
                      onClick={(event) => handleNavClick(event, item)}
                      className={cn(
                        "group relative flex h-11 min-w-0 items-center justify-center gap-2 rounded-full px-0 text-sm font-semibold transition-all duration-300",
                        "w-11 sm:w-auto sm:px-3.5 md:px-4",
                        isContact
                          ? isActive
                            ? "border border-primary bg-primary text-primary-foreground shadow-[0_16px_36px_-20px_hsl(var(--primary)/0.55)]"
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
                              ? "text-primary-foreground"
                              : "text-primary group-hover:text-primary"
                            : isActive
                            ? "text-primary"
                            : "text-muted-foreground/80 group-hover:text-foreground",
                        )}
                      />
                      <span className="hidden whitespace-nowrap sm:inline">{item.title}</span>
                    </a>
                  );
                })}
              </nav>

              <div className="flex shrink-0 items-center">
                <ThemeToggle compact className="sm:hidden" />
                <ThemeToggle className="hidden sm:flex" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
