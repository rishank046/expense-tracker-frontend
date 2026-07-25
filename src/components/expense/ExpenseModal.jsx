import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { CATEGORIES } from '../../constants/categories';
import { Loader2 } from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';

export const ExpenseModal = ({ isOpen, onClose, expenseToEdit = null, onSuccess }) => {
  const toast = useToast();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expenseToEdit) {
      setAmount(expenseToEdit.amount || '');
      setDescription(expenseToEdit.description || '');
      
      // Find category ID by name if needed
      const foundCat = CATEGORIES.find(
        (c) => c.name.toLowerCase() === (expenseToEdit.categoryName || '').toLowerCase()
      );
      setCategoryId(foundCat ? foundCat.id : 1);
    } else {
      setAmount('');
      setDescription('');
      setCategoryId(1);
    }
  }, [expenseToEdit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      toast.error('Please enter a valid expense amount');
      return;
    }
    if (!description.trim()) {
      toast.error('Please enter a description for the expense');
      return;
    }

    setLoading(true);

    try {
      if (expenseToEdit) {
        // Edit existing expense
        const expenseId = expenseToEdit.expenseId || expenseToEdit.id;
        
        // Update amount if changed
        if (Number(amount) !== Number(expenseToEdit.amount)) {
          await api.put('/expense/updateExpense', {
            expenseId,
            column: 'amount',
            value: Number(amount),
          });
        }

        // Update description if changed
        if (description.trim() !== expenseToEdit.description) {
          await api.put('/expense/updateExpense', {
            expenseId,
            column: 'description',
            value: description.trim(),
          });
        }

        // Update category if changed
        const currentCat = CATEGORIES.find(
          (c) => c.name.toLowerCase() === (expenseToEdit.categoryName || '').toLowerCase()
        );
        if (!currentCat || currentCat.id !== Number(categoryId)) {
          await api.put('/expense/updateExpense', {
            expenseId,
            column: 'category_id',
            value: Number(categoryId),
          });
        }

        toast.success('Expense updated successfully');
      } else {
        // Add new expense
        await api.post('/expense/addExpense', {
          amount: Number(amount),
          description: description.trim(),
          categoryId: Number(categoryId),
        });

        toast.success('Expense added successfully');
      }

      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.customMessage || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={expenseToEdit ? 'Edit Expense' : 'Add New Expense'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Amount ($)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-semibold text-sm">
              $
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = Number(categoryId) === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all text-left ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${cat.color}`} />
                  <span className="truncate">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Description
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Grocery shopping at Whole Foods"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{expenseToEdit ? 'Save Changes' : 'Add Expense'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
