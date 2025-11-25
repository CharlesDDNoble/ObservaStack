# Secure Access Guide for ObservaStack on GCP

## 1. Overview

This document outlines a standard, secure procedure for accessing the `ObservaStack` services (Grafana, Prometheus, Loki) running on a Google Cloud VM.

This method **avoids using a public (External) IP address**. Instead, it leverages Google's Identity-Aware Proxy (IAP) to create a secure, authenticated TCP tunnel. This aligns with Zero Trust security principles by granting access based on user identity (IAM) rather than network location.

## 2. Prerequisites

1.  **GCP Project:** A Google Cloud Project configured with the `ObservaStack` VM.
2.  **Google Cloud SDK:** The `gcloud` command-line tool must be installed and authenticated on your local workstation.
    * Run `gcloud init` to authenticate and select your project.
    * Run `gcloud auth login` to ensure your user credentials are active.

## 3. One-Time Project Configuration

These steps are performed once per project.

### 3.1. Enable Google Cloud APIs

1.  Navigate to "APIs & Services" > "Enable APIs and Services".
2.  Search for and **enable** the **`Identity-Aware Proxy`** API.

### 3.2. Configure OAuth Consent Screen

IAP requires an OAuth screen to identify users.

1.  Navigate to "APIs & Services" > "OAuth consent screen".
2.  **User Type:** Select **"Internal"** (if part of a Google Workspace) or **"External"**.
3.  **App Information:** Provide the required details:
    * App name: `ObservaStack IAP Access`
    * User support email: (Your email)
    * Developer contact information: (Your email)
4.  Click **"Save and Continue"** through the remaining steps.

### 3.3. Grant IAM Permissions

Grant your Google account the specific role required to *use* IAP tunnels.

1.  Navigate to **"IAM & Admin"** > **"IAM"**.
2.  Click **"+ GRANT ACCESS"**.
3.  **New principals:** Add your user email address (e.g., `user@example.com`).
4.  **Select a role:** Search for and assign the **`IAP-Secured Tunnel User`** role (`roles/iap.tunnelResourceAccessor`).
5.  Click **"Save"**.

## 4. Resource Configuration

These steps configure the specific VM and firewall rules.

### 4.1. Create IAP Firewall Rule

This rule allows traffic **only** from Google's IAP service to your tagged VM.

1.  Navigate to **"VPC network"** > **"Firewall"**.
2.  Click **"CREATE FIREWALL RULE"** with the following parameters:
    * **Name:** `allow-iap-to-observastack`
    * **Direction:** `Ingress`
    * **Action on match:** `Allow`
    * **Targets (Target tags):** `observastack-vm` (This tag will be added to the VM).
    * **Source filter (IP ranges):** `35.235.240.0/20`
        * *Note: This is the official, stable IP block used by Google's IAP service for TCP forwarding. This is not a security exposure.*
    * **Protocols and ports (tcp):**
        * `22` (for SSH)
        * `3000` (for Grafana)
        * `9090` (for Prometheus)
        * `3100` (for Loki)
3.  Click **"Create"**.

### 4.2. Configure the VM

1.  Navigate to **"VM instances"**.
2.  Click the name of your `ObservaStack` VM (e.g., `instance-20251105-171554`).
3.  Click **"Edit"**.
4.  **Network tags:** Add the `observastack-vm` tag to match the firewall rule.
5.  **Network interfaces:**
    * Click to expand the `nic0` network interface.
    * Ensure **"External IP"** is set to **"None"**. This is critical for security.
6.  Click **"Save"**.

## 5. Connection Procedures

Follow these steps on your local workstation to access the services.

### 5.1. Open Tunnels

Each service requires a separate tunnel. Each command must be run in its **own terminal** and left running.

**Grafana (Port 3000):**
```bash
gcloud compute start-iap-tunnel [VM_NAME] 3000 --local-host-port=localhost:3000 --zone=[VM_ZONE]