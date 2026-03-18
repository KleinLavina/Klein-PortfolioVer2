export type PortfolioLink = {
  label: string;
  url: string;
};

export type PortfolioFact = {
  label: string;
  value: string;
};

export type PortfolioMemorySection = {
  id: string;
  order: number;
  title: string;
  eyebrow: string;
  summary: string;
  context: string;
  accent: "primary" | "secondary" | "accent";
  facts?: PortfolioFact[];
  items?: string[];
  links?: PortfolioLink[];
};

export type ManagedPortfolioMemorySection = PortfolioMemorySection & {
  recordId: number;
  isActive: boolean;
  createdAt: string | number;
  updatedAt: string | number;
};

export type PortfolioProject = {
  id: number;
  title: string;
  description: string;
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
  thumbnail: string;
  context: string;
};

export type PortfolioTimelineEntry = {
  year: string;
  phase: string;
  title: string;
  summary: string;
  highlights: string[];
  stack: string[];
  certification?: string;
};

export const portfolioProjects: PortfolioProject[] = [
  {
    id: 1,
    title: "RDFS - Real-time Dispatch and Finance System",
    description:
      "A real-time dispatch and finance system featuring QR code-based driver queuing, live vehicle tracking, and automated fare validation for the Maasin City Terminal.",
    techStack: ["JavaScript", "Django", "HTML", "CSS", "PostgreSQL", "Bootstrap", "Cloudinary", "OnRender"],
    liveUrl: "https://rdfsmaasin.onrender.com",
    githubUrl: "https://github.com/KleinLavina/RDFS",
    thumbnail: "/rdfs.png",
    context: "Capstone project focused on real-world transport operations, finance flow, and live dispatch visibility.",
  },
  {
    id: 2,
    title: "WISE-PENRO - Work Indicator Submission Engine",
    description:
      "A document tracking system built around the actual PENRO office workflow, covering submission, routing, monitoring, deadlines, and role-based access.",
    techStack: ["Django", "PostgreSQL", "HTML", "CSS", "JavaScript", "Cloudinary", "OnRender", "Brevo SMTP"],
    liveUrl: "https://r8penrowise.onrender.com",
    githubUrl: "https://github.com/KleinLavina/WISE-PENRO",
    thumbnail: "/wise-penro.png",
    context: "Workflow-driven system shaped by how staff actually submit and process documents day to day.",
  },
  {
    id: 3,
    title: "J-Gear Assistant Chatbot",
    description:
      "A keyword-based FAQ chatbot for BSBA TatakJosephinian merchandise inquiries covering products, pricing, and ordering.",
    techStack: ["TypeScript", "React", "CSS", "HTML", "Vite", "Netlify"],
    liveUrl: "https://jgeartatakjosephinian.netlify.app/",
    githubUrl: "https://github.com/KleinLavina/J-Gear-Chatbot",
    thumbnail: "/j-gear.png",
    context: "Portfolio-relevant chatbot work that connects directly to Klein's interest in structured conversational UX.",
  },
  {
    id: 4,
    title: "Tag-os Elementary School Website",
    description:
      "A modern school website with an admin CMS for announcements, events, staff directory, and school information.",
    techStack: ["React", "JavaScript", "CSS", "Vite", "HTML", "Netlify"],
    liveUrl: "https://tagoselementary.netlify.app/",
    githubUrl: "https://github.com/KleinLavina/TES",
    thumbnail: "/tes.png",
    context: "Shows Klein's ability to build content-managed interfaces instead of static brochure pages.",
  },
  {
    id: 5,
    title: "Cracken Gear Fits",
    description:
      "A fashion e-commerce project with role-based access, shopping cart flow, CAPTCHA-secured login, and admin CRUD for product management.",
    techStack: ["PHP", "JavaScript", "HTML", "CSS", "MySQL", "InfinityFree"],
    liveUrl: "https://cgearfits.rf.gd/",
    githubUrl: "https://github.com/KleinLavina/CrackenGearFits",
    thumbnail: "/gearfits.png",
    context: "A third-year project that moved from school requirements into a usable deployed build.",
  },
  {
    id: 6,
    title: "Cracken Furniture",
    description:
      "A furniture e-commerce platform with role-based access, shopping cart functionality, and admin inventory CRUD controls.",
    techStack: ["PHP", "JavaScript", "HTML", "CSS", "MySQL", "InfinityFree"],
    liveUrl: "https://cfurniture.rf.gd/",
    githubUrl: "https://github.com/KleinLavina/CrackenFurnture",
    thumbnail: "/furniture.png",
    context: "A second variation of Klein's original e-commerce design, adapted for a classmate while retaining authorship.",
  },
];

