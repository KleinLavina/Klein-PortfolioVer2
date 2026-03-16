import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faHandshake, faRocket, faBookOpen, faArrowsRotate } from "@fortawesome/free-solid-svg-icons";
import { Shell } from "@/components/layout/shell";
import { BubbleBackground } from "@/components/ui/bubble-background";
import { Section } from "@/components/ui/section";
import { ScrollTextFill } from "@/components/ui/scroll-text-fill";
import { GithubContributions } from "@/components/github-contributions";
import { DeveloperTimeline } from "@/components/developer-timeline";
import { useProjects } from "@/hooks/use-projects";
import { useCreateMessage } from "@/hooks/use-messages";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2, Send, Github, Code, Database, MonitorSmartphone,
  Layers, Server, TerminalSquare, Mail, FolderGit2,
  Lightbulb, Users, Wrench, Zap, BookOpen, MessageCircle, ArrowDown,
  ChevronRight, Sparkles, Globe
} from "lucide-react";
import { useState, useEffect } from "react";
import { useMagnetic } from "@/hooks/use-magnetic";

const SKILLS = {
  "Frontend": [
    { name: "HTML", icon: Code, color: "text-orange-500", level: 4 as const },
    { name: "CSS", icon: Layers, color: "text-blue-500", level: 4 as const },
    { name: "JavaScript", icon: TerminalSquare, color: "text-yellow-400", level: 3 as const },
    { name: "TypeScript", icon: TerminalSquare, color: "text-blue-600", level: 2 as const },
    { name: "React", icon: MonitorSmartphone, color: "text-cyan-500", level: 2 as const },
    { name: "Next.js", icon: MonitorSmartphone, color: "text-foreground", level: 2 as const },
    { name: "Tailwind", icon: Layers, color: "text-cyan-400", level: 2 as const },
    { name: "Bootstrap", icon: Layers, color: "text-purple-500", level: 2 as const },
  ],
  "Backend": [
    { name: "Django", icon: Server, color: "text-green-600", level: 3 as const },
    { name: "PHP", icon: Server, color: "text-indigo-400", level: 3 as const },
  ],
  "Databases": [
    { name: "MySQL", icon: Database, color: "text-blue-500", level: 3 as const },
    { name: "PostgreSQL", icon: Database, color: "text-blue-400", level: 3 as const },
  ],
  "Languages": [
    { name: "Java", icon: Code, color: "text-red-500", level: 1 as const },
    { name: "Python", icon: Code, color: "text-blue-400", level: 3 as const },
    { name: "R", icon: Code, color: "text-blue-600", level: 1 as const },
  ],
  "Tools": [
    { name: "VS Code", icon: Code, color: "text-blue-500", level: 3 as const },
    { name: "Git", icon: FolderGit2, color: "text-orange-600", level: 3 as const },
    { name: "GitHub", icon: FolderGit2, color: "text-foreground", level: 3 as const },
    { name: "Figma", icon: Layers, color: "text-pink-500", level: 2 as const },
    { name: "Postman", icon: Layers, color: "text-orange-500", level: 1 as const },
    { name: "Cloudinary", icon: Layers, color: "text-blue-600", level: 1 as const },
    { name: "Replit", icon: Code, color: "text-orange-500", level: 2 as const },
    { name: "Render", icon: Server, color: "text-purple-600", level: 2 as const },
    { name: "Canva", icon: Layers, color: "text-cyan-500", level: 2 as const },
  ],
};

const PROFESSIONAL_SKILLS = [
  { name: "Problem Solving", icon: Lightbulb, color: "text-yellow-400", description: "Analytical approach to complex challenges" },
  { name: "Team Collaboration", icon: Users, color: "text-blue-500", description: "Effective communication and teamwork" },
  { name: "Technical Troubleshooting", icon: Wrench, color: "text-orange-500", description: "Quick diagnosis and resolution" },
  { name: "Adaptability", icon: Zap, color: "text-purple-500", description: "Fast learner with new technologies" },
  { name: "Continuous Learning", icon: BookOpen, color: "text-green-500", description: "Always expanding knowledge" },
  { name: "Communication", icon: MessageCircle, color: "text-cyan-500", description: "Clear technical and non-technical communication" },
];

const TECH_PILLS = ["React", "TypeScript", "Node.js", "Django", "PostgreSQL", "Python", "Next.js", "Tailwind"];

