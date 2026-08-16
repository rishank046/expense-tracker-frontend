import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CardSkeleton, TableRowSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { CategoryBadge } from '../components/common/Badge';
import { formatCurrency } from '../utils/currency';
import { 
  IndianRupee, 
  TrendingUp, 
  Wallet, 
  Target, 
  Calendar, 
  ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const Dashboard = () => {
  const { profile, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { onOpenAddExpense } = useOutletContext() || {};

  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({ totalExpense: 0 });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days'); // 7days, 30days, ytd, all

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch expenses history
      const expRes = await api.get('/expense/getExpense');
      setExpenses(expRes.data || []);

      // 2. Compute date range filters for summary
      const now = new Date();
      let startDate = '1970-01-01';
      let endDate = '2099-12-31';

      if (timeRange === '7days') {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        startDate = d.toISOString().split('T')[0];
      } else if (timeRange === '30days') {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        startDate = d.toISOString().split('T')[0];
      } else if (timeRange === 'ytd') {
        startDate = `${now.getFullYear()}-01-01`;
      }

      // Fetch summary
      const sumRes = await api.get('/expense/getSummary', {
        params: { startDate, endDate },
      });
      setSummary(sumRes.data || { totalExpense: 0 });
    } catch (err) {
      toast.error(err.customMessage || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [timeRange, toast]);

  useEffect(() => {
    fetchData();
    const handleExpenseUpdate = () => fetchData();
    window.addEventListener('expenseUpdated', handleExpenseUpdate);
    return () => window.removeEventListener('expenseUpdated', handleExpenseUpdate);
  }, [fetchData]);

  // Derived financial analytics
  const totalAmountSpent = Number(summary.totalExpense || 0);
  const salary = Number(profile?.salary || 5000);
  const expenseGoal = Number(profile?.expenseGoal || 3000);

  const budgetRemaining = salary - totalAmountSpent;
  const goalUsagePercentage = Math.min(Math.round((totalAmountSpent / (expenseGoal || salary)) * 100), 100);

  // Category breakdown for Pie Chart
  const categoryData = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const cat = e.categoryName || 'Other';
      map[cat] = (map[cat] || 0) + Number(e.amount);
    });

    const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#64748b'];
    return Object.keys(map).map((key, index) => ({
      name: key,
      value: map[key],
      color: COLORS[index % COLORS.length],
    }));
  }, [expenses]);

  // Daily trend data for Area Chart
  const trendData = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      if (!e.created_at) return;
      const dateStr = new Date(e.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      map[dateStr] = (map[dateStr] || 0) + Number(e.amount);
    });

    return Object.keys(map)
      .reverse()
      .slice(0, 10)
      .map((date) => ({ date, amount: map[date] }));
  }, [expenses]);

  return (
    <div className="space-y-6">
      {/* Header Welcome & Quick Date Range Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Welcome back, {user?.name || 'Rishank'} 👋
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Here is your financial summary and expense analytics overview.
          </p>
        </div>

        {/* Time Range Filter Buttons */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 text-xs font-medium self-start sm:self-auto">
          {[
            { id: '7days', label: '7 Days' },
            { id: '30days', label: '30 Days' },
            { id: 'ytd', label: 'YTD' },
            { id: 'all', label: 'All Time' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeRange(t.id)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === t.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Financial Key Metric Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Expenses */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs card-hover-effect relative overflow-hidden group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Expenses
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-transform group-hover:scale-110">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {formatCurrency(totalAmountSpent)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {summary.startDate ? new Date(summary.startDate).toLocaleDateString() : 'All'} -{' '}
                {summary.endDate ? new Date(summary.endDate).toLocaleDateString() : 'Present'}
              </span>
            </p>
          </div>

          {/* Monthly Budget / Salary */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs card-hover-effect group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Monthly Income / Salary
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-transform group-hover:scale-110">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {formatCurrency(salary)}
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
              Base salary baseline
            </p>
          </div>

          {/* Budget Remaining */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs card-hover-effect group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Budget Remaining
              </span>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                  budgetRemaining >= 0
                    ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                }`}
              >
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div
              className={`text-2xl font-bold tracking-tight ${
                budgetRemaining >= 0
                  ? 'text-slate-900 dark:text-slate-100'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {formatCurrency(budgetRemaining)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {budgetRemaining >= 0 ? 'Within budget bounds' : 'Exceeded monthly income!'}
            </p>
          </div>

          {/* Target Goal Limit */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs card-hover-effect group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Expense Goal Target
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center transition-transform group-hover:scale-110">
                <Target className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {formatCurrency(expenseGoal)}
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ease-out ${
                  goalUsagePercentage > 85
                    ? 'bg-rose-500'
                    : goalUsagePercentage > 65
                    ? 'bg-amber-500'
                    : 'bg-blue-600'
                }`}
                style={{ width: `${goalUsagePercentage}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense Spending Trend over time (Area Chart) */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Spending Trend
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daily expense timeline aggregated by transaction timestamps
              </p>
            </div>
          </div>

          {trendData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '0.75rem',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorAmount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              No trend data available for selected date range
            </div>
          )}
        </div>

        {/* Category Share Breakdown (Pie Chart) */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
              Category Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Breakdown by expense categories
            </p>

            {categoryData.length > 0 ? (
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#1e293b',
                        borderRadius: '0.75rem',
                        color: '#f8fafc',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-52 flex items-center justify-center text-xs text-slate-400">
                No categorical expenses logged yet
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            {categoryData.slice(0, 4).map((c) => (
              <div key={c.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-slate-600 dark:text-slate-400 truncate">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Expenses Table Preview */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Recent Transactions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Latest expense entries recorded in database
            </p>
          </div>
          <button
            onClick={() => navigate('/expenses')}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <span>View All</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-2">
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
          </div>
        ) : expenses.length === 0 ? (
          <EmptyState onAction={onOpenAddExpense} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[10px] font-bold text-slate-400 tracking-wider">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">ID</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right rounded-r-xl">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {expenses.slice(0, 5).map((item) => (
                  <tr
                    key={item.expenseId || item.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-400">
                      #{item.expenseId || item.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {item.description}
                    </td>
                    <td className="py-3.5 px-4">
                      <CategoryBadge categoryName={item.categoryName} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(item.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
