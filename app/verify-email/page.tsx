import { redirect } from "next/navigation";

import { VerifyEmailForm } from "@/components/auth/verify-email-form";
import { LogoIcon } from "@/components/ui/logo-icon";
import { getSession } from "@/lib/auth/session";

type VerifyEmailPageProps = {
  searchParams: Promise<{
    email?: string;
  }>;
};

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = await searchParams;
  const session = await getSession();

  if (session?.user.emailVerified) {
    redirect("/feed");
  }

  const emailFromQuery = params.email?.trim().toLowerCase() ?? "";
  const initialEmail = session?.user.email ?? emailFromQuery;

  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto grid min-h-dvh w-full max-w-[1100px] grid-cols-1 lg:grid-cols-2">
        <section className="hidden lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-12">
          <div className="max-w-sm space-y-8">
            <LogoIcon className="size-16 text-foreground" title="Rettiwt" />
            <h1 className="text-balance text-[42px] font-extrabold leading-[1.1] tracking-tight">Quase la</h1>
            <p className="text-lg text-muted-foreground">Confirme seu e-mail para continuar no Rettiwt.</p>
          </div>
        </section>

        <section className="flex min-h-dvh flex-col items-center justify-center p-6">
          <div className="mb-8 lg:hidden">
            <LogoIcon className="mx-auto size-10 text-foreground" title="Rettiwt" />
          </div>
          <div className="w-full max-w-[380px]">
            <VerifyEmailForm initialEmail={initialEmail} />
          </div>
        </section>
      </div>
    </main>
  );
}
