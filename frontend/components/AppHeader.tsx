import Link from "next/link";
import UserMenu from "./UserMenu";

interface AppHeaderProps {
  breadcrumb?: string;
  right?: React.ReactNode;
}

export default function AppHeader({ breadcrumb, right }: AppHeaderProps) {
  return (
    <header className="relative z-20 flex h-14 shrink-0 items-center justify-between border-b border-white/5 bg-zinc-950/80 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <Link href="/problems" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 text-sm font-bold text-white shadow-lg shadow-sky-500/30">
            A
          </div>
          <span className="text-base font-semibold tracking-tight text-zinc-100">ArchForge</span>
        </Link>
        <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider text-sky-400">
          Beta
        </span>
        {breadcrumb && (
          <>
            <span className="text-zinc-600">/</span>
            <span className="max-w-[200px] truncate text-sm text-zinc-400 sm:max-w-none">{breadcrumb}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm">
        <Link href="/problems" className="hidden text-zinc-400 transition-colors hover:text-zinc-200 sm:block">
          Problems
        </Link>
        <Link href="/leaderboard" className="hidden text-zinc-400 transition-colors hover:text-zinc-200 sm:block">
          Leaderboard
        </Link>
        <Link href="/profile" className="hidden text-zinc-400 transition-colors hover:text-zinc-200 sm:block">
          Profile
        </Link>
        {right ?? <UserMenu />}
      </div>
    </header>
  );
}
