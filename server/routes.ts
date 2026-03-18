import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import {
  buildPortfolioMemoryPrompt,
} from "@shared/portfolio-memory";
import { z } from "zod";
import type { ChatAction } from "@shared/schema";
import {
  registerAdminRoutes,
  seedChatbotContent,
  seedPortfolioMemory,
  getActiveSystemPrompt,
  getPortfolioMemory,
} from "./admin-routes";
import { getServerSupabase, unwrapSupabaseResult } from "./supabase";

type ChatHistoryItem = {
  from: "user" | "klein";
  text: string;
};

type DailyUsageSummary = {
  used: number;
  remaining: number;
  limit: number;
  dateKey: string;
};

type GeminiPart =
  | { text: string }
  | { functionCall: { name: string; args?: Record<string, unknown> } }
  | {
      functionResponse: {
        name: string;
        response: { result: unknown };
      };
    };

type GeminiContent = {
  role: "user" | "model";
  parts: GeminiPart[];
};

type GeminiGenerateResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
        functionCall?: { name?: string; args?: Record<string, unknown> };
      }>;
    };
  }>;
};

const DAILY_CHAT_LIMIT = 8;

function getLocalDateKey(now: Date): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildDailyUsageSummary(dateKey: string, used: number): DailyUsageSummary {
  const remaining = Math.max(0, DAILY_CHAT_LIMIT - used);
  return {
    used,
    remaining,
    limit: DAILY_CHAT_LIMIT,
    dateKey,
  };
}

async function getChatDailyUsage(clientId: string): Promise<DailyUsageSummary> {
  const dateKey = getLocalDateKey(new Date());
  const supabase = getServerSupabase();
  const result = await supabase
    .from("chat_daily_usage")
    .select("used_count")
    .eq("client_id", clientId)
    .eq("date_key", dateKey)
    .maybeSingle();

  const row = unwrapSupabaseResult(
    result.data as { used_count: number } | null,
    result.error,
    "Failed to load chat daily usage",
  );

  return buildDailyUsageSummary(dateKey, row?.used_count ?? 0);
}

async function tryConsumeDailyMessage(clientId: string): Promise<{
  allowed: boolean;
  usage: DailyUsageSummary;
}> {
  const dateKey = getLocalDateKey(new Date());
  const supabase = getServerSupabase();
  const result = await supabase.rpc("consume_chat_daily_message", {
    target_client_id: clientId,
    date_key_input: dateKey,
    daily_limit: DAILY_CHAT_LIMIT,
  });

  const row = unwrapSupabaseResult(
    Array.isArray(result.data) ? result.data[0] : result.data,
    result.error,
    "Failed to consume chat daily usage",
  ) as { allowed: boolean; used_count: number } | null;

  const used = row?.used_count ?? 0;
  return {
    allowed: row?.allowed ?? false,
    usage: buildDailyUsageSummary(dateKey, used),
  };
}

async function trackUniqueLifetimeVisitor(visitorId: string): Promise<number> {
  const supabase = getServerSupabase();
  const result = await supabase.rpc("track_unique_lifetime_visitor", {
    target_visitor_id: visitorId,
  });

  const total = unwrapSupabaseResult(
    result.data,
    result.error,
    "Failed to track unique lifetime visitor",
  );

  return typeof total === "number" ? total : Number(total ?? 0);
}

function toGeminiHistory(history: ChatHistoryItem[]): GeminiContent[] {
  return history.map((item) => ({
    role: item.from === "user" ? "user" : "model",
    parts: [{ text: item.text }],
  }));
}

function parsePositiveLimit(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  const normalized = Math.floor(value);
  if (normalized <= 0) return fallback;
  return Math.min(normalized, 10);
}

const SECTION_ANCHOR_MAP: Record<string, { anchor: string; label: string }> = {
  identity: { anchor: "#home", label: "View Home" },
  about: { anchor: "#about", label: "View About" },
  values: { anchor: "#about", label: "View About" },
  "technical-skills": { anchor: "#skills", label: "View Skills" },
  "soft-skills": { anchor: "#skills", label: "View Skills" },
  projects: { anchor: "#projects", label: "View Projects" },
  timeline: { anchor: "#timeline", label: "View Timeline" },
  contact: { anchor: "#contact", label: "View Contact" },
};

