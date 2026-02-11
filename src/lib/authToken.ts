export const SESSION_COOKIE_NAME = "ct_session";
export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30;
const SESSION_DURATION_NO_REMEMBER_SECONDS = 60 * 60 * 24;

type SessionPayload = {
  u: string;
  exp: number;
};

export type Session = {
  username: string;
  exp: number;
};

function getRequiredEnv(name: "SESSION_SECRET" | "APP_USERNAME") {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required.`);
  }
  return value;
}

function getSubtle() {
  return globalThis.crypto.subtle;
}

async function importHmacKey(secret: string) {
  return getSubtle().importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function toBase64(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function fromBase64(input: string) {
  const binary = atob(input);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function encodeBase64Url(value: Uint8Array) {
  return toBase64(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  return fromBase64(base64 + padding);
}

async function sign(input: string, secret: string) {
  const key = await importHmacKey(secret);
  const signature = await getSubtle().sign("HMAC", key, new TextEncoder().encode(input));
  return new Uint8Array(signature);
}

export async function createSessionToken(username: string, remember = true) {
  const secret = getRequiredEnv("SESSION_SECRET");
  const now = Math.floor(Date.now() / 1000);
  const exp = remember
    ? now + SESSION_DURATION_SECONDS
    : now + SESSION_DURATION_NO_REMEMBER_SECONDS;
  const payload: SessionPayload = { u: username, exp };
  const payloadPart = encodeBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signaturePart = encodeBase64Url(await sign(payloadPart, secret));
  return `${payloadPart}.${signaturePart}`;
}

export async function verifySessionToken(token: string): Promise<Session | null> {
  const secret = getRequiredEnv("SESSION_SECRET");
  const appUsername = getRequiredEnv("APP_USERNAME");
  const [payloadPart, signaturePart] = token.split(".");
  if (!payloadPart || !signaturePart) return null;

  const key = await importHmacKey(secret);
  const isValid = await getSubtle().verify(
    "HMAC",
    key,
    decodeBase64Url(signaturePart),
    new TextEncoder().encode(payloadPart),
  );
  if (!isValid) return null;

  try {
    const payloadText = new TextDecoder().decode(decodeBase64Url(payloadPart));
    const payload = JSON.parse(payloadText) as SessionPayload;
    if (!payload?.u || !payload?.exp) return null;
    if (payload.exp <= Math.floor(Date.now() / 1000)) return null;
    if (payload.u !== appUsername) return null;
    return { username: payload.u, exp: payload.exp };
  } catch {
    return null;
  }
}

export function getAppUsername() {
  return getRequiredEnv("APP_USERNAME");
}

export function sanitizeNextPath(input: string | null | undefined) {
  if (!input) return "/";
  if (!input.startsWith("/")) return "/";
  if (input.startsWith("//")) return "/";
  return input;
}
