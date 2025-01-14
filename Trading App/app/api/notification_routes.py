from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app.models import User, db, Notification

notifications_routes = Blueprint('notifications', __name__)
    
@notifications_routes.route('/<int:notification_id>', methods=["PUT"])
@login_required
def mark_notification_as_read(notification_id):
    notification = Notification.query.filter_by(id=notification_id, user_id=current_user.id).first()

    # Check if the notification exists and belongs to the logged-in user
    if not notification:
        return jsonify({"error": "Notification not found or not authorized"}), 404

    # Mark the notification as read
    notification.is_read = True
    db.session.commit()

    return jsonify({"message": "Notification marked as read", "notification": notification.to_dict()})