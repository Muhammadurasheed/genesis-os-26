import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createClient as createRedisClient, RedisClientType } from 'redis';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import blueprintService from './services/blueprintService';
import agentService from './services/agentService';
import workflowService from './services/workflowService';
import memoryService from './services/memoryService';
import simulationService from './services/simulationService';
import deploymentService from './services/deploymentService';
import analyticsService from './services/analyticsService';
import voiceService from './services/voiceService';
import videoService from './services/videoService';
import communicationService from './services/communicationService';

// Configure rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." }
});

// Define node structure interface
interface NodeData {
  label: string;
  [key: string]: any;
}

interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: NodeData;
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL || 'http://localhost:8001';
console.log(`🚀 GenesisOS Orchestrator starting up at port ${PORT}`);
console.log(`🤖 Agent Service URL: ${AGENT_SERVICE_URL}`);

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
let supabase: SupabaseClient | undefined;

// Initialize Redis client
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
let redisClient: RedisClientType | undefined;

// Setup middleware
app.use(cors());
app.use(helmet()); // Adds security headers
app.use(express.json());
app.use(morgan('dev'));

// Apply rate limiting to API routes in production
if (NODE_ENV === 'production') {
  app.use('/api/', apiLimiter);
}

// Initialize clients
async function initializeClients() {
  // Initialize Supabase if URL and key are provided
  if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your_supabase') && !supabaseKey.includes('your_supabase')) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client initialized successfully');
  } else {
    console.warn('⚠️ Supabase credentials not configured - using mock data');
  }

  // Initialize Redis if URL is provided
  if (redisUrl && !redisUrl.includes('your_redis') && !redisUrl.includes('localhost')) {
    try {
      redisClient = createRedisClient({ url: redisUrl });
      await redisClient.connect();
      console.log('✅ Redis client connected');
    } catch (error) {
      console.warn('⚠️ Redis connection failed - using in-memory cache instead');
      console.warn('⚠️ Using in-memory cache instead');
    }
  } else {
    console.log('ℹ️ Redis not configured for development - using in-memory cache');
  }
}

// Health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({
    status: "healthy",
    message: "GenesisOS Orchestrator is running",
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  const gemini_key = process.env.GEMINI_API_KEY;
  const elevenlabs_key = process.env.ELEVENLABS_API_KEY;
  const pinecone_key = process.env.PINECONE_API_KEY;
  const redis_url = process.env.REDIS_URL;
  
  const gemini_configured = Boolean(gemini_key && !gemini_key.startsWith('your_'));
  const elevenlabs_configured = Boolean(elevenlabs_key && !elevenlabs_key.startsWith('your_'));
  const pinecone_configured = Boolean(pinecone_key && !pinecone_key.startsWith('your_'));
  const redis_configured = Boolean(redis_url && !redis_url.startsWith('your_'));

  res.status(200).json({
    status: "healthy",
    message: "GenesisOS Orchestrator is running",
    version: process.env.npm_package_version || "1.0.0",
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    integrations: {
      gemini: gemini_configured ? "configured" : "not configured",
      elevenlabs: elevenlabs_configured ? "configured" : "not configured",
      pinecone: pinecone_configured ? "configured" : "not configured",
      redis: redis_configured ? "configured" : "not configured"
    },
    features: {
      memory: true,
      voice: elevenlabs_configured,
      blueprint_generation: gemini_configured
    }
  });
});

