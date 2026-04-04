import {
  SiBootstrap,
  SiDjango,
  SiGithub,
  SiHtml5,
  SiJavascript,
  SiMysql,
  SiNetlify,
  SiNextdotjs,
  SiPhp,
  SiPostgresql,
  SiPython,
  SiReact,
  SiTailwindcss,
  SiTypescript,
  SiVite,
} from "react-icons/si";
import {
  FaCloud,
  FaCode,
  FaCss3Alt,
  FaEnvelope,
  FaServer,
} from "react-icons/fa";

export type Project = {
  id: number;
  title: string;
  description: string;
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
  thumbnail: string;
};

export const PROJECTS: Project[] = [
  {
    id: 1,
    title: "RDFS - Real-time Dispatch and Finance System",
    description:
      "A real-time dispatch and finance system featuring QR code-based driver queuing, live vehicle tracking, and automated fare validation for the Maasin City Terminal, developed as our capstone project.",
    techStack: ["JavaScript", "Django", "HTML", "CSS", "PostgreSQL", "Bootstrap", "Cloudinary", "OnRender"],
    liveUrl: "https://rdfsmaasin.onrender.com",
    thumbnail: "/rdfs.png",
  },
  {
    id: 2,
    title: "WISE-PENRO - Work Indicator Submission Engine",
    description:
      "A document tracking system built around the actual workflow of PENRO offices - handling document submission, routing between departments, status monitoring, and deadline tracking. Designed to match how PENRO staff submit and process documents day-to-day, with role-based access for different office levels.",
    techStack: ["Django", "PostgreSQL", "HTML", "CSS", "JavaScript", "Cloudinary", "OnRender", "Brevo SMTP"],
    liveUrl: "https://r8penrowise.onrender.com",
    thumbnail: "/wise-penro.png",
  },
  {
    id: 3,
    title: "J-Gear Assistant Chatbot",
    description:
      "A keyword-based FAQ chatbot developed for BSBA TatakJosephinian merchandise that assists users with product, pricing, and ordering inquiries through intelligent keyword matching.",
    techStack: ["TypeScript", "React", "CSS", "HTML", "Vite", "Netlify"],
    liveUrl: "https://jgeartatakjosephinian.netlify.app/",
    githubUrl: "https://github.com/KleinLavina/J-Gear-Chatbot",
    thumbnail: "/j-gear.png",
  },
  {
    id: 4,
    title: "Tag-os Elementary School Website",
    description:
      "A modern elementary school website featuring an admin CMS for managing announcements, events, staff directory, and school information with responsive design and interactive components.",
    techStack: ["React", "JavaScript", "CSS", "Vite", "HTML", "Netlify"],
    liveUrl: "https://tagoselementary.netlify.app/",
    githubUrl: "https://github.com/KleinLavina/TES",
    thumbnail: "/tes.png",
  },
  {
    id: 5,
    title: "Cracken Gear Fits",
    description:
      "A fashion e-commerce application developed as a 3rd year school project, featuring role-based access control, shopping cart functionality, CAPTCHA-secured login, and admin product management with full CRUD capabilities using PHP and MySQL. This is one variant of my original project design.",
    techStack: ["PHP", "JavaScript", "HTML", "CSS", "MySQL", "InfinityFree"],
    liveUrl: "https://cgearfits.rf.gd/",
    githubUrl: "https://github.com/KleinLavina/CrackenGearFits",
    thumbnail: "/gearfits.png",
  },
  {
    id: 6,
    title: "Cracken Furniture",
    description:
      "A full-stack furniture e-commerce platform developed as a 3rd year school project, with role-based user access, shopping cart functionality, and comprehensive admin controls for managing product inventory through CRUD operations. This is another variant of my original project design, created for a classmate while maintaining my ownership.",
    techStack: ["PHP", "JavaScript", "HTML", "CSS", "MySQL", "InfinityFree"],
    liveUrl: "https://cfurniture.rf.gd/",
    githubUrl: "https://github.com/KleinLavina/CrackenFurnture",
    thumbnail: "/furniture.png",
  },
];

export function getTechIcon(tech: string) {
  const iconMap: Record<string, any> = {
    JavaScript: SiJavascript,
    TypeScript: SiTypescript,
    React: SiReact,
    HTML: SiHtml5,
    CSS: FaCss3Alt,
    Python: SiPython,
    PHP: SiPhp,
    Bootstrap: SiBootstrap,
    GitHub: SiGithub,
    Django: SiDjango,
    PostgreSQL: SiPostgresql,
    MySQL: SiMysql,
    Vite: SiVite,
    "Next.js": SiNextdotjs,
    Tailwind: SiTailwindcss,
    Cloudinary: FaCloud,
    Netlify: SiNetlify,
    OnRender: FaServer,
    Render: FaServer,
    "Brevo SMTP": FaEnvelope,
    InfinityFree: FaServer,
  };

  return iconMap[tech] || FaCode;
}
