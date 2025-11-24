# **Vision**

A fully observable, production-grade system and SRE training platform, capable of running standardized load testing, chaos engineering, and runtime config issues as scenarios to elevate operational skills and learn resilient engineering design patterns.

## MVP Checklist

### CUJs

* [ ] Self learner

### Tasks

* [ ] Develop initial **Scenario Library** and instructor guides for standardized failure patterns (e.g., slow database query, thread exhaustion).
* [ ] Implement runtime system configuration interface (`/config` endpoints) to allow dynamic, programmable failure injection and repair.
* [ ] Implement push functionality using websockets for the frontend to push hints and scenario updates to the user and provide feedback when the test is done.
* [ ] Refactor API endpoints based on the new security model.
* [ ] Have SUT serve basic html webpage for USER view for external testing.
* [ ] Add microservice with DB to the SUT for final simulation of multi service architectural problems.
* [ ] Add unit and integration tests now that system is stable and testing guide for ensuring reliable changes in the future.
* [ ] Add docker hub images for the custom components to speed up download time (for the frontend specifically, it's 1+ minutes).
* [ ] Create Gitpod integrations script and add to readme to maximize accessibility.
* [ ] Finalize integration of front end and backend.
* [ ] Revise and test terraform scripts for GCP deployment to ensure it works with the new security model and architecture.
* [ ] Write contributor guide / feature request guide for simplifying continued development and improving community engagement.
* [ ] Add plugins feature for allowing sharing scenarios via a plugins repo that can be MIT liscenced and have less supervision than the main project.
* [ ] Refactor readme into just the basics with links to more detailed docs e.g. move quick start to deploy and just have a gitpod integration "try me!" button.
* [ ] Write scenario creation guide for creating scenarios using composable actions.
* [ ] Add log panels to each of the dashboards to ensure full observability tooling is surfaced.
* [ ] Integrate front end with grafana embedded frame or request views from grafana to display.
* [ ] Add port mapping doc in a networking or security section to simplify port management across the project.
* [ ] Reiterate in docs that the project is an educational tool, not a product, and the goal is to teach fundamental concepts of operating systems under uncertainty via observability first principles.
* [ ] Add api specification doc outlining each service and each api endpoint and what path (user/secure/observability) it's exposed on, possibly as an addendum to the secure architecture doc. 