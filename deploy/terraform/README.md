# ObservaStack Terraform Configuration

This Terraform configuration deploys ObservaStack to a Google Cloud Platform (GCP) Compute Engine instance.

## Prerequisites

1. **GCP Account**: Active GCP account with billing enabled
2. **gcloud CLI**: Install from https://cloud.google.com/sdk/docs/install
3. **Terraform**: Install from https://www.terraform.io/downloads

## Setup

### 1. Authenticate with GCP

```bash
gcloud auth login
gcloud auth application-default login
```

### 2. Create a GCP Project (if needed)

```bash
gcloud projects create observastack-demo --name="ObservaStack Demo"
gcloud config set project observastack-demo
```

### 3. Enable Required APIs

```bash
gcloud services enable compute.googleapis.com
gcloud services enable iap.googleapis.com
```

### 4. Grant IAP Permissions

Grant yourself IAP tunnel access:

```bash
gcloud projects add-iam-policy-binding your-project-id \
    --member=user:your-email@gmail.com \
    --role=roles/iap.tunnelResourceAccessor
```

### 5. Configure Terraform Variables

Create a `terraform.tfvars` file (see terraform.tfvars.example in this directory):

```hcl
project_id = "your-gcp-project-id"
region     = "us-central1"
zone       = "us-central1-a"
instance_name = "observastack"
machine_type  = "e2-medium"
disk_size_gb  = 30

# Optional: Add SSH key for access
ssh_user       = "your-username"
ssh_public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAAB..."
```

## Deployment

### Project Structure

ObservaStack uses a modular Docker Compose architecture:
- `deploy/docker/docker-compose.networks.yml` - Network definitions
- `deploy/docker/docker-compose.observability.yml` - Grafana, Prometheus, Loki, Tempo, Pyroscope
- `deploy/docker/docker-compose.sut.yml` - System Under Test (backend + gateway)
- `deploy/docker/docker-compose.locust.yml` - Load testing stack (optional)
- `deploy/docker/.env.cloud` - Cloud deployment configuration (auto-generated)

The root `docker-compose.yml` includes all stacks for single-command deployment.

### Initialize Terraform

```bash
cd terraform
terraform init
```

### Plan the Deployment

```bash
terraform plan
```

### Apply the Configuration

```bash
terraform apply
```

Type `yes` when prompted. Deployment takes approximately 5-10 minutes.

### Get Connection Information

```bash
terraform output
```

This displays the IAP tunnel commands for accessing services.

## Accessing Services via IAP

The instance has **no public IP** - all access is through Identity-Aware Proxy tunnels. This provides secure, authenticated access without exposing services to the internet.

### SSH Access

```bash
gcloud compute ssh observastack --zone=us-central1-a --project=your-project-id --tunnel-through-iap
```

### Access Web Services

Create IAP tunnels to access web interfaces on your local machine:

