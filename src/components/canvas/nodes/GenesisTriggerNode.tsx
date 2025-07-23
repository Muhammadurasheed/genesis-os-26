import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Zap, Clock, Webhook } from 'lucide-react';

export const GenesisTriggerNode: React.FC<any> = ({ data }) => {
  const getTriggerIcon = () => {
    switch (data?.triggerType) {
      case 'schedule': return <Clock className="w-6 h-6 text-green-400" />;
      case 'webhook': return <Webhook className="w-6 h-6 text-blue-400" />;
      default: return <Zap className="w-6 h-6 text-yellow-400" />;
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-lg p-4 min-w-[180px] backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          {getTriggerIcon()}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
        </div>
        <div>
          <h3 className="text-white font-medium text-sm">{data?.label || 'Trigger'}</h3>
          <p className="text-green-300 text-xs">{data?.triggerType || 'manual'}</p>
        </div>
      </div>

      <div className="text-xs text-green-200">
        {data?.description || 'Workflow trigger point'}
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
};