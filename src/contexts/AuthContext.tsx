import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Operator } from '@/types';
import { api, setCsrfToken as setApiCsrfToken } from '@/lib/api';

interface AuthContextType {
  operator: Operator | null;
  csrfToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshOperator: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [operator, setOperator] = useState<Operator | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchOperatorProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCsrfToken = async () => {
    try {
      const response = await api.get('/csrf-token');
      const token = response.data.token;
      setCsrfToken(token); // Update React state
      setApiCsrfToken(token); // Update api.ts CSRF token for interceptor
      return token;
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
      return null;
    }
  };

  const fetchOperatorProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      // Backend returns { success: true, data: operator }
      setOperator(response.data.data || response.data);

      // Fetch CSRF token after confirming auth
      await fetchCsrfToken();
    } catch (error) {
      console.error('Failed to fetch operator profile:', error);
      localStorage.removeItem('authToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    });

    // Backend returns { success: true, data: { token, operator } }
    const { token, operator: operatorData } = response.data.data;
    localStorage.setItem('authToken', token);
    setOperator(operatorData);

    // Fetch CSRF token after successful login
    await fetchCsrfToken();
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setOperator(null);
    setCsrfToken(null);
    setApiCsrfToken(null);
  };

  return (
    <AuthContext.Provider value={{ operator, csrfToken, login, logout, refreshOperator: fetchOperatorProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
