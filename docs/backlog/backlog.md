# Backlog

This document outlines possible expansion paths for ObservaStack after MVP completion. Tasks are grouped by theme (tract), each with a clear goal and value proposition to maintain focus.

---

## Tract 1: Foundational SRE Training & Observability Core

**Goal:** Establish the complete, integrated environment for training incident response skills and complete the core observability loop (Alert - Investigate - Resolve).

### Value
Reduces oncall onboarding time and improves incident response quality by enabling safe, repeatable practice before production incidents occur.

### Next Steps (Deliverables)
* [ ] Integrate **AlertManager** for practicing real-time alerting, silence management, and reducing "alert fatigue."
* [ ] Implement **Prometheus Exemplars** for direct trace-to-metric linking, bridging the "what" (metrics) to the "why" (traces).

---

## Tract 2: Advanced Resilience & Ecosystem Integration

**Goal:** Achieve the complex distributed system layout by implementing advanced inter-service reliability patterns (asynchronous communication and service mesh).

### Value
Provides a unique sandbox for practicing and validating advanced architectural patterns and Chaos Engineering principles, ensuring that systems are resilient to both synchronous and asynchronous failures.

### Next Steps (Deliverables)
* **Advanced Resilience (Platform Control):**
    * [ ] Integrate a **Service Mesh** (e.g., Istio, Linkerd) to implement platform-level resilience, focusing on **circuit breaking, retries, and mTLS**.
    * [ ] Implement advanced **Chaos Engineering Policies** within the Service Mesh (e.g., injecting precise network latency or HTTP error codes between components).
* **Caching Layer:**
    * [ ] Integrate a **Redis Caching Layer** to introduce performance acceleration and consistency challenges.
* **Asynchronous Architecture:**
    * [ ] Integrate a **Message Queue** (e.g., RabbitMQ or Kafka) and create a simple **Worker Service**.
    * [ ] Implement **Trace Context Propagation** across the Message Queue to enable debugging asynchronous workflows.
* **Kubernetes Support:**
    * [ ] Provide alternate deployment for the SUT on K8s for learning scalable and resilient deployments.
* **Scenario Agent Module:**
    * [ ] Integrate an LLM-based scenario agent into the control plane for adaptive hint delivery based on user progress—more hints when struggling, escalating guidance as scenarios near completion to reinforce successful resolution.

---

## Tract 3: Teaching and Training Journey Support 

**Goal:** Enable universities and teams to deploy ObservaStack for cohort-based training with assessment and progress tracking.

### Value
Transforms ObservaStack from a self-learner tool into a deployable teaching platform that organizations can use to assign and track training at scale.

### Next Steps (Deliverables)
* **Multi-Tenancy Architecture:**
    * [ ] Design architecture for multiple isolated SUT instances—shared control plane with observability stack, on-demand load generator and SUT provisioning per user or group.
    * [ ] Design K8s-based infrastructure for automated SUT environment provisioning.
* **Authentication & Progress Tracking:**
    * [ ] Implement user authentication and role-based access control (student/teacher/admin).
    * [ ] Add database for storing scenario results, completion tracking, and assessment metrics.
    * [ ] Build teacher dashboard for viewing student progress and completion status.
* **Deployment Documentation:**
    * [ ] Write deployment guide for institutional administrators and team leads.