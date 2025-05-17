#!/bin/bash

# Start Xvfb in the background
Xvfb :99 -screen 0 1280x1024x24 &
XVFB_PID=$!

# Give Xvfb time to initialize
sleep 2

# Start x11vnc in the background
x11vnc -display :99 -rfbport 5900 -forever -nopw &
VNC_PID=$!

# Run the application with DISPLAY=:99
DISPLAY=:99 pdm run python -m api.backend.worker.job_worker
