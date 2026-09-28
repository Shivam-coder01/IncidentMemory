# IncidentMemory — System Architecture Document

## 1. Architecture Overview

IncidentMemory uses a decoupled client-server architecture with dedicated abstraction layers for persistent organizational memory (Hindsight) and language models (LLM Provider Interface).

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        REACT FRONTEND (Vite / TS)                      │
│                                                                        │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌──────────┐   │
│   │ Dashboard   │   │ Investigate │   │ Memory Explorer││ Timeline │   │
│   └─────────────┘   └─────────────┘   └─────────────┘   └──────────┘   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST API
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FASTAPI BACKEND (Python 3.11+)                  │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ API Routers (/api/incidents, /api/investigate, /api/memories)   │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
│                                   │                                    │
│       ┌───────────────────────────┼───────────────────────────┐        │
│       ▼                           ▼                           ▼        │
│┌───────────────┐         ┌─────────────────┐         ┌────────────────┐│
││ SQLite App DB │         │ Hindsight Service│        │ LLM Provider   ││
││  (State DB)   │         │ (hindsight-client)       │  (Abstraction) ││
│└───────────────┘         └────────┬────────┘         └───────┬────────┘│
└───────────────────────────────────┼──────────────────────────┼─────────┘
                                    │                          │
                                    ▼                          ▼
                          ┌───────────────────┐      ┌──────────────────┐
                          │  HINDSIGHT SERVER │      │ LLM API (Groq /  │
                          │ (Memory Engine)   │      │ OpenAI / Gemini) │
                          └───────────────────┘      └──────────────────┘
```

---

## 2. Technology Stack

### Frontend
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite
- **Styling:** Vanilla CSS / Tailwind CSS (Dark-themed, high contrast, production dashboard visual design)
- **Icons & UI Utilities:** Lucide React icons, Axios for HTTP client

### Backend
- **Framework:** FastAPI (Python 3.10+)
- **WSGI/ASGI Server:** Uvicorn
- **ORM / Database:** SQLAlchemy + SQLite (`incident_memory.db`)
- **Validation & Schemas:** Pydantic v2
- **Environment Config:** `python-dotenv` / `pydantic-settings`

### Persistent Memory System (Mandatory Dependency)
- **Engine:** **Hindsight** (`hindsight-client` / `hindsight-all`)
- **Key Operations:**
  - `retain(bank_id, content)`: Persists structured incident summary & resolution facts into Hindsight.
  - `recall(bank_id, query)`: Retrieves top relevant historical incidents based on semantic similarity of symptoms, service names, and error codes.
  - `reflect(bank_id, query)`: Synthesizes high-level organizational insights across recurring incidents.

### LLM Integration
- **Abstraction Pattern:** Strategy Pattern via `LLMProvider` base interface.
- **Implementations:** `GroqProvider` (default / fast), `OpenAIProvider`, `GeminiProvider`.

---

## 3. Database Schema (Application State)

SQLite handles normal application state (incident tickets, investigation logs, metadata), while Hindsight handles long-term memory reasoning.

### `incidents`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID/PK) | Primary Key | e.g. `INC-017` |
| `service` | String | Not Null | Affected service (e.g. `Payment API`) |
| `environment` | String | Not Null | e.g. `Production`, `Staging` |
| `error_code` | String | Nullable | e.g. `DB-504` |
| `error_message` | String | Not Null | Detailed raw error message |
| `description` | Text | Not Null | Human description of symptoms |
| `deployment_version`| String | Nullable | e.g. `v2.4.1` |
| `status` | String | Default `'open'` | `'open'`, `'investigating'`, `'resolved'` |
| `created_at` | DateTime | Default `utcnow` | Incident timestamp |
| `resolved_at` | DateTime | Nullable | Resolution timestamp |

### `incident_resolutions`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID/PK) | Primary Key | Unique resolution record ID |
| `incident_id` | String | Foreign Key (`incidents.id`) | Linked incident |
| `root_cause` | Text | Not Null | Confirmed root cause |
| `resolution` | Text | Not Null | Implemented fix steps |
| `outcome` | String | Default `'resolved'`| `'resolved'`, `'mitigated'`, `'unresolved'` |
| `time_to_resolution`| Integer | Nullable | Resolution duration in minutes |
| `created_at` | DateTime | Default `utcnow` | Timestamp |

### `investigation_runs`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID/PK) | Primary Key | Unique run ID |
| `incident_id` | String | Foreign Key (`incidents.id`) | Target incident |
| `memory_count` | Integer | Default `0` | Number of Hindsight memories used |
| `model_provider` | String | Not Null | e.g. `groq/llama-3.3-70b` |
| `investigation_output`| JSON / Text | Not Null | Structured investigation result |
| `created_at` | DateTime | Default `utcnow` | Audit timestamp |

---

## 4. Hindsight Memory Design

Hindsight isolates memories into a dedicated bank: `incident-memory-bank`.

### Memory Document Format (Retained Knowledge)

When an incident resolution is saved, the `HindsightMemoryService` formats and retains a structured document:

```text
Incident ID: INC-017
Service: Payment API
Environment: Production
Error Code: DB-504
Error Message: Connection pool timeout limit exceeded (10000ms)
Deployment Version: v2.4.1

Root Cause: Connection pool exhaustion under high concurrency
Attempted Fixes: Restarted service (Failed)
Final Resolution: Increased connection pool size from 20 to 50 in pool_config.yaml
Outcome: Successful Resolution
Time To Resolution: 18 minutes
Keywords: DB-504, Payment API, database connection pool, timeout
```

### Retrieval & Context Injection (Recall Workflow)

During investigation:
1. Service constructs search query from current incident: `{service} {error_code} {error_message} {description}`
2. `hindsight_service.recall_incidents(query)` fetches top relevant historical records.
3. If relevant historical records are returned, they are injected into the agent system prompt context under `HISTORICAL ORGANIZATIONAL MEMORIES`.
4. If Hindsight returns no matches, the agent proceeds with basic diagnosis and explicitly notes that no past matching incidents were found.

---

## 5. LLM Provider Architecture

To avoid vendor lock-in and credit depletion issues, LLMs are encapsulated behind an abstract interface:

```python
from abc import ABC, abstractmethod

class LLMProvider(ABC):
    @abstractmethod
    async def generate_investigation(
        self, 
        current_incident: dict, 
        memories: list[dict], 
        system_prompt: str
    ) -> dict:
        """Generate structured incident investigation output."""
        pass
```

Implementations:
- `GroqProvider` (Uses Groq Python SDK / OpenAI compatibility API)
- `OpenAIProvider` (Uses official `openai` SDK)
- `GeminiProvider` (Uses `google-genai` SDK)

---

## 6. Error Handling & Graceful Degradation

The agent is resilient to external service outages:

1. **Hindsight Unavailable:** If the Hindsight server is unreachable or offline:
   - Backend logs warning: `Hindsight service offline. Falling back to memory-less mode.`
   - API returns flag `hindsight_available: False`.
   - UI displays a prominent banner: `⚠️ Historical memory unavailable. Running investigation without organizational context.`
2. **LLM Unavailable:** If the configured LLM API key fails or rate-limits:
   - Returns structured `503 Service Unavailable` error with diagnostic guidance.
3. **Database Fallback:** Uses SQLite file-based persistence with automatic table initialization on startup.
