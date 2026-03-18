export type SkillRow = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  category: string;
  shape: string;
  parentId: string | null;
  positionX: number;
  positionY: number;
  contents: {
    id: string;
    type: string;
    title: string;
    url: string | null;
    body: string | null;
    createdAt: Date;
  }[];
};
