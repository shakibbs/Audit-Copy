'use client';

import { INTERNAL_ROLES, type Session } from '@/api/types';
import { usePortal } from '@/state/PortalContext';

/** Page-wide notices: counsel-directed marking, and the marker for results from an unapproved rulebook. */
export function Banners({ session }: { session: Session }) {
  const { runId, period } = usePortal();
  const run = session.runs.find((r) => r.runId === runId) ?? session.runs[0];
  const provisional = INTERNAL_ROLES.includes(session.role) && run && run.rulebookStatus !== 'approved';
  const older = period && period !== session.periods[0]?.id ? session.periods.find((p) => p.id === period) : null;
  return (
    <>
      {session.engagementMode === 'counsel_directed' && (
        <div className="note-box mb-4" role="note">Prepared at the direction of counsel. Findings and alerts are delivered to legal users only.</div>
      )}
      {provisional && (
        <div className="note-box mb-4" role="note"><strong>Provisional results.</strong> {run.label} uses {run.rulebookVersion}, which counsel has not approved ({run.variant} reading). These results are not shown to the client.</div>
      )}
      {older && (
        <div className="note-box mb-4" role="note">Showing <strong>{older.label}</strong> for scores, domains and metrics. Lists of contacts, actions and alerts always show the current state.</div>
      )}
    </>
  );
}
