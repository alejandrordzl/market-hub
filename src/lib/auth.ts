import { NextRequest } from "next/server";
import { Role } from "@/utils/types";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthOptions, DefaultSession, DefaultUser } from "next-auth";
import { prisma } from "@/clients";
import { DefaultJWT } from "next-auth/jwt";
export interface AuthenticatedUser {
  id: number;
  role: Role;
}

// Extend the Session type to include user.id
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: Role;
      name: string | null;
      email: string | null;
    };
  }
  interface User extends DefaultUser {
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    sub: string;
    role: Role;
    email: string | null;
    name: string | null;
  }
}

// Helper para obtener usuario del middleware global
export function getAuthenticatedUser(request: NextRequest): AuthenticatedUser {
  return {
    id: parseInt(request.headers.get("x-user-id") || "0"),
    role: (request.headers.get("x-user-role") || "USER") as Role,
  };
}

// Helpers de conveniencia
export function isAdmin(user: AuthenticatedUser): boolean {
  return user.role === "ADMIN" || user.role === "SUPER_ADMIN";
}

export function isSuperAdmin(user: AuthenticatedUser): boolean {
  return user.role === "SUPER_ADMIN";
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        userId: { label: "User ID", type: "number" },
      },
      async authorize(credentials) {
        if (!credentials?.userId) {
          throw new Error("User ID is required");
        }
        const id = parseInt(credentials.userId);
        const user = await prisma.user.findUnique({
          where: { id },
        });
        if (!user || !user.role) return null;
        return {
          role: user.role,
          id: user.id.toString(),
          name: user.name || "",
          email: user.email || "",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.email = user.email || null;
        token.name = user.name || null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as Role;
        session.user.email = token.email;
        session.user.name = token.name;
      }
      return session;
    },
  },
};
