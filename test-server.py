#!/usr/bin/env python3
import http.server
import socketserver
import webbrowser
import os
import socket
import json
import re

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        print(f"Request: {format % args}")
        super().log_message(format, *args)
    
    def do_GET(self):
        if self.path == '/list-assets':
            try:
                assets = []
                if os.path.exists('assets'):
                    for file in os.listdir('assets'):
                        if file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
                            assets.append(f'assets/{file}')
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(assets).encode())
            except Exception as e:
                print(f"List assets error: {e}")
                self.send_error(500, str(e))
        else:
            super().do_GET()
    
    def do_POST(self):
        print(f"\n=== POST REQUEST ===")
        print(f"Path: {self.path}")
        print(f"Content-Type: {self.headers.get('Content-Type', 'None')}")
        print(f"Content-Length: {self.headers.get('Content-Length', 'None')}")
        print("===================")
        
        # Debug: Check which endpoint matches
        if self.path == '/save-formats':
            print("Matched: /save-formats")
        elif self.path == '/save-cpm':
            print("Matched: /save-cpm")
        elif self.path == '/copy-asset':
            print("Matched: /copy-asset")
        elif self.path == '/create-asset':
            print("Matched: /create-asset")
        elif self.path == '/upload-image':
            print("Matched: /upload-image")
        else:
            print(f"No match found for: {self.path}")
        if self.path == '/save-formats':
            print("Processing save-formats request...")
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            print(f"Received {len(data.get('formats', []))} formats")
            
            # Load existing data or create new
            try:
                with open('publisherssp_data.json', 'r') as f:
                    existing_data = json.load(f)
            except:
                existing_data = {}
            
            # Update formats in publisher-compatible structure
            existing_data['formats'] = data['formats']
            
            # Also update the desktop/mobile format arrays for compatibility
            desktop_formats = [f for f in data['formats'] if f['group'] == 'desktop']
            mobile_formats = [f for f in data['formats'] if f['group'] == 'mobile']
            
            if 'adFormats' not in existing_data:
                existing_data['adFormats'] = {}
            
            existing_data['adFormats']['desktop'] = desktop_formats
            existing_data['adFormats']['mobile'] = mobile_formats
            
            # Save back to file
            with open('publisherssp_data.json', 'w') as f:
                json.dump(existing_data, f, indent=2)
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'success'}).encode())
            
        elif self.path == '/save-cpm':
            # Handle CPM data saving
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                with open('publisherssp_data.json', 'w') as f:
                    f.write(post_data.decode('utf-8'))
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'success'}).encode())
            except Exception as e:
                print(f"Save error: {e}")
                self.send_error(500, str(e))
                
        elif self.path == '/copy-asset':
            try:
                import subprocess
                result = subprocess.run(['python3', 'copy-asset.py'], capture_output=True, text=True)
                
                if result.returncode == 0 and 'assets/' in result.stdout:
                    # Extract the path from stdout
                    lines = result.stdout.strip().split('\n')
                    path_line = [line for line in lines if line.startswith('Use path:')]
                    if path_line:
                        asset_path = path_line[0].replace('Use path: ', '')
                        self.send_response(200)
                        self.send_header('Content-Type', 'application/json')
                        self.end_headers()
                        self.wfile.write(json.dumps({'path': asset_path}).encode())
                        return
                
                self.send_error(400, 'No file selected or copy failed')
            except Exception as e:
                print(f"Copy asset error: {e}")
                self.send_error(500, str(e))
                
        elif self.path == '/delete-asset':
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
                
                asset_path = data.get('assetPath', '')
                if asset_path and os.path.exists(asset_path):
                    os.remove(asset_path)
                    print(f"Deleted asset: {asset_path}")
                    
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'success'}).encode())
            except Exception as e:
                print(f"Delete asset error: {e}")
                self.send_error(500, str(e))
                
        elif self.path == '/create-asset':
            try:
                content_length = int(self.headers['Content-Length'])
                content_type = self.headers.get('Content-Type', '')
                
                if 'multipart/form-data' in content_type:
                    boundary = re.search(r'boundary=([^;]+)', content_type).group(1)
                    data = self.rfile.read(content_length)
                    
                    # Parse multipart data
                    parts = data.split(f'--{boundary}'.encode())
                    file_content = None
                    asset_name = None
                    
                    for part in parts:
                        if b'Content-Disposition: form-data; name="image"' in part:
                            content_start = part.find(b'\r\n\r\n') + 4
                            file_content = part[content_start:].rstrip(b'\r\n')
                        elif b'Content-Disposition: form-data; name="assetName"' in part:
                            content_start = part.find(b'\r\n\r\n') + 4
                            asset_name = part[content_start:].rstrip(b'\r\n').decode()
                    
                    if file_content and asset_name:
                        # Create assets directory
                        os.makedirs('assets', exist_ok=True)
                        
                        # Save file with format name
                        filepath = os.path.join('assets', asset_name)
                        with open(filepath, 'wb') as f:
                            f.write(file_content)
                        
                        self.send_response(200)
                        self.send_header('Content-Type', 'application/json')
                        self.end_headers()
                        self.wfile.write(json.dumps({'path': f'assets/{asset_name}'}).encode())
                        return
                
                self.send_error(400, 'Invalid request')
            except Exception as e:
                print(f"Create asset error: {e}")
                self.send_error(500, str(e))
                
        elif self.path == '/upload-image':
            try:
                content_length = int(self.headers['Content-Length'])
                content_type = self.headers.get('Content-Type', '')
                
                if 'multipart/form-data' in content_type:
                    boundary = re.search(r'boundary=([^;]+)', content_type).group(1)
                    data = self.rfile.read(content_length)
                    
                    # Simple multipart parser
                    parts = data.split(f'--{boundary}'.encode())
                    for part in parts:
                        if b'Content-Disposition: form-data; name="image"' in part:
                            # Extract filename
                            filename_match = re.search(rb'filename="([^"]+)"', part)
                            if filename_match:
                                filename = filename_match.group(1).decode()
                                # Find file content (after double CRLF)
                                content_start = part.find(b'\r\n\r\n') + 4
                                file_content = part[content_start:].rstrip(b'\r\n')
                                
                                # Create assets directory if it doesn't exist
                                os.makedirs('assets', exist_ok=True)
                                # Save file to assets folder
                                filepath = os.path.join('assets', filename)
                                with open(filepath, 'wb') as f:
                                    f.write(file_content)
                                
                                self.send_response(200)
                                self.send_header('Content-Type', 'application/json')
                                self.end_headers()
                                self.wfile.write(json.dumps({'filename': filename, 'path': f'assets/{filename}'}).encode())
                                return
                
                self.send_error(400, 'No file uploaded')
            except Exception as e:
                print(f"Upload error: {e}")
                self.send_error(500, str(e))
        else:
            self.send_error(404)
    
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