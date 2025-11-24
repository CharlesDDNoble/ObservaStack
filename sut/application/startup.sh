#!/bin/bash

# Ensure the multiprocess directory exists with proper permissions
mkdir -p /tmp/prometheus_multiproc
chown appuser:appgroup /tmp/prometheus_multiproc
chmod 777 /tmp/prometheus_multiproc

# Clean any existing metric files
rm -f /tmp/prometheus_multiproc/*

# Set the environment variable
export PROMETHEUS_MULTIPROC_DIR=/tmp/prometheus_multiproc

# Start gunicorn
exec gunicorn -c gunicorn.conf.py main:app