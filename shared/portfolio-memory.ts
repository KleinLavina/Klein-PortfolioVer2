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
    title: "School Announcements",
    description:
      "A free web proposal for Tag-os Elementary School, built as a school announcements platform with an admin CMS for posts, events, staff, and school info.",
    techStack: ["React", "JavaScript", "CSS", "Vite", "HTML", "Netlify"],
    liveUrl: "https://tagoselementary.netlify.app/",
    githubUrl: "https://github.com/KleinLavina/TES",
    thumbnail: "/tes.png",
    context: "A proposal build for Tag-os Elementary School that shows Klein's ability to turn a school use case into a content-managed interface.",
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
    id: "contact",
    order: 7,
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
