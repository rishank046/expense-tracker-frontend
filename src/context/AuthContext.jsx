import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [profile, setProfile] = useState(() => {
    const savedProfile = localStorage.getItem('userProfile');
    return savedProfile ? JSON.parse(savedProfile) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/user/login', { email, password });
    const { token: newTok } = response.data;
    
    if (newTok) {
      localStorage.setItem('token', newTok);
      setToken(newTok);
      
      const userData = { email, name: email.split('@')[0] };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    }
    return response.data;
  };

  const register = async (name, email, password) => {
    const response = await api.post('/user/signin', { name, email, password });
    return response.data;
  };

  const saveProfile = async ({ salary, minimumExpense, expenseGoal }) => {
    const payload = {
      salary: Number(salary),
      minimumExpense: Number(minimumExpense),
      expenseGoal: Number(expenseGoal),
    };
    const response = await api.post('/user/profile', payload);
    
    const profileData = {
      salary: Number(salary),
      minimumExpense: Number(minimumExpense),
      expenseGoal: Number(expenseGoal),
    };
    
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    setProfile(profileData);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userProfile');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        profile,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        saveProfile,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
