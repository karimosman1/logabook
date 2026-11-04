import Link from "next/link";
import { Logo } from "@/components/logo";
import { logout } from "../(auth)/actions";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-t-4 border-t-accent border-b border-line bg-paper-raised/85 backdrop-blur">
        <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link href="/" aria-label="Logabook home">
            <Logo />
          </Link>
          <Link href="/" className="text-sm text-ink-muted hover:text-ink">
            Calendar
          </Link>
          <Link href="/books" className="text-sm text-ink-muted hover:text-ink">
            Library
          </Link>
          <Link href="/log" className="text-sm text-ink-muted hover:text-ink">
            Log reading
          </Link>
          <Link href="/dashboard" className="text-sm text-ink-muted hover:text-ink">
            Dashboard
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/books/new"
              className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent/90"
            >
              Add book
            </Link>
            <form action={logout}>
              <button type="submit" className="text-sm text-ink-muted hover:text-ink">
                Log out
              </button>
            </form>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
