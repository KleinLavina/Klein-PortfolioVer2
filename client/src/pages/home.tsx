import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faBookOpen,
  faEye,
  faLightbulb,
  faShip
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
  SiSupabase,
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
import { ProjectShowcaseCard } from "@/components/project-showcase-card";
import { Section } from "@/components/ui/section";
import { ScrollTextFill } from "@/components/ui/scroll-text-fill";
import { GithubContributions } from "@/components/github-contributions";
import { FloatingChat } from "@/components/floating-chat";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  Loader2, Github, Code, Database, MonitorSmartphone,
  Layers, Server, TerminalSquare, Mail, FolderGit2, Phone,
  Lightbulb, Users, Wrench, Zap, BookOpen, MessageCircle, ArrowDown,
  ChevronRight, Sparkles, Globe, ArrowUpRight, UserRound, CheckCircle2, MapPin, X
} from "lucide-react";
import { memo, useCallback, useState, useEffect, type ElementType, type FormEvent, type MouseEvent, type ReactNode } from "react";
import { useMagnetic } from "@/hooks/use-magnetic";
import { smoothScrollToTarget } from "@/lib/smooth-scroll";
import { cn } from "@/lib/utils";
import { PROJECTS as ALL_PROJECTS, buildProjectShowcaseItems } from "@/lib/projects";

const TECH_STACK_GROUPS = [
  {
    title: "Frontend",
    skills: [
      { name: "HTML", icon: SiHtml5, color: "text-orange-500" },
      { name: "CSS", icon: FaCss3Alt, color: "text-blue-500" },
      { name: "JavaScript", icon: SiJavascript, color: "text-yellow-400" },
      { name: "TypeScript", icon: SiTypescript, color: "text-blue-600" },
      { name: "React", icon: SiReact, color: "text-cyan-500" },
      { name: "Next.js", icon: SiNextdotjs, color: "text-foreground" },
      { name: "Tailwind", icon: SiTailwindcss, color: "text-cyan-400" },
      { name: "Bootstrap", icon: SiBootstrap, color: "text-purple-500" },
    ],
  },
  {
    title: "Backend",
    skills: [
      { name: "Django", icon: SiDjango, color: "text-green-600" },
      { name: "PHP", icon: SiPhp, color: "text-indigo-400" },
      { name: "Python", icon: SiPython, color: "text-blue-400" },
    ],
  },
  {
    title: "Database & Backend Services",
    skills: [
      { name: "MySQL", icon: SiMysql, color: "text-blue-500" },
      { name: "PostgreSQL", icon: SiPostgresql, color: "text-blue-400" },
      { name: "Supabase", icon: SiSupabase, color: "text-emerald-500" },
    ],
  },
  {
    title: "Cloud, Hosting & Media",
    skills: [
      { name: "Cloudinary", icon: FaCloud, color: "text-blue-600" },
      { name: "Render", icon: FaServer, color: "text-purple-600" },
    ],
  },
  {
    title: "Design & Planning Tools",
    skills: [
      { name: "Figma", icon: SiFigma, color: "text-pink-500" },
      { name: "Canva", icon: FaPalette, color: "text-cyan-500" },
      { name: "draw.io", icon: FaCode, color: "text-orange-500" },
    ],
  },
  {
    title: "Developer Tools",
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
const FEATURED_PROJECTS = buildProjectShowcaseItems(ALL_PROJECTS.slice(0, 3));

function SectionLabel({ num, label }: { num: string; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-xs font-mono font-bold text-primary tracking-[0.2em] uppercase">{num}</span>
      <span className="h-px w-8 bg-primary/50" />
      <span className="text-xs font-mono text-muted-foreground tracking-widest uppercase">{label}</span>
    </div>
  );
}

function CredentialSectionTitle({ label }: { label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.7 }}
      transition={{ duration: 0.42, ease: "easeOut" }}
      className="flex items-center gap-3"
    >
      <span className="h-px w-8 bg-primary/45" />
      <span className="text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-primary/90">
        {label}
      </span>
    </motion.div>
  );
}

