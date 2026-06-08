"use client";

type Status = "ready" | "submitting" | "processing" | "completed" | "failed";

const config: Record<Status, { dot: string; label: string; pulse?: boolean }> = {
  ready: { dot: "bg-zinc-500", label: "Ready" },
  submitting: { dot: "bg-sky-400", label: "Submitting…", pulse: true },
  processing: { dot: "bg-violet-400", label: "AI evaluating…", pulse: true },
  completed: { dot: "bg-emerald-400", label: "Evaluation complete" },
  failed: { dot: "bg-rose-400", label: "Evaluation failed" },
};

export default function StatusBadge({
  status,
  message,
}: {
  status: Status;
  message?: string;
}) {
  const { dot, label, pulse } = config[status];

  return (
    <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-zinc-900/80 px-4 py-2 backdrop-blur-md">
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${dot}`} />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${dot}`} />
      </span>
      <span className="text-sm text-zinc-300">
        {message ?? label}
      </span>
    </div>
  );
}
