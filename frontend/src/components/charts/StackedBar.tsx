import { Legend } from './Legend';

export interface Segment { label: string; value: number; color: string; display?: string }

/** One bar split into labelled parts, with a legend that states each value. */
export function StackedBar({ segments, height = 16, label, legend = true }: { segments: Segment[]; height?: number; label: string; legend?: boolean }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const shown = segments.filter((s) => s.value > 0);
  return (
    <div>
      <div className="flex w-full gap-[2px] overflow-hidden rounded-[5px]" style={{ height }} role="img" aria-label={`${label}: ${segments.map((s) => `${s.label} ${s.display ?? s.value}`).join(', ')}`}>
        {shown.map((s) => <span key={s.label} title={`${s.label}: ${s.display ?? s.value}`} style={{ width: `${(s.value / total) * 100}%`, background: s.color }} />)}
      </div>
      {legend && <div className="mt-3"><Legend items={segments.map((s) => ({ label: s.label, color: s.color, value: s.display ?? String(s.value) }))} /></div>}
    </div>
  );
}
