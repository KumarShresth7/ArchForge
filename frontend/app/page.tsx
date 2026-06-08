import Canvas from "../components/Canvas";

export const metadata = {
  title: "ArchForge | System Design Evaluator",
  description: "Interactive AI-powered system design architecture evaluator.",
};

export default function ArchForgeDashboard() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-950">
      <header className="relative z-20 flex h-14 shrink-0 items-center justify-between border-b border-white/5 bg-zinc-950/80 px-6 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 text-sm font-bold text-white shadow-lg shadow-sky-500/30">
            A
          </div>
          <h1 className="text-base font-semibold tracking-tight text-zinc-100">
            ArchForge
          </h1>
          <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider text-sky-400">
            Beta
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="hidden items-center gap-2 text-zinc-500 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Engine online
          </div>
          <div className="text-zinc-500">
            Workspace{" "}
            <span className="font-medium text-zinc-300">Demo Problem Set</span>
          </div>
        </div>
      </header>

      <main className="relative flex-1 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-950/40 via-zinc-950 to-zinc-950" />
        <Canvas />
      </main>
    </div>
  );
}