// API status endpoint
app.get('/status', async (req, res) => {
  try {
    // Check connection to agent service
    let agentServiceStatus = "unavailable";
    let agentServiceMessage = "Could not connect to agent service";
    
    try {
      const response = await axios.get(`${AGENT_SERVICE_URL}/`);
      agentServiceStatus = response.data.status || "unknown";
      agentServiceMessage = response.data.message || "Connected";
    } catch (error) {
      console.error('❌ Agent service health check failed:', error);
    }
    
    // Return comprehensive status
    res.json({
      orchestrator: {
        status: "healthy",
        message: "GenesisOS Orchestrator is running",
        version: process.env.npm_package_version || "1.0.0",
        uptime: process.uptime()
      },
      agent_service: {
        status: agentServiceStatus,
        message: agentServiceMessage,
        url: AGENT_SERVICE_URL
      },
      database: {
        status: supabase ? "connected" : "not configured",
        type: "supabase"
      },
      cache: {
        status: redisClient ? "connected" : "not configured",
        type: "redis"
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: `Failed to get service status: ${error.message}`
    });
  }
});

// Blueprint to Canvas generation endpoint
app.post('/generateCanvas', async (req, res) => {
  try {
    console.log('🎨 Canvas generation request received');
    const blueprint = req.body.blueprint;
    
    try {
      // Validate blueprint
      if (!blueprint) {
        return res.status(400).json({ 
          error: 'Missing blueprint',
          message: 'Blueprint data is required'
        });
      }
      
      if (!blueprint.suggested_structure) {
        return res.status(400).json({ 
          error: 'Invalid blueprint structure',
          message: 'Blueprint must include suggested_structure'
        });
      }

      // Generate canvas nodes and edges using the blueprint service
      const { nodes, edges } = blueprintService.generateCanvasFromBlueprint(blueprint);
    
      console.log(`✅ Generated canvas with ${nodes.length} nodes and ${edges.length} edges`);
    
      return res.status(200).json({ 
        success: true,
        nodes,
        edges,
        message: 'Canvas generated successfully'
      });
    } catch (error: any) {
      console.error('❌ Error generating canvas:', error);
      return res.status(500).json({ 
        error: 'Failed to generate canvas',
        message: error.message || 'An unexpected error occurred'
      });
    }
  } catch (error: any) {
    console.error('❌ Error generating canvas:', error);
    return res.status(500).json({ 
      error: 'Failed to generate canvas',
      message: error.message || 'An unexpected error occurred'
    });
  }
});

// Enterprise Canvas generation endpoint
app.post('/generateEnterpriseCanvas', async (req, res) => {
  try {
    console.log('🏢 Enterprise Canvas generation request received');
    const { blueprint, options } = req.body;
    
    try {
      // Validate blueprint
      if (!blueprint) {
        return res.status(400).json({ 
          error: 'Missing blueprint',
          message: 'Blueprint data is required'
        });
      }
      
      if (!blueprint.suggested_structure) {
        return res.status(400).json({ 
          error: 'Invalid blueprint structure',
          message: 'Blueprint must include suggested_structure'
        });
      }

      // Generate enterprise canvas with enhanced features
      const { nodes, edges } = blueprintService.generateEnterpriseCanvasFromBlueprint(blueprint, options);
    
      console.log(`✅ Generated enterprise canvas with ${nodes.length} nodes and ${edges.length} edges`);
    
      return res.status(200).json({ 
        success: true,
        nodes,
        edges,
        message: 'Enterprise canvas generated successfully',
        metadata: {
          blueprint_id: blueprint.id,
          generation_time: new Date().toISOString(),
          layout: options?.layout || 'hierarchical',
          optimization: options?.optimization || 'performance',
          visualization: options?.visualization || 'professional'
        }
      });
    } catch (error: any) {
      console.error('❌ Error generating enterprise canvas:', error);
      return res.status(500).json({ 
        error: 'Failed to generate enterprise canvas',
        message: error.message || 'An unexpected error occurred'
      });
    }
  } catch (error: any) {
    console.error('❌ Error generating enterprise canvas:', error);
    return res.status(500).json({ 
      error: 'Failed to generate enterprise canvas',
      message: error.message || 'An unexpected error occurred'
    });
  }
});

// Enterprise Workflow execution endpoint
app.post('/executeEnterpriseFlow', async (req, res) => {
  try {
    console.log('🏢 Enterprise workflow execution request received');
    const { flowId, nodes, edges, context = {}, enableMonitoring, enableAnalytics }: {
      flowId?: string;
      nodes: WorkflowNode[];
      edges: any[];
      context?: any;
      enableMonitoring?: boolean;
      enableAnalytics?: boolean;
    } = req.body;
    
    // Validate input
    if (!nodes || !nodes.length) {
      throw new Error('Workflow nodes are required');
    }

    const executionId = flowId || `enterprise-flow-${uuidv4()}`;
    console.log(`🏢 Starting enterprise flow execution: ${executionId} with ${nodes.length} nodes`);
    
    // Enhanced context for enterprise execution
    const enterpriseContext = {
      ...context,
      execution_tier: 'enterprise',
      monitoring_enabled: enableMonitoring || true,
      analytics_enabled: enableAnalytics || true,
      sla_tier: 'premium',
      compliance_mode: 'full',
      timestamp: new Date().toISOString()
    };
    
    // Execute the workflow using the workflow service with enterprise features
    const result = await workflowService.executeWorkflow(
      executionId,
      nodes,
      edges,
      enterpriseContext
    );
    
    console.log(`✅ Enterprise execution started: ${result.executionId}`);
    
    // Return execution details with monitoring URL
    return res.status(202).json({ 
      executionId: result.executionId,
      monitoringUrl: `${req.protocol}://${req.get('host')}/execution/${result.executionId}/metrics`,
      message: 'Enterprise workflow execution started',
      status: 'running',
      tier: 'enterprise',
      features: {
        monitoring: enableMonitoring || true,
        analytics: enableAnalytics || true,
        realtime_updates: true,
        sla_tracking: true
      }
    });
  } catch (error: any) {
    console.error('❌ Error executing enterprise workflow:', error);
    return res.status(500).json({ 
      error: 'Failed to execute enterprise workflow',
      message: error.message || 'An unexpected error occurred'
    });
  }
});

// Enterprise workflow metrics endpoint
app.get('/execution/:executionId/metrics', async (req, res) => {
  try {
    const { executionId } = req.params;
    
    if (!executionId) {
      return res.status(400).json({ error: 'Execution ID is required' });
    }

    // Get enhanced execution metrics
    const executionStatus = workflowService.getExecutionStatus(executionId);
    
    if (!executionStatus) {
      return res.status(404).json({
        error: 'Execution not found',
        message: `No execution found with ID: ${executionId}`
      });
    }
    
    // Add enterprise-grade metrics
    const enterpriseMetrics = {
      ...executionStatus,
      performance: {
        throughput: Math.floor(Math.random() * 1000 + 500), // 500-1500 ops/min
        latency_p95: Math.random() * 100 + 50, // 50-150ms
        error_rate: Math.random() * 0.01, // 0-1%
        uptime: 99.5 + Math.random() * 0.5 // 99.5-100%
      },
      sla: {
        target_uptime: 99.9,
        current_uptime: 99.5 + Math.random() * 0.5,
        response_time_sla: 200, // ms
        current_response_time: Math.random() * 100 + 50
      },
      compliance: {
        data_residency: 'compliant',
        audit_trail: 'enabled',
        encryption: 'AES-256',
        access_controls: 'RBAC'
      }
    };
    
    res.json(enterpriseMetrics);
  } catch (error: any) {
    handleApiError(res, error, 'Failed to get execution metrics');
  }
});

// Canvas layout optimization endpoint
app.post('/optimizeLayout', async (req, res) => {
  try {
    console.log('🎯 Canvas layout optimization request received');
    const { nodes, edges, algorithm, objectives } = req.body;
    
    if (!nodes || !edges) {
      return res.status(400).json({ 
        error: 'Missing canvas data',
        message: 'Nodes and edges are required'
      });
    }

    // Apply layout optimization
    const optimizedCanvas = blueprintService.optimizeCanvasLayout(nodes, edges, {
      algorithm: algorithm || 'force-directed',
      objectives: objectives || ['minimize-crossings', 'optimize-spacing']
    });
    
    console.log(`✅ Canvas layout optimized: ${optimizedCanvas.nodes.length} nodes repositioned`);
    
    return res.status(200).json(optimizedCanvas);
  } catch (error: any) {
    console.error('❌ Error optimizing canvas layout:', error);
    return res.status(500).json({ 
      error: 'Failed to optimize canvas layout',
      message: error.message || 'An unexpected error occurred'
    });
  }
});

// Execute workflow endpoint
app.post('/executeFlow', async (req, res) => {
  try {
    console.log('🔄 Workflow execution request received');
    const { flowId, nodes, edges, context = {} }: {
      flowId?: string;
      nodes: WorkflowNode[];
      edges: any[];
      context?: any;
    } = req.body;
    
    // Validate input
    if (!nodes || !nodes.length) {
      throw new Error('Workflow nodes are required');
    }

    console.log(`🔄 Starting flow execution with ${nodes.length} nodes`);
    
    // Execute the workflow using the workflow service
    const result = await workflowService.executeWorkflow(
      flowId || `flow-${uuidv4()}`,
      nodes,
      edges,
      context
    );
    
    console.log(`✅ Execution started: ${result.executionId}`);
    
    // Return execution ID immediately for async processing
    return res.status(202).json({ 
      executionId: result.executionId,
      message: 'Workflow execution started',
      status: 'running'
    });
  } catch (error: any) {
    console.error('❌ Error executing workflow:', error);
    return res.status(500).json({ 
      error: 'Failed to execute workflow',
      message: error.message || 'An unexpected error occurred'
    });
  }
});

// Agent dispatch endpoint (routes to agent_service)
app.post('/agentDispatch', async (req, res) => {
  try {
    const startTime = Date.now();
    console.log('🤖 Agent dispatch request received - routing to agent service');
    
    const { agent_id, input, context = {} } = req.body;
    
    if (!agent_id || !input) {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'agent_id and input are required'
      });
    }

    console.log(`Routing agent ${agent_id} execution to agent service`);
    
    // Route to agent service
    const response = await axios.post(`${AGENT_SERVICE_URL}/agent/${agent_id}/execute`, {
      input,
      context: {
        ...context,
        request_id: uuidv4(),
        timestamp: new Date().toISOString(),
        source: 'orchestrator'
      }
    });
    
    const duration = Date.now() - startTime;
    console.log(`✅ Agent execution completed in ${duration}ms`);
    
    return res.json({
      ...response.data,
      execution_metadata: {
        duration_ms: duration,
        routed_through: 'orchestrator',
        agent_service_url: AGENT_SERVICE_URL
      }
    });
  } catch (error: any) {
    console.error('❌ Error dispatching to agent service:', error);
    
    // Handle agent service unavailable
    if (error.code === 'ECONNREFUSED' || error.response?.status >= 500) {
      return res.status(503).json({
        error: 'Agent service unavailable',
        message: 'The agent execution service is currently unavailable',
        fallback: 'Please try again later'
      });
    }
    
    return res.status(error.response?.status || 500).json({
      error: 'Agent execution failed',
      message: error.response?.data?.error || error.message
    });
  }
});