const SECTION_KEYWORD_MAP: Array<{ keywords: string[]; anchor: string; label: string }> = [
  { keywords: ["contact", "email", "reach", "hire", "inquiry", "facebook", "linkedin", "message"], anchor: "#contact", label: "View Contact" },
  { keywords: ["project", "demo", "github", "live", "built", "portfolio", "work"], anchor: "#projects", label: "View Projects" },
  { keywords: ["skill", "stack", "technology", "language", "framework", "frontend", "backend", "tool"], anchor: "#skills", label: "View Skills" },
  { keywords: ["timeline", "history", "journey", "experience", "year", "progression", "chapter", "learning path"], anchor: "#timeline", label: "View Timeline" },
  { keywords: ["about", "background", "who is", "story", "motivation", "personality", "values", "working style"], anchor: "#about", label: "View About" },
];

function buildChatActions(
  accessedSectionIds: Set<string>,
  portfolioMemory: Array<{ id: string; links?: Array<{ label: string; url: string }> }>,
  userMessage: string,
  reply: string,
): ChatAction[] {
  const actions: ChatAction[] = [];
  const seenUrls = new Set<string>();
  const seenAnchors = new Set<string>();

  for (const sectionId of Array.from(accessedSectionIds)) {
    const section = portfolioMemory.find((s) => s.id === sectionId);
    if (section?.links) {
      for (const link of section.links) {
        if (!seenUrls.has(link.url)) {
          actions.push({ label: link.label, url: link.url, kind: "external" });
          seenUrls.add(link.url);
        }
      }
    }
    const mapping = SECTION_ANCHOR_MAP[sectionId];
    if (mapping && !seenAnchors.has(mapping.anchor)) {
      actions.push({ label: mapping.label, url: mapping.anchor, kind: "section" });
      seenAnchors.add(mapping.anchor);
    }
  }

  if (accessedSectionIds.size === 0) {
    const combined = `${userMessage} ${reply}`.toLowerCase();
    for (const entry of SECTION_KEYWORD_MAP) {
      if (entry.keywords.some((kw) => combined.includes(kw))) {
        if (!seenAnchors.has(entry.anchor)) {
          actions.push({ label: entry.label, url: entry.anchor, kind: "section" });
          seenAnchors.add(entry.anchor);
        }
      }
    }
  }

  return actions.slice(0, 5);
}

