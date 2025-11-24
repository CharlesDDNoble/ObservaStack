#!/bin/sh
set -e

cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf

# Start nginx
exec nginx -g 'daemon off;'