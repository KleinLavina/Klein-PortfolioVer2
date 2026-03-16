import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const timelineData = [
  {
    year: "2022",
    phase: "Chapter 01",
    title: "The First Line",
    subtitle: "Where curiosity became code.",
    highlight: "Enrolled in BSIT at Saint Joseph College and took my first real steps into web development — learning HTML, CSS, and JavaScript from scratch.",
    achievements: [
      "Wrote first Java program — \"Hello World\" in Notepad++",
      "Built first static web pages",
      "Mastered CSS Flexbox & Grid",
      "Dean's List — First Semester",
    ],
    learningHighlights: [
      "First steps in programming via Java & OOP fundamentals",
      "Responsive layouts & design fundamentals",
      "W3Schools, tutorials, and real practice",
    ],
    techStack: ["HTML", "CSS", "JavaScript", "Java"],
    color: "from-emerald-500/20 to-emerald-500/5",
    accent: "emerald",
    dotColor: "bg-emerald-500",
    borderAccent: "hover:border-emerald-500/40",
    // Replace the URL below with your own proof image link (screenshot, certificate, etc.)
    proofImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&q=80",
    proofLabel: "Dean's List Certificate · First Web Pages",
  },
  {
    year: "2023 – 2024",
    phase: "Chapter 02",
    title: "The Architect Phase",
    subtitle: "Learning to think in systems.",
    highlight: "Shifted from writing code to designing data. Studied how systems are modeled, how data flows, and how relational databases are built from the ground up.",
    achievements: [
      "Designed normalized relational databases",
      "Modeled systems using DFDs",
      "Built & managed full MySQL databases",
    ],
    learningHighlights: [
      "Data Flow Diagrams & system modeling",
      "Database normalization & architecture",
      "Digital ethics & responsible computing",
    ],
    techStack: ["MySQL", "DFD", "Database Design", "System Modeling"],
    color: "from-blue-500/20 to-blue-500/5",
    accent: "blue",
    dotColor: "bg-blue-500",
    borderAccent: "hover:border-blue-500/40",
    // Replace the URL below with your own proof image link
    proofImage: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=900&q=80",
    proofLabel: "Database Schema · DFD Diagrams",
  },
  {
    year: "2024 – 2025",
    phase: "Chapter 03",
    title: "Building Real Things",
    subtitle: "Code that actually shipped.",
    highlight: "Went from theory to product — built two live e-commerce websites, launched paid work for classmates, and deployed projects to real hosting.",
    achievements: [
      "Launched Cracken Furniture (e-commerce site)",
      "Delivered CrackenGearFits as a paid service",
      "Deployed live projects on InfinityFree",
      "Completed Python programming exercises",
    ],
    learningHighlights: [
      "PHP + XAMPP dynamic web apps",
      "Auth, CAPTCHA & SQL injection protection",
      "Git version control & GitHub collaboration",
      "Introduced to Python and R language",
    ],
    techStack: ["PHP", "XAMPP", "MySQL", "Python", "R", "Git", "GitHub"],
    color: "from-violet-500/20 to-violet-500/5",
    accent: "violet",
    dotColor: "bg-violet-500",
    borderAccent: "hover:border-violet-500/40",
    // Replace the URL below with your own proof image link
    proofImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=80",
    proofLabel: "Cracken Furniture · Live Deployment Screenshot",
  },
  {
    year: "2025 – 2026",
    phase: "Chapter 04",
    title: "The Modern Stack",
    subtitle: "Full-stack, frontend-first.",
    highlight: "Crossed into modern web development — React, Vite, and Django. Built production chatbots, capstone systems, and a school announcement platform. Capped the chapter with a national IT certification.",
    achievements: [
      "Built J-Gear chatbot for office use",
      "Delivered RDFS as capstone project",
      "Designed School Announcement System",
      "Passed the PhilNITS IT Passport Exam",
    ],
    learningHighlights: [
      "React JSX + keyword-based chat logic",
      "Django web framework & HTML templates",
      "Proposed & architected real-world systems",
    ],
    techStack: ["React", "Vite", "Django", "JSX", "Python"],
    color: "from-orange-500/20 to-orange-500/5",
    accent: "orange",
    dotColor: "bg-orange-500",
    borderAccent: "hover:border-orange-500/40",
    // Replace the URL below with your own proof image link
    proofImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900&q=80",
    proofLabel: "J-Gear Chatbot · RDFS Capstone System",
    certification: {
      name: "Certified PhilNITS Passer",
      examineeNo: "IP4500348",
      registeredName: "Laviña, Klein F.",
      url: "https://philnits.org/passers-ip/",
    },
  },
];

const accentColors: Record<string, string> = {
  emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  violet: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  orange: "text-orange-400 bg-orange-500/10 border-orange-500/20",
};

