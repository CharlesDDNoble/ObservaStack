# Configuration System Design

## What It Does

The config system lets scenarios change how the SUT behaves at runtime. Instead of deploying new code, scenarios push configuration changes that toggle between good and bad implementations, slow and fast settings, or healthy and degraded states.

Every configuration includes a version identifier that gets attached to all metrics, making it easy to see when changes cause problems.

## Why It Exists

### Real Failures Aren't Crashes

Production systems rarely just fall over. They get slow because someone changed an algorithm. They run out of workers because someone misconfigured the server. They leak memory because someone forgot to close connections.

Static failures (kill a container, block network traffic) teach "the system is down." Config changes teach "the system is degraded"—which is what actually happens in production.

### Students Must Take Action

Watching dashboards is passive learning. Real incident response requires action:
- See latency spike
- Check metrics, form hypothesis
- Make a change (add workers, enable caching, rollback config)
- Observe if it helped
- Repeat until fixed

Without the ability to change config, students can't practice this loop. With it, they learn by doing.

### Changes Must Be Visible

When metrics spike, the first question is: "What changed?"

Version labels answer this immediately:
```
latency{version="1.0"} = 100ms  (before)
latency{version="1.1"} = 8s     (after)
```

Students learn to correlate changes with problems—the foundation of debugging.

## How It Works

### Configuration Storage

The SUT reads settings from environment variables when it starts:
- Version identifier (appears in all metrics)
- Server settings (worker count, timeouts)
- Feature toggles (which algorithm to use, whether caching is on)
- Chaos knobs (how much latency to inject, error rates)

### Applying Changes

The orchestrator pushes new configuration through an API endpoint. The control agent writes these settings to a file and restarts the SUT container. The container starts up with the new settings.

This causes 5-10 seconds of downtime, which is realistic—many production config changes require restarts.

### Version in Every Metric

All Prometheus metrics include the current version as a label. When graphed, this creates a clear visual split when versions change. Students can see exactly when performance diverged and correlate it with the deployment.

### Toggling Behavior

Configuration doesn't just set numbers—it controls which code paths execute:

```
if config says "use recursive algorithm":
    compute result the slow way
else:
    compute result the fast way
```

This lets scenarios inject realistic performance problems by switching implementations, not just adding artificial delays.

## What This Enables

### Performance Regressions

A scenario starts with version 1.0 using an efficient algorithm. After 3 minutes, it pushes version 1.1 with an inefficient algorithm. Latency spikes. Students see the version change in metrics, check the profiler, discover the algorithm is the problem, and fix it by either rolling back or enabling caching.

**Learning**: Code changes cause performance problems. Use profiling to find them.

### Configuration Problems

Same code version, different settings. First the system runs with 8 workers and handles load fine. Then config changes to 2 workers. Latency increases even though CPU isn't maxed out. Students realize workers are queuing, not the code.

**Learning**: Not every problem is a bug. Sometimes it's just wrong settings.

### External vs Internal

Traffic doubles but version stays constant. Latency increases. Students check version labels, see no change, dig deeper into request patterns. They learn to distinguish "we broke it" from "they broke it."

**Learning**: Always check what changed. Version labels show internal changes. Missing version change means look elsewhere.

### Safe Experimentation

Students can try different fixes:
- Increase workers to 8 → watch latency
- Increase workers to 32 → watch context switching hurt performance
- Switch to async workers → handle more with fewer processes
- Enable caching → bypass the slow computation entirely

Each change provides immediate feedback. They build intuition through experimentation, not guessing.

## Why Restart Is Fine

The SUT is stateless—no user sessions, no long-lived connections. Restart means brief unavailability, not data loss.

More importantly, restarts are realistic:
- Production config changes often require restarts
- Students need to see what happens during deploys
- Metrics show the gap (traffic drops to zero, then recovers)
- Load tests keep running, some requests fail with 503, then succeed again

This teaches operational reality: deployments cause brief disruptions, and that's normal and observable.

## Teaching Outcomes

**Change attribution**: Students learn to ask "what changed?" first. Version labels make this obvious, building the habit of checking recent changes before anything else.

**Hypothesis testing**: Make a change, see if metrics improve. If not, try something else. This is how real debugging works—informed experimentation, not perfect knowledge.

**Systems thinking**: Students discover that "more workers" doesn't always help (diminishing returns), "longer timeout" might hide problems, and "enable caching" has trade-offs. They learn there are no universal rules, only context-dependent decisions.

**Tool fluency**: By repeatedly checking metrics after config changes, students build muscle memory: where to look, what patterns mean trouble, how to correlate signals across metrics/logs/traces.

## Design Principles

**Simple**: Environment variables and restarts. No complex config management systems.

**Visible**: Version in every metric. Changes are always observable.

**Realistic**: Toggles between actual implementations, not just injecting delays.

**Safe**: Students can't break anything. Every change is reversible.

**Fast**: See results in under 30 seconds. Tight feedback loop accelerates learning.

## Summary

The config system transforms ObservaStack from a monitoring demo into an incident response simulator. Students don't just watch dashboards—they diagnose problems, make decisions, apply changes, and learn from what happens. Version labels teach them to correlate changes with incidents, the most important skill in operational debugging.