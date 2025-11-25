# MVP: Self-Learner Journey

**Vision:** A fully observable, production-grade SRE training platform capable of running standardized load testing, chaos engineering, and runtime configuration scenarios to teach operational debugging and resilient system design.

**Success Criteria:** A self-learner can deploy ObservaStack locally, run realistic incident scenarios, investigate using industry-standard observability tools, apply fixes, and learn from immediate feedback—all without requiring production system access.

---

## Critical Path (Blocks Release)

### Core Infrastructure
* [ ] Add **Database (PostgreSQL)** and **Microservice** to SUT for multi-service debugging scenarios
* [ ] Implement **runtime configuration interface** (`/config` endpoints) for dynamic failure injection and repair
* [ ] Finalize **frontend/backend integration** (scenario control, state management, orchestrator API)

### Scenario System
* [ ] Develop initial **Scenario Library** with 3-5 working scenarios:
    * CPU regression (algorithm change)
    * Worker pool saturation (concurrency limits)
    * Gateway Connection pool lowered (latency increases)
    * Database bottleneck (slow queries, connection exhaustion)
* [ ] Implement **WebSocket push** for real-time hints, scenario updates, and completion feedback

### Observability Integration
* [ ] **Embed Grafana dashboards** in frontend Observability tab (iframe or API-based)
* [ ] Add **log panels** to dashboards for complete observability surface (metrics + logs + traces)

### User Experience
* [ ] Implement **USER tab** showing business impact (simulated user requests or success rate visualization)
* [ ] Write **scenario creation guide** for composing scenarios from load patterns and config states

---

## Infrastructure & Deployment

### Local Development
* [ ] Publish **Docker Hub images** for custom components to reduce initial download time (frontend: 1+ minutes → <30 seconds)
* [ ] Create **Gitpod integration** for one-click deployment and experimentation

### Cloud Deployment
* [ ] Update and test **Terraform scripts** for GCP deployment with new security model (three-gateway architecture, JWT auth)

---

## Documentation

### Getting Started
* [ ] Refactor **README** to focus on quick start—move detailed deployment instructions to separate docs
* [ ] Add **Gitpod "Try It" button** to README for immediate experimentation
* [ ] Clarify project positioning: "This is an educational tool for teaching operational debugging, not a commercial product. The goal is teaching fundamental concepts of operating distributed systems under uncertainty through observability-first principles."

### Technical Reference
* [ ] Write **API specification** documenting each service, endpoint, and network path (user/secure/observability)
* [ ] Add **port mapping documentation** in networking/security section for simplified configuration management

### Contributor Guidance
* [ ] Write **contributor guide** covering development workflow, testing requirements, and feature request process
* [ ] Document **testing strategy** (unit + integration) now that architecture is stable

---

## Nice-to-Have (Can Ship Without)

* [ ] **GCP Terraform deployment** - Teaches cloud deployment concepts, proves production security architecture, and provides clean measurements via VM isolation. Valuable for architectural credibility and advanced users, but Gitpod provides better accessibility for initial validation.
* [ ] **Plugins system** for community-contributed scenarios (separate MIT-licensed repo with reduced oversight)
* [ ] **Instructor guides** for each scenario explaining learning objectives and expected investigation paths

---

## Deferred to Post-MVP

The following are valuable but not required to validate core value with self-learners:

* AlertManager integration (Tract 1)
* Prometheus Exemplars (Tract 1)
* Redis caching layer (Tract 2)
* Service mesh integration (Tract 2)
* Message queue + async workflows (Tract 2)
* Kubernetes deployment option (Tract 2)
* LLM-based adaptive hints (Tract 2)
* Multi-user teaching platform (Tract 3)

See [backlog.md](backlog.md) for post-MVP expansion plans.