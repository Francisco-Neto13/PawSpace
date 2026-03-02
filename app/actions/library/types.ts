export type ContentInput = {
  skillId: string;
  userId?: string; 
  type: 'link' | 'video' | 'pdf' | 'note';
  title: string;
  url?: string;
  fileKey?: string;
  body?: string;
};