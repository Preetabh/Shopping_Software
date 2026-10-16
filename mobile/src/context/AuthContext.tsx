import React, { createContext, useContext, useState, useEffect } from 'react';
import storage from '../utils/storage';
import { mobileApi } from '../api/client';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; phone: string; password: string }) => Promise<void>;
  requestOtp: (phone: string) => Promise<{ message: string; otp?: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const savedToken = await storage.getItem('user_token');
      const savedUser = await storage.getItem('user_profile');
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Verify with server
        try {
          const res = await mobileApi.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data);
            await storage.setItem('user_profile', JSON.stringify(res.data.data));
          }
        } catch (e) {
          // Token expired or invalid
        }
      }
    } catch (e) {
      console.error('Error loading session:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await mobileApi.post('/auth/login', { email, password });
    if (res.data.success) {
      const { user: loggedInUser, accessToken } = res.data.data;
      setUser(loggedInUser);
      setToken(accessToken);
      await storage.setItem('user_token', accessToken);
      await storage.setItem('user_profile', JSON.stringify(loggedInUser));
    }
  };

  const register = async (data: { name: string; email: string; phone: string; password: string }) => {
    const res = await mobileApi.post('/auth/register', data);
    if (res.data.success) {
      const { user: registeredUser, accessToken } = res.data.data;
      setUser(registeredUser);
      setToken(accessToken);
      await storage.setItem('user_token', accessToken);
      await storage.setItem('user_profile', JSON.stringify(registeredUser));
    }
  };

  const requestOtp = async (phone: string) => {
    const res = await mobileApi.post('/auth/otp/request', { phone });
    return res.data.data;
  };

  const verifyOtp = async (phone: string, otp: string) => {
    const res = await mobileApi.post('/auth/otp/verify', { phone, otp });
    if (res.data.success) {
      const { user: verifiedUser, accessToken } = res.data.data;
      setUser(verifiedUser);
      setToken(accessToken);
      await storage.setItem('user_token', accessToken);
      await storage.setItem('user_profile', JSON.stringify(verifiedUser));
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await storage.removeItem('user_token');
    await storage.removeItem('user_profile');
  };

  const updateUser = (updated: User) => {
    setUser(updated);
    storage.setItem('user_profile', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        requestOtp,
        verifyOtp,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
