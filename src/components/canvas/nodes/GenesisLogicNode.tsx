import React, { useState, useEffect } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import { 
  GitBranch, 
  Filter, 
  Shuffle, 
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Percent,
  Split,
  Route
} from 'lucide-react';

interface LogicNodeData {
  label: string;
  logicType: 'condition' | 'filter' | 'router' | 'switch' | 'loop';
  description: string;
  condition: string;
  status: 'ready' | 'evaluating' | 'true' | 'false' | 'error';
  branchMetrics: {
    trueCount: number;
    falseCount: number;
    totalEvaluations: number;
    avgEvaluationTime: number;
  };
  branches: Array<{
    id: string;
    label: string;
    condition: string;
    probability: number;
    color: string;
  }>;
  aiSuggestions: string[];
}

export const GenesisLogicNode: React.FC<NodeProps<LogicNodeData>> = ({ 
  data, 
  selected,
  id 
}) => {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [currentBranch, setCurrentBranch] = useState<string | null>(null);

  useEffect(() => {
    if (data.status === 'evaluating') {
      setIsEvaluating(true);
      const timer = setTimeout(() => setIsEvaluating(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [data.status]);

  const getLogicIcon = () => {
    const icons = {
      condition: GitBranch,
      filter: Filter,
      router: Route,
      switch: Shuffle,
      loop: ArrowUpDown
    };
    return icons[data.logicType] || GitBranch;
  };

  const getStatusColor = () => {
    const colors = {
      ready: '#6b7280',
      evaluating: '#3b82f6',
      true: '#10b981',
      false: '#ef4444',
      error: '#dc2626'
    };
    return colors[data.status] || '#6b7280';
  };

  const getLogicTypeColor = () => {
    const colors = {
      condition: '#f59e0b',
      filter: '#8b5cf6',
      router: '#10b981',
      switch: '#ef4444',
      loop: '#3b82f6'
    };
    return colors[data.logicType] || '#6b7280';
  };

  const LogicIcon = getLogicIcon();
  const trueProbability = data.branchMetrics.totalEvaluations > 0 
    ? (data.branchMetrics.trueCount / data.branchMetrics.totalEvaluations) * 100 
    : 50;

  return (
    <motion.div
      className={`
        genesis-logic-node 
        relative w-80 h-56
        bg-gradient-to-br from-orange-900/95 to-slate-900/95 
        backdrop-blur-xl
        border-2 border-orange-500/30
        rounded-2xl
        shadow-2xl
        transition-all duration-300
        ${selected ? 'ring-2 ring-orange-400 ring-offset-2 ring-offset-transparent' : ''}
      `}
      animate={{
        boxShadow: isEvaluating 
          ? `0 0 30px ${getStatusColor()}` 
          : '0 10px 40px rgba(0,0,0,0.3)',
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Decision Tree Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full">
          <defs>
            <pattern id="decision-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="10" r="2" fill="currentColor" />
              <circle cx="10" cy="30" r="1.5" fill="currentColor" />
              <circle cx="30" cy="30" r="1.5" fill="currentColor" />
              <path d="M20,10 L10,30 M20,10 L30,30" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#decision-pattern)" />
        </svg>
      </div>

      {/* Header Section */}
      <div className="relative z-10 p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logic Icon */}
            <div className="relative">
              <motion.div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${getLogicTypeColor()}20` }}
                animate={isEvaluating ? { rotate: [0, 5, -5, 0] } : {}}
                transition={{ duration: 0.5, repeat: isEvaluating ? Infinity : 0 }}
              >
                <LogicIcon 
                  className="w-7 h-7" 
                  style={{ color: getLogicTypeColor() }}
                />
              </motion.div>
              
              {/* Status Indicator */}
              <div 
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900"
                style={{ backgroundColor: getStatusColor() }}
              >
                <motion.div
                  className="w-full h-full rounded-full"
                  animate={isEvaluating ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  style={{ backgroundColor: getStatusColor() }}
                />
              </div>
            </div>

            <div className="flex flex-col">
              <h3 className="text-white font-semibold text-lg">{data.label}</h3>
              <p className="text-orange-300 text-sm capitalize">{data.logicType} Logic</p>
            </div>
          </div>

          {/* Evaluation Status */}
          {data.status === 'evaluating' && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-blue-400 text-xs font-medium">Evaluating</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-4 space-y-3">
        <p className="text-gray-300 text-sm">{data.description}</p>

        {/* Condition Display */}
        <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/30">
          <div className="flex items-center gap-2 mb-2">
            <GitBranch className="w-4 h-4 text-orange-400" />
            <span className="text-orange-400 text-sm font-medium">Condition</span>
          </div>
          <code className="text-green-300 text-xs font-mono bg-black/30 p-2 rounded block">
            {data.condition}
          </code>
        </div>

        {/* Branch Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-500/20 rounded-lg p-2 border border-green-500/30">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-xs font-medium">True</span>
            </div>
            <p className="text-white font-bold text-lg">{trueProbability.toFixed(0)}%</p>
          </div>

          <div className="bg-red-500/20 rounded-lg p-2 border border-red-500/30">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-xs font-medium">False</span>
            </div>
            <p className="text-white font-bold text-lg">{(100 - trueProbability).toFixed(0)}%</p>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="flex justify-between items-center bg-blue-500/10 rounded-lg p-2 border border-blue-500/20">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 text-sm">Evaluations</span>
          </div>
          <span className="text-white font-semibold">{data.branchMetrics.totalEvaluations}</span>
        </div>

        <div className="flex justify-between items-center bg-purple-500/10 rounded-lg p-2 border border-purple-500/20">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400 text-sm">Avg Time</span>
          </div>
          <span className="text-white font-semibold">{data.branchMetrics.avgEvaluationTime}ms</span>
        </div>
      </div>

      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-orange-500 border-2 border-white shadow-lg"
        style={{ left: -6 }}
      />
      
      {/* Multiple output handles for branches */}
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        className="w-3 h-3 bg-green-500 border-2 border-white shadow-lg"
        style={{ right: -6, top: '40%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        className="w-3 h-3 bg-red-500 border-2 border-white shadow-lg"
        style={{ right: -6, top: '60%' }}
      />

      {/* Branch Labels */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs">
        <div className="mb-2 text-green-400 font-medium">TRUE</div>
        <div className="text-red-400 font-medium">FALSE</div>
      </div>

      {/* Evaluation Animation */}
      {isEvaluating && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute top-1/2 left-4 w-2 h-2 bg-blue-400 rounded-full"
            animate={{
              x: [0, 200, 280],
              y: [0, 0, -40, 40],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </motion.div>
      )}

      {/* Branch Probability Visualization */}
      <div className="absolute bottom-2 left-4 right-4">
        <div className="bg-gray-700/50 rounded-full h-1 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-green-500 to-red-500"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            style={{ transformOrigin: 'left' }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-green-400 text-xs">{trueProbability.toFixed(0)}%</span>
          <span className="text-red-400 text-xs">{(100 - trueProbability).toFixed(0)}%</span>
        </div>
      </div>
    </motion.div>
  );
};