type LogWindowCardProps = {
  windowLabel: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  logoSrc?: string;
  logoAlt?: string;
  logoNode?: ReactNode;
  logoContainerClassName?: string;
  logoContentClassName?: string;
  sideBadge?: ReactNode;
  children?: ReactNode;
};

function LogWindowCard({
  windowLabel,
  eyebrow,
  title,
  subtitle,
  logoSrc,
  logoAlt,
  logoNode,
  logoContainerClassName,
  logoContentClassName,
  sideBadge,
  children,
}: LogWindowCardProps) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-border/60 bg-card/55 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center gap-2 border-b border-border/60 bg-background/55 px-5 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-primary/85" />
        <span className="h-2.5 w-2.5 rounded-full bg-secondary/85" />
        <span className="h-2.5 w-2.5 rounded-full bg-accent/85" />
        <span className="ml-3 text-[10px] font-mono uppercase tracking-[0.28em] text-muted-foreground">
          {windowLabel}
        </span>
      </div>

      <div className="space-y-6 p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-4">
            {logoSrc || logoNode ? (
              <div
                className={cn(
                  "flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden border border-border/60 bg-white p-1.5 shadow-[0_14px_30px_-24px_hsl(var(--background)/0.85)]",
                  "rounded-full",
                  logoContainerClassName,
                )}
              >
                {logoNode ? (
                  <div className={cn("relative flex h-full w-full items-center justify-center", logoContentClassName)}>
                    {logoNode}
                  </div>
                ) : (
                  <img
                    src={logoSrc}
                    alt={logoAlt ?? title}
                    className={cn("h-full w-full object-contain", logoContentClassName)}
                    loading="lazy"
                  />
                )}
              </div>
            ) : null}

            <div className="min-w-0">
              <p className="text-sm font-mono uppercase tracking-[0.18em] text-primary/85">
                {eyebrow}
              </p>
              <h3 className="mt-2 text-[1.9rem] font-black leading-tight text-foreground sm:text-[2rem]">
                {title}
              </h3>
              {subtitle ? (
                <p className="mt-3 text-base font-semibold text-foreground/90 sm:text-[1.08rem]">
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>

          {sideBadge ? <div className="shrink-0">{sideBadge}</div> : null}
        </div>

        {children}
      </div>
    </div>
  );
}

const TECHNICAL_ARSENAL_HEADER_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
} as const;

const TECHNICAL_ARSENAL_GRID_VARIANTS = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.04,
    },
  },
} as const;

const TECHNICAL_ARSENAL_CARD_VARIANTS = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
} as const;

const TECHNICAL_ARSENAL_PILL_GRID_VARIANTS = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
    },
  },
} as const;

const TECHNICAL_ARSENAL_PILL_VARIANTS = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
} as const;

const SOFT_SKILLS_GRID_VARIANTS = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.03,
    },
  },
} as const;

const SOFT_SKILL_CARD_VARIANTS = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
} as const;

const TECH_SKILL_CHIP_CLASS =
  "flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border/35 bg-card/55 shadow-[0_10px_24px_-18px_hsl(var(--foreground)/0.28)] hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300 cursor-default";

const SOFT_SKILL_CARD_CLASS =
  "group flex items-center gap-4 p-4 rounded-xl border border-border/35 bg-card/55 shadow-[0_18px_38px_-28px_hsl(var(--foreground)/0.35)] hover:border-primary/25 hover:-translate-y-0.5 transition-all duration-300 cursor-default";

const SkillChip = memo(function SkillChip({
  name,
  color,
  Icon,
}: {
  name: string;
  color: string;
  Icon: ElementType<{ size?: string | number; strokeWidth?: string | number; className?: string }>;
}) {
  return (
    <div className={TECH_SKILL_CHIP_CLASS} style={{ contain: "paint" }}>
      <Icon size={13} strokeWidth={1.5} className={color} />
      <span className="text-xs font-semibold text-foreground/80 transition-colors whitespace-nowrap">
        {name}
      </span>
    </div>
  );
});

