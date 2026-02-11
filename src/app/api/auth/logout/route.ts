import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/authToken";

export async function POST() {
  const response = new NextResponse(null, { status: 200 });
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });
  return response;
}
