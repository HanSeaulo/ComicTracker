import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import {
  createSessionToken,
  getAppUsername,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
} from "@/lib/authToken";

type LoginBody = {
  username?: unknown;
  password?: unknown;
  remember?: unknown;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as LoginBody | null;
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const remember = body?.remember !== false;

  const passwordHash = process.env.APP_PASSWORD_HASH?.trim();
  if (!passwordHash) {
    throw new Error("APP_PASSWORD_HASH is required.");
  }
  const appUsername = getAppUsername();

  const usernameMatches = username === appUsername;
  const passwordMatches = await bcrypt.compare(password, passwordHash);
  if (!usernameMatches || !passwordMatches) {
    return new NextResponse(null, { status: 401 });
  }

  const token = await createSessionToken(appUsername, remember);
  const response = new NextResponse(null, { status: 200 });
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: remember ? SESSION_DURATION_SECONDS : undefined,
  });
  return response;
}
