
import React from 'react';
import { motion } from 'framer-motion';
import { useWizardStore } from '../../../stores/wizardStore';
import { GlassCard } from '../../ui/GlassCard';
import { HolographicButton } from '../../ui/HolographicButton';
import { 
  CheckCircle, 
  Users, 
  Workflow, 
  Brain, 
  ArrowRight,
  Edit
} from 'lucide-react';

export const BlueprintStep: React.FC = () => {
  const { blueprint, nextStep } = useWizardStore();

  if (!blueprint) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <GlassCard variant="medium" className="p-8 text-center">
          <p className="text-white text-lg">No blueprint available. Please go back and create one.</p>
        </GlassCard>
      </div>
    );
  }

  const handleNextStep = () => {
    nextStep('canvas');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <GlassCard variant="medium" className="p-8">
          <div className="flex items-center mb-8">
            <CheckCircle className="w-8 h-8 text-emerald-400 mr-4" />
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">AI Blueprint Generated</h2>
              <p className="text-gray-300">Review your intelligent business architecture</p>
            </div>
          </div>

          {/* Guild Overview */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Brain className="w-6 h-6 text-purple-400 mr-3" />
              <h3 className="text-xl font-semibold text-white">Guild: {blueprint.suggested_structure.guild_name}</h3>
            </div>
            <p className="text-gray-300 ml-9">{blueprint.suggested_structure.guild_purpose}</p>
          </div>

          {/* AI Interpretation */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-white mb-3">AI Understanding</h4>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="text-gray-300">{blueprint.interpretation}</p>
            </div>
          </div>

          {/* Agents */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-blue-400 mr-3" />
              <h4 className="text-lg font-semibold text-white">AI Agents ({blueprint.suggested_structure.agents.length})</h4>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {blueprint.suggested_structure.agents.map((agent, index) => (
                <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <h5 className="font-semibold text-white mb-2">{agent.name}</h5>
                  <p className="text-sm text-blue-300 mb-2">{agent.role}</p>
                  <p className="text-gray-300 text-sm mb-3">{agent.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {agent.tools_needed.map((tool, toolIndex) => (
                      <span key={toolIndex} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Workflows */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Workflow className="w-6 h-6 text-emerald-400 mr-3" />
              <h4 className="text-lg font-semibold text-white">Workflows ({blueprint.suggested_structure.workflows.length})</h4>
            </div>
            <div className="space-y-3">
              {blueprint.suggested_structure.workflows.map((workflow, index) => (
                <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <h5 className="font-semibold text-white">{workflow.name}</h5>
                    <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                      {workflow.trigger_type}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mt-2">{workflow.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-white/10">
            <HolographicButton variant="secondary">
              <Edit className="w-4 h-4 mr-2" />
              Modify Blueprint
            </HolographicButton>
            
            <HolographicButton
              variant="primary"
              onClick={handleNextStep}
              className="px-8"
            >
              Generate Canvas
              <ArrowRight className="w-4 h-4 ml-2" />
            </HolographicButton>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};