function SectionLabel({ num, label }: { num: string; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-xs font-mono font-bold text-primary tracking-[0.2em] uppercase">{num}</span>
      <span className="h-px w-8 bg-primary/50" />
      <span className="text-xs font-mono text-muted-foreground tracking-widest uppercase">{label}</span>
    </div>
  );
}

export default function Home() {
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const createMessage = useCreateMessage();

  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const mag1 = useMagnetic(0.3);
  const mag2 = useMagnetic(0.3);
  const bubbleOpacity = useMotionValue(1);
  const smoothOpacity = useSpring(bubbleOpacity, { stiffness: 60, damping: 20 });

  useEffect(() => {
    const timelineSection = document.getElementById("timeline");
    if (!timelineSection) return;
    const scrollContainer = document.querySelector("main.flex-1");
    if (!scrollContainer) return;

    const handleScroll = () => {
      const rect = timelineSection.getBoundingClientRect();
      const containerRect = scrollContainer.getBoundingClientRect();
      const containerHeight = containerRect.height;
      const sectionMid = rect.top + rect.height / 2;
      const fadeStart = containerRect.top + containerHeight * 0.6;
      const fadeEnd = containerRect.top + containerHeight / 2;
      const progress = Math.min(1, Math.max(0, (fadeStart - sectionMid) / (fadeStart - fadeEnd)));
      bubbleOpacity.set(1 - progress);
    };

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [bubbleOpacity]);

  const handleMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMessage.mutate(formData, {
      onSuccess: () => setFormData({ name: "", email: "", message: "" })
    });
  };

  return (
    <Shell>
      <motion.div className="fixed inset-0 z-0" style={{ opacity: smoothOpacity }}>
        <BubbleBackground interactive className="w-full h-full" />
      </motion.div>

      <div className="max-w-6xl mx-auto p-4 sm:p-8 lg:p-12 relative z-10">

        {/* ─── HERO ─────────────────────────────────────────────────────── */}
        <Section id="home" className="justify-center min-h-screen py-0 pt-0">
          <div className="w-full flex flex-col justify-center">

            {/* Main hero content — centered layout */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
              className="max-w-4xl"
            >
              <p className="text-xs font-mono text-primary mb-4 tracking-widest">// Hello, World!</p>

              <h1 className="text-[clamp(2.6rem,6.5vw,5.5rem)] font-black leading-[0.9] tracking-tight mb-1">
                <span className="text-foreground">Hi, I'm </span>
                <span className="text-gradient font-cursive font-normal whitespace-nowrap">Klein F. Lavina</span>
              </h1>

              <div className="flex items-center gap-4 mb-4">
                <div className="h-px w-10 bg-primary/50" />
                <h2 className="text-base sm:text-lg font-semibold text-muted-foreground tracking-wide">
                  Fresh Graduate · Full Stack Developer
                </h2>
              </div>

              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed mb-6">
                BSIT graduate with hands-on experience from internship, school and personal projects. I build full-stack apps with Django, PHP, and React — and I'm just getting started.
              </p>

              {/* Stats row */}
              <div className="flex gap-8 border-y border-border/30 py-4 mb-6 w-fit">
                {[
                  { n: "8+", label: "PROJECTS BUILT" },
                  { n: "15+", label: "TECH STACKS" },
                  { n: "PhilNITS", label: "CERTIFIED PASSER" },
                ].map(s => (
                  <div key={s.label}>
                    <div className="text-2xl font-black text-primary">{s.n}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <div
                  ref={mag1.ref as React.RefObject<HTMLDivElement>}
                  onMouseMove={mag1.onMouseMove}
                  onMouseLeave={mag1.onMouseLeave}
                  className="inline-block"
                >
                  <Button size="lg" className="group relative overflow-hidden rounded-2xl px-8 bg-primary text-white font-bold text-sm shadow-2xl shadow-primary/40 hover:shadow-primary/60 hover:-translate-y-2 hover:scale-105 transition-all duration-300 border-2 border-white/20 backdrop-blur-sm h-11">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
                    <a href="#projects" className="relative flex items-center gap-3 z-10">
                      <span className="tracking-wide">View My Work</span>
                      <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform duration-300" />
                    </a>
                  </Button>
                </div>
                <div
                  ref={mag2.ref as React.RefObject<HTMLDivElement>}
                  onMouseMove={mag2.onMouseMove}
                  onMouseLeave={mag2.onMouseLeave}
                  className="inline-block"
                >
                  <Button size="lg" variant="outline" className="rounded-full px-8 border border-border/60 hover:border-primary/50 hover:text-primary transition-all h-11 text-sm font-bold backdrop-blur-sm">
                    <a href="#contact" className="flex items-center gap-2">
                      <Mail size={15} />
                      Contact Me
                    </a>
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="mt-16 flex items-center gap-3"
            >
              <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}>
                <ArrowDown size={14} className="text-muted-foreground/50" />
              </motion.div>
              <span className="text-xs font-mono text-muted-foreground/40 tracking-widest uppercase">Scroll to explore</span>
            </motion.div>
          </div>
        </Section>

        {/* ─── ABOUT ───────────────────────────────────────────────────── */}
        <Section id="about" className="!min-h-0 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <SectionLabel num="01" label="About Me" />
            <h2 className="text-4xl sm:text-5xl font-black text-foreground mb-10 leading-tight">
              Crafting the web,<br />
              <span className="text-gradient">one commit at a time.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* TOP LEFT: JSON Terminal */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl overflow-hidden border border-border/30 shadow-2xl"
            >
              <div className="flex items-center gap-2 px-4 py-3 bg-muted/60 border-b border-border/30 backdrop-blur-sm">
                <span className="w-3 h-3 rounded-full bg-red-400/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-400/80" />
                <span className="w-3 h-3 rounded-full bg-green-400/80" />
                <span className="ml-3 text-xs font-mono text-muted-foreground/60">about.json</span>
              </div>
              <div className="p-6 bg-card/40 backdrop-blur-xl font-mono text-sm leading-relaxed h-full">
                <pre className="text-muted-foreground/80 whitespace-pre-wrap">{`{
  `}<span className="text-secondary">"name"</span>{`: `}<span className="text-primary">"Klein F. Lavina"</span>{`,
  `}<span className="text-secondary">"role"</span>{`: `}<span className="text-primary">"Full Stack Developer"</span>{`,
  `}<span className="text-secondary">"location"</span>{`: `}<span className="text-primary">"Philippines 🇵🇭"</span>{`,
  `}<span className="text-secondary">"experience"</span>{`: `}<span className="text-accent">"Fresh Graduate"</span>{`,
  `}<span className="text-secondary">"specialization"</span>{`: [
    `}<span className="text-primary">"React"</span>{`, `}<span className="text-primary">"Django"</span>{`,
    `}<span className="text-primary">"PHP"</span>{`, `}<span className="text-primary">"PostgreSQL"</span>
{`  ],
  `}<span className="text-secondary">"passion"</span>{`: `}<span className="text-primary">"Making things actually work"</span>{`,
  `}<span className="text-secondary">"certifications"</span>{`: [`}<span className="text-primary">"PhilNITS Passer"</span>{`],
  `}<span className="text-secondary">"openToWork"</span>{`: `}<span className="text-green-400">true</span>
{`}`}
</pre>
              </div>
            </motion.div>

            {/* TOP RIGHT: Text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col justify-center space-y-4 p-2"
            >
              <p className="text-base text-muted-foreground leading-relaxed">
                I'm a fresh CS grad from the Philippines who builds full-stack web apps using{" "}
                <span className="text-foreground font-semibold">Django</span>,{" "}
                <span className="text-foreground font-semibold">PHP</span>, and{" "}
                <span className="text-foreground font-semibold">React</span>. I got into dev because I wanted to understand how websites actually work — turns out, I just never stopped building them.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                I care about writing code that actually makes sense to the next person reading it. Outside of coding I'm still learning — picking up new tools, breaking things, and figuring out why.
              </p>
              <blockquote className="border-l-2 border-primary pl-4">
                <p className="text-sm italic text-muted-foreground/80">
                  "Passed PhilNITS. Still googling CSS flexbox."
                </p>
              </blockquote>
            </motion.div>

            {/* BOTTOM LEFT: Value Cards */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-2xl border border-border/30 p-5 bg-card/40 backdrop-blur-xl shadow-2xl"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Values I code by</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: faPencil, color: "text-primary", title: "Clean Code", desc: "Write it like someone else has to read it tomorrow." },
                  { icon: faHandshake, color: "text-secondary", title: "Honesty", desc: 'I\'d rather say "I don\'t know yet" than fake it.' },
                  { icon: faRocket, color: "text-accent", title: "Ship It", desc: "Done and imperfect beats perfect and never shipped." },
                  { icon: faBookOpen, color: "text-green-400", title: "Always Learning", desc: "Every bug is a lesson. Every project levels me up." },
                ].map((v) => (
                  <div key={v.title} className="rounded-xl p-3 bg-muted/30 border border-border/20 hover:border-primary/20 transition-colors">
                    <FontAwesomeIcon icon={v.icon} className={`${v.color} text-base mb-2`} />
                    <div className="text-sm font-semibold text-foreground mb-1">{v.title}</div>
                    <div className="text-xs text-muted-foreground leading-snug">{v.desc}</div>
                  </div>
                ))}
                <div className="col-span-2 rounded-xl p-3 bg-muted/30 border border-border/20 hover:border-primary/20 transition-colors flex items-center gap-4">
                  <FontAwesomeIcon icon={faArrowsRotate} className="text-purple-400 text-base shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-foreground mb-0.5">Iteration</div>
                    <div className="text-xs text-muted-foreground leading-snug">Version 1 is never the best version — keep improving, keep refining.</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* BOTTOM RIGHT: Git Log Terminal */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="rounded-2xl overflow-hidden border border-border/30 shadow-2xl"
              style={{ backgroundColor: '#0d1117' }}
            >
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10" style={{ backgroundColor: '#161b22' }}>
                <span className="w-3 h-3 rounded-full bg-red-400/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-400/80" />
                <span className="w-3 h-3 rounded-full bg-green-400/80" />
                <span className="ml-3 text-xs font-mono" style={{ color: '#8b949e' }}>bash — git log</span>
              </div>
              <div className="p-5 font-mono text-xs leading-relaxed space-y-3" style={{ color: '#e6edf3' }}>
                <div style={{ color: '#8b949e' }}>$ git log</div>

                <div className="space-y-0.5">
                  <div>
                    <span style={{ color: '#ffa657' }}>commit a3f91b2e4d8c1f0b</span>
                  </div>
                  <div>
                    <span style={{ color: '#79c0ff' }}>(HEAD → </span>
                    <span style={{ color: '#56d364' }}>main</span>
                    <span style={{ color: '#79c0ff' }}>, origin/seeking-first-job)</span>
                  </div>
                  <div><span style={{ color: '#8b949e' }}>Author: </span>Klein F. Lavina &lt;klein@dev.ph&gt;</div>
                  <div><span style={{ color: '#8b949e' }}>Date:   </span>Mon Mar 16 10:00:00 2026 +0800</div>
                  <div className="mt-1 pl-4" style={{ color: '#e6edf3' }}>feat: ship 8+ projects &amp; open to work</div>
                </div>

                <div className="border-t border-white/5 pt-3 space-y-0.5">
                  <div><span style={{ color: '#ffa657' }}>commit b7c24d1a3e9f2c8d</span></div>
                  <div><span style={{ color: '#8b949e' }}>Author: </span>Klein F. Lavina &lt;klein@dev.ph&gt;</div>
                  <div><span style={{ color: '#8b949e' }}>Date:   </span>Fri Jan 10 09:15:00 2025 +0800</div>
                  <div className="mt-1 pl-4" style={{ color: '#e6edf3' }}>cert: pass PhilNITS examination</div>
                </div>

                <div className="border-t border-white/5 pt-3 space-y-0.5">
                  <div><span style={{ color: '#ffa657' }}>commit e1d08a9c7b5f3e2a</span></div>
                  <div><span style={{ color: '#8b949e' }}>Author: </span>Klein F. Lavina &lt;klein@dev.ph&gt;</div>
                  <div><span style={{ color: '#8b949e' }}>Date:   </span>Thu Jun 01 08:00:00 2023 +0800</div>
                  <div className="mt-1 pl-4" style={{ color: '#e6edf3' }}>init: add Django, PHP, React skills</div>
                </div>
              </div>
            </motion.div>

          </div>
        </Section>

        {/* ─── SKILLS ──────────────────────────────────────────────────── */}
        <Section id="skills">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <SectionLabel num="02" label="Technical Arsenal" />
            <h2 className="text-4xl sm:text-5xl font-black text-foreground leading-tight">
              Tools I build<br />
              <span className="text-gradient">great things with.</span>
            </h2>
          </motion.div>

          <div className="space-y-10 mt-8">
            {Object.entries(SKILLS).map(([category, skills], catIndex) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, delay: catIndex * 0.07 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-muted-foreground">{category}</h3>
                  <div className="flex-1 h-px bg-border/30" />
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {skills.map((skill, index) => (
                    <motion.div
                      key={skill.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.04 }}
                      className="group"
                    >
                      <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg glass-card border-white/5 hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300 cursor-default">
                        <skill.icon size={13} strokeWidth={1.5} className={skill.color} />
                        <span className="text-xs font-semibold text-foreground/80 group-hover:text-foreground transition-colors whitespace-nowrap">{skill.name}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Professional Skills */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-14"
          >
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-muted-foreground">Soft Skills</h3>
              <div className="flex-1 h-px bg-border/30" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {PROFESSIONAL_SKILLS.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.07 }}
                  className="group flex items-center gap-4 p-4 rounded-xl glass-card border-white/5 hover:border-primary/25 hover:-translate-y-0.5 transition-all duration-300 cursor-default"
                >
                  <div className={`p-2.5 rounded-lg bg-background/60 border border-border/40 flex-shrink-0 ${skill.color} group-hover:scale-110 transition-transform`}>
                    <skill.icon size={18} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{skill.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{skill.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Section>

        {/* ─── GITHUB ──────────────────────────────────────────────────── */}
        <Section id="github" className="!py-16">
          <GithubContributions />
        </Section>

        {/* ─── PROJECTS ────────────────────────────────────────────────── */}
        <Section id="projects">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <SectionLabel num="03" label="Featured Projects" />
            <h2 className="text-4xl sm:text-5xl font-black text-foreground leading-tight">
              Work that<br />
              <span className="text-gradient">speaks for itself.</span>
            </h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-3xl">
              Each project represents a journey of discovery—built not just for display, but as hands-on explorations 
              into real-world web technologies. Through these builds, I've gained deep understanding of how systems 
              communicate, how applications scale, and how the internet truly works beneath the surface.
            </p>
          </motion.div>

          {projectsLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
          ) : !projects || projects.length === 0 ? (
            <div className="text-center py-20 glass-card rounded-2xl">
              <FolderGit2 className="h-14 w-14 text-muted-foreground mx-auto mb-4 opacity-40" />
              <h3 className="text-xl font-bold text-muted-foreground">No projects listed yet.</h3>
            </div>
          ) : (
            <div className="space-y-6">
              {projects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.1 }}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = (e.clientX - rect.left) / rect.width - 0.5;
                    const y = (e.clientY - rect.top) / rect.height - 0.5;
                    e.currentTarget.style.transform = `perspective(900px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg) translateY(-4px)`;
                    e.currentTarget.style.transition = "transform 0.1s ease-out";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)";
                    e.currentTarget.style.transition = "transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)";
                  }}
                  className="group"
                >
                  <div className="relative rounded-2xl border border-border/30 bg-card/30 backdrop-blur-xl overflow-hidden hover:border-primary/30 transition-colors duration-500 shadow-xl">
                    {/* Project number */}
                    <div className="absolute top-4 right-4 text-6xl font-black text-foreground/5 leading-none select-none pointer-events-none z-0">
                      {String(i + 1).padStart(2, "0")}
                    </div>

                    <div className={`flex flex-col ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                      {/* Image */}
                      <div className="relative md:w-2/5 h-52 md:h-auto overflow-hidden flex-shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/60 z-10" />
                        <img
                          src={project.thumbnail || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80"}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-6 md:p-8 flex flex-col justify-between relative z-10">
                        <div>
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <h3 className="text-xl md:text-2xl font-black text-foreground leading-tight">{project.title}</h3>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {project.techStack.map(tech => (
                              <span key={tech} className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">
                                {tech}
                              </span>
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                            {project.description}
                          </p>
                        </div>
                        <div className="flex gap-3 mt-6 border-t border-border/20 pt-5">
                          {project.liveUrl && (
                            <a href={project.liveUrl} target="_blank" rel="noreferrer"
                              className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                            >
                              <Globe size={14} /> Live Demo
                            </a>
                          )}
                          {project.githubUrl && (
                            <a href={project.githubUrl} target="_blank" rel="noreferrer"
                              className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Github size={14} /> Source Code
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Section>

        {/* ─── TIMELINE ────────────────────────────────────────────────── */}
        <Section id="timeline">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <SectionLabel num="04" label="Developer Journey" />
            <h2 className="text-4xl sm:text-5xl font-black text-foreground leading-tight">
              The road<br />
              <span className="text-gradient">that got me here.</span>
            </h2>
          </motion.div>
          <DeveloperTimeline />
        </Section>
      </div>

      {/* ─── SCROLL TEXT FILL ────────────────────────────────────────── */}
      <ScrollTextFill />

      {/* ─── CONTACT ─────────────────────────────────────────────────── */}
      <Section id="contact" className="!min-h-fit !py-0 relative overflow-hidden !shadow-none" style={{ boxShadow: 'none' }}>
        {/* Wave separator */}
        <div className="relative h-32 bg-background">
          <div className="absolute inset-0 overflow-hidden opacity-[0.06] z-0">
            <div className="text-8xl font-black text-foreground whitespace-nowrap animate-marquee flex items-end h-full pb-8">
              Collaborate with me · Collaborate with me · Collaborate with me · Collaborate with me ·
            </div>
          </div>
          <svg className="absolute bottom-0 left-0 w-full h-32 z-10" viewBox="0 0 1440 128" preserveAspectRatio="none" style={{ display: 'block' }}>
            <path d="M0,96 C360,32 720,32 1440,96 L1440,128 L0,128 Z" className="fill-primary" style={{ shapeRendering: 'geometricPrecision' }} />
          </svg>
        </div>

        {/* Contact body */}
        <div className="relative bg-primary overflow-hidden -mt-1">
          <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-12 pt-20 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

              {/* Left: Copy */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-white/60 tracking-[0.2em] uppercase">05 — Contact</span>
                </div>
                <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">
                  Got a project<br />in mind?
                </h2>
                <p className="text-lg text-white/80 leading-relaxed max-w-md">
                  Whether it's a full product, a quick question, or just wanting to connect —
                  my inbox is always open.
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                    <Mail size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-white/50 font-mono uppercase tracking-wider">Email</p>
                    <p className="text-sm font-semibold text-white">kleinlavina@gmail.com</p>
                  </div>
                </div>

                {/* Social icons */}
                <div className="flex gap-3 pt-4 flex-wrap">
                  {[
                    { href: "https://github.com/KleinLavina", icon: Github, label: "GitHub" },
                    {
                      href: "https://www.facebook.com/klein.lavina.12",
                      icon: () => (
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      ),
                      label: "Facebook"
                    },
                  ].map(({ href, icon: Icon, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-white text-sm font-semibold transition-all hover:-translate-y-0.5"
                    >
                      <Icon />
                      {label}
                    </a>
                  ))}
                </div>
              </motion.div>

              {/* Right: Form */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                <div className="flex flex-col items-center space-y-6">
                  <div className="text-center space-y-3">
                    <h3 className="text-xl font-bold text-white">Scan to Connect</h3>
                    <p className="text-sm text-white/70">Get my contact info instantly</p>
                  </div>
                  
                  {/* QR Code */}
                  <div className="p-6 bg-white rounded-2xl shadow-2xl">
                    <div className="w-48 h-48 bg-white flex items-center justify-center">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=192x192&data=${encodeURIComponent(`BEGIN:VCARD
VERSION:3.0
FN:Klein F. Lavina
TEL:+639380734878
EMAIL:kleinlav7@gmail.com
URL:https://github.com/KleinLavina
URL:https://www.facebook.com/klein.lavina.12
END:VCARD`)}`}
                        alt="Contact QR Code"
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <p className="text-xs text-white/50 font-mono uppercase tracking-wider">Includes</p>
                    <div className="flex flex-wrap justify-center gap-3 text-xs text-white/70">
                      <div className="flex items-center gap-1">
                        <Mail size={12} />
                        <span>Email</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                        <span>Phone</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Github size={12} />
                        <span>GitHub</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        <span>Facebook</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Footer */}
            <div className="mt-20 pt-8 border-t border-white/15 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-white/50 font-mono">
                © 2025 Klein F. Lavina · Built with React & TypeScript
              </p>
              <p className="text-sm text-white/40 font-mono flex items-center gap-1">
                <Sparkles size={12} /> Designed & developed by Klein
              </p>
            </div>
          </div>
        </div>
      </Section>
    </Shell>
  );
}
