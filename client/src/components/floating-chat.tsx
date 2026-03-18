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
  const index = Math.floor(Math.random() * WELCOME_MESSAGES.length);
  return WELCOME_MESSAGES[index];
}

function pickRandomAvatarIcon() {
  const index = Math.floor(Math.random() * AVATAR_ICONS.length);
  return AVATAR_ICONS[index];
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
  const recentText = messages
    .slice(-5)
    .map((message) => message.text.toLowerCase())
    .join(" ");

  if (recentText.includes("project")) {
    return [
      "Which project is most recent?",
      "What tech stack was used?",
      "Do you have a live demo link?",
      "Can you share a GitHub repo?",
    ];
  }

  if (
    recentText.includes("skill") ||
    recentText.includes("stack") ||
    recentText.includes("technology")
  ) {
    return [
      "What is Klein strongest at?",
      "Any backend experience?",
      "Can Klein build full-stack apps?",
      "What tools does Klein use daily?",
    ];
  }

  if (
    recentText.includes("contact") ||
    recentText.includes("email") ||
    recentText.includes("hire")
  ) {
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
    {
      id: 0,
      from: "klein",
      text: pickRandomWelcomeMessage(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showSuggestedReplies, setShowSuggestedReplies] = useState(true);
  const [usage, setUsage] = useState<ChatUsage>({
    used: 0,
    remaining: DAILY_MESSAGE_LIMIT,
    limit: DAILY_MESSAGE_LIMIT,
  });
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>(
    DEFAULT_SUGGESTED_REPLIES,
  );
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
        const response = await fetch(
          `/api/chat/usage?clientId=${encodeURIComponent(clientId)}`,
        );
        if (!response.ok) return;
        const data = (await response.json()) as { usage?: ChatUsage };
        if (data.usage) setUsage(data.usage);
      } catch {
        // Keep default usage state when usage lookup fails.
      }
    };

    if (open) {
      void loadUsage();
    }
  }, [clientId, open]);

  const isAtDailyLimit = usage.remaining <= 0;
  const isNearDailyLimit = usage.used >= 6 && !isAtDailyLimit;

  const sleep = (ms: number) =>
    new Promise<void>((resolve) => {
      setTimeout(resolve, ms);
    });

  const typewriterReply = async (messageId: number, fullText: string) => {
    for (let index = TYPEWRITER_STEP; index <= fullText.length; index += TYPEWRITER_STEP) {
      const nextText = fullText.slice(0, index);
      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId ? { ...message, text: nextText } : message,
        ),
      );
      await sleep(TYPEWRITER_DELAY_MS);
    }

    setMessages((prev) =>
      prev.map((message) =>
        message.id === messageId ? { ...message, text: fullText } : message,
      ),
    );
  };

  const send = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending || isAtDailyLimit) return;

    const userMessage: Message = { id: Date.now(), from: "user", text: trimmed };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId,
          message: trimmed,
          history: messages.map((msg) => ({ from: msg.from, text: msg.text })),
        }),
      });

      const data = (await response.json()) as {
        reply?: string;
        message?: string;
        details?: string;
        usage?: ChatUsage;
      };
      if (data.usage) {
        setUsage(data.usage);
      }
      if (!response.ok || !data.reply) {
        throw new Error(data.message || data.details || "Failed to fetch AI response.");
      }
      const reply = data.reply;
      const assistantMessageId = Date.now() + 1;

      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          from: "klein",
          text: "",
        },
      ]);
      setIsSending(false);
      await typewriterReply(assistantMessageId, reply);
    } catch (error) {
      const fallbackError = "I could not connect to the AI service right now. Please try again.";
      const errorText =
        error instanceof Error && error.message.trim()
          ? `AI service error: ${error.message}`
          : fallbackError;

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: "klein",
          text: errorText,
        },
      ]);
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
            <motion.div
              key="chat-panel"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed bottom-24 right-5 sm:right-8 z-50 w-[340px] sm:w-[380px] flex flex-col rounded-2xl border border-border/40 bg-card/80 backdrop-blur-2xl shadow-2xl overflow-hidden"
              style={{ maxHeight: "400px" }}
              onClick={(e) => {
                if (!showSuggestedReplies) return;
                const target = e.target as Node;
                if (suggestedRepliesRef.current?.contains(target)) return;
                setShowSuggestedReplies(false);
              }}
            >
            <div
              className="flex items-center justify-between px-5 py-3.5 border-b border-primary/35 bg-primary shrink-0"
              style={{ boxShadow: "0 8px 20px hsl(var(--primary) / 0.25)" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary-foreground/15 border border-primary-foreground/35 flex items-center justify-center text-primary-foreground">
                  <AvatarIcon size={18} />
                </div>
                <div>
                  <p className="text-[12px] font-medium text-primary-foreground/80 leading-tight">
                    Chat with
                  </p>
                  <p className="text-base font-bold text-primary-foreground leading-tight">
                    Klein's Chatbot
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/15 transition-colors"
                aria-label="Close chat"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 custom-scrollbar bg-white/95">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-end gap-2 ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.from === "klein" && (
                    <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                      <AvatarIcon size={14} />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.from === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted/60 text-foreground border border-border/20 rounded-bl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isSending && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex justify-start"
                >
                  <div className="max-w-[80%] px-3.5 py-2.5 rounded-2xl rounded-bl-sm bg-muted/60 text-foreground border border-border/20">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/80 animate-pulse" />
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/80 animate-pulse [animation-delay:120ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/80 animate-pulse [animation-delay:240ms]" />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="shrink-0 px-4 py-3 border-t border-border/30 bg-slate-50/95 backdrop-blur-md">
              <div ref={suggestedRepliesRef}>
              <div className="mb-2">
                <button
                  onClick={() => setShowSuggestedReplies((value) => !value)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Toggle suggested replies"
                >
                  <motion.span
                    initial={false}
                    animate={{ rotate: showSuggestedReplies ? 0 : 180 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center"
                  >
                    <ChevronUp size={14} />
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
                    <div className="mb-2.5 flex flex-wrap gap-2">
                      {suggestedReplies.map((reply) => (
                        <button
                          key={reply}
                          onClick={() => applySuggestedReply(reply)}
                          disabled={isSending || isAtDailyLimit}
                          className="rounded-full border border-border/40 bg-muted/40 px-3 py-1.5 text-xs text-foreground hover:bg-muted/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="mb-2 flex items-center justify-between text-xs">
                <p className="font-medium text-foreground">
                  {usage.remaining}/{usage.limit} messages left today
                </p>
                <p className="text-muted-foreground">
                  {input.length}/{MESSAGE_CHAR_LIMIT}
                </p>
              </div>
              {isNearDailyLimit && (
                <p className="mb-2 text-xs text-amber-600">
                  Warning: You are close to your daily chat limit.
                </p>
              )}
              {isAtDailyLimit && (
                <p className="mb-2 text-xs text-red-600">{DAILY_LIMIT_MESSAGE}</p>
              )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) =>
                    setInput(e.target.value.slice(0, MESSAGE_CHAR_LIMIT))
                  }
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder={
                    isAtDailyLimit
                      ? "Daily limit reached"
                      : isSending
                        ? "Thinking..."
                        : "Type a message..."
                  }
                  disabled={isSending || isAtDailyLimit}
                  maxLength={MESSAGE_CHAR_LIMIT}
                  className="flex-1 bg-muted/40 border border-border/30 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-muted/60 transition-colors"
                />
                <button
                  onClick={send}
                  disabled={!input.trim() || isSending || isAtDailyLimit}
                  className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 shrink-0"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-5 right-5 sm:right-8 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-lg hover:bg-primary/90 transition-colors"
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
              <X size={17} />
            </motion.span>
          ) : (
            <motion.span
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle size={17} />
            </motion.span>
          )}
        </AnimatePresence>
        Ask Me
      </motion.button>
    </>
  );
}
