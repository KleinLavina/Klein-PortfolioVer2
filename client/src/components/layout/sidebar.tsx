import { useEffect, useState } from "react";
import {
  Home,
  User,
  Code2,
  FolderGit2,
  Mail,
  Moon,
  Sun,
  Clock,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/components/theme-provider";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Home",     url: "#home",     icon: Home },
  { title: "About",    url: "#about",    icon: User },
  { title: "Skills",   url: "#skills",   icon: Code2 },
  { title: "Projects", url: "#projects", icon: FolderGit2 },
  { title: "Timeline", url: "#timeline", icon: Clock },
  { title: "Contact",  url: "#contact",  icon: Mail },
];

export function AppSidebar() {
  const [activeSection, setActiveSection] = useState("home");
  const [isClicked, setIsClicked]   = useState(false);
  const [isHovered, setIsHovered]   = useState(false);
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const getAvatarSrc = () => {
    if (isClicked) return "/ThreePfp.png";
    if (isHovered) return "/TwoPfp.png";
    return "/OnePfp.jpg";
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.3 }
    );
    document.querySelectorAll("section[id]").forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <Sidebar variant="sidebar" className="border-r border-border/30 bg-background/60 backdrop-blur-xl">
      {/* ── Header ── */}
      <SidebarHeader className="px-4 pt-7 pb-5 flex flex-col items-center gap-3">
        {/* Avatar */}
        <div
          className="relative cursor-pointer group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => { setIsHovered(false); setIsClicked(false); }}
          onClick={() => setIsClicked(true)}
        >
          <div className="absolute -inset-1.5 rounded-full bg-gradient-brand opacity-20 blur-md group-hover:opacity-60 transition-opacity duration-500" />
          <Avatar className="h-14 w-14 border border-border/40 relative ring-1 ring-primary/20 group-hover:ring-primary/60 transition-all duration-500">
            <AvatarImage src={getAvatarSrc()} alt="Klein F. Lavina" className="object-cover" />
            <AvatarFallback className="bg-primary/20 text-primary font-bold text-base">KL</AvatarFallback>
          </Avatar>
          {/* Online dot */}
          <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-background shadow-sm" />
        </div>

        {/* Name + role */}
        <div className="text-center leading-tight">
          <p className="text-sm font-bold text-foreground tracking-tight">Klein F. Lavina</p>
          <p className="text-[10px] font-mono text-primary/80 tracking-widest uppercase mt-0.5">Full Stack Dev</p>
        </div>

        {/* Thin accent divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </SidebarHeader>

      {/* ── Nav ── */}
      <SidebarContent className="px-3 py-2 flex flex-col gap-0.5">
        <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/40 px-2 mb-2">Navigation</p>
        {navItems.map((item) => {
          const isActive = activeSection === item.url.replace("#", "");
          const isContact = item.title === "Contact";
          return (
            <a
              key={item.title}
              href={item.url}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                isContact
                  ? "mt-2 border border-primary/30 text-primary bg-primary/8 hover:bg-primary hover:text-white hover:border-primary hover:shadow-lg hover:shadow-primary/25"
                  : isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {/* Active left bar */}
              {isActive && !isContact && (
                <motion.span
                  layoutId="activeBar"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-primary shadow-[0_0_8px_rgba(53,211,97,0.6)]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <item.icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span>{item.title}</span>

              {/* Active dot on right */}
              {isActive && !isContact && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(53,211,97,0.7)]" />
              )}
            </a>
          );
        })}
      </SidebarContent>

      {/* ── Footer ── */}
      <SidebarFooter className="px-3 pb-6 pt-2">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-border/40 to-transparent mb-3" />
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/40 border border-border/30 hover:border-primary/30 hover:bg-muted/70 transition-all duration-200 group"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isDark ? "sun" : "moon"}
              initial={{ rotate: -30, opacity: 0, scale: 0.8 }}
              animate={{ rotate: 0,   opacity: 1, scale: 1   }}
              exit={{    rotate:  30, opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              {isDark
                ? <Sun  className="h-4 w-4 text-yellow-400" />
                : <Moon className="h-4 w-4 text-slate-500"  />
              }
            </motion.span>
          </AnimatePresence>
          <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
            {isDark ? "Dark Mode" : "Light Mode"}
          </span>
          <span className="ml-auto w-7 h-4 rounded-full bg-border/60 relative flex items-center px-0.5">
            <motion.span
              className="w-3 h-3 rounded-full bg-primary shadow-sm"
              animate={{ x: isDark ? 12 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
