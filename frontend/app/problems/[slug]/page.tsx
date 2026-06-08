import Link from "next/link";
import { notFound } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import Canvas from "@/components/Canvas";
import ComponentPalette from "@/components/ComponentPalette";
import ProblemPanel from "@/components/ProblemPanel";
import { fetchProblem } from "@/lib/api";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  try {
    const { slug } = await params;
    const problem = await fetchProblem(slug);
    return { title: `${problem.title} | ArchForge` };
  } catch {
    return { title: "Problem | ArchForge" };
  }
}

export default async function ProblemWorkspacePage({ params }: Props) {
  const { slug } = await params;

  let problem;
  try {
    problem = await fetchProblem(slug);
  } catch {
    notFound();
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-950">
      <AppHeader
        breadcrumb={problem.title}
        right={
          <Link
            href="/problems"
            className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:border-white/20 hover:text-zinc-200"
          >
            ← All Problems
          </Link>
        }
      />
      <div className="flex flex-1 overflow-hidden">
        <ProblemPanel problem={problem} />
        <ComponentPalette />
        <main className="relative flex-1 overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-950/40 via-zinc-950 to-zinc-950" />
          <Canvas problem={problem} />
        </main>
      </div>
    </div>
  );
}
