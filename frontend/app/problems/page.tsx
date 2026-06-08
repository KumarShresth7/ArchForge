import AppHeader from "@/components/AppHeader";
import ProblemList from "@/components/ProblemList";
import { fetchProblems } from "@/lib/api";

export const metadata = {
  title: "Problems | ArchForge",
  description: "System design practice problems",
};

export default async function ProblemsPage() {
  const problems = await fetchProblems();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <AppHeader breadcrumb="Problems" />
      <main className="flex-1">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-950/30 via-zinc-950 to-zinc-950" />
        <div className="relative">
          <div className="border-b border-white/5 px-6 py-6">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">System Design Problems</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Pick a problem, build your architecture on the canvas, and get AI-powered feedback.
            </p>
          </div>
          <ProblemList problems={problems} />
        </div>
      </main>
    </div>
  );
}
