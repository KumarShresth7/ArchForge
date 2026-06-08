"use client";

type EvaluationResult = {
  score: number;
  bottlenecks: string[];
  suggestions: string[];
};

function scoreColor(score: number) {
  if (score >= 80) return { text: "text-emerald-400", ring: "stroke-emerald-400", bg: "bg-emerald-400/10" };
  if (score >= 60) return { text: "text-amber-400", ring: "stroke-amber-400", bg: "bg-amber-400/10" };
  return { text: "text-rose-400", ring: "stroke-rose-400", bg: "bg-rose-400/10" };
}

function ScoreRing({ score }: { score: number }) {
  const colors = scoreColor(score);
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      <svg className="-rotate-90" width="96" height="96">
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-zinc-800"
        />
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${colors.ring} transition-all duration-700 ease-out`}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-2xl font-bold tabular-nums ${colors.text}`}>{score}</span>
        <span className="text-[10px] uppercase tracking-wider text-zinc-500">/ 100</span>
      </div>
    </div>
  );
}

export default function EvaluationPanel({ result }: { result: EvaluationResult }) {
  const grade =
    result.score >= 90 ? "A" : result.score >= 80 ? "B" : result.score >= 70 ? "C" : result.score >= 60 ? "D" : "F";
  const colors = scoreColor(result.score);

  return (
    <div className="animate-slide-in-right w-[380px] overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/95 shadow-2xl shadow-black/40 backdrop-blur-xl">
      <div className="border-b border-white/5 bg-gradient-to-r from-sky-500/10 via-transparent to-violet-500/10 px-5 py-4">
        <div className="flex items-center gap-4">
          <ScoreRing score={result.score} />
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">ArchForge Grade</p>
            <p className={`mt-0.5 text-3xl font-bold ${colors.text}`}>{grade}</p>
            <p className="mt-1 text-sm text-zinc-400">Architecture evaluation</p>
          </div>
        </div>
      </div>

      <div className="max-h-[50vh] space-y-5 overflow-y-auto p-5">
        <section>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-400/15 text-xs text-amber-400">!</span>
            <h4 className="text-sm font-semibold text-zinc-200">Detected Bottlenecks</h4>
          </div>
          <ul className="space-y-2">
            {result.bottlenecks.map((b, i) => (
              <li
                key={i}
                className="rounded-lg border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-sm text-amber-100/90"
              >
                {b}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-sky-400/15 text-xs text-sky-400">→</span>
            <h4 className="text-sm font-semibold text-zinc-200">Suggestions</h4>
          </div>
          <ul className="space-y-2">
            {result.suggestions.map((s, i) => (
              <li
                key={i}
                className="flex gap-2 rounded-lg border border-white/5 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-300"
              >
                <span className="mt-0.5 shrink-0 text-sky-400">{i + 1}.</span>
                {s}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
