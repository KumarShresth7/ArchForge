"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";

const variants: Record<string, { bar: string; glow: string; label: string }> = {
  input: {
    bar: "bg-emerald-400",
    glow: "shadow-emerald-500/20",
    label: "Entry",
  },
  output: {
    bar: "bg-violet-400",
    glow: "shadow-violet-500/20",
    label: "Exit",
  },
  default: {
    bar: "bg-sky-400",
    glow: "shadow-sky-500/20",
    label: "Service",
  },
};

export default function ArchitectureNode({ data, selected }: NodeProps) {
  const variantKey = (data.variant as string) ?? "default";
  const variant = variants[variantKey] ?? variants.default;
  const isInput = variantKey === "input";
  const isOutput = variantKey === "output";

  return (
    <div
      className={[
        "group min-w-[160px] rounded-xl border border-white/10 bg-zinc-900/90 backdrop-blur-md",
        "shadow-lg transition-all duration-200",
        variant.glow,
        selected
          ? "ring-2 ring-sky-400/60 shadow-sky-500/30 scale-[1.02]"
          : "hover:border-white/20 hover:shadow-xl",
      ].join(" ")}
    >
      <div className={`h-1 rounded-t-xl ${variant.bar}`} />
      <div className="px-4 py-3">
        <span className="mb-1 block text-[10px] font-medium uppercase tracking-widest text-zinc-500">
          {variant.label}
        </span>
        <span className="block text-sm font-semibold text-zinc-100">
          {data.label as string}
        </span>
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
