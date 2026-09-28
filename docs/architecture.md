# IncidentMemory — Technical Architecture Deep Dive

## System Overview

IncidentMemory is designed around a strict decoupling of **Application State** (tickets, user sessions, run logs) and **Long-Term Organizational Memory** (handled exclusively by **Hindsight**).

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        REACT FRONTEND (Vite / TS)                      │
│                                                                        │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌──────────┐   │
│   │ Dashboard   │   │ Investigate │   │ Memory Explorer││ Timeline │   │
│   └─────────────┘   └─────────────┘   └─────────────┘   └──────────┘   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ REST API
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FASTAPI BACKEND (Python 3.10+)                  │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ API Routers (/api/incidents, /api/investigate, /api/memories)   │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
│                                   │                                    │
│       ┌───────────────────────────┼───────────────────────────┐        │
│       ▼                           ▼                           ▼        │
│┌───────────────┐         ┌─────────────────┐         ┌────────────────┐│
││ SQLite App DB │         │ Hindsight Service│        │ LLM Provider   ││
││ (App State)   │         │ (hindsight-client)       │  (Abstraction) ││
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

## 1. Hindsight Memory Subsystem

The `HindsightMemoryService` in `backend/app/services/hindsight/memory_service.py` encapsulates all persistent memory operations:

- **Retain Memory (`retain_incident`):** Converts resolved incident telemetry, root cause hypotheses, and verified fix steps into structured text and posts to `/v1/banks/{bank_id}/retain`.
- **Recall Memory (`recall_incidents`):** Queries `/v1/banks/{bank_id}/recall` using symptom and error code semantic matching to retrieve relevant past incidents.
- **Reflect Memory (`reflect_on_incidents`):** Queries `/v1/banks/{bank_id}/reflect` to synthesize organizational beliefs and flag recurring failure trends.
- **Graceful Fallback:** If the external Hindsight server is unreachable, the service seamlessly degrades to local in-memory retention/recall without breaking application execution.

---

## 2. LLM Provider Architecture (Strategy Pattern)

To avoid hardcoded AI dependencies, LLM providers implement the `LLMProvider` abstract base class:

- `GroqProvider`: Uses Groq API with Llama 3.3 70B for fast, structured JSON generation.
- `OpenAIProvider`: Uses OpenAI Chat Completions API (`gpt-4o-mini`).
- `GeminiProvider`: Uses Google Gemini API (`gemini-1.5-flash`).
- `LLMFactory`: Instantiates active provider dynamically based on `LLM_PROVIDER` environment variable.

---

## 3. Database Schema (SQLite Application State)

| Table | Role |
| :--- | :--- |
| `incidents` | Incident ticket metadata, error code, symptoms, deployment version, status |
| `incident_resolutions` | Confirmed root causes, verified resolution steps, time to resolution |
| `users` | User accounts and engineer assignments |
| `investigation_runs` | Audit logs of AI agent investigation execution runs |