const accentGlow: Record<string, string> = {
  emerald: "shadow-[0_0_20px_rgba(52,211,153,0.3)]",
  blue: "shadow-[0_0_20px_rgba(96,165,250,0.3)]",
  violet: "shadow-[0_0_20px_rgba(167,139,250,0.3)]",
  orange: "shadow-[0_0_20px_rgba(251,146,60,0.3)]",
};

const accentBadge: Record<string, string> = {
  emerald: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25",
  blue: "bg-blue-500/15 text-blue-300 border border-blue-500/25",
  violet: "bg-violet-500/15 text-violet-300 border border-violet-500/25",
  orange: "bg-orange-500/15 text-orange-300 border border-orange-500/25",
};

const accentCheck: Record<string, string> = {
  emerald: "text-emerald-400",
  blue: "text-blue-400",
  violet: "text-violet-400",
  orange: "text-orange-400",
};

const accentButton: Record<string, string> = {
  emerald: "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10",
  blue: "border-blue-500/30 text-blue-400 hover:bg-blue-500/10",
  violet: "border-violet-500/30 text-violet-400 hover:bg-violet-500/10",
  orange: "border-orange-500/30 text-orange-400 hover:bg-orange-500/10",
};

type ProofModalProps = {
  image: string;
  label: string;
  phase: string;
  title: string;
  accent: string;
  onClose: () => void;
};

