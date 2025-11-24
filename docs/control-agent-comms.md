# Problem Statement
ObservaStack needs secure control over the SUT Backend's process lifecycle (signals) and application state (configuration) without exposing the Docker socket. Admin endpoints must be isolated from public traffic to prevent accidental misconfiguration during training scenarios. The control plane must recover automatically from backend restarts with eventual consistency.

# Proposed Solution
Implement a two-channel control architecture: shared PID namespaces for process signals and JWT-authenticated HTTPS over isolated networks for runtime configuration. The Control Agent monitors backend health and self-exits on restart, automatically rebinding to the new PID namespace via Docker's restart policy.

## Deployment Contexts

This architecture supports both local development and production GCP deployment with code parity:

| Aspect | Local (Docker Compose) | GCP (Two-host) |
|--------|------------------------|----------------|
| Network | Docker internal networks | VPC with firewall rules |
| Authentication | JWT from Vault (dev mode) | JWT from GCE Metadata Server |
| Authorization | Network isolation | VPC firewall + Service Account |
| PID namespace | Shared within Docker Compose | Shared within SUT host containers |
| Control flow | Control Panel → Agent (secure-path) | Orchestrator → Agent (secure-path) |

**Critical invariant:** Control Agent MUST be co-located with SUT Backend on same host to share PID namespace for signal delivery. This is true for both deployments.

## Implementation Details

### 1. Process Control Channel (PID Namespace)
The SUT Backend exposes a shareable PID namespace that the Control Agent joins at startup using Docker Compose's `pid` configuration. The Agent sends signals (SIGHUP, SIGTERM, SIGKILL) directly to Gunicorn without Docker socket access. PID namespace membership provides authorization—only processes in the namespace can send signals. Resource limits on both containers ensure the Agent remains responsive during backend thrashing.

### 2. Application Control Channel (Authenticated HTTPS)
The SUT Backend exposes traffic through three isolated gateways:

- **user-path** (80/443): Public traffic to `/api/*` endpoints
- **secure-path**: Control plane traffic to `/config/*` endpoints (JWT required)
- **observability-path**: Metrics scraping to `/metrics` endpoint

**Authentication:**
- **Local:** Control Panel retrieves JWT from Vault (dev mode), includes in Authorization header
- **GCP:** Orchestrator retrieves JWT from GCE Metadata Server, includes in Authorization header
- Secure-path gateway validates JWT signature and audience claim
- Same validation code runs in both environments (code parity)

**Authorization:**
- Network isolation prevents external access to secure-path and observability-path
- JWT audience claim must match secure-path gateway endpoint
- User-path (`/api/*`) open to load generators via public network
- Secure-path (`/config/*`) requires valid JWT via isolated control network
- Observability-path (`/metrics`) accessible only from isolated control network

Operations are auditable through HTTP access logs and survive brief network interruptions via standard HTTP retry mechanisms.

### 3. Shared Fate Lifecycle Management
The Control Agent periodically checks Gunicorn PID visibility using `pidof` or `/proc` inspection. When the backend restarts and destroys the PID namespace, the Agent detects the missing process and exits with non-zero code. Docker's restart policy (`restart: unless-stopped`) restarts the Agent, which rebinds to the new namespace via `depends_on` healthcheck dependencies. Control plane unavailability during restarts is acceptable (eventual consistency).

### 4. Network Isolation
The SUT Backend exposes traffic through three isolated gateways. The Control Agent connects only to the control network and can access secure-path and observability-path. Load generators and monitoring services on the public network can access user-path but cannot discover or reach secure-path or observability-path.

## Control Capabilities by Channel

**Process Control (PID Namespace):**
- Worker reload (SIGHUP)
- Graceful shutdown (SIGTERM)
- Force kill (SIGKILL)
- Log rotation (SIGUSR1)

Operations bypass the application layer for direct Gunicorn master process control. Signal delivery fails gracefully if PID namespace is invalid, triggering Agent self-exit.

**Application Control (HTTPS API via secure-path):**
- Runtime configuration changes (rate limits, timeouts, connection pools, worker counts)
- Failure injection scenarios (artificial latency, error rates, resource exhaustion)
- Feature flag toggling
- Stateful application modifications

Operations are auditable through HTTP access logs and survive brief network interruptions via standard HTTP retry mechanisms.

