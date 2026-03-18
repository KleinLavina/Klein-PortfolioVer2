import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MessageCircle,
  Send,
  ChevronUp,
  Bot,
  UserRound,
  Sparkles,
  Cpu,
} from "lucide-react";
import { useAIChat } from "@/hooks/use-ai-chat";

type Message = {
  id: number;
  from: "user" | "klein";
  text: string;
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

const WELCOME_MESSAGES = [
  "Welcome. I am Klein's AI assistant. How can I help today?",
  "Hi there. Welcome to Klein's portfolio chat.",
  "Glad you are here. Ask me anything about Klein's work.",
  "Welcome in. I can help with projects, skills, and contact details.",
  "Hello. This is Klein's assistant. What would you like to know?",
];

const DEFAULT_SUGGESTED_REPLIES = [
  "Can you introduce Klein?",
  "Show me recent projects.",
  "What skills does Klein have?",
  "How can I contact Klein?",
];

const AVATAR_ICONS = [Bot, UserRound, Sparkles, Cpu];

function pickRandomWelcomeMessage(): string {
  return WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)];
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

function buildSuggestedReplies(messages: Message[]): string[] {
  const latest = messages[messages.length - 1];
  if (!latest) return DEFAULT_SUGGESTED_REPLIES;

  const latestText = latest.text.toLowerCase();
  const recentText = messages.slice(-5).map((m) => m.text.toLowerCase()).join(" ");

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
  return DEFAULT_SUGGESTED_REPLIES;
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
  const [usage, setUsage] = useState<ChatUsage>({
    used: 0,
    remaining: DAILY_MESSAGE_LIMIT,
    limit: DAILY_MESSAGE_LIMIT,
  });
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>(DEFAULT_SUGGESTED_REPLIES);
  const bottomRef = useRef<HTMLDivElement>(null);
  const suggestedRepliesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    setSuggestedReplies(buildSuggestedReplies(messages));
  }, [messages]);

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
      const data = (await response.json()) as {
        reply?: string;
        message?: string;
        details?: string;
        usage?: ChatUsage;
      };
      if (data.usage) setUsage(data.usage);
      if (!response.ok || !data.reply) {
        throw new Error(data.message || data.details || "Failed to fetch AI response.");
      }
      const assistantMessageId = Date.now() + 1;
      setMessages((prev) => [...prev, { id: assistantMessageId, from: "klein", text: "" }]);
      setIsSending(false);
      await typewriterReply(assistantMessageId, data.reply);
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
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
            />

            {/* Chat panel — size unchanged: 340/380px wide, 400px max-height */}
            <motion.div
              key="chat-panel"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed bottom-24 right-5 sm:right-8 z-50 w-[340px] sm:w-[380px] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-border/30 bg-card dark:bg-card"
              style={{ maxHeight: "400px" }}
              onClick={(e) => {
                if (!showSuggestedReplies) return;
                if (suggestedRepliesRef.current?.contains(e.target as Node)) return;
                setShowSuggestedReplies(false);
              }}
            >
              {/* ── Header ── */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-primary/20 bg-primary shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-primary-foreground">
                    <AvatarIcon size={16} />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-primary-foreground/75 leading-none mb-0.5">Chat with</p>
                    <p className="text-sm font-bold text-primary-foreground leading-none">Klein's Chatbot</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/15 transition-all duration-150"
                  aria-label="Close chat"
                >
                  <X size={15} />
                </button>
              </div>

              {/* ── Messages ── */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-background dark:bg-background/80 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className={`flex items-end gap-2 ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.from === "klein" && (
                      <div className="w-6 h-6 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 flex items-center justify-center text-primary shrink-0">
                        <AvatarIcon size={12} />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        msg.from === "user"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted dark:bg-muted/60 text-foreground border border-border/30 dark:border-border/20 rounded-bl-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}

                {/* Typing indicator */}
                {isSending && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className="flex justify-start"
                  >
                    <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-muted dark:bg-muted/60 border border-border/30 dark:border-border/20 shadow-sm">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:120ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:240ms]" />
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* ── Footer / Input area ── */}
              <div className="shrink-0 px-4 py-3 border-t border-border/40 bg-card dark:bg-card/90 backdrop-blur-md">
                {/* Suggested replies */}
                <div ref={suggestedRepliesRef}>
                  <div className="mb-2">
                    <button
                      onClick={() => setShowSuggestedReplies((v) => !v)}
                      className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Toggle suggested replies"
                    >
                      <motion.span
                        initial={false}
                        animate={{ rotate: showSuggestedReplies ? 0 : 180 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center"
                      >
                        <ChevronUp size={13} />
                      </motion.span>
                      Suggested replies
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
                        <div className="mb-2.5 flex flex-wrap gap-1.5">
                          {suggestedReplies.map((reply) => (
                            <button
                              key={reply}
                              onClick={() => applySuggestedReply(reply)}
                              disabled={isSending || isAtDailyLimit}
                              className="rounded-full border border-border/50 bg-muted/50 dark:bg-muted/30 px-2.5 py-1 text-[11px] text-foreground hover:bg-muted dark:hover:bg-muted/60 hover:border-border disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
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
                    <p className="text-[11px] font-medium text-muted-foreground">
                      {usage.remaining}/{usage.limit} messages left today
                    </p>
                    <p className="text-[11px] text-muted-foreground/60">
                      {input.length}/{MESSAGE_CHAR_LIMIT}
                    </p>
                  </div>

                  {isNearDailyLimit && (
                    <p className="mb-2 text-[11px] text-amber-500 dark:text-amber-400">
                      You're close to your daily message limit.
                    </p>
                  )}
                  {isAtDailyLimit && (
                    <p className="mb-2 text-[11px] text-red-500 dark:text-red-400">{DAILY_LIMIT_MESSAGE}</p>
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
                    className="flex-1 bg-muted/40 dark:bg-muted/20 border border-border/40 rounded-xl px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 focus:bg-muted/60 dark:focus:bg-muted/30 disabled:opacity-50 transition-all duration-150"
                  />
                  <button
                    onClick={send}
                    disabled={!input.trim() || isSending || isAtDailyLimit}
                    className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/85 active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-150 shrink-0"
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
        className="fixed bottom-5 right-5 sm:right-8 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-lg hover:bg-primary/90 transition-colors"
        style={{ boxShadow: "0 4px 24px hsl(var(--primary) / 0.4)" }}
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