async function runAgentTool(
  name: string,
  args: Record<string, unknown> | undefined,
  portfolioMemory: Array<{ id: string; links?: Array<{ label: string; url: string }> }>,
  accessedSectionIds: Set<string>,
): Promise<unknown> {
  switch (name) {
    case "getPortfolioSnapshot":
      return portfolioMemory;
    case "getPortfolioSection": {
      const sectionId = typeof args?.sectionId === "string" ? args.sectionId : "";
      if (sectionId) accessedSectionIds.add(sectionId);
      return portfolioMemory.find((section) => section.id === sectionId) ?? null;
    }
    case "getPortfolioContact":
      accessedSectionIds.add("contact");
      return portfolioMemory.find((section) => section.id === "contact") ?? null;
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  registerAdminRoutes(app);

  const chatInputSchema = z.object({
    clientId: z.string().trim().min(8).max(128),
    message: z.string().trim().min(1).max(50),
    history: z
      .array(
        z.object({
          from: z.enum(["user", "klein"]),
          text: z.string().trim().min(1).max(4000),
        }),
      )
      .max(30)
      .optional(),
  });
  const chatUsageQuerySchema = z.object({
    clientId: z.string().trim().min(8).max(128),
  });
  const visitorTrackSchema = z.object({
    visitorId: z.string().trim().min(8).max(128),
  });
  
  // GitHub API routes
  app.get("/api/github/contributions/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const { year } = req.query;

      const selectedYear = year ? parseInt(year as string) : new Date().getFullYear();
      
      // Use GitHub's contribution graph SVG as fallback
      // This provides visual data without requiring authentication
      const svgUrl = `https://ghchart.rshah.org/${username}`;
      
      // For now, return a simplified response that the frontend can handle
      // The actual contribution data requires GraphQL API with token
      res.json({
        username,
        year: selectedYear,
        totalContributions: 0,
        weeks: [],
        useFallback: true,
        svgUrl
      });

    } catch (error) {
      console.error("Error fetching GitHub contributions:", error);
      res.status(500).json({ 
        error: "Failed to fetch contributions",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/github/stats/:username", async (req, res) => {
    try {
      const { username } = req.params;

      const response = await fetch(`https://api.github.com/users/${username}`);
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const data = await response.json();

      res.json({
        username: data.login,
        name: data.name,
        avatarUrl: data.avatar_url,
        publicRepos: data.public_repos,
        followers: data.followers,
        following: data.following,
        bio: data.bio,
        location: data.location,
        company: data.company,
      });

    } catch (error) {
      console.error("Error fetching GitHub stats:", error);
      res.status(500).json({ 
        error: "Failed to fetch user stats",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
      if (!geminiApiKey) {
        return res.status(500).json({
          message: "Server is missing GEMINI_API_KEY.",
        });
      }

      const { clientId, message, history = [] } = chatInputSchema.parse(req.body);
      const consumption = await tryConsumeDailyMessage(clientId);
      if (!consumption.allowed) {
        return res.status(429).json({
          message: "You've reached your daily limit. Please come back tomorrow.",
          usage: consumption.usage,
        });
      }

      const systemPrompt = await getActiveSystemPrompt();
      const activePortfolioMemory = await getPortfolioMemory(false);
      const portfolioMemoryPrompt = buildPortfolioMemoryPrompt(activePortfolioMemory);

      const contents: GeminiContent[] = [
        ...toGeminiHistory(history),
        { role: "user", parts: [{ text: message }] },
      ];

      const accessedSectionIds = new Set<string>();

      for (let iteration = 0; iteration < 4; iteration += 1) {
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              systemInstruction: {
                parts: [
                  {
                    text: `${systemPrompt}\n\nAuthoritative portfolio memory:\n${portfolioMemoryPrompt}\n\nUse this memory as the primary source for Klein Lavina's details. Do not invent portfolio facts outside it.`,
                  },
                ],
              },
              contents,
              tools: [
                {
                  functionDeclarations: [
                    {
                      name: "getPortfolioSnapshot",
                      description: "Get the ordered portfolio memory sections for Klein Lavina.",
                      parameters: {
                        type: "OBJECT",
                        properties: {},
                      },
                    },
                    {
                      name: "getPortfolioSection",
                      description: "Get a specific ordered portfolio memory section by section id.",
                      parameters: {
                        type: "OBJECT",
                        properties: {
                          sectionId: {
                            type: "STRING",
                            description: "The memory section id such as identity, about, values, technical-skills, projects, timeline, or contact.",
                          },
                        },
                        required: ["sectionId"],
                      },
                    },
                    {
                      name: "getPortfolioContact",
                      description: "Get contact instructions and links for reaching Klein Lavina.",
                      parameters: {
                        type: "OBJECT",
                        properties: {},
                      },
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.6,
                maxOutputTokens: 600,
              },
            }),
          },
        );

        if (!geminiResponse.ok) {
          const errorText = await geminiResponse.text();
          return res.status(502).json({
            message: "Gemini request failed.",
            details: errorText,
            usage: consumption.usage,
          });
        }

        const data = (await geminiResponse.json()) as GeminiGenerateResponse;
        const parts = data.candidates?.[0]?.content?.parts ?? [];
        const textParts = parts
          .map((part) => part.text?.trim())
          .filter((value): value is string => Boolean(value));

        const functionCalls = parts
          .map((part) => part.functionCall)
          .filter(
            (
              value,
            ): value is { name: string; args?: Record<string, unknown> } =>
              Boolean(value?.name),
          );

        if (functionCalls.length === 0) {
          const reply = textParts.join("\n").trim();
          if (!reply) {
            return res.status(502).json({
              message: "Gemini returned an empty response.",
              usage: consumption.usage,
            });
          }
          const actions = buildChatActions(
            accessedSectionIds,
            activePortfolioMemory,
            message,
            reply,
          );
          return res.json({
            reply,
            actions,
            usage: consumption.usage,
          });
        }

        contents.push({
          role: "model",
          parts: functionCalls.map((call) => ({
            functionCall: {
              name: call.name,
              args: call.args,
            },
          })),
        });

        for (const call of functionCalls) {
          const result = await runAgentTool(call.name, call.args, activePortfolioMemory, accessedSectionIds);
          contents.push({
            role: "user",
            parts: [
              {
                functionResponse: {
                  name: call.name,
                  response: { result },
                },
              },
            ],
          });
        }
      }

      res.status(502).json({
        message: "Agent reached max tool iterations without final response.",
        usage: consumption.usage,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
  });

  app.get("/api/chat/usage", async (req, res) => {
    try {
      const { clientId } = chatUsageQuerySchema.parse(req.query);
      const usage = await getChatDailyUsage(clientId);
      return res.json({ usage });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
  });

  app.post("/api/visitors/track", async (req, res) => {
    try {
      const { visitorId } = visitorTrackSchema.parse(req.body);
      const count = await trackUniqueLifetimeVisitor(visitorId);
      return res.json({
        count,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
  });
  
  // Messages API
  app.get(api.messages.list.path, async (req, res) => {
    const allMessages = await storage.getMessages();
    res.json(allMessages);
  });

  app.post(api.messages.create.path, async (req, res) => {
    try {
      const input = api.messages.create.input.parse(req.body);
      const message = await storage.createMessage(input);
      res.status(201).json(message);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Projects API
  app.get(api.projects.list.path, async (req, res) => {
    const allProjects = await storage.getProjects();
    res.json(allProjects);
  });

  // Achievements API
  app.get(api.achievements.list.path, async (req, res) => {
    const allAchievements = await storage.getAchievements();
    res.json(allAchievements);
  });

  // Seed data function
  async function seedDatabase() {
    try {
      const existingProjects = await storage.getProjects();
      if (existingProjects.length === 0) {
        await storage.createProject({
          title: "E-Commerce Platform",
          description: "A full-stack e-commerce solution with React, Node.js, and Stripe integration.",
          thumbnail: "https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80",
          techStack: ["React", "Node.js", "Express", "PostgreSQL", "Stripe"],
          liveUrl: "https://example.com",
          githubUrl: "https://github.com"
        });
        await storage.createProject({
          title: "Task Management App",
          description: "A collaborative task management tool with real-time updates using WebSockets.",
          thumbnail: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&q=80",
          techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase"],
          liveUrl: "https://example.com",
          githubUrl: "https://github.com"
        });
        await storage.createProject({
          title: "Portfolio Website",
          description: "A modern developer portfolio built with React and Framer Motion.",
          thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
          techStack: ["React", "Framer Motion", "Tailwind CSS"],
          githubUrl: "https://github.com"
        });
      }

      const existingAchievements = await storage.getAchievements();
      if (existingAchievements.length === 0) {
        await storage.createAchievement({
          title: "AWS Certified Solutions Architect",
          description: "Achieved the associate level certification for AWS.",
          date: "2025"
        });
        await storage.createAchievement({
          title: "Hackathon Winner",
          description: "First place at the Global Tech Hackathon for an innovative AI solution.",
          date: "2024"
        });
        await storage.createAchievement({
          title: "Open Source Contributor",
          description: "Major contributions to popular React UI libraries.",
          date: "2023 - Present"
        });
      }
    } catch (e) {
      console.error("Error seeding database", e);
    }
  }

  // Call seed functions
  void seedDatabase();
  void seedChatbotContent().catch((error) => {
    console.error("Error seeding chatbot content", error);
  });
  void seedPortfolioMemory().catch((error) => {
    console.error("Error seeding portfolio memory", error);
  });

  return httpServer;
}
