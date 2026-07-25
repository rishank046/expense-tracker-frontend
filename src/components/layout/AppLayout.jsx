import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { ExpenseModal } from '../expense/ExpenseModal';

export const AppLayout = ({ onRefreshData }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const location = useLocation();

  // Get current page title based on path
  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/':
      case '/dashboard':
        return 'Executive Overview';
      case '/expenses':
        return 'Expenses Management';
      case '/analytics':
        return 'Financial Analytics';
      case '/budgets':
        return 'Budgets & Financial Goals';
      case '/profile':
        return 'Profile & Settings';
      default:
        return 'Dashboard';
    }
  };

  const title = getPageTitle(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        onOpenAddExpense={() => setIsAddExpenseOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Navbar
          title={title}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenAddExpense={() => setIsAddExpenseOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet context={{ onOpenAddExpense: () => setIsAddExpenseOpen(true) }} />
        </main>
      </div>

      {/* Quick Add Expense Modal */}
      <ExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onSuccess={() => {
          if (onRefreshData) onRefreshData();
          // Dispatch custom event for views to reload expense history
          window.dispatchEvent(new Event('expenseUpdated'));
        }}
      />
    </div>
  );
};
