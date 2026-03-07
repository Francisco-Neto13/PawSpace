'use client';
import { memo, useMemo } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useJournal } from '@/contexts/JournalContext';
import { PawIcon } from '@/components/shared/PawIcon';

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[#0a0a0a] border border-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-wider">
      <p className="text-white">{d.label}</p>
      <p className="text-white/80">{d.count} {d.count === 1 ? 'entrada' : 'entradas'}</p>
      {d.isCurrentMonth && (
        <p className="text-white/40 text-[8px] mt-0.5">mês atual</p>
      )}
      {d.isPeak && d.count > 0 && (
        <p className="text-white/40 text-[8px] mt-0.5">🏆 pico</p>
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
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 relative overflow-hidden group">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="flex items-start justify-between mb-1">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white flex items-center gap-2">
          <PawIcon className="w-3 h-3 text-white/60 shrink-0" />
          Atividade no Ronronário
        </p>
        {totalEntries > 0 && (
          <span
            className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 border"
            style={{
              borderColor: trend > 0 ? 'rgba(255,255,255,0.2)' : trend < 0 ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.1)',
              color: trend > 0 ? 'rgba(255,255,255,0.8)' : trend < 0 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.5)',
              backgroundColor: trend > 0 ? 'rgba(255,255,255,0.04)' : 'transparent',
            }}
          >
            {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}
          </span>
        )}
      </div>
      <p className="text-[9px] text-zinc-600 mb-6 ml-3">entradas por mês — últimos 6 meses</p>

      <ResponsiveContainer width="100%" height={160}>
        <BarChart
          data={data}
          barSize={20}
        >
          <XAxis
            dataKey="label"
            tick={{ fill: '#52525b', fontSize: 9, fontWeight: 700 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar
            dataKey="count"
            radius={[2, 2, 0, 0]}
            isAnimationActive={false}
          >
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={d.isCurrentMonth ? 'rgba(255,255,255,0.9)' : d.isPeak ? 'rgba(255,255,255,0.75)' : '#ffffff'}
                fillOpacity={
                  d.count === 0
                    ? 0.05
                    : d.isCurrentMonth
                    ? 0.7
                    : d.isPeak
                    ? 0.55
                    : 0.15 + (d.count / maxCount) * 0.4
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.04]">
        <span className="text-[8px] text-zinc-600 uppercase tracking-wider font-bold">
          Total: {totalEntries} entradas
        </span>
        <span className="text-[8px] text-zinc-500 uppercase tracking-wider font-bold italic">
          {insight}
        </span>
        <span className="text-[8px] text-zinc-600 uppercase tracking-wider font-bold">
          Pico: {maxCount}/mês
        </span>
      </div>

      <div className="flex items-center gap-2 mt-2">
        <div className="w-2 h-2 bg-white/70" />
        <span className="text-[8px] text-zinc-600 uppercase tracking-wider font-bold">mês atual</span>
        <div className="w-2 h-2 bg-white/45 ml-2" />
        <span className="text-[8px] text-zinc-600 uppercase tracking-wider font-bold">pico histórico</span>
      </div>
    </div>
  );
}

export default memo(JournalActivityChart);
