import React, { useState } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  EdgeProps,
  useReactFlow
} from '@xyflow/react';
import { motion } from 'framer-motion';
import { Database, Zap, Settings, Trash2, Info } from 'lucide-react';

interface DataFlowEdgeData {
  dataType: 'event' | 'structured' | 'mixed' | 'binary';
  flowRate: 'low' | 'normal' | 'high' | 'burst';
  transformations: string[];
  realTimeMetrics: {
    dataVolume: number;
    errorRate: number;
    avgProcessingTime: number;
  };
}

export const GenesisDataFlowEdge: React.FC<EdgeProps<DataFlowEdgeData>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { setEdges } = useReactFlow();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const getDataTypeColor = () => {
    const colors = {
      event: '#10b981',
      structured: '#3b82f6',
      mixed: '#8b5cf6',
      binary: '#f59e0b'
    };
    return colors[data?.dataType || 'mixed'] || '#6366f1';
  };

  const getFlowRateThickness = () => {
    const thickness = {
      low: 2,
      normal: 3,
      high: 4,
      burst: 5
    };
    return thickness[data?.flowRate || 'normal'] || 3;
  };

  const getFlowRateSpeed = () => {
    const speeds = {
      low: 4,
      normal: 2,
      high: 1,
      burst: 0.5
    };
    return speeds[data?.flowRate || 'normal'] || 2;
  };

  const onEdgeClick = () => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  const dataTypeColor = getDataTypeColor();
  const strokeWidth = getFlowRateThickness();
  const animationSpeed = getFlowRateSpeed();

  return (
    <>
      {/* Main Edge Path */}
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{
          ...style,
          stroke: dataTypeColor,
          strokeWidth: strokeWidth,
          filter: isHovered ? `drop-shadow(0 0 6px ${dataTypeColor})` : 'none'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      {/* Data Flow Particles */}
      <motion.circle
        r="3"
        fill={dataTypeColor}
        className="pointer-events-none"
      >
        <animateMotion
          dur={`${animationSpeed}s`}
          repeatCount="indefinite"
          path={edgePath}
        />
      </motion.circle>

      <motion.circle
        r="2"
        fill={`${dataTypeColor}80`}
        className="pointer-events-none"
      >
        <animateMotion
          dur={`${animationSpeed * 1.2}s`}
          repeatCount="indefinite"
          path={edgePath}
          begin="0.3s"
        />
      </motion.circle>

      <motion.circle
        r="2.5"
        fill={`${dataTypeColor}60`}
        className="pointer-events-none"
      >
        <animateMotion
          dur={`${animationSpeed * 0.8}s`}
          repeatCount="indefinite"
          path={edgePath}
          begin="0.6s"
        />
      </motion.circle>

      {/* Interactive Edge Label */}
      <EdgeLabelRenderer>
        <div
          className="edge-label-container nodrag nopan"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Main Control Button */}
          <motion.div
            className="flex items-center gap-2 bg-black/80 backdrop-blur-xl rounded-lg border shadow-lg"
            style={{ borderColor: `${dataTypeColor}40` }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ 
              scale: isHovered ? 1.05 : 1, 
              opacity: 1,
              boxShadow: isHovered ? `0 0 20px ${dataTypeColor}40` : '0 4px 12px rgba(0,0,0,0.3)'
            }}
            transition={{ duration: 0.2 }}
          >
            {/* Data Type Indicator */}
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: dataTypeColor }}
            />

            {/* Edge Controls */}
            <div className="flex items-center gap-1 px-2 py-1">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="p-1 hover:bg-white/10 rounded text-white"
                title="Edge Details"
              >
                <Info className="w-3 h-3" />
              </button>
              
              <button
                onClick={onEdgeClick}
                className="p-1 hover:bg-red-500/20 rounded text-red-400"
                title="Delete Edge"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            {/* Data Type Label */}
            <div className="px-2 py-1 text-xs font-medium text-white capitalize">
              {data?.dataType || 'mixed'}
            </div>
          </motion.div>

          {/* Detailed Information Panel */}
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: -60, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur-xl rounded-lg border border-white/20 p-4 min-w-64 shadow-2xl"
            >
              <h4 className="text-white font-medium text-sm mb-3 flex items-center gap-2">
                <Database className="w-4 h-4" style={{ color: dataTypeColor }} />
                Data Flow Details
              </h4>

              {/* Metrics */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Data Volume:</span>
                  <span className="text-white font-medium">
                    {data?.realTimeMetrics?.dataVolume?.toLocaleString() || '0'} records
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Error Rate:</span>
                  <span className="text-white font-medium">
                    {((data?.realTimeMetrics?.errorRate || 0) * 100).toFixed(2)}%
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Processing:</span>
                  <span className="text-white font-medium">
                    {data?.realTimeMetrics?.avgProcessingTime || 0}ms
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Flow Rate:</span>
                  <span className="text-white font-medium capitalize">
                    {data?.flowRate || 'normal'}
                  </span>
                </div>
              </div>

              {/* Transformations */}
              {data?.transformations && data.transformations.length > 0 && (
                <div className="mt-3 pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="w-3 h-3 text-purple-400" />
                    <span className="text-purple-400 text-xs font-medium">Transformations</span>
                  </div>
                  <div className="space-y-1">
                    {data.transformations.map((transform, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-purple-400 rounded-full" />
                        <span className="text-gray-300 text-xs">{transform}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Close button */}
              <button
                onClick={() => setShowDetails(false)}
                className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded text-gray-400"
              >
                ×
              </button>
            </motion.div>
          )}
        </div>
      </EdgeLabelRenderer>

      {/* Error Indicator */}
      {data?.realTimeMetrics?.errorRate && data.realTimeMetrics.errorRate > 0.1 && (
        <EdgeLabelRenderer>
          <motion.div
            className="error-indicator"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX + 40}px,${labelY - 20}px)`,
            }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-red-300" />
          </motion.div>
        </EdgeLabelRenderer>
      )}

      {/* High Volume Indicator */}
      {data?.realTimeMetrics?.dataVolume && data.realTimeMetrics.dataVolume > 1000 && (
        <EdgeLabelRenderer>
          <motion.div
            className="volume-indicator"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX - 40}px,${labelY - 20}px)`,
            }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-green-300" />
          </motion.div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};