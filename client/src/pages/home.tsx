import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faEye
} from "@fortawesome/free-solid-svg-icons";
// Using reliable FontAwesome icons primarily
import {
  SiHtml5,
  SiJavascript,
  SiTypescript,
  SiReact,
  SiNodedotjs,
  SiMongodb,
  SiExpress,
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
  SiFigma,
  SiVite,
  SiNetlify,
  SiThreedotjs,
  SiOpenai
} from "react-icons/si";
import { 
  FaCode, 
  FaJava, 
  FaServer, 
  FaEnvelope,
  FaCss3Alt,
  FaDatabase,
  FaTools,
  FaGitAlt,
  FaGithub,
  FaFigma,
  FaCloud,
  FaPalette,
  FaApple,
  FaAndroid
} from "react-icons/fa";
import { Shell } from "@/components/layout/shell";
import { BubbleBackground } from "@/components/ui/bubble-background";
import { Section } from "@/components/ui/section";
import { ScrollTextFill } from "@/components/ui/scroll-text-fill";
import { GithubContributions } from "@/components/github-contributions";
import { FloatingChat } from "@/components/floating-chat";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Loader2, Github, Code, Database, MonitorSmartphone,
  Layers, Server, TerminalSquare, Mail, FolderGit2,
  Lightbulb, Users, Wrench, Zap, BookOpen, MessageCircle, ArrowDown,
  ChevronRight, Sparkles, Globe, ArrowUpRight, UserRound, CheckCircle2, X
} from "lucide-react";
import { useState, useEffect } from "react";
import { useMagnetic } from "@/hooks/use-magnetic";

const TECH_STACK_GROUPS = [
  {
    title: "Frontend & UI",
    skills: [
      { name: "HTML", icon: SiHtml5, color: "text-orange-500" },
      { name: "CSS", icon: FaCss3Alt, color: "text-blue-500" },
      { name: "JavaScript", icon: SiJavascript, color: "text-yellow-400" },
      { name: "TypeScript", icon: SiTypescript, color: "text-blue-600" },
      { name: "React", icon: SiReact, color: "text-cyan-500" },
      { name: "Next.js", icon: SiNextdotjs, color: "text-foreground" },
      { name: "Tailwind", icon: SiTailwindcss, color: "text-cyan-400" },
      { name: "Bootstrap", icon: SiBootstrap, color: "text-purple-500" },
      { name: "Figma", icon: SiFigma, color: "text-pink-500" },
      { name: "Canva", icon: FaPalette, color: "text-cyan-500" },
    ],
  },
  {
    title: "Backend & Database",
    skills: [
      { name: "Django", icon: SiDjango, color: "text-green-600" },
      { name: "PHP", icon: SiPhp, color: "text-indigo-400" },
      { name: "Python", icon: SiPython, color: "text-blue-400" },
      { name: "MySQL", icon: SiMysql, color: "text-blue-500" },
      { name: "PostgreSQL", icon: SiPostgresql, color: "text-blue-400" },
      { name: "Cloudinary", icon: FaCloud, color: "text-blue-600" },
      { name: "Render", icon: FaServer, color: "text-purple-600" },
    ],
  },
  {
    title: "Architecture & Tools",
    skills: [
      { name: "Git", icon: SiGit, color: "text-orange-600" },
      { name: "GitHub", icon: SiGithub, color: "text-foreground" },
      { name: "VS Code", icon: FaCode, color: "text-blue-500" },
      { name: "Postman", icon: FaTools, color: "text-orange-500" },
      { name: "Replit", icon: FaCode, color: "text-orange-500" },
      { name: "Java", icon: FaJava, color: "text-red-500" },
      { name: "R", icon: FaCode, color: "text-blue-600" },
    ],
  },
] as const;

const PROFESSIONAL_SKILLS = [
  { name: "Problem Solving", icon: Lightbulb, color: "text-yellow-400", description: "Analytical approach to complex challenges" },
  { name: "Team Collaboration", icon: Users, color: "text-blue-500", description: "Effective communication and teamwork" },
  { name: "Technical Troubleshooting", icon: Wrench, color: "text-orange-500", description: "Quick diagnosis and resolution" },
  { name: "Adaptability", icon: Zap, color: "text-purple-500", description: "Fast learner with new technologies" },
  { name: "Continuous Learning", icon: BookOpen, color: "text-green-500", description: "Always expanding knowledge" },
  { name: "Communication", icon: MessageCircle, color: "text-cyan-500", description: "Clear technical and non-technical communication" },
];

