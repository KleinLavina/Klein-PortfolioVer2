import { memo } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { ArrowLeft, ChevronRight } from "lucide-react";

import { ProjectShowcaseCard } from "@/components/project-showcase-card";
import { BubbleBackground } from "@/components/ui/bubble-background";
import { PROJECTS, buildProjectShowcaseItems } from "@/lib/projects";

const PROJECT_SHOWCASE_ITEMS = buildProjectShowcaseItems(PROJECTS);

const ProjectsArchiveList = memo(function ProjectsArchiveList() {
  return (
    <div className="space-y-8">
      {PROJECT_SHOWCASE_ITEMS.map((project, index) => (
        <ProjectShowcaseCard
          key={project.id}
          project={project}
          index={index}
        />
      ))}
    </div>
  );
});

export default function ProjectsPage() {
  const [, setLocation] = useLocation();

  const handleReturnHome = () => {
    window.sessionStorage.setItem("portfolio-scroll-target", "projects");
    setLocation("/");
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      <div
        className="fixed inset-0 z-0 transition-opacity duration-500 ease-out"
        style={{ opacity: "var(--ambient-bg-opacity, 1)" }}
      >
        <BubbleBackground className="h-full w-full" />
      </div>

      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 px-2.5 sm:top-5 sm:px-6">
        <div className="mx-auto flex max-w-full justify-start">
          <button
            type="button"
            onClick={handleReturnHome}
            className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/35 bg-background/82 text-foreground shadow-[0_22px_50px_-34px_hsl(var(--foreground)/0.42)] backdrop-blur-2xl transition-all duration-300 hover:border-primary/35 hover:bg-muted/55 hover:text-primary sm:w-auto sm:gap-2 sm:px-4"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Return</span>
          </button>
        </div>
      </div>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-28 sm:px-8 sm:pt-32 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="mb-3 flex items-center gap-3">
            <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-primary">03</span>
            <span className="h-px w-8 bg-primary/50" />
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Projects Archive
            </span>
          </div>

          <h1 className="text-4xl font-black leading-tight text-foreground sm:text-5xl">
            Every build,
            <br />
            <span className="text-gradient">all in one place.</span>
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            A full view of the projects I have built so far, from systems shaped by real workflows to
            experimental products shipped to learn by doing.
          </p>
        </motion.div>

        <ProjectsArchiveList />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15 }}
          className="mt-12 flex justify-center"
        >
          <button
            type="button"
            onClick={handleReturnHome}
            className="group flex items-center gap-2.5 rounded-xl border border-border/40 bg-card/40 px-7 py-3 text-sm font-semibold text-muted-foreground backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
          >
            <ArrowLeft size={15} />
            <span>Back To Featured Projects</span>
            <ChevronRight size={15} className="rotate-180 transition-transform duration-300 group-hover:-translate-x-1" />
          </button>
        </motion.div>
      </main>
    </div>
  );
}
