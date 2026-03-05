'use client';
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useJournal } from '@/contexts/JournalContext';

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[#0a0a0a] border border-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-wider">
      <p className="text-[#2dd4bf]">{d.label}</p>
      <p className="text-white">{d.count} {d.count === 1 ? 'entrada' : 'entradas'}</p>
    </div>
  );
}

export default function JournalActivityChart() {
  const { entries } = useJournal();

  const data = useMemo(() => {
    const map: Record<string, number> = {};
    entries.forEach(e => {
      const date = new Date(e.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      map[key] = (map[key] ?? 0) + 1;
    });

    const months: { key: string; label: string }[] = [];
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
      months.push({ key, label });
    }

    return months.map(m => ({
      label: m.label,
      count: map[m.key] ?? 0,
    }));
  }, [entries]);

  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="border border-white/[0.06] bg-white/[0.02] p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#2dd4bf]/20 to-transparent" />
      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#2dd4bf] mb-1 flex items-center gap-2">
        <span className="w-1 h-3 bg-[#2dd4bf] inline-block" />
        Atividade no Diário
      </p>
      <p className="text-[9px] text-zinc-600 mb-6 ml-3">entradas por mês — últimos 8 meses</p>

      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} barSize={20}>
          <XAxis dataKey="label" tick={{ fill: '#52525b', fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="count" radius={[2, 2, 0, 0]}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill="#2dd4bf"
                fillOpacity={d.count === 0 ? 0.08 : 0.2 + (d.count / maxCount) * 0.7}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex items-center justify-between mt-4">
        <span className="text-[8px] text-zinc-600 uppercase tracking-wider font-bold">
          Total: {entries.length} entradas
        </span>
        <span className="text-[8px] text-zinc-600 uppercase tracking-wider font-bold">
          Pico: {maxCount} / mês
        </span>
      </div>
    </div>
  );
}