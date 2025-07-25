import os
import json
import logging
import asyncio
import traceback
import time
from dataclasses import asdict
from typing import Dict, Any, Optional, List, Union, Annotated
from pydantic import BaseModel, Field
from fastapi import FastAPI, HTTPException, Body, Request, Depends, Path, Query, status, APIRouter
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from lib.memory_service import get_memory_service
from lib.agent_manager import get_agent_manager
from lib.gemini_service import get_gemini_service
from lib.voice_service import get_voice_service
from lib.monitoring_service import monitoring_service

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("agent_service")

# Configuration from environment
AGENT_PORT = int(os.getenv("AGENT_PORT", "8001"))
DEBUG_MODE = os.getenv("DEBUG", "false").lower() == "true"
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
API_VERSION = "v1"

# Define API models
class AgentInput(BaseModel):
    input: str
    context: Optional[Dict[str, Any]] = Field(default_factory=dict)

class AgentOutput(BaseModel):
    output: str
    chain_of_thought: str
    status: str = "completed"
    audio: Optional[str] = None

class AgentConfig(BaseModel):
    name: str
    role: str
    description: str
    tools: Optional[List[str]] = Field(default_factory=list)
    personality: Optional[str] = "Professional, helpful, and knowledgeable"
    memory_enabled: Optional[bool] = True
    voice_enabled: Optional[bool] = False
    voice_config: Optional[Dict[str, Any]] = None
    model: Optional[str] = None
    temperature: Optional[float] = None
    
class VoiceInput(BaseModel):
    text: str
    voice_id: Optional[str] = None
    stability: Optional[float] = 0.5
    similarity_boost: Optional[float] = 0.5
    style: Optional[float] = 0.0
    use_speaker_boost: Optional[bool] = True

class VoiceOutput(BaseModel):
    audio: Optional[str] = None
    format: str = "audio/mpeg"
    success: bool = True
    message: Optional[str] = None
    
class MemoryInput(BaseModel):
    content: str
    memory_type: str = "interaction"
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    importance: float = 0.5
    user_id: Optional[str] = None
    expiration: Optional[int] = None
    
class MemoryOutput(BaseModel):
    id: str
    success: bool = True
    message: Optional[str] = None
    
class BlueprintInput(BaseModel):
    user_input: str
    context: Optional[Dict[str, Any]] = Field(default_factory=dict)
    
class SimulationInput(BaseModel):
    guild_id: str
    agents: List[Dict[str, Any]]
    duration_minutes: Optional[int] = 5
    load_factor: Optional[float] = 1.0
    error_injection: Optional[bool] = False
    test_scenarios: Optional[List[str]] = Field(default_factory=list)

class ErrorResponse(BaseModel):
    error: str
    status: str = "error"
    detail: Optional[Dict[str, Any]] = None

# Initialize services
memory_service = get_memory_service()
agent_manager = get_agent_manager()
gemini_service = get_gemini_service()
voice_service = get_voice_service()

# Import simulation service
from lib.simulation_service import SimulationService
simulation_service = SimulationService()

# Define shutdown event handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        # Startup logic - use plain text for Windows compatibility
        logger.info("Starting GenesisOS Agent Service")
        
        # Initialize services with enhanced setup
        try:
            # Initialize Gemini service with Redis caching
            await gemini_service.initialize_cache()
            
            # Log the available AI models
            logger.info(f"🧠 Available AI models: {os.getenv('GEMINI_PRO_MODEL')}, {os.getenv('GEMINI_FLASH_MODEL')}")
            
            # Log the voice service status
            if voice_service.enabled:
                voices = await voice_service.get_available_voices()
                logger.info(f"🔊 Voice service ready with {len(voices)} available voices")
            else:
                logger.info("⚠️ Voice service not configured")
                
            # Test memory service
            test_memory_id = await memory_service.store_memory(
                agent_id="test_agent",
                content="Agent service startup test memory",
                memory_type="system",
                metadata={"type": "system_test"}
            )
            logger.info(f"✅ Memory service operational (test memory: {test_memory_id})")
            
            # Initialize monitoring service
            await monitoring_service.start_monitoring()
            logger.info("🔍 Real-time monitoring started")
            
        except Exception as e:
            logger.info("⚠️ Continuing with basic service configuration")
            
        yield
        
        # Shutdown logic
        logger.info("Shutting down GenesisOS Agent Service")
        # Close services
        await memory_service.close()
        await agent_manager.close()
        await gemini_service.close()
        await voice_service.close()
    except Exception as e:
        logger.error(f"Error in lifespan: {e}")
        raise

