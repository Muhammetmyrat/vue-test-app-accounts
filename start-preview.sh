#!/bin/bash

# Run json-server in background
json-server --watch json.db --port 3001 &

# Run vite preview server (foreground)
vite preview
