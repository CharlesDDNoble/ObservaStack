# Scenario Library Design

## What It Does

The Scenario Library defines realistic incident simulations as JSON files. Each scenario is a sequence of actions—start load testing, push a broken config, send a user notification—that the Orchestrator executes to create hands-on debugging exercises.

Scenarios are composable: they reference reusable load patterns and config states, making it easy to create new exercises by mixing existing pieces.

## Why It Exists

### Scenarios Are Curriculum

The real value of ObservaStack isn't the infrastructure—it's the teaching content. A well-designed scenario teaches one specific debugging skill: identifying worker saturation, correlating deployments with regressions, or distinguishing CPU-bound from I/O-bound workloads.

Scenarios need to be easy to create, modify, and share. Making them declarative JSON files instead of code means curriculum designers can write new exercises without being engineers.

### Repeatability Matters

Good training requires consistent exercises. The same scenario should produce the same failure pattern every time, so students can retry, instructors can grade fairly, and improvements to scenarios don't require rewriting assessment rubrics.

Declarative definitions ensure repeatability—the orchestrator simply executes the action sequence exactly as written.

### Progressive Difficulty

Beginners need simple scenarios with clear signals. Advanced learners need complex cascading failures across multiple services. The scenario library supports both by organizing exercises by difficulty and declaring prerequisites.

Students follow a learning path: master "CPU Regression" before attempting "Distributed Deadlock."

## How It Works

### File Structure

Scenarios live in version-controlled directories organized by difficulty:

```
scenarios/
  beginner/
    cpu_regression.json
    worker_saturation.json
  intermediate/
    cascading_failure.json
  advanced/
    distributed_deadlock.json

configs/
  sut_configs.json          # Reusable config states

load_patterns/
  locust_patterns.json      # Reusable load profiles
```

### Scenario Schema

Each scenario file defines:
- **Metadata**: Name, difficulty, description, learning objectives
- **Action sequence**: Steps to execute (start load, push config, notify user)
- **Success criteria**: Target metrics students should achieve
- **Hints**: Optional guidance if students get stuck

### Action Types

**CONTROL_LOAD**: Start or change load testing patterns
- References predefined patterns (steady baseline, traffic spike, API-specific load)
- Orchestrator tells Locust to generate specific request rates

**PUSH_CONFIG**: Apply configuration changes
- References predefined configs (good version, broken version, too few workers)
- Orchestrator pushes config and restarts SUT
- Waits for health check before continuing

**NOTIFY_USER**: Send messages to the React UI
- Simulates user reports ("customers seeing errors")
- Different severity levels (info, warning, critical)
- Teaches students to triage based on user impact

**CHANGE_SCENARIO_STATE**: Update UI state
- Shows progression (setup → running → investigating → resolved)
- Helps students understand where they are in the exercise

**STOP_LOAD**: End load testing
- Orchestrator stops Locust workers
- Usually at scenario end or before switching patterns

**END_SCENARIO**: Mark completion and cleanup
- Stops all load tests
- Resets system state
- Prepares for next exercise

### Composability

Instead of duplicating settings, scenarios reference shared definitions:

**Load patterns** (in `load_patterns/locust_patterns.json`):
```json
{
  "steady_baseline": {
    "users": 50,
    "spawn_rate": 10,
    "target": "http://sut/api"
  },
  "traffic_spike": {
    "users": 200,
    "spawn_rate": 50,
    "duration": "5m"
  }
}
```

**Configs** (in `configs/sut_configs.json`):
```json
{
  "v1_0_good": {
    "version": "1.0",
    "algorithm": "iterative",
    "gunicorn_workers": 4
  },
  "v1_1_broken": {
    "version": "1.1",
    "algorithm": "recursive",
    "gunicorn_workers": 4
  }
}
```

Scenarios just say: "use steady_baseline load" and "push v1_1_broken config." Changes to these definitions affect all scenarios that use them.

### Execution Flow

The orchestrator loads a scenario and runs it step by step:

1. Read scenario JSON from file
2. For each action in the sequence:
   - Execute the action (start load, push config, notify user)
   - Wait the specified duration
   - Continue to next action
3. Mark scenario complete
4. Clean up (stop load tests, reset state)

Students see the effects in real-time: load starts, config changes, metrics spike, notifications appear.

## What This Enables

### Easy Scenario Creation

Writing a new scenario is just creating a JSON file:

