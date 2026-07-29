import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { CardSkeleton } from '../components/common/Skeleton';
import { CategoryBadge } from '../components/common/Badge';
import { formatCurrency } from '../utils/currency';
import { 
  BarChart3, 
  Calendar, 
  IndianRupee, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Filter, 
  PieChart as PieIcon,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const Analytics = () => {
  const toast = useToast();

  // Date Range state for GET /expense/getSummary
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Amount Threshold state for GET /expense/filterAmount
  const [amountThreshold, setAmountThreshold] = useState('500');

  // API Data States
  const [summaryData, setSummaryData] = useState({ totalExpense: 0, startDate: null, endDate: null });
  const [filteredAmountData, setFilteredAmountData] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch summary aggregation (`GET /expense/getSummary`)
  const fetchSummary = useCallback(async () => {
    try {
      const res = await api.get('/expense/getSummary', {
        params: { startDate, endDate },
      });
      setSummaryData(res.data || { totalExpense: 0, startDate: null, endDate: null });
    } catch (err) {
      toast.error(err.customMessage || 'Failed to fetch summary analytics');
    }
  }, [startDate, endDate, toast]);

  // Fetch threshold expenses (`GET /expense/filterAmount`)
  const fetchFilteredAmount = useCallback(async () => {
    if (!amountThreshold) return;
    try {
      const res = await api.get('/expense/filterAmount', {
        params: { amount: Number(amountThreshold) },
      });
      setFilteredAmountData(res.data || []);
    } catch (err) {
      toast.error(err.customMessage || 'Failed to fetch amount threshold analytics');
    }
  }, [amountThreshold, toast]);

  // Fetch overall expense history for category & stat calculations
  const fetchAllExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/expense/getExpense');
      setAllExpenses(res.data || []);
      await Promise.all([fetchSummary(), fetchFilteredAmount()]);
    } catch (err) {
      toast.error(err.customMessage || 'Failed to load analytics page');
    } finally {
      setLoading(false);
    }
  }, [fetchSummary, fetchFilteredAmount, toast]);

  useEffect(() => {
    fetchAllExpenses();
  }, [fetchAllExpenses]);

  // Key Analytics calculations
  const totalSpentInRange = Number(summaryData.totalExpense || 0);

  const stats = useMemo(() => {
    if (allExpenses.length === 0) {
      return { min: 0, max: 0, avg: 0, count: 0 };
    }
    const amounts = allExpenses.map((e) => Number(e.amount));
    const min = Math.min(...amounts);
    const max = Math.max(...amounts);
    const sum = amounts.reduce((acc, v) => acc + v, 0);
    const avg = sum / amounts.length;
    return { min, max, avg, count: amounts.length };
  }, [allExpenses]);

  // Category Aggregation Data for Chart
  const categoryChartData = useMemo(() => {
    const map = {};
    allExpenses.forEach((e) => {
      const cat = e.categoryName || 'Other';
      map[cat] = (map[cat] || 0) + Number(e.amount);
    });
    const COLORS = ['#3b82f6', '#6366f1', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6'];
    return Object.keys(map).map((k, i) => ({
      name: k,
      amount: map[k],
      color: COLORS[i % COLORS.length],
    }));
  }, [allExpenses]);

  return (
    <div className="space-y-6">
      {/* Header & Date Range Aggregation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Financial Aggregations & Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            SQL aggregate metrics powered by high-performance composite indexes.
          </p>
        </div>

        {/* Date Range Query Form (`GET /expense/getSummary`) */}
        <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-50 dark:bg-slate-800">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-500">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-slate-100 font-medium focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-50 dark:bg-slate-800">
            <span className="font-semibold text-slate-500">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-slate-100 font-medium focus:outline-none"
            />
          </div>
          <button
            onClick={fetchSummary}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
          >
            Apply Query
          </button>
        </div>
      </div>

      {/* Aggregated KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Date-Range Aggregation */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Range Total (SQL SUM)
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {formatCurrency(totalSpentInRange)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 truncate">
              {summaryData.startDate ? new Date(summaryData.startDate).toLocaleDateString() : 'Start'} &rarr;{' '}
              {summaryData.endDate ? new Date(summaryData.endDate).toLocaleDateString() : 'End'}
            </p>
          </div>

          {/* Average Expense per transaction */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Average Spend
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {formatCurrency(stats.avg)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Across {stats.count} total transactions
            </p>
          </div>

          {/* Minimum Expense Logged */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Smallest Expense
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {formatCurrency(stats.min)}
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
              Lowest recorded transaction
            </p>
          </div>

          {/* Maximum Expense Logged */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Largest Expense
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {formatCurrency(stats.max)}
            </div>
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-2 font-medium">
              Highest recorded transaction
            </p>
          </div>
        </div>
      )}

      {/* Category Bar Chart */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
          Category Total Aggregation
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Total amount spent grouped by expense category
        </p>

        {categoryChartData.length > 0 ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
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
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 flex items-center justify-center text-xs text-slate-400">
            No expense data available
          </div>
        )}
      </div>

      {/* Threshold Query Feature (`GET /expense/filterAmount`) */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Amount Ceiling Filter (`GET /expense/filterAmount`)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Query expenses with amount strictly less than or equal to threshold (₹).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-xs">
                ₹
              </span>
              <input
                type="number"
                placeholder="500"
                value={amountThreshold}
                onChange={(e) => setAmountThreshold(e.target.value)}
                className="w-32 pl-7 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={fetchFilteredAmount}
              className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              Run Filter Query
            </button>
          </div>
        </div>

        {/* Results List */}
        {filteredAmountData.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No expenses found under {formatCurrency(amountThreshold)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[10px] font-bold text-slate-400 tracking-wider">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Description</th>
                  <th className="py-3 px-4">Date Logged</th>
                  <th className="py-3 px-4 text-right rounded-r-xl">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredAmountData.slice(0, 10).map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {item.description}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
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