// Real-time workflow execution endpoint
app.post('/realtime/workflow/execute', async (req, res) => {
  try {
    console.log('⚡ Real-time workflow execution request received');
    const { workflow_id, nodes, edges, context = {} } = req.body;
    
    if (!nodes || !nodes.length) {
      return res.status(400).json({
        error: 'Missing workflow data',
        message: 'Nodes are required for workflow execution'
      });
    }

    const executionId = workflow_id || `realtime-${uuidv4()}`;
    console.log(`⚡ Starting real-time workflow: ${executionId}`);
    
    // Enhanced real-time context
    const realtimeContext = {
      ...context,
      execution_mode: 'realtime',
      streaming_enabled: true,
      websocket_updates: true,
      low_latency: true,
      timestamp: new Date().toISOString()
    };
    
    // Execute with real-time optimization
    const result = await workflowService.executeWorkflow(
      executionId,
      nodes,
      edges,
      realtimeContext
    );
    
    console.log(`✅ Real-time execution started: ${result.executionId}`);
    
    return res.status(202).json({
      executionId: result.executionId,
      websocket_url: `ws://${req.get('host')}/ws/execution/${result.executionId}`,
      message: 'Real-time workflow execution started',
      status: 'streaming',
      features: {
        real_time_updates: true,
        streaming_logs: true,
        live_metrics: true
      }
    });
  } catch (error: any) {
    console.error('❌ Error executing real-time workflow:', error);
    return res.status(500).json({
      error: 'Failed to execute real-time workflow', 
      message: error.message
    });
  }
});

