import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { canAccess } from "@/lib/authz";

export default auth((req) => {
  const { nextUrl } = req;
  const path = nextUrl.pathname;

  if (path.startsWith("/api/auth")) return NextResponse.next();

  const session = req.auth;
  const role = session?.user?.role;

  if (canAccess(path, role)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", nextUrl.origin);
  loginUrl.searchParams.set("callbackUrl", nextUrl.pathname + nextUrl.search);
  return NextResponse.redirect(loginUrl);
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|uploads/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|pdf|css|js|woff2?)$).*)",
  ],
};
