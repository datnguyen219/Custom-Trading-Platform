#https://pypi.org/project/websocket_client/
import websocket
import ssl
from threading import Thread, Lock
from datetime import datetime

import json
from .socket import socketio


ws_app = None
ws_thread = None
subscribed_symbols = set()
thread_lock = Lock()

subscribed_symbols = ["AAPL", "GOOGL", "AMZN", "MSFT", "TSLA", "BINANCE:BTCUSDT"]

def on_error(ws, error):
    print(error)

def on_close(ws, close_status_code, close_msg):
    print(f"### closed ### Status: {close_status_code}, Message: {close_msg}")

def on_open(ws):
    with thread_lock:
        for symbol in subscribed_symbols:
            ws.send(json.dumps({"type": "subscribe", "symbol": symbol}))
            
def on_message(ws, message):
    data = json.loads(message)
    
    if data.get('type') == 'trade' and 'data' in data:
        for trade in data['data']:
            symbol = trade.get('s')
            price = trade.get('p')
            timestamp = trade.get('t')
            volume = trade.get('v')
            readable_time = datetime.fromtimestamp(timestamp / 1000).strftime('%Y-%m-%d %H:%M:%S')
            print(f"Symbol: {symbol}, Price: {price}, Time: {readable_time}, Volume: {volume}")
              
    
    # socketio.sleep(0)
    # socketio.emit('live_stock', message)

def live_stock_stream():
    global ws_app
    websocket.enableTrace(False)
    ws_app = websocket.WebSocketApp(
        "wss://ws.finnhub.io?token=cr11n2hr01qo0i56mnb0cr11n2hr01qo0i56mnbg",
        on_message=on_message,
        on_error=on_error,
        on_close=on_close,
        on_open=on_open
    )
    ws_app.run_forever(sslopt={"cert_reqs": ssl.CERT_NONE})


def start_websocket():
    ws_thread = Thread(target=live_stock_stream)
    ws_thread.daemon = True
    ws_thread.start()

  
# @socketio.on('connect')
# def connect():
#   global ws_thread
#   with thread_lock:
#       if ws_thread is None:
#           ws_thread = socketio.start_background_task(live_stock_stream)
            
# @socketio.on('disconnect')
# def disconnect():
#   global ws_thread, ws_app
#   if ws_app:
#     ws_app.close()
#     ws_thread.join()
#     ws_app = None
#     ws_thread = None