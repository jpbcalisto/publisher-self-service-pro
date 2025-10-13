#!/usr/bin/env python3
import http.server
import socketserver
import webbrowser
import os
import socket
import sys
import threading
import time

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

def main():
    # Get the directory where the executable is located
    if getattr(sys, 'frozen', False):
        # Running as compiled executable
        app_dir = os.path.dirname(sys.executable)
    else:
        # Running as script
        app_dir = os.path.dirname(os.path.abspath(__file__))
    
    os.chdir(app_dir)
    
    PORT = find_free_port()
    
    def start_server():
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"🚀 Publisher SSP Pro rodando em http://localhost:{PORT}")
            print("📱 O browser vai abrir automaticamente...")
            print("❌ Para parar, feche esta janela")
            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                print("\n✅ Servidor parado.")
    
    # Start server in background thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    
    # Wait a moment then open browser
    time.sleep(1)
    webbrowser.open(f'http://localhost:{PORT}/publisherssp_pro.html')
    
    try:
        # Keep main thread alive
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n✅ Aplicação encerrada.")

if __name__ == "__main__":
    main()