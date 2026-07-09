// ====================================================================
// Taswerak — Auth.js v5 configuration (Node runtime)
// Credentials provider + bcryptjs. Used by route handlers + server actions.
// ====================================================================

import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { authConfig } from "@/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "البريد الإلكتروني", type: "email" },
        password: { label: "كلمة المرور", type: "password" },
      },
      authorize: async (creds) => {
        const email = creds?.email?.toString().toLowerCase().trim();
        const password = creds?.password?.toString();
        if (!email || !password) return null;

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
});
