from app.stream.socket import socketio
from app import app

if __name__ == "__main__":
  socketio.run(app, port=8001)