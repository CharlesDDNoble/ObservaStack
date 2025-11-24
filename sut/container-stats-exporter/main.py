"""
Docker Container Stats Exporter

Exports raw container metrics from Docker API to Prometheus.
All metrics are exported as-is from Docker stats API for transformation in Grafana/PromQL.
Works reliably on Docker Desktop/WSL2 where cAdvisor has filesystem access issues.
"""

from typing import Any, Dict, List, Optional
import docker
import time
from prometheus_client import Counter, Gauge, start_http_server

SERVER_PORT = 8080
SAMPLE_INTERVAL = 1  # seconds

# CPU metrics (raw from Docker API)
# cpu_usage.total_usage: Total CPU time consumed by container in nanoseconds (cumulative counter)
# system_cpu_usage: Total system CPU usage across all cores (cumulative counter)
# online_cpus: Number of CPUs available to container
cpu_usage_total = Counter("container_cpu_usage_seconds_total", "Total CPU time consumed (converted from nanoseconds)", ["service", "container_id"])
cpu_system_usage = Counter("container_cpu_system_seconds_total", "Total system CPU time (converted from nanoseconds)", ["service", "container_id"])
cpu_online_cpus = Gauge("container_cpu_online_cpus", "Number of online CPUs available to container", ["service", "container_id"])

# Memory metrics (raw from Docker API)
# usage: Current memory usage including page cache (bytes)
# max_usage: Maximum memory usage ever recorded since container start (bytes)
# limit: Memory limit configured for container (bytes)
# stats.cache: Page cache memory - data cached from disk (bytes)
# stats.rss: Resident set size - actual RAM used excluding cache (bytes)
# stats.rss_huge: Memory used by huge pages in RSS (bytes)
# stats.mapped_file: Memory-mapped files - files mapped into process address space (bytes)
# swap: Swap usage calculated as (usage - total_rss) (bytes)
memory_usage = Gauge("container_memory_usage_bytes", "Current memory usage including cache", ["service", "container_id"])
memory_max_usage = Gauge("container_memory_max_usage_bytes", "Peak memory usage ever recorded", ["service", "container_id"])
memory_limit = Gauge("container_memory_limit_bytes", "Configured memory limit", ["service", "container_id"])
memory_cache = Gauge("container_memory_cache_bytes", "Page cache memory (data cached from disk)", ["service", "container_id"])
memory_rss = Gauge("container_memory_rss_bytes", "Resident set size (actual RAM excluding cache)", ["service", "container_id"])
memory_rss_huge = Gauge("container_memory_rss_huge_bytes", "Huge pages in resident set", ["service", "container_id"])
memory_mapped_file = Gauge("container_memory_mapped_file_bytes", "Memory-mapped files", ["service", "container_id"])
memory_swap = Gauge("container_memory_swap_bytes", "Swap usage (usage minus total_rss)", ["service", "container_id"])

# Network metrics - totals (cumulative counters)
# Aggregated across all network interfaces
# rx_bytes: Total bytes received (cumulative counter)
# tx_bytes: Total bytes transmitted (cumulative counter)
# rx_packets: Total packets received (cumulative counter)
# tx_packets: Total packets transmitted (cumulative counter)
# rx_errors: Total receive errors (cumulative counter)
# tx_errors: Total transmit errors (cumulative counter)
# rx_dropped: Total dropped receive packets (cumulative counter)
# tx_dropped: Total dropped transmit packets (cumulative counter)
network_rx_bytes_total = Counter("container_network_receive_bytes_total", "Total bytes received across all interfaces", ["service", "container_id"])
network_tx_bytes_total = Counter("container_network_transmit_bytes_total", "Total bytes transmitted across all interfaces", ["service", "container_id"])
network_rx_packets_total = Counter("container_network_receive_packets_total", "Total packets received across all interfaces", ["service", "container_id"])
network_tx_packets_total = Counter("container_network_transmit_packets_total", "Total packets transmitted across all interfaces", ["service", "container_id"])
network_rx_errors_total = Counter("container_network_receive_errors_total", "Total receive errors across all interfaces", ["service", "container_id"])
network_tx_errors_total = Counter("container_network_transmit_errors_total", "Total transmit errors across all interfaces", ["service", "container_id"])
network_rx_dropped_total = Counter("container_network_receive_dropped_total", "Total dropped receive packets across all interfaces", ["service", "container_id"])
network_tx_dropped_total = Counter("container_network_transmit_dropped_total", "Total dropped transmit packets across all interfaces", ["service", "container_id"])