const SoftSkillCard = memo(function SoftSkillCard({
  name,
  description,
  color,
  Icon,
}: {
  name: string;
  description: string;
  color: string;
  Icon: ElementType<{ size?: string | number; strokeWidth?: string | number; className?: string }>;
}) {
  return (
    <div className={SOFT_SKILL_CARD_CLASS} style={{ contain: "paint" }}>
      <div className={`p-2.5 rounded-lg bg-background/60 border border-border/40 flex-shrink-0 ${color} transition-transform group-hover:scale-110`}>
        <Icon size={18} strokeWidth={1.5} />
      </div>
      <div>
        <p className="font-semibold text-sm text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
});

const FeaturedProjectsSection = memo(function FeaturedProjectsSection({
  expandedProjects,
  onToggleExpand,
  onViewAll,
}: {
  expandedProjects: Set<number>;
  onToggleExpand: (projectId: number) => void;
  onViewAll: () => void;
}) {
  return (
    <>
      <div className="space-y-8">
        {FEATURED_PROJECTS.map((project, index) => (
          <ProjectShowcaseCard
            key={project.id}
            project={project}
            index={index}
            expanded={expandedProjects.has(project.id)}
            onToggleExpand={onToggleExpand}
          />
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
          onClick={onViewAll}
          className="group flex items-center gap-2.5 px-7 py-3 rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
        >
          <motion.span
            whileHover={{ x: 2 }}
            transition={{ duration: 0.2 }}
            className="inline-block"
          >
            <ChevronRight size={15} />
          </motion.span>
          {`Show ${ALL_PROJECTS.length - 3} More Projects`}
        </button>
      </motion.div>
    </>
  );
});

const TechnicalArsenalSection = memo(function TechnicalArsenalSection() {
  return (
    <>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={TECHNICAL_ARSENAL_HEADER_VARIANTS}
        className="mb-12"
      >
        <SectionLabel num="01" label="Technical Arsenal" />
        <h2 className="text-4xl sm:text-5xl font-black text-foreground leading-tight">
          Tools I build
          <br />
          <span className="text-gradient">great things with.</span>
        </h2>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={TECHNICAL_ARSENAL_GRID_VARIANTS}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-8"
      >
        {TECH_STACK_GROUPS.map((group) => (
          <motion.div
            key={group.title}
            variants={TECHNICAL_ARSENAL_CARD_VARIANTS}
            className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-xl p-5 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-muted-foreground">{group.title}</h3>
              <div className="flex-1 h-px bg-border/30" />
            </div>
            <motion.div variants={TECHNICAL_ARSENAL_PILL_GRID_VARIANTS} className="flex flex-wrap gap-2.5">
              {group.skills.map((skill) => (
                <motion.div key={skill.name} variants={TECHNICAL_ARSENAL_PILL_VARIANTS} className="group">
                  <SkillChip name={skill.name} color={skill.color} Icon={skill.icon} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={TECHNICAL_ARSENAL_CARD_VARIANTS}
        className="mt-14"
      >
        <div className="flex items-center gap-3 mb-6">
          <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-muted-foreground">Soft Skills</h3>
          <div className="flex-1 h-px bg-border/30" />
        </div>
        <motion.div variants={SOFT_SKILLS_GRID_VARIANTS} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PROFESSIONAL_SKILLS.map((skill) => (
            <motion.div
              key={skill.name}
              variants={SOFT_SKILL_CARD_VARIANTS}
              className="group"
            >
              <SoftSkillCard
                name={skill.name}
                description={skill.description}
                color={skill.color}
                Icon={skill.icon}
              />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </>
  );
});

const CONTACT_EMAIL = "fklein.lavina09@gmail.com";
const CONTACT_PHONE = "+639380734878";
const CONTACT_GITHUB_URL = "https://github.com/KleinLavina";
const CONTACT_LINKEDIN_URL = "https://www.linkedin.com/in/klein-lavina-353aba360";
const CONTACT_FINGERPRINT_KEY = "portfolio_contact_fingerprint";
const CONTACT_QR_SRC = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`BEGIN:VCARD
VERSION:3.0
FN:Klein F. Lavina
TEL:${CONTACT_PHONE}
EMAIL:${CONTACT_EMAIL}
URL:${CONTACT_GITHUB_URL}
URL:${CONTACT_LINKEDIN_URL}
END:VCARD`)}`;

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function ContactIncludes({ tone = "light" }: { tone?: "light" | "dark" }) {
  const wrapperClass =
    tone === "dark"
      ? "text-[11px] text-emerald-900/70 sm:text-xs"
      : "text-[11px] text-white/70 sm:text-xs";
  const labelClass =
    tone === "dark"
      ? "text-xs text-emerald-900/45 font-mono uppercase tracking-[0.24em]"
      : "text-xs text-white/50 font-mono uppercase tracking-[0.24em]";

  return (
    <div className="text-center space-y-2">
      <p className={labelClass}>Includes</p>
      <div className={cn("flex flex-wrap justify-center gap-x-3 gap-y-2", wrapperClass)}>
        <div className="flex items-center gap-1">
          <Mail size={12} />
          <span>Email</span>
        </div>
        <div className="flex items-center gap-1">
          <Phone size={12} />
          <span>Phone</span>
        </div>
        <div className="flex items-center gap-1">
          <Github size={12} />
          <span>GitHub</span>
        </div>
        <div className="flex items-center gap-1">
          <LinkedInIcon className="h-3 w-3" />
          <span>LinkedIn</span>
        </div>
      </div>
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

function getOrCreateContactFingerprint(): string {
  if (typeof window === "undefined") return "contact-server";

  const existing = window.localStorage.getItem(CONTACT_FINGERPRINT_KEY);
  if (existing) return existing;

  const generated =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `contact-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  window.localStorage.setItem(CONTACT_FINGERPRINT_KEY, generated);
  return generated;
}

export default function Home() {
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [visitorLoading, setVisitorLoading] = useState(true);
  const [visitorCountUnavailable, setVisitorCountUnavailable] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set());
  const [activeCertificateImage, setActiveCertificateImage] =
    useState<(typeof CERTIFICATION_IMAGES)[number] | null>(null);
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactInlineMessage, setContactInlineMessage] = useState<string | null>(null);
  const [contactRateLimited, setContactRateLimited] = useState(false);
  const [, setLocation] = useLocation();
  const currentYear = new Date().getFullYear();
  const mag1 = useMagnetic(0.3);
  const mag2 = useMagnetic(0.3);
  const contactEntryControls = useAnimationControls();

  const toggleProjectExpansion = useCallback((projectId: number) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  }, []);

  const handleViewAllProjects = useCallback(() => {
    setLocation("/projects");
  }, [setLocation]);

  const handleHeroAnchorClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, targetId: string) => {
      event.preventDefault();
      const target = document.getElementById(targetId);
      if (!(target instanceof HTMLElement)) {
        return;
      }

      smoothScrollToTarget(target, {
        durationMs: 720,
        offset: 88,
      });
      window.history.replaceState(null, "", `#${targetId}`);
    },
    [],
  );

  useEffect(() => {
    const trackVisitor = async () => {
      try {
        setVisitorCountUnavailable(false);
        const visitorId = getOrCreateVisitorId();
        const response = await fetch("/api/visitors/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visitorId }),
        });

        if (!response.ok) {
          setVisitorCountUnavailable(true);
          return;
        }

        const data = (await response.json()) as { count?: number };
        if (typeof data.count === "number") {
          setVisitorCount(data.count);
        } else {
          setVisitorCountUnavailable(true);
        }
      } catch {
        setVisitorCountUnavailable(true);
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

  useEffect(() => {
    const targetId = window.sessionStorage.getItem("portfolio-scroll-target");
    if (!targetId) return;

    window.sessionStorage.removeItem("portfolio-scroll-target");

    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        const target = document.getElementById(targetId);
        if (target instanceof HTMLElement) {
          smoothScrollToTarget(target, { durationMs: 760 });
        }
      }, 120);
    });
  }, []);

  useEffect(() => {
    const triggerContactEntry = () => {
      void contactEntryControls.set({ opacity: 0.56 });
      void contactEntryControls.start({
        opacity: 1,
        transition: { duration: 0.28, ease: "easeOut" },
      });
    };

    window.addEventListener("portfolio:navigate-contact", triggerContactEntry);
    return () => {
      window.removeEventListener("portfolio:navigate-contact", triggerContactEntry);
    };
  }, [contactEntryControls]);

  const handleContactSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (typeof window === "undefined") return;

    setContactInlineMessage(null);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const fullName = String(formData.get("fullName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    const fingerprint = getOrCreateContactFingerprint();

    try {
      setIsSubmittingContact(true);
      const response = await fetch("/api/contact/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          message,
          fingerprint,
        }),
      });

      const data = (await response.json()) as { message?: string };

      if (response.status === 429) {
        setContactRateLimited(true);
        setContactInlineMessage(
          data.message ??
            "You've reached the 3 message limit for today. Please try again tomorrow.",
        );
        return;
      }

      if (!response.ok) {
        throw new Error(data.message ?? "Failed to send your message.");
      }

      form.reset();
      setContactRateLimited(false);
      setContactInlineMessage(
        data.message ?? "Message sent successfully. I will get back to you soon.",
      );
    } catch (error) {
      setContactInlineMessage(
        error instanceof Error ? error.message : "Failed to send your message.",
      );
    } finally {
      setIsSubmittingContact(false);
    }
  };



  return (
    <Shell>
      <div
        className="fixed inset-0 z-0 transition-opacity duration-500 ease-out"
        style={{ opacity: "var(--ambient-bg-opacity, 1)" }}
      >
        <BubbleBackground className="w-full h-full" />
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
                      <a
                        href="#projects"
                        onClick={(event) => handleHeroAnchorClick(event, "projects")}
                        className="flex items-center gap-3"
                      >
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
                      <a
                        href="#contact"
                        onClick={(event) => handleHeroAnchorClick(event, "contact")}
                        className="flex items-center gap-3"
                      >
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
          <TechnicalArsenalSection />

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
        <GithubContributions />

        <Section id="credentials" className="!min-h-0 py-20">
          <motion.div
            id="projects-head"
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
                  <CredentialSectionTitle label="Education" />

                  <LogWindowCard
                    windowLabel="education.log"
                    eyebrow="Academic Foundation"
                    title="Saint Joseph College"
                    subtitle="Bachelor of Science in Information Technology"
                    logoSrc="https://www.sjc.edu.ph/wp-content/uploads/2024/09/SJC-LOGO-NEWER.png"
                    logoAlt="Saint Joseph College logo"
                    logoContentClassName="scale-[1.72]"
                    sideBadge={(
                      <span className="inline-flex items-center rounded-full border border-accent/35 bg-accent/10 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-accent">
                        Expected 2026
                      </span>
                    )}
                  >
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin size={14} className="mt-0.5 shrink-0 text-primary/75" />
                      <p className="leading-relaxed">
                        Tomas Oppus Street, Maasin, Southern Leyte, Philippines.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-start gap-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-sm font-mono uppercase tracking-[0.18em] text-muted-foreground">
                          2022 - 2026
                        </p>
                        <span className="inline-flex items-center rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-primary shadow-[0_12px_28px_-20px_hsl(var(--primary)/0.9)]">
                          Undergraduate Program
                        </span>
                      </div>

                      <span className="inline-flex items-center rounded-full border border-border/70 bg-background/45 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                        Catholic College
                      </span>
                    </div>
                  </LogWindowCard>
                </div>

                <div className="space-y-6">
                  <CredentialSectionTitle label="Certifications" />

                  <div className="glass-card space-y-6 rounded-[2rem] border border-border/60 p-6 sm:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-white p-2 shadow-[0_14px_30px_-24px_hsl(var(--background)/0.85)]">
                          <img
                            src="/Philippine-National-IT-Standards-PhilNITS-Foundation-e1741711359917.png"
                            alt="PhilNITS Foundation logo"
                            className="h-full w-full scale-[1.18] object-contain"
                            loading="lazy"
                          />
                        </div>

                        <div className="min-w-0 space-y-3">
                          <div className="inline-flex flex-col gap-1.5">
                            <h3 className="text-[1.9rem] font-black text-foreground sm:text-[2rem]">
                              IT Passport (IP) Certification
                            </h3>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <p className="font-semibold text-foreground/90">
                                PhilNITS Foundation, Inc.
                              </p>
                              <p>Phil. National IT Standards Foundation</p>
                            </div>
                          </div>
                          <a
                            href="https://philnits.org/passers-ip/"
                            target="_blank"
                            rel="noreferrer"
                            className="group inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.22em] text-primary/75 transition-colors duration-200 hover:text-primary"
                          >
                            <ArrowUpRight size={12} />
                            <span className="underline decoration-primary/45 underline-offset-4 transition-colors duration-200 group-hover:decoration-primary">
                              official passers list
                            </span>
                          </a>
                        </div>
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
                  <CredentialSectionTitle label="Experience" />

                  <LogWindowCard
                    windowLabel="experience.log"
                    eyebrow="On-the-Job Trainee (OJT)"
                    title="Department of Environment and Natural Resources - PENRO"
                    logoSrc="/denr-emb-logo.gif"
                    logoAlt="DENR PENRO logo"
                    logoContentClassName="scale-[1.22]"
                    sideBadge={(
                      <span className="inline-flex items-center rounded-full border border-border/70 bg-background/45 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                        Government Agency
                      </span>
                    )}
                  >
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin size={14} className="mt-0.5 shrink-0 text-primary/75" />
                      <p className="leading-relaxed">
                        Capitol Site, Barangay Asuncion, Maasin City, 6600 Southern Leyte, Philippines.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-sm font-mono uppercase tracking-[0.18em] text-muted-foreground">
                        Provincial Environment and Natural Resources Office
                      </p>
                      <span className="inline-flex items-center rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-primary shadow-[0_12px_28px_-20px_hsl(var(--primary)/0.9)]">
                        4 Months
                      </span>
                    </div>
                  </LogWindowCard>
                </div>

                <div className="space-y-5">
                  <div className="text-[11px] font-mono uppercase tracking-[0.28em] text-primary/80">
                    // personal / hobby
                  </div>

                  <LogWindowCard
                    windowLabel="personal-hobby.log"
                    eyebrow="Personal / Hobby"
                    title="Built outside the brief."
                    subtitle="Beyond deadlines and requirements, I build things out of pure curiosity. Side projects, late-night experiments, tools I wish existed - shipped for fun, deployed for real."
                    logoNode={(
                      <>
                        <FontAwesomeIcon
                          icon={faLightbulb}
                          className="absolute left-[10%] top-[8%] text-[1rem] text-slate-800"
                        />
                        <FontAwesomeIcon
                          icon={faBookOpen}
                          className="absolute right-[8%] top-[18%] text-[0.95rem] text-slate-700"
                        />
                        <FontAwesomeIcon
                          icon={faShip}
                          className="absolute bottom-[8%] left-1/2 -translate-x-1/2 text-[1rem] text-slate-900"
                        />
                      </>
                    )}
                    sideBadge={(
                      <span className="inline-flex items-center rounded-full border border-border/70 bg-background/45 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                        Always Building
                      </span>
                    )}
                  >
                    <div className="flex flex-wrap gap-3">
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
                  </LogWindowCard>
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

          <FeaturedProjectsSection
            expandedProjects={expandedProjects}
            onToggleExpand={toggleProjectExpansion}
            onViewAll={handleViewAllProjects}
          />
        </Section>

      </div>

      {/* ─── SCROLL TEXT FILL ────────────────────────────────────────── */}
      <ScrollTextFill />

      {/* ─── CONTACT ─────────────────────────────────────────────────── */}
      <Section id="contact" className="!min-h-fit !py-0 relative overflow-hidden !shadow-none" style={{ boxShadow: 'none' }}>
        {/* Wave separator */}
        <div className="relative h-24 bg-background sm:h-28">
          <div className="absolute inset-0 overflow-hidden opacity-[0.06] z-0">
            <div className="flex h-full items-end whitespace-nowrap pb-5 text-6xl font-black text-foreground animate-marquee sm:pb-7 sm:text-7xl">
              Collaborate with me · Collaborate with me · Collaborate with me · Collaborate with me ·
            </div>
          </div>
          <svg className="absolute bottom-0 left-0 z-10 h-24 w-full sm:h-28" viewBox="0 0 1440 128" preserveAspectRatio="none" style={{ display: 'block' }}>
            <path d="M0,96 C360,32 720,32 1440,96 L1440,128 L0,128 Z" className="fill-primary" style={{ shapeRendering: 'geometricPrecision' }} />
          </svg>
        </div>

        {/* Contact body */}
        <motion.div
          initial={false}
          animate={contactEntryControls}
          className="relative bg-primary overflow-hidden -mt-1"
        >
          <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 pt-14 pb-14 sm:pt-16 sm:pb-16">
            <div className="grid grid-cols-1 gap-10 items-start lg:grid-cols-2 lg:gap-12">

              {/* Left: Copy */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-white/60 tracking-[0.2em] uppercase">05 — Contact</span>
                </div>
                <h2 className="text-3xl sm:text-[2.8rem] font-black text-white leading-tight">
                  Got a project<br />in mind?
                </h2>
                <p className="max-w-md text-base leading-relaxed text-white/80 sm:text-[1.05rem]">
                  Whether it's a full product, a quick question, or just wanting to connect —
                  my inbox is always open.
                </p>

                <div className="flex items-center gap-3 pt-1">
                  <div className="rounded-xl bg-white/10 p-2.5 backdrop-blur-sm">
                    <Mail size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-white/50 font-mono uppercase tracking-wider">Email</p>
                    <p className="text-sm font-semibold text-white">{CONTACT_EMAIL}</p>
                  </div>
                </div>

                {/* Social icons */}
                <div className="flex flex-wrap gap-2.5 pt-2">
                  {[
                    { href: CONTACT_GITHUB_URL, icon: Github, label: "GitHub" },
                    {
                      href: CONTACT_LINKEDIN_URL,
                      icon: () => <LinkedInIcon className="h-5 w-5" />,
                      label: "LinkedIn"
                    },
                  ].map(({ href, icon: Icon, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20"
                    >
                      <Icon />
                      {label}
                    </a>
                  ))}
                </div>

                <div className="pt-2">
                  <div className="w-full max-w-[17rem] rounded-[1.5rem] border border-white/20 bg-white/95 p-4 shadow-[0_26px_60px_-32px_rgba(0,0,0,0.45)]">
                    <div className="space-y-1 text-center">
                      <h3 className="text-base font-bold text-emerald-950">Scan to Connect</h3>
                      <p className="text-xs text-emerald-900/60">Get my contact info instantly</p>
                    </div>

                    <div className="mt-3 flex justify-center">
                      <div className="relative flex h-28 w-28 items-center justify-center bg-white sm:h-32 sm:w-32">
                        <img
                          src={CONTACT_QR_SRC}
                          alt="Contact QR Code"
                          className="h-full w-full"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-lg sm:h-9 sm:w-9">
                            <img
                              src="/Gemini_Generated_Image_enc1uoenc1uoenc1-removebg-preview.png"
                              alt="Klein Logo"
                              className="h-6 w-6 object-contain sm:h-7 sm:w-7"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <ContactIncludes tone="dark" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right: Form */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="w-full"
              >
                <div className="mx-auto w-full max-w-xl rounded-[1.75rem] border border-black/10 bg-white p-5 shadow-md backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900 sm:p-6 lg:min-h-[26rem]">
                  <div className="space-y-1.5">
                    <p className="text-xs font-mono uppercase tracking-[0.24em] text-[#3CC35B]/70">Direct Message</p>
                    <h3 className="text-xl font-bold text-[#3CC35B] sm:text-[1.75rem]">Let&apos;s talk about your next build</h3>
                    <p className="max-w-lg text-sm leading-6 text-[#3CC35B]/80">
                      Share the project, the goal, or the reason you&apos;re reaching out. I&apos;ll package it into an email draft so you can send it instantly.
                    </p>
                  </div>

                  <form onSubmit={handleContactSubmit} className="mt-6 space-y-4">
                    <div className="space-y-1.5">
                      <label htmlFor="contact-full-name" className="text-sm font-semibold text-[#3CC35B]">
                        Full Name
                      </label>
                      <input
                        id="contact-full-name"
                        name="fullName"
                        type="text"
                        placeholder="Your full name"
                        className="h-12 w-full rounded-2xl border border-neutral-300 bg-neutral-100 px-4 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-neutral-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-foreground dark:placeholder:text-neutral-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/40"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="contact-email-address" className="text-sm font-semibold text-[#3CC35B]">
                        Email Address
                      </label>
                      <input
                        id="contact-email-address"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        className="h-12 w-full rounded-2xl border border-neutral-300 bg-neutral-100 px-4 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-neutral-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-foreground dark:placeholder:text-neutral-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/40"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="contact-message" className="text-sm font-semibold text-[#3CC35B]">
                        Message / Purpose
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        placeholder="Tell me about your project or reason for reaching out..."
                        rows={4}
                        className="w-full resize-none rounded-[1.5rem] border border-neutral-300 bg-neutral-100 px-4 py-3 text-sm font-medium leading-6 text-foreground outline-none transition-colors placeholder:text-neutral-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-foreground dark:placeholder:text-neutral-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/40"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingContact || contactRateLimited}
                      className="flex h-12 w-full items-center justify-center rounded-2xl bg-[#3CC35B] px-5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#34ad50] focus:outline-none focus:ring-2 focus:ring-[#3CC35B]/35 focus:ring-offset-2 focus:ring-offset-white dark:bg-[#3CC35B] dark:hover:bg-[#34ad50] dark:focus:ring-offset-black"
                    >
                      {isSubmittingContact ? "Sending..." : "Send Message"}
                    </button>
                    {contactInlineMessage ? (
                      <p
                        className={cn(
                          "text-sm leading-6",
                          contactRateLimited
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-emerald-700 dark:text-emerald-400",
                        )}
                      >
                        {contactInlineMessage}
                      </p>
                    ) : null}
                  </form>
                </div>
              </motion.div>
            </div>

            {/* Footer */}
            <div className="mt-8 flex flex-col items-center justify-center gap-2 border-t border-white/15 pt-5">
              <p className="text-sm text-white/50 font-mono">
                © {currentYear} Klein F. Lavina. All rights reserved.
              </p>
              <p className="text-sm text-white/50 font-mono flex items-center gap-2">
                {visitorLoading
                  ? "Loading visitor count..."
                  : visitorCountUnavailable
                    ? "Visitor count unavailable"
                    : (
                    <>
                      <FontAwesomeIcon icon={faEye} />
                      <span>{visitorCount ?? 0} unique visitors all time</span>
                    </>
                    )}
              </p>
            </div>
          </div>
        </motion.div>
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


