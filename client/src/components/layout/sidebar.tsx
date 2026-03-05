import { useEffect, useState } from "react";
import { 
  Home, 
  User, 
  Code2, 
  Trophy, 
  FolderGit2,
  Mail,
  Moon,
  Sun
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

const navItems = [
  { title: "Home", url: "#home", icon: Home },
  { title: "About", url: "#about", icon: User },
  { title: "Skills", url: "#skills", icon: Code2 },
  { title: "Achievements", url: "#achievements", icon: Trophy },
  { title: "Projects", url: "#projects", icon: FolderGit2 },
  { title: "Contact", url: "#contact", icon: Mail },
];

export function AppSidebar() {
  const [activeSection, setActiveSection] = useState("home");
  const [isClicked, setIsClicked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const getAvatarSrc = () => {
    if (isClicked) return "/ThreePfp.png";
    if (isHovered) return "/TwoPfp.png";
    return "/OnePfp.jpg";
  };

  useEffect(() => {
    // Intersection observer for active nav state
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    document.querySelectorAll("section[id]").forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  return (
    <Sidebar variant="inset" className="border-r border-border/50">
      <SidebarHeader className="p-4 flex flex-col items-center justify-center space-y-3 pt-6">
        <div 
          className="relative group cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            setIsClicked(false);
          }}
          onClick={() => setIsClicked(true)}
        >
          <div className="absolute -inset-1 bg-gradient-brand rounded-full blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
          <Avatar className="h-20 w-20 border-2 border-background relative">
            <AvatarImage src={getAvatarSrc()} alt="Klein F. Lavina" className="object-cover" />
            <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">KL</AvatarFallback>
          </Avatar>
        </div>
        <div className="text-center">
          <h2 className="text-lg font-bold text-foreground">Klein F. Lavina</h2>
          <p className="text-xs font-medium text-gradient">Full Stack Developer</p>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={activeSection === item.url.replace("#", "")}
                    className="rounded-xl transition-all duration-300 hover:bg-primary/10 hover:text-primary data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-lg data-[active=true]:shadow-primary/25"
                  >
                    <a href={item.url} className="flex items-center gap-3 px-4 py-2.5">
                      <item.icon className="h-4 w-4" />
                      <span className="font-semibold text-sm">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 pb-6">
        <div className="flex items-center justify-between bg-muted rounded-2xl p-2 border border-border/50">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="rounded-xl hover:bg-background shadow-sm"
          >
            {isDark ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-slate-700" />}
          </Button>
          <div className="text-xs font-semibold px-2 text-muted-foreground">
            {isDark ? 'Dark Mode' : 'Light Mode'}
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
