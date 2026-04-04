import { mkdir, readFile, writeFile } from "node:fs/promises";
import nodemailer from "nodemailer";

import type {
  AdminNotifyEmailInput,
  ContactSubmission,
  ContactSubmissionInput,
  ContactSubmissionStatus,
} from "../shared/schema.ts";
import { getServerSupabase, unwrapSupabaseResult } from "./supabase.ts";

const CONTACT_DAILY_LIMIT = 3;
const NOTIFY_EMAIL_SETTING_KEY = "notify_email";
const LOCAL_SETTINGS_DIR = new URL("../.local/", import.meta.url);
const LOCAL_NOTIFY_EMAIL_FILE = new URL("admin-settings.json", LOCAL_SETTINGS_DIR);
const LOCAL_CONTACT_SUBMISSIONS_FILE = new URL("contact-submissions.json", LOCAL_SETTINGS_DIR);
const LOCAL_CONTACT_USAGE_FILE = new URL("contact-usage.json", LOCAL_SETTINGS_DIR);

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

type LocalContactSubmissionStore = {
  nextId: number;
  submissions: ContactSubmission[];
};

type LocalContactUsageStore = {
  entries: Array<{
    clientKey: string;
    dateKey: string;
    usedCount: number;
  }>;
};

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

function isMissingSupabaseTable(error: unknown, tableName: string): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes(`public.${tableName}`.toLowerCase()) ||
    message.includes(`table '${tableName}'`) ||
    (message.includes("could not find the table") && message.includes(tableName)) ||
    (message.includes("relation") && message.includes(tableName))
  );
}

function isMissingSupabaseFunction(error: unknown, functionName: string): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes(functionName.toLowerCase()) &&
    (message.includes("function") || message.includes("schema cache"))
  );
}

function isMissingContactStorage(error: unknown): boolean {
  return (
    isMissingSupabaseTable(error, "contact_submissions") ||
    isMissingSupabaseTable(error, "contact_daily_usage") ||
    isMissingSupabaseFunction(error, "consume_contact_submission_limit")
  );
}

function sortSubmissionsNewestFirst(submissions: ContactSubmission[]) {
  return [...submissions].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

async function readLocalJsonFile<T>(fileUrl: URL, fallback: T): Promise<T> {
  try {
    const raw = await readFile(fileUrl, "utf8");
    return JSON.parse(raw) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
      return fallback;
    }
    throw error;
  }
}

async function writeLocalJsonFile<T>(fileUrl: URL, value: T): Promise<T> {
  await mkdir(LOCAL_SETTINGS_DIR, { recursive: true });
  await writeFile(fileUrl, JSON.stringify(value, null, 2), "utf8");
  return value;
}

async function readLocalContactSubmissionStore(): Promise<LocalContactSubmissionStore> {
  const store = await readLocalJsonFile<LocalContactSubmissionStore>(LOCAL_CONTACT_SUBMISSIONS_FILE, {
    nextId: 1,
    submissions: [],
  });

  return {
    nextId: typeof store.nextId === "number" && Number.isFinite(store.nextId) ? store.nextId : 1,
    submissions: Array.isArray(store.submissions) ? store.submissions : [],
  };
}

async function writeLocalContactSubmissionStore(store: LocalContactSubmissionStore) {
  return writeLocalJsonFile(LOCAL_CONTACT_SUBMISSIONS_FILE, store);
}

async function readLocalContactUsageStore(): Promise<LocalContactUsageStore> {
  const store = await readLocalJsonFile<LocalContactUsageStore>(LOCAL_CONTACT_USAGE_FILE, {
    entries: [],
  });

  return {
    entries: Array.isArray(store.entries) ? store.entries : [],
  };
}

async function writeLocalContactUsageStore(store: LocalContactUsageStore) {
  return writeLocalJsonFile(LOCAL_CONTACT_USAGE_FILE, store);
}

async function readLocalNotifyEmail(): Promise<string> {
  try {
    const raw = await readFile(LOCAL_NOTIFY_EMAIL_FILE, "utf8");
    const parsed = JSON.parse(raw) as { value?: unknown };
    return typeof parsed.value === "string" ? parsed.value.trim() : "";
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
      return "";
    }
    throw error;
  }
}

