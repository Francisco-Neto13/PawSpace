import Link from 'next/link';

interface AuthBackLinkProps {
  href: string;
  label: string;
}

export default function AuthBackLink({ href, label }: AuthBackLinkProps) {
  return (
    <div className="fixed left-8 top-8 z-50">
      <Link
        href={href}
        className="group inline-flex cursor-pointer items-center gap-3 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-strong)]/60 px-4 py-2.5 shadow-xl backdrop-blur-xl transition-all hover:border-[var(--border-visible)]"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.05] transition-all group-hover:bg-white/[0.08]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[var(--text-muted)] transition-all group-hover:-translate-x-0.5 group-hover:text-[var(--text-primary)]"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </div>
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)] transition-colors group-hover:text-[var(--text-secondary)]">
          {label}
        </span>
      </Link>
    </div>
  );
}