export const portfolioTimeline: PortfolioTimelineEntry[] = [
  {
    year: "2022",
    phase: "Chapter 01",
    title: "The First Line",
    summary:
      "Klein started BSIT at Saint Joseph College and began learning HTML, CSS, JavaScript, and basic Java programming.",
    highlights: [
      "Built first static web pages from scratch.",
      "Learned responsive layout basics with Flexbox and Grid.",
      "Reached the Dean's List in the first semester.",
    ],
    stack: ["HTML", "CSS", "JavaScript", "Java"],
  },
  {
    year: "2023",
    phase: "Chapter 02",
    title: "The Architect Phase",
    summary:
      "The focus shifted from syntax to systems thinking through data flow diagrams, database design, and relational modeling.",
    highlights: [
      "Designed normalized relational databases.",
      "Modeled systems through DFDs.",
      "Built and managed MySQL schemas and queries.",
    ],
    stack: ["MySQL", "Database Design", "DFD", "System Modeling"],
  },
  {
    year: "2024",
    phase: "Chapter 03",
    title: "Building Real Things",
    summary:
      "Theory turned into deployed work through live e-commerce builds, paid project delivery, and first hosting experience.",
    highlights: [
      "Launched Cracken Furniture.",
      "Delivered CrackenGearFits as paid work.",
      "Expanded language exposure through Python and R.",
    ],
    stack: ["PHP", "XAMPP", "MySQL", "Python", "R", "Git", "GitHub"],
  },
  {
    year: "2025",
    phase: "Chapter 04",
    title: "The Modern Stack",
    summary:
      "Klein moved into React, Vite, and Django while shipping chatbot work, capstone systems, and school-focused CMS builds.",
    highlights: [
      "Built the J-Gear chatbot.",
      "Delivered the RDFS capstone system.",
      "Designed the Tag-os school site CMS.",
      "Passed the PhilNITS IT Passport exam.",
    ],
    stack: ["React", "Vite", "Django", "Python", "JSX"],
    certification: "Certified PhilNITS Passer - Examinee No. IP4500348",
  },
];

