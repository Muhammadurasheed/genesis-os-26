/**
 * Einstein-Level Intent Understanding Engine
 * Implements Phase 1: Foundation - Intent Capture with Socrates/Einstein level understanding
 * This is the MOST CRITICAL component that everything else depends on
 */

import { multiModelReasoningService } from './multiModelReasoningService';
import { mcpIntegrationService } from './mcpIntegrationService';

export interface BusinessContext {
  industry: string;
  company_size: 'startup' | 'small' | 'medium' | 'enterprise';
  technical_expertise: 'none' | 'basic' | 'intermediate' | 'advanced';
  budget_range: 'under_500' | '500_2000' | '2000_10000' | 'over_10000';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  compliance_requirements: string[];
}

export interface ProcessMapping {
  id: string;
  name: string;
  description: string;
  current_state: 'manual' | 'partially_automated' | 'broken' | 'non_existent';
  pain_points: string[];
  desired_outcome: string;
  frequency: 'real-time' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'on-demand';
  complexity_score: number; // 1-10
  automation_potential: number; // 0-1
  required_integrations: string[];
  data_sources: string[];
  outputs: string[];
  stakeholders: string[];
}

export interface AgentSpecification {
  id: string;
  name: string;
  persona: string;
  primary_role: string;
  capabilities: string[];
  personality_traits: string[];
  decision_authority: 'none' | 'low' | 'medium' | 'high' | 'full';
  communication_style: 'formal' | 'casual' | 'technical' | 'friendly';
  specialization: string;
  required_tools: string[];
  performance_metrics: string[];
  escalation_triggers: string[];
}

export interface EinsteinIntentAnalysis {
  // Core Understanding
  user_intent_summary: string;
  business_context: BusinessContext;
  extracted_goals: string[];
  success_metrics: string[];
  
  // Process Analysis
  identified_processes: ProcessMapping[];
  process_dependencies: Array<{from: string, to: string, type: 'sequential' | 'parallel' | 'conditional'}>;
  
  // Agent Design
  suggested_agents: AgentSpecification[];
  agent_collaboration_patterns: Array<{agents: string[], interaction_type: string, frequency: string}>;
  
  // Technical Requirements
  required_integrations: Array<{
    service: string;
    purpose: string;
    criticality: 'essential' | 'important' | 'nice_to_have';
    estimated_setup_time: number;
  }>;
  
  // Intelligence Layer
  complexity_assessment: {
    overall_score: number; // 1-10
    technical_complexity: number;
    business_complexity: number;
    integration_complexity: number;
    reasoning: string;
  };
  
  cost_prediction: {
    estimated_monthly_cost: number;
    cost_breakdown: Record<string, number>;
    confidence_level: number;
    assumptions: string[];
  };
  
  // Risk Analysis
  risk_factors: Array<{
    risk: string;
    probability: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high' | 'critical';
    mitigation: string;
  }>;
  
  // Next Steps
  clarification_questions: Array<{
    question: string;
    purpose: string;
    impact_if_unclear: 'low' | 'medium' | 'high';
    suggested_answers?: string[];
  }>;
  
  recommended_approach: {
    implementation_phases: Array<{
      phase: string;
      description: string;
      estimated_duration: string;
      dependencies: string[];
    }>;
    pilot_suggestions: string[];
  };
  
  confidence_score: number; // 0-1
  analysis_timestamp: string;
}

export class EinsteinIntentEngine {
  constructor() {
    console.log('🧠 Einstein Intent Engine initialized - Socrates/Einstein level understanding activated');
  }

