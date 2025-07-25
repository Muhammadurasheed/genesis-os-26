import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users,
  Bell,
  RefreshCw
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { HolographicButton } from '../ui/HolographicButton';
import { toast } from 'sonner';

interface SystemHealth {
  status: string;
  active_executions: number;
  recent_errors: number;
  critical_alerts: number;
  websocket_connections: number;
  uptime_seconds: number;
}

interface Alert {
  id: string;
  level: string;
  title: string;
  message: string;
  timestamp: number;
  resolved: boolean;
}

export const RealTimeMonitoringDashboard: React.FC = () => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [metrics, setMetrics] = useState<Record<string, any>>({});
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const ws = new WebSocket('ws://localhost:8002');
        websocketRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          console.log('🌐 Connected to real-time monitoring');
          toast.success('Connected to real-time monitoring');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            handleWebSocketMessage(data);
            setLastUpdate(new Date());
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          console.log('🔌 Disconnected from monitoring');
          // Attempt to reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000);
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          toast.error('Real-time monitoring connection failed');
        };

      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        setTimeout(connectWebSocket, 5000);
      }
    };

    connectWebSocket();

    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, []);

  // Periodic data fetching as fallback
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchSystemHealth(),
          fetchMetrics(),
          fetchAlerts()
        ]);
      } catch (error) {
        console.error('Error fetching monitoring data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'monitoring_update':
        setMetrics(data.metrics_summary || {});
        // Update basic health info
        setSystemHealth(prev => prev ? {
          ...prev,
          active_executions: data.active_executions,
        } : null);
        break;

      case 'alert':
        setAlerts(prev => [data.alert, ...prev.slice(0, 9)]); // Keep last 10 alerts
        toast.error(`New Alert: ${data.alert.title}`, {
          description: data.alert.message
        });
        break;

      case 'execution_event':
        // Handle execution events
        console.log('Execution event:', data.event);
        break;

      case 'welcome':
        console.log('WebSocket welcome:', data);
        break;
    }
  };

  const fetchSystemHealth = async () => {
    try {
      const response = await fetch('http://localhost:8001/monitoring/health');
      if (response.ok) {
        const data = await response.json();
        setSystemHealth(data.health);
      }
    } catch (error) {
      console.error('Failed to fetch system health:', error);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch('http://localhost:8001/monitoring/metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await fetch('http://localhost:8001/monitoring/alerts');
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts);
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      case 'under_load': return 'text-orange-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'degraded': case 'under_load': return AlertTriangle;
      case 'critical': return AlertTriangle;
      default: return Activity;
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Real-time Monitoring</h1>
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${isConnected ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} ${isConnected ? 'animate-pulse' : ''}`} />
            <span className={`text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? 'Live' : 'Disconnected'}
            </span>
          </div>
          <HolographicButton variant="secondary" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </HolographicButton>
        </div>
      </div>

      {/* System Health Overview */}
      {systemHealth && (
        <GlassCard variant="medium" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">System Health</h2>
            <div className="flex items-center space-x-2">
              {React.createElement(getHealthStatusIcon(systemHealth.status), {
                className: `w-5 h-5 ${getHealthStatusColor(systemHealth.status)}`
              })}
              <span className={`text-sm font-medium ${getHealthStatusColor(systemHealth.status)}`}>
                {systemHealth.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-400">Active Executions</span>
              </div>
              <div className="text-2xl font-bold text-white">{systemHealth.active_executions}</div>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400">Critical Alerts</span>
              </div>
              <div className="text-2xl font-bold text-white">{systemHealth.critical_alerts}</div>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">WebSocket Clients</span>
              </div>
              <div className="text-2xl font-bold text-white">{systemHealth.websocket_connections}</div>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-yellow-400">Uptime</span>
              </div>
              <div className="text-2xl font-bold text-white">{formatUptime(systemHealth.uptime_seconds)}</div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard variant="medium" className="p-6">
          <h3 className="text-lg font-bold text-white mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            {Object.entries(metrics).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between py-2 border-b border-white/10">
                <span className="text-sm text-gray-300 capitalize">{key.replace(/_/g, ' ')}</span>
                <span className="text-sm font-medium text-white">
                  {typeof value === 'object' && value !== null 
                    ? `${value.latest?.toFixed(2) || 'N/A'}${key.includes('time') ? 'ms' : ''}` 
                    : value
                  }
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Recent Alerts */}
        <GlassCard variant="medium" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Recent Alerts</h3>
            <Bell className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                  alert.level === 'critical' ? 'bg-red-500/10 border-red-500' :
                  alert.level === 'warning' ? 'bg-yellow-500/10 border-yellow-500' :
                  'bg-blue-500/10 border-blue-500'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-white">{alert.title}</h4>
                      <p className="text-xs text-gray-400 mt-1">{alert.message}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(alert.timestamp * 1000).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-8">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <p>No active alerts</p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Last Update */}
      {lastUpdate && (
        <div className="text-center text-xs text-gray-500">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};