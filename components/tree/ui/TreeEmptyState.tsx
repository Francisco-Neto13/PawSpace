'use client';

import { WorkspaceEmptyState } from '@/components/shared/WorkspaceEmptyState';

interface TreeEmptyStateProps {
  onCreate: () => void;
}

export function TreeEmptyState({ onCreate }: TreeEmptyStateProps) {
  return (
    <WorkspaceEmptyState
      title="Território vazio"
      description="Crie sua árvore para abrir o mapa de estudos do PawSpace."
      actionLabel="Criar árvore"
      onAction={onCreate}
    />
  );
}
