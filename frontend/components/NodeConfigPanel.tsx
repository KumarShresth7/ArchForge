"use client";

import type { Node } from "@xyflow/react";
import { getComponent, type ConfigField } from "@/lib/components";

interface NodeConfigPanelProps {
  node: Node;
  onUpdate: (nodeId: string, updates: { label?: string; config?: Record<string, string | number | boolean> }) => void;
  onDelete: (nodeId: string) => void;
  onClose: () => void;
}

function ConfigInput({
  field,
  value,
  onChange,
}: {
  field: ConfigField;
  value: string | number | boolean;
  onChange: (val: string | number | boolean) => void;
}) {
  if (field.type === "boolean") {
    return (
      <input
        type="checkbox"
        checked={Boolean(value)}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-sky-500"
      />
    );
  }

  if (field.type === "select") {
    return (
      <select
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-sky-500/50"
      >
        {field.options?.map((opt) => (
          <option key={opt} value={opt}>
            {opt.replace(/_/g, " ")}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "number") {
    return (
      <input
        type="number"
        value={Number(value)}
        min={field.min}
        max={field.max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-sky-500/50"
      />
    );
  }

  return (
    <input
      type="text"
      value={String(value)}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-sky-500/50"
    />
  );
}

export default function NodeConfigPanel({ node, onUpdate, onDelete, onClose }: NodeConfigPanelProps) {
  const componentType = (node.data.componentType as string) || "app_server";
  const component = getComponent(componentType);
  const config = (node.data.config as Record<string, string | number | boolean>) || {};

  if (!component) return null;

  return (
    <aside className="absolute right-5 top-16 z-20 w-72 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/95 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{component.icon}</span>
          <div>
            <p className="text-sm font-semibold text-zinc-100">{component.label}</p>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Configuration</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
        >
          ✕
        </button>
      </div>

      <div className="max-h-[60vh] space-y-4 overflow-y-auto p-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-500">Display Label</label>
          <input
            type="text"
            value={(node.data.label as string) || ""}
            onChange={(e) => onUpdate(node.id, { label: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-sky-500/50"
          />
        </div>

        {component.configFields.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Settings</p>
            {component.configFields.map((field) => (
              <div key={field.key}>
                <label className="mb-1.5 block text-xs font-medium text-zinc-500">{field.label}</label>
                <ConfigInput
                  field={field}
                  value={config[field.key] ?? field.default}
                  onChange={(val) =>
                    onUpdate(node.id, { config: { ...config, [field.key]: val } })
                  }
                />
              </div>
            ))}
          </div>
        )}

        {component.configFields.length === 0 && (
          <p className="text-xs text-zinc-600">No configurable settings for this component.</p>
        )}
      </div>

      <div className="border-t border-white/5 p-3">
        <button
          onClick={() => onDelete(node.id)}
          className="w-full rounded-lg border border-rose-500/30 bg-rose-500/10 py-2 text-sm font-medium text-rose-400 transition-colors hover:bg-rose-500/20"
        >
          Remove Component
        </button>
      </div>
    </aside>
  );
}
