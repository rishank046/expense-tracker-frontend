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
    if (!savedProfile) return null;
    try {
      const parsed = JSON.parse(savedProfile);
      const minExp = parsed.minimum_expense !== undefined ? parsed.minimum_expense : parsed.minimumExpense;
      const expGoal = parsed.expense_goal !== undefined ? parsed.expense_goal : parsed.expenseGoal;
      return {
        ...parsed,
        salary: Number(parsed.salary || 0),
        minimum_expense: Number(minExp || 0),
        expense_goal: Number(expGoal || 0),
        minimumExpense: Number(minExp || 0),
        expenseGoal: Number(expGoal || 0),
      };
    } catch {
      return null;
    }
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

  const updateUser = (updatedFields) => {
    const updated = { ...user, ...updatedFields };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
    return updated;
  };

  const saveProfile = async (profileInput) => {
    const minExp = Number(
      profileInput.minimum_expense !== undefined
        ? profileInput.minimum_expense
        : profileInput.minimumExpense
    );
    const expGoal = Number(
      profileInput.expense_goal !== undefined
        ? profileInput.expense_goal
        : profileInput.expenseGoal
    );
    const salaryNum = Number(profileInput.salary);

    const payload = {
      salary: salaryNum,
      minimum_expense: minExp,
      expense_goal: expGoal,
    };

    const response = await api.post('/user/profile', payload);
    
    const profileData = {
      salary: salaryNum,
      minimum_expense: minExp,
      expense_goal: expGoal,
      minimumExpense: minExp,
      expenseGoal: expGoal,
    };
    
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    setProfile(profileData);
    return response?.data || profileData;
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
        updateUser,
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
