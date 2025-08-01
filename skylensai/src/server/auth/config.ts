import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { db } from "~/server/db";
import { env } from "~/env";
import { checkRateLimit, RATE_LIMITS } from "~/lib/rate-limiter";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      subscriptionTier: string;
    } & DefaultSession["user"];
  }

  interface User {
    subscriptionTier: string;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
// Validation schemas
const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authConfig = {
  providers: [
    // Email/Password provider for development
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        try {
          const { email, password } = signInSchema.parse(credentials);
          
          // Rate limiting for login attempts
          const clientId = email; // Use email as identifier for login attempts
          const rateLimitResult = checkRateLimit(`login:${clientId}`, RATE_LIMITS.AUTH_LOGIN);
          
          if (!rateLimitResult.success) {
            // Return null to indicate failed authentication
            return null;
          }
          
          // Find user in database with password
          const user = await db.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
              password: true,
              subscriptionTier: true,
            },
          });

          if (!user || !user.password) {
            // User doesn't exist or has no password set
            return null;
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            subscriptionTier: user.subscriptionTier,
          };
        } catch (error) {
          return null;
        }
      },
    }),
    
    // Discord OAuth provider (optional)
    ...(env.AUTH_DISCORD_ID && env.AUTH_DISCORD_SECRET 
      ? [DiscordProvider({
          clientId: env.AUTH_DISCORD_ID,
          clientSecret: env.AUTH_DISCORD_SECRET,
        })]
      : []
    ),
  ],
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.subscriptionTier = user.subscriptionTier;
      }
      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.id as string,
        subscriptionTier: token.subscriptionTier as string,
      },
    }),
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
} satisfies NextAuthConfig;
