export type SkillRow = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  category: string;
  shape: string;
  isUnlocked: boolean;
  parentId: string | null;
  positionX: number;
  positionY: number;
  contents: {
    id: string;
    type: string;
    title: string;
    url: string | null;
    fileKey: string | null;
    body: string | null;
    createdAt: Date;
  }[];
};