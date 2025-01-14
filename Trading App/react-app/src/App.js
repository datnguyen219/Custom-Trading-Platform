import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import LoginForm from './components/auth/LoginForm';
import NavBar from './components/Navigation/NavBar';
import { authenticate } from './store/session';
import Dashboard from "./components/Dashboard"
import "./index.css"
import StockPage from "./components/StockPage"
import LiveTrading from "./components/LiveTrading"
function App() {
  const [loaded, setLoaded] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector(state => state.session.user)
  const theme = useSelector(state => state.session.theme)


  useEffect(() => {
    (async() => {
      await dispatch(authenticate());
      setLoaded(true);
    })();
  }, [dispatch]);

  if (!loaded) {
    return null;
  }

  return (
    <BrowserRouter>
      <div id = {theme}>
      <Switch>
        <Route path='/login' exact={true}>
          <LoginForm />
        </Route>
        <Route path='/sign-up' exact={true}>
          <SignUpForm />
        </Route>
        {user && (
        <Route path='/' exact={true} >
          <NavBar />
          <Dashboard/>
        </Route>
        )}
        {user && (
          <Route exact = {true} path = "/stocks/:symbol">
            <NavBar />
            <StockPage/>
          </Route>
        )}
        {user && (
          <Route exact = {true} path = "/livetrading">
            <NavBar />
            <LiveTrading/>
          </Route>
        )}
      </Switch>
      </div>
    </BrowserRouter>
  );
}

export default App;
