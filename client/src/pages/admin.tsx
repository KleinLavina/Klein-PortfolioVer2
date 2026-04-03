import { Component, useState, useEffect, useCallback, type ErrorInfo, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  ManagedPortfolioMemorySection,
  PortfolioMemorySection,
} from "@shared/portfolio-memory";
import {
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  ChevronDown,
  ShieldCheck,
  Eye,
  EyeOff,
  LayoutDashboard,
  MessageSquare,
  ToggleLeft,
  ToggleRight,
  Loader2,
  AlertTriangle,
  Database,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

const SESSION_KEY = "admin_token";

type View = "login" | "dashboard";
type AdminPanel = "memory" | "scripts";

type ContentItem = {
  id: number;
  category: string;
  label: string;
  content: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string | number;
  updatedAt: string | number;
};

type FormData = {
  category: string;
  label: string;
  content: string;
  isActive: boolean;
  sortOrder: number;
};

type MemoryFormData = {
  sectionId: string;
  title: string;
  eyebrow: string;
  summary: string;
  context: string;
  accent: PortfolioMemorySection["accent"];
  isActive: boolean;
  sortOrder: number;
  factsText: string;
  itemsText: string;
  linksText: string;
};

const BLANK_FORM: FormData = {
  category: "quick_reply",
  label: "",
  content: "",
  isActive: true,
  sortOrder: 0,
};

const BLANK_MEMORY_FORM: MemoryFormData = {
  sectionId: "",
  title: "",
  eyebrow: "",
  summary: "",
  context: "",
  accent: "primary",
  isActive: true,
  sortOrder: 0,
  factsText: "",
  itemsText: "",
  linksText: "",
};

const CATEGORIES = [
  { value: "system_prompt", label: "System Prompt" },
  { value: "welcome_message", label: "Welcome Message" },
  { value: "quick_reply", label: "Quick Reply" },
  { value: "context_reply_project", label: "Context Reply - Project" },
  { value: "context_reply_skills", label: "Context Reply - Skills" },
  { value: "context_reply_contact", label: "Context Reply - Contact" },
];

const CATEGORY_COLORS: Record<string, string> = {
  system_prompt: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  welcome_message: "bg-secondary/15 text-secondary border-secondary/30",
  quick_reply: "bg-primary/15 text-primary border-primary/30",
  context_reply_project: "bg-accent/15 text-accent border-accent/30",
  context_reply_skills: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  context_reply_contact: "bg-pink-500/15 text-pink-400 border-pink-500/30",
};

const SECTION_REDIRECT_MAP: Record<string, { anchor: string; label: string }> = {
  identity: { anchor: "#home", label: "View Home" },
  about: { anchor: "#about", label: "View About" },
  values: { anchor: "#about", label: "View About" },
  "technical-skills": { anchor: "#skills", label: "View Skills" },
  "soft-skills": { anchor: "#skills", label: "View Skills" },
  projects: { anchor: "#projects", label: "View Projects" },
  contact: { anchor: "#contact", label: "View Contact" },
};

const MEMORY_ACCENTS: Record<
  PortfolioMemorySection["accent"],
  { chip: string; border: string; glow: string; text: string }
> = {
  primary: {
    chip: "bg-primary/15 text-primary border-primary/25",
    border: "border-primary/20",
    glow: "from-primary/18 via-primary/5 to-transparent",
    text: "text-primary",
  },
  secondary: {
    chip: "bg-secondary/15 text-secondary border-secondary/25",
    border: "border-secondary/20",
    glow: "from-secondary/20 via-secondary/5 to-transparent",
    text: "text-secondary",
  },
  accent: {
    chip: "bg-accent/15 text-accent border-accent/25",
    border: "border-accent/20",
    glow: "from-accent/18 via-accent/5 to-transparent",
    text: "text-accent",
  },
};

function getCategoryLabel(value: string) {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

function getCategoryBadge(category: string) {
  const color = CATEGORY_COLORS[category] ?? "bg-muted text-muted-foreground border-border";
  return (
    <span className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${color}`}>
      {getCategoryLabel(category)}
    </span>
  );
}

async function apiFetch<T>(url: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error((data as { message?: string }).message ?? "Request failed.");
  return data as T;
}

function toFactsText(section: ManagedPortfolioMemorySection) {
  return (section.facts ?? []).map((fact) => `${fact.label} | ${fact.value}`).join("\n");
}

function toLinksText(section: ManagedPortfolioMemorySection) {
  return (section.links ?? []).map((link) => `${link.label} | ${link.url}`).join("\n");
}

function toItemsText(section: ManagedPortfolioMemorySection) {
  return (section.items ?? []).join("\n");
}

function parseFactsText(input: string) {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split("|").map((part) => part.trim());
      return { label, value: rest.join(" | ").trim() };
    })
    .filter((fact) => fact.label && fact.value);
}

function parseLinksText(input: string) {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split("|").map((part) => part.trim());
      return { label, url: rest.join(" | ").trim() };
    })
    .filter((link) => link.label && link.url);
}

function parseItemsText(input: string) {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

class AdminErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Admin page render error:", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <div className="max-w-2xl mx-auto rounded-3xl border border-destructive/30 bg-destructive/10 p-6 shadow-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-destructive">Admin Crash</p>
          <h1 className="mt-2 text-2xl font-black text-foreground">The admin page hit a runtime error.</h1>
          <p className="mt-3 text-sm text-muted-foreground">{this.state.error.message}</p>
          <pre className="mt-4 overflow-auto rounded-2xl border border-border bg-background/80 p-4 text-xs text-muted-foreground whitespace-pre-wrap">
            {this.state.error.stack}
          </pre>
        </div>
      </div>
    );
  }
}

export default function AdminPage() {
  const [view, setView] = useState<View>("login");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.add("admin-mode");
    return () => document.documentElement.classList.remove("admin-mode");
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (!stored) return;
    apiFetch("/api/admin/verify", {}, stored)
      .then(() => {
        setToken(stored);
        setView("dashboard");
      })
      .catch(() => sessionStorage.removeItem(SESSION_KEY));
  }, []);

  const handleLogin = (value: string) => {
    sessionStorage.setItem(SESSION_KEY, value);
    setToken(value);
    setView("dashboard");
  };

  const handleLogout = async () => {
    if (token) {
      await apiFetch("/api/admin/logout", { method: "POST" }, token).catch(() => {});
      sessionStorage.removeItem(SESSION_KEY);
    }
    setToken(null);
    setView("login");
  };

  return (
    <AdminErrorBoundary>
      <div className="min-h-screen bg-background text-foreground font-[Urbanist,sans-serif]">
        <AnimatePresence mode="wait">
          {view === "login" ? (
            <LoginView key="login" onLogin={handleLogin} />
          ) : (
            <DashboardView key="dashboard" token={token!} onLogout={handleLogout} />
          )}
        </AnimatePresence>
      </div>
    </AdminErrorBoundary>
  );
}

function LoginView({ onLogin }: { onLogin: (token: string) => void }) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token } = await apiFetch<{ token: string }>("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      onLogin(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center px-4"
    >
      <div className="w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-[hsl(var(--card-border))] bg-card shadow-2xl overflow-hidden"
        >
          <div className="px-8 pt-8 pb-6 border-b border-[hsl(var(--card-border))] bg-primary/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Klein Portfolio</p>
                <h1 className="text-lg font-bold text-foreground leading-tight">Admin Panel</h1>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              This area is restricted. Enter the admin password to continue.
            </p>
          </div>

          <form onSubmit={submit} className="px-8 py-7 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Password</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  autoFocus
                  required
                  className="w-full rounded-xl border border-[hsl(var(--border))] bg-background px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2"
                >
                  <AlertTriangle size={14} className="shrink-0" />
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-bold hover:bg-primary/85 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
              {loading ? "Verifying..." : "Log in"}
            </button>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}

function DashboardView({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [memorySections, setMemorySections] = useState<ManagedPortfolioMemorySection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<AdminPanel>("memory");
  const [scriptModal, setScriptModal] = useState<{ mode: "create" | "edit"; item?: ContentItem } | null>(null);
  const [memoryModal, setMemoryModal] = useState<{ mode: "create" | "edit"; item?: ManagedPortfolioMemorySection } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContentItem | null>(null);
  const [memoryDeleteTarget, setMemoryDeleteTarget] = useState<ManagedPortfolioMemorySection | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [contentData, memoryData] = await Promise.all([
        apiFetch<ContentItem[]>("/api/admin/chatbot-content", {}, token),
        apiFetch<ManagedPortfolioMemorySection[]>("/api/admin/portfolio-memory", {}, token),
      ]);
      setItems(contentData);
      setMemorySections(memoryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleToggleActive = async (item: ContentItem) => {
    try {
      const updated = await apiFetch<ContentItem>(
        `/api/admin/chatbot-content/${item.id}`,
        { method: "PUT", body: JSON.stringify({ isActive: !item.isActive }) },
        token,
      );
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Toggle failed.");
    }
  };

  const handleDelete = async (item: ContentItem) => {
    try {
      await apiFetch(`/api/admin/chatbot-content/${item.id}`, { method: "DELETE" }, token);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    }
  };

  const handleSave = (saved: ContentItem) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
    setScriptModal(null);
  };

  const handleMemorySave = (saved: ManagedPortfolioMemorySection) => {
    setMemorySections((prev) => {
      const idx = prev.findIndex((section) => section.recordId === saved.recordId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next.sort((a, b) => a.order - b.order || a.recordId - b.recordId);
      }
      return [...prev, saved].sort((a, b) => a.order - b.order || a.recordId - b.recordId);
    });
    setMemoryModal(null);
  };

  const handleMemoryToggleActive = async (item: ManagedPortfolioMemorySection) => {
    try {
      const updated = await apiFetch<ManagedPortfolioMemorySection>(
        `/api/admin/portfolio-memory/${item.recordId}`,
        { method: "PUT", body: JSON.stringify({ isActive: !item.isActive }) },
        token,
      );
      setMemorySections((prev) => prev.map((section) => (
        section.recordId === updated.recordId ? updated : section
      )));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Toggle failed.");
    }
  };

  const handleMemoryDelete = async (item: ManagedPortfolioMemorySection) => {
    try {
      await apiFetch(`/api/admin/portfolio-memory/${item.recordId}`, { method: "DELETE" }, token);
      setMemorySections((prev) => prev.filter((section) => section.recordId !== item.recordId));
      setMemoryDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    }
  };

  const filtered = filterCategory === "all" ? items : items.filter((i) => i.category === filterCategory);
  const categories = ["all", ...Array.from(new Set(items.map((i) => i.category)))];
  const activeMemoryCount = memorySections.filter((section) => section.isActive).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col"
    >
      <header className="sticky top-0 z-30 border-b border-[hsl(var(--border))] bg-card/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
              <LayoutDashboard size={14} />
            </div>
            <span className="text-sm font-bold text-foreground">Admin CMS</span>
            <span className="hidden sm:inline text-[10px] text-muted-foreground/60 font-mono px-1.5 py-0.5 rounded bg-muted border border-border">
              /klein/admin/
            </span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted"
          >
            <LogOut size={13} />
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-5 py-8">
        <div className="mb-8 rounded-[28px] border border-[hsl(var(--card-border))] bg-card/65 p-3 shadow-2xl backdrop-blur-xl">
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => setActivePanel("memory")}
              className={`rounded-[22px] border px-5 py-4 text-left transition-all ${
                activePanel === "memory"
                  ? "border-primary/30 bg-primary/12 shadow-[0_20px_40px_-24px_hsl(var(--primary)/0.55)]"
                  : "border-border bg-background/50 hover:border-primary/20 hover:bg-background/80"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center text-primary">
                  <Database size={18} />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">Portfolio Memory</div>
                  <div className="text-xs text-muted-foreground">Ordered context, identity, projects, and contact details.</div>
                </div>
              </div>
            </button>
            <button
              onClick={() => setActivePanel("scripts")}
              className={`rounded-[22px] border px-5 py-4 text-left transition-all ${
                activePanel === "scripts"
                  ? "border-primary/30 bg-primary/12 shadow-[0_20px_40px_-24px_hsl(var(--primary)/0.55)]"
                  : "border-border bg-background/50 hover:border-primary/20 hover:bg-background/80"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-secondary/15 border border-secondary/25 flex items-center justify-center text-secondary">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">AI Scripts</div>
                  <div className="text-xs text-muted-foreground">System prompt, welcome lines, and quick reply behavior.</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
            <AlertTriangle size={14} className="shrink-0" />
            {error}
          </div>
        )}

        {activePanel === "memory" ? (
          <>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Database size={18} className="text-primary" />
                  Portfolio Memory
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Manage the structured memory that describes KleinLavina with order and context.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatPill label="Sections" value={String(memorySections.length)} />
                <StatPill label="Active" value={String(activeMemoryCount)} />
                <button
                  onClick={() => setMemoryModal({ mode: "create" })}
                  className="flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-4 py-2 text-sm font-bold hover:bg-primary/85 active:scale-[0.98] transition-all shrink-0 shadow-sm shadow-primary/20"
                >
                  <Plus size={14} />
                  New Section
                </button>
              </div>
            </div>

            {loading ? (
              <div className="rounded-[28px] border border-[hsl(var(--card-border))] bg-card/60 px-6 py-14 shadow-2xl">
                <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                  <Loader2 size={28} className="animate-spin text-primary" />
                  <p className="text-sm">Loading portfolio memory...</p>
                </div>
              </div>
            ) : memorySections.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
                <Database size={32} className="text-muted-foreground/30" />
                <p className="text-sm">No portfolio memory sections yet.</p>
              </div>
            ) : (
              <PortfolioMemoryBoard
                sections={memorySections}
                onEdit={(section) => setMemoryModal({ mode: "edit", item: section })}
                onDelete={setMemoryDeleteTarget}
                onToggleActive={handleMemoryToggleActive}
              />
            )}
          </>
        ) : (
          <>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <MessageSquare size={18} className="text-primary" />
                  AI Scripts
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Manage chatbot prompts, welcome scripts, and quick replies that sit on top of the portfolio memory layer.
                </p>
              </div>
              <button
                onClick={() => setScriptModal({ mode: "create" })}
                className="flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-4 py-2 text-sm font-bold hover:bg-primary/85 active:scale-[0.98] transition-all shrink-0 shadow-sm shadow-primary/20"
              >
                <Plus size={14} />
                New Entry
              </button>
            </div>

            <div className="mb-4 flex items-center gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full border transition-all ${
                    filterCategory === cat
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {cat === "all" ? `All (${items.length})` : `${getCategoryLabel(cat)} (${items.filter((i) => i.category === cat).length})`}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
                <Loader2 size={28} className="animate-spin text-primary" />
                <p className="text-sm">Loading entries...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
                <MessageSquare size={32} className="text-muted-foreground/30" />
                <p className="text-sm">No entries yet. Create one above.</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-[hsl(var(--card-border))] overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[hsl(var(--border))] bg-muted/40">
                      <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Label / Category</th>
                      <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3 hidden md:table-cell">Content</th>
                      <th className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3 w-16">Active</th>
                      <th className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3 w-14">Order</th>
                      <th className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3 w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[hsl(var(--border))]">
                    {filtered.map((item) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`group hover:bg-muted/20 transition-colors ${!item.isActive ? "opacity-50" : ""}`}
                      >
                        <td className="px-4 py-3">
                          <p className="font-semibold text-foreground text-[13px] mb-1">{item.label}</p>
                          {getCategoryBadge(item.category)}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="text-[13px] text-muted-foreground line-clamp-2 max-w-xs">{item.content}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleToggleActive(item)}
                            className={`transition-colors ${item.isActive ? "text-primary hover:text-primary/70" : "text-muted-foreground hover:text-foreground"}`}
                            title={item.isActive ? "Deactivate" : "Activate"}
                          >
                            {item.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-[12px] font-mono text-muted-foreground">{item.sortOrder}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setScriptModal({ mode: "edit", item })}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                              title="Edit"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(item)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>

      <AnimatePresence>
        {memoryModal && (
          <PortfolioMemoryModal
            mode={memoryModal.mode}
            item={memoryModal.item}
            token={token}
            onClose={() => setMemoryModal(null)}
            onSave={handleMemorySave}
          />
        )}
        {scriptModal && (
          <ContentModal
            mode={scriptModal.mode}
            item={scriptModal.item}
            token={token}
            onClose={() => setScriptModal(null)}
            onSave={handleSave}
          />
        )}
        {memoryDeleteTarget && (
          <PortfolioMemoryDeleteConfirm
            item={memoryDeleteTarget}
            onCancel={() => setMemoryDeleteTarget(null)}
            onConfirm={() => handleMemoryDelete(memoryDeleteTarget)}
          />
        )}
        {deleteTarget && (
          <DeleteConfirm
            item={deleteTarget}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={() => handleDelete(deleteTarget)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ContentModal({
  mode,
  item,
  token,
  onClose,
  onSave,
}: {
  mode: "create" | "edit";
  item?: ContentItem;
  token: string;
  onClose: () => void;
  onSave: (item: ContentItem) => void;
}) {
  const [form, setForm] = useState<FormData>(
    item
      ? { category: item.category, label: item.label, content: item.content, isActive: item.isActive, sortOrder: item.sortOrder }
      : BLANK_FORM,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof FormData, value: string | boolean | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const saved = await apiFetch<ContentItem>(
        mode === "create" ? "/api/admin/chatbot-content" : `/api/admin/chatbot-content/${item!.id}`,
        { method: mode === "create" ? "POST" : "PUT", body: JSON.stringify(form) },
        token,
      );
      onSave(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-[hsl(var(--border))] bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg bg-card border border-[hsl(var(--card-border))] rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border))] bg-muted/30">
          <h3 className="font-bold text-foreground text-base">
            {mode === "create" ? "New AI Script Entry" : "Edit AI Script Entry"}
          </h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Category</label>
            <div className="relative">
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className={`${inputCls} appearance-none pr-8`}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Label</label>
            <input
              type="text"
              value={form.label}
              onChange={(e) => set("label", e.target.value)}
              placeholder="Short descriptive label"
              required
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Content</label>
            <textarea
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              placeholder={form.category === "system_prompt" ? "Full system instruction text..." : "Message or reply text..."}
              required
              rows={form.category === "system_prompt" ? 6 : 3}
              className={`${inputCls} resize-none`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Sort Order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => set("sortOrder", parseInt(e.target.value, 10) || 0)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Status</label>
              <button
                type="button"
                onClick={() => set("isActive", !form.isActive)}
                className={`w-full h-10 rounded-xl border flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                  form.isActive
                    ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                    : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {form.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                {form.isActive ? "Active" : "Inactive"}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2"
              >
                <AlertTriangle size={14} className="shrink-0" />
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border bg-muted/30 text-foreground py-2.5 text-sm font-semibold hover:bg-muted transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-bold hover:bg-primary/85 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function PortfolioMemoryModal({
  mode,
  item,
  token,
  onClose,
  onSave,
}: {
  mode: "create" | "edit";
  item?: ManagedPortfolioMemorySection;
  token: string;
  onClose: () => void;
  onSave: (item: ManagedPortfolioMemorySection) => void;
}) {
  const [form, setForm] = useState<MemoryFormData>(
    item
      ? {
          sectionId: item.id,
          title: item.title,
          eyebrow: item.eyebrow,
          summary: item.summary,
          context: item.context,
          accent: item.accent,
          isActive: item.isActive,
          sortOrder: item.order,
          factsText: toFactsText(item),
          itemsText: toItemsText(item),
          linksText: toLinksText(item),
        }
      : BLANK_MEMORY_FORM,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputCls =
    "w-full rounded-xl border border-[hsl(var(--border))] bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all";

  const set = (key: keyof MemoryFormData, value: string | boolean | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      sectionId: form.sectionId.trim(),
      title: form.title.trim(),
      eyebrow: form.eyebrow.trim(),
      summary: form.summary.trim(),
      context: form.context.trim(),
      accent: form.accent,
      isActive: form.isActive,
      sortOrder: form.sortOrder,
      facts: parseFactsText(form.factsText),
      items: parseItemsText(form.itemsText),
      links: parseLinksText(form.linksText),
    };

    try {
      const saved = await apiFetch<ManagedPortfolioMemorySection>(
        mode === "create" ? "/api/admin/portfolio-memory" : `/api/admin/portfolio-memory/${item!.recordId}`,
        { method: mode === "create" ? "POST" : "PUT", body: JSON.stringify(payload) },
        token,
      );
      onSave(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-3xl bg-card border border-[hsl(var(--card-border))] rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border))] bg-muted/30">
          <h3 className="font-bold text-foreground text-base">
            {mode === "create" ? "New Portfolio Memory Section" : "Edit Portfolio Memory Section"}
          </h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-4 max-h-[78vh] overflow-y-auto">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Section ID</label>
              <input
                type="text"
                value={form.sectionId}
                onChange={(e) => set("sectionId", e.target.value)}
                placeholder="identity, about, projects..."
                required
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Eyebrow</label>
              <input
                type="text"
                value={form.eyebrow}
                onChange={(e) => set("eyebrow", e.target.value)}
                placeholder="Portfolio Snapshot"
                required
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Section title"
              required
              className={inputCls}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Accent</label>
              <div className="relative">
                <select
                  value={form.accent}
                  onChange={(e) => set("accent", e.target.value as PortfolioMemorySection["accent"])}
                  className={`${inputCls} appearance-none pr-8`}
                >
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                  <option value="accent">Accent</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Sort Order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => set("sortOrder", parseInt(e.target.value, 10) || 0)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Status</label>
              <button
                type="button"
                onClick={() => set("isActive", !form.isActive)}
                className={`w-full h-10 rounded-xl border flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                  form.isActive
                    ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                    : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {form.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                {form.isActive ? "Active" : "Inactive"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Summary</label>
            <textarea
              value={form.summary}
              onChange={(e) => set("summary", e.target.value)}
              placeholder="Short overview of what this section explains"
              required
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Context</label>
            <textarea
              value={form.context}
              onChange={(e) => set("context", e.target.value)}
              placeholder="Why this section matters and when the AI should use it"
              required
              rows={4}
              className={`${inputCls} resize-none`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Facts</label>
            <textarea
              value={form.factsText}
              onChange={(e) => set("factsText", e.target.value)}
              placeholder={`Role | Fresh Graduate / Full Stack Developer\nLocation | Philippines`}
              rows={4}
              className={`${inputCls} font-mono text-xs resize-none`}
            />
            <p className="mt-1 text-[11px] text-muted-foreground">One fact per line. Format: `Label | Value`</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Items</label>
            <textarea
              value={form.itemsText}
              onChange={(e) => set("itemsText", e.target.value)}
              placeholder="One detail per line"
              rows={6}
              className={`${inputCls} font-mono text-xs resize-none`}
            />
            <p className="mt-1 text-[11px] text-muted-foreground">One detail per line.</p>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
              <ExternalLink size={11} />
              Links — Chat Action Buttons
            </label>
            <textarea
              value={form.linksText}
              onChange={(e) => set("linksText", e.target.value)}
              placeholder={`GitHub | https://github.com/KleinLavina\nFacebook | https://facebook.com/...`}
              rows={4}
              className={`${inputCls} font-mono text-xs resize-none`}
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              One link per line · Format: <code className="font-mono">Label | URL</code> · These appear as clickable action buttons in the chatbot when this section is referenced.
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2"
              >
                <AlertTriangle size={14} className="shrink-0" />
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border bg-muted/30 text-foreground py-2.5 text-sm font-semibold hover:bg-muted transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-bold hover:bg-primary/85 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {loading ? "Saving..." : "Save Section"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function DeleteConfirm({
  item,
  onCancel,
  onConfirm,
}: {
  item: ContentItem;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-sm bg-card border border-[hsl(var(--card-border))] rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="px-6 py-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
              <Trash2 size={18} />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base">Delete Entry?</h3>
              <p className="text-xs text-muted-foreground">This cannot be undone.</p>
            </div>
          </div>
          <div className="rounded-xl bg-muted/40 border border-border px-3 py-2 mb-5">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">{getCategoryLabel(item.category)}</p>
            <p className="text-sm font-semibold text-foreground">{item.label}</p>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{item.content}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 rounded-xl border border-border bg-muted/30 text-foreground py-2.5 text-sm font-semibold hover:bg-muted transition-all">
              Cancel
            </button>
            <button onClick={onConfirm} className="flex-1 bg-destructive text-destructive-foreground rounded-xl py-2.5 text-sm font-bold hover:bg-destructive/85 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              <Trash2 size={13} />
              Delete
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function PortfolioMemoryDeleteConfirm({
  item,
  onCancel,
  onConfirm,
}: {
  item: ManagedPortfolioMemorySection;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-sm bg-card border border-[hsl(var(--card-border))] rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="px-6 py-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
              <Trash2 size={18} />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base">Delete Memory Section?</h3>
              <p className="text-xs text-muted-foreground">This removes it from the portfolio knowledge base.</p>
            </div>
          </div>
          <div className="rounded-xl bg-muted/40 border border-border px-3 py-2 mb-5">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">{item.eyebrow}</p>
            <p className="text-sm font-semibold text-foreground">{item.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{item.id}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 rounded-xl border border-border bg-muted/30 text-foreground py-2.5 text-sm font-semibold hover:bg-muted transition-all">
              Cancel
            </button>
            <button onClick={onConfirm} className="flex-1 bg-destructive text-destructive-foreground rounded-xl py-2.5 text-sm font-bold hover:bg-destructive/85 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              <Trash2 size={13} />
              Delete
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-primary/20 bg-primary/8 px-3 py-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <span className="ml-2 text-sm font-bold text-foreground">{value}</span>
    </div>
  );
}

function PortfolioMemoryBoard({
  sections,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  sections: ManagedPortfolioMemorySection[];
  onEdit: (section: ManagedPortfolioMemorySection) => void;
  onDelete: (section: ManagedPortfolioMemorySection) => void;
  onToggleActive: (section: ManagedPortfolioMemorySection) => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-[hsl(var(--card-border))] bg-card/70 p-5 shadow-2xl backdrop-blur-xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.12),transparent_38%),radial-gradient(circle_at_top_right,hsl(var(--secondary)/0.12),transparent_34%),radial-gradient(circle_at_bottom_right,hsl(var(--accent)/0.12),transparent_40%)]" />
      <div className="relative grid gap-4 lg:grid-cols-2">
        {sections.map((section) => (
          <MemorySectionCard
            key={section.recordId}
            section={section}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleActive={onToggleActive}
          />
        ))}
      </div>
    </div>
  );
}

function MemorySectionCard({
  section,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  section: ManagedPortfolioMemorySection;
  onEdit: (section: ManagedPortfolioMemorySection) => void;
  onDelete: (section: ManagedPortfolioMemorySection) => void;
  onToggleActive: (section: ManagedPortfolioMemorySection) => void;
}) {
  const accent = MEMORY_ACCENTS[section.accent];

  return (
    <div className={`relative overflow-hidden rounded-3xl border bg-background/55 p-5 backdrop-blur-sm ${accent.border} ${!section.isActive ? "opacity-60" : ""}`}>
      <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-br ${accent.glow}`} />
      <div className="relative">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className={`mb-2 inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] ${accent.chip}`}>
              <span>{String(section.order).padStart(2, "0")}</span>
              <span>{section.eyebrow}</span>
            </div>
            <h3 className="text-lg font-black text-foreground">{section.title}</h3>
            <p className="mt-1 text-[11px] font-mono text-muted-foreground">{section.id}</p>
          </div>
          <button
            onClick={() => onToggleActive(section)}
            className={`transition-colors ${section.isActive ? "text-primary hover:text-primary/70" : "text-muted-foreground hover:text-foreground"}`}
            title={section.isActive ? "Deactivate" : "Activate"}
          >
            {section.isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
          </button>
        </div>

        <p className="text-sm leading-relaxed text-foreground/90">{section.summary}</p>
        <p className="mt-3 rounded-2xl border border-border/70 bg-muted/35 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
          {section.context}
        </p>

        {(section.facts ?? []).length > 0 && (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {(section.facts ?? []).map((fact) => (
              <div key={`${section.recordId}-${fact.label}`} className="rounded-2xl border border-border/60 bg-card/60 px-3 py-3">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{fact.label}</div>
                <div className="mt-1 text-sm font-semibold text-foreground">{fact.value}</div>
              </div>
            ))}
          </div>
        )}

        {(section.items ?? []).length > 0 && (
          <div className="mt-4 space-y-2">
            {(section.items ?? []).map((item, index) => (
              <div key={`${section.recordId}-${index}`} className="flex gap-3 rounded-2xl border border-border/50 bg-background/60 px-3 py-3">
                <span className={`mt-0.5 text-xs font-black ${accent.text}`}>+</span>
                <p className="text-sm leading-relaxed text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
        )}

        {(section.links ?? []).length > 0 && (
          <div className="mt-4">
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <ExternalLink size={10} />
              Chat Action Buttons
            </p>
            <div className="flex flex-wrap gap-2">
              {(section.links ?? []).map((link) => (
                <a
                  key={`${section.recordId}-${link.label}-${link.url}`}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[11px] font-semibold transition-all hover:-translate-y-0.5
                             bg-card/60 border-border/70 text-foreground hover:bg-muted"
                >
                  <ExternalLink size={9} className="shrink-0 text-muted-foreground" />
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-border/40 pt-4">
          <div className="flex flex-col gap-1">
            <div className="text-[11px] text-muted-foreground">
              {section.isActive ? "Active in chat memory" : "Inactive"}
            </div>
            {SECTION_REDIRECT_MAP[section.id] && (
              <div className="inline-flex items-center gap-1 text-[10px] font-medium text-primary/70">
                <ArrowRight size={9} />
                Redirects to <span className="font-mono">{SECTION_REDIRECT_MAP[section.id].anchor}</span> in chat
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(section)}
              className="rounded-xl border border-border bg-card/60 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-all"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(section)}
              className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/15 transition-all"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
