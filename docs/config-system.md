# Configuration System Design

## What It Does

The config system lets scenarios change how the SUT behaves at runtime. Instead of deploying new code, scenarios push configuration changes that toggle between good and bad implementations, slow and fast settings, or healthy and degraded states.

Each service owns its configuration. Services expose a standard interface (`/config`) for reading and writing config, persist to their own volume, and read that volume on startup. The orchestrator tracks intended state; the Control Agent delivers config pushes; services manage their own persistence.

Every configuration includes a version identifier attached to all metrics, making it easy to see when changes cause problems.

## Why It Exists

### Real Failures Aren't Crashes

Production systems rarely just fall over. They get slow because someone changed an algorithm. They run out of workers because someone misconfigured the server. They leak memory because someone forgot to close connections.

Static failures (kill a container, block network traffic) teach "the system is down." Config changes teach "the system is degraded"—which is what actually happens in production.

### Students Must Take Action

Watching dashboards is passive learning. Real incident response requires action: see latency spike, check metrics, form hypothesis, make a change, observe if it helped, repeat until fixed.

Without the ability to change config, students can't practice this loop. With it, they learn by doing.

### Changes Must Be Visible

When metrics spike, the first question is: "What changed?" Version labels answer this immediately:

```
latency{version="1.0"} = 100ms  (before)
latency{version="1.1"} = 8s     (after)
```

Students learn to correlate changes with problems—the foundation of debugging.

## How It Works

### Ownership Model

| Component | Owns | Responsibility |
|-----------|------|----------------|
| Orchestrator | Intended state | Decides when to push config (scenario transitions, student fixes) |
| Control Agent | Nothing | Stateless delivery—forwards config, signals restart |
| Service | Its own config | Receives, persists, reads on startup |

### Standard Config Interface

Every service exposes the same contract:

| Method | Endpoint | Behavior |
|--------|----------|----------|
| GET | `/config` | Read from volume, return current |
| POST | `/config` | Write to volume |
| PUT | `/config` | Replace config, write to volume |
| DELETE | `/config` | Reset to defaults, write to volume |

Read operations return current state. Write operations persist to the service's volume. Services are self-sufficient—if they crash, they restart with the last config they persisted.

### Config Push Flow

1. Orchestrator sends config to Control Agent
2. Control Agent forwards to service's `/config` endpoint
3. Service writes to its volume, acknowledges
4. Control Agent signals restart (SIGHUP or SIGTERM)
5. Service restarts, reads config from its volume

The orchestrator doesn't need to be available for recovery. The Control Agent doesn't store state. Each service manages its own persistence.

### Version Labels

All Prometheus metrics include the current version as a label. When graphed, this creates a clear visual split when versions change. Students see exactly when performance diverged.

## What This Enables

### Self-Healing Services

If a service crashes, it restarts with valid config. No dependency on orchestrator availability or Control Agent state. The volume is the source of truth for runtime config.

### Scalable Architecture

Adding services (database, cache, worker) means implementing the same `/config` interface. Control Agent routes by endpoint. Orchestrator pushes config lists. No service-specific logic in the control plane.

### Safe Experimentation

Students push config changes and see immediate feedback. Increase workers, watch latency. Enable caching, watch hit rates. Every change is reversible. They build intuition through experimentation.

### Failure Attribution

Version labels distinguish "we broke it" (version changed) from "they broke it" (traffic changed). Students learn to check what changed first.

## Design Principles

- **Service data ownership**: Each service owns its config and persistence.
- **Stateless delivery**: Control Agent forwards, doesn't store.
- **Visible changes**: Version in every metric.
- **Standard interface**: Same contract for all services.
- **Fast feedback**: Results visible in under 30 seconds.

## Alternatives Considered

### Alternative 1: Control Agent Owns Config Persistence

**Description:** Control Agent writes config to a shared volume. SUT reads from that volume on startup. Control Agent is responsible for maintaining the authoritative config state.

**Pros:** Single writer simplifies conflict resolution. Control Agent already has privileged access for signaling.

**Cons:** Violates service data ownership—SUT must ask Control Agent "what's my config?" Creates tight coupling. Control Agent crash could orphan config state. Doesn't scale to multiple services cleanly.

**Why rejected:** Services should own their data. The dependency inversion feels wrong architecturally—the controlled component asking its controller for state is backwards.

### Alternative 2: Orchestrator Re-pushes on Every Restart

**Description:** No persistence. Orchestrator detects service restarts and pushes config before traffic arrives. Services read from environment variables set at container creation.

**Pros:** Truly stateless services. Single source of truth in orchestrator.

**Cons:** Race condition between restart and re-push. Orchestrator must be highly available. Can't use environment variables for runtime changes (set at container creation only). Adds detection and retry complexity.

**Why rejected:** Fragile. Recovery depends on orchestrator availability and timing. Actual implementation would require file-based config anyway since environment variables can't change at runtime.

### Alternative 3: Kubernetes-style Reconciliation Loop

**Description:** Orchestrator periodically reconciles intended config with actual config. Detects drift and corrects automatically.

**Pros:** Self-healing. Eventually consistent. Handles all failure modes.

**Cons:** Auto-healing undermines training. If the system fixes itself, students can't practice remediation. The student should be the reconciler.

**Why rejected:** Pedagogically wrong. Drift is the exercise. The system should stay broken until the student acts.

## Summary

The config system transforms ObservaStack from a monitoring demo into an incident response simulator. Services own their config, persist it themselves, and recover independently. The Control Agent delivers without storing. The orchestrator coordinates without being required for recovery. Students diagnose problems, apply changes, and learn from immediate feedback—the core loop of operational debugging.