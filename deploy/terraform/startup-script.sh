#!/bin/bash

# Setup logging
LOG_DIR="/tmp/observastack-startup"
LOG_FILE="$LOG_DIR/startup.log"
mkdir -p "$LOG_DIR"
chmod 777 "$LOG_DIR"

# Track if any errors occurred
HAS_ERRORS=0

# Function to log messages
log() {
    local level="$1"
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
    chmod 666 "$LOG_FILE" 2>/dev/null || true
    
    if [ "$level" = "ERROR" ]; then
        HAS_ERRORS=1
    fi
}

# Redirect all output to log file
exec > >(tee -a "$LOG_FILE")
exec 2>&1

log "INFO" "======== ObservaStack Startup Script Started ========"
log "INFO" "Script PID: $$"
log "INFO" "User: $(whoami)"
log "INFO" "Hostname: $(hostname)"
log "INFO" "System: $(uname -a)"

# Update system packages
log "INFO" "Updating system packages..."
apt-get update >> "$LOG_FILE" 2>&1 && log "INFO" "apt-get update completed" || log "ERROR" "apt-get update failed"
apt-get upgrade -y >> "$LOG_FILE" 2>&1 && log "INFO" "apt-get upgrade completed" || log "ERROR" "apt-get upgrade failed"

# Install Docker
log "INFO" "Installing Docker..."
apt-get install -y ca-certificates curl gnupg lsb-release >> "$LOG_FILE" 2>&1 && log "INFO" "Docker prerequisites installed" || log "ERROR" "Docker prerequisites installation failed"

install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg >> "$LOG_FILE" 2>&1 && log "INFO" "Docker GPG key installed" || log "ERROR" "Docker GPG key installation failed"
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update >> "$LOG_FILE" 2>&1 && log "INFO" "Docker repo added" || log "ERROR" "Docker repo addition failed"
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin >> "$LOG_FILE" 2>&1 && log "INFO" "Docker installed successfully" || log "ERROR" "Docker installation failed"

# Start Docker service
log "INFO" "Starting Docker service..."
systemctl enable docker >> "$LOG_FILE" 2>&1 && log "INFO" "Docker enabled" || log "ERROR" "Docker enable failed"
systemctl start docker >> "$LOG_FILE" 2>&1 && log "INFO" "Docker started" || log "ERROR" "Docker start failed"

# Verify Docker installation
log "INFO" "Verifying Docker installation..."
docker --version >> "$LOG_FILE" 2>&1 && log "INFO" "Docker version: $(docker --version)" || log "ERROR" "Docker verification failed"
docker compose version >> "$LOG_FILE" 2>&1 && log "INFO" "Docker Compose version: $(docker compose version)" || log "ERROR" "Docker Compose verification failed"

# Install Git
log "INFO" "Installing Git..."
apt-get install -y git >> "$LOG_FILE" 2>&1 && log "INFO" "Git installed" || log "ERROR" "Git installation failed"

# Clone the repository
log "INFO" "Cloning repository: ${github_repo}"
cd /opt
git clone ${github_repo} observastack >> "$LOG_FILE" 2>&1 && log "INFO" "Repository cloned successfully" || log "ERROR" "Repository clone failed"
cd observastack
log "INFO" "Repository location: $(pwd)"

# Create cloud environment file with modular docker-compose setup
log "INFO" "Creating .env.cloud configuration..."
cat > deploy/docker/.env.cloud <<EOF
# GCP Single-Instance Deployment Configuration
# All services run on the same host via modular docker-compose files

# Control Stack Configuration
CONTROL_GATEWAY_PORT=${control_gateway_port}

# SUT (System Under Test) Configuration
SUT_GATEWAY_PORT=${sut_gateway_port}
SUT_GATEWAY_HOST=sut-gateway
BACKEND_HOST=sut
GUNICORN_WORKERS=${gunicorn_workers}

# Observability Stack Configuration
PROMETHEUS_HOST=prometheus
PROMETHEUS_PORT=9090
GRAFANA_HOST=localhost
GRAFANA_PORT=3000
GRAFANA_USER=admin
GRAFANA_PASSWORD=admin
LOKI_HOST=loki
LOKI_PORT=3100
TEMPO_HOST=tempo
TEMPO_HTTP_PORT=3200
TEMPO_GRPC_PORT=4317
TEMPO_OTLP_PORT=4318
PYROSCOPE_HOST=pyroscope
PYROSCOPE_PORT=4040

