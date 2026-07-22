import urllib.request
import json
import re

def fetch_live_apex(config_host, api_port):
    url = f"https://{config_host}/live-timing/commonv2/functions/live_ajax.php?version=1.0.0&init=1&index=0&port={api_port}&counter=1&duration=100&id=123456789&ignored=0"
    
    # Try direct or cors proxies
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

def parse_apex_grid(data_str):
    if not data_str:
        return "No data received"
    
    at_idx1 = data_str.find('@')
    at_idx2 = data_str.find('@', at_idx1 + 1)
    payload = data_str[at_idx2 + 1:] if at_idx2 > 0 else data_str
    
    grid_match = re.search(r'grid\|\|(.*)', payload, re.DOTALL)
    if not grid_match:
        return "No grid in payload"
    
    grid_html = grid_match.group(1)
    
    # Extract rows
    rows = re.findall(r'<tr data-id="r(\d+)"[^>]*>(.*?)</tr>', grid_html, re.DOTALL)
    results = []
    
    for r_id, r_content in rows:
        if r_id == '0': continue
        
        # Kart
        kart_match = re.search(r'class="no\d*"[^>]*>(\d+)<', r_content)
        kart = kart_match.group(1) if kart_match else "?"
        
        # Driver
        dr_match = re.search(r'class="dr"[^>]*>(.*?)</td>', r_content, re.DOTALL)
        driver = dr_match.group(1).strip() if dr_match else "Unknown"
        driver = re.sub(r'<[^>]+>', '', driver)
        
        # Last lap
        llp_match = re.search(r'data-id="r\d+c9"[^>]*>(.*?)</td>', r_content, re.DOTALL)
        last_lap = llp_match.group(1).strip() if llp_match else "--"
        last_lap = re.sub(r'<[^>]+>', '', last_lap)
        
        # Best lap
        blp_match = re.search(r'data-id="r\d+c10"[^>]*>(.*?)</td>', r_content, re.DOTALL)
        best_lap = blp_match.group(1).strip() if blp_match else "--"
        best_lap = re.sub(r'<[^>]+>', '', best_lap)

        # Laps count
        tlp_match = re.search(r'data-id="r\d+c13"[^>]*>(.*?)</td>', r_content, re.DOTALL)
        laps_count = tlp_match.group(1).strip() if tlp_match else "0"
        laps_count = re.sub(r'<[^>]+>', '', laps_count)
        
        results.append({
            'row_id': r_id,
            'kart': kart,
            'driver': driver,
            'last_lap': last_lap,
            'best_lap': best_lap,
            'laps': laps_count
        })
        
    return results

print("=== CHECKING CAMPILLOS (PORT 9374) ===")
camp_data = fetch_live_apex('live-data.apex-timing.com', 9374)
camp_karts = parse_apex_grid(camp_data)
print(json.dumps(camp_karts, indent=2))

print("\n=== CHECKING LUCAS GUERRERO (PORT 9954) ===")
lucas_data = fetch_live_apex('live-data.apex-timing.com', 9954)
lucas_karts = parse_apex_grid(lucas_data)
print(json.dumps(lucas_karts, indent=2))
