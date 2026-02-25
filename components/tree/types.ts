export type SkillCategory = 'strength' | 'dexterity' | 'intelligence' | 'support' | 'keystone';

export const CATEGORY_THEME: Record<SkillCategory, {
  color: string;
  glow: string;
  border: string;
  label: string;
}> = {
  strength:     { color: '#e85d3a', glow: 'rgba(232,93,58,0.5)',   border: '#c0392b', label: 'Strength'     },
  dexterity:    { color: '#2ecc71', glow: 'rgba(46,204,113,0.5)',  border: '#27ae60', label: 'Dexterity'    },
  intelligence: { color: '#5b9cf6', glow: 'rgba(91,156,246,0.5)',  border: '#2980b9', label: 'Intelligence' },
  support:      { color: '#b0b8c8', glow: 'rgba(176,184,200,0.3)', border: '#7f8c9a', label: 'Support'      },
  keystone:     { color: '#f1c40f', glow: 'rgba(241,196,15,0.6)',  border: '#d4ac0d', label: 'Keystone'     },
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
  onSelect: (data: SkillData) => void;
  [key: string]: any; 
}

export interface SkillEdgeData {
  unlocked: boolean;
  category?: SkillCategory;
  [key: string]: any;
}