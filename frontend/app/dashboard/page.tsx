import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import SkillRadar from "@/components/SkillRadar";
import { fetchProblems } from "@/lib/api";
import { authFetch } from "@/lib/auth-api";
import type { DashboardData } from "@/lib/types";

export const metadata = {
  title: "Dashboard | ArchForge",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.accessToken) redirect("/login");

  let dashboard: DashboardData;
  try {
    dashboard = await authFetch("/api/dashboard", session.accessToken);
  } catch {
    redirect("/login");
  }

  const problems = await fetchProblems();
  const problemMap = Object.fromEntries(problems.map((p) => [p.slug, p]));
  const recommended = dashboard.recommended
    .map((r) => ({ ...r, problem: problemMap[r.slug] }))
    .filter((r) => r.problem);

  const inProgress = dashboard.progress.find((p) => p.status === "attempted");

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <AppHeader breadcrumb="Dashboard" />
      <main className="relative flex-1">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-950/30 via-zinc-950 to-zinc-950" />
        <div className="relative mx-auto max-w-5xl px-6 py-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-zinc-100">
                Hey, {dashboard.user.name?.split(" ")[0]} 👋
              </h1>
              <p className="mt-1 text-sm text-zinc-500">Your system design journey</p>
            </div>
            {dashboard.stats.current_streak > 0 && (
              <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2">
                <span className="text-2xl">🔥</span>
                <div>
                  <p className="text-lg font-bold text-amber-400">{dashboard.stats.current_streak} day streak</p>
                  <p className="text-xs text-zinc-500">Best: {dashboard.stats.longest_streak} days</p>
                </div>
              </div>
            )}
          </div>

          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Solved", value: dashboard.stats.problems_solved },
              { label: "Attempted", value: dashboard.stats.problems_attempted },
              { label: "Submissions", value: dashboard.stats.total_submissions },
              { label: "Avg Score", value: dashboard.stats.average_score ?? "—" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-white/5 bg-zinc-900/50 px-4 py-3">
                <p className="text-xs text-zinc-500">{s.label}</p>
                <p className="mt-1 text-2xl font-bold text-zinc-100">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {inProgress && problemMap[inProgress.problem_slug] && (
              <section className="rounded-xl border border-white/5 bg-zinc-900/50 p-5 lg:col-span-2">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                  Continue where you left off
                </h2>
                <Link
                  href={`/problems/${inProgress.problem_slug}`}
                  className="flex items-center justify-between rounded-lg border border-sky-500/20 bg-sky-500/5 px-4 py-3 transition-colors hover:bg-sky-500/10"
                >
                  <span className="font-medium text-zinc-200">
                    {problemMap[inProgress.problem_slug].title}
                  </span>
                  <span className="text-sm text-sky-400">
                    {inProgress.best_score !== null ? `${inProgress.best_score}/100` : "In progress"} →
                  </span>
                </Link>
              </section>
            )}

            <section className="rounded-xl border border-white/5 bg-zinc-900/50 p-5">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                Skill Profile
              </h2>
              <SkillRadar skills={dashboard.skill_profile} />
            </section>

            <section className="rounded-xl border border-white/5 bg-zinc-900/50 p-5">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                Recommended for you
              </h2>
              <ul className="space-y-2">
                {recommended.length === 0 && (
                  <li className="text-sm text-zinc-600">You&apos;ve solved everything — nice work!</li>
                )}
                {recommended.map(({ slug, reason, problem: p }) => (
                  <li key={slug}>
                    <Link
                      href={`/problems/${slug}`}
                      className="block rounded-lg px-3 py-2 transition-colors hover:bg-zinc-800"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-300">{p!.title}</span>
                        <span className="text-xs capitalize text-zinc-600">{p!.difficulty}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-sky-400/80">{reason}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-white/5 bg-zinc-900/50 p-5 lg:col-span-2">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                Recent Submissions
              </h2>
              <ul className="space-y-2">
                {dashboard.recent_submissions.length === 0 && (
                  <li className="text-sm text-zinc-600">No submissions yet. Pick a problem to start!</li>
                )}
                {dashboard.recent_submissions.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/problems/${s.problem_slug}`}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-zinc-800"
                    >
                      <span className="text-zinc-300">
                        {problemMap[s.problem_slug]?.title ?? s.problem_slug}
                      </span>
                      <span
                        className={
                          s.score >= 70 ? "text-emerald-400" : s.score >= 50 ? "text-amber-400" : "text-rose-400"
                        }
                      >
                        {s.score}/100
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/problems"
              className="inline-flex rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:brightness-110"
            >
              Browse All Problems
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
