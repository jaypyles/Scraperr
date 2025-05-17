#!/bin/bash

RECORDINGS_ENABLED=${RECORDINGS_ENABLED:-true}

if [ "$RECORDINGS_ENABLED" == "false" ]; then
  pdm run python -m api.backend.worker.job_worker
else
  Xvfb :99 -screen 0 1280x1024x24 &
  XVFB_PID=$!
  sleep 2
  x11vnc -display :99 -rfbport 5900 -forever -nopw &
  VNC_PID=$!
  DISPLAY=:99 pdm run python -m api.backend.worker.job_worker
fi
