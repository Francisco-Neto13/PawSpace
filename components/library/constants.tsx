'use client'; 
import { Link2, FileText, StickyNote, Video } from 'lucide-react';
import React from 'react';
import { ContentType } from './types';

const CONTENT_ACCENT = '#71717a';

export const TYPE_CONFIG: Record<ContentType, { icon: React.ReactNode; label: string; color: string }> = {
  link:  { icon: <Link2 size={13} />,      label: 'Link',   color: CONTENT_ACCENT },
  pdf:   { icon: <FileText size={13} />,   label: 'PDF',    color: CONTENT_ACCENT },
  note:  { icon: <StickyNote size={13} />, label: 'Nota',   color: CONTENT_ACCENT },
  video: { icon: <Video size={13} />,      label: 'Vídeo',  color: CONTENT_ACCENT },
};

export const FILTER_OPTIONS: { value: ContentType | 'all'; label: string }[] = [
  { value: 'all',   label: 'Todos'  },
  { value: 'link',  label: 'Links'  },
  { value: 'pdf',   label: 'PDFs'   },
  { value: 'note',  label: 'Notas'  },
  { value: 'video', label: 'Vídeos' },
];
