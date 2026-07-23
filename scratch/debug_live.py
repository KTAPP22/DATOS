import urllib.request
import json
import re

def fetch_live_apex(config_host, api_port):
    url = f"https://{config_host}/live-timing/commonv2/functions/live_ajax.php?version=1.0.0&init=1&index=0&port={api_port}&counter=1&duration=100&id=123456789&ignored=0"
    
    proxies = [
        lambda u: u,
        lambda u: f"https://corsproxy.io/?{urllib.parse.quote(u)}",
        lambda u: f"https://api.allorigins.win/raw?url={urllib.parse.quote(u)}"
    ]
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
    
    for p in proxies:
        p_url = p(url)
        try:
            req = urllib.request.Request(p_url, headers=headers)
            with urllib.request.urlopen(req, timeout=5) as response:
                html = response.read().decode('utf-8', errors='ignore')
                if html and '@' in html:
                    return html
        except Exception as e:
            continue
    return None

print("=== CHECKING CAMPILLOS (PORT 9374) ===")
camp_data = fetch_live_apex('live-data.apex-timing.com', 9374)
print(f"Campillos raw len: {len(camp_data) if camp_data else 0}")
if camp_data:
    print(camp_data[:1000])

print("\n=== CHECKING LUCAS GUERRERO (PORT 9954) ===")
lucas_data = fetch_live_apex('live-data.apex-timing.com', 9954)
print(f"Lucas raw len: {len(lucas_data) if lucas_data else 0}")
if lucas_data:
    print(lucas_data[:1000])
