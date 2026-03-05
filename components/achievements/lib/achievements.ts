import { Achievement } from '../types';

interface AchievementInput {
  unlockedNodes: number;
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
    description: 'Desbloqueie seu primeiro nó na Skill Tree.',
    icon: '⚡',
    category: 'tree',
    check: ({ unlockedNodes }) => unlockedNodes >= 1,
    progress: ({ unlockedNodes }) => ({ current: Math.min(unlockedNodes, 1), total: 1 }),
  },
  {
    id: 'architect',
    title: 'Arquiteto',
    description: 'Desbloqueie 10 nós na Skill Tree.',
    icon: '🏗️',
    category: 'tree',
    check: ({ unlockedNodes }) => unlockedNodes >= 10,
    progress: ({ unlockedNodes }) => ({ current: Math.min(unlockedNodes, 10), total: 10 }),
  },
  {
    id: 'nexus_master',
    title: 'Mestre do Nexus',
    description: 'Desbloqueie 25 nós na Skill Tree.',
    icon: '🧠',
    category: 'tree',
    check: ({ unlockedNodes }) => unlockedNodes >= 25,
    progress: ({ unlockedNodes }) => ({ current: Math.min(unlockedNodes, 25), total: 25 }),
  },

  {
    id: 'first_entry',
    title: 'Primeira Entrada',
    description: 'Registre sua primeira entrada no Diário.',
    icon: '📓',
    category: 'journal',
    check: ({ journalEntries }) => journalEntries >= 1,
    progress: ({ journalEntries }) => ({ current: Math.min(journalEntries, 1), total: 1 }),
  },
  {
    id: 'chronicler',
    title: 'Cronista',
    description: 'Registre 10 entradas no Diário de Bordo.',
    icon: '📜',
    category: 'journal',
    check: ({ journalEntries }) => journalEntries >= 10,
    progress: ({ journalEntries }) => ({ current: Math.min(journalEntries, 10), total: 10 }),
  },
  {
    id: 'archivist',
    title: 'Arquivista',
    description: 'Registre 20 entradas no Diário de Bordo.',
    icon: '🗂️',
    category: 'journal',
    check: ({ journalEntries }) => journalEntries >= 20,
    progress: ({ journalEntries }) => ({ current: Math.min(journalEntries, 20), total: 20 }),
  },

  {
    id: 'first_content',
    title: 'Primeiro Conhecimento',
    description: 'Adicione seu primeiro conteúdo à Biblioteca.',
    icon: '📚',
    category: 'library',
    check: ({ libraryContents }) => libraryContents >= 1,
    progress: ({ libraryContents }) => ({ current: Math.min(libraryContents, 1), total: 1 }),
  },
  {
    id: 'librarian',
    title: 'Bibliotecário',
    description: 'Adicione 20 conteúdos à Biblioteca.',
    icon: '🏛️',
    category: 'library',
    check: ({ libraryContents }) => libraryContents >= 20,
    progress: ({ libraryContents }) => ({ current: Math.min(libraryContents, 20), total: 20 }),
  },

  {
    id: 'initiated',
    title: 'Iniciado',
    description: 'Atinja 25% de progresso geral na Skill Tree.',
    icon: '🌱',
    category: 'progress',
    check: ({ unlockedNodes, totalNodes }) => totalNodes > 0 && (unlockedNodes / totalNodes) >= 0.25,
    progress: ({ unlockedNodes, totalNodes }) => ({
      current: Math.round((unlockedNodes / Math.max(totalNodes, 1)) * 100),
      total: 25,
    }),
  },
  {
    id: 'advanced',
    title: 'Avançado',
    description: 'Atinja 50% de progresso geral na Skill Tree.',
    icon: '🔥',
    category: 'progress',
    check: ({ unlockedNodes, totalNodes }) => totalNodes > 0 && (unlockedNodes / totalNodes) >= 0.5,
    progress: ({ unlockedNodes, totalNodes }) => ({
      current: Math.round((unlockedNodes / Math.max(totalNodes, 1)) * 100),
      total: 50,
    }),
  },
  {
    id: 'nexus_complete',
    title: 'Nexus Completo',
    description: 'Desbloqueie todos os nós da Skill Tree.',
    icon: '🏆',
    category: 'progress',
    check: ({ unlockedNodes, totalNodes }) => totalNodes > 0 && unlockedNodes >= totalNodes,
    progress: ({ unlockedNodes, totalNodes }) => ({
      current: Math.round((unlockedNodes / Math.max(totalNodes, 1)) * 100),
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
  tree:     'Skill Tree',
  journal:  'Diário',
  library:  'Biblioteca',
  progress: 'Progresso',
};