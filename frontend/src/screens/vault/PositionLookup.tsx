'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePosition } from '@/api/queries';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/format';

/** Enter a number and a date; get everything on record for that number as of that date. */
export function PositionLookup() {
  const [form, setForm] = useState({ phone: '(916) 555-0142', date: '2026-09-04' });
  const [asked, setAsked] = useState(form);
  const position = usePosition(asked.phone, asked.date);
  return (
    <Card title="Position lookup" sub="What was on record for a number on a given date">
      <form className="flex flex-wrap items-end gap-3" onSubmit={(e) => { e.preventDefault(); setAsked(form); }}>
        <div><label className="label" htmlFor="pl-phone">Phone number</label><input id="pl-phone" className="field mono !w-[200px]" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        <div><label className="label" htmlFor="pl-date">Date</label><input id="pl-date" type="date" className="field !w-[170px]" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
        <button type="submit" className="btn btn-primary">Look up</button>
      </form>
      {position.data && (
        <div className="mt-5">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-[13px]">
            <span className="font-semibold">{position.data.phone}</span><span className="text-txt-2">as of {formatDate(position.data.date)}</span>
            <span className={`pill ${position.data.insideCoverage ? 'pill-green' : 'pill-amber'}`}>{position.data.insideCoverage ? 'Inside the covered period' : 'Before the engagement · limited record'}</span>
          </div>
          <table className="tbl">
            <thead><tr><th>Item</th><th>On record</th><th>Source</th></tr></thead>
            <tbody>
              {position.data.rows.map((row) => (
                <tr key={row.label}><td className="whitespace-nowrap text-txt-2">{row.label}</td><td className="font-semibold">{row.value}</td><td className="mono text-[11.5px] text-txt-2">{row.source}</td></tr>
              ))}
            </tbody>
          </table>
          <p className="tiny mb-0 mt-3">Sample data returns the same record for any number. <Link href="/numbers/%2B14805550923">Open a full evidence file</Link></p>
        </div>
      )}
    </Card>
  );
}
