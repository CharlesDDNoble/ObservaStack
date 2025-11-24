# ObservaStack

A one-command reliability engineer training simulator for improving system debugging skills.

## What it is

ObservaStack is a platform for learning core system ownership and operational health skills, featuring:

- **System Under Test (SUT)**: A reverse proxy (Nginx) fronting a multi-process API server (FastAPI) instrumented to generate metrics, logs, and traces.
- **Scenario Control Panel**: Web UI for launching scenarios, querying the SUT, and accessing observability tools.
- **Integrated Load Generator**: A system for creating repeatable load patterns (Locust) to simulate realistic traffic.
- **Full observability**: Prometheus metrics, Loki logs, Tempo traces, Pyroscope profiles, and Grafana Dashboards—the same tools SREs use in production
- **Easy Deployment**: Run locally with docker or on GCP with terraform and connect securely with IAP Tunnels. 

Once you clone the repository you can have a monitored system running in minutes. Test it, break it, fix it, and learn.

## Why it was made

Learning incident response the traditional way means waiting for production systems to break—which is stressful, high-stakes, and offers no chance to practice. Tutorials and toy examples don't prepare you for real debugging because they lack the complexity and observability of production systems.

ObservaStack bridges this gap by providing:

- **Realistic failures**: Configuration regressions, resource exhaustion, dependency failures, retry amplification—not just "container crashed".
- **Safe practice environment**: Break things, try fixes, learn from mistakes without impacting real users.
- **Pre-configured Dashboards**: Golden Signals monitoring (Latency, Errors, Traffic, Saturation) ready out of the box to help build intuition for reasoning about system health.
- **Repeatable scenarios**: Same failure pattern every time, enabling deliberate practice and skill assessment. 
- **Easily Extendable**: Create test scenarios composed of specific load patterns, system configurations, and hints to provide to the user.

Whether you're preparing for oncall, interviewing for SRE roles, or training a team, ObservaStack lets you build operational skills before production incidents demand them. 

See [user journeys](docs/user-journeys.md) for the targeted use cases.

## Quick Start

The entire project can be run on your home computer or in the cloud, see the following sections for getting started.

### Resource Requirements

**Minimum:**

+ CPU: 1 Core on a modern architecture.
+ RAM: 2 GiB

**Recommended:**

+ CPU: 2 Cores on a modern architecture.
+ RAM: 4 GiB

### Local Deployment (Your Computer)

Deploy the stack on a local machine.

**Requires:**

