import nodemailer from "nodemailer";
import { query, queryOne } from "./db.ts";

import type {
  AdminNotifyEmailInput,
  ContactSubmission,
  ContactSubmissionInput,
  ContactSubmissionStatus,
} from "../shared/schema.ts";

const CONTACT_DAILY_LIMIT = 3;
const NOTIFY_EMAIL_SETTING_KEY = "notify_email";

type ContactSubmissionRow = {
  id: number;
  full_name: string;
  email: string;
  message: string;
  fingerprint: string;
  ip_address: string;
  status: ContactSubmissionStatus;
  created_at: string;
  read_at: string | null;
  replied_at: string | null;
  updated_at: string;
};

type ContactDeliveryResult = {
  messageId: string;
  accepted: string[];
  rejected: string[];
  response: string;
};

function getBrevoFromAddress(): string {
  const fromEmail = process.env.BREVO_FROM_EMAIL?.trim();
  const fromName = process.env.BREVO_FROM_NAME?.trim();

  if (!fromEmail) {
    throw new Error("Brevo sender is not configured. Set BREVO_FROM_EMAIL.");
  }

  return fromName ? `"${fromName}" <${fromEmail}>` : fromEmail;
}

function sanitizeText(input: string): string {
  return input
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getLocalDateKey(now: Date): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildRateLimitKey(ipAddress: string, fingerprint: string): string {
  return `${ipAddress}::${fingerprint}`;
}

function mapContactSubmissionRow(row: ContactSubmissionRow): ContactSubmission {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    message: row.message,
    fingerprint: row.fingerprint,
    ipAddress: row.ip_address,
    status: row.status,
    createdAt: row.created_at,
    readAt: row.read_at,
    repliedAt: row.replied_at,
    updatedAt: row.updated_at,
  };
}

export function getClientIpAddress(headers: Record<string, unknown>): string {
  const forwardedFor = headers["x-forwarded-for"];
  const realIp = headers["x-real-ip"];

  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0]!.trim();
  }

  if (Array.isArray(forwardedFor) && forwardedFor[0]) {
    return String(forwardedFor[0]).split(",")[0]!.trim();
  }

  if (typeof realIp === "string" && realIp.trim()) {
    return realIp.trim();
  }

  return "unknown";
}

export async function consumeContactSubmissionQuota(ipAddress: string, fingerprint: string) {
  const dateKey = getLocalDateKey(new Date());
  const limiterKey = buildRateLimitKey(ipAddress, fingerprint);

  const row = await queryOne<{ allowed: boolean; used_count: number }>(
    `SELECT * FROM public.consume_contact_submission_limit($1, $2, $3)`,
    [limiterKey, dateKey, CONTACT_DAILY_LIMIT],
  );

  return {
    allowed: row?.allowed ?? false,
    usedCount: row?.used_count ?? CONTACT_DAILY_LIMIT,
    limit: CONTACT_DAILY_LIMIT,
  };
}

export async function createContactSubmission(
  input: ContactSubmissionInput,
  ipAddress: string,
): Promise<ContactSubmission> {
  const row = await queryOne<ContactSubmissionRow>(
    `INSERT INTO public.contact_submissions
       (full_name, email, message, fingerprint, ip_address, status)
     VALUES ($1, $2, $3, $4, $5, 'unread')
     RETURNING *`,
    [
      sanitizeText(input.fullName),
      sanitizeText(input.email).toLowerCase(),
      sanitizeText(input.message),
      sanitizeText(input.fingerprint),
      sanitizeText(ipAddress),
    ],
  );

  if (!row) {
    throw new Error("Failed to create contact submission: no row returned.");
  }

  return mapContactSubmissionRow(row);
}

export async function listContactSubmissions(): Promise<ContactSubmission[]> {
  const rows = await query<ContactSubmissionRow>(
    `SELECT * FROM public.contact_submissions ORDER BY created_at DESC`,
  );
  return rows.map(mapContactSubmissionRow);
}

export async function updateContactSubmissionStatus(
  id: number,
  status: ContactSubmissionStatus,
): Promise<ContactSubmission | null> {
  const now = new Date().toISOString();

  let sql: string;
  let params: unknown[];

  if (status === "replied") {
    sql = `UPDATE public.contact_submissions
           SET status = $1, read_at = $2, replied_at = $2, updated_at = $2
           WHERE id = $3
           RETURNING *`;
    params = [status, now, id];
  } else if (status === "read") {
    sql = `UPDATE public.contact_submissions
           SET status = $1, read_at = $2, updated_at = $2
           WHERE id = $3
           RETURNING *`;
    params = [status, now, id];
  } else {
    sql = `UPDATE public.contact_submissions
           SET status = $1, updated_at = $2
           WHERE id = $3
           RETURNING *`;
    params = [status, now, id];
  }

  const row = await queryOne<ContactSubmissionRow>(sql, params);
  return row ? mapContactSubmissionRow(row) : null;
}

