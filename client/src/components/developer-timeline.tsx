import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useState, useRef } from "react";

const timelineData = [
  {
    year: "2022",
    phase: "Chapter 01",
    title: "The First Line",
    subtitle: "Where curiosity became code.",
    highlight: "Enrolled in BSIT at Saint Joseph College and took my first real steps into web development — learning HTML, CSS, and JavaScript from scratch.",
    achievements: [
      "Built first static web pages",
      "Mastered CSS Flexbox & Grid",
      "Dean's List — First Semester",
    ],
    learningHighlights: [
      "Responsive layouts & design fundamentals",
      "Introduced to Java & OOP concepts",
      "W3Schools, tutorials, and real practice",
    ],
    techStack: ["HTML", "CSS", "JavaScript", "Java"],
    color: "from-emerald-500/20 to-emerald-500/5",
    accent: "emerald",
    dotColor: "bg-emerald-500",
    borderAccent: "hover:border-emerald-500/40",
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
    ],
    learningHighlights: [
      "PHP + XAMPP dynamic web apps",
      "Auth, CAPTCHA & SQL injection protection",
      "Git version control & GitHub collaboration",
    ],
    techStack: ["PHP", "XAMPP", "MySQL", "Python", "Git", "GitHub"],
    color: "from-violet-500/20 to-violet-500/5",
    accent: "violet",
    dotColor: "bg-violet-500",
    borderAccent: "hover:border-violet-500/40",
  },
  {
    year: "2025 – 2026",
    phase: "Chapter 04",
    title: "The Modern Stack",
    subtitle: "Full-stack, frontend-first.",
    highlight: "Crossed into modern web development — React, Vite, and Django. Built production chatbots, capstone systems, and a school announcement platform.",
    achievements: [
      "Built J-Gear chatbot for office use",
      "Delivered RDFS as capstone project",
      "Designed School Announcement System",
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

function TimelineCard({ item, index }: { item: typeof timelineData[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const isRight = index % 2 === 0;

  return (
    <div className={`flex flex-col sm:flex-row items-start gap-0 sm:gap-8 relative ${isRight ? "sm:flex-row" : "sm:flex-row-reverse"}`}>
      
      {/* ── Left / Right panel (half width) ── */}
      <div className="hidden sm:flex sm:w-1/2 items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, delay: index * 0.08 + 0.15 }}
          className="relative"
        >
          {/* Phase label floating above */}
          <div className={`text-[11px] font-black uppercase tracking-[0.25em] mb-3 ${accentColors[item.accent].split(" ")[0]}`}>
            {item.phase}
          </div>

          {/* Year chip */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold mb-4 ${accentColors[item.accent]}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {item.year}
          </div>

          {/* Big chapter title */}
          <h3 className="text-3xl font-black leading-tight mb-1">{item.title}</h3>
          <p className={`text-sm italic mb-5 ${accentColors[item.accent].split(" ")[0]} opacity-80`}>{item.subtitle}</p>

          {/* Highlight sentence */}
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">{item.highlight}</p>
        </motion.div>
      </div>

      {/* ── Center dot (absolute on desktop, inline on mobile) ── */}
      <div className="absolute left-[9px] sm:left-1/2 top-2 sm:top-1/2 sm:-translate-y-1/2 sm:-translate-x-1/2 z-20 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className={`w-5 h-5 rounded-full border-4 border-background ${item.dotColor} ${accentGlow[item.accent]}`}
        />
      </div>

      {/* ── Right / Left panel — the detailed content card ── */}
      <motion.div
        className={`w-full sm:w-1/2 ml-10 sm:ml-0 ${isRight ? "sm:pl-10" : "sm:pr-10"}`}
        initial={{ opacity: 0, x: isRight ? 40 : -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.1 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Mobile-only header */}
        <div className="sm:hidden mb-4">
          <div className={`text-[10px] font-black uppercase tracking-[0.25em] mb-1 ${accentColors[item.accent].split(" ")[0]}`}>{item.phase}</div>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold mb-2 ${accentColors[item.accent]}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {item.year}
          </div>
          <h3 className="text-xl font-black leading-tight">{item.title}</h3>
          <p className={`text-xs italic ${accentColors[item.accent].split(" ")[0]} opacity-80`}>{item.subtitle}</p>
        </div>

        {/* Main content card */}
        <div
          className={`relative rounded-2xl border border-white/5 bg-card/50 backdrop-blur-sm p-5 transition-all duration-500 ${item.borderAccent} ${hovered ? "shadow-xl -translate-y-1" : ""}`}
          style={{ transition: "transform 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease" }}
        >
          {/* Subtle gradient corner accent */}
          <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-[80px] rounded-tr-2xl bg-gradient-to-bl ${item.color} pointer-events-none`} />

          {/* Mobile highlight */}
          <p className="sm:hidden text-muted-foreground text-xs leading-relaxed mb-4">{item.highlight}</p>

          {/* Two-column sub layout */}
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

          {/* Tech stack badges */}
          <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-1.5">
            {item.techStack.map((tech) => (
              <span
                key={tech}
                className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${accentBadge[item.accent]}`}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function DeveloperTimeline() {
  return (
    <div className="relative max-w-5xl mx-auto">
      {/* Vertical spine */}
      <div className="absolute left-[18px] sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent sm:-translate-x-1/2" />

      <div className="space-y-20 relative z-10">
        {timelineData.map((item, i) => (
          <TimelineCard key={i} item={item} index={i} />
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
  );
}
