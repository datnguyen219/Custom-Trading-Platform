from flask import Blueprint, Response, stream_with_context
from flask_login import login_required
import time

notifications_sse = Blueprint('notifications_sse', __name__)
clients = {}
@notifications_sse.route('/<int:user_id>')
@login_required
def subscribe(user_id):
    def stream():
        while True:
            if clients[user_id] == f'data: Update for user {user_id}\n\n':
                yield clients[user_id]
                clients[user_id] = ""
            time.sleep(1)
    
    clients[user_id] = ""
    return Response(stream(), content_type='text/event-stream')

def notify_user(user_id):
    if user_id in clients:
        message = f'data: Update for user {user_id}\n\n'
        clients[user_id] = message
