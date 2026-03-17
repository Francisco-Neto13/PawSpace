'use client';

import { AlertCircle, Loader2, Save } from 'lucide-react';

import type { SkillNode } from '@/contexts/PawSpaceContext';
import { PawIcon } from '@/components/shared/PawIcon';

interface TreeHeaderProps {
  nodesCount: number;
  rootNodesCount: number;
  nodesWithContentCount: number;
  selectedNode: SkillNode | null;
  canSave: boolean;
  isSaving: boolean;
  onSaveAll: () => void;
}

export function TreeHeader({
  nodesCount,
  rootNodesCount,
  nodesWithContentCount,
  selectedNode,
  canSave,
  isSaving,
  onSaveAll,
}: TreeHeaderProps) {
  return (
    <>
      <div className="flex items-center gap-3 reveal-fade delay-0">
        <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
        <span className="app-breadcrumb">PawSpace / Árvore</span>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-[var(--shimmer-via)] to-transparent" />
      </div>

      <section className="library-panel library-panel-hover p-5 sm:p-6 relative overflow-hidden reveal-up delay-100">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <p className="library-kicker mb-2">Território de estudo</p>
            <h1 className="page-display max-w-4xl mb-3">Árvore do PawSpace</h1>
            <p className="page-summary">
              Modele seu mapa de estudos por dependência, organize os módulos no canvas e deixe o território pronto para crescer.
            </p>
            <div className="flex flex-wrap gap-2.5 mt-4">
              <span className="library-chip">Trilhas: {nodesCount}</span>
              <span className="library-chip">Raízes: {rootNodesCount}</span>
              <span className="library-chip">Com Material: {nodesWithContentCount}</span>
              <span className="library-chip max-w-full truncate">
                Selecionado: {selectedNode?.data.label || selectedNode?.data.name || 'Nenhum'}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-2 w-full sm:w-auto sm:min-w-[230px]">
            <div className="min-h-9 px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] flex items-center gap-2">
              <AlertCircle
                size={11}
                className={canSave ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}
              />
              <span className="ui-label">
                {canSave ? 'Pegadas pendentes' : 'Território sincronizado'}
              </span>
            </div>

            <button
              onClick={onSaveAll}
              disabled={isSaving || !canSave}
              className={`h-10 shrink-0 flex items-center justify-center gap-2 px-4 border border-[var(--border-visible)] rounded-xl button-label transition-all active:scale-[0.98]
                ${
                  isSaving || !canSave
                    ? 'bg-[var(--bg-surface)] text-[var(--text-faint)] cursor-not-allowed'
                    : 'bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-[var(--bg-input)] cursor-pointer'
                }`}
            >
              {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              {isSaving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
