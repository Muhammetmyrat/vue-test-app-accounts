#!/bin/bash

# Run json-server in background
json-server --watch json.db --port 3001 &

# Run vite dev server (foreground)
vite
