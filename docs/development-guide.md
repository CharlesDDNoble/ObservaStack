# Development Guide

## The Platform as Curriculum

**What:** ObservaStack's architecture should exemplify best practices—students learn by reading the code, not just using the system.

**Why:** Traditional tutorials teach toy examples. We teach production patterns by building a production-quality system. Every architectural decision is a lesson.

**How:** Clean separation of concerns, comprehensive observability, security by design, immutable infrastructure. When students ask "why did you build it this way?" the answer should teach a principle.

## I. Baseline: 12-Factor Application

**What:** All components should follow the 12-Factor methodology, with particular emphasis on:
- **VI. Processes:** Stateless execution
- **VIII. Concurrency:** Process-model scaling  
- **IX. Disposability:** Fast startup, graceful shutdown

**Why:** These three principles are foundational for building resilient distributed systems. The full 12-Factor list provides baseline best practices; deviate only when solving novel problems.

1. **Codebase:** One codebase tracked in revision control, many deploys
1. **Dependencies:** Explicitly declare and isolate dependencies
1. **Config:** Store config in the environment
1. **Backing services:** Treat backing services as attached resources
1. **Build, release, run:** Strictly separate build and run stages
1. **Processes:** Execute the app as one or more stateless processes
1. **Concurrency:** Scale out via the process model
1. **Disposability:** Maximize robustness with fast startup and graceful shutdown
1. **Dev/prod parity:** Keep development, staging, and production as similar as possible
1. **Logs:** Treat logs as event streams
1. **Admin processes:** Run admin/management tasks as one-off processes

## II. Modern Extensions & Mandatory Principles

**What:** These core principles mandate security, data integrity, observability and resiliency that extend beyond the 12-Factor foundation.

**Why:** Modern distributed systems require explicit guidance on observability, security, and failure handling that weren't emphasized in the original 12-Factor methodology.

1. **Design to Fail:** Treat failures as an expectation and design systems that can recover from them as opposed to trying to prevent and test for every failure scenario. Learn from every failure.

1. **API-First Design (OpenAPI):** Mandate all service-to-service contracts be defined and documented using the **OpenAPI Specification (OAS)**.

1. **Service Data Encapsulation:** Each service **must own its data store**. Access to another service's data must only be through its defined API, never via direct database access.

1. **Immutable Infrastructure:** Use **Infrastructure as Code (IaC)** exclusively; manual changes to deployed infrastructure are strictly forbidden.
   
   **Exception:** The System Under Test accepts runtime configuration changes via the Control Plane (environment variables, feature flags). This is the mechanism for injecting failures and teaching debugging—but infrastructure itself remains immutable.

1. **Comprehensive Observability:** Go beyond logs by implementing centralized **Metrics** (for SLOs/SLIs) and **Distributed Tracing** (for end-to-end request correlation).

1. **Zero Trust & Least Privilege:** Treat every component, user, and network segment as untrusted; grant access only via the **Principle of Least Privilege (PoLP)**.