# Network metrics - per interface (cumulative counters)
# Same metrics as above but broken down by network interface (eth0, lo, etc.)
network_rx_bytes_interface = Counter("container_network_receive_bytes_total_interface", "Bytes received per interface", ["service", "container_id", "interface"])
network_tx_bytes_interface = Counter("container_network_transmit_bytes_total_interface", "Bytes transmitted per interface", ["service", "container_id", "interface"])
network_rx_packets_interface = Counter("container_network_receive_packets_total_interface", "Packets received per interface", ["service", "container_id", "interface"])
network_tx_packets_interface = Counter("container_network_transmit_packets_total_interface", "Packets transmitted per interface", ["service", "container_id", "interface"])

# Block I/O metrics (cumulative counters)
# io_service_bytes_recursive: Bytes transferred to/from block devices
# Aggregates read/write operations across all block devices
blkio_read_bytes_total = Counter("container_blkio_read_bytes_total", "Total bytes read from block devices", ["service", "container_id"])
blkio_write_bytes_total = Counter("container_blkio_write_bytes_total", "Total bytes written to block devices", ["service", "container_id"])

# PID metrics
# pids_stats.current: Current number of processes/threads in container
# pids_stats.limit: Maximum number of PIDs allowed (0 = unlimited)
pids_current = Gauge("container_pids_current", "Current number of processes/threads", ["service", "container_id"])
pids_limit = Gauge("container_pids_limit", "Maximum PIDs allowed (0 = unlimited)", ["service", "container_id"])


def safe_get(data: Optional[Dict[str, Any]], key: str, default: Any = 0) -> Any:
    """Safely get value from dict, handling None cases"""
    if data is None:
        return default
    return data.get(key, default)