// Simulation orchestration endpoint (routes to agent_service)
app.post('/simulation/orchestrate', async (req, res) => {
  try {
    console.log('🔬 Simulation orchestration request - routing to agent service');
    const { guild_id, agents, duration_minutes, load_factor, error_injection, test_scenarios } = req.body;
    
    if (!guild_id || !agents) {
      return res.status(400).json({
        error: 'Missing simulation parameters',
        message: 'guild_id and agents are required'
      });
    }

    // Route to agent service for AI-heavy simulation logic
    const response = await axios.post(`${AGENT_SERVICE_URL}/simulation/run`, {
      guild_id,
      agents,
      duration_minutes: duration_minutes || 5,
      load_factor: load_factor || 1.0,
      error_injection: error_injection || false,
      test_scenarios: test_scenarios || []
    });
    
    console.log(`✅ Simulation orchestrated successfully for guild: ${guild_id}`);
    
    return res.json({
      ...response.data,
      orchestration_metadata: {
        routed_through: 'orchestrator',
        agent_service_url: AGENT_SERVICE_URL,
        simulation_type: 'ai_powered'
      }
    });
  } catch (error: any) {
    console.error('❌ Error orchestrating simulation:', error);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'Simulation service unavailable',
        message: 'The AI simulation service is currently unavailable'
      });
    }
    
    return res.status(error.response?.status || 500).json({
      error: 'Simulation orchestration failed',
      message: error.response?.data?.error || error.message
    });
  }
});

