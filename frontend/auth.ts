import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import type { NextAuthConfig } from "next-auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function syncWithBackend(email: string, name: string, image?: string | null) {
  const res = await fetch(`${API_BASE}/api/users/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name, image }),
  });
  if (!res.ok) throw new Error("Failed to sync user with backend");
  return res.json() as Promise<{
    access_token: string;
    user: { id: string; email: string; name: string; image: string | null };
  }>;
}

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const name = (credentials?.name as string) || email.split("@")[0];
        if (!email) return null;

        const data = await syncWithBackend(email, name);
        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          accessToken: data.access_token,
        };
      },
    }),
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET
      ? [
          GitHub({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
          }),
        ]
      : []),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user?.accessToken) {
        token.accessToken = user.accessToken as string;
        token.id = user.id;
        return token;
      }

      if (account?.provider === "github" && profile?.email) {
        const data = await syncWithBackend(
          profile.email as string,
          (profile.name as string) || "GitHub User",
          profile.avatar_url as string
        );
        token.accessToken = data.access_token;
        token.id = data.user.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      if (token.accessToken) session.accessToken = token.accessToken as string;
      return session;
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET ?? "dev-secret-change-in-production",
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
