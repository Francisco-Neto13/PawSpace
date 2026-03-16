'use client';

import { X, AlertTriangle } from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

type ConfirmTone = 'default' | 'danger';

export interface ConfirmDialogOptions {
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
}

interface ConfirmRequest extends Required<ConfirmDialogOptions> {
  resolve: (value: boolean) => void;
}

type ConfirmDialogFn = (options: ConfirmDialogOptions) => Promise<boolean>;

const ConfirmDialogContext = createContext<ConfirmDialogFn | null>(null);

function withDefaults(options: ConfirmDialogOptions): Omit<ConfirmRequest, 'resolve'> {
  return {
    title: options.title ?? 'Confirmar ação',
    description: options.description,
    confirmLabel: options.confirmLabel ?? 'Confirmar',
    cancelLabel: options.cancelLabel ?? 'Cancelar',
    tone: options.tone ?? 'default',
  };
}

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const queueRef = useRef<ConfirmRequest[]>([]);
  const [activeRequest, setActiveRequest] = useState<ConfirmRequest | null>(null);

  const confirm = useCallback<ConfirmDialogFn>((options) => {
    return new Promise<boolean>((resolve) => {
      const nextRequest: ConfirmRequest = {
        ...withDefaults(options),
        resolve,
      };

      setActiveRequest((current) => {
        if (!current) return nextRequest;
        queueRef.current.push(nextRequest);
        return current;
      });
    });
  }, []);

  const resolveAndClose = useCallback((result: boolean) => {
    setActiveRequest((current) => {
      if (!current) return current;
      current.resolve(result);
      return queueRef.current.shift() ?? null;
    });
  }, []);

  useEffect(() => {
    if (!activeRequest) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        resolveAndClose(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeRequest, resolveAndClose]);

  useEffect(() => {
    return () => {
      if (activeRequest) {
        activeRequest.resolve(false);
      }
      for (const pending of queueRef.current) {
        pending.resolve(false);
      }
      queueRef.current = [];
    };
  }, [activeRequest]);

  const toneClasses = useMemo(() => {
    if (activeRequest?.tone === 'danger') {
      return {
        accent: 'text-red-700 dark:text-red-300',
        confirmButton:
          'border-[var(--border-visible)] bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-[var(--bg-input)] hover:border-[var(--text-secondary)]',
      };
    }

    return {
      accent: 'text-[var(--text-primary)]',
      confirmButton:
        'border-[var(--border-visible)] bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-[var(--bg-input)] hover:border-[var(--text-secondary)]',
    };
  }, [activeRequest?.tone]);

  return (
    <ConfirmDialogContext.Provider value={confirm}>
      {children}
      {typeof document !== 'undefined' && activeRequest
        ? createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
                onClick={() => resolveAndClose(false)}
              />

              <div className="relative w-full max-w-md animate-in zoom-in-95 fade-in duration-300 z-10">
                <div
                  className="relative rounded-2xl border border-[var(--border-subtle)] overflow-hidden shadow-2xl"
                  style={{ backgroundColor: 'var(--bg-strong, rgba(255,255,255,0.92))' }}
                >
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

                  <div className="relative z-10 p-6">
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div className="flex items-start gap-3">
                        <AlertTriangle size={14} className={`mt-0.5 ${toneClasses.accent}`} />
                        <div>
                          <p className="text-[9px] text-[var(--text-secondary)] uppercase tracking-[0.3em] font-black mb-1">
                            Confirmação
                          </p>
                          <h2 className="text-[var(--text-primary)] text-[13px] font-black uppercase tracking-[0.2em]">
                            {activeRequest.title}
                          </h2>
                        </div>
                      </div>

                      <button
                        onClick={() => resolveAndClose(false)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center border border-[var(--border-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-visible)] transition-all duration-200 cursor-pointer"
                        aria-label="Fechar confirmação"
                      >
                        <X size={12} />
                      </button>
                    </div>

                    <div className="h-[1px] w-full mb-5 bg-gradient-to-r from-[var(--shimmer-via)] to-transparent" />

                    <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">
                      {activeRequest.description}
                    </p>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => resolveAndClose(false)}
                        className="flex-1 h-10 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] hover:border-[var(--border-visible)] transition-all duration-200 cursor-pointer"
                      >
                        {activeRequest.cancelLabel}
                      </button>
                      <button
                        type="button"
                        onClick={() => resolveAndClose(true)}
                        className={`flex-1 h-10 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all duration-200 cursor-pointer ${toneClasses.confirmButton}`}
                      >
                        {activeRequest.confirmLabel}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirmDialog() {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useConfirmDialog deve ser usado dentro de ConfirmDialogProvider');
  }
  return context;
}