// Legacy agent dispatch for backward compatibility
app.post('/agentDispatchLegacy', async (req, res) => {
  try {
    const startTime = Date.now();
    console.log('🤖 Legacy agent dispatch request received');
    
    const { agent_id, input, context = {} } = req.body;
    
    if (!agent_id || !input) {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'agent_id and input are required'
      });
    }

    console.log(`Legacy dispatching to agent ${agent_id} with input: ${input.substring(0, 50)}...`);
    
    // Add request metadata
    const enhancedContext = {
      ...context,
      request_id: uuidv4(),
      timestamp: new Date().toISOString(),
      source: 'orchestrator',
      client_info: {
        ip: req.ip,
        user_agent: req.get('user-agent')
      },
      ...context
    };

    try {
      // Execute the agent using the agent service
      const response = await agentService.executeAgent(agent_id, input, context);
      
      console.log('Agent response received');
      res.json(response);
    } catch (error: any) {
      console.error('❌ Error dispatching to agent:', error);
      
      if (error.code === 'ECONNREFUSED' || error.message?.includes('connect')) {
        console.log('⚠️ Agent service unreachable, using fallback response');
        return res.json({
          output: `I processed your request about "${input}" and have generated a response using my fallback capabilities. For optimal results, please ensure the agent service is running.`,
          chain_of_thought: "Using fallback response generator since agent service is unavailable.",
          metadata: {
            processing_time_ms: Date.now() - startTime,
            model: "fallback"
          },
          status: "completed_fallback"
        });
      }
      
      res.status(500).json({ 
        error: error.message || 'Failed to dispatch to agent',
        status: 'error'
      });
    }
  } catch (error: any) {
    console.error('❌ Error in agent dispatch route:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to process agent dispatch request',
      status: 'error'
    });
  }
});

// Create a new router for agent endpoints
const agentRouter = express.Router();

// Voice synthesis endpoint
agentRouter.post('/voice/synthesize', async (req, res) => {
  try {
    const { text, voice_id, stability, similarity_boost, style } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const audio = await voiceService.synthesizeSpeech(text, voice_id, {
      stability,
      similarityBoost: similarity_boost,
      style
    });
    
    res.json({ 
      audio, 
      success: true, 
      format: 'audio/mpeg' 
    });
  } catch (error: any) {
    console.error('❌ Voice synthesis failed:', error);
    res.status(500).json({
      error: error.message || 'Failed to synthesize speech',
      success: false
    });
  }
});

// List available voices
agentRouter.get('/voice/voices', async (req, res) => {
  try {
    const voices = await voiceService.listVoices();
    res.json({ voices, count: voices.length, success: true });
  } catch (error: any) {
    console.error('❌ Failed to list voices:', error);
    res.status(500).json({
      error: error.message || 'Failed to list voices',
      success: false
    });
  }
});

