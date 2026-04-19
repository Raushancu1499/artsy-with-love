import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

const getStoredUser = () => {
  if (typeof window === 'undefined') return null;

  const savedUser = window.localStorage.getItem('artsy_user');
  const token = window.localStorage.getItem('artsy_token');

  if (!savedUser || !token) return null;

  try {
    return JSON.parse(savedUser);
  } catch {
    window.localStorage.removeItem('artsy_user');
    window.localStorage.removeItem('artsy_token');
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const loading = false;

  const login = (userData, token) => {
    setUser(userData);
    window.localStorage.setItem('artsy_user', JSON.stringify(userData));
    window.localStorage.setItem('artsy_token', token);
  };

  const logout = () => {
    setUser(null);
    window.localStorage.removeItem('artsy_user');
    window.localStorage.removeItem('artsy_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
