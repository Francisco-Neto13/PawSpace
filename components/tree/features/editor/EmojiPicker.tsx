'use client';
import { useState, useCallback } from 'react';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  currentEmoji: string;
}

interface EmojiHubItem {
  htmlCode: string[];
}

export function EmojiPicker({ onSelect, currentEmoji }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [emojis, setEmojis] = useState<EmojiHubItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEmojis = useCallback(async () => {
    if (emojis.length > 0) {
      setIsOpen((value) => !value);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://emojihub.yurace.pro/api/all/category/objects');
      const data: unknown = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Formato de resposta inválido para emojis');
      }

      const parsed = data.filter(
        (item): item is EmojiHubItem =>
          typeof item === 'object' &&
          item !== null &&
          'htmlCode' in item &&
          Array.isArray((item as { htmlCode: unknown }).htmlCode)
      );
      setEmojis(parsed.slice(0, 50));
      setIsOpen(true);
    } catch (error) {
      console.error('Falha ao acessar banco de emojis:', error);
    } finally {
      setLoading(false);
    }
  }, [emojis]);

  const parseEmoji = (codes: string[]) =>
    String.fromCodePoint(...codes.map((code) => parseInt(code.replace('&#', '').replace(';', ''), 10)));

  return (
    <div className="relative">
      <label className="text-[8px] text-[var(--text-secondary)] uppercase font-black tracking-[0.25em] block mb-2">Emoji</label>
      <button
        type="button"
        onClick={() => void fetchEmojis()}
        className="w-12 h-12 rounded-xl flex items-center justify-center border border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-input)] hover:border-[var(--border-visible)] transition-all duration-200 text-2xl"
      >
        {loading ? <span className="animate-pulse text-xs">...</span> : currentEmoji}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[110]" onClick={() => setIsOpen(false)} />
          <div className="absolute top-14 left-0 z-[120] w-64 h-56 overflow-y-auto rounded-xl bg-[var(--bg-strong)] border border-[var(--border-subtle)] p-3 grid grid-cols-5 gap-2 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200">
            {emojis.map((emoji, index) => {
              const char = parseEmoji(emoji.htmlCode);
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    onSelect(char);
                    setIsOpen(false);
                  }}
                  className="hover:bg-[var(--bg-elevated)] p-2 rounded-lg transition-colors text-xl flex items-center justify-center"
                >
                  {char}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
