import { Fragment, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faBootstrap,
  faCss3Alt,
  faDocker,
  faFigma,
  faGitAlt,
  faGithub,
  faHtml5,
  faJs,
  faLaravel,
  faNodeJs,
  faPhp,
  faPython,
  faReact,
  faVuejs,
} from "@fortawesome/free-brands-svg-icons";
import {
  faBolt,
  faCloud,
  faCode,
  faDatabase as faDatabaseSolid,
  faEnvelope,
  faGear,
  faGlobe,
  faMicrochip,
  faServer,
} from "@fortawesome/free-solid-svg-icons";
import {
  X,
  MessageCircle,
  Send,
  ChevronUp,
  Bot,
  UserRound,
  Sparkles,
  Cpu,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import type { ChatAction } from "@shared/schema";
import { cn } from "@/lib/utils";

type TechEntry = { icon: IconDefinition; color: string };

const TECH_ALIASES: Record<string, string> = {
  react: "React",
  "react.js": "React",
  node: "Node.js",
  "node.js": "Node.js",
  typescript: "TypeScript",
  ts: "TypeScript",
  javascript: "JavaScript",
  js: "JavaScript",
  python: "Python",
  django: "Django",
  php: "PHP",
  html: "HTML",
  html5: "HTML",
  css: "CSS",
  css3: "CSS",
  tailwind: "Tailwind CSS",
  tailwindcss: "Tailwind CSS",
  "tailwind css": "Tailwind CSS",
  mysql: "MySQL",
  postgresql: "PostgreSQL",
  postgres: "PostgreSQL",
  mongodb: "MongoDB",
  git: "Git",
  github: "GitHub",
  vite: "Vite",
  "next.js": "Next.js",
  nextjs: "Next.js",
  vue: "Vue",
  "vue.js": "Vue",
  laravel: "Laravel",
  firebase: "Firebase",
  supabase: "Supabase",
  docker: "Docker",
  figma: "Figma",
  redux: "Redux",
  graphql: "GraphQL",
  express: "Express",
  "express.js": "Express",
  bootstrap: "Bootstrap",
  wordpress: "WordPress",
  linux: "Linux",
  rest: "REST API",
  "rest api": "REST API",
  api: "API",
  sql: "SQL",
  postman: "Postman",
  cloudinary: "Cloudinary",
  replit: "Replit",
  render: "Render",
  onrender: "Render",
  canva: "Canva",
  "brevo smtp": "Brevo SMTP",
  netlify: "Netlify",
  "vs code": "VS Code",
  java: "Java",
  r: "R",
};

const TECH_ICON_MAP: Record<string, TechEntry> = {
  "React": { icon: faReact, color: "#61DAFB" },
  "Node.js": { icon: faNodeJs, color: "#339933" },
  "TypeScript": { icon: faCode, color: "#3178C6" },
  "JavaScript": { icon: faJs, color: "#F7DF1E" },
  "Python": { icon: faPython, color: "#3776AB" },
  "Django": { icon: faServer, color: "#0C4B33" },
  "PHP": { icon: faPhp, color: "#777BB4" },
  "HTML": { icon: faHtml5, color: "#E34F26" },
  "CSS": { icon: faCss3Alt, color: "#1572B6" },
  "Tailwind CSS": { icon: faBolt, color: "#06B6D4" },
  "MySQL": { icon: faDatabaseSolid, color: "#4479A1" },
  "PostgreSQL": { icon: faDatabaseSolid, color: "#4169E1" },
  "MongoDB": { icon: faDatabaseSolid, color: "#47A248" },
  "Git": { icon: faGitAlt, color: "#F05032" },
  "GitHub": { icon: faGithub, color: "#6E7681" },
  "Vite": { icon: faGear, color: "#646CFF" },
  "Next.js": { icon: faCode, color: "#94A3B8" },
  "Vue": { icon: faVuejs, color: "#4FC08D" },
  "Laravel": { icon: faLaravel, color: "#FF2D20" },
  "Firebase": { icon: faCloud, color: "#FFCA28" },
  "Supabase": { icon: faDatabaseSolid, color: "#3ECF8E" },
  "Docker": { icon: faDocker, color: "#2496ED" },
  "Figma": { icon: faFigma, color: "#F24E1E" },
  "Redux": { icon: faCode, color: "#764ABC" },
  "GraphQL": { icon: faGlobe, color: "#E10098" },
  "Express": { icon: faServer, color: "#94A3B8" },
  "Bootstrap": { icon: faBootstrap, color: "#7952B3" },
  "WordPress": { icon: faGlobe, color: "#21759B" },
  "Linux": { icon: faServer, color: "#FCC624" },
  "REST API": { icon: faGlobe, color: "#22C55E" },
  "API": { icon: faGlobe, color: "#22C55E" },
  "SQL": { icon: faDatabaseSolid, color: "#4479A1" },
  "Postman": { icon: faGlobe, color: "#FF6C37" },
  "Cloudinary": { icon: faCloud, color: "#3448C5" },
  "Replit": { icon: faCode, color: "#F26207" },
  "Render": { icon: faServer, color: "#7C3AED" },
  "Canva": { icon: faFigma, color: "#00C4CC" },
  "Brevo SMTP": { icon: faEnvelope, color: "#10B981" },
  "Netlify": { icon: faCloud, color: "#14B8A6" },
  "VS Code": { icon: faCode, color: "#3B82F6" },
  "Java": { icon: faCode, color: "#EF4444" },
  "R": { icon: faCode, color: "#2563EB" },
};

function normalizeTechName(rawName: string): string {
  const cleaned = rawName.trim().replace(/^[\s*•-]+/, "").replace(/[.,;:]+$/, "");
  return TECH_ALIASES[cleaned.toLowerCase()] ?? cleaned;
}

function getTechEntry(rawName: string): { name: string; entry?: TechEntry } {
  const name = normalizeTechName(rawName);
  return { name, entry: TECH_ICON_MAP[name] };
}

function TechBadge({ name }: { name: string }) {
  const { name: normalizedName, entry } = getTechEntry(name);
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium leading-none
                 bg-white border border-[#c8e2ce]/80 text-[#1a2e1e] shadow-[0_6px_18px_-16px_rgba(24,46,30,0.7)]
                 dark:bg-[#1a2b1e] dark:border-[#2a4530]/70 dark:text-[#d4edd9]"
      data-testid={`tech-badge-${normalizedName.toLowerCase().replace(/[\s.]+/g, "-")}`}
    >
      {entry ? (
        <FontAwesomeIcon
          icon={entry.icon}
          style={{ color: entry.color }}
          className="text-[12px] leading-none shrink-0"
        />
      ) : (
        <FontAwesomeIcon icon={faMicrochip} className="text-[12px] text-primary shrink-0" />
      )}
      {normalizedName}
    </span>
  );
}

function renderInlineContent(text: string): React.ReactNode {
  const normalized = text.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, "$1");
  const parts = normalized.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);

  return parts.map((part, index) => {
    const strongMatch = part.match(/^\*\*(.+)\*\*$/);
    if (strongMatch) {
      return (
        <strong key={`${part}-${index}`} className="font-semibold text-[#16321d] dark:text-[#ebfff0]">
          {strongMatch[1]}
        </strong>
      );
    }

    return <Fragment key={`${part}-${index}`}>{part}</Fragment>;
  });
}