const CORE_CAPABILITIES = [
  {
    service: "Full-Stack Development",
    description:
      "Scalable MERN stack applications with robust architectures, built for enterprise-grade performance and security.",
    stack: ["React", "Node.js", "MongoDB", "Express"],
    icon: Server,
    featured: false,
  },
  {
    service: "App Development",
    description:
      "Native-feeling cross-platform mobile experiences that seamlessly connect your users to your digital ecosystem.",
    stack: ["React Native", "iOS", "Android"],
    icon: MonitorSmartphone,
    featured: false,
  },
  {
    service: "3D Web Experiences",
    description:
      "Next-generation immersive web environments utilizing WebGL to craft memorable and interactive storytelling.",
    stack: ["Three.js", "WebGL", "GSAP", "React Three Fiber"],
    icon: Layers,
    featured: false,
  },
  {
    service: "AI & API Integration",
    description:
      "Intelligent system integrations bridging cutting-edge LLMs and custom APIs to automate and elevate workflows.",
    stack: ["OpenAI", "RESTful APIs", "Gemini API"],
    icon: Sparkles,
    featured: false,
  },
] as const;

const CAPABILITY_STACK_META: Record<
  string,
  {
    icon: any;
    color: string;
  }
> = {
  React: { icon: SiReact, color: "text-cyan-500" },
  "Node.js": { icon: SiNodedotjs, color: "text-green-500" },
  MongoDB: { icon: SiMongodb, color: "text-green-600" },
  Express: { icon: SiExpress, color: "text-foreground" },
  "React Native": { icon: SiReact, color: "text-cyan-500" },
  iOS: { icon: FaApple, color: "text-foreground" },
  Android: { icon: FaAndroid, color: "text-green-500" },
  "Three.js": { icon: SiThreedotjs, color: "text-foreground" },
  WebGL: { icon: Globe, color: "text-blue-500" },
  GSAP: { icon: Zap, color: "text-lime-400" },
  "React Three Fiber": { icon: SiReact, color: "text-cyan-500" },
  OpenAI: { icon: SiOpenai, color: "text-foreground" },
  "RESTful APIs": { icon: Server, color: "text-secondary" },
  "Gemini API": { icon: Sparkles, color: "text-primary" },
};

const PROJECTS = [
  {
    id: 1,
    title: "RDFS — Real-time Dispatch and Finance System",
    description: "A real-time dispatch and finance system featuring QR code–based driver queuing, live vehicle tracking, and automated fare validation for the Maasin City Terminal, developed as our capstone project.",
    techStack: ["JavaScript", "Django", "HTML", "CSS", "PostgreSQL", "Bootstrap", "Cloudinary", "OnRender"],
    liveUrl: "https://rdfsmaasin.onrender.com",
    thumbnail: "/rdfs.png",
  },
  {
    id: 2,
    title: "WISE-PENRO — Work Indicator Submission Engine",
    description: "A document tracking system built around the actual workflow of PENRO offices — handling document submission, routing between departments, status monitoring, and deadline tracking. Designed to match how PENRO staff submit and process documents day-to-day, with role-based access for different office levels.",
    techStack: ["Django", "PostgreSQL", "HTML", "CSS", "JavaScript", "Cloudinary", "OnRender", "Brevo SMTP"],
    liveUrl: "https://r8penrowise.onrender.com",
    thumbnail: "/wise-penro.png",
  },
  {
    id: 3,
    title: "J-Gear Assistant Chatbot",
    description: "A keyword-based FAQ chatbot developed for BSBA TatakJosephinian merchandise that assists users with product, pricing, and ordering inquiries through intelligent keyword matching.",
    techStack: ["TypeScript", "React", "CSS", "HTML", "Vite", "Netlify"],
    liveUrl: "https://jgeartatakjosephinian.netlify.app/",
    githubUrl: "https://github.com/KleinLavina/J-Gear-Chatbot",
    thumbnail: "/j-gear.png",
  },
  {
    id: 4,
    title: "Tag-os Elementary School Website",
    description: "A modern elementary school website featuring an admin CMS for managing announcements, events, staff directory, and school information with responsive design and interactive components.",
    techStack: ["React", "JavaScript", "CSS", "Vite", "HTML", "Netlify"],
    liveUrl: "https://tagoselementary.netlify.app/",
    githubUrl: "https://github.com/KleinLavina/TES",
    thumbnail: "/tes.png",
  },
  {
    id: 5,
    title: "Cracken Gear Fits",
    description: "A fashion e-commerce application developed as a 3rd year school project, featuring role-based access control, shopping cart functionality, CAPTCHA-secured login, and admin product management with full CRUD capabilities using PHP and MySQL. This is one variant of my original project design.",
    techStack: ["PHP", "JavaScript", "HTML", "CSS", "MySQL", "InfinityFree"],
    liveUrl: "https://cgearfits.rf.gd/",
    githubUrl: "https://github.com/KleinLavina/CrackenGearFits",
    thumbnail: "/gearfits.png",
  },
  {
    id: 6,
    title: "Cracken Furniture",
    description: "A full-stack furniture e-commerce platform developed as a 3rd year school project, with role-based user access, shopping cart functionality, and comprehensive admin controls for managing product inventory through CRUD operations. This is another variant of my original project design, created for a classmate while maintaining my ownership.",
    techStack: ["PHP", "JavaScript", "HTML", "CSS", "MySQL", "InfinityFree"],
    liveUrl: "https://cfurniture.rf.gd/",
    githubUrl: "https://github.com/KleinLavina/CrackenFurnture",
    thumbnail: "/furniture.png",
  },
];

