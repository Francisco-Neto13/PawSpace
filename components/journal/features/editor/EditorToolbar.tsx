'use client';
import { Bold, Italic, List, ListOrdered, Minus, Code, Quote } from 'lucide-react';

export function EditorToolbar() {
  const cmd = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const tools = [
    { icon: <Bold size={13} />, action: () => cmd('bold'), title: 'Negrito (Ctrl+B)' },
    { icon: <Italic size={13} />, action: () => cmd('italic'), title: 'Italico (Ctrl+I)' },
    { icon: <Quote size={13} />, action: () => cmd('formatBlock', 'blockquote'), title: 'Citacao' },
    { icon: <Code size={13} />, action: () => cmd('formatBlock', 'pre'), title: 'Bloco de Codigo' },
    { isSeparator: true },
    { icon: <List size={13} />, action: () => cmd('insertUnorderedList'), title: 'Lista' },
    { icon: <ListOrdered size={13} />, action: () => cmd('insertOrderedList'), title: 'Lista numerada' },
    { icon: <Minus size={13} />, action: () => cmd('insertHorizontalRule'), title: 'Divisor' },
  ];

  return (
    <div className="flex items-center gap-0.5 px-6 py-1.5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      {tools.map((t, i) => {
        if ('isSeparator' in t) {
          return <div key={i} className="w-[1px] h-3 bg-[var(--border-muted)] mx-2" />;
        }

        return (
          <button
            key={i}
            title={t.title}
            onMouseDown={(e) => {
              e.preventDefault();
              t.action();
            }}
            className="w-8 h-8 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] border border-transparent hover:border-[var(--border-subtle)] transition-all duration-200 cursor-pointer rounded-sm active:scale-90"
          >
            {t.icon}
          </button>
        );
      })}

      <div className="ml-auto text-[7px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] pointer-events-none antialiased">
        Markdown Support: Active
      </div>
    </div>
  );
}
