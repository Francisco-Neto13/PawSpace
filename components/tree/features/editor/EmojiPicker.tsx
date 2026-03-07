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
      setIsOpen(!isOpen);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('https://emojihub.yurace.pro/api/all/category/objects');
      const data: unknown = await res.json();
      if (!Array.isArray(data)) {
        throw new Error('Formato de resposta inválido para emojis');
      }
      const parsed = data.filter((item): item is EmojiHubItem =>
        typeof item === 'object' &&
        item !== null &&
        'htmlCode' in item &&
        Array.isArray((item as { htmlCode: unknown }).htmlCode)
      );
      setEmojis(parsed.slice(0, 50));
      setIsOpen(true);
    } catch (error) {
      console.error("Falha ao acessar banco de emojis:", error);
    } finally {
      setLoading(false);
    }
  }, [emojis, isOpen]);

  const parseEmoji = (codes: string[]) => {
    return String.fromCodePoint(
      ...codes.map(code => parseInt(code.replace('&#', '').replace(';', '')))
    );
  };

  return (
    <div className="relative">
      <label className="font-mono text-[10px] tracking-[0.2em] text-zinc-500 uppercase block mb-2">
        Emoji
      </label>
      <button
        type="button"
        onClick={fetchEmojis}
        className="w-12 h-12 flex items-center justify-center border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all text-2xl shadow-inner"
      >
        {loading ? <span className="animate-pulse text-xs">...</span> : currentEmoji}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[110]" onClick={() => setIsOpen(false)} />
          <div className="absolute top-14 left-0 z-[120] w-64 h-56 overflow-y-auto bg-black/90 border border-white/10 p-3 grid grid-cols-5 gap-2 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200">
            {emojis.map((e, i) => {
              const char = parseEmoji(e.htmlCode);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => { onSelect(char); setIsOpen(false); }}
                  className="hover:bg-white/10 p-2 rounded transition-colors text-xl flex items-center justify-center"
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