# Load Testing Configuration (Locust)
SUT_HOST=http://sut-gateway:80
LOCUST_WEB_PORT=8089
LOCUST_WORKERS=2
EOF

log "INFO" "Environment file created"

# Build and start the stack using modular docker-compose files
log "INFO" "Building and starting Docker Compose stack..."
log "INFO" "Using docker-compose files:"
log "INFO" "  - docker-compose.networks.yml"
log "INFO" "  - docker-compose.sut.yml"
log "INFO" "  - docker-compose.control.yml"
log "INFO" "  - docker-compose.observability.yml"

cd /opt/observastack
docker compose \
  --env-file deploy/docker/.env.cloud \
  -f deploy/docker/docker-compose.networks.yml \
  -f deploy/docker/docker-compose.sut.yml \
  -f deploy/docker/docker-compose.control.yml \
  -f deploy/docker/docker-compose.observability.yml \
  up -d --build >> "$LOG_FILE" 2>&1

if [ $? -eq 0 ]; then
    log "INFO" "Docker Compose stack started successfully"
    log "INFO" "Running containers:"
    docker ps >> "$LOG_FILE" 2>&1
else
    log "ERROR" "Docker Compose stack startup failed"
    log "INFO" "Docker Compose output:"
    docker compose logs >> "$LOG_FILE" 2>&1
fi

# Create a systemd service to auto-start on reboot
log "INFO" "Creating systemd service..."
cat > /etc/systemd/system/observastack.service <<'SVCEOF'
[Unit]
Description=ObservaStack Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/observastack
ExecStart=/bin/bash -c 'docker compose --env-file deploy/docker/.env.cloud -f deploy/docker/docker-compose.networks.yml -f deploy/docker/docker-compose.sut.yml -f deploy/docker/docker-compose.control.yml -f deploy/docker/docker-compose.observability.yml up -d'
ExecStop=/bin/bash -c 'docker compose --env-file deploy/docker/.env.cloud -f deploy/docker/docker-compose.networks.yml -f deploy/docker/docker-compose.sut.yml -f deploy/docker/docker-compose.control.yml -f deploy/docker/docker-compose.observability.yml down'
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
SVCEOF

systemctl daemon-reload >> "$LOG_FILE" 2>&1 && log "INFO" "Systemd daemon reloaded" || log "ERROR" "Systemd daemon reload failed"
systemctl enable observastack.service >> "$LOG_FILE" 2>&1 && log "INFO" "Observastack service enabled" || log "ERROR" "Observastack service enable failed"

# Get public IP
PUBLIC_IP=$(curl -s ifconfig.me) || PUBLIC_IP="<unable to determine>"
log "INFO" "Public IP: $PUBLIC_IP"

log "INFO" "======== ObservaStack Deployment Complete ========"
log "INFO" "Access URLs:"
log "INFO" "  Control Panel: http://$PUBLIC_IP:${control_gateway_port}"
log "INFO" "  SUT API: http://$PUBLIC_IP:${sut_gateway_port}"
log "INFO" "  Grafana: http://$PUBLIC_IP:3000 (admin/admin)"
log "INFO" "  Prometheus: http://$PUBLIC_IP:9090"
log "INFO" "  Pyroscope: http://$PUBLIC_IP:4040"
log "INFO" "  Locust: http://$PUBLIC_IP:8089"
log "INFO" "Log file: $LOG_FILE"

echo ""
echo "======== ObservaStack Deployment Complete ========"
echo "Access the application at http://$PUBLIC_IP:${control_gateway_port}"
echo "SUT API: http://$PUBLIC_IP:${sut_gateway_port}"
echo "Grafana: http://$PUBLIC_IP:3000 (admin/admin)"
echo "Prometheus: http://$PUBLIC_IP:9090"
echo "Pyroscope: http://$PUBLIC_IP:4040"
echo "Locust: http://$PUBLIC_IP:8089"
echo "Log file: $LOG_FILE"

# Final status check
log "INFO" "======== Checking Final Status ========"
if [ $HAS_ERRORS -eq 1 ]; then
    log "ERROR" "Startup script encountered errors during execution"
    echo "❌ DEPLOYMENT FAILED - Check log file for details: $LOG_FILE" >&2
    exit 1
else
    log "INFO" "All startup checks passed successfully"
    echo "✅ DEPLOYMENT SUCCESSFUL"
    exit 0
fi
