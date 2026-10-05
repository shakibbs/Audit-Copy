'use client';

import { useConduct, useMetrics } from '@/api/queries';
import { BarList } from '@/components/charts/BarList';
import { Columns } from '@/components/charts/Columns';
import { Legend } from '@/components/charts/Legend';
import { Card } from '@/components/ui/Card';
import { Loader } from '@/components/ui/Loader';
import { PageHead } from '@/components/ui/PageHead';
import { formatCount } from '@/lib/format';
import { usePortal } from '@/state/PortalContext';
import { MetricTile } from './MetricTile';

export function ConductScreen() {
  const { period } = usePortal();
  const conduct = useConduct();
  const metrics = useMetrics(period);
  return (
    <>
      <PageHead eyebrow="Intelligence" title="Contact Conduct" sub="How contacts were made: hours, frequency, abandoned calls, disclosures and caller ID." />
      <Loader query={conduct}>
        {(c) => (
          <div className="flex flex-col gap-5">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {c.metrics.map((code) => { const m = metrics.data?.find((x) => x.code === code); return m ? <MetricTile key={code} metric={m} /> : null; })}
            </div>
            <Card title="Contacts by hour of day" sub="Recipient local time">
              <Columns label="Contacts by recipient local hour" height={170} columns={c.hoursOfDay.map((h) => ({ label: h.hour, value: h.count, display: `${formatCount(h.count)} contacts`, flagged: h.outside, note: h.outside ? 'Outside the federal 8am–9pm window' : undefined }))} />
              <div className="mt-3"><Legend items={[{ label: 'Inside 8am–9pm', color: 'var(--series-1)' }, { label: 'Outside 8am–9pm', color: 'var(--series-3)' }]} /></div>
            </Card>
            <div className="grid gap-5 lg:grid-cols-2">
              <Card title="Outside permitted hours, by state" sub="Contacts outside each state's own window">
                <BarList labelWidth={210} rows={c.byState.map((s) => ({ key: s.state, value: s.count, display: formatCount(s.count), label: <span>{s.state} <span className="text-txt-3">· {s.window}</span></span> }))} />
                <p className="tiny mb-0 mt-3">A further {formatCount(c.possibleLocationUncertain)} are possible: the address and the area code point to different time zones.</p>
              </Card>
              <Card title="Abandoned-call rate, by campaign" sub={`30-day rate against a ${c.abandonLimit}% limit`}>
                <BarList max={Math.max(5, ...c.byCampaign.map((x) => x.rate))} labelWidth={110} rows={c.byCampaign.map((x) => ({
                  key: x.campaign, label: x.campaign, value: x.rate, color: x.rate > c.abandonLimit ? 'var(--series-3)' : 'var(--series-1)',
                  display: `${x.rate.toFixed(1)}%${x.rate > c.abandonLimit ? ' · over' : ''}`,
                }))} />
                <div className="mt-3"><Legend items={[{ label: `At or under ${c.abandonLimit}%`, color: 'var(--series-1)' }, { label: `Over ${c.abandonLimit}%`, color: 'var(--series-3)' }]} /></div>
              </Card>
            </div>
          </div>
        )}
      </Loader>
    </>
  );
}
