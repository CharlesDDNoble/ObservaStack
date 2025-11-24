#!/bin/bash
# Check deployment status
if [ -f /tmp/observastack-startup/startup.log ]; then
    echo "=== STARTUP LOG (Last 100 lines) ==="
    tail -100 /tmp/observastack-startup/startup.log
else
    echo "Startup log not yet created"
fi

echo ""
echo "=== DOCKER STATUS ==="
docker ps 2>/dev/null || echo "Docker not yet running or not found"

echo ""
echo "=== CURRENT TIME ==="
date
