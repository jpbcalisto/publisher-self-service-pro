#!/usr/bin/env python3
import http.server
import socketserver
import json
import urllib.parse
import webbrowser
import os

class CPMHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/save-cpm':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            with open('publisherssp_data.json', 'w') as f:
                json.dump(data, f, indent=2)
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status": "success"}')
        else:
            self.send_error(404)

def find_free_port(start_port=8081):
    import socket
    for port in range(start_port, start_port + 100):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('', port))
                return port
        except OSError:
            continue
    raise RuntimeError("No free port found")

os.chdir(os.path.dirname(os.path.abspath(__file__)))
PORT = find_free_port()

with socketserver.TCPServer(("", PORT), CPMHandler) as httpd:
    print(f"CPM Editor server running at http://localhost:{PORT}")
    webbrowser.open(f'http://localhost:{PORT}/cpm-editor.html')
    httpd.serve_forever()