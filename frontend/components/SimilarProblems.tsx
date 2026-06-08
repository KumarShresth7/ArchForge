"use client";

import Link from "next/link";
import type { ProblemSummary } from "@/lib/types";

export default function SimilarProblems({
  slugs,
  problemMap,
}: {
  slugs: string[];
  problemMap: Record<string, ProblemSummary>;
}) {
  if (slugs.length === 0) return null;

  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Similar Problems
      </h3>
      <ul className="space-y-1.5">
        {slugs.map((slug) => {
          const p = problemMap[slug];
          if (!p) return null;
          return (
            <li key={slug}>
              <Link
                href={`/problems/${slug}`}
                className="block rounded-lg border border-white/5 px-3 py-2 text-sm text-zinc-400 transition-colors hover:border-white/10 hover:bg-zinc-900 hover:text-zinc-200"
              >
                {p.title}
                <span className="ml-2 text-xs capitalize text-zinc-600">{p.difficulty}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
