interface Env {
  ALLOWED_ORIGINS?: string;
  CONTACT_SUBJECT_PREFIX?: string;
  EMAIL_FROM: string;
  EMAIL_FROM_NAME?: string;
  EMAIL_TO: string;
  RESEND_API_KEY?: string;
  REQUIRE_TURNSTILE?: string;
  TURNSTILE_SECRET_KEY?: string;
}

type ContactPayload = {
  name?: unknown;
  workEmail?: unknown;
  company?: unknown;
  products?: unknown;
  details?: unknown;
  website?: unknown;
  turnstileToken?: unknown;
  source?: unknown;
};

type ContactSubmission = {
  name: string;
  workEmail: string;
  company: string;
  products: string[];
  details: string;
  source: string;
};

type TurnstileVerification = {
  success: boolean;
  action?: string;
  hostname?: string;
  "error-codes"?: string[];
};

type ResendEmailPayload = {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
  reply_to: string[];
};

type ResendEmailResponse = {
  id?: string;
  error?: {
    name?: string;
    message?: string;
    statusCode?: number;
  };
};

const DEFAULT_ALLOWED_ORIGINS = [
  "https://getpathflow.com",
  "https://www.getpathflow.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const MAX_BODY_BYTES = 12_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
const submissionAttempts = new Map<string, { count: number; resetAt: number }>();

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return handleOptions(origin, env);
    }

    if (!isOriginAllowed(origin, env)) {
      return jsonResponse({ ok: false, error: "Origin not allowed." }, 403, origin, env);
    }

    if (request.method === "GET") {
      return jsonResponse({ ok: true, service: "pathflow-contact" }, 200, origin, env);
    }

    if (request.method !== "POST") {
      return jsonResponse({ ok: false, error: "Method not allowed." }, 405, origin, env);
    }

    if (!request.headers.get("Content-Type")?.toLowerCase().includes("application/json")) {
      return jsonResponse({ ok: false, error: "Expected JSON." }, 415, origin, env);
    }

    const clientIp = request.headers.get("CF-Connecting-IP") || "unknown";
    if (isRateLimited(clientIp)) {
      return jsonResponse({ ok: false, error: "Too many submissions. Try again shortly." }, 429, origin, env);
    }

    let payload: ContactPayload;
    try {
      const rawBody = await request.text();
      if (rawBody.length > MAX_BODY_BYTES) {
        return jsonResponse({ ok: false, error: "Submission is too large." }, 413, origin, env);
      }
      payload = JSON.parse(rawBody) as ContactPayload;
    } catch {
      return jsonResponse({ ok: false, error: "Invalid JSON." }, 400, origin, env);
    }

    if (readString(payload.website, 120)) {
      return jsonResponse({ ok: true }, 200, origin, env);
    }

    const turnstileError = await verifyTurnstileIfConfigured(payload, request, env);
    if (turnstileError) {
      return jsonResponse({ ok: false, error: turnstileError }, turnstileError === "Verification unavailable." ? 500 : 403, origin, env);
    }

    const normalized = normalizeSubmission(payload);
    if ("error" in normalized) {
      return jsonResponse({ ok: false, error: normalized.error }, 400, origin, env);
    }

    if (!env.RESEND_API_KEY || !env.EMAIL_FROM || !env.EMAIL_TO) {
      console.error("contact_worker_missing_email_config");
      return jsonResponse({ ok: false, error: "Email delivery is not configured." }, 500, origin, env);
    }

    try {
      const email = buildEmail(normalized.submission, env);
      const result = await sendWithResend(email, env);
      return jsonResponse({ ok: true, id: result.id || null }, 200, origin, env);
    } catch (error) {
      console.error("contact_worker_email_failed", serializeError(error));
      return jsonResponse({ ok: false, error: "Unable to send inquiry right now." }, 502, origin, env);
    }
  },
} satisfies ExportedHandler<Env>;

function handleOptions(origin: string, env: Env): Response {
  if (!isOriginAllowed(origin, env)) {
    return jsonResponse({ ok: false, error: "Origin not allowed." }, 403, origin, env);
  }

  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin, env),
  });
}

function normalizeSubmission(payload: ContactPayload): { submission: ContactSubmission } | { error: string } {
  const name = readString(payload.name, 120);
  const workEmail = readString(payload.workEmail, 180);
  const company = readString(payload.company, 160);
  const details = readString(payload.details, 2_000);
  const source = readString(payload.source, 500) || "Unknown";
  const products = readProducts(payload.products);

  if (!name) {
    return { error: "Name is required." };
  }

  if (!workEmail || !isEmail(workEmail)) {
    return { error: "A valid work email is required." };
  }

  if (products.length > 8) {
    return { error: "Too many selected products." };
  }

  return {
    submission: {
      name,
      workEmail,
      company,
      products: products.length > 0 ? products : ["Not specified"],
      details,
      source,
    },
  };
}

