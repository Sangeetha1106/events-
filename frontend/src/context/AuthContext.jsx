import React, { createContext, useContext, useState, useEffect } from 'react';
import { getToken, removeToken } from '../utils/localStorage';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = getToken();
    if (token) {
      try {
        const decoded = jwtDecode(token);
        return { role: decoded.role || 'Admin', id: decoded.id, username: decoded.username };
      } catch (err) {
        console.error("Invalid token", err);
        removeToken();
      }
    }
    return null;
  });

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