# Create FastAPI app
app = FastAPI(lifespan=lifespan)

# Configure CORS with more specific settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Type", "Authorization"]
)

# Add version prefix to all routes
api_router = APIRouter(prefix=f"/{API_VERSION}")

# Health check endpoint
@app.get("/")
async def read_root():
    gemini_key = os.getenv("GEMINI_API_KEY")
    elevenlabs_key = os.getenv("ELEVENLABS_API_KEY")
    pinecone_key = os.getenv("PINECONE_API_KEY")
    redis_url = os.getenv("REDIS_URL")
    
    gemini_configured = bool(gemini_key and not gemini_key.startswith('your_'))
    elevenlabs_configured = bool(elevenlabs_key and not elevenlabs_key.startswith('your_'))
    pinecone_configured = bool(pinecone_key and not pinecone_key.startswith('your_'))
    redis_configured = bool(redis_url and not redis_url.startswith('your_'))
    
    logger.info(f"Health check requested. Services: Gemini={gemini_configured}, ElevenLabs={elevenlabs_configured}, Pinecone={pinecone_configured}, Redis={redis_configured}")
    
    return {
        "status": "healthy",
        "message": "GenesisOS Agent Service is running",
        "version": "1.0.0",
        "integrations": {
            "gemini": "configured" if gemini_configured else "not configured",
            "elevenlabs": "configured" if elevenlabs_configured else "not configured",
            "pinecone": "configured" if pinecone_configured else "not configured",
            "redis": "configured" if redis_configured else "not configured"
        },
        "features": {
            "memory": True,
            "voice": elevenlabs_configured,
            "blueprint_generation": gemini_configured
        }
    }

# API version endpoint
@app.get("/version")
async def get_version():
    return {
        "version": API_VERSION,
        "build": os.getenv("BUILD_VERSION", "development")
    }

