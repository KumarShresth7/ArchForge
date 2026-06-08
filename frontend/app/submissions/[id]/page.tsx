import Link from "next/link";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import ReadOnlyCanvas from "@/components/ReadOnlyCanvas";
import EvaluationPanel from "@/components/EvaluationPanel";
import { fetchSubmission } from "@/lib/auth-api";
import { fetchProblems } from "@/lib/api";
import type { EvaluationResult } from "@/lib/types";

export const metadata = {
  title: "Submission | ArchForge",
};

export default async function SubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.accessToken) redirect("/login");

  const { id } = await params;

  let submission;
  try {
    submission = await fetchSubmission(session.accessToken, id);
  } catch {
    notFound();
  }

  const problems = await fetchProblems();
  const problem = problems.find((p) => p.slug === submission.problem_slug);
  const submittedAt = new Date(submission.submitted_at).toLocaleString();

  const result: EvaluationResult = {
    score: submission.score,
    rubric_score: submission.rubric_score ?? undefined,
    ai_score: submission.ai_score ?? undefined,
    rubric_feedback: submission.rubric_feedback,
    bottlenecks: submission.bottlenecks,
    suggestions: submission.suggestions,
    problem_slug: submission.problem_slug,
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <AppHeader breadcrumb="Submission" />
      <main className="relative flex flex-1 flex-col">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-950/20 via-zinc-950 to-zinc-950" />
        <div className="relative flex flex-1 flex-col gap-6 p-6 lg:flex-row">
          <div className="flex min-h-0 flex-1 flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-zinc-100">
                  {problem?.title ?? submission.problem_slug}
                </h1>
                <p className="mt-1 text-sm text-zinc-500">Submitted {submittedAt}</p>
              </div>
              <Link
                href={`/problems/${submission.problem_slug}`}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-900"
              >
                Open problem →
              </Link>
            </div>
            <ReadOnlyCanvas graph={submission.graph_json} />
          </div>
          <div className="shrink-0 lg:w-[400px]">
            <EvaluationPanel result={result} />
          </div>
        </div>
      </main>
    </div>
  );
}
