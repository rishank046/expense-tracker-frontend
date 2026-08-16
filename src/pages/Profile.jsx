import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import { formatCurrency } from '../utils/currency';
import { 
  User, 
  Mail, 
  Moon, 
  Sun, 
  LogOut, 
  Activity, 
  CheckCircle2, 
  Database,
  Pencil,
  Save,
  X,
  Loader2,
  Wallet,
  Check
} from 'lucide-react';

export const Profile = () => {
  const { user, profile, saveProfile, updateUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [apiHealth, setApiHealth] = useState('checking');
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    salary: profile?.salary || 5000,
    minimumExpense: profile?.minimumExpense || 1000,
    expenseGoal: profile?.expenseGoal || 3000,
  });

  // Sync form data if user or profile state changes from outside
  useEffect(() => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      salary: profile?.salary || 5000,
      minimumExpense: profile?.minimumExpense || 1000,
      expenseGoal: profile?.expenseGoal || 3000,
    });
  }, [user, profile]);

  useEffect(() => {
    const checkApi = async () => {
      try {
        await api.get('/expense/getSummary');
        setApiHealth('online');
      } catch {
        setApiHealth('error');
      }
    };
    checkApi();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Email cannot be empty');
      return;
    }
    if (Number(formData.salary) <= 0 || Number(formData.minimumExpense) <= 0 || Number(formData.expenseGoal) <= 0) {
      toast.error('Salary and expense goals must be positive numbers');
      return;
    }

    setSaving(true);
    try {
      // 1. Update user info (name, email)
      updateUser({ name: formData.name.trim(), email: formData.email.trim() });

      // 2. Save financial profile targets
      await saveProfile({
        salary: Number(formData.salary),
        minimumExpense: Number(formData.minimumExpense),
        expenseGoal: Number(formData.expenseGoal),
      });

      toast.success('Profile and financial targets saved successfully!');
      setIsEditing(false);
    } catch (err) {
      toast.error(err.customMessage || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            User Profile & Settings
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your personal profile details, budget targets, and app preferences.
          </p>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {/* Main Profile Info Card / Edit Form */}
      {isEditing ? (
        <div className="p-6 rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-white dark:bg-slate-900 shadow-md animate-fade-in space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Edit Account & Financial Profile</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmitProfile} className="space-y-5">
            {/* Account Details Section */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Personal Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Financial Targets Section */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Financial Profile & Budget Targets
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Salary (₹)
                  </label>
                  <input
                    type="number"
                    name="salary"
                    min="1"
                    required
                    value={formData.salary}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Minimum Expense (₹)
                  </label>
                  <input
                    type="number"
                    name="minimumExpense"
                    min="1"
                    required
                    value={formData.minimumExpense}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expense Goal Limit (₹)
                  </label>
                  <input
                    type="number"
                    name="expenseGoal"
                    min="1"
                    required
                    value={formData.expenseGoal}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Form Action Buttons */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Profile Changes</span>
              </button>

              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Read-Only Account Info Card */
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xl font-bold uppercase shadow-lg shadow-blue-500/20">
              {user?.name?.[0] || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{user?.name || 'User'}</h3>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="Edit User Info"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user?.email}</span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  Session Active
                </span>
                {profile ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    <Check className="w-3 h-3" />
                    Profile Configured
                  </span>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
                  >
                    Set Profile Targets
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={logout}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-300 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Financial Targets Overview Card */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-blue-600" />
            <span>Financial Target Parameters</span>
          </h3>
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <Pencil className="w-3 h-3" />
            <span>{profile ? 'Modify Goals' : 'Set Profile Goals'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Monthly Income</span>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100 block mt-0.5">
              {formatCurrency(profile?.salary || formData.salary)}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Min. Expense Baseline</span>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100 block mt-0.5">
              {formatCurrency(profile?.minimumExpense || formData.minimumExpense)}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Expense Goal Ceiling</span>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100 block mt-0.5">
              {formatCurrency(profile?.expenseGoal || formData.expenseGoal)}
            </span>
          </div>
        </div>
      </div>

      {/* Preferences & System Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appearance Settings */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Appearance & Theme</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Switch between light and dark theme mode for comfortable view contrast.
          </p>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-2.5">
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-blue-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
              <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                {theme === 'dark' ? 'Dark Mode Active' : 'Light Mode Active'}
              </span>
            </div>

            <button
              onClick={toggleTheme}
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors"
            >
              Toggle Mode
            </button>
          </div>
        </div>

        {/* System Diagnostics */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span>Backend API Diagnostics</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time status check for Node.js / Express 5 API server.
          </p>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-400" />
              <span className="font-medium text-slate-700 dark:text-slate-300">
                MySQL 8.0 Connection Pool
              </span>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full font-semibold ${
                apiHealth === 'online'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              }`}
            >
              {apiHealth === 'online' ? 'Healthy (Connected)' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
