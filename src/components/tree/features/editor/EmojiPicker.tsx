'use client';

import { useState } from 'react';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  currentEmoji: string;
}

interface EmojiHubItem {
  htmlCode: string[];
  name?: string;
}

const EMOJI_CATEGORIES = [
  { id: 'smileys-and-people', label: 'Rostos' },
  { id: 'animals-and-nature', label: 'Natureza' },
  { id: 'food-and-drink', label: 'Comida' },
  { id: 'activities', label: 'Atividades' },
  { id: 'travel-and-places', label: 'Lugares' },
  { id: 'objects', label: 'Objetos' },
  { id: 'symbols', label: 'Simbolos' },
  { id: 'flags', label: 'Bandeiras' },
] as const;

type EmojiCategoryId = (typeof EMOJI_CATEGORIES)[number]['id'];
type EmojiCache = Partial<Record<EmojiCategoryId, EmojiHubItem[]>>;

function parseEmoji(codes: string[]) {
  return String.fromCodePoint(
    ...codes.map((code) => parseInt(code.replace('&#', '').replace(';', ''), 10))
  );
}

export function EmojiPicker({ onSelect, currentEmoji }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<EmojiCategoryId>('smileys-and-people');
  const [emojiCache, setEmojiCache] = useState<EmojiCache>({});
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadCategory = async (category: EmojiCategoryId) => {
    if (emojiCache[category]?.length) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://emojihub.yurace.pro/api/all/category/${category}`);
      const data: unknown = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('invalid_emoji_payload');
      }

      const parsed = data.filter(
        (item): item is EmojiHubItem =>
          typeof item === 'object' &&
          item !== null &&
          'htmlCode' in item &&
          Array.isArray((item as { htmlCode: unknown }).htmlCode)
      );

      setEmojiCache((prev) => ({
        ...prev,
        [category]: parsed,
      }));
    } catch (fetchError) {
      console.error('Falha ao acessar banco de emojis:', fetchError);
      setError('Nao foi possivel carregar os emojis agora.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);

    if (nextOpen) {
      await loadCategory(activeCategory);
    }
  };

  const handleCategoryChange = async (category: EmojiCategoryId) => {
    setActiveCategory(category);
    setQuery('');
    await loadCategory(category);
  };

  const emojis = emojiCache[activeCategory] ?? [];
  const normalizedQuery = query.trim().toLowerCase();
  const filteredEmojis = normalizedQuery
    ? emojis.filter((emoji) => (emoji.name ?? '').toLowerCase().includes(normalizedQuery))
    : emojis;

  return (
    <div className="relative">
      <label className="field-label block mb-2">Emoji</label>
      <button
        type="button"
        onClick={() => void handleToggle()}
        className="flex min-h-[76px] w-full items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-3.5 text-left hover:bg-[var(--bg-input)] hover:border-[var(--border-visible)] transition-all duration-200 sm:min-h-[84px]"
      >
        <div className="min-w-0 flex-1">
          <p className="ui-label mb-1 text-[var(--text-primary)]">Emoji do nó</p>
          <p className="ui-meta text-[var(--text-muted)]">Símbolo rápido para reconhecer a trilha.</p>
        </div>
        <div className="shrink-0 rounded-2xl border border-[var(--border-visible)] bg-[var(--bg-base)] px-3 py-2 text-2xl leading-none">
          {loading && !isOpen ? <span className="animate-pulse text-xs">...</span> : currentEmoji}
        </div>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[110]" onClick={() => setIsOpen(false)} />
          <div className="absolute top-14 left-0 z-[120] w-[min(19rem,calc(100vw-2rem))] rounded-2xl bg-[var(--bg-strong)] border border-[var(--border-subtle)] shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="border-b border-[var(--border-subtle)] p-3 space-y-3">
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar emoji nesta categoria"
                className="library-input field-input h-10 px-3 placeholder:text-[var(--text-muted)]"
              />

              <div className="flex flex-wrap gap-1.5">
                {EMOJI_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => void handleCategoryChange(category.id)}
                    className="px-2 py-1 rounded-lg border data-label transition-colors"
                    style={{
                      borderColor:
                        activeCategory === category.id ? 'var(--border-visible)' : 'var(--border-subtle)',
                      backgroundColor:
                        activeCategory === category.id ? 'var(--bg-elevated)' : 'transparent',
                      color: activeCategory === category.id ? 'var(--text-primary)' : 'var(--text-muted)',
                    }}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-72 overflow-y-auto p-3">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <span className="ui-meta">Carregando emojis...</span>
                </div>
              ) : error ? (
                <div className="h-full flex items-center justify-center text-center">
                  <span className="ui-meta">{error}</span>
                </div>
              ) : filteredEmojis.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center">
                  <span className="ui-meta">
                    {normalizedQuery ? 'Nenhum emoji encontrado nesta busca.' : 'Nenhum emoji disponivel aqui.'}
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-6 gap-2">
                  {filteredEmojis.map((emoji, index) => {
                    const char = parseEmoji(emoji.htmlCode);
                    return (
                      <button
                        key={`${activeCategory}-${index}-${char}`}
                        type="button"
                        onClick={() => {
                          onSelect(char);
                          setIsOpen(false);
                        }}
                        className="hover:bg-[var(--bg-elevated)] p-2 rounded-lg transition-colors text-xl flex items-center justify-center"
                        title={emoji.name ?? 'emoji'}
                      >
                        {char}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
