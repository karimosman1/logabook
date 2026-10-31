"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const selectClass =
  "rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20";

export function LibraryFilters({ genres }: { genres: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");

  // Filters live in the URL so they survive a refresh and work with the Starred tab
  function update(name: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(name, value);
    else next.delete(name);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  // Search as you type, waiting for a short pause so every keystroke isn't a new request
  useEffect(() => {
    if (query === (params.get("q") ?? "")) return;
    const timer = setTimeout(() => update("q", query.trim()), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search title or author"
        aria-label="Search title or author"
        className={`${selectClass} min-w-56 flex-1`}
      />
      <select
        aria-label="Filter by status"
        value={params.get("status") ?? ""}
        onChange={(e) => update("status", e.target.value)}
        className={selectClass}
      >
        <option value="">Any status</option>
        <option value="reading">Reading</option>
        <option value="want_to_read">Want to read</option>
        <option value="finished">Finished</option>
      </select>
      <select
        aria-label="Filter by genre"
        value={params.get("genre") ?? ""}
        onChange={(e) => update("genre", e.target.value)}
        className={selectClass}
      >
        <option value="">Any genre</option>
        {genres.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>
      <select
        aria-label="Sort by"
        value={params.get("sort") ?? "recent"}
        onChange={(e) => update("sort", e.target.value === "recent" ? "" : e.target.value)}
        className={selectClass}
      >
        <option value="recent">Last read</option>
        <option value="title">Title (A–Z)</option>
        <option value="year">Year published (newest)</option>
        <option value="added">Recently added</option>
      </select>
    </div>
  );
}
