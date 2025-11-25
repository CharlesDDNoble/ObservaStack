# ObservaStack Secure Architecture Blueprint

This document defines the production network and security model for the two-host ObservaStack architecture, adhering to **Zero Trust** principles and a strong **Separation of Concerns** via dedicated security channels.

## I. Architectural Layout and Service Identity

The system is deployed across two physically isolated GCE instances, each with a dedicated Service Account (SA) enforcing the **Principle of Least Privilege (PoLP)**.

| Host Name | Primary Role | Host IP Role | GCP Identity (Service Account) |
| :--- | :--- | :--- | :--- |
| **Test/Control Host** | **Operator** (Initiates commands, scrapes data, serves UI). | **Traffic Source** | `vm-control-test-sa` |
| **SUT Host** | **Target** (Runs the system under test). | **Traffic Destination** | `vm-sut-backend-sa` |

---

## II. Secure Communication Channels (Three-Gateway Model)

The SUT Host exposes three logically separate ingress channels to manage the distinct security requirements for User Data, Critical Commands, and Diagnostic Data.

| Channel | SUT Host Port | Primary Traffic Flow | Security Enforcement |
| :--- | :--- | :--- | :--- |
| **1. User Data Plane** | 80/443 | External User $\rightarrow$ Public Nginx | External Auth (IAP/Load Balancer) |
| **2. Control Plane** | **8000** | Orchestrator $\rightarrow$ Control Gateway | **L7 JWT Validation (Highest Security)** |
| **3. Telemetry Ingress** | **9091** | Prometheus Scrape $\rightarrow$ Telemetry Gateway | **L4 VPC Firewall Filtering (Resilience)** |

---

## III. Security and Networking Workflow

### A. Core Security Mechanism: GCE Identity (JWT)

All internal authentication is rooted in the GCE Instance Identity Token (IID JWT), ensuring **Code Parity** between local development (using Vault) and production (using the MDS).

1.  **Orchestrator Action:** The Orchestrator (on the Test/Control Host) retrieves a short-lived **IID JWT** from its local Metadata Server.
2.  **Binding:** The JWT's `audience` (`aud`) claim is strictly set to the SUT Host's API address.
3.  **Validation:** The Control Gateway (on Port 8000) validates the JWT signature and verifies the `aud` claim, ensuring the request is genuine and intended for this specific host.

### B. Ingress Security (VPC Firewall Rules)

The VPC Firewall is the primary security gate, enforcing segmentation and PoLP for the two internal channels based on the source's SA.

| Destination Port (SUT Host) | Source Service Account | Access Policy | Rationale |
| :--- | :--- | :--- | :--- |
| **8000 (Control)** | **`vm-control-test-sa`** | **ALLOW** | Only the trusted Orchestrator can attempt to send commands. |
| **9091 (Telemetry)** | **`vm-control-test-sa`** | **ALLOW** | Only the trusted Observability stack can scrape metrics, ensuring data resilience. |
| **Other Ports** | Any External Source | **DENY** | Blocks all other access attempts from external IPs. |

### C. The Control Channel Flow (Port 8000)

1.  **Traffic:** Orchestrator (Test Host) sends command.
2.  **Enforcement:** VPC Firewall allows traffic (based on SA).
3.  **Gateway:** **Control Nginx** validates the **IID JWT**.
4.  **Backend:** Request is proxied to the Control Agent's application logic.

### D. The Telemetry Channel Flow (Port 9091)

1.  **Traffic:** Prometheus (Test Host) sends a scrape request.
2.  **Enforcement:** VPC Firewall allows traffic (based on SA).
3.  **Gateway:** **Telemetry Nginx** acts as a **simple reverse proxy**, forwarding traffic to the internal metrics process (e.g., Container Port 9091). *No L7 JWT check is performed here* to maximize throughput.

### E. Outbound/Egress Traffic (Push Model)

The SUT Backend Container actively initiates connections to send diagnostic data:

| Data Type | SUT Host Container Action | Destination Host/Service |
| :--- | :--- | :--- |
| **Traces** | Application code pushes data out. | Tempo Collector (on Test/Control Host) |
| **Profiles** | Application code pushes data out. | Pyroscope Server (on Test/Control Host) |

The SUT VM's **Egress Firewall Rules** must be strictly configured to **only** allow traffic destined for the known IP addresses and ports of the Tempo and Pyroscope collectors, preventing data exfiltration to unauthorized external sites.

---

## IV. Local Development

The local model maintains **Code Parity** by substituting the cloud identity source with a functional equivalent.

| GCP Component | Local Docker Equivalent | Security Goal Achieved |
| :--- | :--- | :--- |
| **GCE MDS** | **HashiCorp Vault (Dev Mode)** | Provides a local, dynamic source for short-lived tokens. |
| **VPC Firewall** | **Internal Docker Network** (`control_tier`) | Enforces network isolation between the containers. |
| **Process Control** | **Shared PID Namespace** | Enables secure, non-networked signal communication for process commands. |