function ProofModal({ image, label, phase, title, accent, onClose }: ProofModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        key="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

        {/* Modal panel */}
        <motion.div
          key="modal-panel"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative z-10 w-full max-w-2xl rounded-2xl overflow-hidden border border-white/10 bg-[#0e0e10] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-black uppercase tracking-widest ${accentColors[accent].split(" ")[0]}`}>
                {phase}
              </span>
              <span className="text-white/20 text-xs">·</span>
              <span className="text-xs font-semibold text-foreground/70">{title}</span>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors text-lg leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Image */}
          <div className="relative w-full bg-black/30" style={{ aspectRatio: "16/9" }}>
            <img
              src={image}
              alt={label}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Caption */}
          <div className="px-5 py-4 flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground leading-relaxed">{label}</p>
            <a
              href={image}
              target="_blank"
              rel="noopener noreferrer"
              className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border transition-colors ${accentButton[accent]}`}
            >
              Open full ↗
            </a>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function CardBody({
  item,
  index,
  hovered,
  setHovered,
  onViewProof,
}: {
  item: typeof timelineData[0];
  index: number;
  hovered: boolean;
  setHovered: (v: boolean) => void;
  onViewProof: (item: typeof timelineData[0]) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.08 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`relative rounded-2xl border border-white/5 bg-card/50 backdrop-blur-sm p-5 transition-all duration-500 ${item.borderAccent} ${hovered ? "shadow-xl -translate-y-1" : ""}`}
        style={{ transition: "transform 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease" }}
      >
        {/* Corner gradient accent */}
        <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-[80px] rounded-tr-2xl bg-gradient-to-bl ${item.color} pointer-events-none`} />

        <div className="grid grid-cols-1 gap-4">
          {/* Key Achievements */}
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Key Achievements</div>
            <ul className="space-y-1.5">
              {item.achievements.map((ach) => (
                <li key={ach} className="flex items-start gap-2 text-xs text-foreground/80">
                  <span className={`mt-0.5 text-base leading-none ${accentCheck[item.accent]}`}>✦</span>
                  {ach}
                </li>
              ))}
            </ul>
          </div>

          {/* Learning Highlights */}
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Learning Highlights</div>
            <ul className="space-y-1.5">
              {item.learningHighlights.map((hl) => (
                <li key={hl} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="mt-0.5 opacity-40">→</span>
                  {hl}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Certification block */}
        {"certification" in item && item.certification && (
          <a
            href={item.certification.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-4 flex items-start gap-3 rounded-xl border border-orange-500/20 bg-orange-500/5 px-4 py-3 hover:bg-orange-500/10 hover:border-orange-500/40 transition-all duration-300"
          >
            <div className="mt-0.5 shrink-0 w-8 h-8 rounded-lg bg-orange-500/15 border border-orange-500/25 flex items-center justify-center text-base">
              🏅
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-0.5">Certification</div>
              <div className="text-xs font-bold text-foreground leading-snug">{item.certification.name}</div>
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5">
                <span className="text-[10px] text-muted-foreground">
                  <span className="text-foreground/40">Examinee No.</span>{" "}
                  <span className="font-mono font-semibold text-foreground/70">{item.certification.examineeNo}</span>
                </span>
                <span className="text-[10px] text-muted-foreground">
                  <span className="text-foreground/40">Name</span>{" "}
                  <span className="font-semibold text-foreground/70">{item.certification.registeredName}</span>
                </span>
              </div>
            </div>
            <div className="shrink-0 text-orange-400/40 group-hover:text-orange-400 transition-colors text-sm mt-0.5">↗</div>
          </a>
        )}

        {/* Footer: tech badges + proof button */}
        <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {item.techStack.map((tech) => (
              <span key={tech} className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${accentBadge[item.accent]}`}>
                {tech}
              </span>
            ))}
          </div>
          <button
            onClick={() => onViewProof(item)}
            className={`shrink-0 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${accentButton[item.accent]}`}
          >
            <span>View Proof</span>
            <span className="text-sm leading-none">↗</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function TimelineCard({
  item,
  index,
  onViewProof,
}: {
  item: typeof timelineData[0];
  index: number;
  onViewProof: (item: typeof timelineData[0]) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isRight = index % 2 === 0;

  return (
    <>
      {/* ── MOBILE layout ── */}
      <div className="sm:hidden flex gap-4 items-start">
        {/* Inline spine: dot + connecting line */}
        <div className="flex flex-col items-center pt-1 shrink-0" style={{ width: "20px" }}>
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={`w-4 h-4 rounded-full border-[3px] border-background shrink-0 ${item.dotColor} ${accentGlow[item.accent]}`}
          />
          <div className="flex-1 w-px bg-white/10 mt-2" />
        </div>

        {/* Mobile content */}
        <div className="flex-1 min-w-0 pb-6">
          {/* Header */}
          <div className="mb-3">
            <div className={`text-[10px] font-black uppercase tracking-[0.25em] mb-1.5 ${accentColors[item.accent].split(" ")[0]}`}>
              {item.phase}
            </div>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold mb-2 ${accentColors[item.accent]}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {item.year}
            </div>
            <h3 className="text-lg font-black leading-tight mb-0.5">{item.title}</h3>
            <p className={`text-[11px] italic mb-2 ${accentColors[item.accent].split(" ")[0]} opacity-80`}>{item.subtitle}</p>
            <p className="text-muted-foreground text-[11px] leading-relaxed">{item.highlight}</p>
          </div>

          <CardBody item={item} index={index} hovered={hovered} setHovered={setHovered} onViewProof={onViewProof} />
        </div>
      </div>

      {/* ── DESKTOP layout ── */}
      <div className={`hidden sm:flex items-center gap-8 relative ${isRight ? "flex-row" : "flex-row-reverse"}`}>
        {/* Label / info panel */}
        <div className="sm:w-1/2 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, delay: index * 0.08 + 0.15 }}
            className="relative"
          >
            <div className={`text-[11px] font-black uppercase tracking-[0.25em] mb-3 ${accentColors[item.accent].split(" ")[0]}`}>
              {item.phase}
            </div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold mb-4 ${accentColors[item.accent]}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {item.year}
            </div>
            <h3 className="text-3xl font-black leading-tight mb-1">{item.title}</h3>
            <p className={`text-sm italic mb-5 ${accentColors[item.accent].split(" ")[0]} opacity-80`}>{item.subtitle}</p>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">{item.highlight}</p>
          </motion.div>
        </div>

        {/* Center dot */}
        <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={`w-5 h-5 rounded-full border-4 border-background ${item.dotColor} ${accentGlow[item.accent]}`}
          />
        </div>

        {/* Content card */}
        <div className={`sm:w-1/2 ${isRight ? "pl-10" : "pr-10"}`}>
          <CardBody item={item} index={index} hovered={hovered} setHovered={setHovered} onViewProof={onViewProof} />
        </div>
      </div>
    </>
  );
}

export function DeveloperTimeline() {
  const [activeProof, setActiveProof] = useState<typeof timelineData[0] | null>(null);

  return (
    <>
      {/* Proof modal */}
      {activeProof && (
        <ProofModal
          image={activeProof.proofImage}
          label={activeProof.proofLabel}
          phase={activeProof.phase}
          title={activeProof.title}
          accent={activeProof.accent}
          onClose={() => setActiveProof(null)}
        />
      )}

      <div className="relative max-w-5xl mx-auto">
        {/* Vertical spine — desktop only (mobile uses per-card inline spine) */}
        <div className="hidden sm:block absolute sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent sm:-translate-x-1/2" />

        <div className="space-y-20 relative z-10">
          {timelineData.map((item, i) => (
            <TimelineCard
              key={i}
              item={item}
              index={i}
              onViewProof={setActiveProof}
            />
          ))}
        </div>

        {/* Bottom cap */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative z-10 mt-16 flex justify-center"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-px h-8 bg-gradient-to-b from-white/10 to-transparent" />
            <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">Still writing...</div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