```json
{
  "name": "Worker Pool Saturation",
  "difficulty": "beginner",
  "learning_objectives": [
    "Identify worker saturation from metrics",
    "Distinguish CPU vs concurrency limits"
  ],
  "actions": [
    {"type": "CONTROL_LOAD", "pattern": "steady_baseline", "wait": "2m"},
    {"type": "PUSH_CONFIG", "config": "too_few_workers", "wait": "30s"},
    {"type": "NOTIFY_USER", "message": "Latency increased to 2s", "wait": "0s"},
    {"type": "END_SCENARIO"}
  ]
}
```

No code changes. No deployment. Just add the file and it's available.

### Curriculum Development

Teaching teams can:
- Create scenario libraries for specific roles (backend SRE, platform engineer, oncall rotation)
- Organize learning paths (complete scenarios 1-5 before oncall access)
- A/B test different teaching approaches (guided vs freeform)
- Share scenarios across teams or publish them publicly

### Version Control

Scenarios are text files in git:
- Track changes to teaching content
- Review scenario improvements via pull requests
- Roll back if a scenario change makes it too hard or too easy
- Fork and customize for organization-specific needs

### Community Contributions

Users can submit new scenarios without touching the codebase:
- Add JSON file to `scenarios/community/`
- Submit pull request
- No security risk (JSON is data, not executable code)

Over time, the library grows through community expertise.

## Design Principles

**Declarative over imperative**: Scenarios describe what should happen, not how to make it happen. The orchestrator handles implementation details.

**Composable over monolithic**: Reuse load patterns and configs across scenarios. Change once, affect many.

**Simple over clever**: JSON files that humans can read and write. No DSL to learn, no programming required.

**Discoverable**: Auto-discovery from filesystem. Drop in a file, it's available. No registration required.

**Testable**: Validate scenario JSON against schema. Run scenarios in CI to ensure they still work.

## Example Scenario

```json
{
  "name": "CPU Regression from Algorithm Change",
  "difficulty": "beginner",
  "description": "Version 1.1 introduced an inefficient algorithm",
  "estimated_duration": "10m",
  "learning_objectives": [
    "Correlate version changes with performance regressions",
    "Use profiling to identify hot code paths",
    "Distinguish algorithmic vs infrastructure problems"
  ],
  "actions": [
    {
      "type": "CONTROL_LOAD",
      "pattern": "steady_baseline",
      "wait": "2m",
      "comment": "Establish healthy baseline"
    },
    {
      "type": "PUSH_CONFIG",
      "config": "v1_0_good",
      "wait": "1m",
      "comment": "System running normally"
    },
    {
      "type": "PUSH_CONFIG",
      "config": "v1_1_broken",
      "wait": "30s",
      "comment": "Deploy inefficient algorithm"
    },
    {
      "type": "NOTIFY_USER",
      "message": "⚠️ Users reporting slow page loads",
      "severity": "warning",
      "wait": "0s"
    },
    {
      "type": "CHANGE_SCENARIO_STATE",
      "state": "investigating",
      "wait": "5m",
      "comment": "Student investigates and fixes"
    },
    {
      "type": "END_SCENARIO"
    }
  ],
  "success_criteria": {
    "p95_latency": "< 500ms",
    "error_rate": "< 1%",
    "cpu_utilization": "< 80%"
  },
  "hints": [
    {
      "trigger_after": "2m",
      "message": "Check version labels in metrics"
    },
    {
      "trigger_after": "4m",
      "message": "Try using Pyroscope to see CPU hotspots"
    }
  ]
}
```

## Teaching Outcomes

**Scalable content creation**: Add dozens of scenarios without code changes. Curriculum grows independently of platform development.

**Consistent experience**: Same scenario produces same failure every time. Fair assessment, reliable practice.

**Progressive learning**: Beginners start simple, advance to complex. Prerequisites prevent students from attempting scenarios they're not ready for.

**Rapid iteration**: Update scenario difficulty or hints with a text edit. No deployment required.

**Knowledge sharing**: Scenarios encode expert knowledge. New SREs learn from patterns experienced engineers have seen.

## Summary

The Scenario Library transforms ObservaStack from a platform into a curriculum. Scenarios are the teaching content—the actual value students receive. Making them declarative JSON files means anyone can create exercises, share them, and improve them over time. The library grows organically as the community contributes realistic failure patterns from production experience.