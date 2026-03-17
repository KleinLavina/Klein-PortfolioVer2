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
      { label: "Wrote first Java program", note: "\"Hello World\" in Notepad++" },
      { label: "Built first static web pages", note: "HTML + CSS from scratch" },
      { label: "Mastered CSS Flexbox & Grid", note: "Responsive layouts" },
      { label: "Dean's List", note: "First Semester" },
    ],
    learningHighlights: [
      "First steps in programming via Java & OOP fundamentals",
      "Responsive layouts & design fundamentals",
      "W3Schools, tutorials, and real practice",
    ],
    techStack: ["HTML", "CSS", "JavaScript", "Java"],
    accent: "emerald",
    proofImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&q=80",
    proofLabel: "Dean's List Certificate · First Web Pages",
  },
  {
    year: "2023",
    phase: "Chapter 02",
    title: "The Architect Phase",
    subtitle: "Learning to think in systems.",
    highlight: "Shifted from writing code to designing data. Studied how systems are modeled, how data flows, and how relational databases are built from the ground up.",
    achievements: [
      { label: "Designed normalized relational databases", note: "3NF compliance" },
      { label: "Modeled systems using DFDs", note: "Data flow diagrams" },
      { label: "Built & managed full MySQL databases", note: "Queries & schema" },
    ],
    learningHighlights: [
      "Data Flow Diagrams & system modeling",
      "Database normalization & architecture",
      "Digital ethics & responsible computing",
    ],
    techStack: ["MySQL", "DFD", "Database Design", "System Modeling"],
    accent: "blue",
    proofImage: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=900&q=80",
    proofLabel: "Database Schema · DFD Diagrams",
  },
  {
    year: "2024",
    phase: "Chapter 03",
    title: "Building Real Things",
    subtitle: "Code that actually shipped.",
    highlight: "Went from theory to product — built two live e-commerce websites, launched paid work for classmates, and deployed projects to real hosting.",
    achievements: [
      { label: "Launched Cracken Furniture", note: "Live e-commerce site" },
      { label: "Delivered CrackenGearFits", note: "Paid client project" },
      { label: "Deployed to InfinityFree", note: "First live hosting" },
      { label: "Completed Python exercises", note: "Expanded language skills" },
    ],
    learningHighlights: [
      "PHP + XAMPP dynamic web apps",
      "Auth, CAPTCHA & SQL injection protection",
      "Git version control & GitHub collaboration",
      "Introduced to Python and R language",
    ],
    techStack: ["PHP", "XAMPP", "MySQL", "Python", "R", "Git", "GitHub"],
    accent: "violet",
    proofImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=80",
    proofLabel: "Cracken Furniture · Live Deployment Screenshot",
  },
  {
    year: "2025",
    phase: "Chapter 04",
    title: "The Modern Stack",
    subtitle: "Full-stack, frontend-first.",
    highlight: "Crossed into modern web development — React, Vite, and Django. Built production chatbots, capstone systems, and a school announcement platform. Capped it with a national IT certification.",
    achievements: [
      { label: "Built J-Gear chatbot", note: "FAQ bot for office use" },
      { label: "Delivered RDFS capstone", note: "Real-time dispatch system" },
      { label: "Designed Tag-os School Site", note: "CMS for announcements" },
      { label: "Passed PhilNITS IT Passport", note: "National certification" },
    ],
    learningHighlights: [
      "React JSX + keyword-based chat logic",
      "Django web framework & HTML templates",
      "Proposed & architected real-world systems",
    ],
    techStack: ["React", "Vite", "Django", "JSX", "Python"],
    accent: "orange",
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

const palette: Record<string, {
  text: string; bg: string; border: string; glow: string;
  badge: string; pill: string; dot: string; line: string;
}> = {
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

type ChapterItem = typeof timelineData[0];

function ProofModal({ item, onClose }: { item: ChapterItem; onClose: () => void }) {
  const c = palette[item.accent];
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative z-10 w-full max-w-2xl rounded-2xl overflow-hidden border border-white/10 bg-[#0e0e10] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-black uppercase tracking-widest ${c.text}`}>{item.phase}</span>
            <span className="text-white/20">·</span>
            <span className="text-xs font-semibold text-foreground/70">{item.title}</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors text-lg">×</button>
        </div>
        <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
          <img src={item.proofImage} alt={item.proofLabel} className="w-full h-full object-cover" />
        </div>
        <div className="px-5 py-4 flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">{item.proofLabel}</p>
          <a href={item.proofImage} target="_blank" rel="noopener noreferrer"
            className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border transition-colors ${c.pill}`}>
            Open full ↗
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Chapter({ item, index, onViewProof }: { item: ChapterItem; index: number; onViewProof: (i: ChapterItem) => void }) {
  const c = palette[item.accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
      className="relative"
    >
      {/* ── CHAPTER HEADER ─────────────────────────────── */}
      <div className="relative mb-8 overflow-hidden">
        {/* Ghost year watermark */}
        <div
          className="absolute -top-6 right-0 font-black leading-none select-none pointer-events-none text-[7rem] sm:text-[10rem]"
          style={{ color: "transparent", WebkitTextStroke: "1.5px hsl(var(--foreground) / 0.05)" }}
        >
          {item.year}
        </div>

        <div className="relative z-10">
          {/* Phase badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${c.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
            {item.phase} · {item.year}
          </div>

          <h3 className="text-3xl sm:text-4xl font-black text-foreground leading-none mb-1">{item.title}</h3>
          <p className={`text-sm italic mb-4 ${c.text} opacity-80`}>{item.subtitle}</p>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">{item.highlight}</p>
        </div>
      </div>

      {/* ── ACHIEVEMENT CARDS ──────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {item.achievements.map((ach, ai) => (
          <motion.div
            key={ach.label}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: ai * 0.07 }}
            className={`group relative rounded-xl border p-4 bg-card/40 backdrop-blur-sm hover:-translate-y-1 hover:${c.glow} transition-all duration-300 cursor-default overflow-hidden ${c.border}`}
          >
            {/* Corner accent */}
            <div className={`absolute top-0 right-0 w-10 h-10 ${c.bg} rounded-bl-2xl rounded-tr-xl pointer-events-none`} />
            <div className={`text-[10px] font-black uppercase tracking-widest mb-2 ${c.text}`}>✦</div>
            <p className="text-xs font-bold text-foreground leading-snug mb-1">{ach.label}</p>
            <p className="text-[10px] text-muted-foreground leading-snug">{ach.note}</p>
          </motion.div>
        ))}
      </div>

      {/* ── LEARNING HIGHLIGHTS + TECH ──────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {/* Learning highlights */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className={`rounded-xl border p-4 bg-card/30 backdrop-blur-sm ${c.border}`}
        >
          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">What I Learned</div>
          <ul className="space-y-2">
            {item.learningHighlights.map((hl, li) => (
              <li key={li} className="flex items-start gap-2.5">
                <span className={`mt-0.5 text-xs font-black ${c.text}`}>→</span>
                <span className="text-xs text-muted-foreground leading-relaxed">{hl}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Tech stack + proof */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className={`rounded-xl border p-4 bg-card/30 backdrop-blur-sm flex flex-col justify-between gap-4 ${c.border}`}
        >
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Tech Used</div>
            <div className="flex flex-wrap gap-1.5">
              {item.techStack.map((tech) => (
                <span key={tech} className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${c.pill}`}>
                  {tech}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={() => onViewProof(item)}
            className={`self-start flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all hover:-translate-y-0.5 ${c.pill}`}
          >
            View Proof ↗
          </button>
        </motion.div>
      </div>

      {/* ── CERTIFICATION (if any) ──────────────────────── */}
      {"certification" in item && item.certification && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <a
            href={item.certification.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex items-start gap-4 rounded-xl border p-4 bg-card/30 backdrop-blur-sm hover:${c.bg} transition-all duration-300 ${c.border}`}
          >
            <div className={`shrink-0 w-9 h-9 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center text-base`}>🏅</div>
            <div className="flex-1 min-w-0">
              <div className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${c.text}`}>Certification</div>
              <div className="text-xs font-bold text-foreground">{item.certification.name}</div>
              <div className="flex flex-wrap gap-x-4 mt-1">
                <span className="text-[10px] text-muted-foreground">No. <span className="font-mono font-semibold text-foreground/70">{item.certification.examineeNo}</span></span>
                <span className="text-[10px] text-muted-foreground">Name <span className="font-semibold text-foreground/70">{item.certification.registeredName}</span></span>
              </div>
            </div>
            <span className={`text-xs mt-0.5 ${c.text} opacity-40 group-hover:opacity-100 transition-opacity`}>↗</span>
          </a>
        </motion.div>
      )}

      {/* ── SEPARATOR (not after last) ─────────────────── */}
      {index < timelineData.length - 1 && (
        <div className="mt-14 mb-2 flex items-center gap-4">
          <div className={`flex-1 h-px bg-gradient-to-r ${c.line}`} />
          <div className={`w-2 h-2 rounded-full ${c.dot} opacity-50`} />
          <div className={`flex-1 h-px bg-gradient-to-l ${palette[timelineData[index + 1].accent].line}`} />
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
        {activeProof && (
          <ProofModal key="proof-modal" item={activeProof} onClose={() => setActiveProof(null)} />
        )}
      </AnimatePresence>

      <div className="relative max-w-4xl mx-auto space-y-14">
        {timelineData.map((item, i) => (
          <Chapter key={i} item={item} index={i} onViewProof={setActiveProof} />
        ))}

        {/* Bottom cap */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col items-center gap-3 pt-6"
        >
          <div className="w-px h-10 bg-gradient-to-b from-white/10 to-transparent" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">Still writing...</span>
        </motion.div>
      </div>
    </>
  );
}
