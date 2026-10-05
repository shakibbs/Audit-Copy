'use client';

import { useState } from 'react';
import { ChartTip } from './ChartTip';
import { useWidth } from './useWidth';

export interface TrendPoint { label: string; value: number | null; note?: string | null }

const PAD = { top: 14, right: 18, bottom: 26, left: 36 };

/** Single-series line over time with a hover read-out. Gaps (null values) are left open. */
export function TrendLine({ points, unit = '', height = 190, label, target, color = 'var(--series-1)' }: {
  points: TrendPoint[]; unit?: string; height?: number; label: string; target?: { value: number; label: string }; color?: string;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const values = points.flatMap((p) => (p.value === null ? [] : [p.value]));
  if (values.length === 0) return <div className="tiny py-6">No measured values yet.</div>;

  const all = target ? [...values, target.value] : values;
  const span = Math.max(...all) - Math.min(...all) || 1;
  const lo = Math.max(0, Math.min(...all) - span * 0.25);
  const hi = Math.max(...all) + span * 0.2;
  const innerW = width - PAD.left - PAD.right;
  const innerH = height - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (v: number) => PAD.top + (1 - (v - lo) / (hi - lo)) * innerH;
  const drawn = points.map((p, i) => (p.value === null ? null : { i, px: x(i), py: y(p.value), value: p.value })).filter((p) => p !== null);
  const line = drawn.map((p, k) => `${k === 0 ? 'M' : 'L'} ${p.px} ${p.py}`).join(' ');
  const area = `${line} L ${drawn[drawn.length - 1].px} ${PAD.top + innerH} L ${drawn[0].px} ${PAD.top + innerH} Z`;
  const ticks = [lo, (lo + hi) / 2, hi];
  const last = drawn[drawn.length - 1];
  const shown = hover === null ? null : drawn.find((p) => p.i === hover) ?? null;
  const summary = points.map((p) => `${p.label} ${p.value === null ? 'not measured' : `${p.value}${unit}`}`).join(', ');

  function onMove(e: React.MouseEvent<SVGRectElement>) {
    const box = e.currentTarget.getBoundingClientRect();
    const ratio = box.width === 0 ? 0 : (e.clientX - box.left) / box.width;
    setHover(Math.round(ratio * (points.length - 1)));
  }

  return (
    <div ref={ref} className="relative w-full">
      <svg width={width} height={height} role="img" aria-label={`${label}: ${summary}`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeWidth="1" />
            <text x={PAD.left - 8} y={y(t) + 3} textAnchor="end" fontSize="10" fill="var(--txt-3)">{t.toFixed(span < 5 ? 1 : 0)}</text>
          </g>
        ))}
        {target && (
          <g>
            <line x1={PAD.left} x2={width - PAD.right} y1={y(target.value)} y2={y(target.value)} stroke="var(--txt-3)" strokeWidth="1" strokeDasharray="4 4" />
            <text x={PAD.left + 6} y={y(target.value) - 5} textAnchor="start" fontSize="10" fill="var(--txt-2)">{target.label}</text>
          </g>
        )}
        {points.map((p, i) => <text key={p.label} x={x(i)} y={height - 7} textAnchor="middle" fontSize="10.5" fill="var(--txt-3)">{p.label}</text>)}
        <path d={area} fill={color} opacity="0.1" />
        <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {shown && <line x1={shown.px} x2={shown.px} y1={PAD.top} y2={PAD.top + innerH} stroke="var(--txt-3)" strokeWidth="1" />}
        {drawn.map((p) => (
          <circle key={p.i} cx={p.px} cy={p.py} r={p.i === last.i || p.i === hover ? 4.5 : 3} fill={color} stroke="var(--surface)" strokeWidth="2" />
        ))}
        <rect x={PAD.left} y={PAD.top} width={innerW} height={innerH} fill="transparent" onMouseMove={onMove} onMouseLeave={() => setHover(null)} />
      </svg>
      {shown && (
        <ChartTip x={shown.px} y={shown.py} title={points[shown.i].label} lines={[`${shown.value.toFixed(1)}${unit}`, ...(points[shown.i].note ? [points[shown.i].note as string] : [])]} />
      )}
    </div>
  );
}