# Execute agent endpoint with comprehensive monitoring
@app.post("/agent/{agent_id}/execute", response_model=AgentOutput)
async def execute_agent(agent_id: str, agent_input: AgentInput):
    execution_id = f"exec-{agent_id}-{int(time.time() * 1000)}"
    
    try:
        input_text = agent_input.input
        context = agent_input.context or {}
        
        # Start execution tracking with monitoring
        monitoring_service.start_execution_tracking(execution_id, {
            "agent_id": agent_id,
            "input_length": len(input_text),
            "context_keys": list(context.keys()),
            "timestamp": time.time()
        })
        
        logger.info(f"🤖 Agent {agent_id} executing with monitoring ID: {execution_id}")
        
        # Record metrics
        monitoring_service.record_metric("agent_execution_started", 1, {"agent_id": agent_id}, monitoring_service.MetricType.COUNTER)
        
        # Add execution ID to context
        context["executionId"] = execution_id
        context["monitoring_enabled"] = True
        
        # Note if this is a test/simulation
        is_simulation = context.get("isSimulation", False)
        if is_simulation:
            monitoring_service.record_metric("simulation_execution", 1, {"agent_id": agent_id}, monitoring_service.MetricType.COUNTER)
        
        # Execute the agent with function call tracking
        start_time = time.time()
        
        # Track agent manager execution
        agent_start = time.time()
        output, chain_of_thought = await agent_manager.execute_agent(
            agent_id=agent_id,
            input_text=input_text,
            context=context
        )
        agent_duration = (time.time() - agent_start) * 1000
        monitoring_service.record_function_call(execution_id, "agent_manager.execute_agent", agent_duration, True)
        
        # Handle voice synthesis if enabled with monitoring
        audio_data = None
        if context.get("voice_enabled", False) and voice_service.enabled:
            voice_start = time.time()
            voice_id = context.get("voice_id")
            audio_data = await voice_service.synthesize_speech(
                text=output,
                voice_id=voice_id,
                stability=context.get('voice_config', {}).get('stability', 0.5),
                similarity_boost=context.get('voice_config', {}).get('similarity_boost', 0.75),
                style=context.get('voice_config', {}).get('style', 0.0)
            )
            voice_duration = (time.time() - voice_start) * 1000
            monitoring_service.record_function_call(execution_id, "voice_service.synthesize_speech", voice_duration, audio_data is not None)
            
            if audio_data:
                monitoring_service.record_metric("voice_synthesis_success", 1, {"agent_id": agent_id}, monitoring_service.MetricType.COUNTER)
            else:
                monitoring_service.record_metric("voice_synthesis_failure", 1, {"agent_id": agent_id}, monitoring_service.MetricType.COUNTER)
        
        # Calculate total execution time
        total_duration = (time.time() - start_time) * 1000
        
        # Record comprehensive metrics
        monitoring_service.record_metric("agent_response_time_ms", total_duration, {"agent_id": agent_id, "success": "true"}, monitoring_service.MetricType.TIMER)
        monitoring_service.record_metric("agent_execution_success", 1, {"agent_id": agent_id}, monitoring_service.MetricType.COUNTER)
        
        # End execution tracking
        monitoring_service.end_execution_tracking(execution_id, "completed")
        
        logger.info(f"✅ Agent {agent_id} completed execution {execution_id} in {total_duration:.2f}ms")
        
        return AgentOutput(
            output=output,
            chain_of_thought=chain_of_thought,
            status="completed",
            audio=audio_data
        )
    except Exception as e:
        # Record error metrics
        if 'execution_id' in locals():
            monitoring_service.record_metric("agent_execution_error", 1, {"agent_id": agent_id, "error_type": e.__class__.__name__}, monitoring_service.MetricType.COUNTER)
            monitoring_service.end_execution_tracking(execution_id, "error", str(e))
        
        logger.error(f"❌ Error executing agent {agent_id}: {str(e)}")
        
        # Log detailed traceback in debug mode
        if DEBUG_MODE:
            logger.error(f"Traceback: {traceback.format_exc()}")
            
        # Determine appropriate error code with enhanced categorization
        status_code = 500
        error_category = "internal_error"
        
        if "not found" in str(e).lower():
            status_code = 404
            error_category = "not_found"
        elif "invalid input" in str(e).lower() or "validation" in str(e).lower():
            status_code = 400
            error_category = "validation_error"
        elif "unauthorized" in str(e).lower() or "permission" in str(e).lower():
            status_code = 403
            error_category = "authorization_error"
        elif "timeout" in str(e).lower():
            status_code = 408
            error_category = "timeout_error"
        elif "rate limit" in str(e).lower():
            status_code = 429
            error_category = "rate_limit_error"
        
        # Record categorized error metrics
        monitoring_service.record_metric("error_by_category", 1, {"category": error_category, "agent_id": agent_id}, monitoring_service.MetricType.COUNTER)
            
        # Create detailed error response
        return JSONResponse(
            status_code=status_code,
            content={
                "error": f"Agent execution failed: {str(e)}",
                "status": "error",
                "detail": {
                    "agent_id": agent_id,
                    "error_type": e.__class__.__name__,
                    "error_category": error_category,
                    "execution_id": locals().get('execution_id'),
                    "timestamp": time.time()
                }
            }
        )

# Agent configuration endpoint
@app.post("/agent/{agent_id}/configure")
async def configure_agent(agent_id: str, config: AgentConfig):
    try:
        logger.info(f"Configuring agent {agent_id}: {config.name}")
        # Validate and store the agent configuration
        # In a real implementation, this would save to a database
        
        # Store in memory for now
        agent_config = {
            "id": agent_id,
            "name": config.name,
            "role": config.role,
            "description": config.description,
            "tools": config.tools,
            "personality": config.personality,
            "memory_enabled": config.memory_enabled,
            "voice_enabled": config.voice_enabled,
            "voice_config": config.voice_config
        }
        
        # Store configuration memory
        await memory_service.store_memory(
            agent_id=agent_id,
            content="Agent configuration updated",
            memory_type="system",
            importance=0.3,
            metadata={
                "type": "config_update",
                "name": config.name,
                "role": config.role
            }
        )
        
        logger.info(f"Agent configuration updated for {agent_id} with name {config.name}")
        
        return {
            "success": True,
            "message": f"Agent {agent_id} configured successfully",
            "agent_id": agent_id,
            "config": agent_config
        }
    except Exception as e:
        logger.error(f"Error configuring agent {agent_id}: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": f"Agent configuration failed: {str(e)}", "status": "error"}
        )