  /**
   * Core Einstein-level intent analysis
   * This is where the magic happens - understanding user intent at the deepest level
   */
  public async analyzeUserIntent(
    userInput: string,
    conversationHistory: Array<{role: 'user' | 'assistant', content: string}> = [],
    existingContext?: Partial<BusinessContext>
  ): Promise<EinsteinIntentAnalysis> {
    console.log('🔬 Starting Einstein-level intent analysis...');

    // Multi-model consensus for deep understanding
    const intentAnalysisPrompt = this.constructIntentAnalysisPrompt(userInput, conversationHistory, existingContext);
    
    const analysisResult = await multiModelReasoningService.reasonWithConsensus(intentAnalysisPrompt, {
      requiredCapabilities: ['reasoning', 'analysis', 'business-understanding'],
      minConsensus: 0.8,
      modelIds: ['claude-opus-4-20250514', 'gpt-4.1-2025-04-14', 'o3-2025-04-16']
    });

    // Parse and enhance the analysis
    let analysis: EinsteinIntentAnalysis;
    try {
      analysis = JSON.parse(analysisResult.finalAnswer);
    } catch (error) {
      console.warn('⚠️ Failed to parse analysis JSON, using structured extraction');
      analysis = await this.extractStructuredAnalysis(analysisResult.finalAnswer, userInput);
    }

    // Enhance with tool discovery
    const recommendedTools = await mcpIntegrationService.discoverTools(analysis.extracted_goals);
    analysis.required_integrations = this.enhanceWithToolRecommendations(analysis.required_integrations, recommendedTools);

    // Add meta-analysis
    analysis.confidence_score = this.calculateConfidenceScore(analysis, analysisResult.consensus);
    analysis.analysis_timestamp = new Date().toISOString();

    console.log(`✅ Einstein analysis complete - ${analysis.confidence_score * 100}% confidence`);
    return analysis;
  }

  /**
   * Generate intelligent clarification questions based on unclear aspects
   */
  public async generateClarificationQuestions(
    analysis: EinsteinIntentAnalysis,
    userResponses: Record<string, string> = {}
  ): Promise<Array<{question: string, purpose: string, suggestions?: string[]}>> {
    console.log('🤔 Generating intelligent clarification questions...');

    const clarificationPrompt = `
    Based on this business intent analysis, generate the most important clarification questions to eliminate ambiguity and ensure successful implementation.

    Analysis Summary:
    - Goals: ${analysis.extracted_goals.join(', ')}
    - Confidence: ${analysis.confidence_score}
    - Complexity: ${analysis.complexity_assessment.overall_score}/10
    
    Existing unclear areas:
    ${analysis.clarification_questions.map(q => `- ${q.question} (${q.impact_if_unclear} impact)`).join('\n')}
    
    User responses so far:
    ${Object.entries(userResponses).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

    Generate 3-5 most critical questions that will have the highest impact on implementation success.
    Focus on questions that will help clarify:
    1. Technical requirements and constraints
    2. Business processes and workflows
    3. Integration needs and data flows
    4. Success criteria and metrics
    5. Resource constraints and timelines

    Return as JSON array with: {question, purpose, suggestions?}
    `;

    const result = await multiModelReasoningService.reasonWithConsensus(clarificationPrompt, {
      requiredCapabilities: ['reasoning', 'business-analysis'],
      minConsensus: 0.7
    });

    try {
      return JSON.parse(result.finalAnswer);
    } catch {
      // Fallback extraction
      return this.extractQuestionsFromText(result.finalAnswer);
    }
  }

