import type { VaultStats } from '@/api/types';
import { Legend } from './Legend';

const FILL: Record<VaultStats['coverage'][number]['state'], string> = {
  covered: 'var(--series-1)',
  partial: 'repeating-linear-gradient(45deg, var(--series-1) 0 4px, transparent 4px 8px)',
  before: 'var(--series-muted)',
};

/** Twelve months of the evidence record: which are fully covered, partly covered, or before the engagement. */
export function CoverageStrip({ coverage }: { coverage: VaultStats['coverage'] }) {
  return (
    <div>
      <div className="flex gap-[3px]" role="img" aria-label={`Evidence coverage by month: ${coverage.map((c) => `${c.label} ${c.state === 'before' ? 'before engagement' : c.state}`).join(', ')}`}>
        {coverage.map((c, i) => (
          <div key={`${c.label}-${i}`} className="flex-1 text-center">
            <div className="h-7 rounded-[5px] border border-line" style={{ background: FILL[c.state] }} title={`${c.label}: ${c.state === 'before' ? 'before engagement' : c.state}`} />
            <div className="mt-1 text-[10px] text-txt-3">{c.label}</div>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <Legend items={[{ label: 'Covered', color: FILL.covered }, { label: 'Partly covered', color: FILL.partial }, { label: 'Before engagement · limited record', color: FILL.before }]} />
      </div>
    </div>
  );
}