const TECH_PILLS = ["React", "TypeScript", "Node.js", "Django", "PostgreSQL", "Python", "Next.js", "Tailwind"];
const HERO_STATS = [
  { value: "8+", label: "Projects Built" },
  { value: "15+", label: "Tech Stacks" },
  { value: "PhilNITS", label: "Certified Passer" },
] as const;
const CERTIFICATION_IMAGES = [
  {
    src: "/1cf3141b-27d8-4d68-bfb2-6c7c97d5abeb.jpg",
    alt: "PhilNITS IP certification document photo one",
  },
  {
    src: "/b9e026f7-5891-4593-bcec-292ff9f26977.jpg",
    alt: "PhilNITS IP certification document photo two",
  },
  {
    src: "/d5488008-119d-4f80-9b98-6edacb779347.jpg",
    alt: "PhilNITS IP certification document photo three",
  },
] as const;
const PERSONAL_PROJECT_PILLS = [
  "8+ projects shipped",
  "self-taught & always leveling up",
  "built for fun, deployed for real",
] as const;
// Tech stack icon mapping for projects - using reliable icons
const getTechIcon = (tech: string) => {
  const iconMap: { [key: string]: any } = {
    "JavaScript": SiJavascript,
    "TypeScript": SiTypescript,
    "React": SiReact,
    "HTML": SiHtml5,
    "CSS": FaCss3Alt,
    "Python": SiPython,
    "PHP": SiPhp,
    "Bootstrap": SiBootstrap,
    "Git": SiGit,
    "GitHub": SiGithub,
    "Node.js": SiNextdotjs, // Using Next.js icon as Node.js alternative
    "Django": SiDjango,
    "PostgreSQL": SiPostgresql,
    "MySQL": SiMysql,
    "Vite": SiVite,
    "Next.js": SiNextdotjs,
    "Tailwind": SiTailwindcss,
    "Cloudinary": FaCloud,
    "Netlify": SiNetlify,
    "OnRender": FaServer,
    "Render": FaServer,
    "Brevo SMTP": FaEnvelope, // Using envelope icon for SMTP
    "InfinityFree": FaServer, // Using server icon for hosting
  };
  return iconMap[tech] || FaCode; // Default fallback to generic code icon
};

function SectionLabel({ num, label }: { num: string; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-xs font-mono font-bold text-primary tracking-[0.2em] uppercase">{num}</span>
      <span className="h-px w-8 bg-primary/50" />
      <span className="text-xs font-mono text-muted-foreground tracking-widest uppercase">{label}</span>
    </div>
  );
}

