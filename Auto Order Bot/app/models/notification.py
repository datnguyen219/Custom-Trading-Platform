from datetime import datetime
from .db import db

class Notification(db.Model):
    __tablename__ = "notifications"
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer,db.ForeignKey("users.id"), nullable = False)
    message = db.Column(db.String(255), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    is_read = db.Column(db.Boolean, default=False, nullable=False)  # New attribute for read/unread status

    user = db.relationship("User", backref=db.backref("notifications", cascade="all, delete"))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "message": self.message,
            "timestamp": self.timestamp,
            "is_read": self.is_read
        }
