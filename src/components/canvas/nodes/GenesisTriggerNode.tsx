import React, { useState, useEffect } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Clock, 
  Webhook, 
  Calendar, 
  Mail, 
  FileText,
  Activity,
  Target,
  Pulse,
  Radio
} from 'lucide-react';

interface TriggerNodeData {
  label: string;
  triggerType: 'webhook' | 'schedule' | 'email' | 'manual' | 'event';
  description: string;
  status: 'active' | 'inactive' | 'triggered' | 'error';
  brandLogo: string;
  realTimeMetrics: {
    successRate: number;
    avgLatency: number;
    triggerCount: number;
  };
  config?: {
    schedule?: {
      frequency: string;
      nextRun: string;
      timezone: string;
    };
    webhook?: {
      url: string;
      method: string;
      headers?: Record<string, string>;
    };
  };
  aiSuggestions: string[];
}

export const GenesisTriggerNode: React.FC<NodeProps<TriggerNodeData>> = ({ 
  data, 
  selected,
  id 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [lastTriggered, setLastTriggered] = useState<Date | null>(null);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  useEffect(() => {
    // Simulate listening state for active triggers
    if (data.status === 'active') {
      setIsListening(true);
      const interval = setInterval(() => {
        setPulseAnimation(true);
        setTimeout(() => setPulseAnimation(false), 500);
      }, 3000);
      
      return () => clearInterval(interval);
    } else {
      setIsListening(false);
    }
  }, [data.status]);

  const getTriggerIcon = () => {
    const icons = {
      webhook: Webhook,
      schedule: Clock,
      email: Mail,
      manual: Target,
      event: Activity
    };
    return icons[data.triggerType] || Zap;
  };

  const getStatusColor = () => {
    const colors = {
      active: '#10b981',
      inactive: '#6b7280',
      triggered: '#3b82f6',
      error: '#ef4444'
    };
    return colors[data.status] || '#6b7280';
  };

  const getTriggerTypeColor = () => {
    const colors = {
      webhook: '#8b5cf6',
      schedule: '#10b981',
      email: '#f59e0b',
      manual: '#ef4444',
      event: '#3b82f6'
    };
    return colors[data.triggerType] || '#6b7280';
  };

  const TriggerIcon = getTriggerIcon();

  return (
    <motion.div
      className={`
        genesis-trigger-node 
        relative w-72 h-40
        bg-gradient-to-br from-emerald-900/95 to-slate-900/95 
        backdrop-blur-xl
        border-2 border-emerald-500/30
        rounded-2xl
        shadow-2xl
        transition-all duration-300
        ${selected ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-transparent' : ''}
      `}
      animate={{
        boxShadow: pulseAnimation 
          ? `0 0 30px ${getStatusColor()}` 
          : '0 10px 40px rgba(0,0,0,0.3)',
        scale: pulseAnimation ? 1.02 : 1
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Lightning Pattern Background */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full">
          <defs>
            <pattern id="lightning-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <path 
                d="M30,10 L20,35 L35,35 L25,50 L40,25 L25,25 L30,10 Z" 
                fill="currentColor" 
                opacity="0.3"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#lightning-pattern)" />
        </svg>
      </div>

      {/* Header Section */}
      <div className="relative z-10 p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Trigger Icon with Animation */}
            <div className="relative">
              <motion.div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${getTriggerTypeColor()}20` }}
                animate={isListening ? { 
                  boxShadow: [
                    `0 0 0 0 ${getTriggerTypeColor()}40`,
                    `0 0 0 10px ${getTriggerTypeColor()}00`,
                  ]
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <TriggerIcon 
                  className="w-7 h-7" 
                  style={{ color: getTriggerTypeColor() }}
                />
              </motion.div>
              
              {/* Status Indicator */}
              <div 
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900"
                style={{ backgroundColor: getStatusColor() }}
              >
                <motion.div
                  className="w-full h-full rounded-full"
                  animate={isListening ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                  style={{ backgroundColor: getStatusColor() }}
                />
              </div>
            </div>

            <div className="flex flex-col">
              <h3 className="text-white font-semibold text-lg">{data.label}</h3>
              <p className="text-emerald-300 text-sm capitalize">{data.triggerType} Trigger</p>
            </div>
          </div>

          {/* Listening Indicator */}
          {isListening && (
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-xs font-medium">Listening</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-4 space-y-3">
        <p className="text-gray-300 text-sm">{data.description}</p>

        {/* Metrics */}
        <div className="flex justify-between items-center">
          <div className="bg-emerald-500/20 rounded-lg p-2 border border-emerald-500/30">
            <div className="flex items-center gap-2">
              <Pulse className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-xs font-medium">Triggers</span>
            </div>
            <p className="text-white font-bold text-lg">{data.realTimeMetrics.triggerCount}</p>
          </div>

          <div className="bg-blue-500/20 rounded-lg p-2 border border-blue-500/30">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 text-xs font-medium">Success</span>
            </div>
            <p className="text-white font-bold text-lg">{data.realTimeMetrics.successRate}%</p>
          </div>
        </div>

        {/* Schedule Information */}
        {data.triggerType === 'schedule' && data.config?.schedule && (
          <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 text-sm font-medium">Schedule</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Frequency:</span>
                <span className="text-white">{data.config.schedule.frequency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Next Run:</span>
                <span className="text-white">{data.config.schedule.nextRun}</span>
              </div>
            </div>
          </div>
        )}

        {/* Webhook Information */}
        {data.triggerType === 'webhook' && data.config?.webhook && (
          <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Webhook className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 text-sm font-medium">Webhook</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Method:</span>
                <span className="text-white font-mono">{data.config.webhook.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Endpoint:</span>
                <span className="text-white font-mono text-xs truncate max-w-32">
                  {data.config.webhook.url}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Connection Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-emerald-500 border-2 border-white shadow-lg"
        style={{ right: -6 }}
      />

      {/* Trigger Animation */}
      {data.status === 'triggered' && (
        <motion.div
          className="absolute inset-0 border-2 border-emerald-400 rounded-2xl"
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: 1.1, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      )}

      {/* Wave Animation for Active State */}
      {isListening && (
        <div className="absolute top-4 right-4">
          <motion.div
            className="w-2 h-2 bg-emerald-400 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [1, 0.5, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      )}
    </motion.div>
  );
};