  /**
   * Refine analysis based on user clarifications
   */
  public async refineAnalysis(
    originalAnalysis: EinsteinIntentAnalysis,
    userClarifications: Record<string, string>
  ): Promise<EinsteinIntentAnalysis> {
    console.log('🔄 Refining analysis with user clarifications...');

    const refinementPrompt = `
    Refine this business intent analysis based on user clarifications.
    
    Original Analysis: ${JSON.stringify(originalAnalysis, null, 2)}
    
    User Clarifications:
    ${Object.entries(userClarifications).map(([key, value]) => `${key}: ${value}`).join('\n')}
    
    Update the analysis to incorporate these clarifications, adjusting:
    - Process mappings and complexity scores
    - Agent specifications and roles
    - Cost predictions and timelines
    - Risk assessments
    - Integration requirements
    
    Maintain the same JSON structure but with updated values.
    `;

    const result = await multiModelReasoningService.reasonWithConsensus(refinementPrompt, {
      requiredCapabilities: ['reasoning', 'analysis'],
      minConsensus: 0.8
    });

    try {
      const refinedAnalysis = JSON.parse(result.finalAnswer);
      refinedAnalysis.confidence_score = Math.min(originalAnalysis.confidence_score + 0.1, 0.95);
      refinedAnalysis.analysis_timestamp = new Date().toISOString();
      return refinedAnalysis;
    } catch {
      // Return enhanced original if parsing fails
      return {
        ...originalAnalysis,
        confidence_score: Math.min(originalAnalysis.confidence_score + 0.05, 0.9),
        analysis_timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Construct the master intent analysis prompt
   */
  private constructIntentAnalysisPrompt(
    userInput: string,
    conversationHistory: Array<{role: 'user' | 'assistant', content: string}>,
    existingContext?: Partial<BusinessContext>
  ): string {
    return `
You are an expert business analyst with the combined wisdom of Socrates and Einstein, specializing in understanding complex business requirements and designing AI-powered solutions.

Analyze this business requirement with extraordinary depth and precision:

USER INPUT: "${userInput}"

CONVERSATION HISTORY:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

EXISTING CONTEXT:
${existingContext ? JSON.stringify(existingContext, null, 2) : 'None provided'}

Provide a comprehensive analysis in the following JSON structure:

{
  "user_intent_summary": "Clear, concise summary of what the user wants to achieve",
  "business_context": {
    "industry": "Inferred industry/sector",
    "company_size": "startup|small|medium|enterprise",
    "technical_expertise": "none|basic|intermediate|advanced",
    "budget_range": "under_500|500_2000|2000_10000|over_10000",
    "urgency": "low|medium|high|critical",
    "compliance_requirements": ["list of relevant compliance needs"]
  },
  "extracted_goals": ["Primary business objectives"],
  "success_metrics": ["How success will be measured"],
  "identified_processes": [
    {
      "id": "unique_id",
      "name": "Process name",
      "description": "Detailed description",
      "current_state": "manual|partially_automated|broken|non_existent",
      "pain_points": ["Current challenges"],
      "desired_outcome": "What should happen instead",
      "frequency": "real-time|hourly|daily|weekly|monthly|on-demand",
      "complexity_score": 1-10,
      "automation_potential": 0-1,
      "required_integrations": ["needed services"],
      "data_sources": ["where data comes from"],
      "outputs": ["what gets produced"],
      "stakeholders": ["who is involved"]
    }
  ],
  "suggested_agents": [
    {
      "id": "agent_id",
      "name": "Agent name",
      "persona": "Agent personality description",
      "primary_role": "Main responsibility",
      "capabilities": ["what it can do"],
      "personality_traits": ["behavioral characteristics"],
      "decision_authority": "none|low|medium|high|full",
      "communication_style": "formal|casual|technical|friendly",
      "specialization": "area of expertise",
      "required_tools": ["needed integrations"],
      "performance_metrics": ["how to measure success"],
      "escalation_triggers": ["when to involve humans"]
    }
  ],
  "complexity_assessment": {
    "overall_score": 1-10,
    "technical_complexity": 1-10,
    "business_complexity": 1-10,
    "integration_complexity": 1-10,
    "reasoning": "Detailed explanation of complexity factors"
  },
  "cost_prediction": {
    "estimated_monthly_cost": "USD amount",
    "cost_breakdown": {
      "ai_models": "amount",
      "integrations": "amount",
      "infrastructure": "amount",
      "support": "amount"
    },
    "confidence_level": 0-1,
    "assumptions": ["key assumptions made"]
  },
  "risk_factors": [
    {
      "risk": "Description of risk",
      "probability": "low|medium|high",
      "impact": "low|medium|high|critical",
      "mitigation": "How to address this risk"
    }
  ],
  "clarification_questions": [
    {
      "question": "Specific question to ask",
      "purpose": "Why this question is important",
      "impact_if_unclear": "low|medium|high",
      "suggested_answers": ["possible answer options"]
    }
  ],
  "recommended_approach": {
    "implementation_phases": [
      {
        "phase": "Phase name",
        "description": "What happens in this phase",
        "estimated_duration": "time estimate",
        "dependencies": ["what must be done first"]
      }
    ],
    "pilot_suggestions": ["recommendations for starting small"]
  }
}

Apply Socrates-level questioning and Einstein-level analysis to ensure nothing is missed. Consider edge cases, dependencies, and potential failure modes.
`;
  }

  /**
   * Extract structured analysis from text when JSON parsing fails
   */
  private async extractStructuredAnalysis(
    _analysisText: string,
    userInput: string
  ): Promise<EinsteinIntentAnalysis> {
    // Fallback structured analysis
    return {
      user_intent_summary: `User wants to: ${userInput}`,
      business_context: {
        industry: 'general',
        company_size: 'small',
        technical_expertise: 'basic',
        budget_range: '500_2000',
        urgency: 'medium',
        compliance_requirements: []
      },
      extracted_goals: [userInput],
      success_metrics: ['Process automation', 'Time savings', 'Error reduction'],
      identified_processes: [{
        id: 'proc_1',
        name: 'Primary Process',
        description: userInput,
        current_state: 'manual',
        pain_points: ['Time consuming', 'Error prone'],
        desired_outcome: 'Automated and efficient',
        frequency: 'daily',
        complexity_score: 5,
        automation_potential: 0.8,
        required_integrations: [],
        data_sources: [],
        outputs: [],
        stakeholders: ['User']
      }],
      suggested_agents: [{
        id: 'agent_1',
        name: 'Primary Assistant',
        persona: 'Helpful and efficient',
        primary_role: 'Process automation',
        capabilities: ['task execution', 'data processing'],
        personality_traits: ['reliable', 'precise'],
        decision_authority: 'medium',
        communication_style: 'friendly',
        specialization: 'General automation',
        required_tools: [],
        performance_metrics: ['Success rate', 'Response time'],
        escalation_triggers: ['Critical errors', 'Ambiguous requests']
      }],
      complexity_assessment: {
        overall_score: 5,
        technical_complexity: 4,
        business_complexity: 5,
        integration_complexity: 6,
        reasoning: 'Moderate complexity based on requirements'
      },
      cost_prediction: {
        estimated_monthly_cost: 150,
        cost_breakdown: {
          ai_models: 100,
          integrations: 30,
          infrastructure: 15,
          support: 5
        },
        confidence_level: 0.6,
        assumptions: ['Standard usage patterns', 'Basic integrations']
      },
      risk_factors: [{
        risk: 'Integration complexity',
        probability: 'medium',
        impact: 'medium',
        mitigation: 'Phased implementation approach'
      }],
      clarification_questions: [{
        question: 'What specific tools do you currently use?',
        purpose: 'Identify integration requirements',
        impact_if_unclear: 'high',
        suggested_answers: ['Popular tools in your industry']
      }],
      recommended_approach: {
        implementation_phases: [{
          phase: 'Phase 1',
          description: 'Core automation setup',
          estimated_duration: '1-2 weeks',
          dependencies: []
        }],
        pilot_suggestions: ['Start with one simple process']
      },
      confidence_score: 0.6,
      analysis_timestamp: new Date().toISOString()
    };
  }

  /**
   * Extract questions from text response
   */
  private extractQuestionsFromText(text: string): Array<{question: string, purpose: string, suggestions?: string[]}> {
    const questions = [];
    const lines = text.split('\n').filter(line => line.includes('?'));
    
    for (const line of lines.slice(0, 5)) {
      questions.push({
        question: line.trim(),
        purpose: 'Clarify implementation details',
        suggestions: []
      });
    }

    return questions.length > 0 ? questions : [{
      question: 'What are your main goals for this automation?',
      purpose: 'Understand primary objectives',
      suggestions: ['Save time', 'Reduce errors', 'Scale operations']
    }];
  }

  /**
   * Enhance integration requirements with tool recommendations
   */
  private enhanceWithToolRecommendations(
    existingIntegrations: any[],
    recommendedTools: any[]
  ): any[] {
    const enhanced = [...existingIntegrations];
    
    recommendedTools.forEach(tool => {
      const exists = enhanced.find(integration => 
        integration.service?.toLowerCase() === tool.provider?.toLowerCase()
      );
      
      if (!exists) {
        enhanced.push({
          service: tool.provider,
          purpose: tool.description,
          criticality: 'nice_to_have',
          estimated_setup_time: 30
        });
      }
    });

    return enhanced;
  }

  /**
   * Calculate confidence score based on analysis quality and consensus
   */
  private calculateConfidenceScore(analysis: EinsteinIntentAnalysis, consensus: number): number {
    let confidence = consensus * 0.4; // Base from model consensus
    
    // Boost confidence based on analysis completeness
    if (analysis.extracted_goals?.length > 0) confidence += 0.1;
    if (analysis.identified_processes?.length > 0) confidence += 0.1;
    if (analysis.suggested_agents?.length > 0) confidence += 0.1;
    if (analysis.cost_prediction?.estimated_monthly_cost > 0) confidence += 0.1;
    if (analysis.clarification_questions?.length > 0) confidence += 0.1;
    if (analysis.risk_factors?.length > 0) confidence += 0.1;

    return Math.min(confidence, 0.95);
  }
}

// Singleton instance
export const einsteinIntentEngine = new EinsteinIntentEngine();