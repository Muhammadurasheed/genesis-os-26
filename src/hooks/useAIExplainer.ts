import { useState, useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';

interface ExplanationRequest {
  type: 'workflow' | 'node' | 'connection';
  target?: string;
  context?: any;
}

interface Explanation {
  overview: string;
  details: string[];
  suggestions: string[];
  complexity: 'simple' | 'moderate' | 'complex';
  confidence: number;
}

interface OptimizationSuggestion {
  id: string;
  type: 'performance' | 'cost' | 'reliability' | 'maintainability';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  priority: number;
}

export const useAIExplainer = () => {
  const [isExplaining, setIsExplaining] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState<Explanation | null>(null);

  const explainWorkflow = useCallback(async (nodes: Node[], edges: Edge[]): Promise<Explanation> => {
    setIsExplaining(true);
    
    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const explanation = generateWorkflowExplanation(nodes, edges);
      setCurrentExplanation(explanation);
      
      return explanation;
    } catch (error) {
      console.error('❌ Error explaining workflow:', error);
      throw error;
    } finally {
      setIsExplaining(false);
    }
  }, []);

  const explainNode = useCallback(async (node: Node, connectedNodes: Node[]): Promise<Explanation> => {
    setIsExplaining(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const explanation = generateNodeExplanation(node, connectedNodes);
      
      return explanation;
    } catch (error) {
      console.error('❌ Error explaining node:', error);
      throw error;
    } finally {
      setIsExplaining(false);
    }
  }, []);

  const explainConnection = useCallback(async (edge: Edge, sourceNode: Node, targetNode: Node): Promise<Explanation> => {
    setIsExplaining(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const explanation = generateConnectionExplanation(edge, sourceNode, targetNode);
      
      return explanation;
    } catch (error) {
      console.error('❌ Error explaining connection:', error);
      throw error;
    } finally {
      setIsExplaining(false);
    }
  }, []);

  const suggestOptimizations = useCallback(async (nodes: Node[], edges: Edge[]): Promise<OptimizationSuggestion[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const suggestions = generateOptimizationSuggestions(nodes, edges);
      
      return suggestions;
    } catch (error) {
      console.error('❌ Error generating optimizations:', error);
      throw error;
    }
  }, []);

  const generateWorkflowExplanation = (nodes: Node[], edges: Edge[]): Explanation => {
    const triggerNodes = nodes.filter(n => n.type === 'trigger');
    const agentNodes = nodes.filter(n => n.type === 'agent');
    const integrationNodes = nodes.filter(n => n.type === 'integration');
    const logicNodes = nodes.filter(n => n.type === 'logic');
    
    const complexity = calculateComplexity(nodes, edges);
    
    const overview = generateOverviewText(triggerNodes, agentNodes, integrationNodes, logicNodes, edges);
    
    const details = [
      `This workflow consists of ${nodes.length} nodes connected by ${edges.length} data flows.`,
      `Entry points: ${triggerNodes.length} trigger${triggerNodes.length !== 1 ? 's' : ''} initiate the process.`,
      `AI processing: ${agentNodes.length} intelligent agent${agentNodes.length !== 1 ? 's' : ''} handle decision-making.`,
      `External integrations: ${integrationNodes.length} service${integrationNodes.length !== 1 ? 's' : ''} for data exchange.`,
      `Decision points: ${logicNodes.length} logic node${logicNodes.length !== 1 ? 's' : ''} control flow direction.`,
      `Estimated execution time: ${estimateExecutionTime(nodes)} seconds.`,
      `Complexity level: ${complexity} - suitable for ${getComplexityUseCase(complexity)}.`
    ];
    
    const suggestions = generateWorkflowSuggestions(nodes, edges);
    
    return {
      overview,
      details,
      suggestions,
      complexity,
      confidence: calculateConfidence(nodes, edges)
    };
  };

  const generateNodeExplanation = (node: Node, connectedNodes: Node[]): Explanation => {
    let overview = '';
    let details: string[] = [];
    let suggestions: string[] = [];
    
    switch (node.type) {
      case 'agent':
        overview = `${node.data.label} is an AI agent powered by ${node.data.model}, designed to ${node.data.role.toLowerCase()}. It processes information intelligently and makes decisions based on its training and context.`;
        details = [
          `Model: ${node.data.model} - Advanced language model for complex reasoning`,
          `Capabilities: ${node.data.capabilities?.length || 0} specialized tools available`,
          `Personality: ${node.data.personality || 'Professional and efficient'}`,
          `Success rate: ${node.data.realTimeMetrics?.successRate || 95}%`,
          `Average response time: ${node.data.realTimeMetrics?.avgLatency || 1200}ms`,
          `Connected to ${connectedNodes.length} other nodes in the workflow`
        ];
        suggestions = [
          'Consider fine-tuning the agent\'s instructions for better accuracy',
          'Monitor token usage to optimize costs',
          'Add fallback logic for error handling'
        ];
        break;
        
      case 'trigger':
        overview = `This ${node.data.triggerType} trigger serves as the entry point for the workflow, activating when specific conditions are met. It ensures reliable workflow initiation.`;
        details = [
          `Trigger type: ${node.data.triggerType} - Automatically detects and responds to events`,
          `Status: ${node.data.status} - Currently monitoring for activation conditions`,
          `Success rate: ${node.data.realTimeMetrics?.successRate || 98}%`,
          `Total activations: ${node.data.realTimeMetrics?.triggerCount || 0}`,
          `Average latency: ${node.data.realTimeMetrics?.avgLatency || 50}ms`
        ];
        suggestions = [
          'Add rate limiting to prevent overwhelming downstream systems',
          'Implement retry logic for failed triggers',
          'Consider adding backup triggers for redundancy'
        ];
        break;
        
      case 'integration':
        overview = `This integration connects your workflow to ${node.data.service}, enabling seamless data exchange and automation. It handles authentication, data transformation, and error recovery.`;
        details = [
          `Service: ${node.data.service} - External API integration`,
          `Health status: ${node.data.apiHealth?.status || 'unknown'}`,
          `Response time: ${node.data.apiHealth?.responseTime || 'N/A'}ms`,
          `Uptime: ${node.data.apiHealth?.uptime || 'N/A'}%`,
          `Rate limit usage: ${node.data.apiHealth?.rateLimit?.used || 0}/${node.data.apiHealth?.rateLimit?.limit || 1000}`
        ];
        suggestions = [
          'Implement caching to reduce API calls',
          'Add circuit breaker pattern for reliability',
          'Monitor rate limits to prevent service disruption'
        ];
        break;
        
      case 'logic':
        overview = `This ${node.data.logicType} node controls workflow execution flow based on conditions. It evaluates "${node.data.condition}" to determine the next steps.`;
        details = [
          `Logic type: ${node.data.logicType} - Controls branching and decision-making`,
          `Condition: "${node.data.condition}"`,
          `True path probability: ${Math.round(((node.data.branchMetrics?.trueCount || 50) / (node.data.branchMetrics?.totalEvaluations || 100)) * 100)}%`,
          `Total evaluations: ${node.data.branchMetrics?.totalEvaluations || 0}`,
          `Average evaluation time: ${node.data.branchMetrics?.avgEvaluationTime || 10}ms`
        ];
        suggestions = [
          'Optimize condition logic for better performance',
          'Add logging for decision audit trails',
          'Consider A/B testing different conditions'
        ];
        break;
        
      default:
        overview = `This ${node.type} node performs a specific function in your workflow, contributing to the overall automation process.`;
        details = [`Node type: ${node.type}`, `Status: ${node.data.status || 'active'}`];
        suggestions = ['Consider adding monitoring and alerts'];
    }
    
    return {
      overview,
      details,
      suggestions,
      complexity: 'moderate',
      confidence: 0.92
    };
  };

  const generateConnectionExplanation = (edge: Edge, sourceNode: Node, targetNode: Node): Explanation => {
    const dataType = edge.data?.dataType || 'mixed';
    const transformations = edge.data?.transformations || [];
    
    const overview = `This connection transfers ${dataType} data from ${sourceNode.data.label} to ${targetNode.data.label}, enabling seamless information flow between workflow steps.`;
    
    const details = [
      `Data type: ${dataType} - Optimized for this specific data format`,
      `Flow rate: ${edge.data?.flowRate || 'normal'} - Adjusts throughput based on requirements`,
      `Transformations: ${transformations.length} applied to ensure compatibility`,
      `Error rate: ${((edge.data?.realTimeMetrics?.errorRate || 0) * 100).toFixed(2)}%`,
      `Data volume: ${edge.data?.realTimeMetrics?.dataVolume?.toLocaleString() || '0'} records processed`,
      `Average processing time: ${edge.data?.realTimeMetrics?.avgProcessingTime || 0}ms`
    ];
    
    const suggestions = [
      'Monitor data quality to prevent downstream issues',
      'Consider adding data validation steps',
      'Implement compression for large data transfers'
    ];
    
    return {
      overview,
      details,
      suggestions,
      complexity: transformations.length > 2 ? 'complex' : 'simple',
      confidence: 0.88
    };
  };

  const generateOptimizationSuggestions = (nodes: Node[], edges: Edge[]): OptimizationSuggestion[] => {
    const suggestions: OptimizationSuggestion[] = [];
    
    // Performance optimizations
    if (nodes.length > 10) {
      suggestions.push({
        id: 'parallel-execution',
        type: 'performance',
        title: 'Enable Parallel Execution',
        description: 'Some nodes can be executed in parallel to reduce overall workflow time',
        impact: 'high',
        effort: 'medium',
        priority: 9
      });
    }
    
    // Cost optimizations
    const agentNodes = nodes.filter(n => n.type === 'agent');
    if (agentNodes.length > 3) {
      suggestions.push({
        id: 'agent-consolidation',
        type: 'cost',
        title: 'Consolidate AI Agents',
        description: 'Combine similar agent responsibilities to reduce API costs',
        impact: 'high',
        effort: 'high',
        priority: 7
      });
    }
    
    // Reliability optimizations
    suggestions.push({
      id: 'error-handling',
      type: 'reliability',
      title: 'Enhanced Error Handling',
      description: 'Add retry logic and fallback mechanisms for critical nodes',
      impact: 'medium',
      effort: 'low',
      priority: 8
    });
    
    // Maintainability optimizations
    if (edges.length > 15) {
      suggestions.push({
        id: 'simplify-connections',
        type: 'maintainability',
        title: 'Simplify Connection Patterns',
        description: 'Reduce complexity by consolidating related data flows',
        impact: 'medium',
        effort: 'medium',
        priority: 6
      });
    }
    
    return suggestions.sort((a, b) => b.priority - a.priority);
  };

  // Helper functions
  const generateOverviewText = (triggers: Node[], agents: Node[], integrations: Node[], logic: Node[], edges: Edge[]): string => {
    const triggerText = triggers.length === 1 
      ? `triggered by ${triggers[0].data.triggerType} events`
      : `initiated through ${triggers.length} different trigger points`;
    
    const agentText = agents.length === 1
      ? `${agents[0].data.label} handles the intelligent processing`
      : `${agents.length} AI agents collaborate to process information`;
    
    const integrationText = integrations.length > 0
      ? ` and integrates with ${integrations.length} external service${integrations.length > 1 ? 's' : ''}`
      : '';
    
    return `This workflow is ${triggerText}. ${agentText}${integrationText}. The process includes ${logic.length} decision point${logic.length !== 1 ? 's' : ''} and ${edges.length} data connection${edges.length !== 1 ? 's' : ''} to ensure optimal execution flow.`;
  };

  const calculateComplexity = (nodes: Node[], edges: Edge[]): 'simple' | 'moderate' | 'complex' => {
    const score = nodes.length * 1 + edges.length * 0.5;
    if (score < 5) return 'simple';
    if (score < 15) return 'moderate';
    return 'complex';
  };

  const getComplexityUseCase = (complexity: string): string => {
    switch (complexity) {
      case 'simple': return 'quick automation tasks and basic workflows';
      case 'moderate': return 'business process automation and data integration';
      case 'complex': return 'enterprise-grade automation and complex decision trees';
      default: return 'various automation scenarios';
    }
  };

  const estimateExecutionTime = (nodes: Node[]): number => {
    return Math.round(nodes.reduce((total, node) => {
      switch (node.type) {
        case 'agent': return total + 2.5;
        case 'integration': return total + 1.2;
        case 'logic': return total + 0.3;
        case 'trigger': return total + 0.1;
        default: return total + 0.5;
      }
    }, 0));
  };

  const calculateConfidence = (nodes: Node[], edges: Edge[]): number => {
    // Base confidence on workflow structure completeness
    let confidence = 0.7; // Base confidence
    
    if (nodes.some(n => n.type === 'trigger')) confidence += 0.1;
    if (nodes.some(n => n.type === 'agent')) confidence += 0.1;
    if (edges.length >= nodes.length - 1) confidence += 0.1; // Well connected
    
    return Math.min(confidence, 0.95);
  };

  const generateWorkflowSuggestions = (nodes: Node[], edges: Edge[]): string[] => {
    const suggestions = [];
    
    if (!nodes.some(n => n.type === 'logic')) {
      suggestions.push('Consider adding decision nodes for more intelligent routing');
    }
    
    if (edges.length < nodes.length - 1) {
      suggestions.push('Some nodes appear disconnected - ensure proper data flow');
    }
    
    if (nodes.filter(n => n.type === 'agent').length > 1) {
      suggestions.push('Multiple agents detected - ensure clear role separation');
    }
    
    suggestions.push('Add monitoring and logging for production deployment');
    suggestions.push('Consider implementing automated testing for workflow validation');
    
    return suggestions;
  };

  return {
    isExplaining,
    currentExplanation,
    explainWorkflow,
    explainNode,
    explainConnection,
    suggestOptimizations
  };
};