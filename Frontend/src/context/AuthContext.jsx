import React, { createContext, useContext, useState, useEffect } from 'react';
import dbStore from '../data/store';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    try {
      const savedUserSession = localStorage.getItem('user_session');
      if (savedUserSession) {
        const session = JSON.parse(savedUserSession);
        // Verify user still exists in DB
        const user = dbStore.getUserById(session.id);
        if (user) {
          setCurrentUser(user);
        } else {
          localStorage.removeItem('user_session');
        }
      }
    } catch (e) {
      console.error("Failed to restore session", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (username, password) => {
    const user = dbStore.getUserByUsername(username);
    if (!user || user.password !== password) {
      throw new Error("Invalid username or password");
    }
    setCurrentUser(user);
    localStorage.setItem('user_session', JSON.stringify({ id: user.id, username: user.username, role: user.role }));
    return user;
  };

  const signup = (username, password, displayName) => {
    try {
      const user = dbStore.createUser(username, password, displayName, "customer");
      setCurrentUser(user);
      localStorage.setItem('user_session', JSON.stringify({ id: user.id, username: user.username, role: user.role }));
      return user;
    } catch (e) {
      throw e;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user_session');
  };

  const resetPassword = (usernameOrEmail, newPassword) => {
    return dbStore.resetUserPassword(usernameOrEmail, newPassword);
  };

  const value = {
    currentUser,
    loading,
    login,
    signup,
    logout,
    resetPassword,
    isAdmin: currentUser?.role === 'admin',
    isCustomer: currentUser?.role === 'customer'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
export default AuthContext;
