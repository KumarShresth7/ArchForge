import type { Edge, Node } from "@xyflow/react";
import type { StarterGraph } from "./types";
import { getComponent, defaultConfig } from "./components";

const DRAFT_PREFIX = "archforge_draft_";

export interface DraftNode {
  id: string;
  componentType: string;
  label: string;
  variant: string;
  position: { x: number; y: number };
  config: Record<string, string | number | boolean>;
}

export interface DraftGraph {
  nodes: DraftNode[];
  edges: { id: string; source: string; target: string }[];
  updatedAt: string;
}

const edgeDefaults = { animated: true, style: { stroke: "#38bdf8", strokeWidth: 2 } };

export function flowToDraft(nodes: Node[], edges: Edge[]): DraftGraph {
  return {
    nodes: nodes.map((n) => ({
      id: n.id,
      componentType: (n.data.componentType as string) || "app_server",
      label: (n.data.label as string) || "Unknown",
      variant: (n.data.variant as string) || "default",
      position: n.position,
      config: (n.data.config as Record<string, string | number | boolean>) || {},
    })),
    edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target })),
    updatedAt: new Date().toISOString(),
  };
}

export function draftToFlow(draft: DraftGraph): { nodes: Node[]; edges: Edge[] } {
  return {
    nodes: draft.nodes.map((n) => ({
      id: n.id,
      type: "architecture",
      position: n.position,
      data: {
        label: n.label,
        variant: n.variant,
        componentType: n.componentType,
        config: n.config,
      },
    })),
    edges: draft.edges.map((e) => ({ ...e, ...edgeDefaults })),
  };
}

export function starterToFlow(graph: StarterGraph): { nodes: Node[]; edges: Edge[] } {
  return {
    nodes: graph.nodes.map((n) => {
      const componentType =
        n.id === "1" ? "web_client" : n.label.toLowerCase().includes("load") ? "load_balancer" : "app_server";
      const component = getComponent(componentType);
      return {
        id: n.id,
        type: "architecture",
        position: n.position,
        data: {
          label: n.label,
          variant: n.variant,
          componentType,
          config: component ? defaultConfig(component) : {},
        },
      };
    }),
    edges: graph.edges.map((e) => ({ id: e.id, source: e.source, target: e.target, ...edgeDefaults })),
  };
}

export function loadDraft(slug: string): DraftGraph | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${DRAFT_PREFIX}${slug}`);
    if (!raw) return null;
    return JSON.parse(raw) as DraftGraph;
  } catch {
    return null;
  }
}

export function saveDraft(slug: string, nodes: Node[], edges: Edge[]): void {
  if (typeof window === "undefined") return;
  const draft = flowToDraft(nodes, edges);
  localStorage.setItem(`${DRAFT_PREFIX}${slug}`, JSON.stringify(draft));
}

export function clearDraft(slug: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(`${DRAFT_PREFIX}${slug}`);
}

export function getDraftSavedAt(slug: string): string | null {
  const draft = loadDraft(slug);
  return draft?.updatedAt ?? null;
}

export { edgeDefaults };
