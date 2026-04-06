import type { Express, Request, Response, NextFunction } from "express";
import {
  type InsertChatbotContent,
  portfolioMemoryEntryInputSchema,
  updatePortfolioMemoryEntryInputSchema,
} from "../shared/schema.ts";
import { portfolioMemorySections } from "../shared/portfolio-memory.ts";
import { z } from "zod";
import { randomBytes } from "crypto";
import { query, queryOne } from "./db.ts";

const SESSION_TTL_SECONDS = 60 * 60 * 24;
const FALLBACK_SYSTEM_PROMPT =
  "You are Klein F. Lavina's portfolio AI assistant. Answer only about Klein's work, projects, skills, achievements, services, and contact process. When the user asks for portfolio facts, prefer calling tools instead of guessing. If data is unavailable, say so clearly.\n\nRESPONSE FORMAT RULES - follow these exactly:\n1. Write clean, well-structured prose. Separate distinct sections with a blank line. Keep sentences clear and professional.\n2. Never include raw URLs or hyperlinks in your text. Links are rendered automatically as separate action buttons below your reply. Instead, reference them naturally (e.g. \"You can check it below\" or \"See the links below for details\").\n3. For tech stacks, tools, or technologies - list each item using this exact marker syntax: [tech:Name]. Place all tech markers together on their own dedicated line, space-separated. Example line: [tech:React] [tech:TypeScript] [tech:Node.js]\n4. Keep responses concise - aim for 3 to 6 sentences unless a detailed breakdown is explicitly requested.\n5. Always use available portfolio tools when asked for specific facts.";

export function getAdminPassword(): string {
  const configured = process.env.ADMIN_PASSWORD?.trim();
  if (configured) {
    return configured;
  }
  throw new Error("ADMIN_PASSWORD is required.");
}

