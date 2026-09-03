import subprocess
import time
import re

def run_tunnel():
    while True:
        print("[Tunnel] Launching persistent auto-reconnecting SSH tunnel...")
        cmd = [
            "ssh",
            "-o", "StrictHostKeyChecking=no",
            "-o", "ServerAliveInterval=10",
            "-o", "ServerAliveCountMax=3",
            "-R", "80:127.0.0.1:8000",
            "nokey@localhost.run"
        ]
        try:
            proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
            for line in proc.stdout:
                print(line, end="", flush=True)
                if ".lhr.life" in line:
                    match = re.search(r'https://[a-zA-Z0-9]+\.lhr\.life', line)
                    if match:
                        tunnel_url = match.group(0)
                        print(f"\n==========================================")
                        print(f"[Tunnel Active] Public Backend URL: {tunnel_url}")
                        print(f"==========================================\n", flush=True)
            proc.wait()
        except Exception as e:
            print(f"[Tunnel Error] {e}")
        print("[Tunnel] Disconnected. Reconnecting in 2 seconds...")
        time.sleep(2)

if __name__ == "__main__":
    run_tunnel()
