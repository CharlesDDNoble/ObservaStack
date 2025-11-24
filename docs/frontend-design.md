```markdown
# Overview

The UI is an **SRE Incident Response Workbench**, a multi-view application designed to guide a trainee through a complete debugging workflow (the OODA loop) in response to a simulated incident.

The interface uses a **persistent sidebar + tabbed workspace layout**:
- **Left Sidebar (Incident):** Always visible, provides incident context and control
- **Right Workspace (User | Observability | Test):** Tabbed views for investigation and remediation

This mirrors real incident response where you maintain situational awareness (comms channel, incident ticket) while switching between investigation tools.

---

## Layout Structure

```
┌──────────────┬─────────────────────────────────────────┐
│              │  [ User | Observability | Test ]        │
│   Incident   │                                          │
│   ────────   │                                          │
│              │         Active Tab Content               │
│   Scenario:  │                                          │
│   High       │                                          │
│   Latency    │                                          │
│              │                                          │
│   Status:    │                                          │
│   ● Active   │                                          │
│              │                                          │
│   Time:      │                                          │
│   03:42      │                                          │
│              │                                          │
│   Updates:   │                                          │
│   ┌────────┐ │                                          │
│   │ 03:15  │ │                                          │
│   │ New... │ │                                          │
│   └────────┘ │                                          │
│              │                                          │
│   [Stop]     │                                          │
│              │                                          │
└──────────────┴─────────────────────────────────────────┘
     ~280px                    Remaining width
