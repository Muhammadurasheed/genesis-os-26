import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Link, Globe, Database } from 'lucide-react';

export const GenesisIntegrationNode: React.FC<any> = ({ data }) => {
  const getServiceIcon = () => {
    switch (data?.service?.toLowerCase()) {
      case 'slack': return <Globe className="w-6 h-6 text-orange-400" />;
      case 'gmail': return <Database className="w-6 h-6 text-red-400" />;
      default: return <Link className="w-6 h-6 text-blue-400" />;
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-orange-900/20 to-yellow-900/20 border border-orange-500/30 rounded-lg p-4 min-w-[180px] backdrop-blur-sm">
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          {getServiceIcon()}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full" />
        </div>
        <div>
          <h3 className="text-white font-medium text-sm">{data?.label || 'Integration'}</h3>
          <p className="text-orange-300 text-xs">{data?.service || 'Service'}</p>
        </div>
      </div>

      <div className="text-xs text-orange-200">
        {data?.description || 'External service integration'}
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
};