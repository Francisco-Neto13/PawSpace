'use client';
import { useState } from 'react';
import {
  Bold, Italic, List, ListOrdered, Minus,
  Plus, Trash2, BookOpen, Tag, Calendar,
} from 'lucide-react';

const MOCK_SKILLS = [
  { id: '1', name: 'React', icon: '⚛️', color: '#61dafb' },
  { id: '2', name: 'TypeScript', icon: '🔷', color: '#3178c6' },
  { id: '3', name: 'Node.js', icon: '🟢', color: '#68a063' },
  { id: '4', name: 'Prisma', icon: '▲', color: '#c8b89a' },
];

const MOCK_ENTRIES = [
  {
    id: '1',
    title: 'Revisão de hooks customizados',
    body: '<b>Objetivo:</b> Entender melhor useCallback e useMemo.<br><br>Preciso revisar quando usar cada um. Sinto que estou usando useCallback desnecessariamente.<br><br><ul><li>Ler documentação oficial</li><li>Refatorar o useSkillDrag</li><li>Testar performance</li></ul>',
    skillId: '1',
    createdAt: '2026-03-01',
  },
  {
    id: '2',
    title: 'Plano de estudos — Semana 9',
    body: '<b>Meta da semana:</b> finalizar módulo de banco de dados.<br><br>Prisma está indo bem, mas preciso entender melhor as relations N:N.',
    skillId: '4',
    createdAt: '2026-02-28',
  },
  {
    id: '3',
    title: 'Dúvidas sobre generics no TS',
    body: 'Ficou uma dúvida sobre como tipar corretamente funções genéricas com múltiplos parâmetros de tipo. Preciso pesquisar isso.',
    skillId: '2',
    createdAt: '2026-02-26',
  },
  {
    id: '4',
    title: 'Anotações soltas',
    body: 'Ideias para o próximo projeto. Talvez um CLI em Node para gerar componentes automaticamente.',
    skillId: null,
    createdAt: '2026-02-24',
  },
];

