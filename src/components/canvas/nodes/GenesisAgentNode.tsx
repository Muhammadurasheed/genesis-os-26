import React, { useState, useEffect } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Zap, 
  Activity, 
  TrendingUp, 
  Clock, 
  Target,
  Sparkles,
  Database,
  MessageSquare,
  Settings
} from 'lucide-react';

interface AgentNodeData {
  label: string;
  role: string;
  description: string;
  model: string;
  status: 'ready' | 'processing' | 'success' | 'error' | 'learning';
  brandLogo: string;
  capabilities: string[];
  personality: string;
  realTimeMetrics: {
    successRate: number;
    avgLatency: number;
    tokensProcessed: number;
    currentLoad: number;
  };
  learningProgress: {
    interactions: number;
    improvements: number;
    feedbackScore: number;
  };
  aiSuggestions: string[];
}

export const GenesisAgentNode: React.FC<NodeProps<AgentNodeData>> = ({ 
  data, 
  selected,
  id 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  useEffect(() => {
    // Animate when processing
    if (data.status === 'processing') {
      setPulseAnimation(true);
      const timer = setTimeout(() => setPulseAnimation(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [data.status]);

  const getStatusColor = () => {
    const colors = {
      ready: '#10b981',
      processing: '#3b82f6',
      success: '#22c55e',
      error: '#ef4444',
      learning: '#8b5cf6'
    };
    return colors[data.status] || '#6b7280';
  };

  const getModelBadgeColor = () => {
    const modelColors = {
      'claude-3.5-sonnet': '#ff6b35',
      'gpt-4': '#00a67e',
      'gemini-pro': '#4285f4',
      'llama': '#ff8c00'
    };
    return modelColors[data.model as keyof typeof modelColors] || '#6b7280';
  };

  return (
    <motion.div
      className={`
        genesis-agent-node 
        relative w-80 h-48 
        bg-gradient-to-br from-slate-900/95 to-purple-900/95 
        backdrop-blur-xl
        border-2 border-purple-500/30
        rounded-2xl
        shadow-2xl
        transition-all duration-300
        ${selected ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-transparent' : ''}
        ${isHovered ? 'scale-105 shadow-purple-500/25' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{
        boxShadow: pulseAnimation 
          ? `0 0 30px ${getStatusColor()}` 
          : '0 10px 40px rgba(0,0,0,0.3)',
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Neural Network Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full">
          <defs>
            <pattern id="neural-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1" fill="currentColor" />
              <circle cx="0" cy="0" r="1" fill="currentColor" />
              <circle cx="40" cy="40" r="1" fill="currentColor" />
              <path d="M0,0 L40,40 M40,0 L0,40" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#neural-pattern)" />
        </svg>
      </div>

      {/* Header Section */}
      <div className="relative z-10 p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* AI Model Logo */}
            <div className="relative">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${getModelBadgeColor()}20` }}
              >
                <Brain 
                  className="w-6 h-6" 
                  style={{ color: getModelBadgeColor() }}
                />
              </div>
              {/* Status Indicator */}
              <div 
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900"
                style={{ backgroundColor: getStatusColor() }}
              >
                <motion.div
                  className="w-full h-full rounded-full"
                  animate={pulseAnimation ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                  style={{ backgroundColor: getStatusColor() }}
                />
              </div>
            </div>

            <div className="flex flex-col">
              <h3 className="text-white font-semibold text-lg">{data.label}</h3>
              <p className="text-purple-300 text-sm">{data.role}</p>
            </div>
          </div>

          {/* Model Badge */}
          <div 
            className="px-3 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: getModelBadgeColor() }}
          >
            {data.model.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-4 space-y-3">
        {/* Description */}
        <p className="text-gray-300 text-sm line-clamp-2">{data.description}</p>

        {/* Real-time Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-500/20 rounded-lg p-2 border border-green-500/30">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-xs font-medium">Success</span>
            </div>
            <p className="text-white font-bold text-lg">{data.realTimeMetrics.successRate}%</p>
          </div>

          <div className="bg-blue-500/20 rounded-lg p-2 border border-blue-500/30">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 text-xs font-medium">Latency</span>
            </div>
            <p className="text-white font-bold text-lg">{data.realTimeMetrics.avgLatency}ms</p>
          </div>
        </div>

        {/* Capabilities Pills */}
        <div className="flex flex-wrap gap-1">
          {data.capabilities.slice(0, 3).map((capability, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30"
            >
              {capability}
            </span>
          ))}
          {data.capabilities.length > 3 && (
            <span className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs rounded-full border border-gray-500/30">
              +{data.capabilities.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-purple-500 border-2 border-white shadow-lg"
        style={{ left: -6 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-purple-500 border-2 border-white shadow-lg"
        style={{ right: -6 }}
      />

      {/* Advanced Metrics Overlay */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute -top-2 -right-2 bg-black/90 backdrop-blur-xl rounded-lg p-3 border border-purple-500/30 min-w-48 z-20"
        >
          <h4 className="text-purple-300 font-medium text-sm mb-2">Advanced Metrics</h4>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Tokens Processed:</span>
              <span className="text-white font-medium">{data.realTimeMetrics.tokensProcessed.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Current Load:</span>
              <span className="text-white font-medium">{data.realTimeMetrics.currentLoad}%</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Interactions:</span>
              <span className="text-white font-medium">{data.learningProgress.interactions}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Feedback Score:</span>
              <span className="text-white font-medium">{data.learningProgress.feedbackScore}/5.0</span>
            </div>
          </div>

          {/* AI Suggestions */}
          {data.aiSuggestions.length > 0 && (
            <div className="mt-3 pt-2 border-t border-purple-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3 h-3 text-yellow-400" />
                <span className="text-yellow-400 text-xs font-medium">AI Suggestion</span>
              </div>
              <p className="text-gray-300 text-xs">{data.aiSuggestions[0]}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Processing Animation */}
      {data.status === 'processing' && (
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent"
            animate={{ x: [-100, 320] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </div>
      )}
    </motion.div>
  );
};