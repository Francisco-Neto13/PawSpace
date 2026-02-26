// 1. Definição das Categorias (Devem ser as mesmas do seu Enum no Prisma, se houver)
export type SkillCategory = 'html' | 'css' | 'javascript' | 'backend' | 'keystone';

// 2. O Tema Visual (Necessário para o Edge e Node saberem que cor pintar)
export const CATEGORY_THEME: Record<SkillCategory, {
  color: string;
  glow: string;
  border: string;
  label: string;
}> = {
  html: { color: '#c8b89a', glow: 'rgba(200, 184, 154, 0.2)', border: '#3a3830', label: 'Structure (HTML)' },
  css: { color: '#c8b89a', glow: 'rgba(200, 184, 154, 0.2)', border: '#3a3830', label: 'Styling (CSS)' },
  javascript: { color: '#c8b89a', glow: 'rgba(200, 184, 154, 0.3)', border: '#c8b89a', label: 'Logic (JS)' },
  backend: { color: '#c8b89a', glow: 'rgba(200, 184, 154, 0.3)', border: '#c8b89a', label: 'Server (Node/DB)' },
  keystone: { color: '#ddd8cc', glow: 'rgba(200, 184, 154, 0.6)', border: '#ddd8cc', label: 'Fundamentals' },
};

// 3. Interface que espelha a Tabela do Banco de Dados (Prisma)
export interface SkillData {
  id: string;            // Primary Key
  userId: string;        // Foreign Key do Usuário
  name: string;          // No banco é 'name', no ReactFlow vira 'label'
  description?: string | null;
  category: SkillCategory;
  isUnlocked: boolean;
  parentId?: string | null; // Auto-relacionamento (A chave para as linhas/edges)
  positionX: number;     // Coordenada salva
  positionY: number;     // Coordenada salva
  
  // Campos do React Flow (Gerados dinamicamente no frontend)
  label?: string;        
  [key: string]: any; 
}

// 4. Dados para as Linhas (Edges)
export interface SkillEdgeData {
  unlocked: boolean;
  category?: SkillCategory;
}