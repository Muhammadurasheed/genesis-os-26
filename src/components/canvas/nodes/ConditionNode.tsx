
import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { GitBranch, Filter, ToggleLeft, Shield, Settings } from 'lucide-react';

const ConditionNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as any;

  const getConditionIcon = (type: string) => {
    switch (type) {
      case 'if': return <GitBranch className="h-5 w-5" />;
      case 'switch': return <ToggleLeft className="h-5 w-5" />;
      case 'filter': return <Filter className="h-5 w-5" />;
      case 'gate': return <Shield className="h-5 w-5" />;
      default: return <GitBranch className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'evaluating': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'true': return 'bg-green-100 text-green-800 border-green-200';
      case 'false': return 'bg-red-100 text-red-800 border-red-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConditionColor = (type: string) => {
    switch (type) {
      case 'if': return 'bg-yellow-50 text-yellow-600';
      case 'switch': return 'bg-purple-50 text-purple-600';
      case 'filter': return 'bg-blue-50 text-blue-600';
      case 'gate': return 'bg-green-50 text-green-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div
      className={`
        relative bg-white rounded-lg shadow-md border-2 p-4 min-w-[200px]
        ${selected ? 'border-blue-500 shadow-lg' : 'border-gray-200'}
        transition-all duration-200 hover:shadow-lg
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-yellow-500 border-2 border-white"
      />
      
      <div className="flex items-center space-x-3 mb-3">
        <div className={`p-2 rounded-lg ${getConditionColor(nodeData.conditionType)}`}>
          {getConditionIcon(nodeData.conditionType)}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm">{nodeData.label}</h3>
          <p className="text-xs text-gray-600 capitalize">{nodeData.conditionType}</p>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <Settings className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      <div className="space-y-2">
        <div className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(nodeData.status)}`}>
          <span className="capitalize">{nodeData.status}</span>
        </div>
        
        {nodeData.condition && (
          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
            {nodeData.condition.length > 50 ? `${nodeData.condition.substring(0, 50)}...` : nodeData.condition}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="w-3 h-3 bg-green-500 border-2 border-white"
        style={{ left: '30%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        className="w-3 h-3 bg-red-500 border-2 border-white"
        style={{ left: '70%' }}
      />
    </div>
  );
});

ConditionNode.displayName = 'ConditionNode';

export default ConditionNode;
