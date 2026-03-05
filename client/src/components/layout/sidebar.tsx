import { useEffect, useState } from "react";
import { 
  Home, 
  User, 
  Code2, 
  Trophy, 
  FolderGit2, 
  MessageSquare, 
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
  { title: "Chat Room", url: "#chat", icon: MessageSquare },
  { title: "Contact", url: "#contact", icon: Mail },
];

export function AppSidebar() {
  const [activeSection, setActiveSection] = useState("home");
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

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
      <SidebarHeader className="p-6 flex flex-col items-center justify-center space-y-4 pt-10">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-brand rounded-full blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
          {/* using unspalsh image as avatar placeholder */}
          <Avatar className="h-24 w-24 border-2 border-background relative">
            <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop" alt="Klein F. Lavina" />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">KL</AvatarFallback>
          </Avatar>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground">Klein F. Lavina</h2>
          <p className="text-sm font-medium text-gradient">Full Stack Developer</p>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={activeSection === item.url.replace("#", "")}
                    className="rounded-xl transition-all duration-300 hover:bg-primary/10 hover:text-primary data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-lg data-[active=true]:shadow-primary/25"
                  >
                    <a href={item.url} className="flex items-center gap-3 px-4 py-3">
                      <item.icon className="h-5 w-5" />
                      <span className="font-semibold">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-6 pb-8">
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
