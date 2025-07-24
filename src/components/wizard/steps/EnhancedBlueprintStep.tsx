import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWizardStore } from '../../../stores/wizardStore';
import { blueprintService } from '../../../services/blueprintService';
import { GlassCard } from '../../ui/GlassCard';
import { HolographicButton } from '../../ui/HolographicButton';
import { 
  CheckCircle, 
  Users, 
  Workflow, 
  Brain, 
  ArrowRight,
  Edit,
  MessageCircle,
  Sparkles,
  Target,
  DollarSign,
  ChevronRight,
  Send,
  Bot,
  User,
  Lightbulb
} from 'lucide-react';
import { ConversationState } from '../../../types';

// Master Blueprint Phase 1.2: Interactive Blueprint Step with Clarification Engine
export const EnhancedBlueprintStep: React.FC = () => {
  const { blueprint, nextStep, user_input, setBlueprint } = useWizardStore();
  const [conversationState, setConversationState] = useState<ConversationState>({
    phase: 'gathering',
    pending_questions: [],
    user_responses: {},
    messages: []
  });
  const [currentMessage, setCurrentMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Initialize conversation when component mounts
  useEffect(() => {
    if (user_input && !analysisResult) {
      initializeConversation();
    }
  }, [user_input]);

  const initializeConversation = async () => {
    try {
      setIsProcessing(true);
      console.log('🧠 Master Blueprint: Initializing conversation flow...');
      
      // Analyze intent from user input
      const intent = await blueprintService.analyzeIntent(user_input);
      setAnalysisResult(intent);
      
      // Start with clarification questions
      const questions = await blueprintService.askClarificationQuestions(intent, {});
      
      setConversationState({
        phase: 'clarifying',
        extracted_info: {
          id: `intent-${Date.now()}`,
          user_id: 'current-user',
          raw_description: user_input,
          extracted_goals: intent.extracted_goals,
          identified_processes: intent.identified_processes.map(p => ({
            ...p,
            frequency: p.frequency as 'real-time' | 'hourly' | 'daily' | 'weekly' | 'monthly'
          })),
          suggested_agents: intent.suggested_agents,
          complexity_score: intent.complexity_score,
          estimated_cost: intent.estimated_cost,
          status: 'draft' as const,
          created_at: new Date().toISOString()
        },
        pending_questions: questions,
        user_responses: {},
        messages: [
          {
            id: 'welcome',
            type: 'assistant',
            content: `I've analyzed your request: "${user_input}". I've identified ${intent.suggested_agents.length} potential AI agents and ${intent.identified_processes.length} key processes. To create the perfect blueprint for you, I have a few clarifying questions.`,
            timestamp: new Date().toISOString(),
            metadata: {
              confidence_score: intent.confidence_score
            }
          },
          {
            id: 'question-1',
            type: 'assistant', 
            content: questions[0] || 'What specific outcomes are you looking to achieve?',
            timestamp: new Date().toISOString(),
            metadata: {
              clarification_needed: true
            }
          }
        ]
      });
    } catch (error) {
      console.error('Failed to initialize conversation:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isProcessing) return;

    const newMessage = {
      id: `user-${Date.now()}`,
      type: 'user' as const,
      content: currentMessage,
      timestamp: new Date().toISOString()
    };

    // Add user message
    const updatedMessages = [...conversationState.messages, newMessage];
    
    // Update responses
    const questionIndex = conversationState.pending_questions.length - conversationState.messages.filter(m => m.type === 'user').length;
    const currentQuestion = conversationState.pending_questions[questionIndex] || 'response';
    const updatedResponses = {
      ...conversationState.user_responses,
      [currentQuestion]: currentMessage
    };

    setConversationState(prev => ({
      ...prev,
      messages: updatedMessages,
      user_responses: updatedResponses
    }));

    setCurrentMessage('');
    setIsProcessing(true);

    try {
      // Check if we have more questions or should generate blueprint
      const remainingQuestions = conversationState.pending_questions.filter(
        (_, index) => index > Object.keys(updatedResponses).length - 1
      );

      if (remainingQuestions.length > 0 && Object.keys(updatedResponses).length < 3) {
        // Ask next question
        const nextQuestion = remainingQuestions[0];
        const assistantMessage = {
          id: `assistant-${Date.now()}`,
          type: 'assistant' as const,
          content: nextQuestion,
          timestamp: new Date().toISOString(),
          metadata: {
            clarification_needed: true
          }
        };

        setConversationState(prev => ({
          ...prev,
          messages: [...updatedMessages, assistantMessage]
        }));
      } else {
        // Generate refined blueprint
        await generateRefinedBlueprint(updatedResponses);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateRefinedBlueprint = async (responses: Record<string, string>) => {
    try {
      console.log('🔄 Master Blueprint: Generating refined blueprint...');
      
      if (!analysisResult) return;

      const refinedBlueprint = await blueprintService.refineBlueprint(analysisResult, responses);
      
      // Add completion message
      const completionMessage = {
        id: `completion-${Date.now()}`,
        type: 'assistant' as const,
        content: `Perfect! Based on your clarifications, I've created an enhanced blueprint for your ${refinedBlueprint.suggested_structure.guild_name}. The system will include ${refinedBlueprint.suggested_structure.agents.length} AI agents working together to achieve your goals.`,
        timestamp: new Date().toISOString(),
        metadata: {
          confidence_score: 0.95
        }
      };

      setConversationState(prev => ({
        ...prev,
        phase: 'completed',
        messages: [...prev.messages, completionMessage]
      }));

      // Update the blueprint in the wizard store
      setBlueprint(refinedBlueprint);
      
      // Update blueprint status
      await blueprintService.updateBlueprintStatus(refinedBlueprint.id, 'refined');
      
    } catch (error) {
      console.error('Failed to generate refined blueprint:', error);
    }
  };

  const handleApproveBlueprint = async () => {
    if (!blueprint) return;
    
    try {
      await blueprintService.updateBlueprintStatus(blueprint.id, 'approved');
      nextStep('canvas');
    } catch (error) {
      console.error('Failed to approve blueprint:', error);
    }
  };

  const handleModifyBlueprint = () => {
    // TODO: Implement edit mode functionality
    console.log('Edit mode not yet implemented');
  };

  if (!blueprint && conversationState.phase === 'gathering') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <GlassCard variant="medium" className="p-8 text-center">
          <div className="animate-pulse">
            <Brain className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <p className="text-white text-lg">Analyzing your business requirements...</p>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6"
      >
        {/* Conversation Interface */}
        {conversationState.phase === 'clarifying' && (
          <GlassCard variant="medium" className="p-6">
            <div className="flex items-center mb-6">
              <MessageCircle className="w-8 h-8 text-blue-400 mr-4" />
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Blueprint Clarification</h2>
                <p className="text-gray-300">Let's refine your blueprint with a few questions</p>
              </div>
            </div>

            {/* Conversation Messages */}
            <div className="h-80 overflow-y-auto mb-4 space-y-4 scrollbar-thin scrollbar-thumb-white/20">
              <AnimatePresence>
                {conversationState.messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.type === 'user' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                        {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={`rounded-lg p-4 ${message.type === 'user' ? 'bg-blue-500/20 border border-blue-400/30' : 'bg-purple-500/20 border border-purple-400/30'}`}>
                        <p className="text-white text-sm">{message.content}</p>
                        {message.metadata?.confidence_score && (
                          <div className="mt-2 text-xs text-gray-300">
                            Confidence: {(message.metadata.confidence_score * 100).toFixed(0)}%
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-purple-500/20 border border-purple-400/30 rounded-lg p-4">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Message Input */}
            <div className="flex space-x-4">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your response..."
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                disabled={isProcessing}
              />
              <HolographicButton
                variant="primary"
                onClick={handleSendMessage}
                disabled={!currentMessage.trim() || isProcessing}
                className="px-6"
              >
                <Send className="w-4 h-4" />
              </HolographicButton>
            </div>
          </GlassCard>
        )}

        {/* Blueprint Preview */}
        {blueprint && (
          <GlassCard variant="medium" className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-emerald-400 mr-4" />
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {conversationState.phase === 'completed' ? 'Enhanced AI Blueprint' : 'AI Blueprint Generated'}
                  </h2>
                  <p className="text-gray-300">
                    {conversationState.phase === 'completed' 
                      ? 'Refined based on your clarifications' 
                      : 'Review your intelligent business architecture'
                    }
                  </p>
                </div>
              </div>
              
              {conversationState.phase === 'completed' && (
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400 font-semibold">Enhanced</span>
                </div>
              )}
            </div>

            {/* Guild Overview */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Brain className="w-6 h-6 text-purple-400 mr-3" />
                <h3 className="text-xl font-semibold text-white">Guild: {blueprint.suggested_structure.guild_name}</h3>
              </div>
              <p className="text-gray-300 ml-9">{blueprint.suggested_structure.guild_purpose}</p>
            </div>

            {/* Analysis Metrics */}
            {analysisResult && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                  <Target className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{analysisResult.extracted_goals.length}</div>
                  <div className="text-sm text-gray-300">Goals Identified</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                  <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{blueprint.suggested_structure.agents.length}</div>
                  <div className="text-sm text-gray-300">AI Agents</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                  <Workflow className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{blueprint.suggested_structure.workflows.length}</div>
                  <div className="text-sm text-gray-300">Workflows</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                  <DollarSign className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">${analysisResult.estimated_cost}</div>
                  <div className="text-sm text-gray-300">Est. Monthly</div>
                </div>
              </div>
            )}

            {/* AI Interpretation */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                <Lightbulb className="w-5 h-5 text-yellow-400 mr-2" />
                AI Understanding
              </h4>
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
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                  >
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
                  </motion.div>
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
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-semibold text-white">{workflow.name}</h5>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                          {workflow.trigger_type}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm mt-2">{workflow.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-white/10">
              <HolographicButton 
                variant="secondary"
                onClick={handleModifyBlueprint}
                disabled={conversationState.phase === 'clarifying'}
              >
                <Edit className="w-4 h-4 mr-2" />
                Modify Blueprint
              </HolographicButton>
              
              <HolographicButton
                variant="primary"
                onClick={handleApproveBlueprint}
                className="px-8"
                disabled={conversationState.phase === 'clarifying' || conversationState.phase === 'gathering'}
              >
                Generate Canvas
                <ArrowRight className="w-4 h-4 ml-2" />
              </HolographicButton>
            </div>
          </GlassCard>
        )}
      </motion.div>
    </div>
  );
};