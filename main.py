#!/usr/bin/env python3
"""
WFM24/7 - Flask Proxy to NestJS Server
This Flask app proxies all requests to the NestJS server running on port 3000.
"""
import os
import subprocess
import threading
import time
from flask import Flask, request
import requests

app = Flask(__name__)

# Start NestJS server in background
def start_nestjs():
    server_dir = os.path.join(os.path.dirname(__file__), 'server')
    os.chdir(server_dir)
    subprocess.run(['node', 'dist/main.js'])

# Start NestJS in a background thread
nestjs_thread = threading.Thread(target=start_nestjs, daemon=True)
nestjs_thread.start()

# Wait for NestJS to start
time.sleep(3)

NEST_URL = "http://localhost:3000"

@app.route('/', defaults={'path': ''}, methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])
@app.route('/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])
def proxy(path):
    """Proxy all requests to NestJS server"""
    url = f"{NEST_URL}/{path}"
    
    # Forward request headers
    headers = {key: value for key, value in request.headers if key != 'Host'}
    
    # Forward request based on method
    if request.method == 'GET':
        resp = requests.get(url, headers=headers, params=request.args, cookies=request.cookies)
    elif request.method == 'POST':
        resp = requests.post(url, headers=headers, data=request.get_data(), params=request.args, cookies=request.cookies)
    elif request.method == 'PUT':
        resp = requests.put(url, headers=headers, data=request.get_data(), params=request.args, cookies=request.cookies)
    elif request.method == 'DELETE':
        resp = requests.delete(url, headers=headers, params=request.args, cookies=request.cookies)
    elif request.method == 'PATCH':
        resp = requests.patch(url, headers=headers, data=request.get_data(), params=request.args, cookies=request.cookies)
    
    # Forward response
    excluded_headers = ['content-encoding', 'content-length', 'transfer-encoding', 'connection']
    response_headers = [(name, value) for (name, value) in resp.raw.headers.items()
                       if name.lower() not in excluded_headers]
    
    return (resp.content, resp.status_code, response_headers)
