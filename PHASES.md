# IncidentMemory — Phased Development Roadmap

This document outlines the 11 sequential, modular development phases for building **IncidentMemory**. Every phase is self-contained, testable, and leaves the repository in a runnable, clean state.

---

## Roadmap Overview

```text
Phase 0: Project Specification & Architecture (Done)
  │
  ▼
Phase 1: Backend Foundation (FastAPI, SQLite, Config, /health)
  │
  ▼
Phase 2: Hindsight Memory Integration (retain, recall & verification test)
  │
  ▼
Phase 3: LLM Provider Abstraction & Prompt System
  │
  ▼
Phase 4: Complete Agent Loop & Memory Retention Pipeline
  │
  ▼
Phase 5: React Frontend UI Component Suite
  │
  ▼
Phase 6: Frontend + Backend API Integration
  │
  ▼
Phase 7: Demo Dataset Generation (10 Realistic Scenarios)
  │
  ▼
Phase 8: UX Polish, Memory Stepper & Before/After Comparison Mode
  │
  ▼
Phase 9: Comprehensive Testing & Graceful Degradation Auditing
  │
  ▼
Phase 10: GitHub Packaging, Documentation & Hackathon Pitch Submission
```

---

## Phase Details

### Phase 0 — Project Specification (COMPLETED)
- **Goal:** Define architecture, stack, documentation, environment template, git configs, and multi-session continuation rules.
- **Deliverables:** `PROJECT_PLAN.md`, `ARCHITECTURE.md`, `PHASES.md`, `CURRENT_PHASE.md`, `README.md`, `.env.example`, `.gitignore`.
- **Verification:** All 7 specification files present and verified.

---

### Phase 1 — Backend Foundation
- **Goal:** Set up FastAPI backend project structure, SQLite database models, environment settings, logger, CORS, and health endpoint.
- **Deliverables:**
  - `backend/app/main.py`
  - `backend/app/core/config.py`
  - `backend/app/db/session.py`
  - `backend/app/models/incident.py`
  - `backend/requirements.txt`
- **Required Endpoint:** `GET /health` returning `{"status": "ok", "database": "connected"}`.
- **Verification:** Run pytest or curl `GET http://localhost:8000/health`.

---

### Phase 2 — Hindsight Memory Integration
- **Goal:** Implement the isolated `HindsightMemoryService` using official Hindsight SDK (`retain`, `recall`, `reflect`).
- **Deliverables:**
  - `backend/app/services/hindsight/memory_service.py`
  - `backend/tests/test_hindsight.py`
- **Verification:** Run `pytest backend/tests/test_hindsight.py` to confirm retaining an incident and recalling it returns exact matching semantic memory.

---

### Phase 3 — LLM Provider Abstraction & Prompt Engineering
- **Goal:** Implement provider abstraction (`LLMProvider`, `GroqProvider`, `OpenAIProvider`) and initial System Prompt.
- **Deliverables:**
  - `backend/app/services/llm/base.py`
  - `backend/app/services/llm/groq_provider.py`
  - `backend/app/services/llm/openai_provider.py`
  - `backend/app/prompts/investigation_prompt.py`
  - `backend/tests/test_llm.py`
- **Verification:** Verify structured LLM output generation with mock incident context.

---

### Phase 4 — Complete Agent Loop
- **Goal:** Connect Incident ingestion → Hindsight recall → Prompt assembly → LLM investigation → Resolution → Hindsight retain.
- **Deliverables:**
  - `backend/app/services/agent/investigator.py`
  - `backend/app/api/routers/investigate.py`
  - `backend/app/api/routers/incidents.py`
  - `backend/app/api/routers/memories.py`
- **Verification:** End-to-end backend API test simulating incident submit, investigation, and knowledge retain.

---

### Phase 5 — Frontend Foundation & Components
- **Goal:** Build modular React + TypeScript SPA using Vite with a high-contrast dark visual design.
- **Deliverables:**
  - `frontend/package.json`
  - `frontend/src/components/Navbar.tsx`
  - `frontend/src/components/Dashboard.tsx`
  - `frontend/src/components/InvestigateForm.tsx`
  - `frontend/src/components/InvestigationResult.tsx`
  - `frontend/src/components/MemoryExplorer.tsx`
  - `frontend/src/components/IncidentHistory.tsx`
  - `frontend/src/components/ResolutionForm.tsx`
- **Verification:** `npm run dev` in frontend directory renders all UI views.

---

### Phase 6 — Frontend + Backend API Integration
- **Goal:** Wire React UI components to FastAPI REST endpoints using Axios.
- **Deliverables:**
  - `frontend/src/services/api.ts`
  - Integrated state management for investigations and memory explore.
- **Verification:** Full browser workflow test: filing incident in UI triggers backend investigation with real server responses.

---

### Phase 7 — Synthetic Realistic Demo Dataset
- **Goal:** Seed database and Hindsight bank with 10 realistic production incident scenarios (Payment API timeouts, Auth token crashes, DB pool exhaustion).
- **Deliverables:**
  - `data/demo_incidents.json`
  - `backend/app/scripts/seed_demo_data.py`
- **Verification:** Run `python backend/app/scripts/seed_demo_data.py` and verify memories populate in Hindsight Explorer.

---

### Phase 8 — Hackathon UX Polish & Before/After Demo Mode
- **Goal:** Add visual memory retrieval stepper (`Analyzing` → `Searching Hindsight` → `Memories Found`), empty/error banners, and Before (Without Memory) vs After (With Hindsight) toggle.
- **Deliverables:**
  - `frontend/src/components/MemoryStepper.tsx`
  - `frontend/src/components/BeforeAfterToggle.tsx`
- **Verification:** Interactive toggle visualizes contrast between memory-enhanced vs generic AI responses.

---

### Phase 9 — Testing, Resilience & Graceful Degradation
- **Goal:** Audit error handling when Hindsight or LLM API is down, validating fallback notifications.
- **Deliverables:**
  - `backend/tests/test_graceful_degradation.py`
- **Verification:** Disconnecting Hindsight causes UI to notify user gracefully without crashing backend.

---

### Phase 10 — GitHub Submission & Hackathon Package
- **Goal:** Finalize `README.md`, `DEMO_SCRIPT.md`, architecture diagrams, screenshots, license, and repository clean-up.
- **Deliverables:**
  - `docs/demo-script.md`
  - `docs/architecture.md`
  - `LICENSE`
  - Final repository check.
- **Verification:** Clean `git status`, clear execution instructions for judges.
