// The Logabook mark: an open book with a mustard bookmark, on the app's green
export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#2f6b4f" />
      <path d="M5.5 10.2c3.6-1.7 7.2-1.4 10.5.9v12.6c-3.3-2.2-6.9-2.5-10.5-.9z" fill="#faf7f0" />
      <path d="M26.5 10.2c-3.6-1.7-7.2-1.4-10.5.9v12.6c3.3-2.2 6.9-2.5 10.5-.9z" fill="#ffffff" />
      <path d="M8.2 13.4c1.9-.6 3.8-.4 5.6.4M8.2 16.4c1.9-.6 3.8-.4 5.6.4M8.2 19.4c1.9-.6 3.8-.4 5.6.4" stroke="#c9bfa9" strokeWidth="1.1" strokeLinecap="round" fill="none" />
      <path d="M19.6 10.1v7.4l1.7-1.3 1.7 1.3V9.6" fill="#e0b341" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark />
      <span className="font-serif text-2xl text-ink">
        Log<span className="text-accent">a</span>book
      </span>
    </span>
  );
}
