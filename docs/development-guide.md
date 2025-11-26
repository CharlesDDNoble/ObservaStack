# Development Guide

## Themes

The following high level themes guide the development of the project, each modification and feature should be made with them in mind:

1.  **Accessible**
    * **What:** The project should be easy to start with and intuitive to use.
    * **Why:** To accelerate user adoption and gather essential feedback for iteration.
    * **How:** Through an open-source model focused on a fast, simple setup.

2.  **Applicable**
    * **What:** The project must teach in-demand, market-relevant skills.
    * **Why:** To equip users with practical, real-world abilities they can apply immediately.
    * **How:** By focusing on industry-standard tools and modern best practices.

3.  **Universal**
    * **What:** The project teaches foundational concepts that are transferable across any technology stack or problem domain.
    * **Why:** To provide enduring knowledge that outlasts any single tool and empowers users to adapt to future technologies.
    * **How:** By focusing on core system design patterns and first-principles thinking.

## The Platform as Curriculum

**What:** ObservaStack's architecture should exemplify best practices—students learn by reading the code, not just using the system.

**Why:** Teaching fundamentals of complex system interactions requires a realistic system. Toy examples don't reveal the tradeoffs and constraints that real systems navigate.

**How:** Follow the principles below. Systemic architectural choices (config system design, scenario orchestration, control plane structure) are documented in design docs with tradeoffs explained. Technology choices (PostgreSQL, Nginx, Prometheus, etc.) were selected for popularity, availability, and fit for the problem—specific technology differences don't require design justification.

## I. Baseline: 12-Factor Application

**What:** All components should follow the 12-Factor methodology, with particular emphasis on:
- **VI. Processes:** Stateless execution
- **VIII. Concurrency:** Process-model scaling  
- **IX. Disposability:** Fast startup, graceful shutdown

**Why:** These three principles teach students how real distributed systems work.

- **Stateless processes** teach: if a worker dies, the system survives. Students see Gunicorn restart dead workers and traffic continues. That's fault tolerance.
- **Process-model scaling** teach: systems scale by adding more independent workers, not by sharing memory. Students observe load balancing in action, see how requests distribute, understand why shared state is dangerous.
- **Fast startup/graceful shutdown** teach: infrastructure changes are normal (redeployment, rolling updates, restarts). Students see services come up/down without losing requests. That's production reality.

The full 12-Factor list provides baseline best practices. Deviate only when solving novel problems.

1. **Codebase:** One codebase tracked in revision control, many deploys
2. **Dependencies:** Explicitly declare and isolate dependencies
3. **Config:** Store config in the environment
4. **Backing services:** Treat backing services as attached resources
5. **Build, release, run:** Strictly separate build and run stages
6. **Processes:** Execute the app as one or more stateless processes
7. **Concurrency:** Scale out via the process model
8. **Disposability:** Maximize robustness with fast startup and graceful shutdown
9. **Dev/prod parity:** Keep development, staging, and production as similar as possible
10. **Logs:** Treat logs as event streams
11. **Admin processes:** Run admin/management tasks as one-off processes
12. **Port binding:** Export HTTP service via port binding, not relying on external application server

## II. Modern Extensions & Mandatory Principles

**What:** These core principles mandate security, data integrity, observability and resiliency that extend beyond the 12-Factor foundation.

**Why:** Modern distributed systems require explicit guidance on observability, security, and failure handling that weren't emphasized in the original 12-Factor methodology.

1. **Design to Fail:** Treat failures as an expectation and design systems that can recover from them as opposed to trying to prevent and test for every failure scenario. Learn from every failure.

2. **API-First Design (OpenAPI):** Mandate all service-to-service contracts be defined and documented using the **OpenAPI Specification (OAS)**.

3. **Service Data Encapsulation:** Each service **must own its data store**. Access to another service's data must only be through its defined API, never via direct database access.

4. **Immutable Infrastructure:** Use **Infrastructure as Code (IaC)** exclusively; manual changes to deployed infrastructure are strictly forbidden.
   
   **Exception:** The System Under Test accepts runtime configuration changes via the Control Plane (environment variables, feature flags). This is the mechanism for injecting failures and teaching debugging—but infrastructure itself remains immutable.

5. **Comprehensive Observability:** Teach observability through multiple streams, each with distinct purpose. Logs answer "what happened?" Metrics answer "how much?" Traces answer "where did the time go?" Profiles answer "why is it slow?" Students learn to select the right tool for each debugging question, not just passively consume data.

6. **Zero Trust & Least Privilege:** Treat every component, user, and network segment as untrusted; grant access only via the **Principle of Least Privilege (PoLP)**.