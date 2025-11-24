# ObservaStack - Docker Compose Configuration

The project uses a modular Docker Compose structure with separate stacks for flexible deployment.

## Structure

```
ObservaStack/
├── docker-compose.yml                      # Root orchestrator (includes all stacks below)
└── deploy/docker/
    ├── docker-compose.networks.yml         # Network definitions (shared by all stacks)
    ├── docker-compose.sut.yml              # System Under Test
    ├── docker-compose.observability.yml    # Monitoring & Tracing
    ├── docker-compose.locust.yml           # Load Testing (optional)
    ├── .env.local                          # Local environment config
    └── .env.cloud.example                  # Cloud template
```

## Quick Start

### Local Development
```bash
# From project root - starts all stacks
docker-compose --env-file deploy/docker/.env.local up -d

# Or use defaults
docker-compose up -d
```

### Cloud Deployment
```bash
# Configure for your infrastructure
cp deploy/docker/.env.cloud.example deploy/docker/.env.cloud
# Edit .env.cloud with actual IP addresses

# Deploy
docker-compose --env-file deploy/docker/.env.cloud up -d
```

## Environment Variables

Key variables defined in `.env.local` or `.env.cloud`:

**SUT Configuration:**
- `GATEWAY_HOST` - Gateway hostname/IP
- `BACKEND_HOST` - Backend hostname/IP  
- `GUNICORN_WORKERS` - Number of Gunicorn workers

**Observability Configuration:**
- `PROMETHEUS_HOST`, `TEMPO_HOST`, `PYROSCOPE_HOST` - Service hostnames/IPs
- Port configurations for all services

**Load Testing:**
- `SUT_HOST` - Target URL for load tests
- `LOCUST_WORKERS` - Number of Locust worker replicas

## Running Individual Stacks

```bash
# From project root
# Start only observability stack (with networks)
docker compose -f deploy/docker/docker-compose.networks.yml -f deploy/docker/docker-compose.observability.yml up -d

# Start only SUT (with networks)
docker compose -f deploy/docker/docker-compose.networks.yml -f deploy/docker/docker-compose.sut.yml up -d

# Start with Locust (uses profile)
docker compose --env-file deploy/docker/.env.local --profile locust up -d
```

## Network Architecture

- **observastack-observability** - Observability stack network
- **observastack-sut** - SUT internal network
- **observastack-locust** - Load testing network

Prometheus is connected to both observability and sut networks to allow metrics collection while maintaining separation.

## Benefits

1. **Resource Isolation** - Separate stacks can run on different machines
2. **Flexible Deployment** - Deploy only what you need
3. **Cloud Ready** - Easy to configure for distributed infrastructure
4. **Environment Parity** - Same compose files work locally and in cloud with different `.env` files
