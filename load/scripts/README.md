# ObservaStack Load Testing with Locust

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Target Host

#### Local Testing (default)
```bash
# No configuration needed - targets http://localhost by default
```

#### Remote Testing via IAP Tunnel
```bash
# Start IAP tunnel first
gcloud compute start-iap-tunnel observastack 80 --local-host-port=localhost:8080 --zone=us-central1-a --project=your-project-id

# Set environment variable (PowerShell)
$env:LOCUST_HOST="http://localhost:8080"

# Set environment variable (Bash/Linux/Mac)
export LOCUST_HOST=http://localhost:8080
```

#### Direct Remote Testing
```bash
# Set environment variable to instance IP (PowerShell)
$env:LOCUST_HOST="http://INSTANCE_IP"

# Set environment variable (Bash/Linux/Mac)
export LOCUST_HOST=http://INSTANCE_IP
```

### 3. Start Your Backend
```bash
# From project root
cd ..
docker compose --env-file deploy/docker/.env.local up -d
```

### 4. Run Load Tests

#### Option A: Interactive Menu (Recommended)
```bash
python run_tests.py
```
The script will check prerequisites and show an interactive menu.

#### Option B: Command Line Interface
```bash
# List available tests
python run_tests.py --list

# Run specific test
python run_tests.py --test basic

# Run with custom parameters
python run_tests.py --test basic --users 20 --spawn-rate 4

# Run through IAP tunnel
python run_tests.py --test basic --host http://localhost:8080

# Start Web UI directly
python run_tests.py --web-ui

# Start Web UI for IAP tunnel testing
python run_tests.py --web-ui --host http://localhost:8080
```

## Test Scenarios

TODO: Rewrite this section based on current test scenarios.


## Distributed Load Testing

For high-load tests, use distributed mode:

```bash
# Interactive menu (will prompt for workers)
python run_tests.py
# Select option 4 (Stress Test) or 5 (Extreme Test)

# Web UI with distributed mode
python run_tests.py --web-ui --distributed --workers 6

# Command line stress test
python run_tests.py --test stress  # Auto-distributed
```

**Distributed Mode Benefits:**
- Spreads load across multiple CPU cores
- Avoids single-process CPU bottleneck
- Can generate much higher RPS
- More accurate performance measurements## Understanding Results

### Key Metrics
- **RPS (Requests Per Second)**: Higher is better
- **Response Time**: Lower is better
- **Failure Rate**: Lower is better (should be < 1%)
- **95th Percentile**: Most important for user experience

### Result Files
Results are saved to the `results/` directory:
- `{test_name}.html` - Comprehensive HTML report
- `{test_name}_stats.csv` - Request statistics
- `{test_name}_stats_history.csv` - Time-series data
- `{test_name}_failures.csv` - Failure details (if any)

### Observability Stack
Check the following endpoints for monitoring:

- **Prometheus**: http://localhost:9090
  - `http_requests_total` - Request count
  - `http_request_duration_seconds` - Response times
  - `process_resident_memory_bytes` - Memory usage

- **Grafana Dashboard**: http://localhost:3000
  - Real-time performance graphs
  - Error rate monitoring
  - System resource usage

- **Loki Logs**: http://localhost:3100
  - Centralized log aggregation### Backend Logs
```bash
# From project root
docker compose --env-file deploy/docker/.env.local logs -f backend
```

## Test Progression Strategy

1. **Start Small**: `basic` test (10 users) → validate basic functionality
2. **Scale Up**: `medium` test (50 users) → find comfortable load
3. **Push Limits**: `high` test (100 users) → test under pressure
4. **Find Breaking Point**: `stress` test (500 users) → discover limits
5. **Monitor**: `metrics` test → validate observability
6. **Optimize**: Adjust backend configuration, retest

## Troubleshooting

### Common Issues

**Locust not found**
```bash
pip install locust requests
```

**Backend not accessible**
```bash
cd .. && docker-compose up -d
curl http://localhost/api/hello
```

**Permission errors on Windows**
- Run terminal as Administrator
- Or use full Python path: `C:\Users\{username}\AppData\Local\Microsoft\WindowsApps\python.exe`

**High failure rates**
- Check backend logs: `docker-compose logs backend`
- Reduce concurrent users
- Increase spawn rate time

### Performance Tips

- Start tests gradually (low user count first)
- Monitor system resources during tests
- Use the Web UI for real-time monitoring
- Check both Locust results and Prometheus metrics

## debug_api.py - Locust Manager API Client

Quick diagnostic tool for interacting with the Locust load generator's HTTP API. Use this for manual test control or debugging when the automated `runtests.py` workflow isn't appropriate.

### Commands

**Check health:**
```bash
python debug_api.py status
```

**Start load test:**
```bash
# Basic (50 users, 5min)
python debug_api.py start

# Custom parameters
python debug_api.py start --users 500 --spawn-rate 20 --run-time 10m

# Distributed mode (multi-worker)
python debug_api.py start --users 1000 --workers 4 --run-time 15m
```

**View active test:**
```bash
python debug_api.py get
```

**Get results:**
```bash
# Latest test
python debug_api.py results

# Specific test ID
python debug_api.py results --test-id 12345678-1234-1234-1234-123456789abc
```

**Stop running test:**
```bash
python debug_api.py stop
```

### Configuration

Default API endpoint: `http://localhost:8080` (Docker port mapping)

For in-container calls, change `API_BASE_URL` to `http://load-generator`.

### Parameters

- `--users`: Total simulated users (default: 50)
- `--spawn-rate`: Users added per second (default: 10)
- `--run-time`: Duration (e.g., `5m`, `30s`, `1h`) (default: 5m)
- `--host`: Target URL (default: `http://sut-gateway`)
- `--class-name`: Locust user class (default: `BasicUser`)
- `--workers`: Worker processes for distributed mode (default: 1)

### When to Use

- **Debug API connectivity** - Verify load generator is responding
- **Quick ad-hoc tests** - No scenario JSON needed
- **Manual control** - Start/stop tests without wrapper scripts
- **Results inspection** - Query test outcomes programmatically

For production scenarios, use `runtests.py` with scenario configs instead.

# Load Test Configurations

This ./configs contains JSON configuration files for load tests.

## Configuration Schema

```json
{
  "name": "Test Name",
  "description": "Description shown in menu",
  "users": 100,
  "spawn_rate": 10,
  "run_time": "300s",
  "class_name": "ObservaStackUser",
  "workers": 2,
  "host": "http://localhost"
}
```

### Required Fields

- **name** (string): Display name of the test
- **description** (string): Brief description shown in the menu
- **users** (integer): Number of concurrent users to simulate
- **spawn_rate** (integer): Rate at which users are spawned (users/second)
- **run_time** (string): Test duration (e.g., "60s", "5m", "2h")
- **class_name** (string): Locust user class to use

### Optional Fields

- **workers** (integer): Number of worker processes for distributed mode (default: 2)
- **host** (string): Target host URL (overrides command-line --host if specified)

## Note on Distributed Testing

All tests now run in distributed mode by default with 2 workers minimum. This provides better CPU utilization and more consistent performance across different machine types.

## Creating Custom Configurations

1. Copy an existing config file
2. Modify the parameters
3. Save with a descriptive name (e.g., `high_cpu_high_user.json`)
4. Run with: `python run_tests.py --config high_cpu_high_user.json`