```

---

## Left Sidebar: Incident (Persistent Context)

**Purpose:** Maintain situational awareness throughout the investigation. Acts as your "incident command post" - always visible, always current.

### Key Components

**1. Incident Overview**
- **Scenario Name:** Clear title (e.g., "High Latency," "Memory Leak")
- **Status Indicator:** Visual state (Active, Resolved, Failed)
- **Elapsed Time:** Running timer showing investigation duration
- **Description:** Brief context (e.g., "Users reporting slow page loads")

**2. Success Criteria**
- Clear definition of "resolved" (e.g., "P95 latency < 200ms for 2 minutes")
- Real-time progress indicator toward resolution

**3. Incident Updates (Feed)**
- **Purpose:** Real-time stream of hints, status changes, and system events
- **Mimics:** Slack notifications, PagerDuty updates, team communications
- **Content Types:**
  - **Hints/Guidance:** "Consider checking error rates" (system-pushed)
  - **System Events:** "Service scaled to 3 replicas"
  - **Metric Changes:** "P95 latency improved to 180ms"
  - **Stakeholder Questions:** "Manager: ETA on resolution?" (simulated pressure)
  
**Update Feed Behavior:**
- Reverse chronological order (newest at top)
- Timestamp on each update
- Visual differentiation by type:
  - 💡 Hints (subtle, helpful guidance)
  - 🔔 System events (neutral, factual)
  - 📊 Metric changes (data-driven)
  - 👤 Stakeholder messages (adds realism)
- Unread indicator (dot or count) when new updates arrive
- Scrollable if many updates (fixed height with scroll)
- Fade-in animation for new updates (draws attention)

**Progressive Disclosure System:**
- Hints pushed based on:
  - Time elapsed (e.g., hint after 2 minutes of no progress)
  - Investigation path (e.g., if checking wrong service)
  - Scenario stage (e.g., escalating clues)
- Can be disabled for "hard mode"

**4. Controls**
- **Stop Scenario:** End current investigation
- **Restart:** Reset to initial state
- **Request Hint:** Manual trigger for next hint (optional, costs "points")

**5. Scenario Selection (When Idle)**
- List of available scenarios
- "Start Scenario" button to begin new incident

### Design Notes
- Width: ~250-300px (readable without wasting horizontal space)
- Always visible (no collapse/hide)
- Updates feed should be prominent but not overwhelming
- Consider: Collapsible sections (e.g., success criteria can collapse when understood)

---

## Right Workspace: Tabbed Investigation Views

### Tab 1: User (The Symptom)

**Purpose:** **Observe** the initial symptom and understand business impact. Answers "why do we care?"

### Key Components

**Visual Impact Display:**
- **Option A:** Live feed of simulated user requests
  ```
  ✓ Page loaded (180ms)
  ✓ Page loaded (220ms)
  ✗ Page failed (5.4s) - 503 Error
  ✗ Page failed (timeout)
  ✓ Page loaded (195ms)
  ```

- **Option B:** Business metrics dashboard
  - Success rate graph (e.g., "97% → 92%")
  - Customer satisfaction indicator
  - Service availability percentage

**Design Philosophy:**
- Non-technical language (what users experience, not what servers report)
- Immediate visibility of impact severity
- Updates in real-time as incident progresses

---

### Tab 2: Observability (The Evidence)

**Purpose:** **Observe** system data and **Orient** by forming a hypothesis. Primary investigation hub.

### Key Components

**Embedded Grafana View:**
- Option A: Clean iframe of Grafana dashboards
- Option B: Custom visualization layer with Grafana data

**Pre-configured Dashboards:**
- Golden Signals overview (Latency, Errors, Traffic, Saturation)
- Service-specific dashboards
- Quick links to:
  - Logs (Loki)
  - Traces (Tempo)
  - Profiles (Pyroscope)

**Implementation Considerations:**
- Authentication handling for embedded view
- Deep linking to specific time ranges
- Balance: Full Grafana power vs. curated learning experience

**Design Notes:**
- Maximize vertical space for dashboards
- Minimal chrome/padding
- Consider: Quick filter bar for common queries

---

### Tab 3: Test (The Toolkit)

**Purpose:** **Decide** on a course of action and **Act** on the system. The workbench for remediation.

### Key Components

**Three Sub-sections (Vertical Tabs or Accordion):**

**1. API Explorer**
- Manual endpoint testing (current "Test" functionality)
- Select endpoint → Configure parameters → Send request
- View response and impact on metrics

**2. Diagnostics**
- Pre-defined diagnostic scripts
  - "Check service health"
  - "Analyze recent errors"
  - "Review resource usage"
- Progressive disclosure: hints → scripts → results
- Balance: Guided learning vs. open exploration

**3. Terminal**
- Web-based terminal for container exec
- Direct system access for advanced investigation
- Real command-line experience

**Design Philosophy:**
- Order by learning progression (API → Scripts → Terminal)
- Each tool teaches different debugging skill
- Clear feedback on action outcomes

---

## Navigation Behavior

**Tab Switching:**
- Tabs persist state when switching
- Quick keyboard shortcuts (e.g., 1/2/3 keys)
- Current tab highlighted

**Scenario Changes:**
- Stay on current tab when scenario changes
- OR: Auto-switch to User tab on scenario start (show symptom first)
- Sidebar updates without disrupting workspace

**Incident Updates Integration:**
- New update appears in sidebar with animation
- Optional: Toast notification in workspace (dismissible)
- Unread badge on sidebar if user is deep in Grafana
- Consider: Audio ping for critical updates (configurable)

**Multi-view Support:**
- Primary use case: Single monitor with tool + comms channel in separate window
- Advanced: Small "pop-out" icon to float a tab (for multi-monitor setups)
- Accept: Users may open Grafana in separate browser tab for true side-by-side

---

## Information Flow (OODA Loop Mapping)

1. **Observe (Initial):** Start scenario → User tab shows symptom
   - Incident Update: "03:00 - Incident started: Users reporting slow page loads"
2. **Observe (Deep):** Switch to Observability → Examine dashboards/logs
   - Incident Update: "03:02 - Hint: Check error rates across all services"
3. **Orient:** Form hypothesis based on evidence
4. **Decide:** Switch to Test → Choose diagnostic approach
   - Incident Update: "03:05 - System: API health check completed"
5. **Act:** Execute test/fix → Observe results
   - Incident Update: "03:07 - Metric: P95 latency decreased to 180ms"
6. **Loop:** Return to Observability/User to validate
   - Incident Update: "03:08 - Hint: Verify error rate has stabilized"
7. **Resolution:** Sidebar shows success criteria met
   - Incident Update: "03:10 - ✓ Incident resolved: All metrics within SLO"

---

## Incident Update Examples

### Types of Updates

**1. Scenario Start/End**
```
03:00 - 🚨 Incident started: High latency detected
03:10 - ✅ Incident resolved: All systems nominal
03:10 - 📊 Resolution time: 10m 23s
```

**2. Hints (Progressive Disclosure)**
```
03:02 - 💡 Hint: Start by checking the Golden Signals dashboard
03:05 - 💡 Hint: Look for services with elevated error rates
03:08 - 💡 Hint: Consider recent deployments in the last hour
```

**3. System Events**
```
03:03 - 🔔 User action: Health check executed on api-service
03:06 - 🔔 System: Service scaled from 2 to 3 replicas
03:07 - 🔔 Configuration: Cache timeout increased to 60s
```

**4. Metric Changes**
```
03:04 - 📊 P95 latency: 450ms → 380ms (improving)
03:09 - 📊 Error rate: 5.2% → 0.8% (improving)
03:10 - 📊 CPU utilization: 85% → 60% (normal)
```

**5. Simulated Stakeholder Pressure (Optional)**
```
03:05 - 👤 Manager: "Any updates? Customers are complaining."
03:08 - 👤 Support: "Tickets are coming in fast. Need ETA."
03:10 - 👤 Manager: "Nice work! Send a summary for the postmortem."
```

### Update Delivery Logic

**Trigger Mechanisms:**
- **Time-based:** Hints delivered at specific intervals
- **Action-based:** System events when user takes action
- **Metric-based:** Alerts when key metrics cross thresholds
- **Progress-based:** Escalating hints if no progress detected
- **Completion-based:** Summary and next steps on resolution

**Adaptive Difficulty:**
- Beginner mode: Frequent, detailed hints
- Intermediate: Sparse hints, only when stuck
- Expert: Minimal hints, or disable entirely

---

## Design Principles

1. **Persistent Context:** Sidebar provides constant situational awareness
2. **Minimal Context Switching:** Tabs keep investigation tools one click away
3. **Real-world Fidelity:** Layout mirrors actual incident response patterns
4. **Progressive Complexity:** Each tab teaches different skill level
5. **Clear Feedback:** Every action shows observable system response
6. **Realistic Communication:** Updates feed simulates real incident coordination

---

## Implementation Priority

1. **Incident Sidebar - Core** (scenario info, status, controls)
2. **Incident Updates Feed** (hint delivery system)
3. **Observability Tab** (core value proposition)
4. **Test Tab - API Explorer** (reuse existing functionality)
5. **User Tab** (context/motivation)
6. **Test Tab - Diagnostics** (guided learning)
7. **Test Tab - Terminal** (advanced users)
8. **Update Intelligence** (adaptive hint system based on user behavior)

---

## Technical Considerations

**Incident Updates Backend:**
- WebSocket or SSE for real-time push
- Scenario definition includes update timeline
- Logic for conditional hints based on user actions
- Logging of all updates for post-mortem review

**Update Persistence:**
- Full incident timeline available for review after completion
- Can replay investigation to see what was known when
- Export timeline for sharing/training

---

## Open Questions

- Should Incident sidebar collapse on small screens? (Mobile support priority?)
- How much of the investigation log should be automated vs. manual?
- Should there be a "Debrief" view after scenario completion for post-mortem practice?
- Can users "reply" to updates (e.g., acknowledge stakeholder message)?
- Should updates be dismissible or permanently visible in timeline?
- Toast notifications for updates: always, configurable, or never?
```