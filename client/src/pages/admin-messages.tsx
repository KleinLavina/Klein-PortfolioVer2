import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Loader2,
  Mail,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";

import { toast } from "@/hooks/use-toast";

const SESSION_KEY = "admin_token";
const PAGE_SIZE = 20;

type ContactSubmissionStatus = "unread" | "read" | "replied";

type ContactSubmission = {
  id: number;
  fullName: string;
  email: string;
  message: string;
  status: ContactSubmissionStatus;
  createdAt: string;
  readAt?: string | null;
  repliedAt?: string | null;
  updatedAt: string;
};

function normalizeSubmissionsPayload(payload: unknown): ContactSubmission[] {
  if (Array.isArray(payload)) {
    return payload as ContactSubmission[];
  }

  if (payload && typeof payload === "object") {
    const candidate = (payload as { submissions?: unknown }).submissions;
    if (Array.isArray(candidate)) {
      return candidate as ContactSubmission[];
    }
  }

  return [];
}

function extractNotifyEmailValue(payload: unknown): string {
  if (payload && typeof payload === "object" && "value" in payload) {
    const value = (payload as { value?: unknown }).value;
    return typeof value === "string" ? value : "";
  }

  return "";
}

async function apiFetch<T>(url: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });
  const contentType = res.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    throw new Error(
      typeof data === "object" && data && "message" in data
        ? String((data as { message?: string }).message ?? "Request failed.")
        : "Request failed.",
    );
  }

  return data as T;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function truncateMessage(message: string, expanded: boolean) {
  if (expanded || message.length <= 160) return message;
  return `${message.slice(0, 160).trimEnd()}...`;
}

