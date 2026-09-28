# IncidentMemory — Hindsight Memory Taxonomy Design

IncidentMemory structures persistent organizational memory into 4 distinct categories stored within the Hindsight bank `incident-memory-bank`:

---

## 1. Incident Memory

Stores raw telemetry, service names, environment details, error codes, and symptoms.

```text
Incident ID: INC-017
Service: Payment API
Environment: Production
Error Code: DB-504
Error Message: Database connection pool limit exceeded (10000ms)
Deployment Version: v2.4.1
Description: Payment checkout failing for 15% of active users under high concurrency.
```

---

## 2. Resolution Memory

Stores verified diagnostic facts, attempted fixes (failed vs successful), confirmed root causes, and resolution duration.

```text
Problem: Payment API database timeout (DB-504)
Attempt 1: Restart service instance -> Result: Failed (Connections immediately saturated again)
Attempt 2: Increase database connection pool size from 20 to 50 in pool_config.yaml -> Result: Successful (0 errors, checkout restored)
Time to Resolution: 18 minutes
```

---

## 3. Environment Memory

Stores technical context regarding infrastructure configurations, deployment versions, cloud regions, and database pool limits.

```text
Service: Payment API
Deployment Version: v2.4.1
Database: PostgreSQL 15
Pool Config: pool_size=20, max_overflow=5
Cloud Region: us-east-1
```

---

## 4. Pattern Memory

Synthesizes recurring failure trends across microservices. When 2+ past memories match current symptoms, the UI activates:

```text
⚠️ RECURRING INCIDENT DETECTED
Service: Payment API
Error Code: DB-504
Historical Occurrences: INC-017, INC-023
Matching Root Cause: Connection pool exhaustion
```
