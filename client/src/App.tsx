import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { LoadingBlocker } from "@/components/loading-blocker";
import { useState } from "react";
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

  const handleComplete = () => setIsLoaded(true);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="portfolio-theme">
        <TooltipProvider>
          <LoadingBlocker isLoaded={isLoaded} onComplete={handleComplete} />
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
