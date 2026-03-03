import { headers } from "next/headers";

import { auth } from "@/lib/auth/server";
import type { AdminUserListItem } from "@/lib/types/domain";

type ServiceErrorResult = {
  success: false;
  message: string;
};

type ServiceSuccessResult<T> = {
  success: true;
  data: T;
};

type ServiceResult<T> = ServiceErrorResult | ServiceSuccessResult<T>;

function toErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }

  return fallback;
}

function mapAdminUser(row: Record<string, unknown>): AdminUserListItem {
  const banExpiresValue = row.banExpires;
  const createdAtValue = row.createdAt;
  const parsedCreatedAt = createdAtValue ? new Date(String(createdAtValue)) : new Date(0);
  const parsedBanExpires = banExpiresValue ? new Date(String(banExpiresValue)) : null;

  return {
    id: String(row.id ?? ""),
    name: String(row.name ?? ""),
    email: String(row.email ?? ""),
    username: String(row.username ?? ""),
    role: typeof row.role === "string" && row.role.trim().length > 0 ? row.role : "user",
    banned: Boolean(row.banned),
    banReason: typeof row.banReason === "string" ? row.banReason : null,
    banExpires: parsedBanExpires && !Number.isNaN(parsedBanExpires.getTime()) ? parsedBanExpires : null,
    createdAt: Number.isNaN(parsedCreatedAt.getTime()) ? new Date(0) : parsedCreatedAt,
    avatar: typeof row.image === "string" ? row.image : null,
  };
}

async function listUsersByField(searchField: "name" | "email", q: string) {
  const result = await auth.api.listUsers({
    headers: await headers(),
    query: {
      searchValue: q,
      searchField,
      searchOperator: "contains",
      limit: 50,
      offset: 0,
    },
  });

  return result.users.map((user) => mapAdminUser(user as unknown as Record<string, unknown>));
}

export const adminService = {
  async listUsers(q?: string): Promise<ServiceResult<AdminUserListItem[]>> {
    try {
      const query = q?.trim();

      if (!query) {
        const result = await auth.api.listUsers({
          headers: await headers(),
          query: {
            limit: 50,
            offset: 0,
            sortBy: "createdAt",
            sortDirection: "desc",
          },
        });

        return {
          success: true,
          data: result.users.map((user) => mapAdminUser(user as unknown as Record<string, unknown>)),
        };
      }

      const [nameMatches, emailMatches] = await Promise.all([
        listUsersByField("name", query),
        listUsersByField("email", query),
      ]);

      const unique = new Map<string, AdminUserListItem>();

      for (const user of [...nameMatches, ...emailMatches]) {
        unique.set(user.id, user);
      }

      return {
        success: true,
        data: Array.from(unique.values()),
      };
    } catch (error) {
      return {
        success: false,
        message: toErrorMessage(error, "Nao foi possivel listar os usuarios."),
      };
    }
  },

  async banUser(input: {
    actorId: string;
    userId: string;
    banReason?: string;
    banExpiresIn?: number;
  }): Promise<ServiceResult<null>> {
    if (input.actorId === input.userId) {
      return {
        success: false,
        message: "Voce nao pode banir a propria conta.",
      };
    }

    try {
      await auth.api.banUser({
        headers: await headers(),
        body: {
          userId: input.userId,
          banReason: input.banReason,
          banExpiresIn: input.banExpiresIn,
        },
      });

      return {
        success: true,
        data: null,
      };
    } catch (error) {
      return {
        success: false,
        message: toErrorMessage(error, "Nao foi possivel banir o usuario."),
      };
    }
  },

  async unbanUser(userId: string): Promise<ServiceResult<null>> {
    try {
      await auth.api.unbanUser({
        headers: await headers(),
        body: {
          userId,
        },
      });

      return {
        success: true,
        data: null,
      };
    } catch (error) {
      return {
        success: false,
        message: toErrorMessage(error, "Nao foi possivel remover o banimento."),
      };
    }
  },

  async removeUser(input: { actorId: string; userId: string }): Promise<ServiceResult<null>> {
    if (input.actorId === input.userId) {
      return {
        success: false,
        message: "Voce nao pode remover a propria conta.",
      };
    }

    try {
      await auth.api.removeUser({
        headers: await headers(),
        body: {
          userId: input.userId,
        },
      });

      return {
        success: true,
        data: null,
      };
    } catch (error) {
      return {
        success: false,
        message: toErrorMessage(error, "Nao foi possivel remover o usuario."),
      };
    }
  },
};
