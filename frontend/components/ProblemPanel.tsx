"use client";

import { useState } from "react";
import type { ProblemDetail } from "@/lib/types";

export default function ProblemPanel({ problem }: { problem: ProblemDetail }) {
  const [showHints, setShowHints] = useState(false);

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-r border-white/5 bg-zinc-950/90 backdrop-blur-xl">
      <div className="border-b border-white/5 px-5 py-4">
        <div className="mb-2 flex items-center gap-2">
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs capitalize ${
              problem.difficulty === "easy"
                ? "border-emerald-500/25 bg-emerald-500/15 text-emerald-400"
                : problem.difficulty === "medium"
                  ? "border-amber-500/25 bg-amber-500/15 text-amber-400"
                  : "border-rose-500/25 bg-rose-500/15 text-rose-400"
            }`}
          >
            {problem.difficulty}
          </span>
        </div>
        <h2 className="text-base font-semibold text-zinc-100">{problem.title}</h2>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {problem.tags.map((tag) => (
            <span key={tag} className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Description
          </h3>
          <p className="text-sm leading-relaxed text-zinc-400">{problem.description}</p>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Functional Requirements
          </h3>
          <ul className="space-y-1.5">
            {problem.functional_requirements.map((req, i) => (
              <li key={i} className="flex gap-2 text-sm text-zinc-400">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-sky-400" />
                {req}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Non-Functional Requirements
          </h3>
          <ul className="space-y-1.5">
            {problem.non_functional_requirements.map((req, i) => (
              <li key={i} className="flex gap-2 text-sm text-zinc-400">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-violet-400" />
                {req}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <button
            onClick={() => setShowHints(!showHints)}
            className="flex w-full items-center justify-between rounded-lg border border-white/5 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 transition-colors hover:border-white/10 hover:text-zinc-200"
          >
            <span>Hints</span>
            <span className="text-xs text-zinc-600">{showHints ? "Hide" : "Show"}</span>
          </button>
          {showHints && (
            <ul className="mt-2 space-y-2">
              {problem.hints.map((hint, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-sm text-amber-100/80"
                >
                  {hint}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </aside>
  );
}
