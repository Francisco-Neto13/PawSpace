import { Link2, FileText, StickyNote, Video } from 'lucide-react';
import React from 'react';
import { ContentType, SkillNode } from './types';

export const TYPE_CONFIG: Record<ContentType, { icon: React.ReactNode; label: string; color: string }> = {
  link:  { icon: <Link2 size={13} />,      label: 'Link',   color: '#c8b89a' },
  pdf:   { icon: <FileText size={13} />,   label: 'PDF',    color: '#c8b89a' },
  note:  { icon: <StickyNote size={13} />, label: 'Nota',   color: '#c8b89a' },
  video: { icon: <Video size={13} />,      label: 'Vídeo',  color: '#c8b89a' },
};

export const FILTER_OPTIONS: { value: ContentType | 'all'; label: string }[] = [
  { value: 'all',   label: 'Todos'  },
  { value: 'link',  label: 'Links'  },
  { value: 'pdf',   label: 'PDFs'   },
  { value: 'note',  label: 'Notas'  },
  { value: 'video', label: 'Vídeos' },
];

export const MOCK_NODES: SkillNode[] = [
  {
    id: '1', name: 'TypeScript', icon: '⚡', color: '#3b82f6', isUnlocked: true,
    contents: [
      { id: 'c1', type: 'link',  title: 'TypeScript Handbook Oficial', url: 'https://typescriptlang.org', createdAt: '2025-01-10' },
      { id: 'c2', type: 'video', title: 'TypeScript em 1 hora', url: 'https://youtube.com', createdAt: '2025-01-12' },
      { id: 'c3', type: 'note',  title: 'Anotações sobre Generics', body: 'Generics permitem criar componentes reutilizáveis e com tipagem forte, evitando duplicação de código...', createdAt: '2025-01-14' },
    ],
  },
  {
    id: '2', name: 'React Avançado', icon: '⚛', color: '#06b6d4', isUnlocked: true,
    contents: [
      { id: 'c4', type: 'pdf',  title: 'React Patterns PDF', url: '/files/react-patterns.pdf', createdAt: '2025-01-20' },
      { id: 'c5', type: 'link', title: 'React Docs Beta', url: 'https://react.dev', createdAt: '2025-01-21' },
    ],
  },
  {
    id: '3', name: 'Node.js', icon: '🟢', color: '#22c55e', isUnlocked: true,
    contents: [
      { id: 'c6', type: 'note', title: 'Event Loop — Resumo', body: 'O event loop é o mecanismo que permite ao Node.js realizar operações não-bloqueantes...', createdAt: '2025-01-25' },
    ],
  },
  {
    id: '4', name: 'Banco de Dados', icon: '🗄', color: '#f59e0b', isUnlocked: false,
    contents: [],
  },
  {
    id: '5', name: 'Docker', icon: '🐳', color: '#0ea5e9', isUnlocked: false,
    contents: [],
  },
];