async function verifyTurnstileIfConfigured(
  payload: ContactPayload,
  request: Request,
  env: Env,
): Promise<string | null> {
  const requireTurnstile = env.REQUIRE_TURNSTILE === "true" || Boolean(env.TURNSTILE_SECRET_KEY);

  if (!requireTurnstile) {
    return null;
  }

  if (!env.TURNSTILE_SECRET_KEY) {
    console.error("contact_worker_missing_turnstile_secret");
    return "Verification unavailable.";
  }

  const token = readString(payload.turnstileToken, 2_048);
  if (!token) {
    return "Verification is required.";
  }

  const formData = new FormData();
  formData.set("secret", env.TURNSTILE_SECRET_KEY);
  formData.set("response", token);

  const remoteIp = request.headers.get("CF-Connecting-IP");
  if (remoteIp) {
    formData.set("remoteip", remoteIp);
  }

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
    });
    const result = (await response.json()) as TurnstileVerification;

    if (!result.success || (result.action && result.action !== "contact")) {
      console.warn("contact_worker_turnstile_failed", result["error-codes"] || []);
      return "Verification failed.";
    }
  } catch (error) {
    console.error("contact_worker_turnstile_error", serializeError(error));
    return "Verification unavailable.";
  }

  return null;
}

function buildEmail(submission: ContactSubmission, env: Env): ResendEmailPayload {
  const subjectSource = submission.company || submission.name;
  const subjectPrefix = env.CONTACT_SUBJECT_PREFIX || "New Pathflow inquiry";
  const subject = `${subjectPrefix}: ${subjectSource}`.slice(0, 140);

  return {
    to: [env.EMAIL_TO],
    from: formatEmailAddress(env.EMAIL_FROM, env.EMAIL_FROM_NAME || "Pathflow Website"),
    reply_to: [formatEmailAddress(submission.workEmail, submission.name)],
    subject,
    text: buildTextBody(submission),
    html: buildHtmlBody(submission),
  };
}

async function sendWithResend(email: ResendEmailPayload, env: Env): Promise<ResendEmailResponse> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(email),
  });

  const responseText = await response.text();
  let result: ResendEmailResponse = {};

  if (responseText) {
    try {
      result = JSON.parse(responseText) as ResendEmailResponse;
    } catch {
      result = {};
    }
  }

  if (!response.ok) {
    const message = result.error?.message || responseText || "Unknown Resend error";
    throw new Error(`Resend email send failed with ${response.status}: ${message}`);
  }

  return result;
}

function buildTextBody(submission: ContactSubmission): string {
  return [
    "New Pathflow contact inquiry",
    "",
    `Name: ${submission.name}`,
    `Work email: ${submission.workEmail}`,
    `Company: ${submission.company || "Not provided"}`,
    `Interested in: ${submission.products.join(", ")}`,
    `Source: ${submission.source}`,
    "",
    "Details:",
    submission.details || "Not provided",
  ].join("\n");
}

function buildHtmlBody(submission: ContactSubmission): string {
  const detailHtml = escapeHtml(submission.details || "Not provided").replace(/\n/g, "<br>");

  return `
    <h2>New Pathflow contact inquiry</h2>
    <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">
      <tr><td><strong>Name</strong></td><td>${escapeHtml(submission.name)}</td></tr>
      <tr><td><strong>Work email</strong></td><td>${escapeHtml(submission.workEmail)}</td></tr>
      <tr><td><strong>Company</strong></td><td>${escapeHtml(submission.company || "Not provided")}</td></tr>
      <tr><td><strong>Interested in</strong></td><td>${escapeHtml(submission.products.join(", "))}</td></tr>
      <tr><td><strong>Source</strong></td><td>${escapeHtml(submission.source)}</td></tr>
    </table>
    <h3>Details</h3>
    <p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5">${detailHtml}</p>
  `;
}

function readString(value: unknown, maxLength: number): string {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();
  return trimmed.length <= maxLength ? trimmed : "";
}

function readProducts(value: unknown): string[] {
  const rawProducts = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];

  return rawProducts
    .map((item) => readString(item, 80))
    .filter(Boolean)
    .filter((item, index, items) => items.indexOf(item) === index);
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function formatEmailAddress(email: string, name: string): string {
  const safeName = name.replace(/[<>"\r\n]/g, "").trim();
  return safeName ? `${safeName} <${email}>` : email;
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const current = submissionAttempts.get(key);

  if (!current || current.resetAt <= now) {
    submissionAttempts.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    pruneRateLimits(now);
    return false;
  }

  current.count += 1;
  return current.count > RATE_LIMIT_MAX;
}

function pruneRateLimits(now: number): void {
  if (submissionAttempts.size < 500) {
    return;
  }

  for (const [key, value] of submissionAttempts) {
    if (value.resetAt <= now) {
      submissionAttempts.delete(key);
    }
  }
}

function isOriginAllowed(origin: string, env: Env): boolean {
  if (!origin) {
    return true;
  }

  return getAllowedOrigins(env).has(origin);
}

function getAllowedOrigins(env: Env): Set<string> {
  const configuredOrigins = env.ALLOWED_ORIGINS
    ? env.ALLOWED_ORIGINS.split(",").map((item) => item.trim()).filter(Boolean)
    : [];

  return new Set(configuredOrigins.length > 0 ? configuredOrigins : DEFAULT_ALLOWED_ORIGINS);
}

function corsHeaders(origin: string, env: Env): Headers {
  const headers = new Headers({
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  });

  if (origin && isOriginAllowed(origin, env)) {
    headers.set("Access-Control-Allow-Origin", origin);
  }

  return headers;
}

function jsonResponse(body: Record<string, unknown>, status: number, origin: string, env: Env): Response {
  const headers = corsHeaders(origin, env);
  headers.set("Content-Type", "application/json; charset=utf-8");

  return new Response(JSON.stringify(body), { status, headers });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function serializeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return { name: error.name, message: error.message };
  }

  return { error };
}
