export type Category = 'Food' | 'Transport' | 'Shopping' | 'Entertainment' | 'Health' | 'Bills' | 'Other';

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  description: string;
  date: string; // ISO string
}

export const CATEGORIES: Category[] = [
  'Food',
  'Transport',
  'Shopping',
  'Entertainment',
  'Health',
  'Bills',
  'Other',
];

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: '#f87171',
  Transport: '#fb923c',
  Shopping: '#fbbf24',
  Entertainment: '#4ade80',
  Health: '#2dd4bf',
  Bills: '#60a5fa',
  Other: '#a78bfa',
};
