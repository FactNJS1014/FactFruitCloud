import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserProfileUpdate } from '../types';
import { useToast } from './ToastContext';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isUser: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: UserProfileUpdate) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('factfruit_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { success, error } = useToast();

  const fetchCurrentUser = async (authToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        // Token invalid
        localStorage.removeItem('factfruit_token');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to fetch user', err);
      localStorage.removeItem('factfruit_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser(token);
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        error(data.error || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        setIsLoading(false);
        return false;
      }

      localStorage.setItem('factfruit_token', data.token);
      setToken(data.token);
      setUser(data.user);
      success(data.message || `ยินดีต้อนรับคุณ ${data.user.firstName}`);
      setIsLoading(false);
      return true;
    } catch (err) {
      error('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
      setIsLoading(false);
      return false;
    }
  };

  const register = async (formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  }): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        error(data.error || 'การลงทะเบียนไม่สำเร็จ');
        setIsLoading(false);
        return false;
      }

      localStorage.setItem('factfruit_token', data.token);
      setToken(data.token);
      setUser(data.user);
      success(data.message || 'ลงทะเบียนสำเร็จ ยินดีต้อนรับสู่ FactFruit');
      setIsLoading(false);
      return true;
    } catch (err) {
      error('เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง');
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (e) {
      // Ignore
    } finally {
      localStorage.removeItem('factfruit_token');
      setToken(null);
      setUser(null);
      success('ออกจากระบบเรียบร้อยแล้ว');
    }
  };

  const updateProfile = async (data: UserProfileUpdate): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok) {
        error(resData.error || 'ไม่สามารถอัปเดตข้อมูลได้');
        return false;
      }

      setUser(resData.user);
      success(resData.message || 'อัปเดตข้อมูลสำเร็จ');
      return true;
    } catch (err) {
      error('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
      return false;
    }
  };

  const refreshUser = async () => {
    if (token) {
      await fetchCurrentUser(token);
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN';
  const isUser = user?.role === 'USER';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        isAdmin,
        isUser,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
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
