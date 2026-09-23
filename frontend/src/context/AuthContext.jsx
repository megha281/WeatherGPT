import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import authService from '../services/authService';
import { useLanguage } from './LanguageContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { setLanguage } = useLanguage();

  const applyUser = useCallback(
    (nextUser) => {
      setUser(nextUser);
      if (nextUser?.preferredLanguage) setLanguage(nextUser.preferredLanguage);
    },
    [setLanguage]
  );

  // Restore the session on first load.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!authService.getToken()) {
        setLoading(false);
        return;
      }
      try {
        const { user: me } = await authService.me();
        if (!cancelled) applyUser(me);
      } catch {
        authService.clearToken();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applyUser]);

  // The API layer fires this when a token is rejected mid-session.
  useEffect(() => {
    const onSignedOut = () => setUser(null);
    window.addEventListener('weathergpt:signed-out', onSignedOut);
    return () => window.removeEventListener('weathergpt:signed-out', onSignedOut);
  }, []);

  const login = useCallback(
    async (credentials) => {
      const data = await authService.login(credentials);
      authService.setToken(data.token);
      applyUser(data.user);
      return data.user;
    },
    [applyUser]
  );

  const register = useCallback(
    async (payload) => {
      const data = await authService.register(payload);
      authService.setToken(data.token);
      applyUser(data.user);
      return data;
    },
    [applyUser]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Signing out locally is what matters; a failed call must not block it.
    }
    authService.clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, setUser: applyUser, loading, login, register, logout, isAuthenticated: Boolean(user) }),
    [user, applyUser, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export default AuthContext;
