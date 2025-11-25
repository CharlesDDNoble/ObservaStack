# ObservaStack - Deployment Configuration

The project uses a modular Docker Compose structure with separate stacks organized in the `deploy/docker/` folder.

## Stack Files

- **`../docker-compose.yml`** - Main orchestrator (root) that includes all stacks
- **`docker/docker-compose.networks.yml`** - Network definitions (observability, sut, locust networks)
- **`docker/docker-compose.sut.yml`** - System Under Test (Backend, Gateway, Nginx Exporter)
- **`docker/docker-compose.observability.yml`** - Observability stack (Prometheus, Grafana, Loki, Tempo, Pyroscope, Promtail)
- **`docker/docker-compose.locust.yml`** - Load testing stack (Locust master/workers with profile)

## Environment Configuration

### Local Deployment
```bash
# From project root
docker compose --env-file deploy/docker/.env.local up -d
```

### Cloud Deployment (Google's Computers)

Deploy to Google Cloud Platform (GCP) with Terraform, creating two virtual machines (VMs) to run the project on.

**Requires:**

1. Git (to clone the repository)
1. [Terraform](https://www.terraform.io/downloads) (v1.0+) Or install via package manager (Scoop, Homebrew, etc.)
1. [gcloud CLI](https://cloud.google.com/sdk/docs/install) (Google Cloud SDK) for auth and IAP access.
1. GCP Account with billing enabled

**Estimated Cloud Cost:** 

Running the default two c4a-standard-1 setup would cost roughly $0.05/hour per VM (around $30/month per vm). If a scenario takes an hour, then you can run a single scenario for just 10 cents. Just make sure to clean up the project when you're done to excess avoid costs.

Note: GCP often offers a credit for new projects, so **you may be able to run the project for free**. Be aware that cloud costs fluctuate, so **these numbers are subject to change**.

**Instructions:**

```bash
git clone https://github.com/CharlesDDNoble/ObservaStack.git
cd ObservaStack
cd deploy/terraform

# Configure your project
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your GCP project details

# Deploy
terraform init
terraform apply

# Access via IAP tunnels. This keeps your ObservaStack isolated from 
# the internet so that only you can interact with it on your computer.
# Type localhost:80 into your browser to access the Control Panel.
gcloud compute start-iap-tunnel observastack 80 --local-host-port=localhost:80 --zone=us-central1-a

# Type localhost:3000 into your browser to access the Grafana server.
gcloud compute start-iap-tunnel observastack 3000 --local-host-port=localhost:3000 --zone=us-central1-a

# Clean up the project when you're done to avoid excess costs.
terraform destroy
```

## Environment Variables

Key variables defined in `docker/.env.local` or `docker/.env.cloud`:

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
# Start only observability stack
docker compose -f deploy/docker/docker-compose.networks.yml -f deploy/docker/docker-compose.observability.yml up -d

# Start only SUT
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