type ChatbotContentRow = {
  id: number;
  category: string;
  label: string;
  content: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type PortfolioMemoryEntryRow = {
  id: number;
  section_key: string;
  title: string;
  eyebrow: string;
  summary: string;
  context: string;
  accent: "primary" | "secondary" | "accent";
  facts: Array<{ label: string; value: string }>;
  items: string[];
  links: Array<{ label: string; url: string }>;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

const SEED_CONTENT: InsertChatbotContent[] = [
  {
    category: "system_prompt",
    label: "Main system prompt",
    content:
      "You are Klein F. Lavina's portfolio AI assistant. Answer only about Klein's work, projects, skills, achievements, services, and contact process. When the user asks for portfolio facts, prefer calling tools instead of guessing. If data is unavailable, say so clearly.\n\nRESPONSE FORMAT RULES — follow these exactly:\n1. Write clean, well-structured prose. Separate distinct sections with a blank line. Keep sentences clear and professional.\n2. Never include raw URLs or hyperlinks in your text. Links are rendered automatically as separate action buttons below your reply. Instead, reference them naturally (e.g. \"You can check it below\" or \"See the links below for details\").\n3. For tech stacks, tools, or technologies — list each item using this exact marker syntax: [tech:Name]. Place all tech markers together on their own dedicated line, space-separated. Example line: [tech:React] [tech:TypeScript] [tech:Node.js]\n4. Keep responses concise — aim for 3 to 6 sentences unless a detailed breakdown is explicitly requested.\n5. Always use available portfolio tools when asked for specific facts.",
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

function mapChatbotContentRow(row: ChatbotContentRow) {
  return {
    id: row.id,
    category: row.category,
    label: row.label,
    content: row.content,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPortfolioMemoryRow(row: PortfolioMemoryEntryRow) {
  return {
    recordId: row.id,
    id: row.section_key,
    order: row.sort_order,
    title: row.title,
    eyebrow: row.eyebrow,
    summary: row.summary,
    context: row.context,
    accent: row.accent,
    facts: Array.isArray(row.facts) ? row.facts : [],
    items: Array.isArray(row.items) ? row.items : [],
    links: Array.isArray(row.links) ? row.links : [],
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function seedChatbotContent() {
  const existing = await queryOne<{ id: number }>(
    `SELECT id FROM public.chatbot_content LIMIT 1`,
  );

  if (existing) return;

  for (const item of SEED_CONTENT) {
    await query(
      `INSERT INTO public.chatbot_content (category, label, content, is_active, sort_order)
       VALUES ($1, $2, $3, $4, $5)`,
      [item.category, item.label, item.content, item.isActive, item.sortOrder],
    );
  }

  console.log(`[admin] Seeded ${SEED_CONTENT.length} chatbot content entries.`);
}

export async function seedPortfolioMemory() {
  const existing = await queryOne<{ id: number }>(
    `SELECT id FROM public.portfolio_memory_entries LIMIT 1`,
  );

  if (existing) return;

  for (const section of portfolioMemorySections) {
    await query(
      `INSERT INTO public.portfolio_memory_entries
         (section_key, title, eyebrow, summary, context, accent, facts, items, links, is_active, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        section.id,
        section.title,
        section.eyebrow,
        section.summary,
        section.context,
        section.accent,
        JSON.stringify(section.facts ?? []),
        JSON.stringify(section.items ?? []),
        JSON.stringify(section.links ?? []),
        true,
        section.order,
      ],
    );
  }

  console.log(`[admin] Seeded ${portfolioMemorySections.length} portfolio memory sections.`);
}

async function createSession(): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString();

  await query(
    `INSERT INTO public.admin_sessions (token, expires_at) VALUES ($1, $2)`,
    [token, expiresAt],
  );

  return token;
}

async function validateSession(token: string): Promise<boolean> {
  const now = new Date().toISOString();

  await query(`DELETE FROM public.admin_sessions WHERE expires_at < $1`, [now]);

  const row = await queryOne<{ token: string }>(
    `SELECT token FROM public.admin_sessions WHERE token = $1 AND expires_at >= $2`,
    [token, now],
  );

  return Boolean(row?.token);
}

async function destroySession(token: string): Promise<void> {
  await query(`DELETE FROM public.admin_sessions WHERE token = $1`, [token]);
}

function getSingleParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export async function getActiveSystemPrompt(): Promise<string> {
  const row = await queryOne<ChatbotContentRow>(
    `SELECT * FROM public.chatbot_content
     WHERE category = 'system_prompt' AND is_active = true
     ORDER BY sort_order ASC
     LIMIT 1`,
  );

  return row?.content ?? FALLBACK_SYSTEM_PROMPT;
}

export async function getPortfolioMemory(includeInactive = false) {
  let rows: PortfolioMemoryEntryRow[];

  if (includeInactive) {
    rows = await query<PortfolioMemoryEntryRow>(
      `SELECT * FROM public.portfolio_memory_entries
       ORDER BY sort_order ASC, id ASC`,
    );
  } else {
    rows = await query<PortfolioMemoryEntryRow>(
      `SELECT * FROM public.portfolio_memory_entries
       WHERE is_active = true
       ORDER BY sort_order ASC, id ASC`,
    );
  }

  const mapped = rows.map(mapPortfolioMemoryRow).filter((row) => row.id !== "timeline");

  if (mapped.length === 0) {
    const fallback = portfolioMemorySections.map((section, index) => ({
      recordId: index + 1,
      id: section.id,
      order: section.order,
      title: section.title,
      eyebrow: section.eyebrow,
      summary: section.summary,
      context: section.context,
      accent: section.accent,
      facts: section.facts ?? [],
      items: section.items ?? [],
      links: section.links ?? [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    return fallback.filter((r) => r.id !== "timeline");
  }

  return mapped;
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";

  if (!token || !(await validateSession(token))) {
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
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { password } = loginSchema.parse(req.body);
      if (password !== getAdminPassword()) {
        return res.status(401).json({ message: "Incorrect password." });
      }
      const token = await createSession();
      return res.json({ token });
    } catch (err) {
      if (err instanceof Error && err.message.includes("ADMIN_PASSWORD is required")) {
        return res.status(503).json({ message: err.message });
      }
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0]?.message });
      }
      throw err;
    }
  });

  app.post("/api/admin/logout", requireAdmin, async (req, res) => {
    const auth = req.headers.authorization ?? "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    await destroySession(token);
    return res.json({ ok: true });
  });

  app.get("/api/admin/verify", requireAdmin, (_req, res) => {
    return res.json({ ok: true });
  });

  app.get("/api/admin/chatbot-content", requireAdmin, async (_req, res) => {
    const rows = await query<ChatbotContentRow>(
      `SELECT * FROM public.chatbot_content ORDER BY category ASC, sort_order ASC`,
    );
    return res.json(rows.map(mapChatbotContentRow));
  });

  app.get("/api/admin/portfolio-memory", requireAdmin, (_req, res) => {
    return getPortfolioMemory(true).then((rows) => res.json(rows));
  });

  app.post("/api/admin/portfolio-memory", requireAdmin, async (req, res) => {
    try {
      const data = portfolioMemoryEntryInputSchema.parse(req.body);
      const row = await queryOne<PortfolioMemoryEntryRow>(
        `INSERT INTO public.portfolio_memory_entries
           (section_key, title, eyebrow, summary, context, accent, facts, items, links, is_active, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [
          data.sectionId,
          data.title,
          data.eyebrow,
          data.summary,
          data.context,
          data.accent,
          JSON.stringify(data.facts),
          JSON.stringify(data.items),
          JSON.stringify(data.links),
          data.isActive,
          data.sortOrder,
        ],
      );

      if (!row) throw new Error("Failed to create portfolio memory entry: no row returned.");
      return res.status(201).json(mapPortfolioMemoryRow(row));
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0]?.message });
      }
      throw err;
    }
  });

  app.put("/api/admin/portfolio-memory/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(getSingleParam(req.params.id), 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid id." });

      const data = updatePortfolioMemoryEntryInputSchema.parse(req.body);

      const setParts: string[] = [];
      const values: unknown[] = [];
      let idx = 1;

      if (data.sectionId !== undefined) { setParts.push(`section_key = $${idx++}`); values.push(data.sectionId); }
      if (data.title !== undefined) { setParts.push(`title = $${idx++}`); values.push(data.title); }
      if (data.eyebrow !== undefined) { setParts.push(`eyebrow = $${idx++}`); values.push(data.eyebrow); }
      if (data.summary !== undefined) { setParts.push(`summary = $${idx++}`); values.push(data.summary); }
      if (data.context !== undefined) { setParts.push(`context = $${idx++}`); values.push(data.context); }
      if (data.accent !== undefined) { setParts.push(`accent = $${idx++}`); values.push(data.accent); }
      if (data.facts !== undefined) { setParts.push(`facts = $${idx++}`); values.push(JSON.stringify(data.facts)); }
      if (data.items !== undefined) { setParts.push(`items = $${idx++}`); values.push(JSON.stringify(data.items)); }
      if (data.links !== undefined) { setParts.push(`links = $${idx++}`); values.push(JSON.stringify(data.links)); }
      if (data.isActive !== undefined) { setParts.push(`is_active = $${idx++}`); values.push(data.isActive); }
      if (data.sortOrder !== undefined) { setParts.push(`sort_order = $${idx++}`); values.push(data.sortOrder); }

      if (setParts.length === 0) return res.status(400).json({ message: "No fields to update." });

      values.push(id);
      const row = await queryOne<PortfolioMemoryEntryRow>(
        `UPDATE public.portfolio_memory_entries SET ${setParts.join(", ")} WHERE id = $${idx} RETURNING *`,
        values,
      );

      if (!row) return res.status(404).json({ message: "Not found." });
      return res.json(mapPortfolioMemoryRow(row));
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0]?.message });
      }
      throw err;
    }
  });

  app.delete("/api/admin/portfolio-memory/:id", requireAdmin, async (req, res) => {
    const id = parseInt(getSingleParam(req.params.id), 10);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid id." });
    await query(`DELETE FROM public.portfolio_memory_entries WHERE id = $1`, [id]);
    return res.json({ ok: true });
  });

  app.post("/api/admin/chatbot-content", requireAdmin, async (req, res) => {
    try {
      const data = createSchema.parse(req.body);
      const row = await queryOne<ChatbotContentRow>(
        `INSERT INTO public.chatbot_content (category, label, content, is_active, sort_order)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [data.category, data.label, data.content, data.isActive, data.sortOrder],
      );
      if (!row) throw new Error("Failed to create chatbot content: no row returned.");
      return res.status(201).json(mapChatbotContentRow(row));
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0]?.message });
      }
      throw err;
    }
  });

  app.put("/api/admin/chatbot-content/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(getSingleParam(req.params.id), 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid id." });

      const data = updateSchema.parse(req.body);
      const setParts: string[] = [];
      const values: unknown[] = [];
      let idx = 1;

      if (data.category !== undefined) { setParts.push(`category = $${idx++}`); values.push(data.category); }
      if (data.label !== undefined) { setParts.push(`label = $${idx++}`); values.push(data.label); }
      if (data.content !== undefined) { setParts.push(`content = $${idx++}`); values.push(data.content); }
      if (data.isActive !== undefined) { setParts.push(`is_active = $${idx++}`); values.push(data.isActive); }
      if (data.sortOrder !== undefined) { setParts.push(`sort_order = $${idx++}`); values.push(data.sortOrder); }

      if (setParts.length === 0) return res.status(400).json({ message: "No fields to update." });

      values.push(id);
      const row = await queryOne<ChatbotContentRow>(
        `UPDATE public.chatbot_content SET ${setParts.join(", ")} WHERE id = $${idx} RETURNING *`,
        values,
      );

      if (!row) return res.status(404).json({ message: "Not found." });
      return res.json(mapChatbotContentRow(row));
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0]?.message });
      }
      throw err;
    }
  });

  app.delete("/api/admin/chatbot-content/:id", requireAdmin, async (req, res) => {
    const id = parseInt(getSingleParam(req.params.id), 10);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid id." });
    await query(`DELETE FROM public.chatbot_content WHERE id = $1`, [id]);
    return res.json({ ok: true });
  });

  app.post("/api/admin/seed", requireAdmin, async (_req, res) => {
    await seedChatbotContent();
    await seedPortfolioMemory();
    return res.json({ ok: true });
  });

  app.get("/api/admin/contact-submissions", requireAdmin, async (_req, res) => {
    const { listContactSubmissions } = await import("./contact-service.ts");
    const submissions = await listContactSubmissions();
    return res.json(submissions);
  });

  app.patch("/api/admin/contact-submissions/:id/status", requireAdmin, async (req, res) => {
    const { updateContactSubmissionStatus } = await import("./contact-service.ts");
    const { updateContactSubmissionStatusSchema } = await import("../shared/schema.ts");
    try {
      const id = parseInt(getSingleParam(req.params.id), 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid id." });
      const { status } = updateContactSubmissionStatusSchema.parse(req.body);
      const updated = await updateContactSubmissionStatus(id, status);
      if (!updated) return res.status(404).json({ message: "Not found." });
      return res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0]?.message });
      }
      throw err;
    }
  });

  app.delete("/api/admin/contact-submissions/:id", requireAdmin, async (req, res) => {
    const { deleteContactSubmission } = await import("./contact-service.ts");
    const id = parseInt(getSingleParam(req.params.id), 10);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid id." });
    await deleteContactSubmission(id);
    return res.json({ ok: true });
  });

  app.get("/api/admin/notify-email", requireAdmin, async (_req, res) => {
    const { getNotifyEmail } = await import("./contact-service.ts");
    const email = await getNotifyEmail();
    return res.json({ value: email });
  });

  app.put("/api/admin/notify-email", requireAdmin, async (req, res) => {
    const { updateNotifyEmailSetting } = await import("./contact-service.ts");
    try {
      const { adminNotifyEmailSchema } = await import("../shared/schema.ts");
      const input = adminNotifyEmailSchema.parse(req.body);
      const email = await updateNotifyEmailSetting(input);
      return res.json({ value: email });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0]?.message });
      }
      throw err;
    }
  });

  app.post("/api/admin/test-email", requireAdmin, async (req, res) => {
    const { sendBrevoDirectTestEmail } = await import("./contact-service.ts");
    const schema = z.object({ to: z.string().trim().email() });
    try {
      const { to } = schema.parse(req.body);
      const result = await sendBrevoDirectTestEmail(to);
      return res.json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0]?.message });
      }
      throw err;
    }
  });
}
