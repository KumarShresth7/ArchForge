"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-8 w-20 animate-pulse rounded-lg bg-zinc-800" />;
  }

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="rounded-lg bg-sky-500/15 px-4 py-1.5 text-sm font-medium text-sky-400 transition-colors hover:bg-sky-500/25"
      >
        Sign in
      </Link>
    );
  }

  const initials = session.user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/dashboard"
        className="hidden text-zinc-400 transition-colors hover:text-zinc-200 sm:block"
      >
        Dashboard
      </Link>
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-xs font-bold text-white">
          {initials || "U"}
        </div>
        <span className="hidden max-w-[120px] truncate text-sm text-zinc-300 sm:block">
          {session.user.name}
        </span>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/problems" })}
        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-500 transition-colors hover:border-white/20 hover:text-zinc-300"
      >
        Sign out
      </button>
    </div>
  );
}
