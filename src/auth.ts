// ====================================================================
// Taswerak — Auth.js v5 configuration (Node runtime)
// Credentials provider + bcryptjs. Used by route handlers + server actions.
// ====================================================================

import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { authConfig } from "@/auth.config";
import { rateLimitPresets } from "@/lib/services/rate-limit";

// ====================================================================
// Impersonation credentials provider — SECURED with HMAC token
// Admin invokes signIn("impersonation", { token })
// where token = "targetUserId:adminUserId:timestamp:hmac"
// generated server-side in the impersonate API route.
// The provider validates the HMAC signature + 30s expiry before
// swapping the session to the target user.
// ====================================================================

/** Generate a signed impersonation token (used by the admin API route). */
export function createImpersonationToken(targetUserId: string, adminUserId: string): string {
  const secret = process.env.AUTH_SECRET || "";
  const ts = Date.now().toString();
  const data = `${targetUserId}:${adminUserId}:${ts}`;
  const hmac = crypto.createHmac("sha256", secret).update(data).digest("hex");
  return `${data}:${hmac}`;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers: [
    Credentials({
      id: "impersonation",
      name: "impersonation",
      credentials: {
        token: { label: "Impersonation Token", type: "text" },
      },
      authorize: async (creds) => {
        // Validate the cryptographically signed token
        const token = creds?.token?.toString();
        if (!token) return null;

        const secret = process.env.AUTH_SECRET || "";
        const parts = token.split(":");
        if (parts.length !== 4) return null;
        const [targetUserId, adminUserId, ts, hmac] = parts;

        // Verify expiry (30 seconds)
        const age = Date.now() - parseInt(ts, 10);
        if (isNaN(age) || age < 0 || age > 30_000) return null;

        // Verify HMAC signature
        const data = `${targetUserId}:${adminUserId}:${ts}`;
        const expectedHmac = crypto.createHmac("sha256", secret).update(data).digest("hex");
        if (!crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac))) return null;

        // Verify admin exists and is actually an ADMIN
        const admin = await db.user.findUnique({
          where: { id: adminUserId },
          select: { role: true },
        });
        if (!admin || admin.role !== "ADMIN") return null;

        try {
          const target = await db.user.findUnique({
            where: { id: targetUserId },
            select: {
              id: true, email: true, name: true, image: true,
              role: true, isBanned: true,
            },
          });
          if (!target) return null;
          if (target.isBanned) return null;
          // Cannot impersonate admins
          if (target.role === "ADMIN") return null;

          // Return target user, but with a marker that the JWT callback reads
          return {
            id: target.id,
            email: target.email,
            name: target.name,
            image: target.image,
            role: target.role,
            // Custom field — JWT callback will read this
            impersonatedBy: adminUserId,
          } as any;
        } catch {
          return null;
        }
      },
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "البريد الإلكتروني", type: "email" },
        password: { label: "كلمة المرور", type: "password" },
      },
      authorize: async (creds, req) => {
        const email = creds?.email?.toString().toLowerCase().trim();
        const password = creds?.password?.toString();
        if (!email || !password) return null;

        // Rate limit login attempts: 10 per minute per IP
        const forwarded = req?.headers?.get?.("x-forwarded-for");
        const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
        const rl = rateLimitPresets.login(ip);
        if (!rl.success) {
          throw new Error("محاولات دخول كثيرة. حاول بعد دقيقة.");
        }

        const user = await db.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            role: true,
            password: true,
            isBanned: true,
          },
        });

        if (!user || !user.password) return null;
        if (user.isBanned) {
          throw new Error("هذا الحساب موقوف. تواصل مع الإدارة.");
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: Role }).role;
        // Capture impersonation marker from impersonation provider
        const imp = (user as { impersonatedBy?: string }).impersonatedBy;
        if (imp) {
          token.impersonatedBy = imp;
        } else {
          // Clear impersonation on regular sign-in
          delete token.impersonatedBy;
        }
      }
      return token;
    },
    session: ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        (session.user as any).impersonatedBy = token.impersonatedBy as string | undefined;
      }
      return session;
    },
  },
});
