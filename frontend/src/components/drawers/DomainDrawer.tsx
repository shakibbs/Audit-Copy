'use client';

import { useState } from 'react';
import { useActions, useDomains, useMetrics, useSession } from '@/api/queries';
import { StackedBar } from '@/components/charts/StackedBar';
import { TrendLine } from '@/components/charts/TrendLine';
import { Drawer } from '@/components/ui/Drawer';
import { GradeBadge } from '@/components/ui/GradeBadge';
import { MetricCode } from '@/components/ui/MetricCode';
import { NotMeasured } from '@/components/ui/NotMeasured';
import { Seg } from '@/components/ui/Seg';
import { formatScore } from '@/lib/format';
import { monthLabels } from '@/lib/months';
import { usePortal } from '@/state/PortalContext';
import { ActionRows } from './ActionRows';

const TABS = [{ id: 'result', label: 'Result' }, { id: 'evidence', label: 'Evidence' }, { id: 'history', label: 'History' }, { id: 'actions', label: 'Actions' }, { id: 'definition', label: 'Definition' }] as const;

/** Detail panel for one of the 25 domains. */
export function DomainDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('result');
  const { period } = usePortal();
  const domain = useDomains(period).data?.find((d) => d.code === id);
  const metrics = useMetrics(period).data ?? [];
  const actions = (useActions().data ?? []).filter((a) => a.domain === id && a.status !== 'resolved');
  const months = monthLabels(useSession().data?.periods);
  if (!domain) return <Drawer eyebrow="Domain" title={id} onClose={onClose}><p className="tiny">Loading…</p></Drawer>;

  return (
    <Drawer eyebrow={`Domain ${domain.code} · ${domain.family}`} title={domain.name} onClose={onClose}>
      <Seg label="Sections" options={TABS} value={tab} onChange={setTab} />
      <div className="mt-5">
        {tab === 'result' && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <GradeBadge score={domain.score} excluded={domain.excluded} />
              <div>
                <div className="font-display text-[30px] font-extrabold leading-none">{domain.excluded ? '—' : formatScore(domain.score)}</div>
                <div className="tiny mt-1">{domain.excluded ? 'Shown for information; outside the Audit Score' : `${domain.run} of ${domain.total} checkpoints run`}</div>
              </div>
            </div>
            {domain.score === null && !domain.excluded && <NotMeasured reason={`${domain.sources} has not been supplied.`} />}
            {domain.run > 0 && (
              <div>
                <div className="kpi-tag mb-2">Checkpoints</div>
                <StackedBar label="Checkpoints" segments={[
                  { label: 'Passed', value: domain.pass, color: 'var(--ok)' }, { label: 'Warned', value: domain.warn, color: 'var(--warn)' },
                  { label: 'Failed', value: domain.fail, color: 'var(--bad)' }, { label: 'Not run', value: domain.notRun, color: 'var(--series-muted)' },
                ]} />
              </div>
            )}
            <div>
              <div className="kpi-tag mb-1.5">Top finding</div>
              <p className="m-0 text-[13px]">{domain.finding}</p>
            </div>
          </div>
        )}
        {tab === 'evidence' && (
          <div className="flex flex-col gap-5">
            <dl className="m-0"><div className="kv"><dt>Sources</dt><dd>{domain.sources}</dd></div></dl>
            <div>
              <div className="kpi-tag mb-2">Metrics that feed this domain</div>
              {domain.metrics.length === 0 && <p className="tiny m-0">Checkpoint results only; no library metric.</p>}
              {domain.metrics.map((code) => {
                const m = metrics.find((x) => x.code === code);
                return <div key={code} className="chk"><span className="flex items-center gap-2"><MetricCode code={code} /> {m?.name}</span><span className="mono font-semibold">{m?.display}</span></div>;
              })}
            </div>
          </div>
        )}
        {tab === 'history' && <TrendLine label={`${domain.name} score by month`} points={domain.history.map((value, i) => ({ label: months[i] ?? '', value }))} />}
        {tab === 'actions' && <ActionRows actions={actions} />}
        {tab === 'definition' && <p className="m-0 text-[13px] leading-relaxed">{domain.what}</p>}
      </div>
    </Drawer>
  );
}
