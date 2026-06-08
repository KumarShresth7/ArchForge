"use client";

import { useEffect, useState } from "react";
import { fetchProblems } from "@/lib/api";
import LeaderboardTable, { type LeaderboardEntry } from "./LeaderboardTable";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function LeaderboardClient({ initialEntries }: { initialEntries: LeaderboardEntry[] }) {
  const [problemSlug, setProblemSlug] = useState("");
  const [entries, setEntries] = useState(initialEntries);
  const [problems, setProblems] = useState<Array<{ slug: string; title: string }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProblems().then((list) => setProblems(list.map((p) => ({ slug: p.slug, title: p.title }))));
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const url = problemSlug
        ? `${API_BASE}/api/leaderboard?problem_slug=${problemSlug}`
        : `${API_BASE}/api/leaderboard`;
      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setEntries(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [problemSlug]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="problem-filter" className="text-sm text-zinc-500">
          Filter by problem
        </label>
        <select
          id="problem-filter"
          value={problemSlug}
          onChange={(e) => setProblemSlug(e.target.value)}
          className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-sky-500/50"
        >
          <option value="">All problems</option>
          {problems.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.title}
            </option>
          ))}
        </select>
        {loading && <span className="text-xs text-zinc-600">Updating…</span>}
      </div>
      <LeaderboardTable entries={entries} showProblem={!problemSlug} />
    </div>
  );
}
