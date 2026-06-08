"use client";

import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Node,
  Edge,
  Connection,
  EdgeChange,
  NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import ArchitectureNode from "./ArchitectureNode";
import EvaluationPanel from "./EvaluationPanel";
import StatusBadge from "./StatusBadge";

const nodeTypes = { architecture: ArchitectureNode };

const initialNodes: Node[] = [
  {
    id: "1",
    type: "architecture",
    position: { x: 120, y: 180 },
    data: { label: "Client / User", variant: "input" },
  },
  {
    id: "2",
    type: "architecture",
    position: { x: 400, y: 180 },
    data: { label: "Load Balancer", variant: "default" },
  },
];

const initialEdges: Edge[] = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    animated: true,
    style: { stroke: "#38bdf8", strokeWidth: 2 },
  },
];

type Status = "ready" | "submitting" | "processing" | "completed" | "failed";

export default function Canvas() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [status, setStatus] = useState<Status>("ready");
  const [statusMessage, setStatusMessage] = useState<string>();
  const [evaluationResult, setEvaluationResult] = useState<{
    score: number;
    bottlenecks: string[];
    suggestions: string[];
  } | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const clientId = "demo_client_123";

  useEffect(() => {
    socketRef.current = new WebSocket(`ws://localhost:8000/ws/${clientId}`);

    socketRef.current.onopen = () => setStatus("ready");

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.status === "processing") {
        setStatus("processing");
        setStatusMessage("Analyzing graph topology…");
      } else if (data.status === "completed") {
        setStatus("completed");
        setStatusMessage(undefined);
        setEvaluationResult(data);
      } else if (data.status === "failed") {
        setStatus("failed");
        setStatusMessage(data.message);
      }
    };

    return () => socketRef.current?.close();
  }, []);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );
  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge({ ...params, animated: true, style: { stroke: "#38bdf8", strokeWidth: 2 } }, eds)
      ),
    []
  );

  const isBusy = status === "submitting" || status === "processing";

  const submitArchitecture = async () => {
    setEvaluationResult(null);
    setStatus("submitting");
    setStatusMessage("Queuing evaluation…");

    const payload = {
      problem_id: clientId,
      graph: {
        nodes: nodes.map((n) => ({
          id: n.id,
          type: (n.data.variant as string) || "default",
          label: (n.data.label as string) || "unknown",
        })),
        edges: edges.map((e) => ({ source: e.source, target: e.target })),
      },
    };

    try {
      const response = await fetch("http://localhost:8000/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Payload rejected by backend queue.");
    } catch {
      setStatus("failed");
      setStatusMessage("Failed to initiate evaluation pipeline.");
    }
  };

  const defaultEdgeOptions = useMemo(
    () => ({ animated: true, style: { stroke: "#38bdf8", strokeWidth: 2 } }),
    []
  );

  return (
    <div className="relative flex h-full flex-col">
      {/* Toolbar */}
      <div className="absolute left-5 top-5 z-10 flex items-center gap-3">
        <button
          onClick={submitArchitecture}
          disabled={isBusy}
          className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition-all hover:shadow-sky-500/40 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="relative z-10 flex items-center gap-2">
            {isBusy ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
            {isBusy ? "Evaluating…" : "Run AI Architecture Check"}
          </span>
        </button>

        <StatusBadge status={status} message={statusMessage} />
      </div>

      {/* Canvas hint */}
      <div className="absolute bottom-5 left-5 z-10 rounded-xl border border-white/5 bg-zinc-900/70 px-4 py-3 backdrop-blur-md">
        <p className="text-xs font-medium text-zinc-400">Canvas</p>
        <p className="mt-0.5 text-sm text-zinc-500">Drag nodes · Connect handles · Submit when ready</p>
      </div>

      {/* Results panel */}
      {evaluationResult && (
        <div className="absolute right-5 top-5 z-10">
          <EvaluationPanel result={evaluationResult} />
        </div>
      )}

      {/* React Flow */}
      <div className="flex-1 archforge-flow">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          fitViewOptions={{ padding: 0.4 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#27272a"
          />
          <Controls
            showInteractive={false}
            className="!rounded-xl !border !border-white/10 !bg-zinc-900/90 !shadow-xl !backdrop-blur-md [&>button]:!border-white/5 [&>button]:!bg-transparent [&>button]:!text-zinc-400 [&>button:hover]:!bg-zinc-800"
          />
        </ReactFlow>
      </div>
    </div>
  );
}
