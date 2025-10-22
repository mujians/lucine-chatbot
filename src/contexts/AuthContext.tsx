import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Operator } from '@/types';
import { api } from '@/lib/api';

interface AuthContextType {
  operator: Operator | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [operator, setOperator] = useState<Operator | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchOperatorProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchOperatorProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      // Backend returns { success: true, data: operator }
      setOperator(response.data.data || response.data);
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
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setOperator(null);
  };

  return (
    <AuthContext.Provider value={{ operator, login, logout, loading }}>
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