# Voice synthesis endpoint
@app.post("/voice/synthesize", response_model=VoiceOutput)
async def synthesize_voice(voice_input: VoiceInput):
    try:
        logger.info(f"Voice synthesis request: {voice_input.text[:50]}...")
        
        if not voice_service.enabled:
            return JSONResponse(
                status_code=400,
                content={
                    "error": "Voice synthesis is not enabled. Please configure ElevenLabs API key.",
                    "success": False
                }
            )
        
        audio_base64 = await voice_service.synthesize_speech(
            text=voice_input.text,
            voice_id=voice_input.voice_id,
            stability=voice_input.stability,
            similarity_boost=voice_input.similarity_boost,
            style=voice_input.style,
            use_speaker_boost=voice_input.use_speaker_boost
        )
        
        if audio_base64:
            logger.info("✅ Voice synthesis successful")
            return {
                "audio": audio_base64,
                "format": "audio/mpeg",
                "success": True
            }
        else:
            logger.error("❌ Voice synthesis failed to produce audio")
            return JSONResponse(
                status_code=500,
                content={
                    "error": "Failed to synthesize speech",
                    "success": False
                }
            )
    except Exception as e:
        logger.error(f"Error in voice synthesis: {str(e)}")
        if DEBUG_MODE:
            logger.error(traceback.format_exc())
            
        return JSONResponse(
            status_code=500,
            content={
                "error": f"Speech synthesis failed: {str(e)}",
                "success": False
            }
        )

# List available voices
@app.get("/voice/voices")
async def list_voices():
    try:
        if not voice_service.enabled:
            return JSONResponse(
                status_code=400,
                content={
                    "error": "Voice service is not enabled. Please configure ElevenLabs API key.",
                    "success": False
                }
            )
            
        voices = await voice_service.get_available_voices()
        return {
            "voices": voices,
            "success": True,
            "count": len(voices)
        }
    except Exception as e:
        logger.error(f"Error listing voices: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "error": f"Failed to list voices: {str(e)}",
                "success": False
            }
        )

# Create memory endpoint
@app.post("/agent/{agent_id}/memory", response_model=MemoryOutput)
async def create_memory(
    agent_id: str,
    memory_input: MemoryInput
):
    try:
        logger.info(f"Creating memory for agent {agent_id}")
        
        memory_id = await memory_service.store_memory(
            agent_id=agent_id,
            content=memory_input.content,
            memory_type=memory_input.memory_type,
            metadata=memory_input.metadata,
            importance=memory_input.importance,
            user_id=memory_input.user_id,
            expiration=memory_input.expiration
        )
        
        logger.info(f"✅ Memory created: {memory_id}")
        
        return {
            "id": memory_id,
            "success": True,
            "message": "Memory created successfully"
        }
    except Exception as e:
        logger.error(f"Error creating memory: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "error": f"Memory creation failed: {str(e)}",
                "success": False
            }
        )

# Search memories endpoint
@app.get("/agent/{agent_id}/memories/search")
async def search_memories(
    agent_id: str,
    query: str,
    limit: int = Query(10, ge=1, le=50),
    min_similarity: float = Query(0.6, ge=0, le=1)
):
    try:
        logger.info(f"Searching memories for agent {agent_id}: {query}")
        
        memories = await memory_service.search_memories(
            agent_id=agent_id,
            query=query,
            limit=limit,
            min_similarity=min_similarity
        )
        
        return {
            "agent_id": agent_id,
            "memories": memories,
            "count": len(memories)
        }
    except Exception as e:
        logger.error(f"Error searching memories: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "error": f"Memory search failed: {str(e)}",
                "success": False
            }
        )

# Endpoint to clear agent memory
@app.post("/agent/{agent_id}/clear-memory")
async def clear_agent_memory(agent_id: str):
    try:
        logger.info(f"Clearing memory for agent {agent_id}")
        
        success = await memory_service.clear_agent_memories(agent_id)
        
        if success:
            return {
                "success": True,
                "message": f"Memory cleared for agent {agent_id}"
            }
        else:
            return {
                "success": False,
                "message": f"Failed to clear memory for agent {agent_id}"
            }
    except Exception as e:
        logger.error(f"Error clearing memory for agent {agent_id}: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "error": f"Memory clearing failed: {str(e)}",
                "status": "error"
            }
        )

