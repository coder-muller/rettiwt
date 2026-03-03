import { notFound } from "next/navigation";

import { ProfileForm } from "@/components/profile/profile-form";
import { requireSession } from "@/lib/auth/session";
import { profileService } from "@/lib/services/profile-service";

export default async function ProfileSettingsPage() {
  const session = await requireSession();

  await profileService.ensureProfileForUser({
    id: session.user.id,
    name: session.user.name,
    image: session.user.image,
  });

  const profile = await profileService.getOwnProfile(session.user.id);

  if (!profile) {
    notFound();
  }

  return (
    <section>
      <header className="sticky top-0 z-10 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <h1 className="text-[17px] font-extrabold">Configuracoes de perfil</h1>
      </header>

      <div className="px-0 py-4">
        <ProfileForm
          initialValues={{
            name: profile.name,
            username: profile.username,
            bio: profile.bio,
            avatarUrl: profile.avatarUrl,
          }}
        />
      </div>
    </section>
  );
}
