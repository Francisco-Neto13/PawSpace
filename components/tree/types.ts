export type SkillCategory = 'html' | 'css' | 'javascript' | 'backend' | 'keystone';

export const CATEGORY_THEME: Record<SkillCategory, {
  color: string;
  glow: string;
  border: string;
  label: string;
}> = {
  html: { 
    color: '#c8b89a', 
    glow: 'rgba(200, 184, 154, 0.2)', 
    border: '#3a3830', 
    label: 'Structure (HTML)' 
  },
  css: { 
    color: '#c8b89a', 
    glow: 'rgba(200, 184, 154, 0.2)', 
    border: '#3a3830', 
    label: 'Styling (CSS)' 
  },
  javascript: { 
    color: '#c8b89a', 
    glow: 'rgba(200, 184, 154, 0.3)', 
    border: '#c8b89a', 
    label: 'Logic (JS)' 
  },
  backend: { 
    color: '#c8b89a', 
    glow: 'rgba(200, 184, 154, 0.3)', 
    border: '#c8b89a', 
    label: 'Server (Node/DB)' 
  },
  keystone: { 
    color: '#ddd8cc', 
    glow: 'rgba(200, 184, 154, 0.6)', 
    border: '#ddd8cc', 
    label: 'Fundamentals' 
  },
};

export interface SkillData {
  label: string;
  icon: string;
  isUnlocked: boolean;
  description: string;
  category: SkillCategory;
  parentId?: string;
  links?: { label: string; url: string }[]; 
  onSelect?: (data: SkillData) => void;
  [key: string]: any; 
}

export interface SkillEdgeData {
  unlocked: boolean;
  category?: SkillCategory;
  [key: string]: any;
}