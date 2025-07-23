import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Brain, Cpu } from 'lucide-react';

export const GenesisAgentNode: React.FC<any> = ({ data }) => {
  const statusColors = {
    ready: '#10b981',
    processing: '#f59e0b', 
    success: '#6366f1',
    error: '#ef4444',
    learning: '#8b5cf6'
  };

  const getStatusColor = () => statusColors[data?.status as keyof typeof statusColors] || '#6366f1';

  return (
    <div className="relative bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-4 min-w-[200px] backdrop-blur-sm">
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          <Brain className="w-8 h-8 text-purple-400" />
          <div 
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
            style={{ backgroundColor: getStatusColor() }}
          />
        </div>
        <div>
          <h3 className="text-white font-medium text-sm">{data?.label || 'AI Agent'}</h3>
          <p className="text-purple-300 text-xs">{data?.role || 'Assistant'}</p>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <Cpu className="w-3 h-3 text-blue-400" />
          <span className="text-blue-300">{data?.model || 'Claude'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-green-300">{data?.capabilities?.length || 0} capabilities</span>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
};