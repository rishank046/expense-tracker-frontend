import React from 'react';

export const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800 ${className}`}
      {...props}
    />
  );
};

export const CardSkeleton = () => (
  <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-9 w-9 rounded-xl" />
    </div>
    <Skeleton className="h-8 w-36" />
    <Skeleton className="h-3 w-48" />
  </div>
);

export const TableRowSkeleton = () => (
  <tr className="border-b border-slate-100 dark:border-slate-800/60">
    <td className="py-4 px-4"><Skeleton className="h-4 w-12" /></td>
    <td className="py-4 px-4"><Skeleton className="h-4 w-32" /></td>
    <td className="py-4 px-4"><Skeleton className="h-6 w-24 rounded-md" /></td>
    <td className="py-4 px-4"><Skeleton className="h-4 w-20" /></td>
    <td className="py-4 px-4"><Skeleton className="h-4 w-24" /></td>
    <td className="py-4 px-4 text-right"><Skeleton className="h-8 w-16 ml-auto rounded-lg" /></td>
  </tr>
);
