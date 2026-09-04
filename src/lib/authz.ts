import type { Role } from "@prisma/client";

export const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/projects",
  "/mentors",
  "/jobs",
  "/u",
  "/about",
];

export const ROLE_GATES: { prefix: string; roles: Role[]; apiOnly?: boolean }[] = [
  { prefix: "/admin", roles: ["ADMIN"] },
  { prefix: "/api/admin", roles: ["ADMIN"], apiOnly: true },
  { prefix: "/api/me", roles: ["STUDENT", "MENTOR", "RECRUITER", "ADMIN"] },
  { prefix: "/api/milestones", roles: ["STUDENT"] },
  { prefix: "/api/students", roles: ["STUDENT"] },
  { prefix: "/api/bookings", roles: ["STUDENT", "MENTOR"] },
  { prefix: "/api/slots", roles: ["MENTOR"] },
  { prefix: "/api/jobs", roles: ["RECRUITER", "STUDENT", "ADMIN"] },
  { prefix: "/api/applications", roles: ["STUDENT", "RECRUITER"] },
  { prefix: "/api/projects", roles: ["STUDENT", "MENTOR", "RECRUITER", "ADMIN"] },
  { prefix: "/api/notifications", roles: ["STUDENT", "MENTOR", "RECRUITER", "ADMIN"] },
  { prefix: "/api/upload", roles: ["STUDENT", "MENTOR", "RECRUITER", "ADMIN"] },
  { prefix: "/dashboard", roles: ["STUDENT", "MENTOR", "RECRUITER", "ADMIN"] },
];

export function isPublicPath(path: string): boolean {
  return (
    PUBLIC_PATHS.some((p) => p === "/" ? path === "/" : path.startsWith(p) || path === p) ||
    /^\/u\/.+/.test(path)
  );
}

export function gateForPath(path: string): Role[] | null {
  const match = ROLE_GATES.find((gate) => path === gate.prefix || path.startsWith(gate.prefix + "/") || path.startsWith(gate.prefix + "?"));
  return match ? match.roles : null;
}

export function canAccess(path: string, role: Role | undefined): boolean {
  if (isPublicPath(path)) return true;
  if (!role) return false;
  const allowed = gateForPath(path);
  if (!allowed) return true; // unlisted routes are handled at the handler level
  return allowed.includes(role);
}
