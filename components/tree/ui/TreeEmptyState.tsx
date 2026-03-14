'use client';

import { WorkspaceEmptyState } from '@/components/shared/WorkspaceEmptyState';

interface TreeEmptyStateProps {
  onCreate: () => void;
}

export function TreeEmptyState({ onCreate }: TreeEmptyStateProps) {
  return (
    <WorkspaceEmptyState
      title="Árvore vazia"
      description="Crie sua árvore para começar a organizar conteúdos por módulo."
      actionLabel="Criar árvore"
      onAction={onCreate}
    />
  );
}
