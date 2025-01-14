from flask import Blueprint, jsonify, request
from flask_login import login_required
from app.models import User, BuyLimitOrder, SellLimitOrder, db, Stock

limit_orders_routes = Blueprint('limit_orders', __name__)

@limit_orders_routes.route('/<int:id>/buy', methods=["PUT"])
@login_required
def add_buy_order(id):
    user = User.query.get(id)
    if user is None:
        return jsonify({"error": "User not found"}), 404

    threshold_value = request.json.get('thresholdValue')
    symbol = request.json.get('symbol')
    buy_quantity = request.json.get('orderQuantity')
    
    if threshold_value is None:
        return jsonify({"error": "Missing threshold value"}), 400
    if symbol is None:
        return jsonify({"error": "Missing symbol"}), 400
    if buy_quantity is None:
        return jsonify({"error": "Missing buy quantity"}), 400

    try:
        buy_quantity = float(buy_quantity)
    except ValueError:
        return jsonify({"error": "Invalid buy quantity"}), 400

    stock = Stock.query.filter_by(symbol=symbol).first()
    if stock is None:
        return jsonify({"error": "Stock not found"}), 404

    order = BuyLimitOrder.query.filter_by(user_id=user.id, stock_id=stock.id).first()
    if order is None:
        order = BuyLimitOrder(
            user_id=user.id,
            stock_id=stock.id,
            buy_threshold=float(threshold_value),
            buy_quantity=buy_quantity,
        )
        db.session.add(order)
    else:
        order.buy_threshold = float(threshold_value)
        order.buy_quantity = buy_quantity
    
    db.session.commit()
    return user.to_dict()


  
@limit_orders_routes.route('/<int:id>/sell', methods=["PUT"])
@login_required
def add_sell_order(id):
    user = User.query.get(id)
    if user is None:
        return jsonify({"error": "User not found"}), 404

    threshold_value = request.json.get('thresholdValue')
    symbol = request.json.get('symbol')
    sell_quantity = request.json.get('orderQuantity')
    
    if threshold_value is None:
        return jsonify({"error": "Missing threshold value"}), 400
    if symbol is None:
        return jsonify({"error": "Missing symbol"}), 400
    if sell_quantity is None:
        return jsonify({"error": "Missing sell quantity"}), 400

    try:
        sell_quantity = float(sell_quantity)
    except ValueError:
        return jsonify({"error": "Invalid sell quantity"}), 400

    stock = Stock.query.filter_by(symbol=symbol).first()
    if stock is None:
        return jsonify({"error": "Stock not found"}), 404

    order = SellLimitOrder.query.filter_by(user_id=user.id, stock_id=stock.id).first()
    if order is None:
        order = SellLimitOrder(
            user_id=user.id,
            stock_id=stock.id,
            sell_threshold=float(threshold_value),
            sell_quantity=sell_quantity,
        )
        db.session.add(order)
    else:
        SellLimitOrder.sell_threshold = float(threshold_value)
        SellLimitOrder.sell_quantity = sell_quantity
    
    db.session.commit()
    return user.to_dict()