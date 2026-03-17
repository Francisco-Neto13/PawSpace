export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'tree' | 'journal' | 'library' | 'progress';
  isUnlocked: boolean;
  progress?: {
    current: number;
    total: number;
  };
}