export const portfolioMemorySections: PortfolioMemorySection[] = [
  {
    id: "identity",
    order: 1,
    eyebrow: "Portfolio Snapshot",
    title: "Who Klein Lavina Is",
    summary:
      "Klein F. Lavina is a fresh graduate from the Philippines building full-stack web apps with Django, PHP, React, and PostgreSQL.",
    context:
      "This is the top-level identity block the assistant should use before diving into projects, skills, or contact details.",
    accent: "primary",
    facts: [
      { label: "Role", value: "Fresh Graduate / Full Stack Developer" },
      { label: "Location", value: "Philippines" },
      { label: "Status", value: "Open to work" },
      { label: "Certification", value: "PhilNITS Passer" },
    ],
    items: [
      "Built 8+ portfolio-relevant projects.",
      "Works across school, internship, and personal project contexts.",
      "Prefers practical builds that mirror real workflows.",
    ],
  },
  {
    id: "about",
    order: 2,
    eyebrow: "Narrative",
    title: "How Klein Describes His Work",
    summary:
      "Klein focuses on understanding how websites really work under the surface and prefers shipping useful systems over polishing empty demos.",
    context:
      "Use this when the question is about personality, motivation, working style, or the voice behind the portfolio.",
    accent: "secondary",
    items: [
      "He cares about code that makes sense to the next person reading it.",
      "He is still actively learning, experimenting, and refining each version.",
      "He values clarity over pretending to know everything.",
      "Signature line: 'Passed PhilNITS. Still googling CSS flexbox.'",
    ],
  },
  {
    id: "values",
    order: 3,
    eyebrow: "Working Principles",
    title: "Values Behind The Builds",
    summary:
      "The portfolio is grounded in clean code, honesty, shipping, constant learning, and iteration.",
    context:
      "Use this when a recruiter or visitor asks how Klein works, what he prioritizes, or what makes his approach dependable.",
    accent: "accent",
    items: [
      "Clean Code - write it so someone else can read it tomorrow.",
      "Honesty - say 'I don't know yet' instead of faking certainty.",
      "Ship It - done and imperfect beats perfect and never shipped.",
      "Always Learning - every bug is a lesson.",
      "Iteration - version 1 is never the final version.",
    ],
  },
  {
    id: "technical-skills",
    order: 4,
    eyebrow: "Technical Arsenal",
    title: "Technical Skills And Tools",
    summary:
      "Klein's stack spans frontend, backend, databases, languages, and day-to-day tooling used across modern web projects.",
    context:
      "Use this when the question is about stack coverage, strongest technologies, or whether Klein can handle full-stack work.",
    accent: "primary",
    items: [
      "Frontend: HTML, CSS, JavaScript, TypeScript, React, Next.js, Tailwind, Bootstrap.",
      "Backend: Django, PHP.",
      "Databases: MySQL, PostgreSQL.",
      "Languages: Java, Python, R.",
      "Tools: VS Code, Git, GitHub, Figma, Postman, Cloudinary, Replit, Render, Canva.",
    ],
  },
  {
    id: "soft-skills",
    order: 5,
    eyebrow: "Professional Skills",
    title: "Soft Skills And Collaboration Strengths",
    summary:
      "Beyond the tech stack, Klein emphasizes problem solving, teamwork, troubleshooting, adaptability, continuous learning, and communication.",
    context:
      "Use this when a visitor is evaluating work style, collaboration fit, or reliability on a team.",
    accent: "secondary",
    items: [
      "Problem Solving - analytical approach to complex challenges.",
      "Team Collaboration - effective communication and teamwork.",
      "Technical Troubleshooting - fast diagnosis and resolution.",
      "Adaptability - quick to learn new tools and workflows.",
      "Communication - clear with both technical and non-technical people.",
    ],
  },
  {
    id: "projects",
    order: 6,
    eyebrow: "Featured Work",
    title: "Project Catalog With Context",
    summary:
      "The project list should be treated as ordered work history showing progression from practical systems to chatbots, CMS builds, and e-commerce platforms.",
    context:
      "Use this when the question is about specific projects, recent work, stack choices, live demos, or GitHub references.",
    accent: "accent",
    items: portfolioProjects.map(
      (project, index) =>
        `${String(index + 1).padStart(2, "0")}. ${project.title} - ${project.context} Stack: ${project.techStack.join(", ")}.`,
    ),
    links: portfolioProjects.flatMap((project) =>
      [
        project.liveUrl ? { label: `${project.title} Live`, url: project.liveUrl } : null,
        project.githubUrl ? { label: `${project.title} GitHub`, url: project.githubUrl } : null,
      ].filter((value): value is PortfolioLink => Boolean(value)),
    ),
  },
  {
    id: "timeline",
    order: 7,
    eyebrow: "Growth Timeline",
    title: "Developer Journey In Order",
    summary:
      "The timeline explains how Klein progressed from early web fundamentals into systems design, deployed projects, and the modern stack.",
    context:
      "Use this when the user asks about experience level, progression, learning path, or how Klein grew over time.",
    accent: "primary",
    items: portfolioTimeline.map(
      (entry) =>
        `${entry.year} - ${entry.title}: ${entry.summary}`,
    ),
  },
  {
    id: "contact",
    order: 8,
    eyebrow: "Contact",
    title: "How To Reach Klein",
    summary:
      "Klein is open to project inquiries, quick questions, and collaboration through email, GitHub, Facebook, or the portfolio contact form.",
    context:
      "Use this when the user asks how to contact Klein, what to include in an inquiry, or where to verify identity.",
    accent: "secondary",
    facts: [
      { label: "Primary Email", value: "kleinlavina@gmail.com" },
      { label: "Alternate Email In QR", value: "kleinlav7@gmail.com" },
      { label: "Phone", value: "+639380734878" },
      { label: "Preferred Route", value: "Portfolio form or direct email" },
    ],
    items: [
      "GitHub: https://github.com/KleinLavina",
      "Facebook: https://www.facebook.com/klein.lavina.12",
      "Best for hiring and project inquiries: send a short scope, timeline, and preferred contact method.",
    ],
    links: [
      { label: "GitHub", url: "https://github.com/KleinLavina" },
      { label: "Facebook", url: "https://www.facebook.com/klein.lavina.12" },
    ],
  },
];

export function buildPortfolioMemoryPrompt(
  sections: PortfolioMemorySection[] = portfolioMemorySections,
): string {
  return sections
    .map((section) => {
      const facts = section.facts?.map((fact) => `${fact.label}: ${fact.value}`).join("; ");
      const items = section.items?.map((item) => `- ${item}`).join("\n");
      const links = section.links?.map((link) => `${link.label}: ${link.url}`).join("; ");
      return [
        `${section.order}. ${section.title}`,
        `Eyebrow: ${section.eyebrow}`,
        `Summary: ${section.summary}`,
        `Context: ${section.context}`,
        facts ? `Facts: ${facts}` : null,
        items ? `Details:\n${items}` : null,
        links ? `Links: ${links}` : null,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");
}

export function getPortfolioProjects(limit = 3): PortfolioProject[] {
  return portfolioProjects.slice(0, Math.max(1, Math.min(limit, portfolioProjects.length)));
}

export function getPortfolioTimeline(limit = 4): PortfolioTimelineEntry[] {
  return portfolioTimeline.slice(0, Math.max(1, Math.min(limit, portfolioTimeline.length)));
}
