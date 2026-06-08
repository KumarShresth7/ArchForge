"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import type { Difficulty, ProblemSummary, ProblemProgress } from "@/lib/types";
import { getProgressMap } from "@/lib/progress";
import { fetchServerProgress } from "@/lib/auth-api";

const EMPTY_PROGRESS: ProblemProgress = {
  status: "not_started",
  bestScore: null,
  attemptCount: 0,
  lastAttemptAt: null,
};

const difficultyStyles: Record<Difficulty, string> = {
  easy: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  hard: "bg-rose-500/15 text-rose-400 border-rose-500/25",
};

function StatusCell({ progress }: { progress: ProblemProgress }) {
  if (progress.status === "solved") {
    return (
      <span className="flex items-center gap-1.5 text-emerald-400">
        <span className="text-base">✓</span>
        <span className="text-sm">{progress.bestScore}/100</span>
      </span>
    );
  }
  if (progress.status === "attempted") {
    return (
      <span className="text-sm text-amber-400">
        {progress.bestScore !== null ? `${progress.bestScore}/100` : "Attempted"}
      </span>
    );
  }
  return <span className="text-sm text-zinc-600">—</span>;
}

export default function ProblemList({ problems }: { problems: ProblemSummary[] }) {
  const { data: session } = useSession();
  const [progressMap, setProgressMap] = useState<Record<string, ProblemProgress>>({});
  const [filter, setFilter] = useState<Difficulty | "all">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadProgress() {
      if (session?.accessToken) {
        try {
          const server = await fetchServerProgress(session.accessToken);
          setProgressMap(server);
          return;
        } catch {
          /* fall through to local */
        }
      }
      setProgressMap(getProgressMap());
    }
    loadProgress();
  }, [session?.accessToken]);

  const filtered = useMemo(() => {
    return problems.filter((p) => {
      const matchesFilter = filter === "all" || p.difficulty === filter;
      const matchesSearch =
        search === "" ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      return matchesFilter && matchesSearch;
    });
  }, [problems, filter, search]);

  const stats = useMemo(() => {
    const values = Object.values(progressMap);
    return {
      solved: values.filter((p) => p.status === "solved").length,
      attempted: values.filter((p) => p.status === "attempted").length,
    };
  }, [progressMap]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Problems", value: problems.length },
          { label: "Solved", value: stats.solved },
          { label: "Attempted", value: stats.attempted },
          { label: "Remaining", value: problems.length - stats.solved },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-white/5 bg-zinc-900/50 px-4 py-3 backdrop-blur-sm">
            <p className="text-xs text-zinc-500">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-zinc-100">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          placeholder="Search problems or tags…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-sky-500/50 sm:max-w-xs"
        />
        <div className="flex gap-2">
          {(["all", "easy", "medium", "hard"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setFilter(d)}
              className={[
                "rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                filter === d ? "bg-sky-500/20 text-sky-400" : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300",
              ].join(" ")}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/5">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-zinc-900/80 text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Problem</th>
              <th className="hidden px-5 py-3 font-medium sm:table-cell">Difficulty</th>
              <th className="hidden px-5 py-3 font-medium md:table-cell">Tags</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((problem) => {
              const progress = progressMap[problem.slug] ?? EMPTY_PROGRESS;
              return (
                <tr key={problem.slug} className="group border-b border-white/5 transition-colors hover:bg-zinc-900/60">
                  <td className="px-5 py-4">
                    <StatusCell progress={progress} />
                  </td>
                  <td className="px-5 py-4">
                    <Link href={`/problems/${problem.slug}`} className="font-medium text-zinc-200 transition-colors group-hover:text-sky-400">
                      {problem.title}
                    </Link>
                  </td>
                  <td className="hidden px-5 py-4 sm:table-cell">
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs capitalize ${difficultyStyles[problem.difficulty]}`}>
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="hidden px-5 py-4 md:table-cell">
                    <div className="flex flex-wrap gap-1.5">
                      {problem.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">{tag}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-zinc-500">No problems match your filters.</p>
        )}
      </div>
    </div>
  );
}