function extractTechGroup(line: string): { label?: string; techs: string[] } | null {
  const markerMatches = Array.from(line.matchAll(/\[tech:([^\]]+)\]/g));
  if (markerMatches.length > 0) {
    const techs = markerMatches
      .map((match) => normalizeTechName(match[1]))
      .filter(Boolean);
    const label = line.replace(/\[tech:[^\]]+\]\s*/g, "").trim().replace(/:+$/, "");
    return { label: label || undefined, techs };
  }

  const cleaned = line.trim().replace(/^[-*•]\s+/, "");
  const match = cleaned.match(/^(?:\*\*([^*]+)\*\*|([^:]+)):\s*(.+)$/);
  if (!match) return null;

  const label = (match[1] ?? match[2] ?? "").trim();
  const rhs = match[3].trim();
  const techs = rhs
    .split(",")
    .map((item) => normalizeTechName(item))
    .filter((item) => Boolean(TECH_ICON_MAP[item]));

  if (techs.length === 0) return null;
  if (techs.length < 2 && !/tech|stack|frontend|backend|database|language|tool/i.test(label)) {
    return null;
  }

  return { label, techs };
}

function renderMessageLine(line: string, key: string): React.ReactNode {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const techGroup = extractTechGroup(trimmed);
  if (techGroup) {
    return (
      <div key={key} className="rounded-xl border border-[#d7eadb]/80 bg-[#f7fcf8] px-3 py-2 dark:border-[#274130]/70 dark:bg-[#122016]">
        {techGroup.label && (
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#4d7358] dark:text-[#87b292]">
            {renderInlineContent(techGroup.label)}
          </div>
        )}
        <div className="flex flex-wrap gap-1.5">
          {techGroup.techs.map((name) => (
            <TechBadge key={`${key}-${name}`} name={name} />
          ))}
        </div>
      </div>
    );
  }

  const listMatch = trimmed.match(/^[-*•]\s+(.+)$/);
  if (listMatch) {
    return (
      <div key={key} className="flex items-start gap-2">
        <span className="mt-1 text-[9px] text-primary/70 dark:text-primary">●</span>
        <span className="min-w-0">{renderInlineContent(listMatch[1].trim())}</span>
      </div>
    );
  }

  if (/^[A-Za-z][^.!?]{0,48}:$/.test(trimmed)) {
    return (
      <div key={key} className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#4d7358] dark:text-[#87b292]">
        {renderInlineContent(trimmed.slice(0, -1))}
      </div>
    );
  }

  return (
    <div key={key} className="text-[13px] leading-relaxed">
      {renderInlineContent(trimmed)}
    </div>
  );
}

