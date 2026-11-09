"""Generate the chart snapshot from Yahoo Finance chart endpoints."""

import datetime
import json
import urllib.request
from pathlib import Path

SERIES = {"AAPL": "ipod", "KODK": "kodak", "PFE": "pfizer", "BB": "blackberry"}
result = {}
for symbol, key in SERIES.items():
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?range=max&interval=1mo"
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request, timeout=30) as response:
        payload = json.load(response)["chart"]["result"][0]
    values = payload["indicators"]["quote"][0]["close"]
    points = []
    for timestamp, value in zip(payload["timestamp"], values):
        if value is None:
            continue
        date = datetime.datetime.fromtimestamp(timestamp, datetime.timezone.utc).strftime("%Y-%m-%d")
        points.append({"date": date, "value": round(value, 4)})
    if len(points) < 2:
        raise ValueError(f"Insufficient data for {symbol}")
    result[key] = {
        "symbol": symbol,
        "currency": payload["meta"].get("currency"),
        "interval": payload["meta"].get("dataGranularity"),
        "points": points,
    }
    print(symbol, len(points), points[0]["date"], points[-1]["date"], result[key]["interval"])

target = Path(__file__).resolve().parent.parent / "content" / "historicos-bolsa.js"
target.write_text("window.IDHUB_MARKET_HISTORY = " + json.dumps(result, ensure_ascii=True) + ";\n", encoding="utf-8")
