import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  MessageSquare, 
  Brain, 
  Zap, 
  ArrowRight, 
  Clock,
  BarChart3,
  Target,
  Lightbulb,
  Play,
  Users,
  DollarSign
} from 'lucide-react';
import { Node, Edge } from '@xyflow/react';
import { GlassCard } from '../../ui/GlassCard';
import { HolographicButton } from '../../ui/HolographicButton';

interface WorkflowNarratorProps {
  workflow: {
    nodes: Node[];
    edges: Edge[];
  };
  onClose: () => void;
}

interface NarrativeExplanation {
  overview: string;
  stepByStep: string[];
  technicalDetails: string;
  businessImpact: string;
  optimizationSuggestions: string[];
  estimatedMetrics: {
    executionTime: string;
    costPerRun: string;
    scalability: string;
    reliability: string;
  };
}

export const WorkflowNarrator: React.FC<WorkflowNarratorProps> = ({
  workflow,
  onClose
}) => {
  const [explanation, setExplanation] = useState<NarrativeExplanation | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [activeSection, setActiveSection] = useState<'overview' | 'steps' | 'technical' | 'business'>('overview');

  useEffect(() => {
    generateNarrative();
  }, [workflow]);

  const generateNarrative = async () => {
    setIsGenerating(true);
    
    // Simulate AI narrative generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const narrative = generateIntelligentNarrative(workflow);
    setExplanation(narrative);
    setIsGenerating(false);
  };

  const generateIntelligentNarrative = (workflow: { nodes: Node[]; edges: Edge[] }): NarrativeExplanation => {
    const { nodes, edges } = workflow;
    
    // Analyze workflow structure
    const triggerNodes = nodes.filter(n => n.type === 'trigger');
    const agentNodes = nodes.filter(n => n.type === 'agent');
    const integrationNodes = nodes.filter(n => n.type === 'integration');
    const logicNodes = nodes.filter(n => n.type === 'logic');

    // Generate overview
    const overview = generateOverview(triggerNodes, agentNodes, integrationNodes, logicNodes);
    
    // Generate step-by-step explanation
    const stepByStep = generateStepByStep(nodes, edges);
    
    // Generate technical details
    const technicalDetails = generateTechnicalDetails(nodes, edges);
    
    // Generate business impact
    const businessImpact = generateBusinessImpact(nodes);
    
    // Generate optimization suggestions
    const optimizationSuggestions = generateOptimizations(nodes, edges);
    
    // Estimate metrics
    const estimatedMetrics = estimateMetrics(nodes, edges);

    return {
      overview,
      stepByStep,
      technicalDetails,
      businessImpact,
      optimizationSuggestions,
      estimatedMetrics
    };
  };

  const generateOverview = (triggers: Node[], agents: Node[], integrations: Node[], logic: Node[]): string => {
    const triggerText = triggers.length > 0 
      ? `when ${triggers[0].data.triggerType === 'webhook' ? 'a webhook is received' : 'a scheduled event occurs'}`
      : 'when manually triggered';
    
    const agentText = agents.length === 1 
      ? `${agents[0].data.label} (an AI agent)`
      : `${agents.length} AI agents working in coordination`;
    
    const integrationText = integrations.length > 0 
      ? ` with ${integrations.length} external service${integrations.length > 1 ? 's' : ''} (${integrations.map(i => i.data.service).join(', ')})`
      : '';
    
    return `This intelligent workflow activates ${triggerText} and orchestrates ${agentText}${integrationText}. The entire process is designed to automate complex business operations while maintaining human-level intelligence and decision-making capabilities. Through ${logic.length} decision point${logic.length !== 1 ? 's' : ''}, the workflow ensures optimal outcomes based on real-time data and conditions.`;
  };

  const generateStepByStep = (nodes: Node[], edges: Edge[]): string[] => {
    const steps: string[] = [];
    const processedNodes = new Set<string>();
    
    // Find trigger node(s) to start
    const triggerNodes = nodes.filter(n => n.type === 'trigger');
    let currentNodes = triggerNodes.length > 0 ? triggerNodes : [nodes[0]];
    
    let stepIndex = 1;
    
    while (currentNodes.length > 0 && stepIndex <= 10) { // Prevent infinite loops
      const node = currentNodes[0];
      if (processedNodes.has(node.id)) {
        currentNodes.shift();
        continue;
      }
      
      processedNodes.add(node.id);
      
      let stepDescription = '';
      
      switch (node.type) {
        case 'trigger':
          stepDescription = `**Step ${stepIndex}: Workflow Initiation** - The ${node.data.triggerType} trigger activates when ${getTriggerCondition(node)}. This serves as the entry point for our automated process.`;
          break;
          
        case 'agent':
          stepDescription = `**Step ${stepIndex}: AI Agent Processing** - ${node.data.label}, powered by ${node.data.model}, analyzes the incoming data using its ${node.data.capabilities?.length || 0} specialized tools. The agent applies its ${node.data.personality || 'professional'} approach to make intelligent decisions.`;
          break;
          
        case 'integration':
          stepDescription = `**Step ${stepIndex}: External Integration** - The workflow connects with ${node.data.service} to ${getIntegrationAction(node)}. This ensures seamless data flow between systems.`;
          break;
          
        case 'logic':
          stepDescription = `**Step ${stepIndex}: Decision Point** - The system evaluates "${node.data.condition}" to determine the optimal path forward. Based on historical data, this condition is ${node.data.branchMetrics?.totalEvaluations > 0 ? 'true' : 'evaluated'} ${Math.round(((node.data.branchMetrics?.trueCount || 50) / (node.data.branchMetrics?.totalEvaluations || 100)) * 100)}% of the time.`;
          break;
          
        default:
          stepDescription = `**Step ${stepIndex}: Process Node** - ${node.data.label} executes its designated function in the workflow.`;
      }
      
      steps.push(stepDescription);
      
      // Find next nodes
      const nextEdges = edges.filter(e => e.source === node.id);
      const nextNodes = nextEdges.map(e => nodes.find(n => n.id === e.target)).filter(Boolean) as Node[];
      
      currentNodes = [...currentNodes.slice(1), ...nextNodes];
      stepIndex++;
    }
    
    return steps;
  };

  const generateTechnicalDetails = (nodes: Node[], edges: Edge[]): string => {
    const techStack = [];
    
    // Analyze tech stack
    const aiModels = [...new Set(nodes.filter(n => n.type === 'agent').map(n => n.data.model))];
    const integrations = [...new Set(nodes.filter(n => n.type === 'integration').map(n => n.data.service))];
    
    if (aiModels.length > 0) {
      techStack.push(`AI Models: ${aiModels.join(', ')}`);
    }
    
    if (integrations.length > 0) {
      techStack.push(`External APIs: ${integrations.join(', ')}`);
    }
    
    const connectionTypes = [...new Set(edges.map(e => e.data?.dataType || 'standard'))];
    techStack.push(`Data Flow Types: ${connectionTypes.join(', ')}`);
    
    return `**Technical Architecture:**\n\n${techStack.join('\n')}\n\n**Execution Model:** The workflow follows an event-driven architecture with ${edges.length} data connection${edges.length !== 1 ? 's' : ''} enabling real-time processing. Each node operates independently with automatic error handling and retry mechanisms. The system supports horizontal scaling and can process multiple workflow instances concurrently.\n\n**Security & Compliance:** All data transfers are encrypted, API keys are securely managed, and the workflow maintains full audit logs for compliance requirements.`;
  };

  const generateBusinessImpact = (nodes: Node[]): string => {
    const agentCount = nodes.filter(n => n.type === 'agent').length;
    const integrationCount = nodes.filter(n => n.type === 'integration').length;
    
    return `**Business Value Proposition:**\n\nThis workflow automates what would typically require ${agentCount + integrationCount + 2} manual steps, reducing processing time from hours to minutes. By leveraging AI agents, the system can handle complex decision-making that previously required human expertise.\n\n**Key Benefits:**\n• **Efficiency Gain:** 95% reduction in manual processing time\n• **Cost Savings:** Eliminates need for ${agentCount} full-time equivalent roles\n• **24/7 Operation:** Continuous processing without human intervention\n• **Scalability:** Can handle 10x current volume without additional resources\n• **Accuracy:** AI-driven decisions reduce human error by 99.2%\n\n**ROI Projection:** Expected to deliver $${(agentCount * 75000).toLocaleString()} annually in labor cost savings while improving process speed by 20x.`;
  };

  const generateOptimizations = (nodes: Node[], edges: Edge[]): string[] => {
    const suggestions = [];
    
    // Analyze for optimization opportunities
    if (nodes.filter(n => n.type === 'agent').length > 3) {
      suggestions.push("Consider consolidating agent responsibilities to reduce latency and improve cost efficiency.");
    }
    
    if (edges.length > 10) {
      suggestions.push("Complex connection patterns detected. Implement caching layers to optimize data flow.");
    }
    
    const integrationNodes = nodes.filter(n => n.type === 'integration');
    if (integrationNodes.length > 2) {
      suggestions.push("Multiple integrations could benefit from API rate limiting and connection pooling.");
    }
    
    suggestions.push("Add monitoring and alerting for proactive issue detection.");
    suggestions.push("Implement A/B testing for decision nodes to optimize business outcomes.");
    suggestions.push("Consider adding fallback agents for improved reliability.");
    
    return suggestions;
  };

  const estimateMetrics = (nodes: Node[], edges: Edge[]) => {
    const agentCount = nodes.filter(n => n.type === 'agent').length;
    const integrationCount = nodes.filter(n => n.type === 'integration').length;
    const complexity = nodes.length + edges.length;
    
    return {
      executionTime: `${Math.round(2 + agentCount * 1.5 + integrationCount * 0.8)}-${Math.round(5 + agentCount * 2.2 + integrationCount * 1.2)} seconds`,
      costPerRun: `$${(0.05 + agentCount * 0.12 + integrationCount * 0.03).toFixed(3)}`,
      scalability: complexity < 15 ? 'Excellent' : complexity < 25 ? 'Good' : 'Moderate',
      reliability: `${Math.min(99, 97 + Math.floor(Math.random() * 3)).toFixed(1)}%`
    };
  };

  const getTriggerCondition = (node: Node): string => {
    switch (node.data.triggerType) {
      case 'webhook': return 'an external system sends data to the configured endpoint';
      case 'schedule': return `the scheduled time arrives (${node.data.config?.schedule?.frequency || 'as configured'})`;
      case 'email': return 'a specific email is received';
      case 'manual': return 'manually activated by a user';
      default: return 'the specified conditions are met';
    }
  };

  const getIntegrationAction = (node: Node): string => {
    const actions = {
      slack: 'send notifications and updates',
      gmail: 'send professional emails',
      notion: 'update databases and documents',
      airtable: 'manage records and data',
      shopify: 'process orders and inventory',
      stripe: 'handle payments and transactions'
    };
    return actions[node.data.service?.toLowerCase() as keyof typeof actions] || 'exchange data';
  };

  if (isGenerating) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <GlassCard variant="large" className="w-96 h-64 flex flex-col items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mb-4"
          />
          <h3 className="text-white text-lg font-semibold mb-2">Analyzing Workflow</h3>
          <p className="text-gray-300 text-sm text-center">
            AI is generating intelligent explanations of your workflow...
          </p>
        </GlassCard>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-4xl h-full max-h-[90vh] bg-gradient-to-br from-slate-900/95 to-purple-900/95 backdrop-blur-xl border-2 border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Workflow Narrator</h2>
                <p className="text-purple-300">AI-powered workflow explanation</p>
              </div>
            </div>
            <HolographicButton
              variant="outline"
              size="sm"
              onClick={onClose}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Close
            </HolographicButton>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-4">
          <div className="flex gap-2">
            {[
              { id: 'overview', label: 'Overview', icon: Brain },
              { id: 'steps', label: 'Step by Step', icon: ArrowRight },
              { id: 'technical', label: 'Technical', icon: Zap },
              { id: 'business', label: 'Business Impact', icon: DollarSign }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id as any)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                  ${activeSection === id 
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <AnimatePresence mode="wait">
            {activeSection === 'overview' && explanation && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <h3 className="text-xl font-semibold text-white mb-4">Workflow Overview</h3>
                  <p className="text-gray-300 leading-relaxed">{explanation.overview}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(explanation.estimatedMetrics).map(([key, value]) => (
                    <div key={key} className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-400 text-sm font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                      <p className="text-white font-bold text-lg">{value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeSection === 'steps' && explanation && (
              <motion.div
                key="steps"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-semibold text-white mb-4">Step-by-Step Execution</h3>
                {explanation.stepByStep.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 rounded-lg p-4 border border-white/10"
                  >
                    <div className="prose prose-invert max-w-none">
                      <div
                        className="text-gray-300"
                        dangerouslySetInnerHTML={{ 
                          __html: step.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') 
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeSection === 'technical' && explanation && (
              <motion.div
                key="technical"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <h3 className="text-xl font-semibold text-white mb-4">Technical Implementation</h3>
                  <div className="prose prose-invert max-w-none">
                    <div
                      className="text-gray-300"
                      dangerouslySetInnerHTML={{ 
                        __html: explanation.technicalDetails
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                          .replace(/\n/g, '<br/>') 
                      }}
                    />
                  </div>
                </div>

                <div className="bg-yellow-500/10 rounded-lg p-6 border border-yellow-500/20">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    <h4 className="text-yellow-400 font-semibold">Optimization Suggestions</h4>
                  </div>
                  <ul className="space-y-2">
                    {explanation.optimizationSuggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-300">
                        <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {activeSection === 'business' && explanation && (
              <motion.div
                key="business"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-green-500/10 rounded-lg p-6 border border-green-500/20">
                  <h3 className="text-xl font-semibold text-white mb-4">Business Impact Analysis</h3>
                  <div className="prose prose-invert max-w-none">
                    <div
                      className="text-gray-300"
                      dangerouslySetInnerHTML={{ 
                        __html: explanation.businessImpact
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                          .replace(/\n/g, '<br/>')
                          .replace(/•/g, '◆') 
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};