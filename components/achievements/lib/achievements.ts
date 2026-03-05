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
    description: 'Adicione conteudo ao primeiro modulo da Skill Tree.',
    icon: '⚡',
    category: 'tree',
    check: ({ activeNodes }) => activeNodes >= 1,
    progress: ({ activeNodes }) => ({ current: Math.min(activeNodes, 1), total: 1 }),
  },
  {
    id: 'architect',
    title: 'Arquiteto',
    description: 'Adicione conteudo em 10 modulos da Skill Tree.',
    icon: '🏗️',
    category: 'tree',
    check: ({ activeNodes }) => activeNodes >= 10,
    progress: ({ activeNodes }) => ({ current: Math.min(activeNodes, 10), total: 10 }),
  },
  {
    id: 'nexus_master',
    title: 'Mestre do Nexus',
    description: 'Adicione conteudo em 25 modulos da Skill Tree.',
    icon: '🧠',
    category: 'tree',
    check: ({ activeNodes }) => activeNodes >= 25,
    progress: ({ activeNodes }) => ({ current: Math.min(activeNodes, 25), total: 25 }),
  },

  {
    id: 'first_entry',
    title: 'Primeira Entrada',
    description: 'Registre sua primeira entrada no Diario.',
    icon: '📓',
    category: 'journal',
    check: ({ journalEntries }) => journalEntries >= 1,
    progress: ({ journalEntries }) => ({ current: Math.min(journalEntries, 1), total: 1 }),
  },
  {
    id: 'chronicler',
    title: 'Cronista',
    description: 'Registre 10 entradas no Diario de Bordo.',
    icon: '📜',
    category: 'journal',
    check: ({ journalEntries }) => journalEntries >= 10,
    progress: ({ journalEntries }) => ({ current: Math.min(journalEntries, 10), total: 10 }),
  },
  {
    id: 'archivist',
    title: 'Arquivista',
    description: 'Registre 20 entradas no Diario de Bordo.',
    icon: '🗂️',
    category: 'journal',
    check: ({ journalEntries }) => journalEntries >= 20,
    progress: ({ journalEntries }) => ({ current: Math.min(journalEntries, 20), total: 20 }),
  },

  {
    id: 'first_content',
    title: 'Primeiro Conhecimento',
    description: 'Adicione seu primeiro conteudo a Biblioteca.',
    icon: '📚',
    category: 'library',
    check: ({ libraryContents }) => libraryContents >= 1,
    progress: ({ libraryContents }) => ({ current: Math.min(libraryContents, 1), total: 1 }),
  },
  {
    id: 'librarian',
    title: 'Bibliotecario',
    description: 'Adicione 20 conteudos a Biblioteca.',
    icon: '🏛️',
    category: 'library',
    check: ({ libraryContents }) => libraryContents >= 20,
    progress: ({ libraryContents }) => ({ current: Math.min(libraryContents, 20), total: 20 }),
  },

  {
    id: 'initiated',
    title: 'Iniciado',
    description: 'Atinja 25% de cobertura da Skill Tree.',
    icon: '🌱',
    category: 'progress',
    check: ({ activeNodes, totalNodes }) => totalNodes > 0 && (activeNodes / totalNodes) >= 0.25,
    progress: ({ activeNodes, totalNodes }) => ({
      current: Math.round((activeNodes / Math.max(totalNodes, 1)) * 100),
      total: 25,
    }),
  },
  {
    id: 'advanced',
    title: 'Avancado',
    description: 'Atinja 50% de cobertura da Skill Tree.',
    icon: '🔥',
    category: 'progress',
    check: ({ activeNodes, totalNodes }) => totalNodes > 0 && (activeNodes / totalNodes) >= 0.5,
    progress: ({ activeNodes, totalNodes }) => ({
      current: Math.round((activeNodes / Math.max(totalNodes, 1)) * 100),
      total: 50,
    }),
  },
  {
    id: 'nexus_complete',
    title: 'Nexus Completo',
    description: 'Tenha conteudo em todos os modulos da Skill Tree.',
    icon: '🏆',
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
  tree: 'Skill Tree',
  journal: 'Diario',
  library: 'Biblioteca',
  progress: 'Progresso',
};