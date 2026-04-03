import type { Express, Request, Response, NextFunction } from "express";
import {
  type InsertChatbotContent,
  portfolioMemoryEntryInputSchema,
  updatePortfolioMemoryEntryInputSchema,
} from "../shared/schema.ts";
import { portfolioMemorySections } from "../shared/portfolio-memory.ts";
import { z } from "zod";
import { randomBytes } from "crypto";
import { getServerSupabase, unwrapSupabaseResult } from "./supabase.ts";

const SESSION_TTL_SECONDS = 60 * 60 * 24;
const FALLBACK_SYSTEM_PROMPT =
  "You are Klein F. Lavina's portfolio AI assistant. Answer only about Klein's work, projects, skills, achievements, services, and contact process. When the user asks for portfolio facts, prefer calling tools instead of guessing. If data is unavailable, say so clearly.\n\nRESPONSE FORMAT RULES - follow these exactly:\n1. Write clean, well-structured prose. Separate distinct sections with a blank line. Keep sentences clear and professional.\n2. Never include raw URLs or hyperlinks in your text. Links are rendered automatically as separate action buttons below your reply. Instead, reference them naturally (e.g. \"You can check it below\" or \"See the links below for details\").\n3. For tech stacks, tools, or technologies - list each item using this exact marker syntax: [tech:Name]. Place all tech markers together on their own dedicated line, space-separated. Example line: [tech:React] [tech:TypeScript] [tech:Node.js]\n4. Keep responses concise - aim for 3 to 6 sentences unless a detailed breakdown is explicitly requested.\n5. Always use available portfolio tools when asked for specific facts.";

function getAdminPassword(): string {
  const configured = process.env.ADMIN_PASSWORD?.trim();
  if (configured) {
    return configured;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_PASSWORD is required in production.");
  }

  return "admin";
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

function toChatbotContentInsert(input: InsertChatbotContent) {
  return {
    category: input.category,
    label: input.label,
    content: input.content,
    is_active: input.isActive,
    sort_order: input.sortOrder,
  };
}

function toPortfolioMemoryInsert(
  input: z.infer<typeof portfolioMemoryEntryInputSchema>,
) {
  return {
    section_key: input.sectionId,
    title: input.title,
    eyebrow: input.eyebrow,
    summary: input.summary,
    context: input.context,
    accent: input.accent,
    facts: input.facts,
    items: input.items,
    links: input.links,
    is_active: input.isActive,
    sort_order: input.sortOrder,
  };
}

export async function seedChatbotContent() {
  const supabase = getServerSupabase();
  const existingResult = await supabase
    .from("chatbot_content")
    .select("id")
    .limit(1);
  const existing = unwrapSupabaseResult(
    existingResult.data ?? [],
    existingResult.error,
    "Failed to check chatbot content seed",
  );

  if (existing.length > 0) {
    return;
  }

  const insertResult = await supabase
    .from("chatbot_content")
    .insert(SEED_CONTENT.map(toChatbotContentInsert));
  unwrapSupabaseResult(insertResult.data, insertResult.error, "Failed to seed chatbot content");
  console.log(`[admin] Seeded ${SEED_CONTENT.length} chatbot content entries.`);
}

export async function seedPortfolioMemory() {
  const supabase = getServerSupabase();
  const existingResult = await supabase
    .from("portfolio_memory_entries")
    .select("id")
    .limit(1);
  const existing = unwrapSupabaseResult(
    existingResult.data ?? [],
    existingResult.error,
    "Failed to check portfolio memory seed",
  );

  if (existing.length > 0) {
    return;
  }

  const insertResult = await supabase
    .from("portfolio_memory_entries")
    .insert(
      portfolioMemorySections.map((section) => ({
        section_key: section.id,
        title: section.title,
        eyebrow: section.eyebrow,
        summary: section.summary,
        context: section.context,
        accent: section.accent,
        facts: section.facts ?? [],
        items: section.items ?? [],
        links: section.links ?? [],
        is_active: true,
        sort_order: section.order,
      })),
    );
  unwrapSupabaseResult(insertResult.data, insertResult.error, "Failed to seed portfolio memory");
  console.log(`[admin] Seeded ${portfolioMemorySections.length} portfolio memory sections.`);
}

async function createSession(): Promise<string> {
  const supabase = getServerSupabase();
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString();

  const result = await supabase
    .from("admin_sessions")
    .insert({
      token,
      expires_at: expiresAt,
    });

  unwrapSupabaseResult(result.data, result.error, "Failed to create admin session");
  return token;
}

async function validateSession(token: string): Promise<boolean> {
  const supabase = getServerSupabase();
  const now = new Date().toISOString();

  const deleteExpiredResult = await supabase
    .from("admin_sessions")
    .delete()
    .lt("expires_at", now);
  unwrapSupabaseResult(
    deleteExpiredResult.data,
    deleteExpiredResult.error,
    "Failed to prune expired admin sessions",
  );

  const sessionResult = await supabase
    .from("admin_sessions")
    .select("token")
    .eq("token", token)
    .gte("expires_at", now)
    .maybeSingle();

  const row = unwrapSupabaseResult(
    sessionResult.data,
    sessionResult.error,
    "Failed to validate admin session",
  );

  return Boolean(row?.token);
}

async function destroySession(token: string): Promise<void> {
  const supabase = getServerSupabase();
  const result = await supabase
    .from("admin_sessions")
    .delete()
    .eq("token", token);
  unwrapSupabaseResult(result.data, result.error, "Failed to destroy admin session");
}

function getSingleParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function isRecoverableChatbotStorageError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes("not configured") ||
    message.includes("relation") ||
    message.includes("does not exist") ||
    message.includes("function") ||
    message.includes("schema cache") ||
    message.includes("could not find the table") ||
    message.includes("failed to load chatbot content") ||
    message.includes("failed to load portfolio memory")
  );
}

