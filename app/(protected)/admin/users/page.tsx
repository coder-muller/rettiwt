import type { Metadata } from "next";
import Link from "next/link";

import { AdminUsersTable } from "@/components/admin/admin-users-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireAdminSession } from "@/lib/auth/session";
import { adminService } from "@/lib/services/admin-service";
import { adminUserQuerySchema } from "@/lib/validation/admin";

export const metadata: Metadata = {
  title: "Admin | Rettiwt",
};

type AdminUsersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const session = await requireAdminSession();
  const rawParams = await searchParams;
  const qParam = rawParams.q;
  const parsed = adminUserQuerySchema.safeParse({
    q: Array.isArray(qParam) ? qParam[0] : qParam,
  });

  const query = parsed.success ? parsed.data.q?.trim() : undefined;
  const listUsersResult = await adminService.listUsers(query);

  return (
    <section>
      <header className="sticky top-0 z-10 border-b bg-background/90 px-4 py-3 backdrop-blur sm:px-6">
        <div className="space-y-3">
          <div>
            <h1 className="text-lg font-semibold">Admin</h1>
            <p className="text-sm text-muted-foreground">Gerencie usuarios, banimentos e remocoes da plataforma.</p>
          </div>

          <form action="/admin/users" method="get" className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="search"
              name="q"
              defaultValue={query ?? ""}
              placeholder="Buscar por nome ou e-mail"
              className="sm:max-w-sm"
            />
            <Button type="submit" variant="secondary" className="sm:w-auto">
              Buscar
            </Button>
            {query ? (
              <Button asChild type="button" variant="ghost" className="sm:w-auto">
                <Link href="/admin/users">Limpar</Link>
              </Button>
            ) : null}
          </form>
        </div>
      </header>

      <div className="space-y-4 px-4 py-4 sm:px-6">
        {listUsersResult.success ? (
          <>
            <p className="text-xs text-muted-foreground">
              {listUsersResult.data.length} usuario(s) encontrado(s)
              {query ? ` para "${query}".` : "."}
            </p>
            <AdminUsersTable users={listUsersResult.data} currentAdminUserId={session.user.id} />
          </>
        ) : (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">{listUsersResult.message}</p>
          </div>
        )}
      </div>
    </section>
  );
}
