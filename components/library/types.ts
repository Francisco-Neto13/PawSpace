export type ContentType = 'link' | 'pdf' | 'note' | 'video';

export interface Content {
  id: string;
  type: ContentType;
  title: string;
  url?: string | null;
  fileKey?: string | null;
  body?: string | null;
  createdAt: string;
}

export interface SkillNode {
  id: string;
  name: string;
  icon: string;
  color: string;
  contents: Content[];
}
