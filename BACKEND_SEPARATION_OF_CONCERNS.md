# Backend Separation of Concerns - Genesis Platform

## 🏗️ Architectural Principle
**Agent Service (FastAPI)** handles AI/ML operations  
**Orchestrator (Node.js)** handles business logic, workflow coordination, and frontend integration

---

## 🤖 Agent Service (FastAPI) - AI/ML Engine
**Port: 8001**  
**Responsibility: Core AI/ML Operations**

### ✅ WHAT IT HANDLES:
- **AI/ML Processing**: Gemini API calls, LLM interactions
- **Agent Execution**: Agent reasoning and decision-making
- **Voice Synthesis**: ElevenLabs integration 
- **Video Processing**: Tavus integration
- **Memory Operations**: Agent memory storage and retrieval
- **Blueprint Generation**: AI-powered analysis
- **Simulation Execution**: Agent simulation scenarios
- **Einstein Intent Analysis**: Deep semantic analysis using AI
- **Cost Prediction**: AI-driven complexity analysis
- **MCP Tool Discovery**: AI-powered tool matching

### 🔗 Key Endpoints:
```python
# Core AI Operations
POST /agent/{agent_id}/execute
POST /voice/synthesize  
POST /generate_blueprint

# Phase 1 AI Engines
POST /api/ai/einstein/analyze
POST /api/ai/cost-prediction/predict
POST /api/ai/mcp/discover

# Health Checks
GET /api/ai/einstein/health
GET /api/ai/cost-prediction/health
GET /api/ai/mcp/health
```

---

## 🎯 Orchestrator (Node.js) - Business Logic Engine
**Port: 3001**  
**Responsibility: Workflow Coordination & Business Intelligence**

### ✅ WHAT IT HANDLES:
- **Canvas Operations**: Layout optimization, visual coordination
- **Workflow Orchestration**: Business process management
- **Real-time Collaboration**: WebSocket coordination
- **Database Operations**: Supabase integration
- **Authentication**: User management and authorization
- **Enterprise Features**: Business-grade workflow execution
- **Frontend Integration**: API gateway for frontend
- **Business Intelligence**: ROI calculation, resource planning
- **Clarification Engine**: Business logic for user questions
- **Intent Understanding**: Business context enrichment

### 🔗 Key Endpoints:
```typescript
# Canvas & Workflow Operations
POST /generateCanvas
POST /generateEnterpriseCanvas
POST /executeFlow
POST /executeEnterpriseFlow
POST /optimizeLayout

# Phase 1 Business Orchestration (coordinates with AI)
POST /api/intent/analyze      // Orchestrates Einstein + Business Logic
POST /api/cost/predict        // Orchestrates AI + Business Intelligence  
POST /api/mcp/integrate       // Orchestrates AI + Tool Management

# Real-time & Collaboration
GET /execution/{id}/metrics
WebSocket /collaboration
```

---

## 🔄 Integration Pattern

### Phase 1 Request Flow:
```
Frontend Request → Orchestrator (Business Logic) → Agent Service (AI) → Response
                      ↓
               Business Intelligence Layer
                      ↓
               Enhanced Response to Frontend
```

### Example - Intent Analysis:
1. **Frontend** → Orchestrator `/api/intent/analyze`
2. **Orchestrator** → Agent Service `/api/ai/einstein/analyze` (AI processing)
3. **Orchestrator** → Adds business context, clarification, templates
4. **Orchestrator** → Returns enriched response to frontend

---

## ✅ Current Compliance Status

### Agent Service (FastAPI) ✅ CORRECT:
- Focuses on AI/ML operations
- No business logic or UI concerns
- Pure computational engine
- Stateless AI processing

### Orchestrator (Node.js) ✅ CORRECT:  
- Coordinates business workflows
- Manages frontend integration
- Handles enterprise features
- Orchestrates between services

---

## 🎯 Phase 2 Ready
With proper separation established, we can now proceed to **Phase 2: Canvas Revolution** with confidence that:
- AI operations stay in Agent Service
- Business logic stays in Orchestrator  
- No functionality duplication
- Clear service boundaries
- Scalable architecture

**Status: ✅ SEPARATION OF CONCERNS ACHIEVED**
**Ready for Phase 2 Implementation**