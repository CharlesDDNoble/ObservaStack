# User Journeys

## Critical User Journeys

## Self-Learner (Junior → Mid Engineer)

*Goal: Build operational intuition without access to production systems*

1. **Setup** → One-command deploy, land on intro page explaining the scenario library.
2. **Select Scenario** → "Database connection pool exhaustion" with difficulty: Intermediate.
3. **Scenario Simuator** → System automatically simulates workload patterns and injects the failure.
4. **Investigate** → User opens Grafana, checks metrics, traces, logs to find root cause.
5. **Mitigate** → User issues a command to the system based on a defined toolkit (e.g. system config change).
6. **Root Cause** → User submits an investigatory write up of the proposed root cause with their findings and action items for preventing or gracefully handling similar failure classes.
7. **Review** → System tracks users commands, scenario time, and assesses impact (users affected, system down time, requests lost) and provides an explanation of the failure pattern, how to prevent & mitigate it, and what to monitor.

## Potential User Journeys

### Team Lead Training New Oncall Engineers

*Goal: Standardize oncall onboarding with repeatable exercises*

1. **Setup** → Deploy ObservaStack, review available scenarios.
2. **Assign Exercise** → Send engineer "Complete scenarios 1-5 before your first oncall shift".
3. **Monitor Progress** → Dashboard showing which scenarios completed, investigation quality.
4. **Review Session** → Discuss their approach, alternative investigation paths.
5. **Certification** → Engineer completes core scenarios before oncall access.

### Assessment Tool

*Goal: Evaluate operational troubleshooting skills objectively*

1. **Setup** → Candidate gets access to running ObservaStack instance.
2. **Scenario** → "The API is returning 500 errors - you have 30 minutes to diagnose".
3. **Investigation** → Candidate uses observability tools, documents their process.
4. **Recording** → System captures their queries, dashboard views, time spent.
5. **Review** → Assesser sees investigation path, identifies strong/weak areas.