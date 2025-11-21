#!/usr/bin/env python3
"""
WFM24/7 - React + NestJS Migration
This script launches the NestJS server instead of Flask.
"""
import subprocess
import os
import sys

# Change to server directory and run NestJS
os.chdir(os.path.join(os.path.dirname(__file__), 'server'))
subprocess.run(['node', 'dist/src/main.js'])