function getFallbackChatbotRows(): ChatbotContentRow[] {
  const now = new Date().toISOString();
  return SEED_CONTENT.map((item, index) => ({
    id: index + 1,
    category: item.category,
    label: item.label,
    content: item.content,
    is_active: item.isActive,
    sort_order: item.sortOrder,
    created_at: now,
    updated_at: now,
  }));
}

export async function getPortfolioMemory(includeInactive = false) {
  try {
    const supabase = getServerSupabase();
    let query = supabase
      .from("portfolio_memory_entries")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true });

    if (!includeInactive) {
      query = query.eq("is_active", true);
    }

    const result = await query;
    const rows = unwrapSupabaseResult(
      (result.data ?? []) as PortfolioMemoryEntryRow[],
      result.error,
      "Failed to load portfolio memory",
    );

    return rows
      .map(mapPortfolioMemoryRow)
      .filter((row) => row.id !== "timeline");
  } catch (error) {
    if (!isRecoverableChatbotStorageError(error)) {
      throw error;
    }

    const fallbackRows = portfolioMemorySections.map((section, index) => ({
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
      createdAt: 0,
      updatedAt: 0,
    }));

    const filteredFallbackRows = fallbackRows.filter((row) => row.id !== "timeline");
    return includeInactive
      ? filteredFallbackRows
      : filteredFallbackRows.filter((row) => row.isActive);
  }
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
        return res.status(400).json({ message: err.errors[0].message });
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
    const supabase = getServerSupabase();
    const result = await supabase
      .from("chatbot_content")
      .select("*")
      .order("category", { ascending: true })
      .order("sort_order", { ascending: true });

    const rows = unwrapSupabaseResult(
      (result.data ?? []) as ChatbotContentRow[],
      result.error,
      "Failed to load chatbot content",
    );

    return res.json(rows.map(mapChatbotContentRow));
  });

  app.get("/api/admin/portfolio-memory", requireAdmin, (_req, res) => {
    return getPortfolioMemory(true).then((rows) => res.json(rows));
  });

  app.post("/api/admin/portfolio-memory", requireAdmin, async (req, res) => {
    try {
      const supabase = getServerSupabase();
      const data = portfolioMemoryEntryInputSchema.parse(req.body);
      const result = await supabase
        .from("portfolio_memory_entries")
        .insert(toPortfolioMemoryInsert(data))
        .select("*")
        .single();

      const row = unwrapSupabaseResult(
        result.data as PortfolioMemoryEntryRow | null,
        result.error,
        "Failed to create portfolio memory entry",
      );
      if (!row) {
        throw new Error("Failed to create portfolio memory entry: Supabase returned no row.");
      }

      return res.status(201).json(mapPortfolioMemoryRow(row));
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put("/api/admin/portfolio-memory/:id", requireAdmin, async (req, res) => {
    try {
      const supabase = getServerSupabase();
      const id = parseInt(getSingleParam(req.params.id), 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid id." });
      }

      const data = updatePortfolioMemoryEntryInputSchema.parse(req.body);
      const updatePayload = {
        ...(data.sectionId !== undefined ? { section_key: data.sectionId } : {}),
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.eyebrow !== undefined ? { eyebrow: data.eyebrow } : {}),
        ...(data.summary !== undefined ? { summary: data.summary } : {}),
        ...(data.context !== undefined ? { context: data.context } : {}),
        ...(data.accent !== undefined ? { accent: data.accent } : {}),
        ...(data.facts !== undefined ? { facts: data.facts } : {}),
        ...(data.items !== undefined ? { items: data.items } : {}),
        ...(data.links !== undefined ? { links: data.links } : {}),
        ...(data.isActive !== undefined ? { is_active: data.isActive } : {}),
        ...(data.sortOrder !== undefined ? { sort_order: data.sortOrder } : {}),
      };

      const result = await supabase
        .from("portfolio_memory_entries")
        .update(updatePayload)
        .eq("id", id)
        .select("*")
        .maybeSingle();

      const row = unwrapSupabaseResult(
        result.data as PortfolioMemoryEntryRow | null,
        result.error,
        "Failed to update portfolio memory entry",
      );

      if (!row) {
        return res.status(404).json({ message: "Not found." });
      }

      return res.json(mapPortfolioMemoryRow(row));
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete("/api/admin/portfolio-memory/:id", requireAdmin, async (req, res) => {
    const supabase = getServerSupabase();
    const id = parseInt(getSingleParam(req.params.id), 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid id." });
    }

    const result = await supabase
      .from("portfolio_memory_entries")
      .delete()
      .eq("id", id);
    unwrapSupabaseResult(result.data, result.error, "Failed to delete portfolio memory entry");
    return res.json({ ok: true });
  });

  app.post("/api/admin/chatbot-content", requireAdmin, async (req, res) => {
    try {
      const supabase = getServerSupabase();
      const data = createSchema.parse(req.body);
      const result = await supabase
        .from("chatbot_content")
        .insert(toChatbotContentInsert(data))
        .select("*")
        .single();

      const row = unwrapSupabaseResult(
        result.data as ChatbotContentRow | null,
        result.error,
        "Failed to create chatbot content",
      );
      if (!row) {
        throw new Error("Failed to create chatbot content: Supabase returned no row.");
      }

      return res.status(201).json(mapChatbotContentRow(row));
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put("/api/admin/chatbot-content/:id", requireAdmin, async (req, res) => {
    try {
      const supabase = getServerSupabase();
      const id = parseInt(getSingleParam(req.params.id), 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid id." });
      }

      const data = updateSchema.parse(req.body);
      const updatePayload = {
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.label !== undefined ? { label: data.label } : {}),
        ...(data.content !== undefined ? { content: data.content } : {}),
        ...(data.isActive !== undefined ? { is_active: data.isActive } : {}),
        ...(data.sortOrder !== undefined ? { sort_order: data.sortOrder } : {}),
      };

      const result = await supabase
        .from("chatbot_content")
        .update(updatePayload)
        .eq("id", id)
        .select("*")
        .maybeSingle();

      const row = unwrapSupabaseResult(
        result.data as ChatbotContentRow | null,
        result.error,
        "Failed to update chatbot content",
      );

      if (!row) {
        return res.status(404).json({ message: "Not found." });
      }

      return res.json(mapChatbotContentRow(row));
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete("/api/admin/chatbot-content/:id", requireAdmin, async (req, res) => {
    const supabase = getServerSupabase();
    const id = parseInt(getSingleParam(req.params.id), 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid id." });
    }

    const result = await supabase
      .from("chatbot_content")
      .delete()
      .eq("id", id);
    unwrapSupabaseResult(result.data, result.error, "Failed to delete chatbot content");
    return res.json({ ok: true });
  });

  app.get("/api/chatbot/quick-replies", async (_req, res) => {
    const rows = await getChatbotContentRows();
    const replies = rows
      .filter((row) => row.category === "quick_reply" && row.is_active)
      .map((row) => row.content);
    return res.json(replies);
  });

  app.get("/api/chatbot/welcome-messages", async (_req, res) => {
    const rows = await getChatbotContentRows();
    const messages = rows
      .filter((row) => row.category === "welcome_message" && row.is_active)
      .map((row) => row.content);
    return res.json(messages);
  });
}

async function getChatbotContentRows(): Promise<ChatbotContentRow[]> {
  try {
    const supabase = getServerSupabase();
    const result = await supabase
      .from("chatbot_content")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true });

    return unwrapSupabaseResult(
      (result.data ?? []) as ChatbotContentRow[],
      result.error,
      "Failed to load chatbot content rows",
    );
  } catch (error) {
    if (!isRecoverableChatbotStorageError(error)) {
      throw error;
    }

    return getFallbackChatbotRows();
  }
}

export async function getActiveSystemPrompt(): Promise<string> {
  const rows = await getChatbotContentRows();
  const row = rows.find((item) => item.category === "system_prompt" && item.is_active);
  if (row?.content) {
    return row.content;
  }
  return FALLBACK_SYSTEM_PROMPT;
  return (
    row?.content ??
    "You are Klein F. Lavina's portfolio AI assistant. Answer only about Klein's work, projects, skills, achievements, services, and contact process. When the user asks for portfolio facts, prefer calling tools instead of guessing. If data is unavailable, say so clearly.\n\nRESPONSE FORMAT RULES — follow these exactly:\n1. Write clean, well-structured prose. Separate distinct sections with a blank line. Keep sentences clear and professional.\n2. Never include raw URLs or hyperlinks in your text. Links are rendered automatically as separate action buttons below your reply. Instead, reference them naturally (e.g. \"You can check it below\" or \"See the links below for details\").\n3. For tech stacks, tools, or technologies — list each item using this exact marker syntax: [tech:Name]. Place all tech markers together on their own dedicated line, space-separated. Example line: [tech:React] [tech:TypeScript] [tech:Node.js]\n4. Keep responses concise — aim for 3 to 6 sentences unless a detailed breakdown is explicitly requested.\n5. Always use available portfolio tools when asked for specific facts."
  );
}

export async function getContextReplies(context: string): Promise<string[]> {
  const rows = await getChatbotContentRows();
  return rows
    .filter((row) => row.category === `context_reply_${context}` && row.is_active)
    .map((row) => row.content);
}
