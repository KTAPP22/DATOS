import urllib.request
import json
import re

def inspect_grid():
    url = "https://live-data.apex-timing.com/live-timing/commonv2/functions/live_ajax.php?version=1.0.0&init=1&index=0&port=9374&counter=1&duration=100&id=123456789&ignored=0"
    
    headers = {'User-Agent': 'Mozilla/5.0'}
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = resp.read().decode('utf-8', errors='ignore')
            print("Data len:", len(data))
            
            # Find grid
            grid_idx = data.find("grid||")
            if grid_idx >= 0:
                grid_html = data[grid_idx+6:]
                print("GRID HTML SAMPLE:")
                print(grid_html[:3000])
            else:
                print("No grid|| found in data")
    except Exception as e:
        print("Error:", e)

inspect_grid()
