"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { fetchSubmissions } from "@/lib/auth-api";
import type { SubmissionSummary } from "@/lib/types";

export default function AttemptHistory({ problemSlug }: { problemSlug: string }) {
  const { data: session } = useSession();
  const [attempts, setAttempts] = useState<SubmissionSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!session?.accessToken) {
      setAttempts([]);
      return;
    }
    setLoading(true);
    try {
      const rows = await fetchSubmissions(session.accessToken, problemSlug, 10);
      setAttempts(rows);
    } catch {
      setAttempts([]);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, problemSlug]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onSubmission = () => load();
    window.addEventListener("archforge-submission-complete", onSubmission);
    return () => window.removeEventListener("archforge-submission-complete", onSubmission);
  }, [load]);

  if (!session?.accessToken) {
    return (
      <p className="text-xs text-zinc-600">
        Sign in to track attempt history across devices.
      </p>
    );
  }

  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Your Attempts
      </h3>
      {loading && attempts.length === 0 && (
        <p className="text-xs text-zinc-600">Loading…</p>
      )}
      {!loading && attempts.length === 0 && (
        <p className="text-xs text-zinc-600">No submissions yet for this problem.</p>
      )}
      <ul className="space-y-1.5">
        {attempts.map((a, i) => (
          <li key={a.id}>
            <Link
              href={`/submissions/${a.id}`}
              className="flex items-center justify-between rounded-lg border border-white/5 bg-zinc-900/50 px-3 py-2 text-xs transition-colors hover:border-white/10 hover:bg-zinc-900"
            >
              <span className="text-zinc-400">
                Attempt {attempts.length - i}
                <span className="ml-2 text-zinc-600">
                  {new Date(a.submitted_at).toLocaleDateString()}
                </span>
              </span>
              <span
                className={
                  a.score >= 70 ? "text-emerald-400" : a.score >= 50 ? "text-amber-400" : "text-rose-400"
                }
              >
                {a.score}/100
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