function renderMessageContent(text: string): React.ReactNode {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className="space-y-3">
      {paragraphs.map((paragraph, paragraphIndex) => {
        const lines = paragraph
          .split("\n")
          .map((line) => line.trimEnd())
          .filter(Boolean);

        return (
          <div key={`paragraph-${paragraphIndex}`} className="space-y-1.5">
            {lines.map((line, lineIndex) =>
              renderMessageLine(line, `paragraph-${paragraphIndex}-line-${lineIndex}`),
            )}
          </div>
        );
      })}
    </div>
  );
}

type Message = {
  id: number;
  from: "user" | "klein";
  text: string;
  actions?: ChatAction[];
  actionsReady?: boolean;
};

type ChatUsage = {
  used: number;
  remaining: number;
  limit: number;
};

const TYPEWRITER_STEP = 3;
const TYPEWRITER_DELAY_MS = 12;
const MESSAGE_CHAR_LIMIT = 50;
const DAILY_MESSAGE_LIMIT = 8;
const DAILY_LIMIT_MESSAGE = "You've reached your daily limit. Please come back tomorrow.";

const FALLBACK_WELCOME_MESSAGES = [
  "Welcome. I am Klein's AI assistant. How can I help today?",
  "Hi there. Welcome to Klein's portfolio chat.",
  "Glad you are here. Ask me anything about Klein's work.",
  "Welcome in. I can help with projects, skills, and contact details.",
  "Hello. This is Klein's assistant. What would you like to know?",
];

const FALLBACK_SUGGESTED_REPLIES = [
  "Can you introduce Klein?",
  "Show me recent projects.",
  "What skills does Klein have?",
  "How can I contact Klein?",
];

const AVATAR_ICONS = [Bot, UserRound, Sparkles, Cpu];

let _cachedWelcomeMessages: string[] | null = null;
let _cachedQuickReplies: string[] | null = null;

async function fetchWelcomeMessages(): Promise<string[]> {
  if (_cachedWelcomeMessages) return _cachedWelcomeMessages;
  try {
    const res = await fetch("/api/chatbot/welcome-messages");
    if (!res.ok) throw new Error();
    const data = (await res.json()) as string[];
    if (Array.isArray(data) && data.length > 0) {
      _cachedWelcomeMessages = data;
      return data;
    }
  } catch {}
  return FALLBACK_WELCOME_MESSAGES;
}

async function fetchQuickReplies(): Promise<string[]> {
  if (_cachedQuickReplies) return _cachedQuickReplies;
  try {
    const res = await fetch("/api/chatbot/quick-replies");
    if (!res.ok) throw new Error();
    const data = (await res.json()) as string[];
    if (Array.isArray(data) && data.length > 0) {
      _cachedQuickReplies = data;
      return data;
    }
  } catch {}
  return FALLBACK_SUGGESTED_REPLIES;
}

function pickRandomWelcomeMessage(): string {
  const pool = _cachedWelcomeMessages ?? FALLBACK_WELCOME_MESSAGES;
  return pool[Math.floor(Math.random() * pool.length)];
}

