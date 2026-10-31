type Props = { title: string; coverUrl: string | null; className?: string };

// Open Library covers come from several hosts, so a plain <img> is simpler than next/image here
export function BookCover({ title, coverUrl, className = "" }: Props) {
  if (!coverUrl) {
    return (
      <div
        className={`flex aspect-[2/3] items-center justify-center rounded-md bg-accent/90 p-3 text-center font-serif text-sm text-white shadow-sm ${className}`}
      >
        {title}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={coverUrl}
      alt={`Cover of ${title}`}
      loading="lazy"
      className={`aspect-[2/3] w-full rounded-md object-cover shadow-sm ${className}`}
    />
  );
}
