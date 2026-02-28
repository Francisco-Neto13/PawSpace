export type ContentType = 'link' | 'pdf' | 'note' | 'video';

export interface Content {
  id: string;
  type: ContentType;
  title: string;
  url?: string;
  body?: string;
  createdAt: string;
}

export interface SkillNode {
  id: string;
  name: string;
  icon: string;
  color: string;
  isUnlocked: boolean;
  contents: Content[];
}