import urllib.request
import json
import re

def test_lucas_guerrero():
    # Test Lucas Guerrero config HTML
    url_html = "https://live.apex-timing.com/kartodromo-lucas-guerrero/"
    headers = {'User-Agent': 'Mozilla/5.0'}
    
    try:
        req = urllib.request.Request(url_html, headers=headers)
        with urllib.request.urlopen(req, timeout=5) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            print("Lucas Guerrero page html len:", len(html))
            
            # Search for config ports or js files
            js_files = re.findall(r'src=["\'](.*?\.js.*?)["\']', html)
            print("Found JS files:", js_files[:5])
            
            ports = re.findall(r'\b(9\d{3})\b', html)
            print("Found 9xxx ports in HTML:", set(ports))
    except Exception as e:
        print("HTML Error:", e)

    # Test HTTP poll on port 9954 (9950 + 4)
    url_ajax = "https://live-data.apex-timing.com/live-timing/commonv2/functions/live_ajax.php?version=1.0.0&init=1&index=0&port=9954&counter=1&duration=100&id=123456789&ignored=0"
    try:
        req = urllib.request.Request(url_ajax, headers=headers)
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = resp.read().decode('utf-8', errors='ignore')
            print("Lucas Guerrero AJAX port 9954 len:", len(data))
            if data:
                print("AJAX Sample:", data[:500])
    except Exception as e:
        print("AJAX Error (9954):", e)

test_lucas_guerrero()