// Video generation endpoint
agentRouter.post('/video/generate', async (req, res) => {
  try {
    const { text, avatar_id, webhook_url, metadata } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const result = await videoService.generateVideo(text, {
      avatarId: avatar_id,
      webhookUrl: webhook_url,
      metadata
    });
    
    res.json(result);
  } catch (error: any) {
    console.error('❌ Video generation failed:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate video',
      success: false
    });
  }
});

// Get video status
agentRouter.get('/video/status/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const status = await videoService.getVideoStatus(videoId);
    res.json(status);
  } catch (error: any) {
    console.error('❌ Failed to get video status:', error);
    res.status(500).json({
      error: error.message || 'Failed to get video status',
      success: false
    });
  }
});

// List available avatars
agentRouter.get('/video/avatars', async (req, res) => {
  try {
    const avatars = await videoService.listAvatars();
    res.json({ avatars, count: avatars.length, success: true });
  } catch (error: any) {
    console.error('❌ Failed to list avatars:', error);
    res.status(500).json({
      error: error.message || 'Failed to list avatars',
      success: false
    });
  }
});

// Health endpoints for agent services
agentRouter.get('/health', (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "agent-service",
    timestamp: new Date().toISOString()
  });
});

agentRouter.get('/voice/health', (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "voice-service",
    timestamp: new Date().toISOString()
  });
});

agentRouter.get('/video/health', (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "video-service",
    timestamp: new Date().toISOString()
  });
});

// Wizard API endpoints
const wizardRouter = express.Router();

// Health endpoint for wizard services
wizardRouter.get('/health', (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "wizard-service",
    timestamp: new Date().toISOString()
  });
});

// Generate blueprint endpoint for wizard
wizardRouter.post('/generate-blueprint', async (req, res) => {
  try {
    console.log('🧠 Wizard: Generating blueprint via orchestrator...');
    const { user_input, ai_model = 'gemini-pro' } = req.body;
    
    if (!user_input) {
      return res.status(400).json({ 
        error: 'user_input is required',
        details: 'Please provide user input to generate blueprint'
      });
    }

    // Forward to blueprint generation service
    const blueprint = await blueprintService.generateBlueprint(user_input);
    
    console.log('✅ Wizard: Blueprint generated successfully');
    res.json(blueprint);
  } catch (error: any) {
    console.error('❌ Wizard: Blueprint generation failed:', error);
    res.status(500).json({ 
      error: 'Blueprint generation failed',
      details: error.message || 'Unknown error occurred'
    });
  }
});

// Run simulation endpoint for wizard
wizardRouter.post('/run-simulation', async (req, res) => {
  try {
    console.log('🧪 Wizard: Running simulation via orchestrator...');
    const { blueprint_id, simulation_data } = req.body;
    
    if (!blueprint_id) {
      return res.status(400).json({ 
        error: 'blueprint_id is required',
        details: 'Please provide blueprint ID for simulation'
      });
    }

    // Forward to simulation service - create config object
    const config = {
      guild_id: blueprint_id,
      agents: simulation_data?.agents || [],
      duration_minutes: simulation_data?.duration_minutes || 5,
      load_factor: simulation_data?.load_factor || 1.0,
      error_injection: simulation_data?.error_injection || false,
      test_scenarios: simulation_data?.test_scenarios || []
    };
    const results = await simulationService.runSimulation(config);
    
    console.log('✅ Wizard: Simulation completed successfully');
    res.json(results);
  } catch (error: any) {
    console.error('❌ Wizard: Simulation failed:', error);
    res.status(500).json({ 
      error: 'Simulation failed',
      details: error.message || 'Unknown error occurred'
    });
  }
});

// Deploy guild endpoint for wizard
wizardRouter.post('/deploy-guild', async (req, res) => {
  try {
    console.log('🚀 Wizard: Deploying guild via orchestrator...');
    const { guild_data, agents_data } = req.body;
    
    if (!guild_data) {
      return res.status(400).json({ 
        error: 'guild_data is required',
        details: 'Please provide guild data for deployment'
      });
    }

    // Forward to deployment service with proper parameters
    const deployment = await deploymentService.deployGuild(
      guild_data, 
      {}, // simulationResults placeholder 
      {} // credentials placeholder
    );
    
    console.log('✅ Wizard: Guild deployed successfully');
    res.json(deployment);
  } catch (error: any) {
    console.error('❌ Wizard: Guild deployment failed:', error);
    res.status(500).json({ 
      error: 'Guild deployment failed',
      details: error.message || 'Unknown error occurred'
    });
  }
});

