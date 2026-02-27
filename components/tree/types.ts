export type SkillCategory = 'html' | 'css' | 'javascript' | 'backend' | 'keystone';

export type SkillShape = 'hexagon' | 'circle' | 'square' | 'diamond';

export interface SkillData {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  category: SkillCategory;
  shape: SkillShape;
  isUnlocked: boolean;
  parentId?: string | null;
  positionX: number;
  positionY: number;


  label?: string;
  icon?: string;
  color?: string | null; 
  links?: { id: string; title: string; url: string | null }[];
  
  createdAt?: string | Date;
  updatedAt?: string | Date;
  
  [key: string]: unknown;
}

export const CATEGORY_THEME: Record<SkillCategory, {
  color: string;
  glow: string;
  border: string;
  label: string;
}> = {
  html:       { color: '#c8b89a', glow: 'rgba(200, 184, 154, 0.2)', border: '#3a3830', label: 'Structure (HTML)' },
  css:        { color: '#c8b89a', glow: 'rgba(200, 184, 154, 0.2)', border: '#3a3830', label: 'Styling (CSS)' },
  javascript: { color: '#c8b89a', glow: 'rgba(200, 184, 154, 0.3)', border: '#c8b89a', label: 'Logic (JS)' },
  backend:    { color: '#c8b89a', glow: 'rgba(200, 184, 154, 0.3)', border: '#c8b89a', label: 'Server (Node/DB)' },
  keystone:   { color: '#ddd8cc', glow: 'rgba(200, 184, 154, 0.6)', border: '#ddd8cc', label: 'Fundamentals' },
};

export interface SkillEdgeData {
  unlocked: boolean;
  category?: SkillCategory;
}

export const SHAPE_SIZE: Record<SkillShape, number> = {
  hexagon: 64,
  circle:  52,
  square:  52,
  diamond: 52,
};