import { useEffect, useState } from "react";
import {
  Home, User, Code2, FolderGit2, Mail, Moon, Sun, Clock,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarHeader, SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/components/theme-provider";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Home",     url: "#home",     icon: Home,       num: "01" },
  { title: "About",    url: "#about",    icon: User,       num: "02" },
  { title: "Skills",   url: "#skills",   icon: Code2,      num: "03" },
  { title: "Projects", url: "#projects", icon: FolderGit2, num: "04" },
  { title: "Timeline", url: "#timeline", icon: Clock,      num: "05" },
  { title: "Contact",  url: "#contact",  icon: Mail,       num: "06" },
];

export function AppSidebar() {
  const [activeSection, setActiveSection] = useState("home");
  const { theme, setTheme } = useTheme();
  const { setOpenMobile } = useSidebar();
  const isDark = theme === "dark";

  const activeIndex = navItems.findIndex(i => i.url === `#${activeSection}`);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActiveSection(e.target.id); }),
      { threshold: 0.3 }
    );
    document.querySelectorAll("section[id]").forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <Sidebar variant="sidebar" className="border-r-0 overflow-hidden">
      {/* ── Decorative background layers ── */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-2xl z-0" />
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* top glow orb */}
        <div className="absolute -top-10 -left-6 w-48 h-48 rounded-full bg-primary/10 blur-3xl" />
        {/* bottom glow orb */}
        <div className="absolute -bottom-10 -right-4 w-36 h-36 rounded-full bg-accent/10 blur-3xl" />
        {/* right border glow line */}
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
      </div>

      {/* ── Vertical progress track (right edge) ── */}
      <div className="absolute top-1/4 right-2 h-1/2 w-0.5 rounded-full bg-border/20 z-10 overflow-hidden">
        <motion.div
          className="w-full rounded-full bg-gradient-to-b from-primary via-secondary to-accent"
          style={{ height: `${((activeIndex + 1) / navItems.length) * 100}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 30 }}
        />
      </div>

      {/* ── Header ── */}
      <SidebarHeader className="relative z-10 px-4 pt-6 pb-4 flex flex-col items-center gap-3">
        {/* Monogram tag */}
        <div className="self-start flex items-center gap-1.5 mb-1">
          <span className="text-[9px] font-mono font-bold tracking-[0.3em] uppercase text-primary/60">KFL</span>
          <span className="h-px w-6 bg-primary/30" />
          <span className="text-[9px] font-mono text-muted-foreground/40 tracking-widest">PORTFOLIO</span>
        </div>

        {/* Avatar with layered rings */}
        <div className="relative">
          <div className="absolute -inset-3 rounded-full bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 blur-xl" />
          <div className="absolute -inset-1.5 rounded-full border border-primary/20" />
          <Avatar className="h-16 w-16 border-2 border-background relative z-10 shadow-xl shadow-primary/10">
            <AvatarImage src="/OnePfp.jpg" alt="Klein F. Lavina" className="object-cover" />
            <AvatarFallback className="bg-primary/20 text-primary font-bold text-lg">KL</AvatarFallback>
          </Avatar>
        </div>

        {/* Name + role */}
        <div className="text-center">
          <p className="text-sm font-bold text-foreground tracking-tight leading-tight">Klein F. Lavina</p>
          <p className="text-[9px] font-mono tracking-[0.22em] uppercase mt-1">
            <span className="text-primary">Full Stack</span>
            <span className="text-muted-foreground/50 mx-1">/</span>
            <span className="text-secondary">Developer</span>
          </p>
        </div>

        {/* Divider with dots */}
        <div className="w-full flex items-center gap-2">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
          <span className="w-1 h-1 rounded-full bg-primary/40" />
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
        </div>
      </SidebarHeader>

      {/* ── Nav ── */}
      <SidebarContent className="relative z-10 px-3 py-1 flex flex-col gap-0.5 overflow-hidden">
        <p className="text-[8px] font-mono uppercase tracking-[0.25em] text-muted-foreground/30 px-2 mb-3">Navigation</p>
        {navItems.map((item) => {
          const isActive  = activeSection === item.url.replace("#", "");
          const isContact = item.title === "Contact";
          return (
            <a
              key={item.title}
              href={item.url}
              onClick={() => setOpenMobile(false)}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 overflow-hidden",
                isContact
                  ? "mt-3 font-bold text-primary border border-primary/40 bg-primary/5 hover:bg-primary hover:text-black hover:border-primary hover:shadow-lg hover:shadow-primary/30"
                  : isActive
                  ? "font-bold text-primary"
                  : "font-medium text-muted-foreground hover:text-foreground"
              )}
            >
              {/* Active background shimmer */}
              {isActive && !isContact && (
                <motion.div
                  layoutId="activeNavBg"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/15 via-primary/8 to-transparent border border-primary/20"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}

              {/* Hover bg */}
              {!isActive && !isContact && (
                <div className="absolute inset-0 rounded-xl bg-muted/0 group-hover:bg-muted/40 transition-colors duration-200" />
              )}

              {/* Active left accent bar */}
              {isActive && !isContact && (
                <motion.span
                  layoutId="activeBar"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-primary shadow-[0_0_10px_rgba(53,211,97,0.8)]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              {/* Icon box */}
              <div className={cn(
                "relative z-10 w-7 h-7 flex items-center justify-center rounded-lg shrink-0 transition-all duration-200",
                isActive
                  ? "bg-primary/20 shadow-inner shadow-primary/10"
                  : isContact
                  ? "bg-primary/10"
                  : "bg-muted/30 group-hover:bg-muted/60"
              )}>
                <item.icon className={cn(
                  "h-3.5 w-3.5 transition-colors",
                  isActive ? "text-primary" : isContact ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )} />
              </div>

              <span className="relative z-10 flex-1">{item.title}</span>

              {/* Number badge */}
              <span className={cn(
                "relative z-10 text-[9px] font-mono transition-all duration-200",
                isActive ? "text-primary/70" : "text-muted-foreground/30 group-hover:text-muted-foreground/60"
              )}>{item.num}</span>
            </a>
          );
        })}
      </SidebarContent>

      {/* ── Footer ── */}
      <SidebarFooter className="relative z-10 px-3 pb-5 pt-3">
        {/* Section counter */}
        <div className="flex items-center justify-between px-1 mb-3">
          <span className="text-[9px] font-mono text-muted-foreground/30 uppercase tracking-widest">Section</span>
          <span className="text-[9px] font-mono font-bold text-primary/60">
            {String(activeIndex + 1).padStart(2, "0")} / {String(navItems.length).padStart(2, "0")}
          </span>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-border/40 to-transparent mb-3" />

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-muted/30 border border-border/20 hover:border-primary/30 hover:bg-muted/50 transition-all duration-200 group"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isDark ? "sun" : "moon"}
              initial={{ rotate: -40, opacity: 0, scale: 0.7 }}
              animate={{ rotate: 0,   opacity: 1, scale: 1   }}
              exit={{    rotate:  40, opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.18 }}
              className="shrink-0"
            >
              {isDark
                ? <Sun  className="h-3.5 w-3.5 text-yellow-400" />
                : <Moon className="h-3.5 w-3.5 text-slate-500"  />}
            </motion.span>
          </AnimatePresence>
          <span className="text-[11px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors flex-1">
            {isDark ? "Dark" : "Light"} Mode
          </span>
          {/* Toggle pill */}
          <span className="w-8 h-[18px] rounded-full bg-border/50 group-hover:bg-border/80 relative flex items-center px-0.5 transition-colors shrink-0">
            <motion.span
              className="w-3.5 h-3.5 rounded-full bg-primary shadow-md shadow-primary/40"
              animate={{ x: isDark ? 14 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
