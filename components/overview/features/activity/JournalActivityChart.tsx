'use client';
import { memo, useMemo } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useJournal } from '@/contexts/JournalContext';
import { PawIcon } from '@/components/shared/PawIcon';

type JournalActivityDatum = {
  label: string;
  count: number;
  isCurrentMonth: boolean;
  isPeak: boolean;
};

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload: JournalActivityDatum }>;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[var(--bg-base)] border border-[var(--border-muted)] px-3 py-2 text-[10px] font-black uppercase tracking-wider">
      <p className="text-[var(--text-primary)]">{d.label}</p>
      <p className="text-[var(--text-primary)]">{d.count} {d.count === 1 ? 'entrada' : 'entradas'}</p>
      {d.isCurrentMonth && (
        <p className="text-[var(--text-secondary)] text-[8px] mt-0.5">mês atual</p>
      )}
      {d.isPeak && d.count > 0 && (
        <p className="text-[var(--text-secondary)] text-[8px] mt-0.5">pico</p>
      )}
    </div>
  );
}

function JournalActivityChart() {
  const { entries } = useJournal();

  const data = useMemo(() => {
    const map: Record<string, number> = {};
    entries.forEach(e => {
      const date = new Date(e.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      map[key] = (map[key] ?? 0) + 1;
    });

    const months: { key: string; label: string; isCurrent: boolean }[] = [];
    const now = new Date();
    const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
      months.push({ key, label, isCurrent: key === currentKey });
    }

    const counts = months.map(m => map[m.key] ?? 0);
    const maxCount = Math.max(...counts, 1);
    const peakIndex = counts.indexOf(maxCount);

    return months.map((m, i) => ({
      label: m.label,
      count: map[m.key] ?? 0,
      isCurrentMonth: m.isCurrent,
      isPeak: i === peakIndex && (map[m.key] ?? 0) > 0,
    }));
  }, [entries]);

  const maxCount = Math.max(...data.map(d => d.count), 1);
  const totalEntries = entries.length;
  const currentMonthCount = data.find(d => d.isCurrentMonth)?.count ?? 0;
  const prevMonthCount = data[data.length - 2]?.count ?? 0;
  const trend = currentMonthCount - prevMonthCount;
  const peakMonth = data.find(d => d.isPeak);

  const insight = useMemo(() => {
    if (totalEntries === 0) return 'Nenhuma entrada ainda.';
    if (trend > 0) return `+${trend} entradas vs mês passado`;
    if (trend < 0) return `${trend} entradas vs mês passado`;
    if (peakMonth) return `Pico em ${peakMonth.label} com ${maxCount} entradas`;
    return `${totalEntries} entradas no total`;
  }, [trend, totalEntries, peakMonth, maxCount]);

  return (
    <div className="h-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 relative overflow-hidden group flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--shimmer-via)] to-transparent" />

      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--text-primary)] flex items-center gap-2">
          <PawIcon className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
          Atividade no Ronronário
        </p>
        {totalEntries > 0 && (
          <span
            className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 border"
            style={{
              borderColor: trend > 0 ? 'var(--border-visible)' : 'var(--border-subtle)',
              color: trend > 0 ? 'var(--text-primary)' : trend < 0 ? 'var(--text-secondary)' : 'var(--text-muted)',
              backgroundColor: trend > 0 ? 'var(--bg-elevated)' : 'transparent',
            }}
          >
            {trend > 0 ? 'UP' : trend < 0 ? 'DOWN' : 'FLAT'} {Math.abs(trend)}
          </span>
        )}
      </div>
      <p className="text-[9px] text-[var(--text-secondary)] mb-6 ml-3">entradas por mês — últimos 6 meses</p>

      {/* Gráfico cresce para preencher o espaço disponível */}
      <div className="flex-1 min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={20}>
            <XAxis
              dataKey="label"
              tick={{ fill: 'var(--text-muted)', fontSize: 9, fontWeight: 700 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--chart-cursor)' }} />
            <Bar dataKey="count" radius={[2, 2, 0, 0]} isAnimationActive={false}>
              {data.map((d, i) => (
                <Cell
                  key={i}
                  fill={d.isCurrentMonth ? 'var(--chart-strong)' : d.isPeak ? 'var(--chart-medium)' : 'var(--chart-soft)'}
                  fillOpacity={
                    d.count === 0
                      ? 0.25
                      : d.isCurrentMonth
                      ? 0.95
                      : d.isPeak
                      ? 0.8
                      : 0.45 + (d.count / maxCount) * 0.4
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer fixo na base */}
      <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
        <span className="text-[8px] text-[var(--text-secondary)] uppercase tracking-wider font-bold">
          Total: {totalEntries} entradas
        </span>
        <span className="text-[8px] text-[var(--text-secondary)] uppercase tracking-wider font-bold italic">
          {insight}
        </span>
        <span className="text-[8px] text-[var(--text-secondary)] uppercase tracking-wider font-bold">
          Pico: {maxCount}/mês
        </span>
      </div>

      <div className="flex items-center gap-2 mt-2">
        <div className="w-2 h-2 bg-[var(--text-primary)]" />
        <span className="text-[8px] text-[var(--text-secondary)] uppercase tracking-wider font-bold">mês atual</span>
        <div className="w-2 h-2 bg-[var(--text-secondary)] ml-2" />
        <span className="text-[8px] text-[var(--text-secondary)] uppercase tracking-wider font-bold">pico histórico</span>
      </div>
    </div>
  );
}

export default memo(JournalActivityChart);
