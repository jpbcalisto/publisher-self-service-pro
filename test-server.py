#!/usr/bin/env python3
import http.server
import socketserver
import webbrowser
import os
import socket

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def find_free_port(start_port=8080):
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
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Servidor rodando em http://localhost:{PORT}")
    print("Abrindo navegador...")
    webbrowser.open(f'http://localhost:{PORT}/publisherssp_pro.html')
    print("Pressione Ctrl+C para parar o servidor")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor parado.")