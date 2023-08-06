import Discord from "@auth/core/providers/discord";
import EmailProvider from "@auth/core/providers/email";
import type { DefaultSession } from "@auth/core/types";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";

import { prisma } from "@acme/db";

import { env } from "./env.mjs";

export type { Session } from "next-auth";

// Update this whenever adding new providers so that the client can
export const providers = ["discord", "email"] as const;
export type OAuthProviders = (typeof providers)[number];

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

export const {
  handlers: { GET, POST },
  auth,
  CSRF_experimental,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Discord({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    }),
    EmailProvider({
      // server: {
      // 	host: "localhost",
      // 	port: 1025,
      // 	secure: false,
      // 	tls: { rejectUnauthorized: false },
      // 	auth: {
      // 		user: "",
      // 		pass: "",
      // 		//   user: env.EMAIL_SERVER_USER,
      // 		//   pass: env.EMAIL_SERVER_PASSWORD,
      // 	},
      // },
      // // it is required in new version
      id: "email",
      name: "email",
      from: "admin@localhost",
      type: "email",
      sendVerificationRequest: (data) => {
        console.log("Sending verification request: ", data.url);
        // throw new Error("Not implemented");
      },
    }),
  ],
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),

    // @TODO - if you wanna have auth on the edge
    // jwt: ({ token, profile }) => {
    //   if (profile?.id) {
    //     token.id = profile.id;
    //     token.image = profile.picture;
    //   }
    //   return token;
    // },

    // @TODO
    // authorized({ request, auth }) {
    //   return !!auth?.user
    // }
  },
});
