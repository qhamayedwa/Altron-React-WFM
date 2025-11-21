#!/bin/bash
# WFM24/7 - Start NestJS Server
cd "$(dirname "$0")/server"
export PORT=5000
node dist/main.js
