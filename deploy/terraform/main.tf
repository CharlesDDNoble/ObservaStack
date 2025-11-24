terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

# Firewall rule to allow IAP for SSH and TCP forwarding
resource "google_compute_firewall" "allow_iap" {
  name    = "observastack-allow-iap"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["22", "80", "8000", "8001", "8002", "3000", "4040", "9090", "8089"]
  }

  # IAP's IP range
  source_ranges = ["35.235.240.0/20"]
  target_tags   = ["observastack"]
}

# Compute Engine instance
resource "google_compute_instance" "observastack" {
  name         = var.instance_name
  machine_type = var.machine_type
  zone         = var.zone

  tags = ["observastack"]

  boot_disk {
    initialize_params {
      image = var.image
      size  = var.disk_size_gb
      type  = var.disk_type
    }
  }

  network_interface {
    network = "default"
    access_config {
      // Ephemeral public IP - needed for downloading packages
    }
  }

  # Convert CRLF to LF before template processing to fix line ending issues on Windows
  metadata_startup_script = templatefile("${path.module}/startup-script.sh", {
    github_repo          = var.github_repo
    gunicorn_workers     = var.gunicorn_workers
    control_gateway_port = var.control_gateway_port
    sut_gateway_port     = var.sut_gateway_port
  })

  metadata = {
    ssh-keys = var.ssh_public_key != "" ? "${var.ssh_user}:${var.ssh_public_key}" : ""
  }

  service_account {
    scopes = ["cloud-platform"]
  }

  allow_stopping_for_update = true

  # Provisioner to check startup script execution
  provisioner "local-exec" {
    command = "echo 'Instance created. Monitor startup with: gcloud compute ssh ${var.instance_name} --zone=${var.zone} --project=${var.project_id} --tunnel-through-iap --command=\"cat /tmp/observastack-startup/startup.log\"'"
  }
}

# Output the instance name and zone for IAP access
output "instance_name" {
  value       = google_compute_instance.observastack.name
  description = "Instance name for IAP connections"
}

output "instance_zone" {
  value       = google_compute_instance.observastack.zone
  description = "Instance zone"
}

output "instance_ip" {
  value       = google_compute_instance.observastack.network_interface[0].access_config[0].nat_ip
  description = "Public IP address of the instance"
}

output "control_url" {
  value       = "http://${google_compute_instance.observastack.network_interface[0].access_config[0].nat_ip}:${var.control_gateway_port}"
  description = "ObservaStack Control Panel URL"
}

output "sut_url" {
  value       = "http://${google_compute_instance.observastack.network_interface[0].access_config[0].nat_ip}:${var.sut_gateway_port}"
  description = "System Under Test (SUT) API URL"
}

output "grafana_url" {
  value       = "http://${google_compute_instance.observastack.network_interface[0].access_config[0].nat_ip}:3000"
  description = "Grafana dashboard URL (admin/admin)"
}

output "prometheus_url" {
  value       = "http://${google_compute_instance.observastack.network_interface[0].access_config[0].nat_ip}:9090"
  description = "Prometheus UI URL"
}

output "pyroscope_url" {
  value       = "http://${google_compute_instance.observastack.network_interface[0].access_config[0].nat_ip}:4040"
  description = "Pyroscope profiling UI URL"
}

output "locust_url" {
  value       = "http://${google_compute_instance.observastack.network_interface[0].access_config[0].nat_ip}:8089"
  description = "Locust load testing UI"
}

output "ssh_command" {
  value       = "gcloud compute ssh ${var.instance_name} --zone=${var.zone} --project=${var.project_id} --tunnel-through-iap"
  description = "SSH command to connect via IAP"
}

output "run_startup_script_command" {
  value       = "gcloud compute ssh ${var.instance_name} --zone=${var.zone} --project=${var.project_id} --tunnel-through-iap -- 'bash -s' < deploy/terraform/startup-script.sh"
  description = "Command to manually run the startup script if it didn't auto-execute"
}

output "check_startup_log" {
  value       = "gcloud compute ssh ${var.instance_name} --zone=${var.zone} --project=${var.project_id} --tunnel-through-iap --command='cat /tmp/observastack-startup/startup.log'"
  description = "Command to check the startup log - REQUIRED: Run this to verify deployment success"
}

output "deployment_status" {
  value       = "⚠️  IMPORTANT: The startup script runs asynchronously. Use 'check_startup_log' command above to verify deployment status. Look for '✅ DEPLOYMENT SUCCESSFUL' message."
  description = "Deployment status check"
}
