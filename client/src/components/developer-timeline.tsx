import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Expand, FolderOpen } from "lucide-react";
// Technology logos from react-icons - same as home page
import {
  SiHtml5,
  SiJavascript,
  SiTypescript,
  SiReact,
  SiNextdotjs,
  SiTailwindcss,
  SiBootstrap,
  SiDjango,
  SiPhp,
  SiMysql,
  SiPostgresql,
  SiPython,
  SiGit,
  SiGithub,
  SiVite,
} from "react-icons/si";
import { 
  FaCode, 
  FaJava, 
  FaServer, 
  FaCss3Alt,
  FaDatabase,
  FaTools,
  FaCertificate
} from "react-icons/fa";

const philnitsLink = "";

const philnitsProofImages = [
  "/90359102-3375-4a92-a4e9-d2420c6775d6.jpg",
  "/82b4fe4e-8f92-4ff0-be52-a917a55affdb.jpg",
  "/1cf3141b-27d8-4d68-bfb2-6c7c97d5abeb.jpg",
] as const;

const timelineData = [
  {
    year: "2022",
    phase: "Chapter 01",
    title: "The First Line",
    subtitle: "Where curiosity became code.",
    highlight:
      "Enrolled in BSIT at Saint Joseph College and took my first real steps into web development, learning HTML, CSS, and JavaScript from scratch.",
    achievements: [
      { label: "Wrote first Java program", note: '"Hello World" in Notepad++' },
      { label: "Built first static web pages", note: "HTML + CSS from scratch" },
      { label: "Mastered CSS Flexbox & Grid", note: "Responsive layouts" },
    ],
    learningHighlights: [
      "First steps in programming via Java and OOP fundamentals",
      "Responsive layouts and design fundamentals",
      "W3Schools, tutorials, and real practice",
    ],
    techStack: ["HTML", "CSS", "JavaScript", "Java"],
    accent: "emerald",
    projectHref: "#projects",
  },
  {
    year: "2023",
    phase: "Chapter 02",
    title: "The Architect Phase",
    subtitle: "Learning to think in systems.",
    highlight:
      "Shifted from writing code to designing data. Studied how systems are modeled, how data flows, and how relational databases are built from the ground up.",
    achievements: [
      { label: "Designed normalized relational databases", note: "3NF compliance" },
      { label: "Modeled systems using DFDs", note: "Data flow diagrams" },
      { label: "Built and managed full MySQL databases", note: "Queries and schema" },
    ],
    learningHighlights: [
      "Data Flow Diagrams and system modeling",
      "Database normalization and architecture",
      "Digital ethics and responsible computing",
    ],
    techStack: ["MySQL", "DFD", "Database Design", "System Modeling"],
    accent: "blue",
    projectHref: "#projects",
  },
  {
    year: "2024",
    phase: "Chapter 03",
    title: "Building Real Things",
    subtitle: "Code that actually shipped.",
    highlight:
      "Went from theory to product, built two live e-commerce websites, launched paid work for classmates, and deployed projects to real hosting.",
    achievements: [
      { label: "Launched Cracken Furniture", note: "Live e-commerce site" },
      { label: "Built CrackenGearFits", note: "Variant of Cracken Furniture" },
      { label: "Deployed to InfinityFree", note: "First live hosting" },
      { label: "Completed Python exercises", note: "Expanded language skills" },
    ],
    learningHighlights: [
      "PHP + XAMPP dynamic web apps",
      "Auth, CAPTCHA, and SQL injection protection",
      "Git version control and GitHub collaboration",
      "Introduced to Python and R language",
    ],
    techStack: ["PHP", "XAMPP", "MySQL", "Python", "R", "Git", "GitHub"],
    accent: "violet",
    projectHref: "#projects",
  },
  {
    year: "2025",
    phase: "Chapter 04",
    title: "The Modern Stack",
    subtitle: "Full-stack, frontend-first.",
    highlight:
      "Crossed into modern web development with React, Vite, and Django. Built production chatbots, capstone systems, and a school announcement platform.",
    achievements: [
      { label: "Built J-Gear chatbot", note: "FAQ bot for office use" },
      { label: "Delivered RDFS capstone", note: "Real-time dispatch system" },
      { label: "Designed Tag-os School Site", note: "CMS for announcements" },
    ],
    learningHighlights: [
      "React JSX and keyword-based chat logic",
      "Django web framework and HTML templates",
      "Proposed and architected real-world systems",
    ],
    techStack: ["React", "Vite", "Django", "JSX", "Python"],
    accent: "orange",
    projectHref: "#projects",
  },
  {
    year: "2025",
    phase: "Certification",
    title: "PhilNITS Certification",
    subtitle: "Independent proof of core IT knowledge.",
    highlight:
      "Passed the PhilNITS IT Passport examination, adding a formal certification milestone to the portfolio's development timeline.",
    achievements: [
      { label: "Passed PhilNITS IT Passport", note: "National certification milestone" },
      { label: "Certification proof archived", note: "Three official supporting images" },
    ],
    learningHighlights: [
      "Validated core IT concepts through formal testing",
      "Added verifiable proof to the portfolio timeline",
    ],
    techStack: ["PhilNITS", "IT Passport"],
    accent: "orange",
    proofImages: [...philnitsProofImages],
    proofLabel: "PhilNITS certification proof gallery",
    certificationLink: philnitsLink,
  },
] as const;

