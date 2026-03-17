export type SkillShape = 'circle';

export interface SkillData {
  id: string;
  userId: string;
  name: string;
  label?: string;
  description?: string | null;
  category?: string; 
  shape: SkillShape;
  parentId?: string | null;
  positionX: number;
  positionY: number;
  icon?: string;
  color?: string | null; 
  links?: { id: string; title: string; url: string | null }[];
  contents?: { id: string }[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
  [key: string]: unknown;
}

export interface SkillEdgeData {
  category?: string;
  color?: string; 
}


export const SHAPE_SIZE: Record<SkillShape, number> = {
  circle: 52,
};
