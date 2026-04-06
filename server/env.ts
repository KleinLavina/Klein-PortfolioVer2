import { lookup } from "node:dns/promises";

const PLACEHOLDER_PATTERNS = [
  /^your[_-]/i,
  /^change[_-]this/i,
  /^replace[_-]me/i,
  /example/i,
  /placeholder/i,
  /dummy/i,
  /fake/i,
];

function looksLikePlaceholder(value: string): boolean {
  const normalized = value.trim();
  if (!normalized) return true;
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(normalized));
}

function getRequiredEnvError(name: string, description: string): string | null {
  const value = process.env[name]?.trim();
  if (!value) {
    return `${name} is required. ${description}`;
  }
  if (looksLikePlaceholder(value)) {
    return `${name} still looks like a placeholder. ${description}`;
  }
  return null;
}

function parseDatabaseHostname(connectionString: string): string {
  let parsed: URL;
  try {
    parsed = new URL(connectionString);
  } catch {
    throw new Error(
      "DATABASE_URL is not a valid Postgres connection string.",
    );
  }

  if (!parsed.hostname) {
    throw new Error("DATABASE_URL is missing a database hostname.");
  }

  return parsed.hostname;
}

function validateFrontendSupabaseEnv(warnings: string[]) {
  const url = process.env.VITE_SUPABASE_URL?.trim();
  const clientKey =
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.VITE_SUPABASE_ANON_KEY?.trim();

  if (!url || !clientKey) {
    warnings.push(
      "Supabase client env is incomplete. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY for frontend Supabase features.",
    );
    return;
  }

  if (looksLikePlaceholder(url) || looksLikePlaceholder(clientKey)) {
    warnings.push(
      "Supabase client env still contains placeholder values. Replace VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY with real project values.",
    );
  }
}

function validateBrevoEnv(warnings: string[]) {
  const values = [
    process.env.BREVO_SMTP_USER?.trim(),
    process.env.BREVO_SMTP_PASS?.trim(),
    process.env.BREVO_FROM_EMAIL?.trim(),
  ];

  if (values.every(Boolean)) {
    if (values.some((value) => looksLikePlaceholder(value!))) {
      warnings.push(
        "Brevo SMTP env still contains placeholder values. Replace BREVO_SMTP_USER, BREVO_SMTP_PASS, and BREVO_FROM_EMAIL before testing contact delivery.",
      );
    }
    return;
  }

  if (values.some(Boolean)) {
    warnings.push(
      "Brevo SMTP env is partially configured. Contact form delivery will not work until BREVO_SMTP_USER, BREVO_SMTP_PASS, and BREVO_FROM_EMAIL are all set.",
    );
  }
}

export async function validateEnvironment(): Promise<void> {
  const errors: string[] = [];
  const warnings: string[] = [];

  const databaseUrlError = getRequiredEnvError(
    "DATABASE_URL",
    "Copy the current connection string from your database provider instead of using a generated or guessed host.",
  );
  if (databaseUrlError) {
    errors.push(databaseUrlError);
  }

  const geminiApiKeyError = getRequiredEnvError(
    "GEMINI_API_KEY",
    "The chatbot API needs a real Gemini API key.",
  );
  if (geminiApiKeyError) {
    warnings.push(geminiApiKeyError);
  }

  const adminPasswordError = getRequiredEnvError(
    "ADMIN_PASSWORD",
    "Set the admin login password through the environment instead of hardcoding it in code.",
  );
  if (adminPasswordError) {
    errors.push(adminPasswordError);
  }

  validateFrontendSupabaseEnv(warnings);
  validateBrevoEnv(warnings);

  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (databaseUrl && !looksLikePlaceholder(databaseUrl)) {
    try {
      const hostname = parseDatabaseHostname(databaseUrl);
      try {
        await lookup(hostname);
      } catch (error) {
        const errorCode =
          error && typeof error === "object" && "code" in error
            ? String(error.code)
            : "UNKNOWN";
        if (errorCode === "ENOTFOUND") {
          errors.push(
            `DATABASE_URL hostname "${hostname}" could not be resolved. Refresh the Postgres connection string from Supabase or your current database provider.`,
          );
        } else {
          warnings.push(
            `DATABASE_URL hostname "${hostname}" could not be verified at startup (${errorCode}).`,
          );
        }
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  for (const warning of warnings) {
    console.warn(`[env] ${warning}`);
  }

  if (errors.length > 0) {
    throw new Error(
      ["Environment validation failed:", ...errors.map((message) => `- ${message}`)].join(
        "\n",
      ),
    );
  }
}
