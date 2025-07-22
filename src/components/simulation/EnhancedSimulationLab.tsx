
import React, { useState } from 'react';
import { 
  Play, 
  Pause,
  Settings,
  Users,
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { HolographicButton } from '../ui/HolographicButton';

interface EnhancedSimulationLabProps {
  guildId: string;
}

export const EnhancedSimulationLab: React.FC<EnhancedSimulationLabProps> = ({ guildId }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string>('customer-service');

  const scenarios = [
    {
      id: 'customer-service',
      name: 'Customer Service Simulation',
      description: 'Simulates customer interactions and support processes.'
    },
    {
      id: 'sales-process',
      name: 'Sales Process Simulation', 
      description: 'Models the steps in a typical sales cycle.'
    },
    {
      id: 'marketing-campaign',
      name: 'Marketing Campaign Simulation',
      description: 'Simulates the impact of a marketing campaign on customer engagement.'
    }
  ];

  const handleRunSimulation = () => {
    setIsRunning(true);
    // Simulate some processing time
    setTimeout(() => setIsRunning(false), 5000);
  };

  const handleStopSimulation = () => {
    setIsRunning(false);
  };

  return (
    <GlassCard variant="medium" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Enhanced Simulation Lab</h2>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400">Live</span>
          </div>
          <HolographicButton variant="secondary" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </HolographicButton>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-white mb-2">
          Select Scenario
        </label>
        <select
          value={selectedScenario}
          onChange={(e) => setSelectedScenario(e.target.value)}
          className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
        >
          {scenarios.map((scenario) => (
            <option key={scenario.id} value={scenario.id}>
              {scenario.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-yellow-400" />
          <span className="text-sm text-yellow-400">
            Guild: {guildId}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <HolographicButton
            variant="primary"
            size="sm"
            onClick={isRunning ? handleStopSimulation : handleRunSimulation}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-2 animate-pulse" />
                Stop Simulation
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Simulation
              </>
            )}
          </HolographicButton>
        </div>
      </div>
    </GlassCard>
  );
};
