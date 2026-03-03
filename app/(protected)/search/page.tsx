import { UserSearchPanel } from "@/components/search/user-search-panel";

export default function SearchPage() {
  return (
    <section>
      <header className="sticky top-0 z-10 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <h1 className="text-[17px] font-extrabold">Buscar</h1>
      </header>

      <UserSearchPanel />
    </section>
  );
}
