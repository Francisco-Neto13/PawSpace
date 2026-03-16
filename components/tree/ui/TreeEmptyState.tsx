'use client';

import { WorkspaceEmptyState } from '@/components/shared/WorkspaceEmptyState';

interface TreeEmptyStateProps {
  onCreate: () => void;
}

export function TreeEmptyState({ onCreate }: TreeEmptyStateProps) {
  return (
    <WorkspaceEmptyState
      title="Territorio vazio"
      description="Crie sua arvore para abrir o mapa de estudos do PawSpace."
      actionLabel="Criar arvore"
      onAction={onCreate}
    />
  );
}