export async function deleteContactSubmission(id: number): Promise<void> {
  await query(`DELETE FROM public.contact_submissions WHERE id = $1`, [id]);
}

export async function getNotifyEmail(): Promise<string> {
  const row = await queryOne<{ value_text: string | null }>(
    `SELECT value_text FROM public.admin_settings WHERE setting_key = $1`,
    [NOTIFY_EMAIL_SETTING_KEY],
  );
  return row?.value_text?.trim() || process.env.NOTIFY_EMAIL?.trim() || "";
}

export async function updateNotifyEmailSetting(input: AdminNotifyEmailInput): Promise<string> {
  const value = sanitizeText(input.value).toLowerCase();

  await query(
    `INSERT INTO public.admin_settings (setting_key, value_text)
     VALUES ($1, $2)
     ON CONFLICT (setting_key) DO UPDATE SET value_text = EXCLUDED.value_text, updated_at = timezone('utc', now())`,
    [NOTIFY_EMAIL_SETTING_KEY, value],
  );

  return value;
}

function buildBrevoTransportConfig() {
  const host = process.env.BREVO_SMTP_HOST?.trim() || "smtp-relay.brevo.com";
  const port = Number(process.env.BREVO_SMTP_PORT?.trim() || "587");
  const user = process.env.BREVO_SMTP_USER?.trim();
  const pass = process.env.BREVO_SMTP_PASS?.trim();

  if (!user || !pass) {
    throw new Error("Brevo SMTP is not configured. Set BREVO_SMTP_USER and BREVO_SMTP_PASS.");
  }

  return {
    host,
    port,
    secure: false,
    auth: { user, pass },
  };
}

function createBrevoTransport() {
  return nodemailer.createTransport(buildBrevoTransportConfig());
}

function logBrevoSendError(error: unknown, context: string) {
  console.error(`[brevo] ${context} raw error:`, error);
  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    console.error(`[brevo] ${context} normalized error:`, {
      name: record.name,
      message: record.message,
      code: record.code,
      command: record.command,
      response: record.response,
      responseCode: record.responseCode,
    });
  }
}

async function sendWithBrevoTransport(
  mailOptions: nodemailer.SendMailOptions,
  context: string,
): Promise<ContactDeliveryResult> {
  const transport = createBrevoTransport();

  try {
    const info = await transport.sendMail(mailOptions);
    const accepted = Array.isArray(info.accepted) ? info.accepted.map(String) : [];
    const rejected = Array.isArray(info.rejected) ? info.rejected.map(String) : [];
    const response = typeof info.response === "string" ? info.response : "";

    if (accepted.length === 0) {
      throw new Error(
        `Brevo SMTP did not accept any recipients.${rejected.length ? ` Rejected: ${rejected.join(", ")}` : ""}${response ? ` Response: ${response}` : ""}`,
      );
    }

    return { messageId: info.messageId, accepted, rejected, response };
  } catch (error) {
    logBrevoSendError(error, `${context} sendMail() failure`);
    throw error;
  }
}

export async function sendContactNotification(
  submission: ContactSubmission,
  notifyEmail: string,
): Promise<ContactDeliveryResult> {
  if (!notifyEmail.trim()) {
    throw new Error(
      "Notify email is not configured. Set NOTIFY_EMAIL or save one in admin settings.",
    );
  }

  return sendWithBrevoTransport(
    {
      from: getBrevoFromAddress(),
      to: notifyEmail,
      replyTo: submission.email,
      subject: `New Message from ${submission.fullName} - Klein Portfolio`,
      text: [
        `Name: ${submission.fullName}`,
        `Email: ${submission.email}`,
        `Message: ${submission.message}`,
        `Sent at: ${submission.createdAt}`,
      ].join("\n"),
    },
    "contact notification",
  );
}

export async function sendBrevoDirectTestEmail(to: string): Promise<ContactDeliveryResult> {
  return sendWithBrevoTransport(
    {
      from: getBrevoFromAddress(),
      to,
      subject: "SMTP direct test",
      text: "hello from localhost",
    },
    "direct smtp test",
  );
}
