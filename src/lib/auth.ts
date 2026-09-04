import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { AccountStatus, Role } from "@prisma/client";
import type { JWT } from "next-auth/jwt";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login", signOut: "/login", error: "/login" },
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const found = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase().trim() },
          include: { studentProfile: { select: { id: true } }, mentorProfile: { select: { id: true } } },
        });
        if (!found || !found.passwordHash) return null;

        const valid = await compare(parsed.data.password, found.passwordHash);
        if (!valid) return null;

        if (found.status === "PENDING") return null;
        if (found.status === "REJECTED") return null;

        const user = found as typeof found & {
          studentProfile?: { id: string } | null;
          mentorProfile?: { id: string } | null;
        };

        await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          status: user.status,
          studentProfileId: user.studentProfile?.id ?? null,
          mentorProfileId: user.mentorProfile?.id ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      const jwtToken = token as JWT & {
        id?: string;
        role?: Role;
        status?: AccountStatus;
        studentProfileId?: string | null;
        mentorProfileId?: string | null;
      };
      if (user) {
        const u = user as { id: string; role: Role; status: AccountStatus; studentProfileId?: string | null; mentorProfileId?: string | null };
        jwtToken.id = u.id;
        jwtToken.role = u.role;
        jwtToken.status = u.status;
        jwtToken.studentProfileId = u.studentProfileId;
        jwtToken.mentorProfileId = u.mentorProfileId;
      }
      if (trigger === "update" && jwtToken.id) {
        const fresh = await prisma.user.findUnique({
          where: { id: jwtToken.id },
          include: { studentProfile: { select: { id: true } }, mentorProfile: { select: { id: true } } },
        });
        if (fresh) {
          const f = fresh as typeof fresh & {
            studentProfile?: { id: string } | null;
            mentorProfile?: { id: string } | null;
          };
          jwtToken.role = fresh.role;
          jwtToken.status = fresh.status;
          jwtToken.name = fresh.name;
          jwtToken.image = fresh.image;
          jwtToken.studentProfileId = f.studentProfile?.id ?? null;
          jwtToken.mentorProfileId = f.mentorProfile?.id ?? null;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const t = token as JWT & {
          id?: string;
          role?: Role;
          status?: AccountStatus;
          studentProfileId?: string | null;
          mentorProfileId?: string | null;
        };
        session.user.id = t.id ?? "";
        session.user.role = t.role ?? "STUDENT";
        session.user.status = t.status ?? "PENDING";
        session.user.studentProfileId = t.studentProfileId;
        session.user.mentorProfileId = t.mentorProfileId;
      }
      return session;
    },
  },
});
