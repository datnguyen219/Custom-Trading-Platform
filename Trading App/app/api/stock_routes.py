from flask import Blueprint, jsonify, request
from flask_login import login_required
from app.models import Stock
import robin_stocks.robinhood as r
from ..config import Config

stock_routes = Blueprint("stocks",__name__)

@stock_routes.route("")
def get_stocks():
    stocks = Stock.query.all()
    print("HERE: ",stocks)
    print("THERE: ",[stock.to_dict() for stock in stocks])
    return {"stocks":[stock.to_dict() for stock in stocks]}
  
def get_default_interval(span):
    if span == 'day':
      return '5minute'
    elif span =='week':
      return 'hour'
    elif span == 'month':
      return 'day'
    else:
      return 'day'
    
@stock_routes.route('/get_stock_historical', methods=['GET'])
def get_stock_historical():
    symbol = request.args.get('symbol')
    span = request.args.get('span', 'month')
    interval = get_default_interval(span)

    if not symbol:
        return jsonify({'error': 'Please provide symbol'}), 400

    try:
      #Log in to real robinhood account so we can call the actual apis for freeee
        r.login(Config.ROBINHOOD_USERNAME, Config.ROBINHOOD_PASSWORD)
        historical_data = r.stocks.get_stock_historicals(symbol, interval=interval, span=span)
        if not historical_data:
            return jsonify({'error': 'No data found for the given symbol and span'}), 404

        return jsonify(historical_data), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500