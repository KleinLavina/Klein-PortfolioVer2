import { memo, type CSSProperties, type ElementType } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Github, Globe } from "lucide-react";

import type { ProjectShowcaseItem } from "@/lib/projects";

const PROJECT_TECH_BADGE_CLASS =
  "flex items-center gap-1.5 font-mono text-[11px] px-3 py-1 rounded-full border border-primary/20 text-primary/80 bg-primary/5 hover:bg-primary/10 transition-colors";

const FEATURED_PROJECT_CARD_CLASS =
  "relative overflow-visible";

const FEATURED_PROJECT_IMAGE_OVERLAY_CLASS =
  "absolute inset-0 bg-gradient-to-br from-black/50 via-black/28 to-black/10 opacity-100 transition-opacity duration-700 ease-in-out group-hover:opacity-0";

const FEATURED_PROJECT_PANEL_CLASS =
  "relative z-10 flex-1 py-5 md:py-7";

const FEATURED_PROJECT_PANEL_BACKDROP_CLASS =
  "absolute inset-0 rounded-[2.4rem] bg-gradient-to-r from-card/26 via-card/8 to-transparent opacity-90";

const FEATURED_PROJECT_PANEL_BORDER_CLASS =
  "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/75 to-transparent";

const FEATURED_PROJECT_IMAGE_SHELL_CLASS =
  "relative z-10 isolate aspect-square w-full overflow-hidden rounded-[2rem] border border-border/45 bg-card/35 shadow-[0_34px_90px_-46px_hsl(var(--foreground)/0.5)] backdrop-blur-sm md:w-[38%] md:flex-shrink-0";

function shouldTruncateDescription(description: string) {
  return description.length > 120;
}

function getTruncatedDescription(description: string) {
  return `${description.slice(0, 120).trimEnd()}...`;
}

const ProjectTechBadge = memo(function ProjectTechBadge({
  label,
  Icon,
}: {
  label: string;
  Icon: ElementType<{ className?: string }>;
}) {
  return (
    <span className={PROJECT_TECH_BADGE_CLASS}>
      <Icon className="text-[10px]" />
      {label}
    </span>
  );
});

const ProjectDescription = memo(function ProjectDescription({
  description,
  expanded,
}: {
  description: string;
  expanded: boolean;
}) {
  const content = expanded
    ? description
    : shouldTruncateDescription(description)
      ? getTruncatedDescription(description)
      : description;

  return (
    <p className="text-sm text-muted-foreground leading-relaxed">
      {content}
    </p>
  );
});

export const ProjectShowcaseCard = memo(function ProjectShowcaseCard({
  project,
  index,
  expanded,
  onToggleExpand,
}: {
  project: ProjectShowcaseItem;
  index: number;
  expanded: boolean;
  onToggleExpand: (projectId: number) => void;
}) {
  const watermarkStyle: CSSProperties = project.reverseLayout
    ? {
        left: "-0.5rem",
        top: "-1rem",
        color: "transparent",
        WebkitTextStroke: "1px hsl(var(--foreground) / 0.04)",
      }
    : {
        right: "-0.5rem",
        top: "-1rem",
        color: "transparent",
        WebkitTextStroke: "1px hsl(var(--foreground) / 0.04)",
      };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.55, ease: "easeOut", delay: index * 0.05 }}
      className="group relative"
      style={{ contain: "layout paint" }}
    >
      <div className={FEATURED_PROJECT_CARD_CLASS}>
        <div className={`pointer-events-none absolute left-1/2 top-1/2 h-[72%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r ${project.accentClass} opacity-[0.08] blur-3xl`} />
        <div className={FEATURED_PROJECT_PANEL_BORDER_CLASS} />
        <div className={`absolute left-0 top-6 bottom-6 w-[3px] rounded-full bg-gradient-to-b ${project.accentClass}`} />

        <div
          className="absolute select-none pointer-events-none font-black leading-none text-[11rem] md:text-[14rem]"
          style={watermarkStyle}
        >
          {project.displayIndex}
        </div>

        <div className={`relative flex flex-col gap-8 px-5 py-7 md:px-8 md:py-8 ${project.reverseLayout ? "md:flex-row-reverse md:items-center" : "md:flex-row md:items-center"}`}>
          <div className={FEATURED_PROJECT_PANEL_BACKDROP_CLASS} />

          <div className={FEATURED_PROJECT_IMAGE_SHELL_CLASS}>
            <div className={`absolute inset-0 bg-gradient-to-br ${project.accentClass} opacity-25`} />
            <img
              src={project.thumbnail}
              alt={project.title}
              className="absolute inset-0 h-full w-full object-cover"
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={index === 0 ? "high" : "auto"}
            />
            <div className={FEATURED_PROJECT_IMAGE_OVERLAY_CLASS} />
            <div className="absolute inset-0 ring-1 ring-white/10" />
          </div>

          <div className={FEATURED_PROJECT_PANEL_CLASS}>
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-primary/80">
                  Project {project.displayIndex}
                </span>
              </div>

              <h3 className="mb-4 text-2xl font-black leading-tight text-foreground transition-colors duration-300 md:text-3xl">
                {project.title}
              </h3>

              <div className="mb-5">
                <ProjectDescription description={project.description} expanded={expanded} />
                {shouldTruncateDescription(project.description) && (
                  <motion.button
                    onClick={() => onToggleExpand(project.id)}
                    className="mt-3 flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary transition-colors duration-200 hover:bg-primary/10 hover:text-primary/80 group/btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>{expanded ? "See Less" : "See More"}</span>
                    <motion.div
                      animate={{ rotate: expanded ? -90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight size={12} className="transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                    </motion.div>
                  </motion.button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {project.techBadges.map((tech) => (
                  <ProjectTechBadge key={tech.label} label={tech.label} Icon={tech.Icon} />
                ))}
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
  );
});
