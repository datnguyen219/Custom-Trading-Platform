from flask_socketio import SocketIO

socketio = SocketIO( logger=True, engineio_logger=True, cors_allowed_origins="*", async_mode='threading')

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    socketio.emit('connect', {'message': 'Connected to server'})

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')
    socketio.emit('disconnect', {'message': 'Disconnected from server'})