1. [Docker Desktop](https://www.docker.com/products/docker-desktop) (or Docker Engine + Docker Compose)
2. [Git](https://git-scm.com/download/win) to clone the repository

**Instructions:**

```bash
# Clone and start the stack
git clone https://github.com/CharlesDDNoble/ObservaStack.git
cd ObservaStack
docker compose --env-file deploy/docker/.env.local up -d

# Control Panel:    http://localhost
# Grafana:          http://localhost:3000 (admin/admin)
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

See [deploy/terraform/README.md](deploy/terraform/README.md) for detailed GCP deployment instructions and configuration options.

## How it works

See [Acknowledgements](#acknowledgements) for links to the technologies used.

### Components

1. **The SUT**: A common production-grade application stack (Nginx/FastAPI/Gunicorn).
1. **The Observability Stack**: Industry standard observability pipeline (Grafana/Prometheus/Loki/Tempo/Pyroscope).
1. **The Control Plane**: A system for orchestrating test scenarios with a modern UI Control Panel (React/tailwindCSS/shadcn).
1. **The Load Generator**: A load generator (Locust) for reliably triggering specific load patterns on the SUT.
1. **Deployment**: Platform agnostic and cloud native (Docker/Terraform). 

The "dev" deployment spins up the stack on your local machine and the "production" deployment creates two virtual machines to isolate the control and observability components from the SUT to reduce resource contention and measurement accuracy of the SUT.

![Architecture Diagram](docs/simple-diagram.png)

For a more detailed layout view the [detailed architecture](docs/detailed-diagram.png).

Built with security in mind following the principles of zero trust and least access, check out the security and networking model in [secure architecture](docs/secure-architecture.md) for more details.

### Project Structure

```
ObservaStack/
├── control/                    # Control plane components
│   ├── frontend/               #     Frontend Control Panel
│   ├── orchestrator/           #     Scenario Orchestrator and system manager
│   └── gateway/                #     Control Gateway (serves frontend & routes requests)
├── sut/                        # System Under Test (the system being monitored)
│   ├── application/            #     Gunicorn/FastAPI API Server
│   ├── controller/             #     Control Agent for executing privileged commands
│   ├── secure-gateway/         #     Forwards commands from orchestrator to the controller     
│   ├── observability-gateway/  #     Forwards telemetry traffic to APIServer / Gateway Status exporter
│   └── sut-gateway/            #     Forwards user path traffic to the API Server
├── observability/              # Prometheus, Loki, Grafana, Tempo, Pyroscope configs
├── testing/                    # Locust load testing suite
├── deploy/                     # Deployment configurations
│   ├── docker/                 #   Docker Compose files for local deployment
│   └── terraform/              #   GCP deployment with Terraform + IAP for securing the connection
├── docker-compose.yml          # Root docker compose file
└── docs/                       # Architecture diagrams and design docs
```

## Demos

### Control Panel

![Control Panel](docs/demo.gif)

## Principles

The following high level themes guide the development of the project, each modification and feature should be made with them in mind:

1.  **Accessible**
    * **What:** The project should be easy to start with and intuitive to use.
    * **Why:** To accelerate user adoption and gather essential feedback for iteration.
    * **How:** Through an open-source model focused on a fast, simple setup

2.  **Applicable**
    * **What:** The project must teach in-demand, market-relevant skills.
    * **Why:** To equip users with practical, real-world abilities they can apply immediately.
    * **How:** By focusing on industry-standard tools and modern best practices.

3.  **Universal**
    * **What:** The project teaches foundational concepts that are transferable across any technology stack or problem domain.
    * **Why:** To provide enduring knowledge that outlasts any single tool and empowers users to adapt to future technologies.
    * **How:** By focusing on core system design patterns and first-principles thinking.

### Acknowledgements

**All AGPL components are being used via unmodified, official images.**

This project is built on the shoulders of incredible open-source tools. A huge thank-you to the teams and communities behind:

### The Observability Stack

* **[Grafana](https://grafana.com/)**: (License: **AGPLv3**): [License Text](https://www.gnu.org/licenses/agpl-3.0.en.html)
* **[Loki](https://grafana.com/oss/loki/)**: (License: **AGPLv3**): [License Text](https://www.gnu.org/licenses/agpl-3.0.en.html)
* **[Tempo](https://grafana.com/oss/tempo/)**: (License: **AGPLv3**): [License Text](https://www.gnu.org/licenses/agpl-3.0.en.html)
* **[Pyroscope](https://grafana.com/oss/pyroscope/)**: (License: **AGPLv3**): [License Text](https://www.gnu.org/licenses/agpl-3.0.en.html)
* **[Prometheus](https://prometheus.io/)**: (License: **Apache 2.0**): [License Text](https://www.apache.org/licenses/LICENSE-2.0)

### The Application Stack

* **[React](https://reactjs.org/)**: (License: **MIT**): [License Text](https://opensource.org/licenses/MIT)
* **[FastAPI](https://fastapi.tiangolo.com/)**: (License: **MIT**): [License Text](https://opensource.org/licenses/MIT)
* **[Nginx](https://www.nginx.com/)**: (License: **2-Clause BSD**): [License Text](https://opensource.org/licenses/BSD-2-Clause)
* **[Gunicorn](https://gunicorn.org/)**: (License: **MIT**): [License Text](https://opensource.org/licenses/MIT)

### The Frontend UI

* **[Tailwind CSS](https://tailwindcss.com/)**: (License: **MIT**): [License Text](https://opensource.org/licenses/MIT)
* **[shadcn/ui](https://ui.shadcn.com/)**: (License: **MIT**): [License Text](https://opensource.org/licenses/MIT)
* **[Apache ECharts](https://echarts.apache.org/)**: (License: **Apache 2.0**): [License Text](https://www.apache.org/licenses/LICENSE-2.0)

### The Testing & Deployment Suite

* **[Locust](https://locust.io/)**: (License: **MIT**): [License Text](https://opensource.org/licenses/MIT)
* **[Docker](https://www.docker.com/)**: (License: **Apache 2.0**): [License Text](https://www.apache.org/licenses/LICENSE-2.0)
* **[Terraform](https://www.terraform.io/)**: (License: **Business Source License**): [License Text](https://github.com/hashicorp/terraform/blob/main/LICENSE)

## Contributing

Suggestions are welcome and encouraged, but the project is currently closed for contributions for the time being.

## License and Compliance

This project is licensed under the **AGPLv3 License**.

* The full text of the AGPLv3 license can be found in the **[LICENSE](LICENSE)** file.
* For compliance with the licenses (MIT, Apache 2.0, AGPLv3, etc.) of all third-party components used, please refer to the **[NOTICE](NOTICE)** file for required copyright and license acknowledgments.

## A Word from the author

Share this, learn from it, and teach others!
