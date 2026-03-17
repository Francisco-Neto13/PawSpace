'use client';

import { useMemo, useState } from 'react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

const QUICK_SWATCHES = [
  '#ffffff',
  '#d4d4d8',
  '#22d3ee',
  '#06b6d4',
  '#34d399',
  '#10b981',
  '#60a5fa',
  '#3b82f6',
  '#818cf8',
  '#a78bfa',
  '#f59e0b',
  '#fb7185',
  '#f87171',
  '#ef4444',
  '#84cc16',
  '#facc15',
];

function isValidHexColor(color: string | null | undefined): color is string {
  return /^#[0-9a-fA-F]{6}$/.test((color || '').trim());
}

function normalizeHexColor(color: string | null | undefined): string {
  return isValidHexColor(color) ? color.trim().toLowerCase() : '#22d3ee';
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const safeValue = normalizeHexColor(value);
  const [isOpen, setIsOpen] = useState(false);
  const [hexInput, setHexInput] = useState(safeValue);
  const [hasTriedInvalidHex, setHasTriedInvalidHex] = useState(false);

  const normalizedInput = hexInput.trim();
  const isValidInput = isValidHexColor(normalizedInput);
  const showValidationError = hasTriedInvalidHex || (normalizedInput.length > 0 && !isValidInput);
  const previewColor = useMemo(
    () => (isValidInput ? normalizedInput.toLowerCase() : safeValue),
    [isValidInput, normalizedInput, safeValue]
  );

  const applyHex = () => {
    if (!isValidInput) {
      setHasTriedInvalidHex(true);
      return;
    }

    const normalized = normalizedInput.toLowerCase();
    setHexInput(normalized);
    setHasTriedInvalidHex(false);
    onChange(normalized);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <label className="field-label block mb-2">Cor</label>
      <button
        type="button"
        onClick={() => {
          setHexInput(safeValue);
          setHasTriedInvalidHex(false);
          setIsOpen((value) => !value);
        }}
        className="flex min-h-[76px] w-full items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-3.5 text-left hover:bg-[var(--bg-input)] hover:border-[var(--border-visible)] transition-all duration-200 sm:min-h-[84px]"
        aria-label={`Cor atual ${safeValue}`}
      >
        <div className="min-w-0 flex-1">
          <p className="ui-label mb-1 text-[var(--text-primary)]">Tom da trilha</p>
          <p className="ui-meta text-[var(--text-muted)]">Cor de destaque no mapa.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="ui-meta font-mono uppercase">{safeValue}</span>
          <span
            className="block h-10 w-10 rounded-xl border border-[var(--border-visible)]"
            style={{ backgroundColor: previewColor }}
            aria-hidden="true"
          />
        </div>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[110]" onClick={() => setIsOpen(false)} />
          <div className="absolute top-14 right-0 z-[120] w-[17rem] max-w-[calc(100vw-3rem)] rounded-2xl bg-[var(--bg-strong)] border border-[var(--border-subtle)] shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="border-b border-[var(--border-subtle)] p-3">
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-xl border border-[var(--border-visible)] shrink-0"
                  style={{ backgroundColor: previewColor }}
                  aria-hidden="true"
                />

                <div className="min-w-0 flex-1">
                  <input
                    type="text"
                    inputMode="text"
                    value={hexInput}
                    maxLength={7}
                    onChange={(event) => {
                      setHexInput(event.target.value);
                      if (hasTriedInvalidHex) {
                        setHasTriedInvalidHex(false);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        applyHex();
                      }
                    }}
                    className={`library-input field-input h-10 px-3 font-mono uppercase placeholder:text-[var(--text-muted)] ${
                      showValidationError ? 'border-red-400/50' : ''
                    }`}
                    placeholder="#22d3ee"
                    aria-label="Codigo hexadecimal da cor"
                  />
                </div>
              </div>

              <div className="mt-2 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className={`ui-meta ${showValidationError ? 'text-red-400/90' : ''}`}>
                  {showValidationError ? 'Use um HEX no formato #22d3ee.' : 'Escolha uma cor ou digite um HEX.'}
                </span>
                <button
                  type="button"
                  onClick={applyHex}
                  className="data-label px-2 py-1 rounded-lg border border-[var(--border-visible)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                >
                  Aplicar
                </button>
              </div>
            </div>

            <div className="p-3">
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                {QUICK_SWATCHES.map((swatch) => {
                  const isSelected = safeValue === swatch;

                  return (
                    <button
                      key={swatch}
                      type="button"
                      onClick={() => {
                        setHexInput(swatch);
                        setHasTriedInvalidHex(false);
                        onChange(swatch);
                        setIsOpen(false);
                      }}
                      className="h-8 rounded-lg border transition-all cursor-pointer"
                      style={{
                        backgroundColor: swatch,
                        borderColor: isSelected ? 'var(--text-primary)' : 'var(--border-visible)',
                        boxShadow: isSelected ? '0 0 0 1px var(--text-primary) inset' : undefined,
                      }}
                      aria-label={`Selecionar cor ${swatch}`}
                      title={swatch}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
