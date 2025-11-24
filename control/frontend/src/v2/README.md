# Frontend UI Design

## What It Does

The v2 UI is an incident response workbench that guides trainees through realistic debugging exercises. It uses a persistent sidebar plus tabbed workspace layout—the sidebar maintains situational awareness while tabs provide investigation tools. This mirrors how engineers actually work incidents: one eye on the comms channel, hands switching between dashboards.

The interface implements the OODA loop (Observe, Orient, Decide, Act) as a concrete workflow. Users observe symptoms in the User tab, examine evidence in the Observability tab, and execute remediations in the Test tab. The sidebar displays real-time updates—hints, metric changes, simulated stakeholder pressure—pushed from the orchestrator.

The UI is a control surface, not state storage. The orchestrator owns scenario definitions, execution state, and progression logic. The frontend renders what the orchestrator tells it and forwards user actions back. This separation keeps the UI thin and the orchestrator authoritative.

## Why It Exists

### Passive Learning Doesn't Stick

Watching dashboards teaches recognition. Incident response requires action—form hypothesis, make change, observe result, iterate. The v2 UI forces this loop by giving users controls that affect the system and metrics that reflect those changes immediately.

### Context Switching Kills Speed

Real incidents happen across multiple tools: Slack, PagerDuty, Grafana, terminals. Switching between disconnected interfaces wastes cognitive load. The sidebar provides persistent context (scenario state, updates, timer) while tabs keep investigation tools one click away. Users build muscle memory for efficient tool navigation.

### Incident Updates Are Training Content

The updates feed simulates production reality: hints appear when users get stuck, metrics change based on system state, stakeholder messages add pressure. This isn't decoration—it's curriculum. Students learn to parse signal from noise, prioritize information, and communicate status while debugging.

## How It Works

### Component Architecture

```
v2/
├── components/
│   ├── Sidebar/         # Incident context (5 components)
│   ├── Tabs/            # Investigation views (3 components)
│   └── Workspace/       # Content area (2 components)
├── hooks/               # State management (3 hooks)
├── types/               # TypeScript interfaces
└── pages/               # Main page component
```

Components are self-contained. Sidebar components handle scenario display, status indicators, and the updates feed. Tab components render User (business impact), Observability (metrics/logs/traces), and Test (API explorer, diagnostics, terminal). The Workspace manages tab switching and content rendering.

### State Flow

The orchestrator is the source of truth. The UI maintains only local display state (which tab is active, whether a section is collapsed). All scenario data flows from the orchestrator via API calls or WebSocket push:

- **Scenario list**: Fetched from orchestrator on load.
- **Scenario state**: Orchestrator tracks running/stopped, elapsed time, progress.
- **Incident updates**: Pushed from orchestrator based on scenario logic.
- **Success criteria**: Evaluated by orchestrator, displayed by UI.

User actions (start scenario, stop scenario, submit fix) are forwarded to the orchestrator. The UI updates when the orchestrator responds.

### Tab Content

All tabs are placeholders awaiting backend integration:

- **User Tab**: Will display live request feed and business metrics from the load generator.
- **Observability Tab**: Will embed Grafana dashboards with scenario-appropriate views.
- **Test Tab**: Will connect to API explorer, diagnostic scripts, and container terminal.

The component structure is complete. Data connections are not.

### Styling and Animation

Dark theme (slate-900/950) with blue accents. Tailwind utilities handle layout and color. Custom CSS animations provide polish: feed items slide in, updates drop down, the active status indicator pulses. Movement draws attention to new information.

## What This Enables

### Realistic Incident Simulation

Users experience incidents as they happen in production: symptoms appear, updates stream in, time pressure mounts. The orchestrator controls pacing and content. The UI renders the experience without needing to understand scenario logic.

### Progressive Hint System

The orchestrator pushes updates based on time elapsed or user progress. Stuck for 2 minutes? A hint appears. Still stuck? More specific guidance. This scaffolding helps beginners complete scenarios while advanced users can request harder settings. Same UI, different orchestrator configuration.

### Thin Client Architecture

The UI is stateless beyond display concerns. Reloading the page fetches current state from the orchestrator. Multiple UI instances could connect to the same orchestrator. The separation enables future features (mobile view, CLI interface) without duplicating scenario logic.

### Extensible Scenario Content

Adding scenarios means adding definitions to the orchestrator's scenario library. The UI discovers available scenarios at runtime. Curriculum designers update the orchestrator; the UI reflects changes automatically.

## Design Principles

- **Persistent context**: Sidebar always visible. Users never lose situational awareness.
- **Minimal switching**: Three tabs cover the full investigation workflow. No hidden menus.
- **Real-world fidelity**: Layout mirrors actual incident response patterns.
- **Progressive complexity**: Tabs ordered by skill level (observe → analyze → act).
- **Immediate feedback**: Every action produces observable change within seconds.

## Local Development

```bash
cd control/frontend
npm start
```

Access v1 at `localhost:3001/v1` (or whatever port the .env specifies) and v2 at `localhost:3001/v2`. Hot reload handles changes automatically. Both UIs run side-by-side.

**Validation:**

1. Navigate to `/v2`—sidebar and tabs render
2. Click a scenario—status changes to active, timer starts
3. Switch tabs—content updates, no console errors
4. Stop scenario—returns to selection state

The component structure works. Backend integration is the remaining work.

## Limitations

- All tabs are placeholders pending backend integration (WebSocket, Grafana, terminal exec).
- Requires orchestrator connection; no offline or standalone mode.
- Single-user only; no concurrent scenario support yet.
- No authentication; relies on network isolation for access control.

## Summary

The v2 UI is a control surface for the orchestrator's scenario engine. The persistent sidebar plus tabbed workspace teaches efficient tool navigation. The updates feed teaches triage and communication. The OODA loop structure teaches systematic debugging. The UI renders the experience; the orchestrator controls it. This separation keeps the frontend simple and the training logic centralized.