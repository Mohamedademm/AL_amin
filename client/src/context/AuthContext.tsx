import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi } from '../services/api';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean; // true while restoring the session on first load
  login: (email: string, password: string) => Promise<User>;
  register: (payload: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => Promise<User>;
  logout: () => void;
  isStaff: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STAFF_ROLES = ['ADMIN', 'MANAGER', 'WORKER'];

// Holds the authenticated user and restores the session from a stored token.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Re-hydrate the user on page load if a token is present.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then(setUser)
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const { user: u, token } = await authApi.login(email, password);
    localStorage.setItem('token', token);
    setUser(u);
    return u;
  };

  const register = async (payload: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => {
    const { user: u, token } = await authApi.register(payload);
    localStorage.setItem('token', token);
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isStaff: !!user && STAFF_ROLES.includes(user.role),
        isAdmin: user?.role === 'ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook to access auth state and actions.
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
