'use client';

import { useEffect } from 'react';
import { Icon } from './Icon';

/** Slide-out panel on the right. Closes on Escape, on the overlay, or on the close button. */
export function Drawer({ eyebrow, title, onClose, children }: { eyebrow: string; title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" aria-label="Close panel" className="absolute inset-0 cursor-default bg-black/40" onClick={onClose} />
      <aside role="dialog" aria-modal="true" aria-label={title} className="relative flex h-full w-full max-w-[520px] flex-col border-l border-line bg-surface shadow-lg">
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <div className="ph-eyebrow !mb-1">{eyebrow}</div>
            <h2 className="text-[19px]">{title}</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </aside>
    </div>
  );
}
