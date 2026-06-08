"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  Background,
  BackgroundVariant,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  useReactFlow,
  Node,
  Edge,
  Connection,
  EdgeChange,
  NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import ArchitectureNode from "./ArchitectureNode";
import EvaluationPanel from "./EvaluationPanel";
import NodeConfigPanel from "./NodeConfigPanel";
import StatusBadge from "./StatusBadge";
import { DRAG_TYPE, parseDragPayload } from "./ComponentPalette";
import { useSession } from "next-auth/react";
import type { ProblemDetail } from "@/lib/types";
import { getApiBase, getWsUrl } from "@/lib/api";
import { fetchServerDraft, saveServerDraft, deleteServerDraft } from "@/lib/auth-api";
import { getComponent, defaultConfig } from "@/lib/components";
import {
  edgeDefaults,
  loadDraft,
  saveDraft,
  clearDraft,
  starterToFlow,
  draftToFlow,
  flowToDraft,
} from "@/lib/drafts";
import { getSessionId } from "@/lib/session";
import { markInProgress, recordSubmission } from "@/lib/progress";

const nodeTypes = { architecture: ArchitectureNode };

type Status = "ready" | "submitting" | "processing" | "completed" | "failed";

interface CanvasProps {
  problem: ProblemDetail;
}

function CanvasEditor({ problem }: CanvasProps) {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;
  const starter = useMemo(() => starterToFlow(problem.starter_graph), [problem.starter_graph]);
  const { screenToFlowPosition } = useReactFlow();

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("ready");
  const [statusMessage, setStatusMessage] = useState<string>();
  const [evaluationResult, setEvaluationResult] = useState<{
    score: number;
    bottlenecks: string[];
    suggestions: string[];
  } | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const sessionIdRef = useRef<string>("");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;

  // Load draft or starter graph
  useEffect(() => {
    let cancelled = false;

    async function loadGraph() {
      if (accessToken) {
        try {
          const serverDraft = await fetchServerDraft(accessToken, problem.slug);
          if (!cancelled && serverDraft?.nodes?.length) {
            const { nodes: n, edges: e } = draftToFlow(serverDraft);
            setNodes(n);
            setEdges(e);
            setDraftSavedAt(serverDraft.updatedAt);
            setInitialized(true);
            setSelectedNodeId(null);
            setEvaluationResult(null);
            return;
          }
        } catch {
          /* fall through */
        }
      }

      const draft = loadDraft(problem.slug);
      if (!cancelled) {
        if (draft && draft.nodes.length > 0) {
          const { nodes: n, edges: e } = draftToFlow(draft);
          setNodes(n);
          setEdges(e);
          setDraftSavedAt(draft.updatedAt);
        } else {
          setNodes(starter.nodes);
          setEdges(starter.edges);
        }
        setInitialized(true);
        setSelectedNodeId(null);
        setEvaluationResult(null);
      }
    }

    setInitialized(false);
    loadGraph();
    return () => {
      cancelled = true;
    };
  }, [problem.slug, starter, accessToken]);

  useEffect(() => {
    markInProgress(problem.slug);
  }, [problem.slug]);

  // WebSocket
  useEffect(() => {
    const sessionId = getSessionId();
    sessionIdRef.current = sessionId;
    const ws = new WebSocket(getWsUrl(sessionId));
    socketRef.current = ws;

    ws.onopen = () => setStatus("ready");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.status === "processing") {
        setStatus("processing");
        setStatusMessage("Analyzing graph topology…");
      } else if (data.status === "completed") {
        setStatus("completed");
        setStatusMessage(undefined);
        setEvaluationResult(data);
        if (!accessToken) {
          recordSubmission(problem.slug, data.score);
        }
        window.dispatchEvent(
          new CustomEvent("archforge-submission-complete", {
            detail: { slug: problem.slug, score: data.score },
          })
        );
      } else if (data.status === "failed") {
        setStatus("failed");
        setStatusMessage(data.message);
      }
    };

    return () => ws.close();
  }, [problem.slug, accessToken]);

  // Auto-save draft (debounced 1.5s)
  useEffect(() => {
    if (!initialized) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      const now = new Date().toISOString();
      if (accessToken) {
        try {
          await saveServerDraft(accessToken, problem.slug, flowToDraft(nodes, edges));
          setDraftSavedAt(now);
        } catch {
          saveDraft(problem.slug, nodes, edges);
          setDraftSavedAt(now);
        }
      } else {
        saveDraft(problem.slug, nodes, edges);
        setDraftSavedAt(now);
      }
    }, 1500);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [nodes, edges, problem.slug, initialized, accessToken]);

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
      setEdges((eds) => addEdge({ ...params, ...edgeDefaults }, eds)),
    []
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData(DRAG_TYPE);
      const payload = parseDragPayload(raw);
      if (!payload) return;

      const component = getComponent(payload.componentType);
      if (!component) return;

      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const id = `node_${Date.now()}`;

      const newNode: Node = {
        id,
        type: "architecture",
        position,
        data: {
          label: component.label,
          variant: component.variant,
          componentType: component.id,
          config: defaultConfig(component),
        },
      };

      setNodes((nds) => [...nds, newNode]);
      setSelectedNodeId(id);
    },
    [screenToFlowPosition]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const updateNode = useCallback(
    (nodeId: string, updates: { label?: string; config?: Record<string, string | number | boolean> }) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id !== nodeId) return n;
          return {
            ...n,
            data: {
              ...n.data,
              ...(updates.label !== undefined && { label: updates.label }),
              ...(updates.config !== undefined && { config: updates.config }),
            },
          };
        })
      );
    },
    []
  );

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNodeId(null);
  }, []);

  const resetCanvas = useCallback(async () => {
    setNodes(starter.nodes);
    setEdges(starter.edges);
    setSelectedNodeId(null);
    setEvaluationResult(null);
    clearDraft(problem.slug);
    if (accessToken) {
      try {
        await deleteServerDraft(accessToken, problem.slug);
      } catch {
        /* ignore */
      }
    }
    setDraftSavedAt(null);
  }, [starter, problem.slug, accessToken]);

  // Delete key removes selected node
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedNodeId) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") return;
        e.preventDefault();
        deleteNode(selectedNodeId);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedNodeId, deleteNode]);

  const isBusy = status === "submitting" || status === "processing";

  const submitArchitecture = async () => {
    setEvaluationResult(null);
    setStatus("submitting");
    setStatusMessage("Queuing evaluation…");

    const payload = {
      session_id: sessionIdRef.current,
      problem_slug: problem.slug,
      graph: {
        nodes: nodes.map((n) => ({
          id: n.id,
          component_type: n.data.componentType,
          type: n.data.variant,
          label: n.data.label,
          config: n.data.config ?? {},
        })),
        edges: edges.map((e) => ({ source: e.source, target: e.target })),
      },
    };

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const response = await fetch(`${getApiBase()}/api/evaluate`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Payload rejected by backend queue.");
    } catch {
      setStatus("failed");
      setStatusMessage("Failed to initiate evaluation pipeline.");
    }
  };

  const formatSavedAt = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!initialized) return null;

  return (
    <div className="relative flex h-full flex-col">
      <div className="absolute left-5 top-5 z-10 flex flex-wrap items-center gap-3">
        <button
          onClick={submitArchitecture}
          disabled={isBusy}
          className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="flex items-center gap-2">
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
            {isBusy ? "Evaluating…" : "Submit Design"}
          </span>
        </button>

        <button
          onClick={resetCanvas}
          disabled={isBusy}
          className="rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-2.5 text-sm text-zinc-400 backdrop-blur-md transition-colors hover:border-white/20 hover:text-zinc-200 disabled:opacity-50"
        >
          Reset
        </button>

        <StatusBadge status={status} message={statusMessage} />

        {draftSavedAt && (
          <span className="rounded-full border border-white/5 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-500 backdrop-blur-md">
            {accessToken ? "Cloud" : "Local"} draft · {formatSavedAt(draftSavedAt)}
          </span>
        )}

        {!accessToken && (
          <Link
            href="/login"
            className="rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1.5 text-xs text-sky-400 backdrop-blur-md hover:bg-sky-500/20"
          >
            Sign in to sync
          </Link>
        )}
      </div>

      {evaluationResult && !selectedNode && (
        <div className="absolute right-5 top-5 z-10">
          <EvaluationPanel result={evaluationResult} />
        </div>
      )}

      {selectedNode && (
        <NodeConfigPanel
          node={selectedNode}
          onUpdate={updateNode}
          onDelete={deleteNode}
          onClose={() => setSelectedNodeId(null)}
        />
      )}

      <div className="flex-1 archforge-flow">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          defaultEdgeOptions={edgeDefaults}
          fitView
          fitViewOptions={{ padding: 0.4 }}
          proOptions={{ hideAttribution: true }}
          deleteKeyCode={null}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#27272a" />
          <Controls
            showInteractive={false}
            className="!rounded-xl !border !border-white/10 !bg-zinc-900/90 !shadow-xl !backdrop-blur-md [&>button]:!border-white/5 [&>button]:!bg-transparent [&>button]:!text-zinc-400 [&>button:hover]:!bg-zinc-800"
          />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function Canvas(props: CanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasEditor {...props} />
    </ReactFlowProvider>
  );
}
