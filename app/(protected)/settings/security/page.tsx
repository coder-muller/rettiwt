import { SecurityForm } from "@/components/profile/security-form";
import { SettingsNav } from "@/components/profile/settings-nav";
import { requireVerifiedSession } from "@/lib/auth/session";

export default async function SecuritySettingsPage() {
  await requireVerifiedSession();

  return (
    <section>
      <header className="sticky top-0 z-10 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <h1 className="text-[17px] font-extrabold">Configuracoes de seguranca</h1>
      </header>

      <SettingsNav />

      <div className="px-0 py-4">
        <SecurityForm />
      </div>
    </section>
  );
}
