import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import { formatCurrency } from '../utils/currency';
import { 
  Wallet, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Save, 
  Loader2,
  ShieldCheck
} from 'lucide-react';

export const Budgets = () => {
  const { profile, saveProfile } = useAuth();
  const toast = useToast();

  // Form Inputs
  const [salary, setSalary] = useState(profile?.salary || 5000);
  const [minimumExpense, setMinimumExpense] = useState(profile?.minimumExpense || 1000);
  const [expenseGoal, setExpenseGoal] = useState(profile?.expenseGoal || 3000);
  const [loading, setLoading] = useState(false);

  // Actual Expenses Summary State
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    const fetchSpent = async () => {
      try {
        const res = await api.get('/expense/getSummary');
        setTotalSpent(Number(res.data?.totalExpense || 0));
      } catch (err) {
        console.error('Error fetching summary:', err);
      }
    };
    fetchSpent();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (Number(salary) <= 0 || Number(minimumExpense) <= 0 || Number(expenseGoal) <= 0) {
      toast.error('All budget targets must be positive numbers greater than 0');
      return;
    }

    setLoading(true);
    try {
      await saveProfile({
        salary: Number(salary),
        minimum_expense: Number(minimumExpense),
        expense_goal: Number(expenseGoal),
      });
      toast.success('Financial profile and budget goals updated successfully');
    } catch (err) {
      toast.error(err.customMessage || 'Failed to update financial profile');
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const curSalary = Number(profile?.salary || salary);
  const curMinExpense = Number(profile?.minimumExpense || minimumExpense);
  const curGoal = Number(profile?.expenseGoal || expenseGoal);

  const budgetUsedPct = Math.min(Math.round((totalSpent / (curGoal || 1)) * 100), 100);
  const isOverBudget = totalSpent > curGoal;
  const isBelowMin = totalSpent < curMinExpense;
  const netSavings = curSalary - totalSpent;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Budgets & Financial Goal Management
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure salary targets, minimum expense baselines, and spending ceilings.
        </p>
      </div>

      {/* Budget Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Budget Health Card */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs card-hover-effect space-y-4 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Budget Health
            </span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                isOverBudget
                  ? 'bg-rose-500/10 text-rose-500'
                  : 'bg-emerald-500/10 text-emerald-500'
              }`}
            >
              {isOverBudget ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
          </div>

          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {isOverBudget ? 'Exceeded Goal' : 'On Track'}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              You have used <span className="font-bold text-slate-900 dark:text-slate-100">{budgetUsedPct}%</span> of your {formatCurrency(curGoal)} expense goal ceiling.
            </p>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ease-out ${
                isOverBudget ? 'bg-rose-500' : budgetUsedPct > 75 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${budgetUsedPct}%` }}
            />
          </div>
        </div>

        {/* Projected Monthly Savings Card */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs card-hover-effect space-y-4 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Net Savings Capacity
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-transform group-hover:scale-110">
              <Wallet className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(netSavings)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Monthly Income ({formatCurrency(curSalary)}) minus Total Spent ({formatCurrency(totalSpent)})
            </p>
          </div>

          <div className="pt-2 text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>Savings Rate: {Math.max(Math.round((netSavings / (curSalary || 1)) * 100), 0)}%</span>
          </div>
        </div>

        {/* Minimum Expense Baseline */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs card-hover-effect space-y-4 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Essential Expenses
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition-transform group-hover:scale-110">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(curMinExpense)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Minimum mandatory baseline (rent, food, utilities)
            </p>
          </div>

          <div className="text-xs text-slate-500">
            {isBelowMin ? 'Spending is below mandatory threshold' : 'Essential expenses covered'}
          </div>
        </div>
      </div>

      {/* Target Settings Form Card (`POST /user/profile`) */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm max-w-2xl">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
          Financial Targets Configuration
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Update your parameters stored in the database (`POST /user/profile`).
        </p>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          {/* Monthly Salary */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Monthly Income / Salary (₹)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-semibold text-sm">
                ₹
              </span>
              <input
                type="number"
                min="1"
                required
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              />
            </div>
          </div>

          {/* Minimum Expense */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Minimum Required Expense (₹)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-semibold text-sm">
                ₹
              </span>
              <input
                type="number"
                min="1"
                required
                value={minimumExpense}
                onChange={(e) => setMinimumExpense(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              />
            </div>
          </div>

          {/* Expense Goal Ceiling */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Monthly Expense Goal Limit (₹)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-semibold text-sm">
                ₹
              </span>
              <input
                type="number"
                min="1"
                required
                value={expenseGoal}
                onChange={(e) => setExpenseGoal(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Financial Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
