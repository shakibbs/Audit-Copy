'use client';

import { useState } from 'react';
import { useActions, useMetrics, useSession } from '@/api/queries';
import { TrendLine } from '@/components/charts/TrendLine';
import { Delta } from '@/components/ui/Delta';
import { DomainCode } from '@/components/ui/DomainCode';
import { Drawer } from '@/components/ui/Drawer';
import { NotMeasured } from '@/components/ui/NotMeasured';
import { Seg } from '@/components/ui/Seg';
import { monthLabels } from '@/lib/months';
import { usePortal } from '@/state/PortalContext';
import { ActionRows } from './ActionRows';

const TABS = [{ id: 'result', label: 'Result' }, { id: 'evidence', label: 'Evidence' }, { id: 'history', label: 'History' }, { id: 'actions', label: 'Actions' }, { id: 'definition', label: 'Definition' }] as const;
const SOURCE_LABEL = { CiV: 'Measured by CiV', Client: 'From your records', AI: 'AI-assisted, sampled by a person' };

/** Detail panel for one metric, laid out the same way as the domain panel. */
export function MetricDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('result');
  const { period } = usePortal();
  const metric = useMetrics(period).data?.find((m) => m.code === id);
  const allActions = useActions().data ?? [];
  const months = monthLabels(useSession().data?.periods);
  if (!metric) return <Drawer eyebrow="Metric" title={id} onClose={onClose}><p className="tiny">Loading…</p></Drawer>;

  const actions = allActions.filter((a) => metric.domains.includes(a.domain) && a.status !== 'resolved');
  const prev = metric.history[metric.history.length - 2];
  return (
    <Drawer eyebrow={`Metric ${metric.code} · ${metric.group}`} title={metric.name} onClose={onClose}>
      <Seg label="Sections" options={TABS} value={tab} onChange={setTab} />
      <div className="mt-5">
        {tab === 'result' && (
          <div className="flex flex-col gap-4">
            {metric.notMeasured
              ? <NotMeasured reason={metric.notMeasured} />
              : <div>
                  <div className="font-display text-[34px] font-extrabold leading-none">{metric.display}</div>
                  {metric.value !== null && prev !== null && prev !== undefined && <div className="mt-2"><Delta value={metric.value - prev} better={metric.better} unit={metric.unit} /></div>}
                </div>}
            <p className="m-0 text-[13px] text-txt-2">{metric.note}</p>
          </div>
        )}
        {tab === 'evidence' && (
          <dl className="m-0">
            <div className="kv"><dt>Based on</dt><dd>{metric.evidence}</dd></div>
            <div className="kv"><dt>Measured by</dt><dd>{SOURCE_LABEL[metric.source]}</dd></div>
            <div className="kv"><dt>Feeds domains</dt><dd className="flex flex-wrap justify-end gap-1">{metric.domains.length ? metric.domains.map((d) => <DomainCode key={d} code={d} />) : '—'}</dd></div>
          </dl>
        )}
        {tab === 'history' && <TrendLine label={`${metric.name} by month`} unit={metric.unit} points={metric.history.map((value, i) => ({ label: months[i] ?? '', value }))} />}
        {tab === 'actions' && <ActionRows actions={actions} />}
        {tab === 'definition' && <p className="m-0 text-[13px] leading-relaxed">{metric.definition}</p>}
      </div>
    </Drawer>
  );
}
