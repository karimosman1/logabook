import { createClient } from "@/lib/supabase/server";
import { logout } from "./(auth)/actions";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("display_name, daily_page_goal")
    .eq("id", user!.id)
    .single();

  const name = profile?.display_name || user!.email;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-ink">Logabook</h1>
        <form action={logout}>
          <button type="submit" className="rounded-md border border-line px-3 py-1.5 text-sm text-ink hover:bg-paper-raised">
            Log out
          </button>
        </form>
      </header>

      <section className="mt-10 rounded-xl border border-line bg-paper-raised p-8">
        <p className="text-lg text-ink">Hi, {name}.</p>
        <p className="mt-2 text-ink-muted">
          Your daily goal is {profile?.daily_page_goal ?? 10} pages. Your library will show up here.
        </p>
      </section>
    </main>
  );
}
