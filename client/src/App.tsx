import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { LoadingBlocker } from "@/components/loading-blocker";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { useState, useEffect, useCallback } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Admin from "@/pages/admin";
import ProjectsPage from "@/pages/projects";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/projects" component={ProjectsPage} />
      <Route path="/klein/admin/messages" component={Admin} />
      <Route path="/klein/admin" component={Admin} />
      <Route path="/klein/admin/" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [location] = useLocation();

  const isAdminRoute = location.startsWith("/klein/admin");

  const handleComplete = useCallback(() => setIsLoaded(true), []);

  useEffect(() => {
    if (isAdminRoute) setIsLoaded(true);
  }, [isAdminRoute]);

  useEffect(() => {
    const handleThemeStart = () => { if (!isAdminRoute) setIsLoaded(false); };
    window.addEventListener("theme-change-start", handleThemeStart);
    return () => window.removeEventListener("theme-change-start", handleThemeStart);
  }, [isAdminRoute]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="portfolio-theme">
        <TooltipProvider>
          {!isAdminRoute && <CustomCursor />}
          {!isAdminRoute && (
            <LoadingBlocker isLoaded={isLoaded} onComplete={handleComplete} />
          )}
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