# Endpoint to retrieve agent memories
@app.get("/agent/{agent_id}/memories")
async def get_agent_memories(agent_id: str, limit: int = 10):
    try:
        logger.info(f"Retrieving memories for agent {agent_id}")
        
        memories = await memory_service.retrieve_recent_memories(agent_id, limit=limit)
        
        return {
            "agent_id": agent_id,
            "memories": memories,
            "count": len(memories)
        }
    except Exception as e:
        logger.error(f"Error retrieving memories for agent {agent_id}: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "error": f"Memory retrieval failed: {str(e)}",
                "status": "error"
            }
        )

# Blueprint generation endpoint
@app.post("/generate-blueprint")
async def generate_blueprint(
    user_input: str = Body(..., embed=True)
):
    try:
        logger.info(f"Generating blueprint for: {user_input[:50]}...")
        
        if not gemini_service.api_key or gemini_service.api_key.startswith("your_"):
            return JSONResponse(
                status_code=400,
                content={
                    "error": "Gemini API key is not configured. Please set GEMINI_API_KEY in .env file.",
                    "status": "error"
                }
            )
        
        blueprint = await gemini_service.generate_blueprint(user_input)
        
        logger.info(f"✅ Blueprint generated successfully: {blueprint['id']}")
        
        return blueprint
    except Exception as e:
        logger.error(f"Error generating blueprint: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "error": f"Blueprint generation failed: {str(e)}",
                "status": "error"
            }
        )

# Simulation endpoint
@app.post("/simulation/run")
async def run_simulation(simulation_input: SimulationInput):
    try:
        logger.info(f"Starting simulation for guild: {simulation_input.guild_id}")
        
        # Run simulation using the simulation service
        results = await simulation_service.run_simulation({
            "guild_id": simulation_input.guild_id,
            "agents": simulation_input.agents,
            "duration_minutes": simulation_input.duration_minutes,
            "load_factor": simulation_input.load_factor,
            "error_injection": simulation_input.error_injection,
            "test_scenarios": simulation_input.test_scenarios
        })
        
        logger.info(f"✅ Simulation completed for guild: {simulation_input.guild_id}")
        
        return {
            "success": True,
            "message": f"Simulation completed for guild {simulation_input.guild_id}",
            "results": results["results"]
        }
    except Exception as e:
        logger.error(f"Error running simulation: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "error": f"Simulation failed: {str(e)}",
                "success": False
            }
        )

# Advanced monitoring and metrics endpoints
@app.get("/monitoring/health")
async def get_system_health():
    """Get comprehensive system health metrics"""
    try:
        health_data = monitoring_service.get_system_health()
        return {
            "success": True,
            "health": health_data,
            "timestamp": time.time()
        }
    except Exception as e:
        logger.error(f"Error getting system health: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "error": f"Health check failed: {str(e)}",
                "success": False
            }
        )

@app.get("/monitoring/metrics")
async def get_metrics_summary():
    """Get current metrics summary"""
    try:
        metrics = monitoring_service._get_metrics_summary()
        return {
            "success": True,
            "metrics": metrics,
            "timestamp": time.time()
        }
    except Exception as e:
        logger.error(f"Error getting metrics: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "error": f"Metrics retrieval failed: {str(e)}",
                "success": False
            }
        )

@app.get("/monitoring/execution/{execution_id}")
async def get_execution_report(execution_id: str):
    """Get detailed execution performance report"""
    try:
        report = monitoring_service.get_performance_report(execution_id)
        if not report:
            return JSONResponse(
                status_code=404,
                content={
                    "error": f"Execution {execution_id} not found",
                    "success": False
                }
            )
        
        return {
            "success": True,
            "report": report,
            "timestamp": time.time()
        }
    except Exception as e:
        logger.error(f"Error getting execution report: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "error": f"Report generation failed: {str(e)}",
                "success": False
            }
        )

@app.get("/monitoring/alerts")
async def get_active_alerts():
    """Get currently active alerts"""
    try:
        active_alerts = [
            alert for alert in monitoring_service.alerts.values() 
            if not alert.resolved and time.time() - alert.timestamp < 3600  # Last hour
        ]
        
        return {
            "success": True,
            "alerts": [asdict(alert) for alert in active_alerts],
            "count": len(active_alerts),
            "timestamp": time.time()
        }
    except Exception as e:
        logger.error(f"Error getting alerts: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "error": f"Alert retrieval failed: {str(e)}",
                "success": False
            }
        )
# Register the API router
app.include_router(api_router)

# Main entry point
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=AGENT_PORT, reload=True)