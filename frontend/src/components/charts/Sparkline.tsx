/** Tiny trend line for table rows and tiles: direction only, no axes. */
export function Sparkline({ values, width = 84, height = 26, color = 'var(--series-1)' }: { values: (number | null)[]; width?: number; height?: number; color?: string }) {
  const nums = values.flatMap((v) => (v === null ? [] : [v]));
  if (nums.length < 2) return <span className="tiny">—</span>;
  const lo = Math.min(...nums);
  const span = Math.max(...nums) - lo || 1;
  const pts = values.flatMap((v, i) => (v === null ? [] : [[4 + (i / (values.length - 1)) * (width - 8), 4 + (1 - (v - lo) / span) * (height - 8)] as const]));
  const [ex, ey] = pts[pts.length - 1];
  return (
    <svg width={width} height={height} role="img" aria-label={`Trend: ${nums.join(', ')}`}>
      <path d={pts.map(([px, py], k) => `${k === 0 ? 'M' : 'L'} ${px} ${py}`).join(' ')} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={ex} cy={ey} r="3" fill={color} stroke="var(--surface)" strokeWidth="1.5" />
    </svg>
  );
}
