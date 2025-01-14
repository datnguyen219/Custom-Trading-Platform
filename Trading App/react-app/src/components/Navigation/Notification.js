import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { deleteNotification } from '../../store/session';
import "./Navigation.css";




const NotificationDropdown = ({ showDropdown, toggleDropdown }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.session.user);
  const theme = useSelector(state => state.session.theme);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user && user.notifications) {
      const unreadNotifications = user.notifications.filter(notification => !notification.is_read);
      setNotifications(unreadNotifications);
    } else {
      setNotifications([]);
    }
  }, [user]);

  const handleDeleteNotification = (id) => {
    dispatch(deleteNotification(id));
  };

  return (
    showDropdown && (
      <div
        className="notification-dropdown"
        style={{
          backgroundColor: theme === 'dark' ? '#333' : 'white',
          color: theme === 'dark' ? 'white' : 'black',
        }}
      >
        <div className="dropdown-content">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div key={notification.id} className="notification-item">
                <span>{notification.message}</span>
                <button
                  className="delete-notification-button"
                  onClick={() => handleDeleteNotification(notification.id)}
                >
                  &times; {/* Cross symbol */}
                </button>
              </div>
            ))
          ) : (
            <div>No notifications</div>
          )}
        </div>
      </div>
    )
  );
};

export default NotificationDropdown;