async function writeLocalNotifyEmail(value: string): Promise<string> {
  await writeLocalJsonFile(LOCAL_NOTIFY_EMAIL_FILE, { value });
  return value;
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
  try {
    const supabase = getServerSupabase();
    const result = await supabase.rpc("consume_contact_submission_limit", {
      target_client_key: limiterKey,
      date_key_input: dateKey,
      daily_limit: CONTACT_DAILY_LIMIT,
    });

    const row = unwrapSupabaseResult(
      Array.isArray(result.data) ? result.data[0] : result.data,
      result.error,
      "Failed to consume contact submission limit",
    ) as { allowed: boolean; used_count: number } | null;

    return {
      allowed: row?.allowed ?? false,
      usedCount: row?.used_count ?? CONTACT_DAILY_LIMIT,
      limit: CONTACT_DAILY_LIMIT,
    };
  } catch (error) {
    if (!isMissingContactStorage(error)) {
      throw error;
    }

    const store = await readLocalContactUsageStore();
    const existing = store.entries.find(
      (entry) => entry.clientKey === limiterKey && entry.dateKey === dateKey,
    );

    if (!existing) {
      store.entries.push({
        clientKey: limiterKey,
        dateKey,
        usedCount: 1,
      });
      await writeLocalContactUsageStore(store);
      return { allowed: true, usedCount: 1, limit: CONTACT_DAILY_LIMIT };
    }

    if (existing.usedCount >= CONTACT_DAILY_LIMIT) {
      return {
        allowed: false,
        usedCount: existing.usedCount,
        limit: CONTACT_DAILY_LIMIT,
      };
    }

    existing.usedCount += 1;
    await writeLocalContactUsageStore(store);
    return {
      allowed: true,
      usedCount: existing.usedCount,
      limit: CONTACT_DAILY_LIMIT,
    };
  }
}

export async function createContactSubmission(
  input: ContactSubmissionInput,
  ipAddress: string,
): Promise<ContactSubmission> {
  const payload = {
    full_name: sanitizeText(input.fullName),
    email: sanitizeText(input.email).toLowerCase(),
    message: sanitizeText(input.message),
    fingerprint: sanitizeText(input.fingerprint),
    ip_address: sanitizeText(ipAddress),
    status: "unread" as const,
  };

  try {
    const supabase = getServerSupabase();
    const result = await supabase
      .from("contact_submissions")
      .insert(payload)
      .select("*")
      .single();

    const row = unwrapSupabaseResult(
      result.data as ContactSubmissionRow | null,
      result.error,
      "Failed to create contact submission",
    );

    if (!row) {
      throw new Error("Failed to create contact submission: Supabase returned no row.");
    }

    return mapContactSubmissionRow(row);
  } catch (error) {
    if (!isMissingContactStorage(error)) {
      throw error;
    }

    const store = await readLocalContactSubmissionStore();
    const now = new Date().toISOString();
    const submission: ContactSubmission = {
      id: store.nextId,
      fullName: payload.full_name,
      email: payload.email,
      message: payload.message,
      fingerprint: payload.fingerprint,
      ipAddress: payload.ip_address,
      status: "unread",
      createdAt: now,
      readAt: null,
      repliedAt: null,
      updatedAt: now,
    };

    store.nextId += 1;
    store.submissions.push(submission);
    await writeLocalContactSubmissionStore(store);
    return submission;
  }
}

export async function listContactSubmissions(): Promise<ContactSubmission[]> {
  try {
    const supabase = getServerSupabase();
    const result = await supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    const rows = unwrapSupabaseResult(
      (result.data ?? []) as ContactSubmissionRow[],
      result.error,
      "Failed to load contact submissions",
    );

    return rows.map(mapContactSubmissionRow);
  } catch (error) {
    if (!isMissingContactStorage(error)) {
      throw error;
    }

    const store = await readLocalContactSubmissionStore();
    return sortSubmissionsNewestFirst(store.submissions);
  }
}

