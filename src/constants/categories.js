import { 
  Utensils, 
  ShoppingBag, 
  Receipt, 
  Car, 
  Film, 
  Activity, 
  GraduationCap, 
  Sparkles, 
  Plane, 
  Folder 
} from 'lucide-react';

export const CATEGORIES = [
  { id: 1, name: 'Food & Dining', icon: Utensils, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { id: 2, name: 'Shopping', icon: ShoppingBag, color: 'text-ecru-500 text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  { id: 3, name: 'Bills & Utilities', icon: Receipt, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { id: 4, name: 'Transportation', icon: Car, color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  { id: 5, name: 'Entertainment', icon: Film, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  { id: 6, name: 'Healthcare', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { id: 7, name: 'Education', icon: GraduationCap, color: 'text-cyan-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  { id: 8, name: 'Personal Care', icon: Sparkles, color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
  { id: 9, name: 'Travel', icon: Plane, color: 'text-teal-500', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
  { id: 10, name: 'Other', icon: Folder, color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
];

export const getCategoryByName = (name) => {
  if (!name) return CATEGORIES[9]; // Other
  const found = CATEGORIES.find(c => c.name.toLowerCase() === name.toLowerCase());
  return found || CATEGORIES[9];
};

export const getCategoryById = (id) => {
  const numId = Number(id);
  const found = CATEGORIES.find(c => c.id === numId);
  return found || CATEGORIES[9];
};
