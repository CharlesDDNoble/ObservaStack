# MVP: Self-Learner Journey

**Vision:** A training platform for teaching systems operating and debugging skills through repeatable scenarios based on simulated traffic and specific system configurations. Students practice diagnosing and fixing realistic system degradations by observing system state through observability tools and updating it dynamically with a runtime config system, all from a single web UI control panel.

**Success Criteria:** A self-learner can deploy ObservaStack locally, run realistic incident scenarios, investigate using industry-standard observability tools, apply fixes, and see immediate feedback on success criteria—all without requiring production system access.

---

## Critical Path (Blocks Release)

### 1. Configuration System

* [ ] Add **Database (PostgreSQL)** and **Microservice** to SUT for multi-service debugging scenarios
* [ ] Update SUT endpoints to simulate production API server (/fib → process_business_data)
* [ ] Implement **Control Agent** for managing SUT process lifecycle (signal delivery via PID namespace)
* [ ] Implement **runtime configuration interface** (`/config` endpoints) on SUT for dynamic failure injection and repair
* [ ] Implement **orchestrator task database schema** for scenario execution tracking
* [ ] Implement **scenario file schema** for scenario definitions

### 2. Scenario System (Execution Engine)

* [ ] Develop initial **Scenario Library** with 3-5 working scenarios:
    * CPU regression (algorithm change)
    * Worker pool saturation (concurrency limits)
    * Gateway connection pool lowered (latency increases)
    * Database bottleneck (slow queries, connection exhaustion)
* [ ] Implement **WebSocket push** for real-time scenario updates and hints
* [ ] Implement **success criteria display** — real-time metric validation against targets in sidebar

### 3. Frontend/Backend Integration

* [ ] Finalize **frontend/backend integration** (scenario control, state management, orchestrator API)
* [ ] **Embed Grafana dashboards** in frontend Observability tab (iframe or API-based)
* [ ] Add **log panels** to dashboards for complete observability surface (metrics + logs + traces)
* [ ] Implement **USER tab** showing business impact (simulated user requests or success rate visualization)

---

## Infrastructure & Deployment

### Local Development
* [ ] Publish **Docker Hub images** for custom components to reduce initial download time (frontend: 1+ minutes → <30 seconds)
* [ ] Create **Gitpod integration** for one-click deployment and experimentation

---

## Documentation

### Getting Started
* [ ] Refactor **README** to focus on quick start—move detailed deployment instructions to separate docs
* [ ] Add **Gitpod "Try It" button** to README for immediate experimentation
* [ ] Clarify project positioning: "A training platform for teaching systems operating and debugging skills through repeatable scenarios. Learning by doing—diagnose failures, apply fixes, validate results."
* [ ] Clarify scope: "This MVP focuses on self-learner practice. No grading, no submission. You validate your own work against success criteria."

### Scenario Creation Guide
* [ ] Write **scenario creation guide** for composing scenarios from load patterns and config states.

---

## Self-Validation Model (MVP Scope)

**What students do:**
1. Launch scenario
2. Observe symptom (User tab)
3. Investigate (Observability tab)
4. Form hypothesis
5. Apply fix (Test tab)
6. Check success criteria in sidebar
7. Iterate until "All criteria met or scenario ends (time gated)"
8. Mark scenario complete

**What students don't do:**
- Submit work for grading (post-MVP)
- Get assessed on investigation quality (post-MVP, team lead journey)
- See advisor feedback or recommendations (post-MVP)

**Success criteria validation:**
- Part of the scenario, always visible in sidebar
- Self validation, no automated checking

**Hints (MVP):**
- Time-based only (`trigger_after: "2m"`)
- Pushed via WebSocket, appear in incident update feed
- Optional guidance ("Check version labels in metrics")
- No action-based or adaptive hints (post-MVP)

---

## Nice-to-Have (Can Ship Without)

### Features
* [ ] **GCP Terraform deployment** - Teaches cloud deployment concepts, proves production security architecture, and provides clean measurements via VM isolation. Valuable for architectural credibility and advanced users, but Gitpod provides better accessibility for initial validation.
* [ ] **Plugins system** for community-contributed scenarios (separate MIT-licensed repo with reduced oversight)
* [ ] **Instructor guides** for each scenario explaining learning objectives and expected investigation paths
* [ ] **Action-based hints** — hints triggered by student actions (e.g., "checked logs," "increased workers")
* [ ] **Adaptive hints** — hints escalate based on investigation progress

### Contributor Guidance
* [ ] Write **contributor guide** covering development workflow, testing requirements, and feature request process
* [ ] Document **testing strategy** (unit + integration) now that architecture is stable

### Technical Reference
* [ ] Write **API specification** documenting each service, endpoint, and network path (user/secure/observability)
* [ ] Add **service registry** / **port mapping documentation** in networking/security section for simplified configuration management and service lookup in code.

---

## Deferred to Post-MVP

The following are valuable but required only for additional user journeys (team leads, assessment, multi-user):

* Scenario submission and grading
* Investigation quality assessment
* Instructor/team lead dashboards
* Multi-user platform
* Role-based access control
* LLM-based adaptive hints
* AlertManager integration
* Prometheus Exemplars
* Redis caching layer
* Service mesh integration
* Message queue + async workflows
* Kubernetes deployment option

See [backlog.md](backlog/backlog.md) for post-MVP expansion plans.
