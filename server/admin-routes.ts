import type { Express, Request, Response, NextFunction } from "express";
import { sqlite } from "./db";
import { db } from "./db";
import { chatbotContent } from "@shared/schema";
import { eq, asc } from "drizzle-orm";
import { z } from "zod";
import { randomBytes } from "crypto";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin";
const SESSION_TTL_SECONDS = 60 * 60 * 24;

const SEED_CONTENT = [
  {
    category: "system_prompt",
    label: "Main system prompt",
    content:
      "You are Klein's portfolio AI assistant. Answer only about Klein's work, projects, skills, achievements, services, and contact process. When the user asks for portfolio facts, prefer calling tools instead of guessing. If data is unavailable, say so clearly and keep the response concise.",
    isActive: true,
    sortOrder: 0,
  },
  {
    category: "welcome_message",
    label: "Welcome 1",
    content: "Welcome. I am Klein's AI assistant. How can I help today?",
    isActive: true,
    sortOrder: 0,
  },
  {
    category: "welcome_message",
    label: "Welcome 2",
    content: "Hi there. Welcome to Klein's portfolio chat.",
    isActive: true,
    sortOrder: 1,
  },
  {
    category: "welcome_message",
    label: "Welcome 3",
    content: "Glad you are here. Ask me anything about Klein's work.",
    isActive: true,
    sortOrder: 2,
  },
  {
    category: "welcome_message",
    label: "Welcome 4",
    content: "Welcome in. I can help with projects, skills, and contact details.",
    isActive: true,
    sortOrder: 3,
  },
  {
    category: "welcome_message",
    label: "Welcome 5",
    content: "Hello. This is Klein's assistant. What would you like to know?",
    isActive: true,
    sortOrder: 4,
  },
  {
    category: "quick_reply",
    label: "Introduce Klein",
    content: "Can you introduce Klein?",
    isActive: true,
    sortOrder: 0,
  },
  {
    category: "quick_reply",
    label: "Recent projects",
    content: "Show me recent projects.",
    isActive: true,
    sortOrder: 1,
  },
  {
    category: "quick_reply",
    label: "Skills",
    content: "What skills does Klein have?",
    isActive: true,
    sortOrder: 2,
  },
  {
    category: "quick_reply",
    label: "Contact",
    content: "How can I contact Klein?",
    isActive: true,
    sortOrder: 3,
  },
  {
    category: "context_reply_project",
    label: "Most recent project",
    content: "Which project is most recent?",
    isActive: true,
    sortOrder: 0,
  },
  {
    category: "context_reply_project",
    label: "Tech stack used",
    content: "What tech stack was used?",
    isActive: true,
    sortOrder: 1,
  },
  {
    category: "context_reply_project",
    label: "Live demo link",
    content: "Do you have a live demo link?",
    isActive: true,
    sortOrder: 2,
  },
  {
    category: "context_reply_project",
    label: "GitHub repo",
    content: "Can you share a GitHub repo?",
    isActive: true,
    sortOrder: 3,
  },
  {
    category: "context_reply_skills",
    label: "Strongest skill",
    content: "What is Klein strongest at?",
    isActive: true,
    sortOrder: 0,
  },
  {
    category: "context_reply_skills",
    label: "Backend experience",
    content: "Any backend experience?",
    isActive: true,
    sortOrder: 1,
  },
  {
    category: "context_reply_skills",
    label: "Full-stack",
    content: "Can Klein build full-stack apps?",
    isActive: true,
    sortOrder: 2,
  },
  {
    category: "context_reply_skills",
    label: "Daily tools",
    content: "What tools does Klein use daily?",
    isActive: true,
    sortOrder: 3,
  },
  {
    category: "context_reply_contact",
    label: "Best way to reach",
    content: "What is the best way to reach Klein?",
    isActive: true,
    sortOrder: 0,
  },
  {
    category: "context_reply_contact",
    label: "Project inquiry",
    content: "Can I send a project inquiry?",
    isActive: true,
    sortOrder: 1,
  },
  {
    category: "context_reply_contact",
    label: "What to include",
    content: "What details should I include?",
    isActive: true,
    sortOrder: 2,
  },
  {
    category: "context_reply_contact",
    label: "Reply speed",
    content: "How quickly does Klein reply?",
    isActive: true,
    sortOrder: 3,
  },
];

