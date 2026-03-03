"use client";

import { useEffect, useState } from "react";

import type { UserSearchResult } from "@/lib/types/domain";
import { UserListItem } from "@/components/follow/user-list-item";
import { Field, FieldContent, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

export function UserSearchPanel() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const normalized = query.trim();

    if (normalized.length < 2) {
      setUsers([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsLoading(true);

      try {
        const response = await fetch(
          `/api/search/users?q=${encodeURIComponent(normalized)}&limit=12`,
          {
            method: "GET",
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          setUsers([]);
          return;
        }

        const data = (await response.json()) as { users: UserSearchResult[] };
        setUsers(data.users ?? []);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  return (
    <section>
      <div className="border-b px-4 py-4 sm:px-6">
        <FieldGroup className="gap-2">
          <Field>
            <FieldLabel htmlFor="search-users">Buscar perfis</FieldLabel>
            <FieldContent>
              <Input
                id="search-users"
                placeholder="Busque por nome ou @username"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </FieldContent>
          </Field>
        </FieldGroup>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center px-4 py-10 text-sm text-muted-foreground sm:px-6">
          <Spinner />
        </div>
      ) : query.trim().length < 2 ? (
        <div className="px-4 py-10 text-sm text-muted-foreground sm:px-6">
          Digite pelo menos 2 caracteres para buscar.
        </div>
      ) : users.length === 0 ? (
        <div className="px-4 py-10 text-sm text-muted-foreground sm:px-6">Nenhum perfil encontrado.</div>
      ) : (
        <div>
          {users.map((user) => (
            <UserListItem key={user.id} user={user} />
          ))}
        </div>
      )}
    </section>
  );
}
