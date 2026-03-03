import { UserSearchPanel } from "@/components/search/user-search-panel";

export default function SearchPage() {
  return (
    <section>
      <header className="sticky top-0 z-10 border-b bg-background/90 px-4 py-3 backdrop-blur sm:px-6">
        <h1 className="text-lg font-semibold">Buscar</h1>
      </header>

      <UserSearchPanel />
    </section>
  );
}
