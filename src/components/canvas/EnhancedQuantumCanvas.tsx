
import { useCallback } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  Panel,
  Node,
  Edge,
  OnConnect,
  Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const initialNodes: Node[] = [
  { id: '1', type: 'input', data: { label: 'Input Node' }, position: { x: 50, y: 50 } },
  { id: '2', type: 'output', data: { label: 'Output Node' }, position: { x: 300, y: 50 } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
];

const nodeTypes = {
  input: ({ data }: { data: any }) => <div className="p-2 bg-white border rounded">{data.label}</div>,
  output: ({ data }: { data: any }) => <div className="p-2 bg-white border rounded">{data.label}</div>,
};

interface EnhancedQuantumCanvasProps {
  onSaveBlueprint: () => void;
  onRunSimulation: () => void;
}

export function EnhancedQuantumCanvas({ 
  onSaveBlueprint, 
  onRunSimulation 
}: EnhancedQuantumCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect: OnConnect = useCallback(
    (params: Connection) => setEdges((eds: Edge[]) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = useCallback(() => {
    setNodes((nds: Node[]) => {
      const id = String(nds.length + 1);
      const newNode: Node = {
        id: id,
        data: { label: `Node ${id}` },
        position: {
          x: Math.random() * 500,
          y: Math.random() * 500,
        },
      };
      return [...nds, newNode];
    });
  }, [setNodes]);

  return (
    <div className="h-full w-full relative bg-gray-900">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-900"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls />
        <MiniMap 
          nodeStrokeColor={() => '#ffffff'}
          nodeColor={() => '#4f46e5'}
          nodeBorderRadius={2}
          position="top-right"
        />
        <Panel position="top-left">
          <div className="flex gap-2 p-2 bg-gray-800 rounded-lg">
            <button 
              onClick={addNode}
              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Node
            </button>
            <button 
              onClick={onSaveBlueprint}
              className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save Blueprint
            </button>
            <button 
              onClick={onRunSimulation}
              className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Run Simulation
            </button>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
