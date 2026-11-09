import React, { useState, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  MarkerType,
  NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { TargetNode, ProfileNode, DomainNode, IpNode, GenericEntityNode } from './CustomNodes';
import { GraphInspector } from './GraphInspector';
import { api } from '../../api/client';
import { GraphNodeData } from '../../types';

interface RelationshipGraphProps {
  investigationId: string;
}

export const RelationshipGraph: React.FC<RelationshipGraphProps> = ({ investigationId }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<{ id: string; data: GraphNodeData } | null>(null);

  const nodeTypes = useMemo<NodeTypes>(() => ({
    target: TargetNode,
    profile: ProfileNode,
    domain: DomainNode,
    subdomain: DomainNode,
    ip: IpNode,
    asn: IpNode,
    entity: GenericEntityNode,
  }), []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api.getGraph(investigationId)
      .then((data) => {
        if (!isMounted) return;

        const rawNodes = data.nodes || [];
        const rawEdges = data.edges || [];

        // Radial layout around center (400, 300)
        const centerX = 400;
        const centerY = 300;
        const radius = Math.max(220, rawNodes.length * 28);

        const positionedNodes: Node[] = rawNodes.map((n: any, idx: number) => {
          let posX = centerX;
          let posY = centerY;

          if (n.type === 'target') {
            posX = centerX;
            posY = centerY;
          } else {
            // Distribute other nodes on circle
            const angle = (2 * Math.PI * (idx - 1)) / (rawNodes.length - 1 || 1);
            posX = centerX + radius * Math.cos(angle);
            posY = centerY + radius * Math.sin(angle);
          }

          return {
            id: n.id,
            type: n.type in nodeTypes ? n.type : 'entity',
            position: { x: posX, y: posY },
            data: n.data,
          };
        });

        const formattedEdges: Edge[] = rawEdges.map((e: any) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#00f0ff', strokeWidth: 1.5, opacity: 0.75 },
          labelStyle: { fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' },
          labelBgStyle: { fill: '#0a0d14', fillOpacity: 0.8 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#00f0ff',
            width: 14,
            height: 14,
          },
        }));

        setNodes(positionedNodes);
        setEdges(formattedEdges);
      })
      .catch((err) => console.error('Failed to load relationship graph:', err))
      .finally(() => setLoading(false));

    return () => {
      isMounted = false;
    };
  }, [investigationId, nodeTypes, setNodes, setEdges]);

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode({ id: node.id, data: node.data as unknown as GraphNodeData });
  };

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-surface-300 border border-border-subtle rounded-lg font-mono text-xs text-slate-400">
        Computing relationship graph topological vectors...
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-surface-300 border border-border-subtle rounded-lg font-mono text-xs text-slate-400">
        No graph relationships identified for this scan yet.
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] bg-background border border-border-subtle rounded-lg overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
      >
        <Background color="#1e293b" gap={20} size={1} />
        <Controls />
        <MiniMap
          nodeStrokeColor="#00f0ff"
          nodeColor="#1e293b"
          maskColor="rgba(10, 13, 20, 0.7)"
          className="!bg-surface-300 !border !border-border-subtle !rounded"
        />
      </ReactFlow>

      {/* Inspector Drawer */}
      <GraphInspector selectedNode={selectedNode} onClose={() => setSelectedNode(null)} />
    </div>
  );
};
