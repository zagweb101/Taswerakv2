// ====================================================================
// Augment NextAuth session/JWT types with the `role` field
// (Type augmentation lives here to avoid duplicate declarations
//  between auth.config.ts and auth.ts)
// ====================================================================
import { DefaultSession } from "next-auth";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    role?: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
  }
}