function pickRandomAvatarIcon() {
  return AVATAR_ICONS[Math.floor(Math.random() * AVATAR_ICONS.length)];
}

function getOrCreateClientId(): string {
  if (typeof window === "undefined") return "client-server";
  const key = "portfolio_chat_client_id";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const generated = `client-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(key, generated);
  return generated;
}

function buildSuggestedReplies(msgs: Message[], quickReplies: string[]): string[] {
  const latest = msgs[msgs.length - 1];
  if (!latest) return quickReplies.length > 0 ? quickReplies : FALLBACK_SUGGESTED_REPLIES;

  const latestText = latest.text.toLowerCase();
  const recentText = msgs.slice(-5).map((m) => m.text.toLowerCase()).join(" ");

  if (recentText.includes("project")) {
    return [
      "Which project is most recent?",
      "What tech stack was used?",
      "Do you have a live demo link?",
      "Can you share a GitHub repo?",
    ];
  }
  if (recentText.includes("skill") || recentText.includes("stack") || recentText.includes("technology")) {
    return [
      "What is Klein strongest at?",
      "Any backend experience?",
      "Can Klein build full-stack apps?",
      "What tools does Klein use daily?",
    ];
  }
  if (recentText.includes("contact") || recentText.includes("email") || recentText.includes("hire")) {
    return [
      "What is the best way to reach Klein?",
      "Can I send a project inquiry?",
      "What details should I include?",
      "How quickly does Klein reply?",
    ];
  }
  if (latest.from === "user") {
    return [
      "Can you give more detail?",
      "Can you summarize that quickly?",
      "Can you suggest next steps?",
      "Do you have examples for this?",
    ];
  }
  if (latestText.includes("unknown") || latestText.includes("not sure")) {
    return [
      "How can I verify that info?",
      "Can you share related details instead?",
      "Where can I ask Klein directly?",
      "What do we know for sure?",
    ];
  }
  return quickReplies.length > 0 ? quickReplies : FALLBACK_SUGGESTED_REPLIES;
}

export function FloatingChat() {
  const [clientId] = useState(() => getOrCreateClientId());
  const [AvatarIcon] = useState(() => pickRandomAvatarIcon());
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => [
    { id: 0, from: "klein", text: pickRandomWelcomeMessage() },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showSuggestedReplies, setShowSuggestedReplies] = useState(true);
  const [isOnContactSection, setIsOnContactSection] = useState(false);
  const [usage, setUsage] = useState<ChatUsage>({
    used: 0,
    remaining: DAILY_MESSAGE_LIMIT,
    limit: DAILY_MESSAGE_LIMIT,
  });
  const [quickReplies, setQuickReplies] = useState<string[]>(FALLBACK_SUGGESTED_REPLIES);
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>(FALLBACK_SUGGESTED_REPLIES);
  const bottomRef = useRef<HTMLDivElement>(null);
  const suggestedRepliesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchQuickReplies().then((replies) => {
      setQuickReplies(replies);
      setSuggestedReplies((prev) => (prev === FALLBACK_SUGGESTED_REPLIES ? replies : prev));
    });
    fetchWelcomeMessages().then((msgs) => {
      setMessages((prev) => {
        if (prev.length === 1 && prev[0].id === 0) {
          const welcome = msgs[Math.floor(Math.random() * msgs.length)];
          return [{ id: 0, from: "klein", text: welcome }];
        }
        return prev;
      });
    });
  }, []);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    setSuggestedReplies(buildSuggestedReplies(messages, quickReplies));
  }, [messages, quickReplies]);

  useEffect(() => {
    const loadUsage = async () => {
      try {
        const response = await fetch(`/api/chat/usage?clientId=${encodeURIComponent(clientId)}`);
        if (!response.ok) return;
        const data = (await response.json()) as { usage?: ChatUsage };
        if (data.usage) setUsage(data.usage);
      } catch {
        // Keep default usage state when usage lookup fails.
      }
    };
    if (open) void loadUsage();
  }, [clientId, open]);

  useEffect(() => {
    const root = document.querySelector("main.flex-1");
    const contactSection = document.getElementById("contact");

    if (!(root instanceof HTMLElement) || !contactSection) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setIsOnContactSection(entry.isIntersecting);
        }
      },
      {
        root,
        threshold: 0.2,
      },
    );

    observer.observe(contactSection);

    return () => observer.disconnect();
  }, []);

  const isAtDailyLimit = usage.remaining <= 0;
  const isNearDailyLimit = usage.used >= 6 && !isAtDailyLimit;

  const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

  const typewriterReply = async (messageId: number, fullText: string) => {
    for (let i = TYPEWRITER_STEP; i <= fullText.length; i += TYPEWRITER_STEP) {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, text: fullText.slice(0, i) } : m))
      );
      await sleep(TYPEWRITER_DELAY_MS);
    }
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, text: fullText } : m))
    );
  };

  const send = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending || isAtDailyLimit) return;

    const userMessage: Message = { id: Date.now(), from: "user", text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          message: trimmed,
          history: messages.map((m) => ({ from: m.from, text: m.text })),
        }),
      });
      const rawBody = await response.text();
      let data: {
        reply?: string;
        actions?: ChatAction[];
        message?: string;
        details?: string;
        usage?: ChatUsage;
      } = {};

      if (rawBody.trim()) {
        try {
          data = JSON.parse(rawBody) as typeof data;
        } catch {
          if (!response.ok) {
            throw new Error(rawBody.trim());
          }

          throw new Error("The AI service returned an invalid response.");
        }
      }

      if (data.usage) setUsage(data.usage);
      if (!response.ok || !data.reply) {
        throw new Error(data.details || data.message || "Failed to fetch AI response.");
      }
      const assistantMessageId = Date.now() + 1;
      setMessages((prev) => [...prev, { id: assistantMessageId, from: "klein", text: "" }]);
      setIsSending(false);
      await typewriterReply(assistantMessageId, data.reply);
      if (data.actions && data.actions.length > 0) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId
              ? { ...m, actions: data.actions, actionsReady: true }
              : m,
          ),
        );
      }
    } catch (error) {
      const errorText =
        error instanceof Error && error.message.trim()
          ? `AI service error: ${error.message}`
          : "I could not connect to the AI service right now. Please try again.";
      setMessages((prev) => [...prev, { id: Date.now() + 1, from: "klein", text: errorText }]);
    } finally {
      setIsSending(false);
    }
  };

  const applySuggestedReply = (reply: string) => {
    if (isSending || isAtDailyLimit) return;
    setInput(reply.slice(0, MESSAGE_CHAR_LIMIT));
    setShowSuggestedReplies(false);
  };

  const handleSectionAction = (anchor: string) => {
    const target = document.querySelector(anchor);
    setOpen(false);
    setShowSuggestedReplies(false);

    requestAnimationFrame(() => {
      if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.button
              key="chat-backdrop"
              type="button"
              aria-label="Close chat backdrop"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px]"
            />

            {/* ── Chat panel — size unchanged: 340/380px wide, 400px max-height ── */}
            <motion.div
              key="chat-panel"
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed bottom-24 right-5 sm:right-8 z-50 w-[340px] sm:w-[380px] flex flex-col rounded-2xl overflow-hidden
                         shadow-[0_24px_60px_-12px_rgba(0,0,0,0.4)]
                         border
                         bg-[#f6fcf8] border-[#c6e2cc]/70
                         dark:bg-[#0d1a10] dark:border-[#1e3a23]/80"
              style={{ maxHeight: "400px" }}
              onClick={(e) => {
                if (!showSuggestedReplies) return;
                if (suggestedRepliesRef.current?.contains(e.target as Node)) return;
                setShowSuggestedReplies(false);
              }}
            >
              {/* ── Header ── */}
              <div className="flex items-center justify-between px-4 py-3 shrink-0
                              bg-primary border-b border-primary/20">
                <div className="flex items-center gap-2.5">
                  {/* Avatar ring */}
                  <div className="relative">
                    <div className="absolute -inset-0.5 rounded-full bg-white/20 blur-sm" />
                    <div className="relative w-8 h-8 rounded-full bg-white/15 border border-white/30 flex items-center justify-center text-primary-foreground">
                      <AvatarIcon size={15} />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-primary-foreground/60 leading-none mb-0.5 tracking-wide uppercase">
                      Chat with
                    </p>
                    <p className="text-[13px] font-bold text-primary-foreground leading-none">
                      Klein's Chatbot
                    </p>
                  </div>
                </div>
                {/* Online indicator + close */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span className="text-[9px] font-semibold text-white/80 uppercase tracking-wider">Live</span>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-primary-foreground/60 hover:text-primary-foreground hover:bg-white/15 transition-all duration-150"
                    aria-label="Close chat"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* ── Messages ── */}
              <div className="flex-1 overflow-y-auto px-3.5 py-3.5 space-y-2.5 custom-scrollbar
                              bg-[#f0faf3]
                              dark:bg-[#0a1510]">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.16 }}
                    className={`flex items-end gap-2 ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.from === "klein" ? (
                      <>
                        {/* Bot avatar dot */}
                        <div className="w-5 h-5 rounded-full shrink-0 self-start mt-0.5 flex items-center justify-center
                                        bg-primary/15 border border-primary/25 text-primary
                                        dark:bg-primary/20 dark:border-primary/30">
                          <AvatarIcon size={10} />
                        </div>
                        <div className="flex flex-col gap-1.5 min-w-0 max-w-[80%]">
                          {/* Bot text bubble */}
                          <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-[4px] border text-[13px] leading-relaxed
                                          bg-white border-[#c8e2ce]/80 text-[#1a2e1e]
                                          dark:bg-[#162219] dark:border-[#2a4530]/70 dark:text-[#d4edd9]">
                            {renderMessageContent(msg.text)}
                          </div>
                          {/* Action buttons — appear after typewriter finishes */}
                          {msg.actionsReady && msg.actions && msg.actions.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.22, ease: "easeOut" }}
                              className="flex flex-wrap gap-1.5"
                            >
                              {msg.actions.map((action, actionIndex) =>
                                action.kind === "external" ? (
                                  <motion.a
                                    key={action.url}
                                    href={action.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.24, ease: "easeOut", delay: actionIndex * 0.05 }}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold
                                               bg-white border border-[#c0dcc6] text-[#2d5c38]
                                               hover:bg-[#e8f5ec] hover:border-[#35d361]/60
                                               dark:bg-[#162219] dark:border-[#2a4530] dark:text-[#a8d8b4]
                                               dark:hover:bg-[#1e2e20] dark:hover:border-[#35d361]/40
                                               transition-all duration-150 shadow-sm"
                                    data-testid={`chat-action-external-${action.label.toLowerCase().replace(/\s+/g, "-")}`}
                                  >
                                    <ExternalLink size={10} className="shrink-0" />
                                    {action.label}
                                  </motion.a>
                                ) : (
                                  <motion.a
                                    key={action.url}
                                    href={action.url}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleSectionAction(action.url);
                                    }}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.24, ease: "easeOut", delay: actionIndex * 0.05 }}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold
                                               bg-primary/10 border border-primary/25 text-primary
                                               hover:bg-primary/20 hover:border-primary/40
                                               dark:bg-primary/15 dark:border-primary/30 dark:text-primary
                                               dark:hover:bg-primary/25 dark:hover:border-primary/50
                                               transition-all duration-150 shadow-sm"
                                    data-testid={`chat-action-section-${action.label.toLowerCase().replace(/\s+/g, "-")}`}
                                  >
                                    <ArrowRight size={10} className="shrink-0" />
                                    {action.label}
                                  </motion.a>
                                ),
                              )}
                            </motion.div>
                          )}
                        </div>
                      </>
                    ) : (
                      /* User bubble */
                      <div className="max-w-[80%] px-3.5 py-2 rounded-2xl rounded-br-[4px] text-[13px] leading-relaxed
                                      bg-primary text-primary-foreground shadow-sm shadow-primary/20">
                        {msg.text}
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Typing indicator */}
                {isSending && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.16 }}
                    className="flex items-end gap-2 justify-start"
                  >
                    <div className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center
                                    bg-primary/15 border border-primary/25 text-primary
                                    dark:bg-primary/20 dark:border-primary/30">
                      <AvatarIcon size={10} />
                    </div>
                    <div className="px-4 py-2.5 rounded-2xl rounded-bl-[4px] border
                                    bg-white border-[#c8e2ce]/80
                                    dark:bg-[#162219] dark:border-[#2a4530]/70">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce [animation-delay:0ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce [animation-delay:130ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce [animation-delay:260ms]" />
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* ── Footer / Input area ── */}
              <div className="shrink-0 px-3.5 py-3 border-t
                              bg-[#f6fcf8] border-[#c6e2cc]/60
                              dark:bg-[#0d1a10] dark:border-[#1e3a23]/70">
                {/* Suggested replies */}
                <div ref={suggestedRepliesRef}>
                  <div className="mb-1.5">
                    <button
                      onClick={() => setShowSuggestedReplies((v) => !v)}
                      className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider
                                 text-[#5a8a65] hover:text-[#35d361]
                                 dark:text-[#4a7a54] dark:hover:text-[#35d361]
                                 transition-colors"
                      aria-label="Toggle suggested replies"
                    >
                      <motion.span
                        initial={false}
                        animate={{ rotate: showSuggestedReplies ? 0 : 180 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center"
                      >
                        <ChevronUp size={12} />
                      </motion.span>
                      Quick replies
                    </button>
                  </div>

                  <AnimatePresence initial={false}>
                    {showSuggestedReplies && (
                      <motion.div
                        key="suggested-replies"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="mb-2 flex flex-wrap gap-1.5">
                          {suggestedReplies.map((reply) => (
                            <button
                              key={reply}
                              onClick={() => applySuggestedReply(reply)}
                              disabled={isSending || isAtDailyLimit}
                              className="rounded-full px-2.5 py-1 text-[11px] border transition-all duration-150
                                         bg-white border-[#c0dcc6] text-[#2d5c38] hover:bg-[#e8f5ec] hover:border-[#35d361]/50
                                         dark:bg-[#162219] dark:border-[#2a4530] dark:text-[#a8d8b4] dark:hover:bg-[#1e2e20] dark:hover:border-[#35d361]/40
                                         disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {reply}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Usage + char count */}
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[10px] font-medium text-[#6a9a72] dark:text-[#4a7a54]">
                      {usage.remaining}/{usage.limit} messages left today
                    </p>
                    <p className="text-[10px] text-[#8aaa90] dark:text-[#3a5a3e]">
                      {input.length}/{MESSAGE_CHAR_LIMIT}
                    </p>
                  </div>

                  {isNearDailyLimit && (
                    <p className="mb-1.5 text-[11px] text-amber-600 dark:text-amber-400">
                      You're close to your daily message limit.
                    </p>
                  )}
                  {isAtDailyLimit && (
                    <p className="mb-1.5 text-[11px] text-red-500 dark:text-red-400">{DAILY_LIMIT_MESSAGE}</p>
                  )}
                </div>

                {/* Input row */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value.slice(0, MESSAGE_CHAR_LIMIT))}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder={
                      isAtDailyLimit ? "Daily limit reached" : isSending ? "Thinking..." : "Type a message..."
                    }
                    disabled={isSending || isAtDailyLimit}
                    maxLength={MESSAGE_CHAR_LIMIT}
                    className="flex-1 rounded-xl px-3.5 py-2 text-sm border transition-all duration-150
                               bg-white border-[#c0dcc6] text-[#1a2e1e] placeholder:text-[#8aaa90]
                               focus:outline-none focus:border-[#35d361]/60 focus:ring-1 focus:ring-[#35d361]/25
                               dark:bg-[#162219] dark:border-[#2a4530] dark:text-[#d4edd9] dark:placeholder:text-[#4a6a50]
                               dark:focus:border-[#35d361]/50 dark:focus:ring-[#35d361]/15
                               disabled:opacity-50"
                  />
                  <button
                    onClick={send}
                    disabled={!input.trim() || isSending || isAtDailyLimit}
                    className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground
                               hover:bg-primary/85 active:scale-95
                               shadow-sm shadow-primary/30
                               disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-150 shrink-0"
                    aria-label="Send message"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Floating trigger button ── */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "fixed bottom-5 right-5 sm:right-8 z-50 flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition-colors border",
          isOnContactSection
            ? "bg-card text-primary border-card-border hover:bg-card dark:bg-card dark:text-primary dark:border-card-border"
            : "bg-primary text-primary-foreground border-primary/30 hover:bg-primary/90",
        )}
        style={{
          boxShadow: isOnContactSection
            ? "0 8px 28px hsl(var(--foreground) / 0.18)"
            : "0 4px 24px hsl(var(--primary) / 0.45)",
        }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={16} />
            </motion.span>
          ) : (
            <motion.span
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle size={16} />
            </motion.span>
          )}
        </AnimatePresence>
        Ask Me
      </motion.button>
    </>
  );
}
