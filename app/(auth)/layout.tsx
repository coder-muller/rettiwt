import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (session) {
    redirect("/feed");
  }

  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto grid min-h-dvh w-full max-w-[1600px] grid-cols-1 lg:grid-cols-[1.15fr_520px]">
        <section className="hidden border-r p-10 lg:flex lg:flex-col lg:justify-between">
          <div>
            <Button asChild variant="ghost" className="-ml-3 w-fit">
              <Link href="/">
                <ArrowLeft className="size-4" />
                Voltar
              </Link>
            </Button>
          </div>

          <div className="space-y-6">
            <p className="text-sm uppercase text-muted-foreground">Rettiwt</p>
            <h1 className="text-balance text-5xl font-semibold leading-tight">
              Converse em tempo real com foco no que importa: texto.
            </h1>
            <p className="max-w-md text-pretty text-base text-muted-foreground">
              Um MVP inspirado no X, direto ao ponto, com feed cronologico e identidade por username.
            </p>
          </div>

          <div className="text-xs text-muted-foreground">Rettiwt MVP</div>
        </section>

        <section className="flex min-h-dvh items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-md">{children}</div>
        </section>
      </div>
    </main>
  );
}
