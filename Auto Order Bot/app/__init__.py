import os
from flask import Flask, render_template, request, session, redirect
from flask_cors import CORS
from flask_migrate import Migrate
from flask_wtf.csrf import generate_csrf

from .models import db

from .config import Config
from .stream.stock_stream import start_websocket
from .stream.limit_order import start_order_bot
from .api.notifications_sse import notifications_sse

app = Flask(__name__)


app.config.from_object(Config)
app.register_blueprint(notifications_sse, url_prefix='/api/notifications_sse')
db.init_app(app)
migrate = Migrate(app, db)

# Application Security
CORS(app)
# start_websocket()
start_order_bot(app, db)


# Since we are deploying with Docker and Flask,
# we won't be using a buildpack when we deploy to Heroku.
# Therefore, we need to make sure that in production any
# request made over http is redirected to https.
# Well.........
@app.before_request
def https_redirect():
    if os.environ.get('FLASK_ENV') == 'production':
        if request.headers.get('X-Forwarded-Proto') == 'http':
            url = request.url.replace('http://', 'https://', 1)
            code = 301
            return redirect(url, code=code)


@app.after_request
def inject_csrf_token(response):
    response.set_cookie(
        'csrf_token',
        generate_csrf(),
        secure=True if os.environ.get('FLASK_ENV') == 'production' else False,
        samesite='Strict' if os.environ.get(
            'FLASK_ENV') == 'production' else None,
        httponly=True)
    return response
