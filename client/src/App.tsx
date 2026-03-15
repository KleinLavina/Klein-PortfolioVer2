import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { LoadingBlocker } from "@/components/loading-blocker";
import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Wait long enough for all 7 language phrases to cycle through
    const timer = setTimeout(() => setIsLoaded(true), 5800);

    const handleThemeStart = () => setIsLoaded(false);
    const handleThemeEnd = () => setIsLoaded(true);

    window.addEventListener("theme-change-start", handleThemeStart);
    window.addEventListener("theme-change-end", handleThemeEnd);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("theme-change-start", handleThemeStart);
      window.removeEventListener("theme-change-end", handleThemeEnd);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="portfolio-theme">
        <TooltipProvider>
          <LoadingBlocker isLoaded={isLoaded} />
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
