'use client';

import { FAMILIES, type Domain } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { bandClass, gradeOf } from '@/lib/format';
import { useDrawer } from '@/state/DrawerContext';

/** All 25 domains as tiles grouped by family and tinted by grade. */
export function DomainMap({ domains }: { domains: Domain[] }) {
  const { open } = useDrawer();
  return (
    <Card title="Domain map" sub="Each tile is one domain; the letter is its grade">
      <div className="grid gap-x-5 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
        {FAMILIES.map((family) => (
          <div key={family}>
            <div className="kpi-tag mb-2">{family}</div>
            <div className="grid grid-cols-3 gap-2">
              {domains.filter((d) => d.family === family).map((d) => (
                <button key={d.code} type="button" className={`dtile ${bandClass(d.score, d.excluded)}`} onClick={() => open('domain', d.code)} aria-label={`${d.name}: ${d.excluded ? 'outside the score' : d.score === null ? 'not measured' : `${d.score.toFixed(1)}, grade ${gradeOf(d.score)}`}`}>
                  <span className="flex items-center justify-between">
                    <span className="mono text-[11px] font-semibold">{d.code}</span>
                    <span className="font-display text-[13px] font-extrabold">{d.excluded || d.score === null ? '–' : gradeOf(d.score)}</span>
                  </span>
                  <span className="font-display text-[17px] font-extrabold leading-tight text-txt">{d.excluded ? 'Info' : d.score === null ? 'N/M' : d.score.toFixed(1)}</span>
                  <span className="truncate text-[10.5px] leading-tight text-txt-2">{d.name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="tiny mb-0 mt-4">N/M = not measured (a source is missing). Info = a client-list domain, shown for information and left out of the Audit Score.</p>
    </Card>
  );
}
