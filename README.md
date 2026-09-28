# IncidentMemory — AI Production Incident Investigator

> **Tagline:** *"Every incident becomes knowledge for the next one."*

[![HackWithHyderabad 3.0](https://img.shields.io/badge/Hackathon-HackWithHyderabad_3.0-blueviolet)](https://github.com)
[![Hindsight Memory System](https://img.shields.io/badge/Memory-Hindsight_SDK-emerald)](https://github.com/vectorize-io/hindsight)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_Python-009688)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React_TypeScript-61DAFB)](https://react.dev/)

---

## 1. Problem Statement

Software engineering teams repeatedly spend hours diagnosing production incidents with identical or similar root causes (e.g. database pool exhaustion, API rate limits, authentication token expiry). When an incident is resolved, the fix remains buried in post-mortem documents, private Slack channels, or developer memories. 

When the next on-call engineer faces a similar issue, they are forced to investigate from scratch, drastically increasing **Mean Time To Resolution (MTTR)** and causing preventable downtime.

---

## 2. Solution: IncidentMemory

**IncidentMemory** is an AI production incident investigation agent powered by persistent organizational memory using **Hindsight**. 

Instead of operating as a stateless chatbot, IncidentMemory:
1. **Recalls Historical Incidents:** When a new error is reported, it queries Hindsight memory for matching symptoms, error codes, and historical resolutions.
2. **Context-Aware AI Reasoning:** Injects retrieved memories into the LLM prompt to diagnose root causes and suggest proven investigation steps.
3. **Continuous Knowledge Retain:** When an incident is marked resolved, the fix and outcome are persisted into Hindsight, making the organization smarter for future incidents.

---

## 3. Why Persistent Memory Matters

| Without Persistent Memory | With Hindsight Persistent Memory |
| :--- | :--- |
| Generic advice ("Check your logs, restart server") | Specific historical evidence ("2 past Payment API DB-504 incidents were fixed by increasing pool size from 20 → 50") |
| Investigates recurring failures from scratch | Instantly flags **RECURRING INCIDENT DETECTED** |
| Knowledge lost when developers leave | Permanent organizational memory preserved across teams |

---

## 4. System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                   REACT FRONTEND (Vite/TS)                  │
│   Dashboard  |  Investigate  |  Memory Explorer  |  Timeline │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   FASTAPI BACKEND (Python)                  │
│                                                             │
│   ┌────────────────────┐          ┌─────────────────────┐   │
│   │ Hindsight Service  │          │ LLM Provider Engine │   │
│   │ (hindsight-client) │          │ (Groq / OpenAI /    │   │
│   └─────────┬──────────┘          │  Gemini Abstraction)│   │
│             │                     └──────────┬──────────┘   │
└─────────────┼────────────────────────────────┼──────────────┘
              │                                │
              ▼                                ▼
    ┌───────────────────┐            ┌────────────────────┐
    │  HINDSIGHT SERVER │            │   LLM PROVIDER     │
    │  (Memory Bank)    │            │   (API Provider)   │
    └───────────────────┘            └────────────────────┘
```

---

## 5. Key Features

- 📊 **Production Intelligence Dashboard:** Real-time visibility into active incidents, resolution rates, MTTR, and recurring failure alerts.
- 🔍 **Incident Investigation Agent:** AI agent that correlates current incident telemetry with past organizational memories.
- 🧠 **Hindsight Memory Explorer:** Full transparency interface to search, audit, and inspect retained organizational incident knowledge.
- ⚡ **Memory Stepper Indicator:** Visual indicator tracking agent execution (`Analyzing Incident` → `Searching Hindsight` → `Memories Recalled` → `Generating Investigation`).
- 🔄 **Resolution & Retain Loop:** Seamless UI workflow to capture resolution facts and persist them directly into Hindsight.
- 🧪 **Before / After Comparison Mode:** Live demonstration tool comparing memory-less AI vs Hindsight-enhanced AI investigations.

---

## 6. Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS / Vanilla CSS, Lucide Icons
- **Backend:** FastAPI, Python 3.10+, Pydantic v2, SQLAlchemy, Uvicorn
- **Memory Engine:** **Hindsight SDK** (`hindsight-client` / `hindsight-all`)
- **LLM Abstraction:** Groq API (Llama 3.3 70B), OpenAI, or Google Gemini
- **Database:** SQLite (`incident_memory.db`)

---

## 7. Quickstart Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- Hindsight Server (or `pip install hindsight-all` for embedded local mode)
- LLM API Key (Groq, OpenAI, or Gemini)

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/incident-memory.git
cd incident-memory
```

### Step 2: Environment Configuration
Copy `.env.example` to `.env` and fill in your API credentials:
```bash
cp .env.example .env
```

### Step 3: Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python app/main.py
```
Backend will start on `http://localhost:8000`. Verify via `http://localhost:8000/health`.

### Step 4: Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Frontend will start on `http://localhost:5173`.

---

## 8. Environment Variables

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `HINDSIGHT_API_URL` | `http://localhost:8888` | Base URL of the Hindsight server |
| `HINDSIGHT_BANK_ID` | `incident-memory-bank` | Hindsight memory bank name |
| `LLM_PROVIDER` | `groq` | Active LLM provider (`groq`, `openai`, `gemini`) |
| `LLM_MODEL` | `llama-3.3-70b-versatile` | Model name |
| `LLM_API_KEY` | `your_api_key_here` | API key for configured provider |
| `DATABASE_URL` | `sqlite:///./incident_memory.db` | Application state database |

---

## 9. Live Demo Scenario

1. **Seed Demo Data:** Run `python backend/app/scripts/seed_demo_data.py` to populate 10 past incidents into Hindsight.
2. **Submit Incident:** In the UI, report a new `Payment API` error `DB-504 Connection timeout`.
3. **Observe Hindsight Recall:** Watch Hindsight return past `INC-017` connection pool exhaustion details.
4. **Inspect Recommendations:** Review the AI recommendation suggesting connection pool size adjustments based on historical evidence.
5. **Resolve & Retain:** Submit resolution details (`Increased pool size from 20 to 50`) and confirm retention into Hindsight.
6. **Future Verification:** Submit another Payment API DB timeout incident and observe immediate recognition of the new learning!

---

## 10. Development Roadmap & Phases

Development follows a strict 11-phase modular roadmap documented in [PHASES.md](file:///d:/Antigravity/AIpic/PHASES.md). Check [CURRENT_PHASE.md](file:///d:/Antigravity/AIpic/CURRENT_PHASE.md) for current status.

---

## 11. License

MIT License. Built for **HackWithHyderabad 3.0**.