function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "visitor-server";

  const storageKey = "portfolio_visitor_id";
  const existing = window.localStorage.getItem(storageKey);
  if (existing) return existing;

  const generated = `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(storageKey, generated);
  return generated;
}

export default function Home() {
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [visitorLoading, setVisitorLoading] = useState(true);
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set());
  const [activeCertificateImage, setActiveCertificateImage] =
    useState<(typeof CERTIFICATION_IMAGES)[number] | null>(null);
  const mag1 = useMagnetic(0.3);
  const mag2 = useMagnetic(0.3);

  // Function to toggle project description expansion
  const toggleProjectExpansion = (projectId: number) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  // Function to check if description should be truncated (more than 120 characters)
  const shouldTruncateDescription = (description: string) => {
    return description.length > 120;
  };

  // Function to get truncated description
  const getTruncatedDescription = (description: string) => {
    if (description.length <= 120) return description;
    // Find the last space before the 120 character limit to avoid cutting words
    const truncateAt = description.lastIndexOf(' ', 120);
    const cutPoint = truncateAt > 80 ? truncateAt : 120;
    return description.substring(0, cutPoint) + "...";
  };

  useEffect(() => {
    const trackVisitor = async () => {
      try {
        const visitorId = getOrCreateVisitorId();
        const response = await fetch("/api/visitors/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visitorId }),
        });

        if (!response.ok) return;

        const data = (await response.json()) as { count?: number };
        if (typeof data.count === "number") {
          setVisitorCount(data.count);
        }
      } catch {
        // Keep graceful fallback UI when visitor tracking fails.
      } finally {
        setVisitorLoading(false);
      }
    };

    void trackVisitor();
  }, []);

  useEffect(() => {
    if (!activeCertificateImage) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveCertificateImage(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeCertificateImage]);



  return (
    <Shell>
      <div
        className="fixed inset-0 z-0 transition-opacity duration-500 ease-out"
        style={{ opacity: "var(--ambient-bg-opacity, 1)" }}
      >
        <BubbleBackground interactive className="w-full h-full" />
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-4 sm:px-8 sm:pb-8 lg:px-12 lg:pb-12 relative z-10">

        {/* ─── HERO ─────────────────────────────────────────────────────── */}
        <Section id="home" className="justify-center min-h-[calc(100vh-6rem)] md:min-h-[calc(100vh-7rem)] py-0 pt-0">
          <div className="w-full flex flex-col justify-center">
            <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-12">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                className="w-full lg:pr-6"
              >
                <div className="mb-5 flex items-center gap-3">
                  <span className="h-px w-10 bg-primary/60" />
                  <p className="text-[11px] font-mono uppercase tracking-[0.38em] text-primary">
                    Available for projects
                  </p>
                </div>

                <h1 className="text-[clamp(3rem,7vw,5.8rem)] font-black leading-[0.88] tracking-[-0.04em] text-foreground">
                  <span className="block">Klein Flores</span>
                  <span className="block text-gradient">Lavina</span>
                </h1>

                <p className="mt-4 text-xs font-mono uppercase tracking-[0.32em] text-secondary">
                  Creative Full-Stack Web Developer
                </p>

                <p className="mt-8 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
                  Crafting immersive digital experiences and scalable architectures for the modern web,
                  spanning SaaS development, web and app builds, full-stack solutions, and emerging tech
                  integrations for teams that need products to perform and scale.
                </p>

                <div className="mt-10 flex flex-wrap gap-4">
                  <div
                    ref={mag1.ref as React.RefObject<HTMLDivElement>}
                    onMouseMove={mag1.onMouseMove}
                    onMouseLeave={mag1.onMouseLeave}
                    className="inline-block"
                  >
                    <Button
                      size="lg"
                      className="group h-12 rounded-xl border border-primary/35 bg-primary/10 px-7 text-[11px] font-mono uppercase tracking-[0.26em] text-foreground shadow-[0_18px_40px_-24px_hsl(var(--primary)/0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/55 hover:bg-primary/16"
                    >
                      <a href="#projects" className="flex items-center gap-3">
                        <span>View My Work</span>
                        <ChevronRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
                      </a>
                    </Button>
                  </div>
                  <div
                    ref={mag2.ref as React.RefObject<HTMLDivElement>}
                    onMouseMove={mag2.onMouseMove}
                    onMouseLeave={mag2.onMouseLeave}
                    className="inline-block"
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-12 rounded-xl border border-border/70 bg-transparent px-7 text-[11px] font-mono uppercase tracking-[0.26em] text-muted-foreground transition-all duration-300 hover:-translate-y-1 hover:border-secondary/45 hover:bg-card/35 hover:text-foreground"
                    >
                      <a href="#contact" className="flex items-center gap-3">
                        <Mail size={15} />
                        <span>Get In Touch</span>
                      </a>
                    </Button>
                  </div>
                </div>

              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                className="relative flex min-h-[420px] flex-col items-center justify-center lg:min-h-[560px]"
              >
                <div className="hero-portrait-stage">
                  <div className="hero-portrait-shell">
                    <div className="hero-portrait-frame">
                      <div className="hero-portrait-core flex flex-col items-center justify-center gap-4 text-center">
                        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-accent/20 bg-background/45 shadow-[0_0_0_1px_hsl(var(--accent)/0.08)]">
                          <UserRound className="h-10 w-10 text-accent/45" strokeWidth={1.6} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-muted-foreground/70">
                            Unset profile
                          </p>
                          <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-accent/55">
                            Add portrait here
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="hero-floating-badge hero-floating-badge-bottom">
                    <span className="hero-floating-badge-label">Open to work</span>
                    <span className="hero-floating-badge-value">Onsite / Remote</span>
                  </div>
                </div>

                <div className="mt-8 flex w-full max-w-[34rem] flex-wrap justify-center gap-8 border-t border-border/40 pt-7 lg:mt-6">
                  {HERO_STATS.map((stat) => (
                    <div key={stat.label} className="min-w-[88px] text-center">
                      <div className="text-3xl font-black leading-none text-foreground">{stat.value}</div>
                      <div className="mt-2 text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
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
        <Section id="skills">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <SectionLabel num="01" label="Technical Arsenal" />
            <h2 className="text-4xl sm:text-5xl font-black text-foreground leading-tight">
              Tools I build<br />
              <span className="text-gradient">great things with.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-8">
            {TECH_STACK_GROUPS.map((group, catIndex) => (
              <motion.div
                key={group.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, delay: catIndex * 0.07 }}
                className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-xl p-5 shadow-xl"
              >
                <div className="flex items-center gap-3 mb-5">
                  <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-muted-foreground">{group.title}</h3>
                  <div className="flex-1 h-px bg-border/30" />
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {group.skills.map((skill, index) => (
                    <motion.div
                      key={skill.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.04 }}
                      className="group"
                    >
                      <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg glass-card border-white/5 hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300 cursor-default">
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

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.08 }}
            transition={{ duration: 0.55, delay: 0.28 }}
            className="mt-16"
          >
            <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6 xl:gap-12 items-start mb-8">
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-[0.35em] text-muted-foreground/70 mb-3">
                  Services
                </p>
                <h3 className="text-[clamp(2.6rem,7vw,5.3rem)] font-black uppercase leading-[0.84] tracking-[-0.05em] text-foreground">
                  Core
                  <br />
                  <span className="text-gradient">Capabilities</span>
                </h3>
              </div>

              <div className="xl:pt-8">
                <p className="text-base sm:text-xl font-semibold leading-[1.5] text-muted-foreground text-left xl:text-right max-w-2xl xl:ml-auto">
                  Transforming ideas into polished digital realities through modern engineering and uncompromising design.
                </p>
              </div>
            </div>

            <div className="hidden lg:grid lg:grid-cols-[240px_minmax(0,1.35fr)_minmax(0,0.85fr)] gap-6 px-5 pb-4 border-b border-border/40">
              <div className="text-[10px] font-mono font-bold uppercase tracking-[0.35em] text-muted-foreground/65">
                Service
              </div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-[0.35em] text-muted-foreground/65">
                Description
              </div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-[0.35em] text-muted-foreground/65 text-right">
                Stack
              </div>
            </div>

            <div className="mt-2 border-t border-border/20">
              {CORE_CAPABILITIES.map((capability, index) => (
                <motion.div
                  key={capability.service}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.12 }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                  className={[
                    "group relative grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1.35fr)_minmax(0,0.85fr)] gap-5 lg:gap-6 px-4 sm:px-5 py-6 sm:py-7 border-b border-transparent transition-all duration-300",
                    capability.featured
                      ? "bg-muted/28 hover:bg-muted/42"
                      : "hover:bg-card/30",
                  ].join(" ")}
                >
                  <span
                    aria-hidden="true"
                    className={[
                      "absolute left-0 right-0 bottom-0 h-px origin-left scale-x-100 transition-all duration-300",
                      capability.featured
                        ? "bg-primary/35 group-hover:bg-primary/75 group-hover:h-[2px]"
                        : "bg-border/35 group-hover:bg-primary/55 group-hover:h-[2px]",
                    ].join(" ")}
                  />

                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className={[
                      "w-12 h-12 rounded-none border flex items-center justify-center shrink-0 transition-colors duration-300",
                      capability.featured
                        ? "bg-primary text-primary-foreground border-primary shadow-[0_0_18px_hsl(var(--primary)/0.22)]"
                        : "bg-background/65 text-foreground border-border/45 group-hover:border-primary/35 group-hover:text-primary",
                    ].join(" ")}>
                      <capability.icon size={18} strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0">
                      <div className="lg:hidden text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-muted-foreground/60 mb-1.5">
                        Service
                      </div>
                      <h4 className={[
                        "text-[1.2rem] sm:text-[1.55rem] font-black uppercase leading-[0.92] tracking-[-0.03em]",
                        capability.featured ? "text-primary" : "text-foreground",
                      ].join(" ")}>
                        {capability.service.split(" ").map((word, wordIndex) => (
                          <span key={`${capability.service}-${wordIndex}`} className="block">
                            {word}
                          </span>
                        ))}
                      </h4>
                    </div>
                  </div>

                  <div className="lg:pt-0.5">
                    <div className="lg:hidden text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-muted-foreground/60 mb-1.5">
                      Description
                    </div>
                    <p className={[
                      "text-sm sm:text-[0.98rem] leading-[1.65] max-w-3xl",
                      capability.featured ? "text-foreground" : "text-muted-foreground",
                    ].join(" ")}>
                      {capability.description}
                    </p>
                  </div>

                  <div className="lg:pt-0.5">
                    <div className="lg:hidden text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-muted-foreground/60 mb-2.5">
                      Stack
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        {capability.stack.map((item) => {
                          const meta = CAPABILITY_STACK_META[item];
                          const IconComponent = meta?.icon;

                          return (
                            <span
                              key={item}
                              className={[
                                "inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.12em] border transition-colors duration-300",
                                capability.featured
                                  ? "border-primary/55 text-foreground bg-background/75"
                                  : "border-border/50 text-muted-foreground bg-background/40 group-hover:border-primary/30 group-hover:text-foreground",
                              ].join(" ")}
                            >
                              {IconComponent ? (
                                <IconComponent className={`${meta.color} shrink-0`} size={12} />
                              ) : null}
                              {item}
                            </span>
                          );
                        })}
                      </div>

                      <div className="hidden lg:flex w-8 justify-end pt-0.5">
                        <ArrowUpRight
                          size={20}
                          className={[
                            "transition-all duration-300",
                            capability.featured
                              ? "text-primary/75 group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                              : "text-muted-foreground/45 group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5",
                          ].join(" ")}
                        />
                      </div>
                    </div>
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

        <Section id="credentials" className="!min-h-0 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <SectionLabel num="02" label="Education / Experience" />
            <h2 className="text-4xl sm:text-5xl font-black text-foreground leading-tight">
              Foundation, experience, and the
              <br />
              <span className="text-gradient">proof behind it.</span>
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              Formal training, hands-on industry exposure, and a certification trail that
              backs up the way I build for the modern web.
            </p>
          </motion.div>

          <div className="relative">
            <div className="pointer-events-none absolute bottom-0 left-1/2 top-0 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-border/80 to-transparent lg:block" />

            <div className="grid gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.6 }}
                className="space-y-8 lg:pr-8"
              >
                <div className="space-y-6">
                  <div className="text-sm font-mono font-bold uppercase tracking-[0.28em] text-primary">
                    // education
                  </div>

                  <div className="glass-card relative overflow-hidden rounded-[2rem] border border-border/60 p-6 sm:p-7">
                    <div className="absolute left-6 top-7 h-[calc(100%-3.4rem)] w-px bg-gradient-to-b from-primary/60 via-border/70 to-transparent" />
                    <div className="relative pl-8">
                      <span className="absolute left-[-0.45rem] top-1.5 h-3.5 w-3.5 rounded-full border border-primary/60 bg-background shadow-[0_0_0_4px_hsl(var(--background))]" />
                      <div className="flex flex-wrap items-center gap-3">
                        <img
                          src="https://www.sjc.edu.ph/wp-content/uploads/2024/09/SJC-LOGO-NEWER.png"
                          alt="Saint Joseph College logo"
                          className="h-20 w-20 object-contain"
                          loading="lazy"
                        />
                        <h3 className="text-[1.9rem] font-black text-foreground sm:text-[2rem]">Saint Joseph College</h3>
                        <span className="inline-flex items-center rounded-full border border-accent/35 bg-accent/10 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-accent">
                          Expected 2026
                        </span>
                      </div>
                      <p className="mt-3 text-base font-semibold text-foreground/90 sm:text-[1.18rem]">
                        Bachelor of Science in Information Technology
                      </p>
                      <p className="mt-2 text-sm font-mono uppercase tracking-[0.2em] text-muted-foreground">
                        2022 - 2026
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="text-sm font-mono font-bold uppercase tracking-[0.28em] text-primary">
                    // certifications
                  </div>

                  <div className="glass-card space-y-6 rounded-[2rem] border border-border/60 p-6 sm:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-3">
                        <a
                          href="https://philnits.org/passers-ip/"
                          target="_blank"
                          rel="noreferrer"
                          className="group inline-flex flex-col gap-1.5"
                        >
                          <h3 className="text-[1.9rem] font-black text-foreground transition-colors duration-200 group-hover:text-primary sm:text-[2rem]">
                            IT Passport (IP) Certification
                          </h3>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p className="font-semibold text-foreground/90 transition-colors duration-200 group-hover:text-foreground">
                              PhilNITS Foundation, Inc.
                            </p>
                            <p>Phil. National IT Standards Foundation</p>
                          </div>
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.22em] text-primary/75">
                            <ArrowUpRight size={12} />
                            official passers list
                          </span>
                        </a>
                      </div>

                      <span className="inline-flex items-center gap-2 rounded-full border border-accent/35 bg-accent/10 px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-accent">
                        <CheckCircle2 size={14} />
                        Certified Passer
                      </span>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
                        Certificate Gallery
                      </p>
                      <div className="grid gap-3 sm:grid-cols-3">
                        {CERTIFICATION_IMAGES.map((image, index) => (
                          <motion.button
                            key={image.src}
                            type="button"
                            onClick={() => setActiveCertificateImage(image)}
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.35 }}
                            transition={{ duration: 0.45, delay: index * 0.06 }}
                            className="group relative overflow-hidden rounded-2xl border border-accent/35 bg-card/60 text-left shadow-[0_18px_42px_-26px_hsl(var(--accent)/0.6)] transition-all duration-300 hover:border-accent/55 hover:shadow-[0_22px_48px_-24px_hsl(var(--accent)/0.65)]"
                          >
                            <img
                              src={image.src}
                              alt={image.alt}
                              className="h-28 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="h-px bg-gradient-to-r from-transparent via-border/80 to-transparent lg:hidden" />

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.6, delay: 0.05 }}
                className="space-y-8 lg:pl-8"
              >
                <div className="space-y-6">
                  <div className="text-sm font-mono font-bold uppercase tracking-[0.28em] text-primary">
                    // experience
                  </div>

                  <div className="overflow-hidden rounded-[2rem] border border-border/60 bg-card/55 shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-2 border-b border-border/60 bg-background/55 px-5 py-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-primary/85" />
                      <span className="h-2.5 w-2.5 rounded-full bg-secondary/85" />
                      <span className="h-2.5 w-2.5 rounded-full bg-accent/85" />
                      <span className="ml-3 text-[10px] font-mono uppercase tracking-[0.28em] text-muted-foreground">
                        experience.log
                      </span>
                    </div>

                    <div className="space-y-6 p-6 sm:p-7">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-mono uppercase tracking-[0.18em] text-primary/85">
                            On-the-Job Trainee (OJT)
                          </p>
                          <h3 className="mt-2 text-[1.9rem] font-black leading-tight text-foreground sm:text-[2rem]">
                            Department of Environment and Natural Resources - PENRO
                          </h3>
                        </div>

                        <span className="inline-flex items-center rounded-full border border-border/70 bg-background/45 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                          Government Agency
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-sm font-mono uppercase tracking-[0.18em] text-muted-foreground">
                          Provincial Environment and Natural Resources Office
                        </p>
                        <span className="inline-flex items-center rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-primary shadow-[0_12px_28px_-20px_hsl(var(--primary)/0.9)]">
                          4 Months
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="text-[11px] font-mono uppercase tracking-[0.28em] text-primary/80">
                    // personal_projects
                  </div>

                  <div className="glass-card rounded-[2rem] border border-border/60 p-5 sm:p-6">
                    <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
                      Beyond deadlines and requirements, I build things out of pure
                      curiosity. Side projects, late-night experiments, tools I wish
                      existed - shipped for fun, deployed for real.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                      {PERSONAL_PROJECT_PILLS.map((pill, index) => (
                        <motion.span
                          key={pill}
                          initial={{ opacity: 0, y: 14 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.4 }}
                          transition={{ duration: 0.45, delay: index * 0.06 }}
                          whileHover={{ y: -2 }}
                          className="inline-flex items-center rounded-full border border-accent/35 bg-accent/10 px-4 py-2 text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-accent shadow-[0_16px_34px_-24px_hsl(var(--accent)/0.8)]"
                        >
                          {pill}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
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

          {(() => {
            const visibleProjects = showAllProjects ? PROJECTS : PROJECTS.slice(0, 3);
            const accentColors = [
              "from-primary via-secondary to-accent",
              "from-accent via-primary to-secondary",
              "from-secondary via-accent to-primary",
              "from-primary via-accent to-secondary",
              "from-accent via-secondary to-primary",
              "from-secondary via-primary to-accent",
            ];
            return (
              <>
                <div className="space-y-8">
                  {visibleProjects.map((project, i) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.55, ease: "easeOut", delay: i < 3 ? i * 0.05 : (i - 3) * 0.08 }}
                      className="group relative"
                    >
                      <div className="relative rounded-2xl border border-border/25 bg-card/50 backdrop-blur-xl overflow-hidden shadow-2xl">

                        {/* Left accent stripe */}
                        <div className={`absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b ${accentColors[i % accentColors.length]}`} />

                        {/* Oversized project number watermark */}
                        <div
                          className="absolute select-none pointer-events-none font-black leading-none text-[11rem] md:text-[14rem]"
                          style={{
                            right: i % 2 === 0 ? '-0.5rem' : 'auto',
                            left: i % 2 !== 0 ? '-0.5rem' : 'auto',
                            top: '-1rem',
                            color: 'transparent',
                            WebkitTextStroke: '1px hsl(var(--foreground) / 0.04)',
                          }}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </div>

                        <div className={`flex flex-col ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>

                          {/* Image panel */}
                          <div className="relative md:w-[42%] h-60 md:h-auto overflow-hidden flex-shrink-0">
                            <img
                              src={project.thumbnail}
                              alt={project.title}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            {/* Enhanced glassmorphism backdrop that fades out on hover */}
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] backdrop-saturate-150 backdrop-brightness-90 opacity-100 group-hover:opacity-0 transition-all duration-700 ease-in-out" />
                          </div>

                          {/* Content panel */}
                          <div className="flex-1 p-7 md:p-10 flex flex-col justify-between relative z-10">
                            <div>
                              <div className="flex items-center gap-2 mb-4">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
                                <span className="text-[10px] font-mono font-bold tracking-[0.25em] uppercase text-primary/80">
                                  Project {String(i + 1).padStart(2, "0")}
                                </span>
                              </div>

                              <h3 className="text-2xl md:text-3xl font-black text-foreground leading-tight mb-4 transition-colors duration-300">
                                {project.title}
                              </h3>

                              {/* Description with expand/collapse functionality */}
                              <div className="mb-5">
                                <AnimatePresence mode="wait">
                                  <motion.div
                                    key={expandedProjects.has(project.id) ? 'expanded' : 'collapsed'}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                      {expandedProjects.has(project.id) 
                                        ? project.description 
                                        : shouldTruncateDescription(project.description)
                                          ? getTruncatedDescription(project.description)
                                          : project.description
                                      }
                                    </p>
                                  </motion.div>
                                </AnimatePresence>
                                {shouldTruncateDescription(project.description) && (
                                  <motion.button
                                    onClick={() => toggleProjectExpansion(project.id)}
                                    className="mt-3 text-xs font-semibold text-primary hover:text-primary/80 transition-colors duration-200 flex items-center gap-1.5 group/btn bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    {expandedProjects.has(project.id) ? (
                                      <>
                                        <span>See Less</span>
                                        <motion.div
                                          animate={{ rotate: -90 }}
                                          transition={{ duration: 0.2 }}
                                        >
                                          <ChevronRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform duration-200" />
                                        </motion.div>
                                      </>
                                    ) : (
                                      <>
                                        <span>See More</span>
                                        <motion.div
                                          animate={{ rotate: 0 }}
                                          transition={{ duration: 0.2 }}
                                        >
                                          <ChevronRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform duration-200" />
                                        </motion.div>
                                      </>
                                    )}
                                  </motion.button>
                                )}
                              </div>

                              {/* Tech pills with actual tech logos */}
                              <div className="flex flex-wrap gap-2">
                                {project.techStack.map(tech => {
                                  const IconComponent = getTechIcon(tech);
                                  return (
                                    <span
                                      key={tech}
                                      className="flex items-center gap-1.5 font-mono text-[11px] px-3 py-1 rounded-full border border-primary/20 text-primary/80 bg-primary/5 hover:bg-primary/10 transition-colors"
                                    >
                                      <IconComponent className="text-[10px]" />
                                      {tech}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Links */}
                            <div className="flex flex-wrap gap-3 mt-8 pt-5 border-t border-border/15">
                              {project.liveUrl && (
                                <a
                                  href={project.liveUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/25 text-primary text-sm font-semibold hover:bg-primary/20 transition-all duration-200 hover:-translate-y-0.5"
                                >
                                  <Globe size={13} /> Live Demo
                                </a>
                              )}
                              {project.githubUrl && (
                                <a
                                  href={project.githubUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/40 border border-border/25 text-muted-foreground text-sm font-semibold hover:text-foreground hover:bg-muted/60 transition-all duration-200 hover:-translate-y-0.5"
                                >
                                  <Github size={13} /> GitHub
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  className="flex justify-center mt-12"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <button
                    onClick={() => setShowAllProjects((prev) => !prev)}
                    className="group flex items-center gap-2.5 px-7 py-3 rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
                  >
                    <motion.span
                      animate={{ rotate: showAllProjects ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="inline-block"
                    >
                      <ChevronRight size={15} className="rotate-90" />
                    </motion.span>
                    {showAllProjects ? "Show Less" : `Show ${PROJECTS.length - 3} More Projects`}
                  </button>
                </motion.div>
              </>
            );
          })()}
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
                    <p className="text-sm font-semibold text-white">fklein.lavina09@gmail.com</p>
                  </div>
                </div>

                {/* Social icons */}
                <div className="flex gap-3 pt-4 flex-wrap">
                  {[
                    { href: "https://github.com/KleinLavina", icon: Github, label: "GitHub" },
                    {
                      href: "https://www.linkedin.com/in/klein-lavina-353aba360",
                      icon: () => (
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      ),
                      label: "LinkedIn"
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
                    <div className="w-48 h-48 bg-white flex items-center justify-center relative">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=192x192&data=${encodeURIComponent(`BEGIN:VCARD
VERSION:3.0
FN:Klein F. Lavina
TEL:+639380734878
EMAIL:fklein.lavina09@gmail.com
URL:https://github.com/KleinLavina
URL:https://linkedin.com/in/klein-lavina-353aba360
END:VCARD`)}`}
                        alt="Contact QR Code"
                        className="w-full h-full"
                      />
                      {/* Logo overlay in center */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg">
                          <img 
                            src="/Gemini_Generated_Image_enc1uoenc1uoenc1-removebg-preview.png"
                            alt="Klein Logo"
                            className="w-10 h-10 object-contain"
                          />
                        </div>
                      </div>
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
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        <span>LinkedIn</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Footer */}
            <div className="mt-10 pt-6 border-t border-white/15 flex flex-col justify-center items-center gap-2">
              <p className="text-sm text-white/50 font-mono">
                © 2025 Klein F. Lavina. All rights reserved.
              </p>
              <p className="text-sm text-white/50 font-mono flex items-center gap-2">
                {visitorLoading
                  ? "Loading visitor count..."
                  : (
                    <>
                      <FontAwesomeIcon icon={faEye} />
                      <span>{visitorCount ?? 0} unique visitors all time</span>
                    </>
                  )}
              </p>
            </div>
          </div>
        </div>
      </Section>
      
      <AnimatePresence>
        {activeCertificateImage ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-background/88 px-5 py-8 backdrop-blur-md"
            onClick={() => setActiveCertificateImage(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 12 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="relative w-full max-w-5xl overflow-hidden rounded-[2rem] border border-border/70 bg-card/95 shadow-[0_30px_120px_-40px_hsl(var(--background)/0.9)]"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setActiveCertificateImage(null)}
                className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-background/80 text-foreground transition-colors duration-200 hover:border-primary/40 hover:text-primary"
                aria-label="Close certificate preview"
              >
                <X size={18} />
              </button>

              <div className="border-b border-border/60 px-6 py-4">
                <p className="text-[11px] font-mono uppercase tracking-[0.26em] text-primary/80">
                  PhilNITS IP Certification
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Full-size certificate preview
                </p>
              </div>

              <div className="bg-background/35 p-4 sm:p-6">
                <img
                  src={activeCertificateImage.src}
                  alt={activeCertificateImage.alt}
                  className="max-h-[78vh] w-full rounded-[1.5rem] object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <FloatingChat />
    </Shell>
  );
}


