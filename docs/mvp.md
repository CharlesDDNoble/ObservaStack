# **Vision**

A fully observable, production-grade system and SRE training platform, capable of running standardized load testing, chaos engineering, and runtime config issues as scenarios to elevate operational skills and learn resilient engineering design patterns.

## MVP Checklist

### CUJs

* [ ] Self learner

### Functionality

# Tasks

* [ ] Develop initial **Scenario Library** and instructor guides for standardized failure patterns (e.g., slow database query, thread exhaustion).
* [ ] Implement runtime system configuration interface (`/config` endpoints) to allow dynamic, programmable failure injection and repair.
* [ ] Implement push functionality using websockets for the frontend to push hints and scenario updates to the user and provide feedback when the test is done.
* [ ] Refactor API endpoints based on the new security model.
* [ ] Add unit and integration tests now that system is stable and testing guide for ensuring reliable changes in the future.
* [ ] Update front end to match the front end design with the 4 panel view to simplify the scenario investigation flow.
* [ ] Add docker hub images for the custom components to speed up download time (for the frontend specifically, it's 1+ minutes).
* [ ] Create Gitpod integrations script and add to readme to maximize accessibility.
* [ ] Revise and test terraform scripts for GCP deployment to ensure it works with the new security model and architecture.
* [ ] Write contributor guide and feature request guide for simplifying continued development and improving community engagement.