from .db import db

class BuyLimitOrder(db.Model):
    __tablename__ = "buy_limit_orders"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    stock_id = db.Column(db.Integer, db.ForeignKey("stocks.id"), nullable=False)
    buy_threshold = db.Column(db.Float, nullable=False)
    buy_quantity = db.Column(db.Float, nullable=False)

    user = db.relationship("User", backref=db.backref("buy_limit_orders", cascade="all, delete"))
    stock = db.relationship("Stock", backref=db.backref("buy_limit_orders", uselist=False))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "stock_id": self.stock_id,
            "stock_name": self.stock.name,
            "stock_symbol": self.stock.symbol,
            "buy_threshold": self.buy_threshold,
            "buy_quantity": self.buy_quantity
        }
