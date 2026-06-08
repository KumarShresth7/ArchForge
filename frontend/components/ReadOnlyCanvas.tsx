"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ArchitectureNode from "./ArchitectureNode";
import { submissionGraphToFlow } from "@/lib/drafts";
import type { SubmissionDetail } from "@/lib/types";

const nodeTypes = { architecture: ArchitectureNode };

export default function ReadOnlyCanvas({ graph }: { graph: SubmissionDetail["graph_json"] }) {
  const { nodes, edges } = useMemo(() => submissionGraphToFlow(graph), [graph]);

  return (
    <div className="h-full min-h-[480px] w-full rounded-xl border border-white/5 bg-zinc-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        zoomOnScroll
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#27272a" />
        <Controls className="!border-white/10 !bg-zinc-900/90 !shadow-xl" />
        <MiniMap
          className="!border-white/10 !bg-zinc-900/90"
          nodeColor="#38bdf8"
          maskColor="rgb(9 9 11 / 0.8)"
        />
      </ReactFlow>
    </div>
  );
}
