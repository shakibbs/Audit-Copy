'use client';

import { useState } from 'react';
import { useSend } from '@/api/queries';
import { Card } from '@/components/ui/Card';

/** Export evidence files for a list of numbers in one request. */
export function BulkExport({ period }: { period: string }) {
  const [text, setText] = useState('');
  const send = useSend();
  const numbers = text.split(/[\s,;]+/).filter((n) => n.replace(/\D/g, '').length >= 10);
  return (
    <Card title="Bulk evidence export" sub="Paste phone numbers, one per line">
      <label className="sr-only" htmlFor="bulk">Phone numbers</label>
      <textarea id="bulk" className="field mono min-h-[110px]" placeholder={'+14805550923\n+19165554471'} value={text} onChange={(e) => { setText(e.target.value); send.reset(); }} />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" className="btn btn-primary" disabled={numbers.length === 0 || send.isPending}
          onClick={() => send.mutate({ method: 'POST', path: '/reports', body: { name: `Evidence file export · ${numbers.length} ${numbers.length === 1 ? 'number' : 'numbers'}`, period } })}>Export {numbers.length || ''} {numbers.length === 1 ? 'file' : 'files'}</button>
        <span className="tiny" role="status">{send.isSuccess ? 'Queued. It will appear in the history below when ready.' : `${numbers.length} valid ${numbers.length === 1 ? 'number' : 'numbers'} recognised`}</span>
      </div>
    </Card>
  );
}
