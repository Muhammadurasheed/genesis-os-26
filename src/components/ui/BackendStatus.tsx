
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface BackendStatusProps {
  url: string;
}

export const BackendStatus: React.FC<BackendStatusProps> = ({ url }) => {
  const [status, setStatus] = useState<'loading' | 'online' | 'offline' | 'error'>('loading');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          setStatus('online');
        } else {
          setStatus('offline');
        }
      } catch (error) {
        setStatus('error');
      }
    };

    checkStatus();
    const intervalId = setInterval(checkStatus, 15000);

    return () => clearInterval(intervalId);
  }, [url]);

  let statusDisplay;
  let colorClass;

  switch (status) {
    case 'loading':
      statusDisplay = 'Loading...';
      colorClass = 'text-gray-400';
      break;
    case 'online':
      statusDisplay = 'Online';
      colorClass = 'text-green-400';
      break;
    case 'offline':
      statusDisplay = 'Offline';
      colorClass = 'text-yellow-400';
      break;
    case 'error':
      statusDisplay = 'Error';
      colorClass = 'text-red-400';
      break;
    default:
      statusDisplay = 'Unknown';
      colorClass = 'text-gray-400';
  }

  let icon;

  switch (status) {
    case 'loading':
      icon = <Clock className="w-4 h-4 mr-2 animate-spin" />;
      break;
    case 'online':
      icon = <CheckCircle className="w-4 h-4 mr-2" />;
      break;
    case 'offline':
      icon = <AlertTriangle className="w-4 h-4 mr-2" />;
      break;
    case 'error':
      icon = <XCircle className="w-4 h-4 mr-2" />;
      break;
    default:
      icon = null;
  }

  return (
    <GlassCard variant="medium" className="p-3">
      <div className="flex items-center">
        {icon}
        <span className={`${colorClass} text-sm`}>{statusDisplay}</span>
      </div>
    </GlassCard>
  );
};
