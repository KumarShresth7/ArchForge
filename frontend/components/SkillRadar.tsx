"use client";

interface SkillProfileEntry {
  tag: string;
  score: number;
}

export default function SkillRadar({ skills }: { skills: SkillProfileEntry[] }) {
  if (skills.length === 0) {
    return (
      <p className="text-sm text-zinc-600">
        Complete a few problems to see your skill profile.
      </p>
    );
  }

  const sorted = [...skills].sort((a, b) => a.score - b.score);

  return (
    <div className="space-y-3">
      {sorted.map(({ tag, score }) => (
        <div key={tag}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="capitalize text-zinc-400">{tag.replace(/-/g, " ")}</span>
            <span
              className={
                score >= 70 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-rose-400"
              }
            >
              {score}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
            <div
              className={`h-full rounded-full transition-all ${
                score >= 70 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-rose-500"
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
