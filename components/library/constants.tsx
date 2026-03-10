'use client'; 
import { Link2, FileText, StickyNote, Video } from 'lucide-react';
import React from 'react';
import { ContentType } from './types';

export const TYPE_CONFIG: Record<ContentType, { icon: React.ReactNode; label: string; color: string }> = {
  link:  { icon: <Link2 size={13} />,      label: 'Link',   color: '#7ca2ff' },
  pdf:   { icon: <FileText size={13} />,   label: 'PDF',    color: '#d7a66a' },
  note:  { icon: <StickyNote size={13} />, label: 'Nota',   color: '#a0a8b5' },
  video: { icon: <Video size={13} />,      label: 'Vídeo',  color: '#4bc6b0' },
};

export const FILTER_OPTIONS: { value: ContentType | 'all'; label: string }[] = [
  { value: 'all',   label: 'Todos'  },
  { value: 'link',  label: 'Links'  },
  { value: 'pdf',   label: 'PDFs'   },
  { value: 'note',  label: 'Notas'  },
  { value: 'video', label: 'Vídeos' },
];