export async function updateContactSubmissionStatus(
  id: number,
  status: ContactSubmissionStatus,
): Promise<ContactSubmission | null> {
  const now = new Date().toISOString();
  const payload: Record<string, unknown> = { status };

  if (status === "read") {
    payload.read_at = now;
  }

  if (status === "replied") {
    payload.read_at = now;
    payload.replied_at = now;
  }

  try {
    const supabase = getServerSupabase();
    const result = await supabase
      .from("contact_submissions")
      .update(payload)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    const row = unwrapSupabaseResult(
      result.data as ContactSubmissionRow | null,
      result.error,
      "Failed to update contact submission status",
    );

    return row ? mapContactSubmissionRow(row) : null;
  } catch (error) {
    if (!isMissingContactStorage(error)) {
      throw error;
    }

    const store = await readLocalContactSubmissionStore();
    const index = store.submissions.findIndex((submission) => submission.id === id);
    if (index < 0) {
      return null;
    }

    const current = store.submissions[index]!;
    const updated: ContactSubmission = {
      ...current,
      status,
      readAt: status === "read" || status === "replied" ? now : current.readAt ?? null,
      repliedAt: status === "replied" ? now : current.repliedAt ?? null,
      updatedAt: now,
    };
    store.submissions[index] = updated;
    await writeLocalContactSubmissionStore(store);
    return updated;
  }
}

export async function deleteContactSubmission(id: number): Promise<void> {
  try {
    const supabase = getServerSupabase();
    const result = await supabase
      .from("contact_submissions")
      .delete()
      .eq("id", id);

    unwrapSupabaseResult(result.data, result.error, "Failed to delete contact submission");
  } catch (error) {
    if (!isMissingContactStorage(error)) {
      throw error;
    }

    const store = await readLocalContactSubmissionStore();
    store.submissions = store.submissions.filter((submission) => submission.id !== id);
    await writeLocalContactSubmissionStore(store);
  }
}

export async function getNotifyEmail(): Promise<string> {
  try {
    const supabase = getServerSupabase();
    const result = await supabase
      .from("admin_settings")
      .select("value_text")
      .eq("setting_key", NOTIFY_EMAIL_SETTING_KEY)
      .maybeSingle();

    const row = unwrapSupabaseResult(
      result.data as { value_text: string | null } | null,
      result.error,
      "Failed to load notify email setting",
    );

    return (
      row?.value_text?.trim() ||
      process.env.NOTIFY_EMAIL?.trim() ||
      ""
    );
  } catch (error) {
    if (!isMissingSupabaseTable(error, "admin_settings")) {
      throw error;
    }

    return (
      (await readLocalNotifyEmail()) ||
      process.env.NOTIFY_EMAIL?.trim() ||
      ""
    );
  }
}

export async function updateNotifyEmailSetting(input: AdminNotifyEmailInput): Promise<string> {
  const value = sanitizeText(input.value).toLowerCase();
  try {
    const supabase = getServerSupabase();
    const result = await supabase
      .from("admin_settings")
      .upsert(
        {
          setting_key: NOTIFY_EMAIL_SETTING_KEY,
          value_text: value,
        },
        { onConflict: "setting_key" },
      )
      .select("value_text")
      .single();

    const row = unwrapSupabaseResult(
      result.data as { value_text: string } | null,
      result.error,
      "Failed to update notify email setting",
    );

    return row?.value_text ?? value;
  } catch (error) {
    if (!isMissingSupabaseTable(error, "admin_settings")) {
      throw error;
    }

    return writeLocalNotifyEmail(value);
  }
}

function buildBrevoTransportConfig() {
  const host = process.env.BREVO_SMTP_HOST?.trim() || "smtp-relay.brevo.com";
  const port = Number(process.env.BREVO_SMTP_PORT?.trim() || "587");
  const user = process.env.BREVO_SMTP_USER?.trim();
  const pass = process.env.BREVO_SMTP_PASS?.trim();
  const secure = false;
  const tls: Record<string, unknown> | undefined = undefined;

  if (!user || !pass) {
    throw new Error("Brevo SMTP is not configured. Set BREVO_SMTP_USER and BREVO_SMTP_PASS.");
  }

  return {
    host,
    port,
    secure,
    tls,
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
      stack: record.stack,
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

    return {
      messageId: info.messageId,
      accepted,
      rejected,
      response,
    };
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
    throw new Error("Notify email is not configured. Set NOTIFY_EMAIL or save one in admin settings.");
  }

  return sendWithBrevoTransport({
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
  }, "contact notification");
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
