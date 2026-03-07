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
    description: 'Adicione conteúdo ao primeiro módulo da Árvore.',
    icon: 'P1',
    category: 'tree',
    check: ({ activeNodes }) => activeNodes >= 1,
    progress: ({ activeNodes }) => ({ current: Math.min(activeNodes, 1), total: 1 }),
  },
  {
    id: 'architect',
    title: 'Arquiteto',
    description: 'Adicione conteúdo em 10 módulos da Árvore.',
    icon: 'A10',
    category: 'tree',
    check: ({ activeNodes }) => activeNodes >= 10,
    progress: ({ activeNodes }) => ({ current: Math.min(activeNodes, 10), total: 10 }),
  },
  {
    id: 'nexus_master',
    title: 'Mestre do Pawspace',
    description: 'Adicione conteúdo em 25 módulos da Árvore.',
    icon: 'N25',
    category: 'tree',
    check: ({ activeNodes }) => activeNodes >= 25,
    progress: ({ activeNodes }) => ({ current: Math.min(activeNodes, 25), total: 25 }),
  },

  {
    id: 'first_entry',
    title: 'Primeira Entrada',
    description: 'Registre sua primeira entrada no Diário.',
    icon: 'E1',
    category: 'journal',
    check: ({ journalEntries }) => journalEntries >= 1,
    progress: ({ journalEntries }) => ({ current: Math.min(journalEntries, 1), total: 1 }),
  },
  {
    id: 'chronicler',
    title: 'Cronista',
    description: 'Registre 10 entradas no Diário de Bordo.',
    icon: 'C10',
    category: 'journal',
    check: ({ journalEntries }) => journalEntries >= 10,
    progress: ({ journalEntries }) => ({ current: Math.min(journalEntries, 10), total: 10 }),
  },
  {
    id: 'archivist',
    title: 'Arquivista',
    description: 'Registre 20 entradas no Diário de Bordo.',
    icon: 'A20',
    category: 'journal',
    check: ({ journalEntries }) => journalEntries >= 20,
    progress: ({ journalEntries }) => ({ current: Math.min(journalEntries, 20), total: 20 }),
  },

  {
    id: 'first_content',
    title: 'Primeiro Conhecimento',
    description: 'Adicione seu primeiro conteúdo à Biblioteca.',
    icon: 'B1',
    category: 'library',
    check: ({ libraryContents }) => libraryContents >= 1,
    progress: ({ libraryContents }) => ({ current: Math.min(libraryContents, 1), total: 1 }),
  },
  {
    id: 'librarian',
    title: 'Bibliotecário',
    description: 'Adicione 20 conteúdos à Biblioteca.',
    icon: 'L20',
    category: 'library',
    check: ({ libraryContents }) => libraryContents >= 20,
    progress: ({ libraryContents }) => ({ current: Math.min(libraryContents, 20), total: 20 }),
  },

  {
    id: 'initiated',
    title: 'Iniciado',
    description: 'Atinja 25% de cobertura da Árvore.',
    icon: '25%',
    category: 'progress',
    check: ({ activeNodes, totalNodes }) => totalNodes > 0 && (activeNodes / totalNodes) >= 0.25,
    progress: ({ activeNodes, totalNodes }) => ({
      current: Math.round((activeNodes / Math.max(totalNodes, 1)) * 100),
      total: 25,
    }),
  },
  {
    id: 'advanced',
    title: 'Avançado',
    description: 'Atinja 50% de cobertura da Árvore.',
    icon: '50%',
    category: 'progress',
    check: ({ activeNodes, totalNodes }) => totalNodes > 0 && (activeNodes / totalNodes) >= 0.5,
    progress: ({ activeNodes, totalNodes }) => ({
      current: Math.round((activeNodes / Math.max(totalNodes, 1)) * 100),
      total: 50,
    }),
  },
  {
    id: 'nexus_complete',
    title: 'Pawspace Completo',
    description: 'Tenha conteúdo em todos os módulos da Árvore.',
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
  return DEFINITIONS.map(def => ({
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
  library: 'Biblioteca',
  progress: 'Progresso',
};