## Security Model
- **PID namespace isolation** prevents signal delivery outside the Backend container
- **Network isolation** limits secure-path and observability-path discovery to control network participants  
- **JWT authentication** validates caller identity via cryptographic signatures on secure-path
- **Short-lived tokens** (5-minute TTL) minimize credential exposure window
- **Code parity** ensures local development uses same security model as production
- No Docker socket access required

## Limitations
- Control agent unavailable during backend restarts (eventual consistency model)
- Agent may restart multiple times if backend startup is slow (mitigated by healthcheck dependencies)
- JWT tokens expire after 5 minutes (requires token refresh for long-running operations)
- Startup race condition possible if Agent starts before Backend healthcheck passes
- Vault dev mode stores root token in memory (lost on restart, acceptable for local dev)

## Operational Characteristics
- **Simple failure modes:** Invalid JWT errors are immediately obvious and easy to debug
- **Automatic credential rotation:** Short-lived tokens refresh automatically
- **Minimal dependencies:** Standard Docker features (networks, healthchecks, PID namespaces)
- **Code parity:** Same validation logic in local and production deployments
- **Training-friendly:** Students learn production authentication patterns (JWT) instead of shortcuts

# Control Agent Design: Alternatives Considered

## Alternative 1: Docker Socket Access in Agent

**Description:** Mount `/var/run/docker.sock` into Control Agent container. Use Docker SDK to send signals, restart containers, and inspect state directly.

**Pros:** Simpler implementation. Agent survives backend restarts without rebinding. Can inspect container state and logs. No PID namespace complexity.

**Cons:** Grants root-equivalent access to host (Docker socket escape = full system control). Security anti-pattern—production control planes never get Docker socket access. Wrong pedagogical lesson—teaches shortcuts over proper privilege separation. Hides distributed systems complexity students need to learn. Breaks security model where Agent has narrow permissions.

**Why rejected:** Violates core teaching principle. Production systems (Kubernetes, Nomad, Google Borg) never give control planes root access. Teaching this pattern would train students to replicate security anti-patterns in production. ObservaStack exists to teach correct patterns, not convenient shortcuts. The security risk is pedagogically disqualifying.

---

## Alternative 2: Orchestrator Service with Docker Socket

**Description:** Introduce dedicated orchestrator service that owns Docker socket access. Control Panel calls orchestrator API, orchestrator executes docker-compose commands (restart, reload, scale).

**Pros:** Uses orchestration abstractions correctly (Docker Compose designed for orchestration). Cleaner mental model than PID namespace rebinding. Handles all scenarios uniformly (restart, reload, scale, logs). Isolates Docker socket access to single, auditable service.

**Cons:** Still requires root access (just moved to different container). Fundamental security problem unchanged—some service has Docker socket. Same pedagogical issue as Alternative 1. Adds architectural complexity (new service, new API). Teaches that orchestration components get privileged access.

**Why rejected:** Moving root access to different container doesn't solve the security anti-pattern—it just relocates it. Still teaches students that control planes get privileged access, which is wrong. The isolation benefit is minimal since orchestrator would be internal anyway. Adds complexity without addressing fundamental objection to Docker socket access.

---

## Alternative 3: HTTP Internal Endpoint for Signals

**Description:** Add internal HTTP endpoints on secure-path (`/config/reload`, `/config/restart`) to FastAPI application served by Gunicorn. Endpoints send signals to parent process (Gunicorn master) via `os.kill(os.getppid(), signal.SIGHUP)`. Use network isolation and JWT authentication to protect internal endpoints.

**Pros:** No PID namespace sharing required. No Docker socket access. Agent-free architecture (Control Panel calls endpoints directly). API-based control is auditable via HTTP logs. Works across network boundaries. Simpler deployment (fewer containers).

**Cons:** Requires running code in worker processes to signal master (architectural inversion). JWT authentication adds complexity. Network isolation still required. Cannot force-kill completely hung processes (if application frozen, HTTP endpoints don't respond). Tight coupling between application code and control plane.

**Why rejected:** Workers signaling their parent process is architecturally backwards. If application is truly wedged (infinite loop, deadlock, resource exhaustion), HTTP endpoints won't respond, eliminating emergency shutdown capability. Defeats purpose of external control plane. Mixes application concerns (serving user traffic) with lifecycle management (process control). Teaching students to build self-signaling applications is the wrong pattern—control should be external to the application being controlled.