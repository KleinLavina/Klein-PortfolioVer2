import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

type ChatHistoryItem = {
  from: "user" | "klein";
  text: string;
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

async function runAgentTool(
  name: string,
  args?: Record<string, unknown>,
): Promise<unknown> {
  switch (name) {
    case "getProjects": {
      const limit = parsePositiveLimit(args?.limit, 3);
      const projects = await storage.getProjects();
      return projects.slice(0, limit).map((project) => ({
        title: project.title,
        description: project.description,
        techStack: project.techStack,
        liveUrl: project.liveUrl,
        githubUrl: project.githubUrl,
      }));
    }
    case "getAchievements": {
      const limit = parsePositiveLimit(args?.limit, 5);
      const achievements = await storage.getAchievements();
      return achievements.slice(0, limit).map((achievement) => ({
        title: achievement.title,
        description: achievement.description,
        date: achievement.date,
      }));
    }
    case "getContactInfo":
      return {
        contactRoute: "/api/messages",
        note: "Use the contact form and Klein will reply by email.",
      };
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const chatInputSchema = z.object({
    message: z.string().trim().min(1).max(2000),
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

      const { message, history = [] } = chatInputSchema.parse(req.body);

      const systemPrompt = [
        "You are Klein's portfolio AI assistant.",
        "Answer only about Klein's work, projects, skills, achievements, services, and contact process.",
        "When the user asks for portfolio facts, prefer calling tools instead of guessing.",
        "If data is unavailable, say so clearly and keep the response concise.",
      ].join(" ");

      const contents: GeminiContent[] = [
        ...toGeminiHistory(history),
        { role: "user", parts: [{ text: message }] },
      ];

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
                parts: [{ text: systemPrompt }],
              },
              contents,
              tools: [
                {
                  functionDeclarations: [
                    {
                      name: "getProjects",
                      description: "Get Klein's portfolio projects.",
                      parameters: {
                        type: "OBJECT",
                        properties: {
                          limit: {
                            type: "INTEGER",
                            description: "How many projects to return (1 to 10).",
                          },
                        },
                      },
                    },
                    {
                      name: "getAchievements",
                      description: "Get Klein's achievements and credentials.",
                      parameters: {
                        type: "OBJECT",
                        properties: {
                          limit: {
                            type: "INTEGER",
                            description: "How many achievements to return (1 to 10).",
                          },
                        },
                      },
                    },
                    {
                      name: "getContactInfo",
                      description: "Get contact instructions for reaching Klein.",
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
                maxOutputTokens: 450,
              },
            }),
          },
        );

        if (!geminiResponse.ok) {
          const errorText = await geminiResponse.text();
          return res.status(502).json({
            message: "Gemini request failed.",
            details: errorText,
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
            });
          }
          return res.json({ reply });
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
          const result = await runAgentTool(call.name, call.args);
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

  // Call seed function
  seedDatabase();

  return httpServer;
}
