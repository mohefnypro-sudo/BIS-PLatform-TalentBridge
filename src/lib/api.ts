import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import type { Role } from "@prisma/client";

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function apiError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

export function handleError(error: unknown, fallback = "Something went wrong") {
  if (error instanceof ZodError) {
    return apiError("Validation failed", 422, error.flatten());
  }
  const err = error as { code?: string; message?: string };
  if (err?.code === "P2002") {
    return apiError("This record already exists (duplicate).", 409);
  }
  if (err?.code === "P2025") {
    return apiError("Record not found.", 404);
  }
  console.error("[api]", error);
  return apiError(err?.message ?? fallback, 500);
}

export interface SessionUser {
  id: string;
  role: Role;
  status: string;
  email?: string | null;
  name?: string | null;
  studentProfileId?: string | null;
  mentorProfileId?: string | null;
}

export async function requireUser(roles?: Role[]): Promise<
  { session: { user: SessionUser }; error: null } | { session: null; error: NextResponse }
> {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;
  if (!user) {
    return { session: null, error: apiError("Unauthorized. Please sign in.", 401) };
  }
  if (roles && !roles.includes(user.role)) {
    return { session: null, error: apiError("Forbidden. You do not have permission for this action.", 403) };
  }
  return { session: { user }, error: null };
}

export async function requireRole(...roles: Role[]): Promise<
  { user: SessionUser; error: null } | { user: null; error: NextResponse }
> {
  const result = await requireUser(roles);
  if (result.error) return { user: null, error: result.error };
  return { user: result.session.user, error: null };
}
