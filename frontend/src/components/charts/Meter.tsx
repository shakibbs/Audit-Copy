/** A single value against a limit. */
export function Meter({ value, limit, label, color = 'var(--series-1)' }: { value: number; limit: number; label: string; color?: string }) {
  const share = Math.min(100, (value / limit) * 100);
  return (
    <div role="img" aria-label={`${label}: ${value.toLocaleString('en-US')} of ${limit.toLocaleString('en-US')}`}>
      <div className="h-3 overflow-hidden rounded-[5px] bg-surface-3">
        <div className="h-full rounded-r-[4px]" style={{ width: `${share}%`, background: color }} />
      </div>
    </div>
  );
}
