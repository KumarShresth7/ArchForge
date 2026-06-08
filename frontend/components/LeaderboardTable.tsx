"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchProblems } from "@/lib/api";

export interface LeaderboardEntry {
  rank: number;
  name: string;
  problem_slug: string;
  best_score: number;
  status: string;
}

export default function LeaderboardTable({
  entries,
  showProblem = true,
}: {
  entries: LeaderboardEntry[];
  showProblem?: boolean;
}) {
  const [problemTitles, setProblemTitles] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProblems().then((problems) => {
      setProblemTitles(Object.fromEntries(problems.map((p) => [p.slug, p.title])));
    });
  }, []);

  if (entries.length === 0) {
    return <p className="text-sm text-zinc-600">No scores yet. Be the first to submit!</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/5">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/5 bg-zinc-900/80 text-xs uppercase tracking-wider text-zinc-500">
            <th className="px-4 py-3 font-medium">Rank</th>
            <th className="px-4 py-3 font-medium">Engineer</th>
            {showProblem && <th className="hidden px-4 py-3 font-medium sm:table-cell">Problem</th>}
            <th className="px-4 py-3 font-medium text-right">Score</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={`${entry.name}-${entry.problem_slug}-${entry.rank}`} className="border-b border-white/5 hover:bg-zinc-900/60">
              <td className="px-4 py-3">
                <span className={entry.rank <= 3 ? "text-lg" : "text-zinc-500"}>
                  {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `#${entry.rank}`}
                </span>
              </td>
              <td className="px-4 py-3 font-medium text-zinc-200">{entry.name}</td>
              {showProblem && (
                <td className="hidden px-4 py-3 sm:table-cell">
                  <Link href={`/problems/${entry.problem_slug}`} className="text-zinc-400 hover:text-sky-400">
                    {problemTitles[entry.problem_slug] ?? entry.problem_slug}
                  </Link>
                </td>
              )}
              <td className={`px-4 py-3 text-right font-semibold ${
                entry.best_score >= 70 ? "text-emerald-400" : entry.best_score >= 50 ? "text-amber-400" : "text-rose-400"
              }`}>
                {entry.best_score}/100
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
