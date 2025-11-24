# Dashboard Provisioning

This directory contains automatically provisioned Grafana dashboards for ObservaStack.

## How to Add Your Dashboards

### Method 1: Export from Grafana UI (Recommended)

1. Open your dashboard in Grafana (http://localhost:3000)
1. Click the Share icon (or press Ctrl+S)
1. Go to the Export tab
1. Toggle Export for sharing externally ON
1. Click Save to file
1. Save the JSON file to observability/grafana/provisioning/dashboards/json/
1. Wait about 10 seconds. Grafana will automatically detect the new file and load the dashboard. (A restart is not required.)

### Method 2: Using Grafana API

Export all dashboards programmatically:

```bash
# Export a specific dashboard by UID
curl -H "Authorization: Bearer YOUR_API_KEY" \
  http://localhost:3000/api/dashboards/uid/DASHBOARD_UID > dashboard.json
```

## Dashboard Configuration
The provisioning configuration is in dashboards.yml:

+ Folder: Dashboards will appear in the "ObservaStack" folder
+ allowUiUpdates: You can edit dashboards in the UI (but see the note below)
+ updateIntervalSeconds: Grafana automatically checks for changes every 10 seconds

## Tips
+ Naming Convention: Use descriptive names like backend-metrics.json, gateway-health.json
+ Variables: Make sure datasource variables use ${DS_PROMETHEUS}, ${DS_LOKI}, etc.
+ IDs: Remove the id field or set it to null to avoid conflicts
+ Version Control: Commit dashboard JSON files to track changes

## Troubleshooting

### Dashboards not appearing?

1. Check Grafana logs: docker-compose logs grafana
1. Verify JSON is valid: Use a JSON validator
1. Restart Grafana (as a last resort): docker-compose restart grafana

### Dashboard changes revert after a restart?

+ This is expected behavior with allowUiUpdates: true.
+ When you save in the UI, the change is saved to Grafana's internal database, but the original .json file is unchanged. 
+ When Grafana restarts, the provisioner re-reads the original .json file and overwrites your UI-based changes. 
+ To make UI changes permanent: You must follow Method 1 again to re-export your modified dashboard and overwrite the old .json file.