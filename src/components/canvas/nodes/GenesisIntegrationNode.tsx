import React, { useState, useEffect } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import { 
  Link, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Activity,
  BarChart3,
  Clock,
  Zap,
  Database,
  Shield,
  Cpu
} from 'lucide-react';

interface IntegrationNodeData {
  label: string;
  service: string;
  description: string;
  status: 'connected' | 'connecting' | 'error' | 'rate_limited';
  brandLogo: string;
  apiHealth: {
    status: 'healthy' | 'degraded' | 'down';
    responseTime: number;
    uptime: number;
    rateLimit: {
      used: number;
      limit: number;
    };
  };
  dataFlow: {
    inputSchema: any;
    outputSchema: any;
    transformations: string[];
  };
  aiSuggestions: string[];
}

export const GenesisIntegrationNode: React.FC<NodeProps<IntegrationNodeData>> = ({ 
  data, 
  selected,
  id 
}) => {
  const [isTransferring, setIsTransferring] = useState(false);
  const [connectionPulse, setConnectionPulse] = useState(false);

  useEffect(() => {
    // Simulate data transfer
    if (data.status === 'connected') {
      const interval = setInterval(() => {
        setIsTransferring(true);
        setTimeout(() => setIsTransferring(false), 800);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [data.status]);

  useEffect(() => {
    // Connection pulse for healthy integrations
    if (data.apiHealth.status === 'healthy') {
      setConnectionPulse(true);
      const timer = setTimeout(() => setConnectionPulse(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [data.apiHealth.status]);

  const getStatusIcon = () => {
    const icons = {
      connected: CheckCircle,
      connecting: Activity,
      error: XCircle,
      rate_limited: AlertTriangle
    };
    return icons[data.status] || Link;
  };

  const getStatusColor = () => {
    const colors = {
      connected: '#10b981',
      connecting: '#3b82f6',
      error: '#ef4444',
      rate_limited: '#f59e0b'
    };
    return colors[data.status] || '#6b7280';
  };

  const getHealthColor = () => {
    const colors = {
      healthy: '#10b981',
      degraded: '#f59e0b',
      down: '#ef4444'
    };
    return colors[data.apiHealth.status] || '#6b7280';
  };

  const getBrandColor = () => {
    const brandColors = {
      slack: '#4A154B',
      gmail: '#EA4335',
      notion: '#000000',
      airtable: '#18BFFF',
      shopify: '#96BF48',
      stripe: '#635BFF',
      hubspot: '#FF7A59',
      salesforce: '#00A1E0'
    };
    return brandColors[data.service.toLowerCase() as keyof typeof brandColors] || '#6366f1';
  };

  const StatusIcon = getStatusIcon();
  const rateLimitPercentage = (data.apiHealth.rateLimit.used / data.apiHealth.rateLimit.limit) * 100;

  return (
    <motion.div
      className={`
        genesis-integration-node 
        relative w-80 h-52
        bg-gradient-to-br from-slate-900/95 to-blue-900/95 
        backdrop-blur-xl
        border-2 border-blue-500/30
        rounded-2xl
        shadow-2xl
        transition-all duration-300
        ${selected ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-transparent' : ''}
      `}
      animate={{
        boxShadow: connectionPulse 
          ? `0 0 30px ${getStatusColor()}` 
          : '0 10px 40px rgba(0,0,0,0.3)',
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Integration Pattern Background */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full">
          <defs>
            <pattern id="integration-pattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="15" cy="15" r="2" fill="currentColor" />
              <path d="M0,15 L30,15 M15,0 L15,30" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#integration-pattern)" />
        </svg>
      </div>

      {/* Header Section */}
      <div className="relative z-10 p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Brand Logo */}
            <div className="relative">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center border-2"
                style={{ 
                  backgroundColor: `${getBrandColor()}20`,
                  borderColor: `${getBrandColor()}40`
                }}
              >
                <Link 
                  className="w-6 h-6" 
                  style={{ color: getBrandColor() }}
                />
              </div>
              
              {/* Status Indicator */}
              <div className="absolute -top-1 -right-1">
                <motion.div
                  className="w-5 h-5 rounded-full border-2 border-slate-900 flex items-center justify-center"
                  style={{ backgroundColor: getStatusColor() }}
                  animate={data.status === 'connecting' ? { rotate: 360 } : {}}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <StatusIcon className="w-3 h-3 text-white" />
                </motion.div>
              </div>
            </div>

            <div className="flex flex-col">
              <h3 className="text-white font-semibold text-lg">{data.label}</h3>
              <p className="text-blue-300 text-sm">{data.service} Integration</p>
            </div>
          </div>

          {/* Health Indicator */}
          <div className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getHealthColor() }}
            />
            <span 
              className="text-xs font-medium capitalize"
              style={{ color: getHealthColor() }}
            >
              {data.apiHealth.status}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-4 space-y-3">
        <p className="text-gray-300 text-sm">{data.description}</p>

        {/* API Health Metrics */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-green-500/20 rounded-lg p-2 border border-green-500/30">
            <div className="flex items-center gap-1">
              <BarChart3 className="w-3 h-3 text-green-400" />
              <span className="text-green-400 text-xs">Uptime</span>
            </div>
            <p className="text-white font-bold text-sm">{data.apiHealth.uptime}%</p>
          </div>

          <div className="bg-blue-500/20 rounded-lg p-2 border border-blue-500/30">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-400" />
              <span className="text-blue-400 text-xs">Response</span>
            </div>
            <p className="text-white font-bold text-sm">{data.apiHealth.responseTime}ms</p>
          </div>

          <div className="bg-orange-500/20 rounded-lg p-2 border border-orange-500/30">
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-orange-400" />
              <span className="text-orange-400 text-xs">Rate</span>
            </div>
            <p className="text-white font-bold text-sm">{rateLimitPercentage.toFixed(0)}%</p>
          </div>
        </div>

        {/* Rate Limit Progress Bar */}
        <div className="bg-gray-700/50 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-green-500 to-orange-500"
            initial={{ width: 0 }}
            animate={{ width: `${rateLimitPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>

        {/* Data Transformations */}
        <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400 text-sm font-medium">Transformations</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {data.dataFlow.transformations.slice(0, 3).map((transform, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30"
              >
                {transform}
              </span>
            ))}
            {data.dataFlow.transformations.length > 3 && (
              <span className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs rounded-full border border-gray-500/30">
                +{data.dataFlow.transformations.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-blue-500 border-2 border-white shadow-lg"
        style={{ left: -6 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-blue-500 border-2 border-white shadow-lg"
        style={{ right: -6 }}
      />

      {/* Data Transfer Animation */}
      {isTransferring && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute top-1/2 left-0 w-4 h-1 bg-blue-400 rounded-full"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 320, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/2 left-0 w-4 h-1 bg-green-400 rounded-full"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 320, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeInOut" }}
          />
        </motion.div>
      )}

      {/* Error State Overlay */}
      {data.status === 'error' && (
        <div className="absolute inset-0 bg-red-500/10 backdrop-blur-sm rounded-2xl border-2 border-red-500/50 flex items-center justify-center">
          <div className="text-center">
            <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-400 text-sm font-medium">Connection Failed</p>
          </div>
        </div>
      )}

      {/* Rate Limited Warning */}
      {rateLimitPercentage > 80 && (
        <div className="absolute top-2 right-2">
          <motion.div
            className="flex items-center gap-1 bg-orange-500/20 px-2 py-1 rounded-full border border-orange-500/30"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <AlertTriangle className="w-3 h-3 text-orange-400" />
            <span className="text-orange-400 text-xs font-medium">Rate Limit</span>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};