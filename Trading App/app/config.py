import os
from dotenv import load_dotenv
load_dotenv()


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # SQLAlchemy 1.4 no longer supports url strings that start with 'postgres'
    # (only 'postgresql') but heroku's postgres add-on automatically sets the
    # url in the hidden config vars to start with postgres.
    # so the connection uri must be updated here
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    SQLALCHEMY_ECHO = True
    ROBINHOOD_USERNAME= os.environ.get('ROBINHOOD_USERNAME')
    ROBINHOOD_PASSWORD= os.environ.get('ROBINHOOD_PASSWORD')
    FINNHUB_API_KEY=os.environ.get('FINNHUB_API_KEY')
    FINNHUB_SECRET=os.environ.get('FINNHUB_SECRET')