function getSkill(id: string | null) {
  return MOCK_SKILLS.find(s => s.id === id) ?? null;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function EditorToolbar() {
  const cmd = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const tools = [
    { icon: <Bold size={12} />,         action: () => cmd('bold'),           title: 'Negrito' },
    { icon: <Italic size={12} />,       action: () => cmd('italic'),         title: 'Itálico' },
    { icon: <List size={12} />,         action: () => cmd('insertUnorderedList'), title: 'Lista' },
    { icon: <ListOrdered size={12} />,  action: () => cmd('insertOrderedList'),   title: 'Lista numerada' },
    { icon: <Minus size={12} />,        action: () => cmd('insertHorizontalRule'), title: 'Divisor' },
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

function EntryItem({
  entry,
  isSelected,
  onSelect,
}: {
  entry: typeof MOCK_ENTRIES[0];
  isSelected: boolean;
  onSelect: () => void;
}) {
  const skill = getSkill(entry.skillId);
  const preview = entry.body.replace(/<[^>]+>/g, '').slice(0, 60);

  return (
    <button
      onClick={onSelect}
      className={`group relative w-full flex flex-col gap-2 px-4 py-4 border text-left transition-all duration-300
        ${isSelected
          ? 'border-[#c8b89a]/20 bg-[#c8b89a]/[0.04]'
          : 'border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02]'
        }`}
    >
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#c8b89a]" />
      )}
      {isSelected && (
        <div
          className="absolute top-0 left-0 right-0 h-[1px]"
          style={{ background: 'linear-gradient(to right, #c8b89a33, transparent)' }}
        />
      )}

      <p className={`text-[11px] font-bold truncate transition-colors ${isSelected ? 'text-[#c8b89a]' : 'text-zinc-300 group-hover:text-zinc-100'}`}>
        {entry.title}
      </p>

      <p className="text-[10px] text-zinc-600 font-medium leading-relaxed line-clamp-2">
        {preview}…
      </p>

      <div className="flex items-center gap-2 mt-1">
        {skill && (
          <span
            className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border"
            style={{ color: skill.color, borderColor: `${skill.color}30`, backgroundColor: `${skill.color}0d` }}
          >
            {skill.icon} {skill.name}
          </span>
        )}
        <span className="text-[9px] text-zinc-700 font-mono flex items-center gap-1 ml-auto">
          <Calendar size={8} />
          {formatDate(entry.createdAt)}
        </span>
      </div>
    </button>
  );
}

function EntryEditor({
  entry,
  onDelete,
}: {
  entry: typeof MOCK_ENTRIES[0];
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(entry.title);
  const [selectedSkillId, setSelectedSkillId] = useState(entry.skillId);
  const skill = getSkill(selectedSkillId);

  return (
    <div className="flex flex-col h-full">

      <div className="shrink-0 px-8 pt-8 pb-4 border-b border-white/[0.04]">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Título da entrada..."
          className="w-full bg-transparent text-white text-xl font-black outline-none placeholder:text-zinc-700 tracking-wide"
        />
        <div className="flex items-center gap-4 mt-4">
          <span className="flex items-center gap-1.5 text-[9px] text-zinc-600 font-mono">
            <Calendar size={10} />
            {formatDate(entry.createdAt)}
          </span>

          <div className="w-[1px] h-3 bg-white/[0.06]" />

          <div className="relative group/skill">
            <button className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest transition-colors cursor-pointer"
              style={{ color: skill ? skill.color : '#52525b' }}
            >
              <Tag size={9} />
              {skill ? `${skill.icon} ${skill.name}` : 'Vincular skill'}
            </button>

            <div className="absolute top-full left-0 mt-2 w-44 bg-[#0a0a0a] border border-white/[0.06] z-20 hidden group-hover/skill:flex flex-col py-1 shadow-2xl">
              <button
                onClick={() => setSelectedSkillId(null)}
                className="px-3 py-2 text-[10px] text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.03] text-left font-medium transition-colors cursor-pointer"
              >
                Nenhuma
              </button>
              {MOCK_SKILLS.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSkillId(s.id)}
                  className="flex items-center gap-2 px-3 py-2 text-[10px] hover:bg-white/[0.03] text-left transition-colors cursor-pointer"
                  style={{ color: s.color }}
                >
                  <span>{s.icon}</span>
                  <span className="font-bold uppercase tracking-wider">{s.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 text-zinc-700 hover:text-red-400 text-[9px] font-black uppercase tracking-widest transition-colors cursor-pointer"
            >
              <Trash2 size={10} />
              Excluir
            </button>
            <div className="w-[1px] h-3 bg-white/[0.06]" />
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-[#c8b89a]/30 bg-[#c8b89a]/[0.06] text-[#c8b89a] text-[9px] font-black uppercase tracking-widest hover:bg-[#c8b89a]/10 transition-all duration-300 cursor-pointer">
              Salvar
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-0">
        <EditorToolbar />
        <div
          contentEditable
          suppressContentEditableWarning
          dangerouslySetInnerHTML={{ __html: entry.body }}
          className="flex-1 overflow-y-auto px-8 py-6 text-zinc-300 text-sm font-light leading-relaxed outline-none"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(200,184,154,0.1) transparent',
          }}
        />
      </div>
    </div>
  );
}

export default function JournalPage() {
  const [entries, setEntries] = useState(MOCK_ENTRIES);
  const [selectedId, setSelectedId] = useState(MOCK_ENTRIES[0].id);

  const selectedEntry = entries.find(e => e.id === selectedId) ?? entries[0];

  const handleNewEntry = () => {
    const newEntry = {
      id: String(Date.now()),
      title: 'Nova entrada',
      body: '',
      skillId: null,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setEntries(prev => [newEntry, ...prev]);
    setSelectedId(newEntry.id);
  };

  const handleDelete = () => {
    const remaining = entries.filter(e => e.id !== selectedId);
    setEntries(remaining);
    setSelectedId(remaining[0]?.id ?? '');
  };

  return (
    <div
      className="relative w-full bg-[#030304] flex flex-col overflow-hidden"
      style={{ height: 'calc(100dvh - var(--navbar-height) - var(--footer-height))' }}
    >
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#c8b89a06_1px,transparent_1px),linear-gradient(to_bottom,#c8b89a06_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_60%,transparent_100%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 pt-6 pb-6 flex flex-col gap-6 flex-1 min-h-0">

        <header className="shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-4 bg-[#c8b89a]" />
              <h2 className="text-[#c8b89a] text-[10px] font-black uppercase tracking-[0.4em]">
                Nexus / Diário de Estudos
              </h2>
              <div className="h-[1px] w-32 bg-gradient-to-r from-[#c8b89a]/20 to-transparent" />
            </div>

            <div className="flex items-center gap-8">
              {[
                { label: 'Entradas',   value: entries.length },
                { label: 'Esta semana', value: 3 },
              ].map((s, i) => (
                <div key={i} className="text-right">
                  <p className="text-white text-2xl font-black font-mono leading-none">{s.value}</p>
                  <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mt-1">{s.label}</p>
                </div>
              ))}
              <button
                onClick={handleNewEntry}
                className="flex items-center gap-2 px-4 py-2.5 border border-[#c8b89a]/30 bg-[#c8b89a]/[0.06] text-[#c8b89a] text-[9px] font-black uppercase tracking-widest hover:bg-[#c8b89a]/10 hover:border-[#c8b89a]/50 transition-all duration-300 cursor-pointer"
              >
                <Plus size={11} />
                Nova Entrada
              </button>
            </div>
          </div>
        </header>

        <div className="flex gap-6 flex-1 min-h-0 overflow-hidden">

          <aside className="w-72 shrink-0 flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-3 bg-[#c8b89a]/40" />
              <p className="text-[9px] text-zinc-600 uppercase font-black tracking-[0.3em]">
                Entradas
              </p>
            </div>
            <div
              className="flex flex-col gap-2 overflow-y-auto flex-1"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(200,184,154,0.1) transparent' }}
            >
              {entries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 border border-dashed border-white/[0.04]">
                  <BookOpen size={20} className="text-zinc-700 mb-3" />
                  <p className="text-zinc-700 text-[9px] font-black uppercase tracking-widest">
                    Nenhuma entrada
                  </p>
                </div>
              ) : (
                entries.map(entry => (
                  <EntryItem
                    key={entry.id}
                    entry={entry}
                    isSelected={entry.id === selectedId}
                    onSelect={() => setSelectedId(entry.id)}
                  />
                ))
              )}
            </div>
          </aside>

          <main className="flex-1 min-w-0 border border-white/[0.04] bg-white/[0.01] overflow-hidden flex flex-col relative">
            <div
              className="absolute top-0 left-0 right-0 h-[1px]"
              style={{ background: 'linear-gradient(to right, #c8b89a22, transparent)' }}
            />
            {selectedEntry ? (
              <EntryEditor
                key={selectedEntry.id}
                entry={selectedEntry}
                onDelete={handleDelete}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <BookOpen size={24} className="text-zinc-700" />
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">
                  Selecione ou crie uma entrada
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}