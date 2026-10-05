'use client';

import { useState } from 'react';
import type { Segment } from './StackedBar';

const R = 58;
const C = 2 * Math.PI * R;
const GAP = 3;

/** Ring showing parts of a whole, with the headline figure in the middle. */
export function Donut({ segments, centre, centreLabel, label }: { segments: Segment[]; centre: string; centreLabel: string; label: string }) {
  const [hover, setHover] = useState<string | null>(null);
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const arcs = segments.map((s, i) => {
    const before = segments.slice(0, i).reduce((sum, p) => sum + p.value, 0);
    return { ...s, length: Math.max(0, (s.value / total) * C - GAP), offset: (before / total) * C };
  });
  const active = segments.find((s) => s.label === hover);
  return (
    <div className="relative h-[160px] w-[160px] flex-none">
      <svg viewBox="0 0 160 160" width="160" height="160" role="img" aria-label={`${label}: ${segments.map((s) => `${s.label} ${s.display ?? s.value}`).join(', ')}`}>
        <g transform="rotate(-90 80 80)">
          {arcs.map((a) => (
            <circle key={a.label} cx="80" cy="80" r={R} fill="none" stroke={a.color} strokeWidth={hover === a.label ? 19 : 16}
              strokeDasharray={`${a.length} ${C - a.length}`} strokeDashoffset={-a.offset}
              onMouseEnter={() => setHover(a.label)} onMouseLeave={() => setHover(null)} />
          ))}
        </g>
      </svg>
      <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display text-[24px] font-extrabold leading-none text-txt">{active ? active.display ?? active.value : centre}</div>
          <div className="tiny mt-1 max-w-[92px]">{active ? active.label : centreLabel}</div>
        </div>
      </div>
    </div>
  );
}
