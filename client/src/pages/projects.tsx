import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { ArrowLeft, ChevronRight, Github, Globe } from "lucide-react";

import { BubbleBackground } from "@/components/ui/bubble-background";
import { PROJECTS, getTechIcon } from "@/lib/projects";

export default function ProjectsPage() {
  const [, setLocation] = useLocation();

  const accentColors = [
    "from-primary via-secondary to-accent",
    "from-accent via-primary to-secondary",
    "from-secondary via-accent to-primary",
    "from-primary via-accent to-secondary",
    "from-accent via-secondary to-primary",
    "from-secondary via-primary to-accent",
  ];

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

        <div className="space-y-8">
          {PROJECTS.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut", delay: i * 0.05 }}
              className="group relative"
            >
              <div
                className="absolute -inset-[1px] rounded-[2rem] bg-gradient-to-br opacity-20 blur-xl transition-opacity duration-500 group-hover:opacity-30"
                style={{
                  backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                }}
              />
              <div
                className={`absolute -inset-px rounded-[2rem] bg-gradient-to-br ${accentColors[i % accentColors.length]} opacity-35 blur-lg transition-all duration-500 group-hover:opacity-55`}
              />

              <div className="relative overflow-hidden rounded-[2rem] border border-border/50 bg-card/55 shadow-[0_28px_70px_-38px_hsl(var(--foreground)/0.45)] backdrop-blur-xl transition-all duration-500 group-hover:-translate-y-1 group-hover:border-primary/30">
                <div className="grid gap-0 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)]">
                  <div className="relative min-h-[250px] overflow-hidden border-b border-border/20 lg:min-h-full lg:border-b-0 lg:border-r lg:border-border/20">
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] backdrop-brightness-90 backdrop-saturate-150 transition-all duration-700 ease-in-out group-hover:opacity-0" />
                  </div>

                  <div className="relative z-10 flex flex-col justify-between p-7 md:p-10">
                    <div>
                      <div className="mb-4 flex items-center gap-2">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-primary/80">
                          Project {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>

                      <h2 className="mb-4 text-2xl font-black leading-tight text-foreground transition-colors duration-300 md:text-3xl">
                        {project.title}
                      </h2>

                      <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                        {project.description}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {project.techStack.map((tech) => {
                          const IconComponent = getTechIcon(tech);

                          return (
                            <span
                              key={tech}
                              className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 font-mono text-[11px] text-primary/80 transition-colors hover:bg-primary/10"
                            >
                              <IconComponent className="text-[10px]" />
                              {tech}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-3 border-t border-border/15 pt-5">
                      {project.liveUrl ? (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 rounded-lg border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/20"
                        >
                          <Globe size={13} /> Live Demo
                        </a>
                      ) : null}

                      {project.githubUrl ? (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 rounded-lg border border-border/25 bg-muted/40 px-4 py-2 text-sm font-semibold text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted/60 hover:text-foreground"
                        >
                          <Github size={13} /> GitHub
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

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
