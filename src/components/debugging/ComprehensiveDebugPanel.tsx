// Phase 3 Sprint 3.3: Comprehensive Debug Panel
// Real-time monitoring and debugging interface for simulation execution

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  Clock,
  DollarSign,
  Play,
  Pause,
  Search,
  TrendingUp,
  Zap,
  ChevronDown,
  ChevronRight,
  Download,
  Maximize2,
  Bug,
  Server,
  Database,
  Network,
  Users
} from 'lucide-react';
import { Card } from '../ui/Card';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Progress } from '../ui/progress';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { toast } from '../ui/use-toast';
import {
  DebugPanel,
  ExecutionStep,
  VariableState,
  APICallLog,
  ErrorEvent,
  PerformanceMetric,
  CostAnalysis,
  DebugFilterConfig
} from '../../types/simulation';

interface ComprehensiveDebugPanelProps {
  simulationId: string;
  debugData: DebugPanel;
  isLive?: boolean;
  onUpdateFilter?: (filter: DebugFilterConfig) => void;
  onExportLogs?: () => void;
  className?: string;
}

export const ComprehensiveDebugPanel: React.FC<ComprehensiveDebugPanelProps> = ({
  simulationId,
  debugData,
  isLive = false,
  onUpdateFilter,
  onExportLogs,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<string>('timeline');
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLogLevel, setSelectedLogLevel] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(isLive);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('last-hour');

  // Filter and search logic
  const filteredExecutionSteps = useMemo(() => {
    return debugData.execution_timeline.filter(step => {
      const matchesSearch = !searchQuery || 
        step.step_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        step.node_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        step.id.includes(searchQuery);
      
      const matchesLevel = selectedLogLevel === 'all' || 
        (selectedLogLevel === 'errors' && step.status === 'failed') ||
        (selectedLogLevel === 'warnings' && step.status === 'skipped') ||
        (selectedLogLevel === 'info' && step.status === 'completed');

      return matchesSearch && matchesLevel;
    });
  }, [debugData.execution_timeline, searchQuery, selectedLogLevel]);

  const filteredAPILogs = useMemo(() => {
    return debugData.api_call_logs.filter(log => {
      const matchesSearch = !searchQuery ||
        log.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.endpoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.method.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [debugData.api_call_logs, searchQuery]);

  const filteredErrors = useMemo(() => {
    return debugData.error_tracker.filter(error => {
      const matchesSearch = !searchQuery ||
        error.error_message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        error.error_source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        error.error_type.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [debugData.error_tracker, searchQuery]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh || !isLive) return;

    const interval = setInterval(() => {
      // In a real implementation, this would trigger a data refresh
      console.log('Refreshing debug data...');
    }, 2000);

    return () => clearInterval(interval);
  }, [autoRefresh, isLive]);

  const toggleStepExpansion = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4
    }).format(amount);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'running': return 'text-blue-400';
      case 'failed': return 'text-red-400';
      case 'pending': return 'text-amber-400';
      case 'skipped': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />;
      case 'running': return <div className="w-2 h-2 bg-blue-400 rounded-full animate-spin" />;
      case 'failed': return <div className="w-2 h-2 bg-red-400 rounded-full" />;
      case 'pending': return <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />;
      case 'skipped': return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
      default: return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10';
      case 'high': return 'text-orange-500 bg-orange-500/10';
      case 'medium': return 'text-amber-500 bg-amber-500/10';
      case 'low': return 'text-blue-500 bg-blue-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const renderExecutionTimeline = () => (
    <div className="space-y-4">
      {/* Timeline Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {filteredExecutionSteps.length} steps
          </Badge>
          {isLive && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-green-400">Live</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            disabled={!isLive}
          >
            {autoRefresh ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            Auto-refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => setExpandedSteps(new Set())}>
            Collapse All
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {filteredExecutionSteps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-4 hover:shadow-md transition-all duration-200">
                <div 
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => toggleStepExpansion(step.id)}
                >
                  {/* Status Indicator */}
                  <div className="flex items-center gap-2">
                    {getStatusIcon(step.status)}
                    {expandedSteps.has(step.id) ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>

                  {/* Step Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{step.node_name || step.step_type}</span>
                      <Badge variant="outline" className="text-xs">
                        {step.step_type}
                      </Badge>
                      <span className={`text-xs ${getStatusColor(step.status)}`}>
                        {step.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(step.timestamp).toLocaleTimeString()}
                      </span>
                      {step.duration_ms && (
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          {formatDuration(step.duration_ms)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Performance Indicator */}
                  {step.duration_ms && (
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">
                        {formatDuration(step.duration_ms)}
                      </div>
                      {step.duration_ms > 5000 && (
                        <div className="text-xs text-amber-500">Slow</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedSteps.has(step.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-4 pt-4 border-t border-border"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Input Data */}
                        {step.input_data && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Input Data</h4>
                            <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-32">
                              {JSON.stringify(step.input_data, null, 2)}
                            </pre>
                          </div>
                        )}

                        {/* Output Data */}
                        {step.output_data && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Output Data</h4>
                            <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-32">
                              {JSON.stringify(step.output_data, null, 2)}
                            </pre>
                          </div>
                        )}

                        {/* Metadata */}
                        {step.metadata && Object.keys(step.metadata).length > 0 && (
                          <div className="md:col-span-2">
                            <h4 className="text-sm font-medium mb-2">Metadata</h4>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(step.metadata).map(([key, value]) => (
                                <Badge key={key} variant="outline" className="text-xs">
                                  {key}: {String(value)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  const renderAPILogs = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-xs">
          {filteredAPILogs.length} API calls
        </Badge>
        <div className="flex items-center gap-2">
          <Switch
            checked={debugData.filter_config.show_mock_calls}
            onCheckedChange={(checked) => {
              if (onUpdateFilter) {
                onUpdateFilter({
                  ...debugData.filter_config,
                  show_mock_calls: checked
                });
              }
            }}
          />
          <span className="text-sm text-muted-foreground">Show mocks</span>
        </div>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {filteredAPILogs.map((log, index) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  {/* Method Badge */}
                  <Badge 
                    variant={log.response_status >= 400 ? 'destructive' : 'default'}
                    className="text-xs min-w-[60px] text-center"
                  >
                    {log.method}
                  </Badge>

                  {/* Request Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{log.service_name}</span>
                      {log.is_mock && (
                        <Badge variant="outline" className="text-xs">Mock</Badge>
                      )}
                      <span className={`text-xs ${log.response_status >= 400 ? 'text-red-400' : 'text-green-400'}`}>
                        {log.response_status}
                      </span>
                    </div>
                    
                    <div className="text-xs text-muted-foreground mb-2">
                      {log.endpoint}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(log.duration_ms)}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {formatCurrency(log.cost)}
                      </span>
                      {log.rate_limit_info && (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {log.rate_limit_info.remaining}/{log.rate_limit_info.limit}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Response Time Indicator */}
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                    {log.duration_ms > 2000 && (
                      <div className="text-xs text-amber-500">Slow</div>
                    )}
                  </div>
                </div>

                {/* Error Details */}
                {log.error_details && (
                  <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded">
                    <div className="text-xs text-red-400">{log.error_details}</div>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  const renderVariableInspector = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-xs">
          {debugData.variable_inspector.length} variables
        </Badge>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {debugData.variable_inspector.map((variable, index) => (
            <motion.div
              key={variable.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-sm font-medium">{variable.variable_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {variable.variable_type}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {variable.scope}
                      </Badge>
                      {variable.is_sensitive && (
                        <Badge variant="destructive" className="text-xs">
                          Sensitive
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-muted-foreground">Current Value:</span>
                        <pre className="bg-muted p-2 rounded text-xs mt-1 overflow-auto max-h-20">
                          {variable.is_sensitive 
                            ? '***MASKED***' 
                            : JSON.stringify(variable.current_value, null, 2)
                          }
                        </pre>
                      </div>

                      {variable.previous_value !== undefined && (
                        <div>
                          <span className="text-xs text-muted-foreground">Previous Value:</span>
                          <pre className="bg-muted/50 p-2 rounded text-xs mt-1 overflow-auto max-h-20">
                            {variable.is_sensitive 
                              ? '***MASKED***' 
                              : JSON.stringify(variable.previous_value, null, 2)
                            }
                          </pre>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground mt-2">
                      Last modified: {new Date(variable.last_modified).toLocaleString()}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  const renderErrorTracker = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-xs">
          {filteredErrors.length} errors
        </Badge>
        <div className="flex items-center gap-2">
          <Select value="all" onValueChange={() => {}}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {filteredErrors.map((error, index) => (
            <motion.div
              key={error.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card className="p-4 border-l-4 border-l-red-500">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-sm">{error.error_code}</span>
                      <Badge className={`text-xs ${getSeverityColor(error.severity)}`}>
                        {error.severity}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {error.error_type}
                      </Badge>
                    </div>

                    <div className="text-sm text-foreground mb-2">
                      {error.error_message}
                    </div>

                    <div className="text-xs text-muted-foreground mb-2">
                      Source: {error.error_source}
                    </div>

                    {error.stack_trace && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          Stack Trace
                        </summary>
                        <pre className="bg-muted p-2 rounded mt-2 overflow-auto max-h-32">
                          {error.stack_trace}
                        </pre>
                      </details>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-muted-foreground">
                        {new Date(error.timestamp).toLocaleString()}
                      </span>
                      <Badge 
                        variant={error.resolution_status === 'resolved' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {error.resolution_status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  const renderPerformanceMetrics = () => (
    <div className="space-y-4">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {debugData.performance_metrics.map((metric) => (
          <GlassCard key={metric.id} className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{metric.metric_name}</div>
                <div className="text-lg font-bold">
                  {metric.value} {metric.unit}
                </div>
                {metric.threshold && (
                  <Progress 
                    value={(metric.value / metric.threshold.warning_value) * 100} 
                    className="mt-2 h-1"
                  />
                )}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Detailed Metrics */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Performance Details</h3>
        <div className="space-y-3">
          {debugData.performance_metrics.map((metric) => (
            <div key={metric.id} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
              <div className="flex items-center gap-3">
                <span className="font-medium text-sm">{metric.metric_name}</span>
                <Badge variant="outline" className="text-xs">
                  {metric.metric_type}
                </Badge>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm">
                  {metric.value} {metric.unit}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(metric.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderCostAnalysis = () => (
    <div className="space-y-4">
      {/* Cost Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <DollarSign className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Cost</div>
              <div className="text-xl font-bold">
                {formatCurrency(debugData.cost_breakdown.total_cost)}
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Projected Monthly</div>
              <div className="text-xl font-bold">
                {formatCurrency(debugData.cost_breakdown.projected_monthly_cost)}
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Budget Usage</div>
              <div className="text-xl font-bold">67%</div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Cost Breakdown */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Cost Breakdown</h3>
        <div className="space-y-3">
          {debugData.cost_breakdown.cost_by_category.map((category, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <span className="font-medium text-sm">{category.category}</span>
                {category.subcategory && (
                  <span className="text-xs text-muted-foreground">
                    ({category.subcategory})
                  </span>
                )}
              </div>
              <div className="text-right">
                <div className="font-mono text-sm">
                  {formatCurrency(category.cost)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {category.percentage_of_total.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Optimization Suggestions */}
      {debugData.cost_breakdown.cost_optimization_suggestions.length > 0 && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Optimization Suggestions</h3>
          <div className="space-y-3">
            {debugData.cost_breakdown.cost_optimization_suggestions.map((suggestion) => (
              <div key={suggestion.id} className="p-3 bg-blue-500/10 border border-blue-500/20 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{suggestion.suggestion_type}</span>
                  <Badge variant="outline" className="text-xs">
                    Save {formatCurrency(suggestion.potential_savings)}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {suggestion.description}
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span>Effort: {suggestion.implementation_effort}</span>
                  <span>Impact: {suggestion.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-foreground">Debug Panel</h2>
          <Badge variant="outline" className="text-xs">
            Simulation: {simulationId}
          </Badge>
          {isLive && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-green-400">Live</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onExportLogs && (
            <Button variant="outline" size="sm" onClick={onExportLogs}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <Maximize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs, steps, errors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={selectedLogLevel} onValueChange={setSelectedLogLevel}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Log Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="errors">Errors Only</SelectItem>
            <SelectItem value="warnings">Warnings</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last-hour">Last Hour</SelectItem>
            <SelectItem value="last-day">Last Day</SelectItem>
            <SelectItem value="last-week">Last Week</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Debug Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="timeline">
            <Activity className="h-4 w-4 mr-2" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="api-logs">
            <Server className="h-4 w-4 mr-2" />
            API Logs
          </TabsTrigger>
          <TabsTrigger value="variables">
            <Database className="h-4 w-4 mr-2" />
            Variables
          </TabsTrigger>
          <TabsTrigger value="errors">
            <Bug className="h-4 w-4 mr-2" />
            Errors
          </TabsTrigger>
          <TabsTrigger value="performance">
            <TrendingUp className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="costs">
            <DollarSign className="h-4 w-4 mr-2" />
            Costs
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="timeline">
            {renderExecutionTimeline()}
          </TabsContent>

          <TabsContent value="api-logs">
            {renderAPILogs()}
          </TabsContent>

          <TabsContent value="variables">
            {renderVariableInspector()}
          </TabsContent>

          <TabsContent value="errors">
            {renderErrorTracker()}
          </TabsContent>

          <TabsContent value="performance">
            {renderPerformanceMetrics()}
          </TabsContent>

          <TabsContent value="costs">
            {renderCostAnalysis()}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};