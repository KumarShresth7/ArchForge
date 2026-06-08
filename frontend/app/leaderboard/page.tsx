import AppHeader from "@/components/AppHeader";
import LeaderboardClient from "@/components/LeaderboardClient";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const metadata = {
  title: "Leaderboard | ArchForge",
};

async function fetchLeaderboard(problemSlug?: string) {
  const url = problemSlug
    ? `${API_BASE}/api/leaderboard?problem_slug=${problemSlug}`
    : `${API_BASE}/api/leaderboard`;
  const res = await fetch(url, { next: { revalidate: 30 } });
  if (!res.ok) return [];
  return res.json();
}

export default async function LeaderboardPage() {
  const entries = await fetchLeaderboard();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <AppHeader breadcrumb="Leaderboard" />
      <main className="relative flex-1">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-950/20 via-zinc-950 to-zinc-950" />
        <div className="relative mx-auto max-w-3xl px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-zinc-100">Leaderboard</h1>
            <p className="mt-1 text-sm text-zinc-500">Top architecture scores across all problems</p>
          </div>
          <LeaderboardClient initialEntries={entries} />
        </div>
      </main>
    </div>
  );
}