function StatusBadge({ status }: { status: ContactSubmissionStatus }) {
  const classes =
    status === "unread"
      ? "border-amber-500/25 bg-amber-500/10 text-amber-500"
      : status === "read"
        ? "border-sky-500/25 bg-sky-500/10 text-sky-500"
        : "border-emerald-500/25 bg-emerald-500/10 text-emerald-500";

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${classes}`}>
      {status}
    </span>
  );
}

export function AdminMessagesPanel({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [filterStatus, setFilterStatus] = useState<"all" | ContactSubmissionStatus>("all");
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifyDraft, setNotifyDraft] = useState("");
  const [isEditingNotifyEmail, setIsEditingNotifyEmail] = useState(false);
  const [savingNotifyEmail, setSavingNotifyEmail] = useState(false);

  const load = useCallback(
    async (currentToken: string) => {
      setLoading(true);
      setError(null);
      try {
        const [submissionPayload, notifyEmailPayload] = await Promise.all([
          apiFetch<unknown>("/api/contact/submissions", {}, currentToken),
          apiFetch<unknown>("/api/admin/settings/notify-email", {}, currentToken),
        ]);
        const normalizedSubmissions = normalizeSubmissionsPayload(submissionPayload);
        const notifyValue = extractNotifyEmailValue(notifyEmailPayload);
        setSubmissions(normalizedSubmissions);
        setNotifyEmail(notifyValue);
        setNotifyDraft(notifyValue);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load messages.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void load(token);
  }, [load, token]);

  const filteredSubmissions = useMemo(() => {
    const needle = searchValue.trim().toLowerCase();
    const submissionList = normalizeSubmissionsPayload(submissions);
    return submissionList.filter((submission) => {
      const statusMatch = filterStatus === "all" ? true : submission.status === filterStatus;
      const searchMatch =
        needle.length === 0 ||
        submission.fullName.toLowerCase().includes(needle) ||
        submission.email.toLowerCase().includes(needle);
      return statusMatch && searchMatch;
    });
  }, [filterStatus, searchValue, submissions]);

  const totalPages = Math.max(1, Math.ceil(filteredSubmissions.length / PAGE_SIZE));
  const visibleSubmissions = filteredSubmissions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [filterStatus, searchValue]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const patchStatus = useCallback(
    async (submissionId: number, status: ContactSubmissionStatus) => {
      const updated = await apiFetch<ContactSubmission>(
        `/api/contact/submissions/${submissionId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        },
        token,
      );
      setSubmissions((prev) =>
        normalizeSubmissionsPayload(prev).map((item) => (item.id === updated.id ? updated : item)),
      );
      setSelectedSubmission((prev) => (prev?.id === updated.id ? updated : prev));
      return updated;
    },
    [token],
  );

  const openSubmission = async (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    if (submission.status === "unread") {
      try {
        await patchStatus(submission.id, "read");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update status.");
      }
    }
  };

  const handleDelete = async (submission: ContactSubmission) => {
    if (!window.confirm(`Delete message from ${submission.fullName}?`)) return;

    try {
      await apiFetch(
        `/api/contact/submissions/${submission.id}`,
        { method: "DELETE" },
        token,
      );
      setSubmissions((prev) =>
        normalizeSubmissionsPayload(prev).filter((item) => item.id !== submission.id),
      );
      if (selectedSubmission?.id === submission.id) {
        setSelectedSubmission(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete submission.");
    }
  };

  const handleSaveNotifyEmail = async () => {
    const email = notifyDraft.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid notification email.");
      return;
    }

    setSavingNotifyEmail(true);
    setError(null);
    try {
      const updated = await apiFetch<{ value: string }>(
        "/api/admin/settings/notify-email",
        {
          method: "PATCH",
          body: JSON.stringify({ value: email }),
        },
        token,
      );
      setNotifyEmail(updated.value);
      setNotifyDraft(updated.value);
      setIsEditingNotifyEmail(false);
      toast({
        title: "Notification email updated.",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update notification email.");
    } finally {
      setSavingNotifyEmail(false);
    }
  };

  return (
    <>
      <div className="mb-8 rounded-[28px] border border-[hsl(var(--card-border))] bg-card/65 p-5 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Messages Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Review contact form submissions, update statuses, and manage delivery settings.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm text-muted-foreground">
            <div className="flex flex-wrap items-center gap-2">
              <span>Notification emails are being sent to:</span>
              {isEditingNotifyEmail ? (
                <>
                  <input
                    value={notifyDraft}
                    onChange={(event) => setNotifyDraft(event.target.value)}
                    className="min-w-[16rem] rounded-xl border border-border bg-background px-3 py-1.5 text-foreground outline-none focus:border-primary/40"
                  />
                  <button
                    type="button"
                    onClick={handleSaveNotifyEmail}
                    disabled={savingNotifyEmail}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/85"
                  >
                    {savingNotifyEmail ? "Saving..." : "Save"}
                  </button>
                </>
              ) : (
                <>
                  <span className="font-semibold text-foreground">{notifyEmail || "Not configured"}</span>
                  <button
                    type="button"
                    onClick={() => setIsEditingNotifyEmail(true)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary"
                  >
                    <Pencil size={12} />
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {(["all", "unread", "read", "replied"] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilterStatus(status)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-all ${
                filterStatus === status
                  ? "border-primary/30 bg-primary/12 text-primary"
                  : "border-border bg-card/50 text-muted-foreground hover:border-primary/20 hover:text-foreground"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-sm">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search by name or email"
            className="w-full rounded-xl border border-border bg-card/60 py-2.5 pl-9 pr-3 text-sm text-foreground outline-none focus:border-primary/30"
          />
        </div>
      </div>

      {loading ? (
        <div className="rounded-[28px] border border-[hsl(var(--card-border))] bg-card/60 px-6 py-14 shadow-2xl">
          <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 size={28} className="animate-spin text-primary" />
            <p className="text-sm">Loading messages...</p>
          </div>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-[28px] border border-dashed border-border bg-card/45 px-6 py-20 text-center text-muted-foreground">
          <Inbox size={42} className="text-muted-foreground/35" />
          <div>
            <p className="text-base font-semibold text-foreground">No messages found</p>
            <p className="mt-1 text-sm">New contact submissions will appear here once visitors start sending them.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {visibleSubmissions.map((submission) => {
              const isExpanded = expandedIds.has(submission.id);
              return (
                <div
                  key={submission.id}
                  className="rounded-[28px] border border-[hsl(var(--card-border))] bg-card/60 p-5 shadow-xl backdrop-blur-xl transition-all hover:border-primary/20"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => void openSubmission(submission)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          void openSubmission(submission);
                        }
                      }}
                      className="min-w-0 flex-1 cursor-pointer"
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-base font-bold text-foreground">{submission.fullName}</p>
                        <StatusBadge status={submission.status} />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{submission.email}</p>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setExpandedIds((prev) => {
                            const next = new Set(prev);
                            if (next.has(submission.id)) next.delete(submission.id);
                            else next.add(submission.id);
                            return next;
                          });
                        }}
                        className="mt-4 block text-left text-sm leading-7 text-foreground/85"
                      >
                        {truncateMessage(submission.message, isExpanded)}
                        {submission.message.length > 160 ? (
                          <span className="ml-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                            {isExpanded ? "Collapse" : "Expand"}
                          </span>
                        ) : null}
                      </button>
                    </div>

                    <div className="flex items-center gap-3 lg:flex-col lg:items-end">
                      <p className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
                        {formatDateTime(submission.createdAt)}
                      </p>
                      <button
                        type="button"
                        onClick={() => void handleDelete(submission)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/15"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 ? (
            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/60 px-4 py-2 text-sm font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={14} />
                Previous
              </button>
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/60 px-4 py-2 text-sm font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          ) : null}
        </>
      )}

      <AnimatePresence>
        {selectedSubmission ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-background/70 px-4 py-8 backdrop-blur-sm"
            onClick={() => setSelectedSubmission(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              className="w-full max-w-2xl rounded-[32px] border border-[hsl(var(--card-border))] bg-card p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-bold text-foreground">{selectedSubmission.fullName}</h2>
                    <StatusBadge status={selectedSubmission.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedSubmission.email}</p>
                  <p className="mt-2 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
                    {formatDateTime(selectedSubmission.createdAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
                >
                  Close
                </button>
              </div>

              <div className="mt-6 rounded-2xl border border-border bg-background/55 p-5">
                <p className="whitespace-pre-wrap text-sm leading-7 text-foreground">{selectedSubmission.message}</p>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                {selectedSubmission.status !== "replied" ? (
                  <button
                    type="button"
                    onClick={() => void patchStatus(selectedSubmission.id, "replied")}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85"
                  >
                    <CheckCircle2 size={14} />
                    Mark as replied
                  </button>
                ) : null}
                {selectedSubmission.status === "unread" ? (
                  <button
                    type="button"
                    onClick={() => void patchStatus(selectedSubmission.id, "read")}
                    className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground"
                  >
                    Mark as read
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => void handleDelete(selectedSubmission)}
                  className="inline-flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/15"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export default function AdminMessagesPage() {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (!stored) {
      setLocation("/klein/admin");
      return;
    }

    apiFetch("/api/admin/verify", {}, stored)
      .then(() => {
        setToken(stored);
      })
      .catch(() => {
        sessionStorage.removeItem(SESSION_KEY);
        setLocation("/klein/admin");
      })
      .finally(() => {
        setVerifying(false);
      });
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-background text-foreground font-[Urbanist,sans-serif]">
      <header className="sticky top-0 z-30 border-b border-[hsl(var(--border))] bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5">
          <button
            type="button"
            onClick={() => setLocation("/klein/admin/")}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft size={13} />
            Back to dashboard
          </button>
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-primary/30 bg-primary/15 text-primary">
              <Mail size={14} />
            </div>
            <span className="text-sm font-bold text-foreground">Admin Messages</span>
            <span className="hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/60 sm:inline">
              /klein/admin/messages
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 py-8">
        {verifying || !token ? (
          <div className="rounded-[28px] border border-[hsl(var(--card-border))] bg-card/60 px-6 py-14 shadow-2xl">
            <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 size={28} className="animate-spin text-primary" />
              <p className="text-sm">Loading messages...</p>
            </div>
          </div>
        ) : (
          <AdminMessagesPanel token={token} />
        )}
      </main>
    </div>
  );
}
