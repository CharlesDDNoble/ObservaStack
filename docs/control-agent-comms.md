# Problem Statement
ObservaStack needs secure control over the SUT Backend's process lifecycle (signals) and application state (configuration) without exposing the Docker socket. Admin endpoints must be isolated from public traffic to prevent accidental misconfiguration during training scenarios. The control plane must recover automatically from backend restarts with eventual consistency.

# Proposed Solution
Implement a two-channel control architecture: shared PID namespaces for process signals and API key-authenticated HTTPS over isolated Docker networks for runtime configuration. The Control Agent monitors backend health and self-exits on restart, automatically rebinding to the new PID namespace via Docker's restart policy.

## Implementation Details

### 1. API Key Generation (One-Time Setup)
A dedicated init container runs once via docker-compose to generate a random API key using `openssl rand -base64 32`. The key is written to a shared volume and the init container exits. Both the SUT Backend and Control Agent mount this volume read-only at startup to load the shared key.

### 2. Process Control Channel (PID Namespace)
The SUT Backend exposes a shareable PID namespace that the Control Agent joins at startup using Docker Compose's `pid` configuration. The Agent sends signals (SIGHUP, SIGTERM, SIGKILL) directly to Gunicorn without Docker socket access. PID namespace membership provides authorization—only processes in the namespace can send signals. Resource limits on both containers ensure the Agent remains responsive during backend thrashing.

### 3. Application Control Channel (Authenticated HTTPS)
An isolated `control_tier` Docker network (marked internal) connects only the SUT Backend and Control Agent. The Backend serves a single FastAPI application on port 8000 exposed on both `public_tier` and `control_tier` networks. Public endpoints (`/api/*`) are open to load generators. Admin endpoints (`/config/*`) require `X-API-Key` header validation matching the generated key. Network isolation prevents external access to the control plane, while API key validation prevents load generators from accidentally calling admin endpoints.

### 4. Shared Fate Lifecycle Management
The Control Agent periodically checks Gunicorn PID visibility using `pidof` or `/proc` inspection. When the backend restarts and destroys the PID namespace, the Agent detects the missing process and exits with non-zero code. Docker's restart policy (`restart: unless-stopped`) restarts the Agent, which rebinds to the new namespace via `depends_on` healthcheck dependencies. Control plane unavailability during restarts is acceptable (eventual consistency).

### 5. Network Isolation
The SUT Backend connects to both `control_tier` (internal, isolated) and `public_tier` networks. The Control Agent connects only to `control_tier`. Load generators and monitoring services on `public_tier` can access public endpoints but cannot reach `control_tier` to discover admin endpoints.

## Control Capabilities by Channel

**Process Control (PID Namespace):**
- Worker reload (SIGHUP)
- Graceful shutdown (SIGTERM)
- Force kill (SIGKILL)
- Log rotation (SIGUSR1)

Operations bypass the application layer for direct Gunicorn master process control. Signal delivery fails gracefully if PID namespace is invalid, triggering Agent self-exit.

**Application Control (HTTPS API):**
- Runtime configuration changes (rate limits, timeouts, connection pools, worker counts)
- Failure injection scenarios (artificial latency, error rates, resource exhaustion)
- Feature flag toggling
- Stateful application modifications

Operations are auditable through HTTP access logs and survive brief network interruptions via standard HTTP retry mechanisms.

## Security Model
- **PID namespace isolation** prevents signal delivery outside the Backend container
- **Network isolation** limits admin endpoint discovery to `control_tier` participants
- **API key authentication** blocks unauthorized configuration changes from public tier services
- **Read-only volume mounts** prevent runtime modification of API key
- No Docker socket access required

## Limitations
- Control plane unavailable during backend restarts (eventual consistency model)
- Agent may restart multiple times if backend startup is slow (mitigated by healthcheck dependencies)
- API key rotation requires init container re-run and container restarts
- Startup race condition possible if Agent starts before Backend healthcheck passes
- API key stored in plaintext on volume (acceptable for isolated training environments)

## Operational Characteristics
- **Simple failure modes:** Invalid API key errors are immediately obvious and easy to debug
- **No certificate expiry:** API keys don't expire unless manually rotated
- **Minimal dependencies:** Standard Docker features (networks, volumes, healthchecks, PID namespaces)
- **Training-friendly:** Students can inspect API key file, understand header-based auth, regenerate if volume is deleted