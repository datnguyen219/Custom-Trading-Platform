import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import LogoutButton from '../auth/LogoutButton';
import "./Navigation.css";
import { useSelector, useDispatch } from 'react-redux';
import Search from '../Search';
import { BsSun } from "react-icons/bs";
import { VscBellDot } from "react-icons/vsc";
import { VscBell } from "react-icons/vsc";
import { setTheme, authenticate } from '../../store/session';
import NotificationDropdown from './Notification';

const NavBar = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.session.user);
  const theme = useSelector(state => state.session.theme);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  if (theme === "dark" && !user) dispatch(setTheme());

  const changeTheme = () => {
    dispatch(setTheme());
  };

  useEffect(() => {
    if (user && user.notifications) {
      // const eventSource = new EventSource(`http://localhost:8001/notifications_sse/${user.id}`);

      // eventSource.onmessage = (event) => {
      //   const notification = JSON.parse(event.data);
      //   if(notification.message === `Update for user ${user.id}`){
      //     dispatch(authenticate());
      //   }
      // };

      const unreadNotifications = user.notifications.filter(notification => !notification.is_read);
      setHasUnreadNotifications(unreadNotifications.length > 0);

      // return () => {
      //   eventSource.close();
      // };
    }
  }, [user, dispatch]);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    setHasUnreadNotifications(false);
  };

  return (
    <nav id="navbar-outer-container">
      {!user && (
        <div className="navbar-inner-container">
          <div className="navbar-left"></div>
          <div className="navbar-right">
            <div>
              <NavLink id="navbar-login-navlink" className="navbar-navlink user-button" to='/login' exact={true} activeClassName='active'>
                Login
              </NavLink>
            </div>
            <div id="navbar-user-buttons-spacer"></div>
          </div>
        </div>
      )}
      {user && (
        <div className="navbar-inner-container">
          <nav className="navbar-icons">
            <NavLink to="/">
              <svg 
                id="home-icon" 
                height="40" 
                width="40" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="#00c805">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                <path d="M0 0h24v24H0z" fill="none"/>
              </svg>
            </NavLink>
            <NavLink 
              id="navbar-livetrading-navlink" 
              className="navbar-navlink user-button" 
              to="/livetrading" 
              exact={true} 
              activeClassName="active">
              <svg 
                id="trading-icon" 
                height="40" 
                width="40" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="#00c805">
                <path d="M4 2h2v20H4zm5 7h2v7H9zm5-4h2v14h-2zm5 9h2v5h-2z"/>
                <path d="M0 0h24v24H0z" fill="none"/>
              </svg>
            </NavLink>
          </nav>
          <Search />
          <div id="navbar-right-container">
            {hasUnreadNotifications ? (
              <VscBellDot 
                onClick={toggleDropdown} 
                style={{ cursor: "pointer", fontSize: "20px", marginRight: "25px" }} 
              />
            ) : (
              <VscBell 
                onClick={toggleDropdown} 
                style={{ cursor: "pointer", fontSize: "20px", marginRight: "25px" }} 
              />
            )}
            <NotificationDropdown
              showDropdown={showDropdown}
              toggleDropdown={toggleDropdown}
            />
            <BsSun onClick={changeTheme} style={{ cursor: "pointer", fontSize: "20px", marginRight: "25px" }} />
            <LogoutButton />
          </div>
        </div>
      )}
    </nav>
  );
}

export default NavBar;
