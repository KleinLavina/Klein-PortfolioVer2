import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, Plus, Pencil, Trash2, Check, X, ChevronDown,
  ShieldCheck, Eye, EyeOff, LayoutDashboard, MessageSquare,
  ToggleLeft, ToggleRight, Loader2, AlertTriangle,
} from "lucide-react";

const SESSION_KEY = "admin_token";

type View = "login" | "dashboard";

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

const BLANK_FORM: FormData = {
  category: "quick_reply",
  label: "",
  content: "",
  isActive: true,
  sortOrder: 0,
};

const CATEGORIES = [
  { value: "system_prompt", label: "System Prompt" },
  { value: "welcome_message", label: "Welcome Message" },
  { value: "quick_reply", label: "Quick Reply" },
  { value: "context_reply_project", label: "Context Reply — Project" },
  { value: "context_reply_skills", label: "Context Reply — Skills" },
  { value: "context_reply_contact", label: "Context Reply — Contact" },
];

const CATEGORY_COLORS: Record<string, string> = {
  system_prompt: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  welcome_message: "bg-secondary/15 text-secondary border-secondary/30",
  quick_reply: "bg-primary/15 text-primary border-primary/30",
  context_reply_project: "bg-accent/15 text-accent border-accent/30",
  context_reply_skills: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  context_reply_contact: "bg-pink-500/15 text-pink-400 border-pink-500/30",
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

async function apiFetch<T>(
  url: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error((data as { message?: string }).message ?? "Request failed.");
  return data as T;
}

export default function AdminPage() {
  const [view, setView] = useState<View>("login");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (!stored) return;
    apiFetch("/api/admin/verify", {}, stored)
      .then(() => { setToken(stored); setView("dashboard"); })
      .catch(() => sessionStorage.removeItem(SESSION_KEY));
  }, []);

  const handleLogin = (t: string) => {
    sessionStorage.setItem(SESSION_KEY, t);
    setToken(t);
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
    <div className="min-h-screen bg-background text-foreground font-[Urbanist,sans-serif]">
      <AnimatePresence mode="wait">
        {view === "login" ? (
          <LoginView key="login" onLogin={handleLogin} />
        ) : (
          <DashboardView key="dashboard" token={token!} onLogout={handleLogout} />
        )}
      </AnimatePresence>
    </div>
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
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Klein Portfolio
                </p>
                <h1 className="text-lg font-bold text-foreground leading-tight">Admin Panel</h1>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              This area is restricted. Enter the admin password to continue.
            </p>
          </div>

          <form onSubmit={submit} className="px-8 py-7 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Password
              </label>
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<{ mode: "create" | "edit"; item?: ContentItem } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContentItem | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<ContentItem[]>("/api/admin/chatbot-content", {}, token);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

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
    setModal(null);
  };

  const filtered = filterCategory === "all" ? items : items.filter((i) => i.category === filterCategory);
  const categories = ["all", ...Array.from(new Set(items.map((i) => i.category)))];

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
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <MessageSquare size={18} className="text-primary" />
              Chatbot Content
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage AI chatbot scripts, quick replies, and system prompts.
            </p>
          </div>
          <button
            onClick={() => setModal({ mode: "create" })}
            className="flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-4 py-2 text-sm font-bold hover:bg-primary/85 active:scale-[0.98] transition-all shrink-0 shadow-sm shadow-primary/20"
          >
            <Plus size={14} />
            New Entry
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
            <AlertTriangle size={14} className="shrink-0" />
            {error}
          </div>
        )}

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
            <p className="text-sm">Loading entries…</p>
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
                          onClick={() => setModal({ mode: "edit", item })}
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
      </main>

      <AnimatePresence>
        {modal && (
          <ContentModal
            mode={modal.mode}
            item={modal.item}
            token={token}
            onClose={() => setModal(null)}
            onSave={handleSave}
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
            {mode === "create" ? "New Entry" : "Edit Entry"}
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
              placeholder={form.category === "system_prompt" ? "Full system instruction text…" : "Message or reply text…"}
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
              {loading ? "Saving…" : "Save"}
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
            <button
              onClick={onCancel}
              className="flex-1 rounded-xl border border-border bg-muted/30 text-foreground py-2.5 text-sm font-semibold hover:bg-muted transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-destructive text-destructive-foreground rounded-xl py-2.5 text-sm font-bold hover:bg-destructive/85 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Trash2 size={13} />
              Delete
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
