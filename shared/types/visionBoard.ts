export type Category =
  | 'Tech'
  | 'Travel'
  | 'Health & Fitness'
  | 'Family'
  | 'Fashion'
  | 'Home'
  | 'Food & Drink'
  | 'Automotive'
  | 'Entertainment'
  | 'Other';

export const CATEGORIES: Category[] = [
  'Tech',
  'Travel',
  'Health & Fitness',
  'Family',
  'Fashion',
  'Home',
  'Food & Drink',
  'Automotive',
  'Entertainment',
  'Other',
];

export const CATEGORY_COLOURS: Record<Category, string> = {
  'Tech': 'bg-blue-500/90',
  'Travel': 'bg-amber-500/90',
  'Health & Fitness': 'bg-green-500/90',
  'Family': 'bg-purple-500/90',
  'Fashion': 'bg-pink-500/90',
  'Home': 'bg-orange-500/90',
  'Food & Drink': 'bg-red-500/90',
  'Automotive': 'bg-slate-500/90',
  'Entertainment': 'bg-indigo-500/90',
  'Other': 'bg-neutral-500/90',
};

export interface VisionBoardItem {
  id: string;
  url: string;
  title: string;
  price: string | null;
  description: string | null;
  imageUrl: string | null;
  category: Category;
  domain: string;
  createdAt: string;
}

export interface ScrapeResult {
  title: string;
  price: string | null;
  description: string | null;
  imageUrl: string | null;
  domain: string;
}
