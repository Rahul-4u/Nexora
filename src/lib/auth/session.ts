import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { RoleCode } from "@prisma/client";

export const SESSION_COOKIE_NAME = "nexora_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  role: RoleCode;
  permissions: string[];
}

function getSecretKey(): Uint8Array {
  const secret =
    process.env.AUTH_SECRET ||
    "nexora-dev-fallback-secret-change-in-production-32chars";
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (
      typeof payload.userId !== "string" ||
      typeof payload.organizationId !== "string" ||
      typeof payload.role !== "string"
    ) {
      return null;
    }
    return {
      userId: payload.userId,
      email: String(payload.email ?? ""),
      name: String(payload.name ?? ""),
      organizationId: payload.organizationId,
      organizationName: String(payload.organizationName ?? ""),
      organizationSlug: String(payload.organizationSlug ?? ""),
      role: payload.role as RoleCode,
      permissions: Array.isArray(payload.permissions)
        ? payload.permissions.map(String)
        : [],
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await signSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getServerSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
