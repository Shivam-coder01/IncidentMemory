# IncidentMemory — React Frontend

This directory contains the separate React + TypeScript + Vite frontend application for **IncidentMemory**.

## Key UI Screens Implemented

1. **Dashboard (`Screen 1`):** Real-time production intelligence overview with metrics (Total Incidents, Resolved Incidents, Recurring Patterns, Avg MTTR).
2. **Investigate Incident (`Screen 2`):** Guided telemetry form with one-click HackWithHyderabad 3.0 demo scenario presets.
3. **Investigation Result (`Screen 3`):** Recalled Hindsight memories, AI diagnostic analysis, root cause hypotheses, evidence, recommended next steps, and Before/After Memory contrast mode.
4. **Hindsight Memory Explorer (`Screen 4`):** Real-time search and inspection interface for persistent memories stored in Hindsight bank `incident-memory-bank`.
5. **Incident Timeline (`Screen 5`):** Sequential incident history highlighting recurring pattern alerts (`RECURRING INCIDENT DETECTED`).
6. **Resolution / Learn Form (`Screen 6`):** Workflow to save resolution facts and retain new knowledge into Hindsight.

## Setup Instructions

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend application will start on `http://localhost:5173`.
