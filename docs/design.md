# ObservaStack: The Turnkey Observability Stack

**ObservaStack** is a full-stack portfolio project demonstrating a complete, production-grade observability system. It's a "batteries-included" setup orchestrated entirely with `docker-compose`—clone the repository, run one command, and instantly deploy a working, instrumented application with a sophisticated monitoring dashboard.

**Objective:** Assess and debug system health in seconds by focusing on the "Golden Signals" (Latency, Traffic, Errors, Saturation) and enabling an interconnected debugging workflow.

## Core Architecture

The project consists of two main parts: the application and the observability stack.

### The Application

**Frontend:** A React "Control Panel" serving as a "Signal Generator." Provides a simple UI with buttons to simulate normal traffic, trigger specific errors, create latency spikes (p99), and cause CPU saturation.

**Backend:** A FastAPI (Python) API serving requests from the React frontend. Intentionally instrumented to expose metrics, logs, and traces, with debug endpoints the frontend can call to reliably trigger problem states.

**Proxy:** An Nginx server acting as the gateway/load balancer. Serves static, optimized React build files and reverse-proxies all `/api` requests to the FastAPI backend. Containerized using an efficient multi-stage Dockerfile.

### The Observability Stack

**Metrics (Prometheus):** Scrapes the `/metrics` endpoint from the FastAPI app to gather the Golden Signals.

**Logs (Loki):** Ingests structured JSON logs from the FastAPI app. Logs are automatically injected with a `traceID`.

**Traces (Tempo):** Receives detailed distributed traces from the FastAPI app via OpenTelemetry instrumentation.

**RUM (Faro):** A "Real User Monitoring" agent captures performance and error data directly from the user's browser in the React app.

**Visualization (Grafana):** The central hub featuring a pre-built "Service Health" dashboard that visualizes all components.

## The "Magic": The Debugging Workflow

The Grafana dashboard demonstrates the ideal debugging workflow:

1. **See a Problem (Metric):** A spike in the "p99 Latency" graph (Prometheus) alerts you to an issue.

2. **Find Context (Log):** Click the graph to jump directly to Loki logs from that exact time and locate the error log line.

3. **Pinpoint the Cause (Trace):** The error log includes a `traceID`. Click it to open Tempo, revealing the entire request trace and showing exactly which function or database call was slow.

4. **Confirm User Impact (RUM):** The Faro panel confirms that users are experiencing JS errors and slow page loads, completing the end-to-end picture from browser to backend.