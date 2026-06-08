"use client";

import { CATEGORY_LABELS, componentsByCategory, type ComponentDefinition } from "@/lib/components";

const DRAG_TYPE = "application/archforge-component";

export function getDragPayload(component: ComponentDefinition): string {
  return JSON.stringify({ componentType: component.id });
}

export function parseDragPayload(raw: string): { componentType: string } | null {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export { DRAG_TYPE };

export default function ComponentPalette() {
  const grouped = componentsByCategory();

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-white/5 bg-zinc-950/95 backdrop-blur-xl">
      <div className="border-b border-white/5 px-4 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Components</h3>
        <p className="mt-0.5 text-[11px] text-zinc-600">Drag onto canvas</p>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {(Object.keys(grouped) as Array<keyof typeof grouped>).map((category) => {
          const items = grouped[category];
          if (items.length === 0) return null;
          return (
            <div key={category} className="mb-4">
              <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                {CATEGORY_LABELS[category]}
              </p>
              <div className="space-y-1">
                {items.map((component) => (
                  <div
                    key={component.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData(DRAG_TYPE, getDragPayload(component));
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    className="flex cursor-grab items-center gap-2.5 rounded-lg border border-transparent px-2.5 py-2 text-sm text-zinc-300 transition-all hover:border-white/10 hover:bg-zinc-900 active:cursor-grabbing active:scale-[0.98]"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-zinc-800 text-sm">
                      {component.icon}
                    </span>
                    <span className="truncate text-xs font-medium">{component.label}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