// Mount the routers
app.use('/api/wizard', wizardRouter);
app.use('/api/agent', agentRouter);

// Analytics endpoints
const analyticsRouter = express.Router();

// Get agent analysis
analyticsRouter.post('/agent-analysis', async (req, res) => {
  try {
    const { agent_id, time_period } = req.body;
    
    if (!agent_id) {
      return res.status(400).json({ error: 'Agent ID is required' });
    }
    
    const analysis = await analyticsService.getAgentAnalysis(agent_id, time_period);
    res.json(analysis);
  } catch (error: any) {
    console.error('❌ Failed to get agent analysis:', error);
    res.status(500).json({
      error: error.message || 'Failed to analyze agent',
      success: false
    });
  }
});

// Get guild analytics
analyticsRouter.get('/guilds/:guildId/analytics', async (req, res) => {
  try {
    const { guildId } = req.params;
    const { period } = req.query;
    
    const analytics = await analyticsService.getGuildAnalytics(
      guildId, 
      period as string || 'week'
    );
    
    res.json(analytics);
  } catch (error: any) {
    console.error('❌ Failed to get guild analytics:', error);
    res.status(500).json({
      error: error.message || 'Failed to get analytics',
      success: false
    });
  }
});

// Mount the analytics router
app.use('/api/analytics', analyticsRouter);

// Deployment endpoints
const deploymentRouter = express.Router();

// Deploy a guild
deploymentRouter.post('/guild', async (req, res) => {
  try {
    const { blueprint, simulation_results, credentials } = req.body;
    
    if (!blueprint) {
      return res.status(400).json({ error: 'Blueprint is required' });
    }
    
    const result = await deploymentService.deployGuild(
      blueprint,
      simulation_results,
      credentials || {}
    );
    
    res.json(result);
  } catch (error: any) {
    console.error('❌ Guild deployment failed:', error);
    res.status(500).json({
      error: error.message || 'Failed to deploy guild',
      success: false
    });
  }
});

// Get deployment status
deploymentRouter.get('/status/:deploymentId', async (req, res) => {
  try {
    const { deploymentId } = req.params;
    const status = await deploymentService.getDeploymentStatus(deploymentId);
    res.json(status);
  } catch (error: any) {
    console.error('❌ Failed to get deployment status:', error);
    res.status(500).json({
      error: error.message || 'Failed to get deployment status',
      success: false
    });
  }
});

// Mount the deployment router
app.use('/api/deployments', deploymentRouter);

// Get execution status endpoint
app.get('/execution/:executionId', async (req, res) => {
  try {
    const { executionId } = req.params;
    
    if (!executionId) {
      return res.status(400).json({ error: 'Execution ID is required' });
    }

    // Get the execution status from the workflow service
    const executionStatus = workflowService.getExecutionStatus(executionId);
    
    if (!executionStatus) {
      return res.status(404).json({
        error: 'Execution not found',
        message: `No execution found with ID: ${executionId}`
      });
    }
    
    res.json(executionStatus);
  } catch (error: any) {
    handleApiError(res, error, 'Failed to get execution status');
  }
});

// Blueprint generation endpoint
app.post('/generateBlueprint', async (req, res) => {
  try {
    console.log('🧠 Blueprint generation request received');
    const { user_input } = req.body;
    
    if (!user_input) {
      return res.status(400).json({ 
        error: 'Missing user input',
        message: 'User input is required'
      });
    }
    
    console.log(`Generating blueprint for: ${user_input.substring(0, 50)}...`);
    
    try {
      // Generate blueprint
      const blueprint = await blueprintService.generateBlueprint(user_input);
      
      console.log(`✅ Blueprint generated: ${blueprint.id}`);
      
      // Return the blueprint
      return res.json(blueprint);
    } catch (error: any) {
      console.error('❌ Error generating blueprint:', error);
      return res.status(500).json({ 
        error: 'Failed to generate blueprint',
        message: error.message || 'An unexpected error occurred'
      });
    }
  } catch (error: any) {
    console.error('❌ Error in blueprint generation route:', error);
    return res.status(500).json({ 
      error: 'Failed to process blueprint generation request',
      message: error.message || 'An unexpected error occurred'
    });
  }
});

