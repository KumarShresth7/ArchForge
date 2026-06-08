"use client";

import type { SubmissionSummary } from "@/lib/types";

export default function ScoreTrend({ submissions }: { submissions: SubmissionSummary[] }) {
  const recent = [...submissions]
    .sort((a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime())
    .slice(-12);

  if (recent.length === 0) {
    return <p className="text-sm text-zinc-600">Submit designs to see your score trend.</p>;
  }

  const maxScore = 100;

  return (
    <div className="flex h-32 items-end gap-1.5">
      {recent.map((s, i) => {
        const height = Math.max(8, (s.score / maxScore) * 100);
        const color =
          s.score >= 70 ? "bg-emerald-500" : s.score >= 50 ? "bg-amber-500" : "bg-rose-500";
        return (
          <div key={s.id} className="group flex flex-1 flex-col items-center gap-1">
            <div
              className={`w-full rounded-t-md ${color} transition-all group-hover:brightness-110`}
              style={{ height: `${height}%` }}
              title={`${s.score}/100`}
            />
            <span className="text-[10px] text-zinc-600">{i + 1}</span>
          </div>
        );
      })}
    </div>
  );
}
