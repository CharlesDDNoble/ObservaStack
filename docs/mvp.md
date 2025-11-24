# **Vision**

A fully observable, production-grade distributed system model and SRE training platform, capable of running standardized load testing, chaos engineering, and runtime config issues as scenarios to elevating operational skills and learn resilient engineering design patterns.

## MVP Checklist

### CUJs

[] Self learner
[] 3 Scenarios

### Functionality

# Tasks

* [ ] Integrate **Node Exporter** for VM/container-level resource metrics, providing the necessary context for saturation metrics.
* [ ] Develop initial **Scenario Library** and instructor guides for standardized failure patterns (e.g., slow database query, thread exhaustion).
* [ ] Refactor API endpoints based on the new security model.
* [ ] Implement runtime system configuration interface (`/config` endpoints) to allow dynamic, programmable failure injection and repair.
* [ ] Implement push functionality using websockets for the frontend to push hints and scenario updates to the user and provide feedback when the test is done.