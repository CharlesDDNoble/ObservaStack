#!/bin/bash

# Start gunicorn
exec gunicorn -c gunicorn.conf.py main:app