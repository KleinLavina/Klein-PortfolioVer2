import { z } from "zod";
import {
  achievementSchema,
  insertMessageSchema,
  messageSchema,
  projectSchema,
} from "./schema.ts";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  messages: {
    list: {
      method: "GET" as const,
      path: "/api/messages" as const,
      responses: {
        200: z.array(messageSchema),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/messages" as const,
      input: insertMessageSchema,
      responses: {
        201: messageSchema,
        400: errorSchemas.validation,
      },
    },
  },
  projects: {
    list: {
      method: "GET" as const,
      path: "/api/projects" as const,
      responses: {
        200: z.array(projectSchema),
      },
    },
  },
  achievements: {
    list: {
      method: "GET" as const,
      path: "/api/achievements" as const,
      responses: {
        200: z.array(achievementSchema),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type MessageInput = z.infer<typeof api.messages.create.input>;
export type MessageResponse = z.infer<typeof api.messages.create.responses[201]>;
