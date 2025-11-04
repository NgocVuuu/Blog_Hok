import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';

// Central Auth Context to manage token state and trigger login modal on 401
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const openLogin = useCallback(() => {
    setShowLoginModal(true);
  }, []);

  const closeLogin = useCallback(() => {
    setShowLoginModal(false);
  }, []);

  const login = useCallback((tokenValue, userData) => {
    if (tokenValue) {
      localStorage.setItem('token', tokenValue);
      setToken(tokenValue);
    }
    if (userData) setUser(userData);
    closeLogin();
  }, [closeLogin]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    openLogin();
  }, [openLogin]);

  // Decode JWT (no verification, just base64 decode) to read exp
  const decodeJwt = (jwt) => {
    try {
      const [, payload] = jwt.split('.');
      if (!payload) return null;
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  };

  // Validate token on mount and whenever token changes
  useEffect(() => {
    if (!token) return; // no token -> modal may open elsewhere when needed
    const data = decodeJwt(token);
    if (!data || (data.exp && Date.now() >= data.exp * 1000)) {
      // Expired or invalid
      logout();
    }
  }, [token, logout]);

  const isAuthenticated = useMemo(() => !!token, [token]);

  // Helper to wrap fetch with auth + 401 handling
  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const finalOptions = { ...options };
    finalOptions.headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    };
    let response;
    try {
      response = await fetch(url, finalOptions);
    } catch (e) {
      throw e;
    }
    if (response.status === 401) {
      // Trigger re-login UI
      logout();
    }
    return response;
  }, [logout]);

  const handleUnauthorized = useCallback(() => {
    logout();
  }, [logout]);

  return (
    <AuthContext.Provider value={{
  user,
  token,
  isAuthenticated,
      showLoginModal,
      isAuthenticating,
      setIsAuthenticating,
      openLogin,
      closeLogin,
      login,
      logout,
      fetchWithAuth,
      handleUnauthorized,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);