export async function seedChatbotContent() {
  const existing = await db.select().from(chatbotContent).limit(1);
  if (existing.length > 0) return;
  await db.insert(chatbotContent).values(SEED_CONTENT);
  console.log(`[admin] Seeded ${SEED_CONTENT.length} chatbot content entries.`);
}

function createSession(): string {
  const token = randomBytes(32).toString("hex");
  const now = Math.floor(Date.now() / 1000);
  sqlite
    .prepare(
      "INSERT INTO admin_sessions (token, created_at, expires_at) VALUES (?, ?, ?)",
    )
    .run(token, now, now + SESSION_TTL_SECONDS);
  return token;
}

function validateSession(token: string): boolean {
  const now = Math.floor(Date.now() / 1000);
  sqlite
    .prepare("DELETE FROM admin_sessions WHERE expires_at < ?")
    .run(now);
  const row = sqlite
    .prepare("SELECT token FROM admin_sessions WHERE token = ? AND expires_at >= ?")
    .get(token, now) as { token: string } | undefined;
  return Boolean(row);
}

function destroySession(token: string): void {
  sqlite.prepare("DELETE FROM admin_sessions WHERE token = ?").run(token);
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || !validateSession(token)) {
    return res.status(401).json({ message: "Unauthorized." });
  }
  next();
}

const loginSchema = z.object({ password: z.string().min(1) });
const createSchema = z.object({
  category: z.string().min(1).max(64),
  label: z.string().min(1).max(128),
  content: z.string().min(1),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
});
const updateSchema = createSchema.partial();

export function registerAdminRoutes(app: Express) {
  app.post("/api/admin/login", (req, res) => {
    try {
      const { password } = loginSchema.parse(req.body);
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Incorrect password." });
      }
      const token = createSession();
      return res.json({ token });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.post("/api/admin/logout", requireAdmin, (req, res) => {
    const auth = req.headers.authorization ?? "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    destroySession(token);
    return res.json({ ok: true });
  });

  app.get("/api/admin/verify", requireAdmin, (_req, res) => {
    return res.json({ ok: true });
  });

  app.get("/api/admin/chatbot-content", requireAdmin, async (_req, res) => {
    const rows = await db
      .select()
      .from(chatbotContent)
      .orderBy(asc(chatbotContent.category), asc(chatbotContent.sortOrder));
    return res.json(rows);
  });

  app.post("/api/admin/chatbot-content", requireAdmin, async (req, res) => {
    try {
      const data = createSchema.parse(req.body);
      const [row] = await db
        .insert(chatbotContent)
        .values(data)
        .returning();
      return res.status(201).json(row);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put("/api/admin/chatbot-content/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid id." });
      const data = updateSchema.parse(req.body);
      const [row] = await db
        .update(chatbotContent)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(chatbotContent.id, id))
        .returning();
      if (!row) return res.status(404).json({ message: "Not found." });
      return res.json(row);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete("/api/admin/chatbot-content/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid id." });
    await db.delete(chatbotContent).where(eq(chatbotContent.id, id));
    return res.json({ ok: true });
  });

  app.get("/api/chatbot/quick-replies", async (_req, res) => {
    const rows = await db
      .select()
      .from(chatbotContent)
      .orderBy(asc(chatbotContent.sortOrder));
    const replies = rows
      .filter((r) => r.category === "quick_reply" && r.isActive)
      .map((r) => r.content);
    return res.json(replies);
  });

  app.get("/api/chatbot/welcome-messages", async (_req, res) => {
    const rows = await db
      .select()
      .from(chatbotContent)
      .orderBy(asc(chatbotContent.sortOrder));
    const msgs = rows
      .filter((r) => r.category === "welcome_message" && r.isActive)
      .map((r) => r.content);
    return res.json(msgs);
  });
}

export async function getActiveSystemPrompt(): Promise<string> {
  const rows = await db.select().from(chatbotContent);
  const row = rows.find((r) => r.category === "system_prompt" && r.isActive);
  return (
    row?.content ??
    "You are Klein's portfolio AI assistant. Answer only about Klein's work, projects, skills, achievements, services, and contact process. When the user asks for portfolio facts, prefer calling tools instead of guessing. If data is unavailable, say so clearly and keep the response concise."
  );
}

export async function getContextReplies(context: string): Promise<string[]> {
  const rows = await db.select().from(chatbotContent).orderBy(asc(chatbotContent.sortOrder));
  return rows
    .filter((r) => r.category === `context_reply_${context}` && r.isActive)
    .map((r) => r.content);
}
