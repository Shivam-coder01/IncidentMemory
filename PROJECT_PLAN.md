# IncidentMemory — Project Plan

> **Tagline:** *"Every incident becomes knowledge for the next one."*

---

## 1. Executive Summary & Vision

**IncidentMemory** is an AI-powered production incident investigator built for **HackWithHyderabad 3.0**. 

When production systems fail (database connection timeouts, API rate limits, authentication crashes, microservice deadlocks), software engineering teams waste critical time diagnosing issues from scratch. Existing documentation, past Slack threads, and post-mortems are fragmented or forgotten.

IncidentMemory solves this by building **persistent organizational memory** powered by **Hindsight**. 
- When an incident occurs, IncidentMemory queries Hindsight to recall past incidents with similar symptoms, affected services, error codes, and historical resolutions.
- The LLM reasons over the current incident symptoms *plus* historical memories to provide actionable root-cause hypotheses and recommended next steps.
- Once resolved, the final resolution, attempted fixes, and key learnings are stored back into Hindsight—ensuring the system continuously learns and improves over time.

---

## 2. Hackathon Alignment & Judging Criteria

| Criteria | Weight | How IncidentMemory Delivers |
| :--- | :---: | :--- |
| **Innovation** | 30% | Shifting incident management from reactive post-mortems to active, memory-driven real-time AI guidance. |
| **Hindsight Memory** | 25% | Real integration of Hindsight SDK (`retain`, `recall`, `reflect`) to persist incident patterns and retrieve relevant historical context. |
| **Technical Implementation** | 20% | Modular FastAPI backend, structured LLM provider abstraction (Groq, OpenAI, Gemini), React frontend, SQLite state, and robust error handling with graceful degradation. |
| **User Experience** | 15% | High-contrast production intelligence dashboard, step-by-step memory visibility indicators, interactive memory explorer, and clear Before/After memory comparison. |
| **Real-world Impact** | 10% | Dramatically reduces Mean Time To Resolution (MTTR) by eliminating redundant investigation of recurring incidents. |

---

## 3. Core Workflow

```text
  [ USER INCIDENT INPUT ]
             │
             ▼
[ 1. UNDERSTAND INCIDENT ] ──► Extracts service, error code, symptoms, deployment version
             │
             ▼
 [ 2. RECALL HINDSIGHT ]   ──► Queries Hindsight bank for matching historical patterns
             │
             ▼
  [ 3. LLM REASONING ]     ──► Synthesizes current incident + historical evidence
             │
             ▼
[ 4. RECOMMEND ACTION ]    ──► Displays root cause, evidence, & investigation steps
             │
             ▼
   [ 5. RESOLVE & LEARN ]  ──► Captures resolution details and retains into Hindsight
             │
             ▼
[ PERSISTED ORGANIZATIONAL KNOWLEDGE FOR FUTURE INCIDENTS ]
```

---

## 4. Key Target Features

1. **Production Intelligence Dashboard:** Overview of total incidents, MTTR, recurring issue warnings, and recent activity.
2. **Interactive Incident Investigator:** Guided form for reporting error codes, symptoms, and environment details.
3. **Real-time Memory Visibility:** Visual status step indicator showing memory retrieval progress (`Analyzing incident` → `Searching Hindsight` → `Memories Found` → `LLM Analysis`).
4. **Hindsight Memory Explorer:** Dedicated screen to search, inspect, and audit stored incident memories directly from Hindsight.
5. **Before vs After Comparison:** Side-by-side demonstration showing generic AI analysis (without memory) versus memory-enhanced AI investigation (with Hindsight).
6. **Resolution & Learning Loop:** Explicit workflow to retain resolved incident facts and solutions back into Hindsight memory.

---

## 5. Development Strategy (Phased Approach)

To ensure high quality, student-friendly simplicity, and seamless transition across AI coding sessions, development is strictly divided into **11 independent phases (Phase 0 to Phase 10)**.

- **Phase 0:** Project Specification & Architecture Plan *(Current Phase)*
- **Phase 1:** Backend Foundation (FastAPI, SQLite, Config, Health Check)
- **Phase 2:** Hindsight Service Integration & Verification Test
- **Phase 3:** LLM Provider Abstraction & Prompt Engineering
- **Phase 4:** Complete Agent Loop & Memory Retention Workflow
- **Phase 5:** React Frontend Components & Views
- **Phase 6:** Frontend-Backend Integration & End-to-End Test
- **Phase 7:** Synthetic Realistic Demo Dataset (10 Incident Scenarios)
- **Phase 8:** UX Polish, Memory Visibility & Before/After Demo Mode
- **Phase 9:** System Testing, Edge Case Validation & Graceful Degradation
- **Phase 10:** Final GitHub Repository Packaging & Demo Documentation

---

## 6. Multi-Session & Continuation Protocol

To survive switching AI accounts or models:
- Every phase maintains `CURRENT_PHASE.md` detailing completed work, created files, passed tests, and explicit next steps.
- Any incoming AI agent inspects `CURRENT_PHASE.md` first and resumes cleanly without breaking previous progress.
