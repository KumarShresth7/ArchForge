"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { getComponent } from "@/lib/components";

const accentBars: Record<string, string> = {
  emerald: "bg-emerald-400",
  sky: "bg-sky-400",
  violet: "bg-violet-400",
  amber: "bg-amber-400",
  rose: "bg-rose-400",
  cyan: "bg-cyan-400",
  zinc: "bg-zinc-400",
};

const accentGlow: Record<string, string> = {
  emerald: "shadow-emerald-500/20",
  sky: "shadow-sky-500/20",
  violet: "shadow-violet-500/20",
  amber: "shadow-amber-500/20",
  rose: "shadow-rose-500/20",
  cyan: "shadow-cyan-500/20",
  zinc: "shadow-zinc-500/20",
};

const variantLabels: Record<string, string> = {
  input: "Entry",
  output: "Exit",
  default: "Service",
};

export default function ArchitectureNode({ data, selected }: NodeProps) {
  const componentType = (data.componentType as string) || "app_server";
  const component = getComponent(componentType);
  const variantKey = (data.variant as string) ?? component?.variant ?? "default";
  const accent = component?.accent ?? "sky";
  const config = (data.config as Record<string, unknown>) || {};
  const replicaCount = config.replicas;

  const isInput = variantKey === "input";
  const isOutput = variantKey === "output";

  return (
    <div
      className={[
        "group min-w-[168px] rounded-xl border border-white/10 bg-zinc-900/90 backdrop-blur-md",
        "shadow-lg transition-all duration-200",
        accentGlow[accent] ?? accentGlow.sky,
        selected
          ? "ring-2 ring-sky-400/60 shadow-sky-500/30 scale-[1.02]"
          : "hover:border-white/20 hover:shadow-xl",
      ].join(" ")}
    >
      <div className={`h-1 rounded-t-xl ${accentBars[accent] ?? accentBars.sky}`} />
      <div className="px-4 py-3">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
            {variantLabels[variantKey] ?? "Service"}
          </span>
          {component && <span className="text-sm">{component.icon}</span>}
        </div>
        <span className="block text-sm font-semibold text-zinc-100">{data.label as string}</span>
        {typeof replicaCount === "number" && replicaCount > 1 && (
          <span className="mt-1 inline-block rounded-md bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">
            ×{replicaCount} replicas
          </span>
        )}
      </div>

      {!isInput && (
        <Handle
          type="target"
          position={Position.Top}
          className="!h-2.5 !w-2.5 !border-2 !border-zinc-800 !bg-sky-400"
        />
      )}
      {!isOutput && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!h-2.5 !w-2.5 !border-2 !border-zinc-800 !bg-sky-400"
        />
      )}
    </div>
  );
}
