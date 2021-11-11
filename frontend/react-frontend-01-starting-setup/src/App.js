import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';

import Users from './user/pages/Users';
import NewPlace from './places/pages/NewPlace';
import UserPlaces from './places/pages/UserPlaces';
import MainNavigation from './shared/components/Navigation/MainNavigation';
import UpdatePlace from './places/pages/UpdatePlace';
import Auth from './user/pages/Auth';
import { AuthContext } from './shared/context/auth-context';

const App = () => {
  const [token, setToken] = useState(false);
  const [userId, setUserId] = useState(null);

  const checkStorage = () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (token && userId) {
      login(userId, token);
    }
  };

  useEffect(() => checkStorage(), []);

  const login = useCallback((uid, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', uid);
    setToken(token);
    setUserId(uid);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setToken(null);
    setUserId(null);
  }, []);

  let routes;

  if (token) {
    routes = (
      <Switch>
        <Route path="/" exact component={() => <Users />} />
        <Route path="/:userId/places" exact component={() => <UserPlaces />} />
        <Route path="/places/new" exact component={() => <NewPlace />} />
        <Route path="/places/:placeId" exact component={() => <UpdatePlace />} />
        <Redirect to="/" />
      </Switch>
    );
  } else {
    routes = (
      <Switch>
        <Route path="/" exact component={() => <Users />} />
        <Route path="/:userId/places" exact component={() => <UserPlaces />} />
        <Route path="/auth" exact component={() => <Auth />} />
        <Redirect to="/auth" />
      </Switch>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        token,
        userId,
        login,
        logout
      }}>
      <Router>
        <MainNavigation />
        <main>
          {routes}
        </main>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
