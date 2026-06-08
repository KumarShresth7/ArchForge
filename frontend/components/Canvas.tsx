"react-client";
import React, { useState, useCallback } from 'react';
import { 
  ReactFlow, 
  Controls, 
  Background, 
  applyNodeChanges, 
  applyEdgeChanges, 
  addEdge,
  Node,
  Edge,
  Connection,
  EdgeChange,
  NodeChange
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const initialNodes: Node[] = [
  { id: '1', position: { x: 100, y: 150 }, data: { label: 'Client / User' }, type: 'input' },
  { id: '2', position: { x: 350, y: 150 }, data: { label: 'Load Balancer' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' }
];

export default function Canvas() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  // This function converts the visual graph into your backend data contract
  const serializeGraph = () => {
    const payload = {
      problem_id: "demo_system",
      graph: {
        nodes: nodes.map(n => ({ id: n.id, type: n.type || 'default', label: n.data.label })),
        edges: edges.map(e => ({ source: e.source, target: e.target }))
      }
    };
    console.log("Serialized Architecture JSON:", JSON.stringify(payload, null, 2));
    return payload;
  };

  return (
    <div style={{ width: '100vw', height: '80vh', border: '1px solid #ccc' }}>
      <div style={{ padding: '10px', background: '#f4f4f4', borderBottom: '1px solid #ddd' }}>
        <button onClick={serializeGraph} style={{ padding: '8px 12px', cursor: 'pointer' }}>
          Serialize Architecture
        </button>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}