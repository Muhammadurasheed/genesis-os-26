
import React from 'react';
import { X } from 'lucide-react';
import { ActionConfig } from './ActionConfig';
import { GlassCard } from '../GlassCard';

interface NodeData {
  type: string;
  label: string;
  [key: string]: any;
}

interface NodeConfigPanelProps {
  nodeId: string;
  data: NodeData;
  onUpdate: (nodeId: string, data: Partial<NodeData>) => void;
  onClose: () => void;
}

export const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({ 
  nodeId, 
  data, 
  onUpdate, 
  onClose 
}) => {
  const handleUpdate = (newData: any) => {
    onUpdate(nodeId, newData);
  };

  const renderConfig = () => {
    if (data.type === 'action') {
      return (
        <ActionConfig
          nodeData={data}
          onUpdate={handleUpdate}
        />
      );
    } else {
      return (
        <GlassCard variant="medium" className="w-96 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Node Configuration</h3>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
          <p className="text-white">Select a valid node type.</p>
        </GlassCard>
      );
    }
  };

  return renderConfig();
};