def main() -> None:
    """Main metrics collection loop - exports raw Docker API stats"""
    start_http_server(SERVER_PORT)
    print(f"Docker Container Stats Exporter running on :{SERVER_PORT}", flush=True)
    print(f"Collecting raw metrics every {SAMPLE_INTERVAL} second(s).", flush=True)
    
    client = docker.from_env()
    
    while True:
        time.sleep(SAMPLE_INTERVAL)
        try:
            containers = client.containers.list()
            
            for container in containers:
                cid: str = container.short_id
                service: str = container.labels.get("com.docker.compose.service", container.name)
                
                try:
                    # Get stats (non-streaming snapshot)
                    stats: Dict[str, Any] = container.stats(stream=False)
                    
                    # === CPU Metrics (raw values) ===
                    cpu_stats: Dict[str, Any] = safe_get(stats, "cpu_stats", {})
                    cpu_usage_data: Dict[str, Any] = safe_get(cpu_stats, "cpu_usage", {})
                    
                    # Counter: total CPU time in seconds (convert from nanoseconds)
                    total_usage_ns: int = safe_get(cpu_usage_data, "total_usage", 0)
                    cpu_usage_total.labels(service=service, container_id=cid)._value.set(total_usage_ns / 1_000_000_000)
                    
                    # Counter: system CPU time
                    system_usage_ns: int = safe_get(cpu_stats, "system_cpu_usage", 0)
                    cpu_system_usage.labels(service=service, container_id=cid)._value.set(system_usage_ns / 1_000_000_000)
                    
                    # Gauge: number of CPUs available
                    percpu_usage: List[int] = safe_get(cpu_usage_data, "percpu_usage", [1])
                    online_cpus: int = safe_get(cpu_stats, "online_cpus", len(percpu_usage))
                    cpu_online_cpus.labels(service=service, container_id=cid).set(online_cpus)
                    
                    # === Memory Metrics (raw values) ===
                    mem_stats: Dict[str, Any] = safe_get(stats, "memory_stats", {})
                    
                    memory_usage.labels(service=service, container_id=cid).set(safe_get(mem_stats, "usage", 0))
                    memory_max_usage.labels(service=service, container_id=cid).set(safe_get(mem_stats, "max_usage", 0))
                    memory_limit.labels(service=service, container_id=cid).set(safe_get(mem_stats, "limit", 0))
                    
                    # Detailed memory breakdown
                    mem_detailed: Dict[str, Any] = safe_get(mem_stats, "stats", {})
                    memory_cache.labels(service=service, container_id=cid).set(safe_get(mem_detailed, "cache", 0))
                    memory_rss.labels(service=service, container_id=cid).set(safe_get(mem_detailed, "rss", 0))
                    memory_rss_huge.labels(service=service, container_id=cid).set(safe_get(mem_detailed, "rss_huge", 0))
                    memory_mapped_file.labels(service=service, container_id=cid).set(safe_get(mem_detailed, "mapped_file", 0))
                    
                    # Swap (if available)
                    swap_usage: int = safe_get(mem_stats, "usage", 0) - safe_get(mem_detailed, "total_rss", 0)
                    memory_swap.labels(service=service, container_id=cid).set(max(0, swap_usage))
                    
                    # === Network Metrics (cumulative counters) ===
                    networks: Dict[str, Dict[str, Any]] = safe_get(stats, "networks", {})
                    
                    # Aggregate totals across all interfaces
                    total_rx_bytes: int = sum(safe_get(net, "rx_bytes", 0) for net in networks.values())
                    total_tx_bytes: int = sum(safe_get(net, "tx_bytes", 0) for net in networks.values())
                    total_rx_packets: int = sum(safe_get(net, "rx_packets", 0) for net in networks.values())
                    total_tx_packets: int = sum(safe_get(net, "tx_packets", 0) for net in networks.values())
                    total_rx_errors: int = sum(safe_get(net, "rx_errors", 0) for net in networks.values())
                    total_tx_errors: int = sum(safe_get(net, "tx_errors", 0) for net in networks.values())
                    total_rx_dropped: int = sum(safe_get(net, "rx_dropped", 0) for net in networks.values())
                    total_tx_dropped: int = sum(safe_get(net, "tx_dropped", 0) for net in networks.values())
                    
                    # Set counter values directly (they're cumulative from Docker)
                    network_rx_bytes_total.labels(service=service, container_id=cid)._value.set(total_rx_bytes)
                    network_tx_bytes_total.labels(service=service, container_id=cid)._value.set(total_tx_bytes)
                    network_rx_packets_total.labels(service=service, container_id=cid)._value.set(total_rx_packets)
                    network_tx_packets_total.labels(service=service, container_id=cid)._value.set(total_tx_packets)
                    network_rx_errors_total.labels(service=service, container_id=cid)._value.set(total_rx_errors)
                    network_tx_errors_total.labels(service=service, container_id=cid)._value.set(total_tx_errors)
                    network_rx_dropped_total.labels(service=service, container_id=cid)._value.set(total_rx_dropped)
                    network_tx_dropped_total.labels(service=service, container_id=cid)._value.set(total_tx_dropped)
                    
                    # Per-interface breakdown
                    for interface, net_stats in networks.items():
                        network_rx_bytes_interface.labels(service=service, container_id=cid, interface=interface)._value.set(safe_get(net_stats, "rx_bytes", 0))
                        network_tx_bytes_interface.labels(service=service, container_id=cid, interface=interface)._value.set(safe_get(net_stats, "tx_bytes", 0))
                        network_rx_packets_interface.labels(service=service, container_id=cid, interface=interface)._value.set(safe_get(net_stats, "rx_packets", 0))
                        network_tx_packets_interface.labels(service=service, container_id=cid, interface=interface)._value.set(safe_get(net_stats, "tx_packets", 0))
                    
                    # === Block I/O Metrics (cumulative counters) ===
                    blkio_stats: Dict[str, Any] = safe_get(stats, "blkio_stats", {})
                    io_service_bytes: List[Dict[str, Any]] = safe_get(blkio_stats, "io_service_bytes_recursive", [])
                    if io_service_bytes is None:
                        io_service_bytes = []
                    
                    total_read: int = 0
                    total_write: int = 0
                    for entry in io_service_bytes:
                        op: str = safe_get(entry, "op", "").lower()
                        value: int = safe_get(entry, "value", 0)
                        if op == "read":
                            total_read += value
                        elif op == "write":
                            total_write += value
                    
                    blkio_read_bytes_total.labels(service=service, container_id=cid)._value.set(total_read)
                    blkio_write_bytes_total.labels(service=service, container_id=cid)._value.set(total_write)
                    
                    # === PID Metrics ===
                    pids_stats: Dict[str, Any] = safe_get(stats, "pids_stats", {})
                    pids_current.labels(service=service, container_id=cid).set(safe_get(pids_stats, "current", 0))
                    pids_limit.labels(service=service, container_id=cid).set(safe_get(pids_stats, "limit", 0))
                    
                except Exception as e:
                    print(f"✗ Error collecting stats for service '{service}' (container {cid}): {type(e).__name__}: {e}", flush=True)
                    import traceback
                    traceback.print_exc()
            
            print(f"✓ Exported raw metrics for {len(containers)} containers", flush=True)
            
        except Exception as e:
            print(f"✗ Error in main collection loop: {type(e).__name__}: {e}", flush=True)
            import traceback
            traceback.print_exc()


if __name__ == "__main__":
    main()
