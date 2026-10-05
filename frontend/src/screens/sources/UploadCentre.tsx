'use client';

import { useState } from 'react';
import { useSend, useUploads } from '@/api/queries';
import type { Source } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Loader } from '@/components/ui/Loader';
import { formatCount, formatDateTime, truncateHash } from '@/lib/format';

// SHA-256 of the file, computed in the browser before anything is sent.
async function fingerprint(file: File): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Upload a file for a source that accepts uploads; shows the fingerprint recorded for each file. */
export function UploadCentre({ sources }: { sources: Source[] }) {
  const accepting = sources.filter((s) => s.acceptsUpload);
  const [source, setSource] = useState(accepting.find((s) => s.status === 'not_supplied')?.name ?? accepting[0]?.name ?? '');
  const [file, setFile] = useState<File | null>(null);
  const uploads = useUploads();
  const send = useSend();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    const text = await file.text();
    send.mutate({ method: 'POST', path: '/uploads', body: { source, fileName: file.name, sha256: await fingerprint(file), rows: Math.max(0, text.split('\n').filter(Boolean).length - 1) } }, { onSuccess: () => setFile(null) });
  }

  return (
    <Card title="Upload centre" sub="Each file is fingerprinted on arrival and stored write-once" flush>
      <form className="flex flex-wrap items-end gap-3 px-[22px] pb-4" onSubmit={submit}>
        <div><label className="label" htmlFor="up-source">What is this file?</label>
          <select id="up-source" className="field !w-[260px]" value={source} onChange={(e) => setSource(e.target.value)}>
            {accepting.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select></div>
        <div className="min-w-[220px] flex-1">
          <span className="label">File (CSV)</span>
          <label className="field flex cursor-pointer items-center gap-2 !border-dashed text-txt-2">
            <Icon name="upload" /><span className="truncate">{file ? file.name : 'Choose a file'}</span>
            <input type="file" accept=".csv,text/csv" className="sr-only" aria-label="File to upload" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
        </div>
        <button type="submit" className="btn btn-primary" disabled={!file || send.isPending}>{send.isPending ? 'Uploading…' : 'Upload'}</button>
      </form>
      <Loader query={uploads}>
        {(list) => (
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>File</th><th>Source</th><th>Received (UTC)</th><th>Fingerprint</th><th>Rows read</th><th>Rows not read</th></tr></thead>
              <tbody>
                {list.map((u) => (
                  <tr key={u.artifactId}>
                    <td className="font-semibold">{u.fileName}<div className="tiny mono">{u.artifactId}</div></td>
                    <td className="text-txt-2">{u.source}</td>
                    <td className="mono whitespace-nowrap text-[11.5px]">{formatDateTime(u.receivedAt)}</td>
                    <td className="mono text-[11.5px]" title={u.sha256}>{truncateHash(u.sha256)}</td>
                    <td className="mono">{formatCount(u.rowsRead)}</td>
                    <td className="mono">{u.rowsRejected > 0 ? <span className="pill pill-amber">{u.rowsRejected}</span> : '0'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Loader>
    </Card>
  );
}
