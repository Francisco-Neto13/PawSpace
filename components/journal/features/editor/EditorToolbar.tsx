'use client';
import { Bold, Italic, List, ListOrdered, Minus } from 'lucide-react';

export function EditorToolbar() {
  const cmd = (command: string) => {
    document.execCommand(command, false, undefined);
  };

  const tools = [
    { icon: <Bold size={12} />,        action: () => cmd('bold'),                 title: 'Negrito' },
    { icon: <Italic size={12} />,      action: () => cmd('italic'),               title: 'Itálico' },
    { icon: <List size={12} />,        action: () => cmd('insertUnorderedList'),   title: 'Lista' },
    { icon: <ListOrdered size={12} />, action: () => cmd('insertOrderedList'),     title: 'Lista numerada' },
    { icon: <Minus size={12} />,       action: () => cmd('insertHorizontalRule'),  title: 'Divisor' },
  ];

  return (
    <div className="flex items-center gap-1 p-2 border-b border-white/[0.04]">
      {tools.map((t, i) => (
        <button
          key={i}
          title={t.title}
          onMouseDown={e => { e.preventDefault(); t.action(); }}
          className="w-7 h-7 flex items-center justify-center text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06] transition-all duration-200 cursor-pointer"
        >
          {t.icon}
        </button>
      ))}
    </div>
  );
}