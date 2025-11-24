variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "GCP zone"
  type        = string
  default     = "us-central1-a"
}

variable "instance_name" {
  description = "Name of the compute instance"
  type        = string
  default     = "observastack"
}

variable "machine_type" {
  description = "Machine type for the instance"
  type        = string
  default     = "e2-medium"
}

variable "image" {
  description = "Boot disk image (ubuntu-2204-lts for x86, ubuntu-2204-lts-arm64 for ARM)"
  type        = string
  default     = "ubuntu-os-cloud/ubuntu-2204-lts"
}

variable "disk_size_gb" {
  description = "Boot disk size in GB"
  type        = number
  default     = 30
}

variable "disk_type" {
  description = "Boot disk type (pd-standard, pd-balanced, pd-ssd)"
  type        = string
  default     = "pd-standard"
}

variable "gunicorn_workers" {
  description = "Number of Gunicorn worker processes"
  type        = number
  default     = 5
}

variable "control_gateway_port" {
  description = "Control gateway port"
  type        = number
  default     = 80
}

variable "sut_gateway_port" {
  description = "SUT gateway port"
  type        = number
  default     = 8000
}

variable "github_repo" {
  description = "GitHub repository URL"
  type        = string
  default     = "https://github.com/CharlesDDNoble/ObservaStack.git"
}

variable "ssh_user" {
  description = "SSH username"
  type        = string
  default     = ""
}

variable "ssh_public_key" {
  description = "SSH public key for instance access"
  type        = string
  default     = ""
}
