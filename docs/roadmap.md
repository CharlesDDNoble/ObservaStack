# Tract 1: Foundational SRE Training & Observability Core

**Goal:** Establish the complete, integrated environment for training incident response skills and complete the core observability loop (Alert - Investigate - Resolve).

### Current Capabilities (Baseline)
* Full observability dashboards (Golden Signals).
* Live signal injection and configurable load testing via Locust.
* Full-stack visibility (Metrics, Logs, Traces).

### Next Steps (Deliverables)
* [ ] Integrate **AlertManager** for practicing real-time alerting, silence management, and reducing "alert fatigue."
* [ ] Implement **Prometheus Exemplars** for direct trace-to-metric linking, bridging the "what" (metrics) to the "why" (traces).

### Value
Reduces oncall onboarding time and improves incident response quality by enabling safe, repeatable practice before production incidents occur.

---

# Tract 2: Distributed Architecture & Infrastructure Isolation

**Goal:** Transform the SUT into a production-like microservice ecosystem and validate operational maturity by isolating the testing environment (VM separation). This is the key architectural transition.

### Next Steps (Deliverables)
* **SUT Architecture Refactor:**
    * [ ] Refactor SUT into a distributed system: Add a **Toy Database (PostgreSQL/SQLite)** and a **Mini Microservice (e.g., Inventory)** to introduce dependencies and persistence.
    * [ ] Integrate a **Redis Caching Layer** to introduce performance acceleration and consistency challenges.
* **Infrastructure Isolation:**
    * [ ] **Terraform: Separate SUT and Observability Stack** onto distinct VMs/hosts to eliminate resource contention and guarantee monitoring reliability.
    * [ ] Terraform: Deploy the **Locust Load Generator** alongside the Observability Stack, confirming the Lesson Learned that testing infrastructure needs isolation.

### Value
Validates system resilience by allowing the practice of **cascading failure** debugging and proves the system's operational design by isolating the monitoring plane.

---

# Tract 3: Advanced Resilience & Ecosystem Integration

**Goal:** Achieve the complex distributed system layout by implementing advanced inter-service reliability patterns (asynchronous communication and service mesh).

### Next Steps (Deliverables)
* **Advanced Resilience (Platform Control):**
    * [ ] Integrate a **Service Mesh** (e.g., Istio, Linkerd) to implement platform-level resilience, focusing on **circuit breaking, retries, and mTLS**.
    * [ ] Implement advanced **Chaos Engineering Policies** within the Service Mesh (e.g., injecting precise network latency or HTTP error codes between components).
* **Asynchronous Architecture:**
    * [ ] Integrate a **Message Queue** (e.g., RabbitMQ or Kafka) and create a simple **Worker Service**.
    * [ ] Implement **Trace Context Propagation** across the Message Queue to enable debugging asynchronous workflows.
* **Kubernetes Support:**
    * [ ] Provide alternate deployment for the SUT on K8s for learning scalable and resilient deployments.
* **Scenario Agent Module:**
    * [ ] Integrate a LLM based scenario agent into the control plane for providing live feedback and scenario control based on santized tools like providing pre-defined hints based on the progress the user has made on the scenario. If they're struggling, give them a hint. If the scenarios almost over, give them more and more. The goal should be scenario completion to reinforce a positive experience.

### Value
Provides a unique sandbox for practicing and validating advanced architectural patterns and Chaos Engineering principles, ensuring that systems are resilient to both synchronous and asynchronous failures.