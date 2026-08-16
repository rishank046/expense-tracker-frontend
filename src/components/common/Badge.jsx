import React from 'react';
import { getCategoryByName } from '../../constants/categories';

export const CategoryBadge = ({ categoryName }) => {
  const cat = getCategoryByName(categoryName);
  const Icon = cat.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all duration-150 shadow-2xs hover:scale-[1.02] ${cat.bg} ${cat.color} ${cat.border}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{cat.name}</span>
    </span>
  );
};

export const StatusBadge = ({ variant = 'default', children }) => {
  const styles = {
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    default: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[variant] || styles.default}`}
    >
      {children}
    </span>
  );
};
