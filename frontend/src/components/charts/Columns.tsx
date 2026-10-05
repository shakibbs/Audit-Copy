'use client';

import { useState } from 'react';
import { ChartTip } from './ChartTip';

export interface Column { label: string; value: number; display?: string; flagged?: boolean; note?: string }

/** Vertical bars for a distribution. Flagged columns use the second series colour and are named in the legend. */
export function Columns({ columns, height = 150, label, limit, every = 1 }: {
  columns: Column[]; height?: number; label: string; limit?: { value: number; label: string }; every?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const top = Math.max(1, ...columns.map((c) => c.value), limit?.value ?? 0) * 1.08;
  const shown = hover === null ? null : columns[hover];
  return (
    <div className="relative" role="img" aria-label={`${label}: ${columns.map((c) => `${c.label} ${c.display ?? c.value}`).join(', ')}`}>
      <div className="relative flex items-end gap-[2px] border-b border-line" style={{ height }}>
        {limit && (
          <div className="pointer-events-none absolute inset-x-0 border-t border-dashed border-txt-3" style={{ bottom: `${(limit.value / top) * 100}%` }}>
            <span className="absolute -top-[18px] right-0 text-[10.5px] text-txt-2">{limit.label}</span>
          </div>
        )}
        {columns.map((c, i) => (
          <div key={c.label} className="flex h-full flex-1 items-end justify-center" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <div className="w-full max-w-[24px] rounded-t-[4px]" style={{ height: `${Math.max(c.value > 0 ? 2 : 0, (c.value / top) * 100)}%`, background: c.flagged ? 'var(--series-3)' : 'var(--series-1)', opacity: hover === null || hover === i ? 1 : 0.55 }} />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-[2px]">
        {columns.map((c, i) => <div key={c.label} className="flex-1 truncate text-center text-[10px] text-txt-3">{i % every === 0 ? c.label : ''}</div>)}
      </div>
      {shown && hover !== null && (
        <ChartTip x={`${((hover + 0.5) / columns.length) * 100}%`} y={0} title={shown.label} lines={[shown.display ?? String(shown.value), ...(shown.note ? [shown.note] : [])]} />
      )}
    </div>
  );
}
