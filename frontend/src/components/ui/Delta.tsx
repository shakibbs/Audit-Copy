import { Icon } from './Icon';

/** Change against the previous period. Colour follows whether the direction is the better one. */
export function Delta({ value, better = 'higher', unit = '', label = 'vs previous month' }: { value: number; better?: 'higher' | 'lower' | 'none'; unit?: string; label?: string }) {
  if (Math.abs(value) < 0.05) return <span className="tiny">No change {label}</span>;
  const up = value > 0;
  const good = better === 'none' ? null : (better === 'higher') === up;
  const ink = good === null ? 'var(--txt-2)' : good ? 'var(--ok-ink)' : 'var(--bad-ink)';
  return (
    <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold" style={{ color: ink }}>
      <Icon name={up ? 'arrow-up' : 'arrow-down'} size={12} />
      {up ? '+' : '−'}{Math.abs(value).toFixed(1)}{unit} <span className="font-normal text-txt-3">{label}</span>
    </span>
  );
}
