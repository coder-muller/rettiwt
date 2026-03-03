import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { createAccessControl } from "better-auth/plugins/access";
import { admin } from "better-auth/plugins/admin";
import { haveIBeenPwned } from "better-auth/plugins/haveibeenpwned";
import { username } from "better-auth/plugins/username";

import { prisma } from "@/lib/db/prisma";

const adminAc = createAccessControl({
  user: ["get", "list", "ban", "delete"] as const,
});

const adminRoles = {
  admin: adminAc.newRole({
    user: ["get", "list", "ban", "delete"],
  }),
  user: adminAc.newRole({
    user: [],
  }),
};

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    nextCookies(),
    username({
      minUsernameLength: 3,
      maxUsernameLength: 30,
      usernameValidator: (value) => /^[a-zA-Z0-9_.]+$/.test(value),
    }),
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
      bannedUserMessage: "Sua conta foi suspensa por violar as regras da plataforma.",
      ac: adminAc,
      roles: adminRoles,
    }),
    haveIBeenPwned({
      paths: ["/change-password", "/reset-password"],
      customPasswordCompromisedMessage:
        "Essa senha apareceu em vazamentos conhecidos. Escolha uma senha diferente.",
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type SessionUser = typeof auth.$Infer.Session.user;
