import { z } from "zod";

export type ChatActionKind = "external" | "section";

export type ChatAction = {
  label: string;
  url: string;
  kind: ChatActionKind;
};

export const chatbotContentSchema = z.object({
  id: z.number().int(),
  category: z.string().min(1).max(64),
  label: z.string().min(1).max(128),
  content: z.string().min(1),
  isActive: z.boolean(),
  sortOrder: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const insertChatbotContentSchema = chatbotContentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const updateChatbotContentSchema = insertChatbotContentSchema.partial();
export type InsertChatbotContent = z.infer<typeof insertChatbotContentSchema>;
export type UpdateChatbotContent = z.infer<typeof updateChatbotContentSchema>;
export type ChatbotContent = z.infer<typeof chatbotContentSchema>;

export const portfolioFactSchema = z.object({
  label: z.string().trim().min(1).max(80),
  value: z.string().trim().min(1).max(240),
});

export const portfolioLinkSchema = z.object({
  label: z.string().trim().min(1).max(80),
  url: z.string().trim().min(1).max(500),
});

export const portfolioMemoryEntrySchema = z.object({
  id: z.number().int(),
  sectionKey: z.string().trim().min(1).max(64),
  title: z.string().trim().min(1).max(140),
  eyebrow: z.string().trim().min(1).max(80),
  summary: z.string().trim().min(1).max(1000),
  context: z.string().trim().min(1).max(2000),
  accent: z.enum(["primary", "secondary", "accent"]),
  facts: z.array(portfolioFactSchema),
  items: z.array(z.string().trim().min(1).max(500)),
  links: z.array(portfolioLinkSchema),
  isActive: z.boolean(),
  sortOrder: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const portfolioMemoryEntryInputSchema = portfolioMemoryEntrySchema
  .omit({
    id: true,
    sectionKey: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    sectionId: z.string().trim().min(1).max(64),
    isActive: z.boolean().optional().default(true),
    sortOrder: z.number().int().optional().default(0),
    facts: z.array(portfolioFactSchema).default([]),
    items: z.array(z.string().trim().min(1).max(500)).default([]),
    links: z.array(portfolioLinkSchema).default([]),
  });

export const updatePortfolioMemoryEntryInputSchema =
  portfolioMemoryEntryInputSchema.partial();
export type InsertPortfolioMemoryEntry = z.infer<
  typeof portfolioMemoryEntryInputSchema
>;
export type UpdatePortfolioMemoryEntry = z.infer<
  typeof updatePortfolioMemoryEntryInputSchema
>;
export type PortfolioMemoryEntry = z.infer<typeof portfolioMemoryEntrySchema>;

export const messageSchema = z.object({
  id: z.number().int(),
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  message: z.string().trim().min(1),
  createdAt: z.string(),
});

export const insertMessageSchema = messageSchema.omit({
  id: true,
  createdAt: true,
});
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = z.infer<typeof messageSchema>;

export const contactSubmissionStatusSchema = z.enum(["unread", "read", "replied"]);

export const contactSubmissionSchema = z.object({
  id: z.number().int(),
  fullName: z.string().trim().min(1).max(160),
  email: z.string().trim().email(),
  message: z.string().trim().min(1).max(5000),
  fingerprint: z.string().trim().min(8).max(128),
  ipAddress: z.string().trim().min(1).max(128),
  status: contactSubmissionStatusSchema,
  createdAt: z.string(),
  readAt: z.string().nullable().optional(),
  repliedAt: z.string().nullable().optional(),
  updatedAt: z.string(),
});

export const contactSubmissionInputSchema = z.object({
  fullName: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(320),
  message: z.string().trim().min(1).max(5000),
  fingerprint: z.string().trim().min(8).max(128),
});

export const updateContactSubmissionStatusSchema = z.object({
  status: contactSubmissionStatusSchema,
});

export const adminNotifyEmailSchema = z.object({
  value: z.string().trim().email().max(320),
});

export type ContactSubmission = z.infer<typeof contactSubmissionSchema>;
export type ContactSubmissionInput = z.infer<typeof contactSubmissionInputSchema>;
export type ContactSubmissionStatus = z.infer<typeof contactSubmissionStatusSchema>;
export type UpdateContactSubmissionStatusInput = z.infer<typeof updateContactSubmissionStatusSchema>;
export type AdminNotifyEmailInput = z.infer<typeof adminNotifyEmailSchema>;

export const projectSchema = z.object({
  id: z.number().int(),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  thumbnail: z.string().trim().min(1),
  techStack: z.array(z.string().trim().min(1)),
  liveUrl: z.string().trim().min(1).nullable().optional(),
  githubUrl: z.string().trim().min(1).nullable().optional(),
});

export const insertProjectSchema = projectSchema.omit({ id: true });
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = z.infer<typeof projectSchema>;

export const achievementSchema = z.object({
  id: z.number().int(),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  date: z.string().trim().min(1),
});

export const insertAchievementSchema = achievementSchema.omit({ id: true });
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = z.infer<typeof achievementSchema>;
