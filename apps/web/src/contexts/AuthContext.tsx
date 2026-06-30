import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';
import type { User as BaseUser } from '@studyos/types';

export interface User extends BaseUser {
  username: string;
  preparationTypes: string[];
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (accessToken: string, user: User) => void;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = (token: string, userData: User) => {
    setAccessToken(token);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignore logout errors
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const refreshSession = async () => {
    try {
      const response = await api.post('/auth/refresh');
      const { accessToken: token, user: userData } = response.data;
      login(token, userData);
    } catch (error) {
      setAccessToken(null);
      setUser(null);
      throw error;
    }
  };

  // Setup Axios interceptors
  useEffect(() => {
    // 1. Request Interceptor: Attach bearer token
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        if (accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // 2. Response Interceptor: Catch 401 and attempt silent refresh
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Prevent infinite loops and only retry if not already retried
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url.includes('/auth/refresh') &&
          !originalRequest.url.includes('/auth/login')
        ) {
          originalRequest._retry = true;
          try {
            // Attempt to refresh token
            const refreshResponse = await api.post('/auth/refresh');
            const { accessToken: newToken, user: userData } = refreshResponse.data;

            // Save state
            login(newToken, userData);

            // Update original request headers and retry
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            // Refresh token is invalid/expired - logout user
            setAccessToken(null);
            setUser(null);
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      },
    );

    // Clean up interceptors on unmount
    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken]);

  // Initial session restoration
  useEffect(() => {
    const restoreSession = async () => {
      try {
        await refreshSession();
      } catch (err) {
        // No active session found, which is fine
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
