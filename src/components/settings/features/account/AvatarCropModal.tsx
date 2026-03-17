'use client';
/* eslint-disable @next/next/no-img-element */

import { type SyntheticEvent, useEffect, useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import ReactCrop, {
  type Crop,
  type PixelCrop,
  centerCrop,
  makeAspectCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export type AvatarCropSelection = {
  crop: PixelCrop;
  naturalWidth: number;
  naturalHeight: number;
  renderedWidth: number;
  renderedHeight: number;
};

type AvatarCropSource = {
  file: File;
  previewUrl: string;
};

type AvatarCropResult = {
  selection: AvatarCropSelection;
};

type AvatarCropModalProps = {
  source: AvatarCropSource | null;
  onCancel: () => void;
  onApply: (result: AvatarCropResult) => void | Promise<void>;
};

function centerAspectCrop(width: number, height: number) {
  return centerCrop(makeAspectCrop({ unit: '%', width: 80 }, 1, width, height), width, height);
}

export default function AvatarCropModal({ source, onCancel, onApply }: AvatarCropModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{
    naturalWidth: number;
    naturalHeight: number;
    renderedWidth: number;
    renderedHeight: number;
  } | null>(null);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    if (!source) {
      setCrop(undefined);
      setCompletedCrop(undefined);
      setError(null);
      setImageMeta(null);
      return;
    }

    setCrop(undefined);
    setCompletedCrop(undefined);
    setError(null);
    setImageMeta(null);
  }, [source]);

  useEffect(() => {
    if (!source) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [source]);

  useEffect(() => {
    if (!source) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isApplying) {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [source, isApplying, onCancel]);

  if (!source || !isMounted) return null;

  const handleImageLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    const { width, height, naturalWidth, naturalHeight } = event.currentTarget;
    setImageMeta({
      naturalWidth,
      naturalHeight,
      renderedWidth: width,
      renderedHeight: height,
    });
    setCrop(centerAspectCrop(width, height));
    setCompletedCrop(undefined);
    setError(null);
  };

  const handleApply = async () => {
    if (!completedCrop || !imageMeta) return;

    setIsApplying(true);
    setError(null);

    try {
      await onApply({
        selection: {
          crop: completedCrop,
          naturalWidth: imageMeta.naturalWidth,
          naturalHeight: imageMeta.naturalHeight,
          renderedWidth: imageMeta.renderedWidth,
          renderedHeight: imageMeta.renderedHeight,
        },
      });
    } catch {
      setError('Nao foi possivel preparar o avatar agora.');
    } finally {
      setIsApplying(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-[rgba(3,3,4,0.72)] backdrop-blur-md" onClick={onCancel} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Editor de avatar"
        className="relative z-[1] flex max-h-[92dvh] w-full max-w-[42rem] flex-col overflow-hidden rounded-[28px] border border-[var(--border-subtle)] bg-[var(--bg-panel)] shadow-[0_28px_80px_rgba(0,0,0,0.45)]"
      >
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-4 sm:px-6">
          <div>
            <p className="library-kicker mb-1">Editor de avatar</p>
            <p className="ui-copy text-sm text-[var(--text-muted)]">Ajuste o enquadramento e aplique quando estiver bom.</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isApplying}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] disabled:opacity-50"
            aria-label="Fechar editor de avatar"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-[var(--bg-elevated)]/40 px-5 py-5 sm:px-6 sm:py-6">
          <div className="rounded-[24px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
            <ReactCrop
              crop={crop}
              onChange={(nextCrop) => setCrop(nextCrop)}
              onComplete={(nextCrop) => setCompletedCrop(nextCrop)}
              aspect={1}
              circularCrop
              className="mx-auto"
            >
              <img
                src={source.previewUrl}
                alt="Previa do avatar"
                onLoad={handleImageLoad}
                className="max-h-[min(56dvh,520px)] max-w-full object-contain"
                draggable={false}
              />
            </ReactCrop>
          </div>

          <div className="mt-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3.5 py-3">
            <p className="field-label mb-1">Saida final</p>
            <p className="ui-meta">O recorte sera processado no servidor antes do upload para evitar arquivos vazios ou corrompidos.</p>
          </div>

          {error ? <p className="feedback-text mt-4 text-red-400/80">{error}</p> : null}
        </div>

        <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-5 py-4 sm:px-6">
          <p className="ui-meta pb-3 text-center uppercase">Arraste para ajustar o corte.</p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={isApplying}
              className="h-11 rounded-2xl border border-[var(--border-subtle)] px-4 button-label text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => void handleApply()}
              disabled={!completedCrop || isApplying}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[var(--border-visible)] bg-[var(--bg-strong)] px-4 button-label text-[var(--text-primary)] transition-opacity disabled:opacity-50"
            >
              {isApplying ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {isApplying ? 'Aplicando...' : 'Aplicar avatar'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
