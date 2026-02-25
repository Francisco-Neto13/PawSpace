export interface SkillData {
  label: string;
  icon: string;
  isUnlocked: boolean;
  level: number;
  xp: number;
  xpToNextLevel: number;
  description: string;
  onSelect: (data: SkillData) => void;
}

export interface SkillEdgeData {
  unlocked: boolean;
}