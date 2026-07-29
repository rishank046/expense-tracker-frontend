import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { TableRowSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { CategoryBadge } from '../components/common/Badge';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ExpenseModal } from '../components/expense/ExpenseModal';
import { CATEGORIES } from '../constants/categories';
import { formatCurrency } from '../utils/currency';
import { 
  Search, 
  Filter, 
  Plus, 
  Pencil, 
  Trash2, 
  Download, 
  ArrowUpDown, 
  SlidersHorizontal,
  RefreshCw,
  X
} from 'lucide-react';

export const Expenses = () => {
  const toast = useToast();
  const { onOpenAddExpense } = useOutletContext() || {};

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [maxAmountFilter, setMaxAmountFilter] = useState('');
  const [isFilterAmountActive, setIsFilterAmountActive] = useState(false);
  const [sortField, setSortField] = useState('created_at'); // created_at, amount, description
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch all expenses from GET /expense/getExpense
  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      if (isFilterAmountActive && maxAmountFilter) {
        // Use GET /expense/filterAmount
        const res = await api.get('/expense/filterAmount', {
          params: { amount: Number(maxAmountFilter) },
        });
        setExpenses(res.data || []);
      } else {
        const res = await api.get('/expense/getExpense');
        setExpenses(res.data || []);
      }
    } catch (err) {
      toast.error(err.customMessage || 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  }, [isFilterAmountActive, maxAmountFilter, toast]);

  useEffect(() => {
    fetchExpenses();
    const handleExpenseUpdate = () => fetchExpenses();
    window.addEventListener('expenseUpdated', handleExpenseUpdate);
    return () => window.removeEventListener('expenseUpdated', handleExpenseUpdate);
  }, [fetchExpenses]);

  // Handle Amount Filter Apply (`GET /expense/filterAmount`)
  const handleApplyAmountFilter = (e) => {
    e.preventDefault();
    if (!maxAmountFilter || Number(maxAmountFilter) <= 0) {
      toast.error('Please enter a valid amount threshold');
      return;
    }
    setIsFilterAmountActive(true);
  };

  const handleClearAmountFilter = () => {
    setMaxAmountFilter('');
    setIsFilterAmountActive(false);
  };

  // Delete Action (`POST /expense/deleteExpense`)
  const handleDeleteConfirm = async () => {
    if (!expenseToDelete) return;
    setDeleteLoading(true);
    try {
      const expenseId = expenseToDelete.expenseId || expenseToDelete.id;
      await api.post('/expense/deleteExpense', { expenseId });
      toast.success('Expense deleted successfully');
      setIsDeleteConfirmOpen(false);
      setExpenseToDelete(null);
      fetchExpenses();
    } catch (err) {
      toast.error(err.customMessage || 'Failed to delete expense');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Client-side filtering & sorting
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((item) => {
        // Search query check
        const matchesSearch =
          (item.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.categoryName || '').toLowerCase().includes(searchTerm.toLowerCase());

        // Category check
        const matchesCategory =
          selectedCategory === 'ALL' ||
          (item.categoryName || '').toLowerCase() === selectedCategory.toLowerCase();

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];

        if (sortField === 'amount') {
          aVal = Number(aVal);
          bVal = Number(bVal);
        } else if (sortField === 'created_at') {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        } else {
          aVal = (aVal || '').toString().toLowerCase();
          bVal = (bVal || '').toString().toLowerCase();
        }

        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [expenses, searchTerm, selectedCategory, sortField, sortOrder]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage) || 1;
  const paginatedExpenses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredExpenses.slice(start, start + itemsPerPage);
  }, [filteredExpenses, currentPage, itemsPerPage]);

  // CSV Export Utility
  const handleExportCSV = () => {
    if (filteredExpenses.length === 0) {
      toast.info('No expenses available to export');
      return;
    }
    const headers = ['Expense ID', 'Description', 'Category', 'Amount (₹)', 'Date'];
    const rows = filteredExpenses.map((e) => [
      e.expenseId || e.id || '',
      `"${(e.description || '').replace(/"/g, '""')}"`,
      `"${e.categoryName || 'Other'}"`,
      e.amount,
      e.created_at ? new Date(e.created_at).toISOString() : '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `expense_tracker_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Expense report exported successfully');
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Expenses History & Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            View, search, filter, update, and manage your complete expense log.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenAddExpense}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search, Category Filter & Amount Filter */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search description..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Category Dropdown Filter */}
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Backend Filter Amount Form (`GET /expense/filterAmount`) */}
          <form onSubmit={handleApplyAmountFilter} className="flex items-center gap-1.5 col-span-1 lg:col-span-2">
            <div className="relative flex-1">
              <SlidersHorizontal className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                placeholder="Max Amount Filter (₹)..."
                value={maxAmountFilter}
                onChange={(e) => setMaxAmountFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              Filter
            </button>
            {isFilterAmountActive && (
              <button
                type="button"
                onClick={handleClearAmountFilter}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Clear Amount Filter"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>

        {/* Active Filter Pill */}
        {isFilterAmountActive && (
          <div className="flex items-center gap-2 pt-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
            <span className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center gap-1.5">
              Showing expenses &le; {formatCurrency(maxAmountFilter)}
              <X className="w-3.5 h-3.5 cursor-pointer hover:text-rose-500" onClick={handleClearAmountFilter} />
            </span>
          </div>
        )}
      </div>

      {/* Main Expenses Table Card */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        {loading ? (
          <div className="space-y-2">
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
          </div>
        ) : filteredExpenses.length === 0 ? (
          <EmptyState onAction={onOpenAddExpense} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[10px] font-bold text-slate-400 tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 rounded-l-xl">ID</th>
                    <th
                      className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                      onClick={() => {
                        setSortField('description');
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <span>Description</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4">Category</th>
                    <th
                      className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                      onClick={() => {
                        setSortField('created_at');
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <span>Date</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                      onClick={() => {
                        setSortField('amount');
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Amount</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4 text-right rounded-r-xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {paginatedExpenses.map((item) => (
                    <tr
                      key={item.expenseId || item.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-400">
                        #{item.expenseId || item.id}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100 max-w-xs truncate">
                        {item.description}
                      </td>
                      <td className="py-3.5 px-4">
                        <CategoryBadge categoryName={item.categoryName} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-slate-100">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => {
                            setExpenseToEdit(item);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Expense"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setExpenseToDelete(item);
                            setIsDeleteConfirmOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredExpenses.length)} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredExpenses.length)} of {filteredExpenses.length} entries
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 font-semibold text-slate-900 dark:text-slate-100">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Edit Expense Modal */}
      {isEditModalOpen && (
        <ExpenseModal
          isOpen={isEditModalOpen}
          expenseToEdit={expenseToEdit}
          onClose={() => {
            setIsEditModalOpen(false);
            setExpenseToEdit(null);
          }}
          onSuccess={() => fetchExpenses()}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteConfirmOpen && (
        <ConfirmDialog
          isOpen={isDeleteConfirmOpen}
          onClose={() => {
            setIsDeleteConfirmOpen(false);
            setExpenseToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          isLoading={deleteLoading}
          title="Delete Expense Entry"
          message={`Are you sure you want to delete "${expenseToDelete?.description}" (${formatCurrency(expenseToDelete?.amount)})? This operation cannot be reversed.`}
        />
      )}
    </div>
  );
};
