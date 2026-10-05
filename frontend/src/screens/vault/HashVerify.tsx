'use client';

import { useState } from 'react';
import { useHashCheck } from '@/api/queries';
import { Card } from '@/components/ui/Card';
import { TierChip } from '@/components/ui/TierChip';
import { formatDate, formatDateTime } from '@/lib/format';

/** Paste a file's SHA-256 fingerprint to confirm it matches a stored record. */
export function HashVerify({ sample }: { sample: string }) {
  const [input, setInput] = useState('');
  const [asked, setAsked] = useState('');
  const check = useHashCheck(asked);
  return (
    <Card title="Verify a fingerprint" sub="Confirm an exported file matches the record held">
      <form className="flex flex-wrap items-end gap-3" onSubmit={(e) => { e.preventDefault(); setAsked(input.trim()); }}>
        <div className="min-w-[240px] flex-1"><label className="label" htmlFor="hv">SHA-256 fingerprint</label><input id="hv" className="field mono" placeholder="64 characters" value={input} onChange={(e) => setInput(e.target.value)} /></div>
        <button type="submit" className="btn btn-primary" disabled={!input.trim()}>Verify</button>
      </form>
      <button type="button" className="mt-2 border-0 bg-transparent p-0 text-[12px] font-semibold text-brand" onClick={() => setInput(sample)}>Use a sample fingerprint</button>
      {asked && check.data && (check.data.found ? (
        <dl className="m-0 mt-4 rounded-[10px] bg-surface-3 px-4 py-1" role="status">
          <div className="kv"><dt>Result</dt><dd><span className="pill pill-green">Matches a stored record</span></dd></div>
          <div className="kv"><dt>Record</dt><dd>{check.data.artifact}</dd></div>
          <div className="kv"><dt>Captured</dt><dd>{formatDateTime(check.data.capturedAt)} UTC</dd></div>
          <div className="kv"><dt>Included in the daily anchor of</dt><dd>{formatDate(check.data.anchoredOn)}</dd></div>
          <div className="kv"><dt>Captured by</dt><dd>{check.data.tier && <TierChip tier={check.data.tier} />}</dd></div>
        </dl>
      ) : <div className="note-box mt-4" role="status">No stored record has this fingerprint. Either the file was changed after export, or it did not come from this vault.</div>)}
    </Card>
  );
}