const palette: Record<
  string,
  {
    text: string;
    bg: string;
    border: string;
    glow: string;
    badge: string;
    pill: string;
    dot: string;
    line: string;
  }
> = {
  emerald: {
    text: "text-emerald-400",
    bg: "bg-emerald-500/8",
    border: "border-emerald-500/20",
    glow: "shadow-[0_0_24px_rgba(52,211,153,0.25)]",
    badge: "bg-emerald-500/12 text-emerald-300 border-emerald-500/25",
    pill: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-400",
    line: "from-emerald-500/0 via-emerald-500/30 to-emerald-500/0",
  },
  blue: {
    text: "text-blue-400",
    bg: "bg-blue-500/8",
    border: "border-blue-500/20",
    glow: "shadow-[0_0_24px_rgba(96,165,250,0.25)]",
    badge: "bg-blue-500/12 text-blue-300 border-blue-500/25",
    pill: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    dot: "bg-blue-400",
    line: "from-blue-500/0 via-blue-500/30 to-blue-500/0",
  },
  violet: {
    text: "text-violet-400",
    bg: "bg-violet-500/8",
    border: "border-violet-500/20",
    glow: "shadow-[0_0_24px_rgba(167,139,250,0.25)]",
    badge: "bg-violet-500/12 text-violet-300 border-violet-500/25",
    pill: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    dot: "bg-violet-400",
    line: "from-violet-500/0 via-violet-500/30 to-violet-500/0",
  },
  orange: {
    text: "text-orange-400",
    bg: "bg-orange-500/8",
    border: "border-orange-500/20",
    glow: "shadow-[0_0_24px_rgba(251,146,60,0.25)]",
    badge: "bg-orange-500/12 text-orange-300 border-orange-500/25",
    pill: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    dot: "bg-orange-400",
    line: "from-orange-500/0 via-orange-500/30 to-orange-500/0",
  },
};

type ChapterItem = (typeof timelineData)[number];

// Tech stack icon mapping for timeline
const getTimelineTechIcon = (tech: string) => {
  const iconMap: { [key: string]: any } = {
    "HTML": SiHtml5,
    "CSS": FaCss3Alt,
    "JavaScript": SiJavascript,
    "TypeScript": SiTypescript,
    "Java": FaJava,
    "Python": SiPython,
    "PHP": SiPhp,
    "React": SiReact,
    "Vite": SiVite,
    "Django": SiDjango,
    "MySQL": SiMysql,
    "PostgreSQL": SiPostgresql,
    "Git": SiGit,
    "GitHub": SiGithub,
    "JSX": SiReact, // Using React icon for JSX
    "XAMPP": FaServer,
    "R": FaCode,
    "DFD": FaTools,
    "Database Design": FaDatabase,
    "System Modeling": FaTools,
    "PhilNITS": FaCertificate,
    "IT Passport": FaCertificate,
  };
  return iconMap[tech] || FaCode; // Default fallback to generic code icon
};

function getProofImages(item: ChapterItem): string[] {
  if ("proofImages" in item && Array.isArray(item.proofImages)) {
    return [...item.proofImages];
  }

  if ("proofImage" in item && typeof item.proofImage === "string") {
    return [item.proofImage];
  }

  return [];
}