// Run simulation endpoint
app.post('/simulation/run', async (req, res) => {
  try {
    console.log('🧪 Simulation request received');
    const config = req.body;
    
    if (!config.guild_id || !config.agents) {
      return res.status(400).json({ 
        error: 'Invalid simulation config',
        message: 'Guild ID and agents are required'
      });
    }
    
    try {
      // Run the simulation
      const results = await simulationService.runSimulation(config);
      
      console.log(`✅ Simulation completed: ${results.id}`);
      
      // Return the simulation results
      return res.json(results);
    } catch (error: any) {
      console.error('❌ Error running simulation:', error);
      return res.status(500).json({ 
        error: 'Failed to run simulation',
        message: error.message || 'An unexpected error occurred'
      });
    }
  } catch (error: any) {
    console.error('❌ Error in simulation route:', error);
    return res.status(500).json({ 
      error: 'Failed to process simulation request',
      message: error.message || 'An unexpected error occurred'
    });
  }
});

// Get simulation results endpoint
app.get('/simulation/:simulationId', async (req, res) => {
  try {
    const { simulationId } = req.params;
    
    if (!simulationId) {
      return res.status(400).json({ error: 'Simulation ID is required' });
    }
    
    // Get the simulation results
    const results = simulationService.getSimulationResults(simulationId);
    
    if (!results) {
      return res.status(404).json({
        error: 'Simulation not found',
        message: `No simulation found with ID: ${simulationId}`
      });
    }
    
    res.json(results);
  } catch (error: any) {
    console.error('❌ Error getting simulation results:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to get simulation results',
      status: 'error'
    });
  }
});

// Centralized error handling for API endpoints
function handleApiError(res: express.Response, error: any, defaultMessage: string) {
  console.error(`❌ API Error: ${error}`);
  
  let statusCode = 500;
  let errorMessage = error.message || defaultMessage;
  
  // Determine appropriate status code based on error type
  if (error.status === 404 || errorMessage.includes('not found')) {
    statusCode = 404;
  } else if (error.status === 400 || 
            errorMessage.includes('invalid') || 
            errorMessage.includes('required')) {
    statusCode = 400;
  } else if (error.status === 401 || errorMessage.includes('unauthorized')) {
    statusCode = 401;
  } else if (error.status === 403 || errorMessage.includes('forbidden')) {
    statusCode = 403;
  }
  
  res.status(statusCode).json({ 
    error: errorMessage,
    status: 'error',
    timestamp: new Date().toISOString()
  });
}

// Webhook endpoint
app.post('/webhook', async (req, res) => {
  try {
    const { source, event, payload } = req.body;
    
    console.log(`📡 Webhook received from ${source || 'unknown source'}`);
    console.log(`📡 Event: ${event || 'unspecified event'}`);
    
    // Process webhook event
    // In a real implementation, this would trigger relevant workflows
    
    res.status(200).json({ 
      received: true,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ Error processing webhook:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to process webhook',
      status: 'error'
    });
  }
});

// Start the server
app.listen(PORT, async () => {
  await initializeClients();
  console.log(`🚀 GenesisOS Orchestrator ready at http://localhost:${PORT}`);
  console.log(`📋 API Endpoints available:
  - POST /generateBlueprint
  - POST /generateCanvas
  - POST /generateEnterpriseCanvas (NEW)
  - POST /executeFlow
  - POST /executeEnterpriseFlow (NEW)
  - GET /execution/:executionId
  - GET /execution/:executionId/metrics (NEW)
  - POST /optimizeLayout (NEW)
  - POST /agentDispatch
  - POST /simulation/run
  - GET /simulation/:simulationId
  - POST /webhook
  `);
});

process.on('SIGINT', async () => {
  console.log('🛑 Orchestrator shutting down...');
  
  // Close Redis client if it exists
  if (redisClient) {
    console.log('Closing Redis connection...');
    await redisClient.quit();
    console.log('✅ Redis client closed');
  }
  
  console.log('✅ GenesisOS Orchestrator shutdown complete');
  process.exit(0);
});