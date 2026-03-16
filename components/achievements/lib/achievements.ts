import { Achievement } from '../types';

interface AchievementInput {
  activeNodes: number;
  totalNodes: number;
  journalEntries: number;
  libraryContents: number;
}

interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: Achievement['category'];
  check: (input: AchievementInput) => boolean;
  progress?: (input: AchievementInput) => { current: number; total: number };
}

const DEFINITIONS: AchievementDefinition[] = [
  {
    id: 'first_node',
    title: 'Primeiro Passo',
    description: 'Adicione material à sua primeira trilha na árvore.',
    icon: 'P1',
    category: 'tree',
    check: ({ activeNodes }) => activeNodes >= 1,
    progress: ({ activeNodes }) => ({ current: Math.min(activeNodes, 1), total: 1 }),
  },
  {
    id: 'architect',
    title: 'Arquiteto',
    description: 'Preencha 10 trilhas da sua árvore com material.',
    icon: 'A10',
    category: 'tree',
    check: ({ activeNodes }) => activeNodes >= 10,
    progress: ({ activeNodes }) => ({ current: Math.min(activeNodes, 10), total: 10 }),
  },
  {
    id: 'nexus_master',
    title: 'Mestre do PawSpace',
    description: 'Preencha 25 trilhas da sua árvore com material.',
    icon: 'N25',
    category: 'tree',
    check: ({ activeNodes }) => activeNodes >= 25,
    progress: ({ activeNodes }) => ({ current: Math.min(activeNodes, 25), total: 25 }),
  },
  {
    id: 'first_entry',
    title: 'Primeira Nota',
    description: 'Registre sua primeira nota no diário.',
    icon: 'E1',
    category: 'journal',
    check: ({ journalEntries }) => journalEntries >= 1,
    progress: ({ journalEntries }) => ({ current: Math.min(journalEntries, 1), total: 1 }),
  },
  {
    id: 'chronicler',
    title: 'Cronista',
    description: 'Registre 10 notas no diário do PawSpace.',
    icon: 'C10',
    category: 'journal',
    check: ({ journalEntries }) => journalEntries >= 10,
    progress: ({ journalEntries }) => ({ current: Math.min(journalEntries, 10), total: 10 }),
  },
  {
    id: 'archivist',
    title: 'Arquivista',
    description: 'Registre 20 notas no diário do PawSpace.',
    icon: 'A20',
    category: 'journal',
    check: ({ journalEntries }) => journalEntries >= 20,
    progress: ({ journalEntries }) => ({ current: Math.min(journalEntries, 20), total: 20 }),
  },
  {
    id: 'first_content',
    title: 'Primeiro Achado',
    description: 'Guarde seu primeiro material na estante.',
    icon: 'B1',
    category: 'library',
    check: ({ libraryContents }) => libraryContents >= 1,
    progress: ({ libraryContents }) => ({ current: Math.min(libraryContents, 1), total: 1 }),
  },
  {
    id: 'librarian',
    title: 'Guardião da Estante',
    description: 'Guarde 20 materiais na estante do PawSpace.',
    icon: 'L20',
    category: 'library',
    check: ({ libraryContents }) => libraryContents >= 20,
    progress: ({ libraryContents }) => ({ current: Math.min(libraryContents, 20), total: 20 }),
  },
  {
    id: 'initiated',
    title: 'Iniciado',
    description: 'Atinja 25% de cobertura da sua árvore.',
    icon: '25%',
    category: 'progress',
    check: ({ activeNodes, totalNodes }) => totalNodes > 0 && activeNodes / totalNodes >= 0.25,
    progress: ({ activeNodes, totalNodes }) => ({
      current: Math.round((activeNodes / Math.max(totalNodes, 1)) * 100),
      total: 25,
    }),
  },
  {
    id: 'advanced',
    title: 'Avançado',
    description: 'Atinja 50% de cobertura da sua árvore.',
    icon: '50%',
    category: 'progress',
    check: ({ activeNodes, totalNodes }) => totalNodes > 0 && activeNodes / totalNodes >= 0.5,
    progress: ({ activeNodes, totalNodes }) => ({
      current: Math.round((activeNodes / Math.max(totalNodes, 1)) * 100),
      total: 50,
    }),
  },
  {
    id: 'nexus_complete',
    title: 'PawSpace Completo',
    description: 'Tenha material em todas as trilhas da sua árvore.',
    icon: '100%',
    category: 'progress',
    check: ({ activeNodes, totalNodes }) => totalNodes > 0 && activeNodes >= totalNodes,
    progress: ({ activeNodes, totalNodes }) => ({
      current: Math.round((activeNodes / Math.max(totalNodes, 1)) * 100),
      total: 100,
    }),
  },
];

export function computeAchievements(input: AchievementInput): Achievement[] {
  return DEFINITIONS.map((def) => ({
    id: def.id,
    title: def.title,
    description: def.description,
    icon: def.icon,
    category: def.category,
    isUnlocked: def.check(input),
    progress: def.progress?.(input),
  }));
}

export const CATEGORY_LABELS: Record<Achievement['category'], string> = {
  tree: 'Árvore',
  journal: 'Diário',
  library: 'Estante',
  progress: 'Progresso',
};
