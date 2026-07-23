import urllib.request

url_ajax = "https://live-data.apex-timing.com/live-timing/commonv2/functions/live_ajax.php?version=1.0.0&init=1&index=0&port=9954&counter=1&duration=100&id=123456789&ignored=0"
headers = {'User-Agent': 'Mozilla/5.0'}

req = urllib.request.Request(url_ajax, headers=headers)
with urllib.request.urlopen(req, timeout=5) as resp:
    data = resp.read().decode('utf-8', errors='ignore')
    grid_idx = data.find("grid||")
    if grid_idx >= 0:
        print("LUCAS GUERRERO GRID:")
        print(data[grid_idx+6:])
