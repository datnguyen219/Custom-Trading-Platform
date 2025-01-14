import time
import json
from threading import Thread
from flask import Response, stream_with_context, jsonify
from ..config import Config
from app.models import BuyLimitOrder, Stock, SellLimitOrder, db, Holding, User, Notification
import robin_stocks.robinhood as r
from queue import Queue
from collections import defaultdict
from ..api.notifications_sse import notify_user

user_notification_queues = defaultdict(Queue)

def process_orders(app, db, order_type):
    with app.app_context():
        while True:
            if order_type == 'buy':
                orders = BuyLimitOrder
                comparator = lambda price, threshold: price <= threshold
            else:
                orders = SellLimitOrder
                comparator = lambda price, threshold: price >= threshold

            unique_symbols = (
                db.session.query(Stock.symbol)
                .join(orders, Stock.id == orders.stock_id)
                .distinct()
                .all()
            )

            for (symbol,) in unique_symbols:
                latest_price = fetch_latest_price(symbol)
                if latest_price is None:
                    print(f"Failed to fetch the price for symbol: {symbol}")
                    continue

                print(f"Latest price for {symbol}: {latest_price}")

                current_orders = (
                    db.session.query(orders)
                    .join(Stock)
                    .filter(
                        Stock.symbol == symbol,
                        comparator(latest_price, getattr(orders, f'{order_type}_threshold'))
                    )
                    .all()
                )

                for order in current_orders:
                    print({
                        "user_id": order.user_id,
                        "stock_symbol": order.stock.symbol,
                        "threshold": getattr(order, f'{order_type}_threshold'),
                        "quantity": getattr(order, f'{order_type}_quantity')
                    })
                    if execute_order(order.user_id, order.stock.symbol, getattr(order, f'{order_type}_quantity'), order_type):
                        db.session.delete(order)

            try:
                db.session.commit()
                print("Committed changes to the database.")
            except Exception as e:
                db.session.rollback()
                print(f"Error committing changes: {e}")

            time.sleep(300)

def execute_order(user_id, symbol, quantity, order_type):
    try:
        stock = Stock.query.filter_by(symbol=symbol).first()
        if not stock:
            print(f"Stock {symbol} not found.")
            return False

        holding = Holding.query.filter_by(stock_id=stock.id, user_id=user_id).first()

        if order_type == 'buy':
            if holding:
                holding.shares += quantity
            else:
                holding = Holding(stock_id=stock.id, user_id=user_id, shares=quantity)
                db.session.add(holding)
            print(f"Executed buy order: {quantity} shares of {symbol} for user {user_id}.")
        
        elif order_type == 'sell':
            if holding and holding.shares >= quantity:
                holding.shares -= quantity
                print(f"Executed sell order: {quantity} shares of {symbol} for user {user_id}.")
            else:
                print(f"Insufficient shares to sell for user {user_id}.")
                return False
        
        message = f"Successfully executed {order_type} order: {quantity} shares of {symbol}."
        notification = Notification(user_id=user_id, message=message)
        db.session.add(notification)
        db.session.commit()

        # notify_user(user_id)
        
        return True
    
    except Exception as e:
        print(f"Error executing order for user {user_id} and stock {symbol}: {e}")
        return False
    


def fetch_latest_price(symbol):
    try:
        latest_price = r.stocks.get_latest_price(symbol, includeExtendedHours=True)
        if latest_price:
            return float(latest_price[0])
        else:
            print(f"Failed to fetch price for symbol: {symbol}")
            return None
    except Exception as e:
        print(f"Error fetching price for symbol {symbol}: {e}")
        return None

def start_order_bot(app, db):
    r.login(Config.ROBINHOOD_USERNAME, Config.ROBINHOOD_PASSWORD)

    buy_thread = Thread(target=process_orders, args=(app, db, 'buy'))
    sell_thread = Thread(target=process_orders, args=(app, db, 'sell'))

    buy_thread.start()
    sell_thread.start()