function ProofModal({ item, onClose }: { item: ChapterItem; onClose: () => void }) {
  const c = palette[item.accent];
  const proofImages = getProofImages(item);
  const certificationLink = "certificationLink" in item ? item.certificationLink : "";
  const proofLabel = "proofLabel" in item ? item.proofLabel : "Proof gallery";

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] overflow-y-auto"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <div className="relative z-10 flex min-h-dvh items-center justify-center p-3 sm:p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="my-auto flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0e0e10] shadow-2xl max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-5rem)]"
          onClick={(e) => e.stopPropagation()}
        >
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-5">
          <div>
            <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${c.text}`}>{item.phase}</div>
            <div className="mt-1 text-sm font-semibold text-foreground">{item.title}</div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
          >
            ×
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{item.highlight}</p>

          <div className="-mx-1 overflow-x-auto overscroll-x-contain pb-1">
            <div className="grid min-w-[720px] grid-cols-3 gap-4 px-1 md:min-w-0 md:grid-cols-2 xl:grid-cols-3">
            {proofImages.map((imageSrc, index) => (
              <motion.a
                key={imageSrc}
                href={imageSrc}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: index * 0.06 }}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
              >
                <div className="aspect-[4/3] overflow-hidden bg-black/20">
                  <img
                    src={imageSrc}
                    alt={`${item.title} proof ${index + 1}`}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03] group-hover:opacity-90"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <span className="text-xs text-muted-foreground">Proof image {index + 1}</span>
                  <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${c.text}`}>Open</span>
                </div>
              </motion.a>
            ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4">
            <p className="text-xs text-muted-foreground">{proofLabel}</p>
            {certificationLink ? (
              <a
                href={certificationLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all hover:-translate-y-0.5 ${c.pill}`}
              >
                View Certification
              </a>
            ) : null}
          </div>
        </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function Chapter({
  item,
  index,
  onViewProof,
}: {
  item: ChapterItem;
  index: number;
  onViewProof: (i: ChapterItem) => void;
}) {
  const c = palette[item.accent];
  const certificationLink = "certificationLink" in item ? item.certificationLink : "";
  const projectHref = "projectHref" in item ? item.projectHref : "";
  const hasProof = getProofImages(item).length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
      className="relative"
    >
      <div className="relative mb-8 overflow-hidden">
        <div
          className="pointer-events-none absolute -top-6 right-0 select-none text-[7rem] font-black leading-none sm:text-[10rem]"
          style={{ color: "transparent", WebkitTextStroke: "1.5px hsl(var(--foreground) / 0.05)" }}
        >
          {item.year}
        </div>

        <div className="relative z-10">
          <div className={`mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${c.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
            {item.phase} · {item.year}
          </div>

          <h3 className="mb-1 text-3xl font-black leading-none text-foreground sm:text-4xl">{item.title}</h3>
          <p className={`mb-4 text-sm italic opacity-80 ${c.text}`}>{item.subtitle}</p>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{item.highlight}</p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {item.achievements.map((ach, ai) => (
          <motion.div
            key={ach.label}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: ai * 0.07 }}
            className={`group relative cursor-default overflow-hidden rounded-xl border bg-card/40 p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 ${c.border} ${c.glow}`}
          >
            <div className={`pointer-events-none absolute right-0 top-0 h-10 w-10 rounded-bl-2xl rounded-tr-xl ${c.bg}`} />
            <div className={`mb-2 text-[10px] font-black uppercase tracking-widest ${c.text}`}>✦</div>
            <p className="mb-1 text-xs font-bold leading-snug text-foreground">{ach.label}</p>
            <p className="text-[10px] leading-snug text-muted-foreground">{ach.note}</p>
          </motion.div>
        ))}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className={`rounded-xl border bg-card/30 p-4 backdrop-blur-sm ${c.border}`}
        >
          <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">What I Learned</div>
          <ul className="space-y-2">
            {item.learningHighlights.map((hl, li) => (
              <li key={li} className="flex items-start gap-2.5">
                <span className={`mt-0.5 text-xs font-black ${c.text}`}>→</span>
                <span className="text-xs leading-relaxed text-muted-foreground">{hl}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className={`flex flex-col justify-between gap-4 rounded-xl border bg-card/30 p-4 backdrop-blur-sm ${c.border}`}
        >
          <div>
            <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tech Used</div>
            <div className="flex flex-wrap gap-1.5">
              {item.techStack.map((tech) => {
                const IconComponent = getTimelineTechIcon(tech);
                return (
                  <span key={tech} className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${c.pill}`}>
                    <IconComponent className="text-[9px]" />
                    {tech}
                  </span>
                );
              })}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {hasProof ? (
              <button
                onClick={() => onViewProof(item)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all hover:-translate-y-0.5 ${c.pill}`}
              >
                <Expand size={12} />
                View Proof
              </button>
            ) : null}
            {projectHref ? (
              <a
                href={projectHref}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all hover:-translate-y-0.5 ${c.pill}`}
              >
                <FolderOpen size={12} />
                View Projects
              </a>
            ) : null}
            {certificationLink ? (
              <a
                href={certificationLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all hover:-translate-y-0.5 ${c.pill}`}
              >
                View Certification
              </a>
            ) : null}
          </div>
        </motion.div>
      </div>

      {index < timelineData.length - 1 && (
        <div className="mb-2 mt-14 flex items-center gap-4">
          <div className={`h-px flex-1 bg-gradient-to-r ${c.line}`} />
          <div className={`h-2 w-2 rounded-full ${c.dot} opacity-50`} />
          <div className={`h-px flex-1 bg-gradient-to-l ${palette[timelineData[index + 1].accent].line}`} />
        </div>
      )}
    </motion.div>
  );
}

export function DeveloperTimeline() {
  const [activeProof, setActiveProof] = useState<ChapterItem | null>(null);

  return (
    <>
      <AnimatePresence>
        {activeProof ? <ProofModal key="proof-modal" item={activeProof} onClose={() => setActiveProof(null)} /> : null}
      </AnimatePresence>

      <div className="relative mx-auto max-w-4xl space-y-14">
        {timelineData.map((item, i) => (
          <Chapter key={`${item.year}-${item.title}`} item={item} index={i} onViewProof={setActiveProof} />
        ))}

        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col items-center gap-3 pt-6"
        >
          <div className="h-10 w-px bg-gradient-to-b from-white/10 to-transparent" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">Still writing...</span>
        </motion.div>
      </div>
    </>
  );
}
