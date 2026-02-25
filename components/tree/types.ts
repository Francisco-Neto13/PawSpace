export type SkillCategory = 'html' | 'css' | 'javascript' | 'backend' | 'keystone';


export const CATEGORY_THEME: Record<SkillCategory, {
  color: string;
  glow: string;
  border: string;
  label: string;
}> = {
  html: { 
    color: '#e67e22', 
    glow: 'rgba(230,126,34,0.5)', 
    border: '#d35400', 
    label: 'Structure (HTML)' 
  },
  css: { 
    color: '#2ecc71', 
    glow: 'rgba(46,204,113,0.5)', 
    border: '#27ae60', 
    label: 'Styling (CSS)' 
  },
  javascript: { 
    color: '#f1c40f', 
    glow: 'rgba(241,196,15,0.5)', 
    border: '#f39c12', 
    label: 'Logic (JS)' 
  },
  backend: { 
    color: '#9b59b6', 
    glow: 'rgba(155,89,182,0.5)', 
    border: '#8e44ad', 
    label: 'Server (Node/DB)' 
  },
  keystone: { 
    color: '#f3f4f6', 
    glow: 'rgba(255,255,255,0.6)', 
    border: '#9ca3af', 
    label: 'Fundamentals' 
  },
};

export interface SkillData {
  label: string;
  icon: string;
  isUnlocked: boolean;
  level: number;
  xp: number;
  xpToNextLevel: number;
  description: string;
  category: SkillCategory;
  parentId?: string; 
  onSelect?: (data: SkillData) => void;
  [key: string]: any; 
}

export interface SkillEdgeData {
  unlocked: boolean;
  category?: SkillCategory;
  [key: string]: any;
}