**Grafana** (http://localhost:3000):
```bash
gcloud compute start-iap-tunnel observastack 3000 --local-host-port=localhost:3000 --zone=us-central1-a --project=your-project-id
```

**Application** (http://localhost:8080):
```bash
gcloud compute start-iap-tunnel observastack 80 --local-host-port=localhost:8080 --zone=us-central1-a --project=your-project-id
```

**Prometheus** (http://localhost:9090):
```bash
gcloud compute start-iap-tunnel observastack 9090 --local-host-port=localhost:9090 --zone=us-central1-a --project=your-project-id
```

**Pyroscope** (http://localhost:4040):
```bash
gcloud compute start-iap-tunnel observastack 4040 --local-host-port=localhost:4040 --zone=us-central1-a --project=your-project-id
```

Open these URLs in your browser while the tunnel is active. Press `Ctrl+C` to close the tunnel.

### Multiple Tunnels

Run multiple tunnels in separate terminal windows to access multiple services simultaneously.

## Accessing the Instance

### Via SSH (using IAP)

```bash
gcloud compute ssh observastack --zone=us-central1-a --tunnel-through-iap
```

Or use the command from `terraform output ssh_command`.

### Check Deployment Status

```bash
# SSH into the instance via IAP
gcloud compute ssh observastack --zone=us-central1-a --tunnel-through-iap

# Check if containers are running
sudo docker ps

# View startup logs
sudo journalctl -u observastack.service

# View Docker Compose logs
cd /opt/observastack
sudo docker compose --env-file deploy/docker/.env.cloud logs
```

## Accessing Services

After deployment completes (5-10 minutes), create IAP tunnels to access services. See the **Accessing Services via IAP** section above for tunnel commands.

Services will be available at:
- **Application**: http://localhost:8080 (tunnel port 80)
- **Grafana**: http://localhost:3000 (login: admin/admin)
- **Prometheus**: http://localhost:9090
- **Pyroscope**: http://localhost:4040

## Cost Estimation

**e2-medium instance** (default):
- 2 vCPUs, 4GB RAM
- ~$24.27/month (730 hours)
- ~$0.033/hour

*Approximate costs for us-central1

**Remember**: Always destroy resources when not in use to avoid charges.

## Destroying the Infrastructure

```bash
terraform destroy
```

Type `yes` when prompted. This removes all created resources.

### Firewall Rules

The configuration creates a single firewall rule allowing IAP access:
- Source: `35.235.240.0/20` (Google's IAP IP range)
- Ports: 22 (SSH), 80, 3000, 4040, 9090
- **No public internet access** - all traffic goes through IAP

This ensures:
- Services aren't exposed to the internet
- Access controlled by Google IAM
- Automatic audit logging
- No need to manage individual IPs or VPN

## Troubleshooting

### Deployment takes too long
```bash
# SSH into instance and check progress
gcloud compute ssh observastack --zone=us-central1-a
sudo journalctl -u observastack.service -f
```

### Containers not starting
```bash
# Check Docker status
sudo systemctl status docker
cd /opt/observastack
sudo docker compose --env-file deploy/docker/.env.cloud ps
sudo docker compose --env-file deploy/docker/.env.cloud logs
```

### Out of memory
Increase `machine_type` to e2-standard-2 (8GB RAM) in tfvars.

### Can't access services
```bash
# Verify IAP permissions
gcloud projects get-iam-policy your-project-id \
    --flatten="bindings[].members" \
    --filter="bindings.role:roles/iap.tunnelResourceAccessor"

# Check firewall rules
gcloud compute firewall-rules describe observastack-allow-iap

# Verify instance is running
gcloud compute instances describe observastack --zone=us-central1-a

# Test IAP tunnel
gcloud compute start-iap-tunnel observastack 3000 \
    --local-host-port=localhost:3000 \
    --zone=us-central1-a
```

## Updating the Deployment

To update the application code:

```bash
# SSH into the instance via IAP
gcloud compute ssh observastack --zone=us-central1-a --tunnel-through-iap

# Pull latest changes and rebuild
cd /opt/observastack
sudo git pull
sudo docker compose --env-file deploy/docker/.env.cloud down
sudo docker compose --env-file deploy/docker/.env.cloud up -d --build
```

## Security Considerations

1. **IAP Authentication**: Access controlled by Google identity - only authorized users can connect
2. **No Public IP**: Instance has no external IP, completely isolated from internet
3. **Change Grafana Password**: Default is admin/admin - change on first login
4. **IAM Policies**: Grant `roles/iap.tunnelResourceAccessor` only to trusted users
5. **Audit Logging**: IAP automatically logs all access attempts

## Advanced Configuration

### Custom Instance Labels

Add labels in `main.tf`:

```hcl
resource "google_compute_instance" "observastack" {
  # ... existing config ...
  
  labels = {
    environment = "demo"
    application = "observastack"
    managed_by  = "terraform"
  }
}
```

## Monitoring Costs

```bash
# View current month's costs
gcloud billing accounts list
gcloud billing projects describe your-project-id

# Set up budget alerts in GCP Console
# Billing > Budgets & alerts
```
