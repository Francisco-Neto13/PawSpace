'use client'; 
import { Link2, FileText, StickyNote, Video } from 'lucide-react';
import React from 'react';
import { ContentType } from './types';

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