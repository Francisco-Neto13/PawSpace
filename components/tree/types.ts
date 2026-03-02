export type SkillShape = 'hexagon' | 'circle' | 'square' | 'diamond';

export interface SkillData {
  id: string;
  userId: string;
  name: string;
  label?: string;
  description?: string | null;
  category?: string; 
  shape: SkillShape;
  isUnlocked: boolean;
  parentId?: string | null;
  positionX: number;
  positionY: number;
  icon?: string;
  color?: string | null; 
  links?: { id: string; title: string; url: string | null }[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
  [key: string]: unknown;
}

export interface SkillEdgeData {
  unlocked: boolean;
  color?: string; 
}

export const SHAPE_SIZE: Record<SkillShape, number> = {
  hexagon: 64,
  circle:  52,
  square:  52,
  diamond: 52,
};