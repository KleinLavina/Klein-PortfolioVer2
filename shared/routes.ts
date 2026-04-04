import { z } from "zod";
import {
  achievementSchema,
  adminNotifyEmailSchema,
  contactSubmissionSchema,
  contactSubmissionInputSchema,
  updateContactSubmissionStatusSchema,
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
  contact: {
    submit: {
      method: "POST" as const,
      path: "/api/contact/submit" as const,
      input: contactSubmissionInputSchema,
      responses: {
        201: z.object({
          ok: z.literal(true),
          submissionId: z.number().int(),
          message: z.string().optional(),
          delivery: z
            .object({
              messageId: z.string(),
              accepted: z.array(z.string()),
              rejected: z.array(z.string()),
              response: z.string(),
            })
            .optional(),
        }),
        400: errorSchemas.validation,
        429: z.object({
          message: z.string(),
          limit: z.number().int(),
        }),
      },
    },
    submissions: {
      list: {
        method: "GET" as const,
        path: "/api/contact/submissions" as const,
        responses: {
          200: z.array(contactSubmissionSchema),
        },
      },
      updateStatus: {
        method: "PATCH" as const,
        path: "/api/contact/submissions/:id/status" as const,
        input: updateContactSubmissionStatusSchema,
        responses: {
          200: contactSubmissionSchema,
          400: errorSchemas.validation,
          404: errorSchemas.notFound,
        },
      },
      delete: {
        method: "DELETE" as const,
        path: "/api/contact/submissions/:id" as const,
        responses: {
          200: z.object({ ok: z.literal(true) }),
          404: errorSchemas.notFound,
        },
      },
    },
  },
  adminSettings: {
    notifyEmail: {
      get: {
        method: "GET" as const,
        path: "/api/admin/settings/notify-email" as const,
        responses: {
          200: z.object({ value: z.string() }),
        },
      },
      patch: {
        method: "PATCH" as const,
        path: "/api/admin/settings/notify-email" as const,
        input: adminNotifyEmailSchema,
        responses: {
          200: z.object({ value: z.string() }),
          400: errorSchemas.validation,
        },
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
