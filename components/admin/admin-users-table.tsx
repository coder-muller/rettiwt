import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Users } from "lucide-react";

import type { AdminUserListItem } from "@/lib/types/domain";
import { BanUserDialog } from "@/components/admin/ban-user-dialog";
import { DeleteUserDialog } from "@/components/admin/delete-user-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type AdminUsersTableProps = {
  users: AdminUserListItem[];
  currentAdminUserId: string;
};

function initials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function AdminUsersTable({ users, currentAdminUserId }: AdminUsersTableProps) {
  if (users.length === 0) {
    return (
      <Empty className="rounded-2xl border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Users />
          </EmptyMedia>
          <EmptyTitle>Nenhum usuario encontrado</EmptyTitle>
          <EmptyDescription>Refine o termo de busca para encontrar usuarios.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="rounded-2xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Criado</TableHead>
            <TableHead className="text-right">Acoes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const isSelf = user.id === currentAdminUserId;

            return (
              <TableRow key={user.id}>
                <TableCell className="min-w-[280px]">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 border">
                      <AvatarImage alt={user.name} src={user.avatar ?? undefined} />
                      <AvatarFallback>{initials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        <Link href={`/u/${user.username}`} className="hover:text-foreground">
                          @{user.username}
                        </Link>
                        {" · "}
                        {user.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{user.role}</Badge>
                </TableCell>
                <TableCell>
                  {user.banned ? (
                    <div className="space-y-1">
                      <Badge variant="destructive">Banido</Badge>
                      {user.banReason ? (
                        <p className="max-w-[220px] truncate text-xs text-muted-foreground">{user.banReason}</p>
                      ) : null}
                    </div>
                  ) : (
                    <Badge variant="secondary">Ativo</Badge>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDistanceToNow(user.createdAt, {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </TableCell>
                <TableCell>
                  {isSelf ? (
                    <p className="text-right text-xs text-muted-foreground">Conta atual</p>
                  ) : (
                    <div className="flex items-center justify-end gap-2">
                      <BanUserDialog userId={user.id} isBanned={user.banned} />
                      <DeleteUserDialog userId={user.id} userName={user.name} />
                    </div>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
