export interface JournalEntry {
  id: string;
  title: string;
  body: string;
  skillId: string | null;
  createdAt: string;
}

export interface MockSkill {
  id: string;
  name: string;
  icon: string;
  color: string;
}


export const MOCK_SKILLS: MockSkill[] = [
  { id: '1', name: 'React',      icon: '⚛️', color: '#61dafb' },
  { id: '2', name: 'TypeScript', icon: '🔷', color: '#3178c6' },
  { id: '3', name: 'Node.js',    icon: '🟢', color: '#68a063' },
  { id: '4', name: 'Prisma',     icon: '▲',  color: '#c8b89a' },
];

export const MOCK_ENTRIES: JournalEntry[] = [
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


export function getSkill(id: string | null, skills: MockSkill[]) {
  return skills.find(s => s.id === id) ?? null;
}

export function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}