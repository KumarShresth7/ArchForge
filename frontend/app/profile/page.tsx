import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import SkillRadar from "@/components/SkillRadar";
import ScoreTrend from "@/components/ScoreTrend";
import { fetchProblems } from "@/lib/api";
import { authFetch, fetchSubmissions } from "@/lib/auth-api";
import type { DashboardData } from "@/lib/types";

export const metadata = {
  title: "Profile | ArchForge",
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.accessToken) redirect("/login");

  let dashboard: DashboardData;
  try {
    dashboard = await authFetch("/api/dashboard", session.accessToken);
  } catch {
    redirect("/login");
  }

  const submissions = await fetchSubmissions(session.accessToken, undefined, 50);
  const problems = await fetchProblems();
  const problemMap = Object.fromEntries(problems.map((p) => [p.slug, p]));
  const joined = new Date(dashboard.user.created_at ?? Date.now()).toLocaleDateString();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <AppHeader breadcrumb="Profile" />
      <main className="relative flex-1">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-950/20 via-zinc-950 to-zinc-950" />
        <div className="relative mx-auto max-w-5xl px-6 py-8">
          <div className="mb-8 flex flex-wrap items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-xl font-bold text-white shadow-lg shadow-sky-500/30">
              {dashboard.user.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() || "U"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-100">{dashboard.user.name}</h1>
              <p className="text-sm text-zinc-500">{dashboard.user.email}</p>
              <p className="mt-0.5 text-xs text-zinc-600">Member since {joined}</p>
            </div>
            {dashboard.stats.current_streak > 0 && (
              <div className="ml-auto flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2">
                <span className="text-xl">🔥</span>
                <div>
                  <p className="font-bold text-amber-400">{dashboard.stats.current_streak} day streak</p>
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
            <section className="rounded-xl border border-white/5 bg-zinc-900/50 p-5">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                Skill Profile
              </h2>
              <SkillRadar skills={dashboard.skill_profile} />
            </section>

            <section className="rounded-xl border border-white/5 bg-zinc-900/50 p-5">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                Score Trend
              </h2>
              <ScoreTrend submissions={submissions} />
              <p className="mt-2 text-xs text-zinc-600">Last {Math.min(submissions.length, 12)} submissions</p>
            </section>

            <section className="rounded-xl border border-white/5 bg-zinc-900/50 p-5 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                  All Submissions
                </h2>
                <Link href="/dashboard" className="text-xs text-sky-400 hover:text-sky-300">
                  Dashboard →
                </Link>
              </div>
              {submissions.length === 0 ? (
                <p className="text-sm text-zinc-600">No submissions yet.</p>
              ) : (
                <ul className="space-y-1.5">
                  {submissions.map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`/submissions/${s.id}`}
                        className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-zinc-800"
                      >
                        <span className="text-zinc-300">
                          {problemMap[s.problem_slug]?.title ?? s.problem_slug}
                          <span className="ml-2 text-xs text-zinc-600">
                            {new Date(s.submitted_at).toLocaleDateString()}
                          </span>
                        </span>
                        <span className="flex items-center gap-3">
                          {s.rubric_score != null && s.ai_score != null && (
                            <span className="hidden text-xs text-zinc-600 sm:inline">
                              R{s.rubric_score} · AI{s.ai_score}
                            </span>
                          )}
                          <span
                            className={
                              s.score >= 70
                                ? "text-emerald-400"
                                : s.score >= 50
                                  ? "text-amber-400"
                                  : "text-rose-400"
                            }
                          >
                            {s.score}/100
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
