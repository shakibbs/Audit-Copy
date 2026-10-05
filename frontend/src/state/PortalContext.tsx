'use client';

import { createContext, useContext, useMemo, useState } from 'react';

interface PortalState { period: string | undefined; setPeriod: (id: string) => void; runId: string | undefined; setRunId: (id: string) => void }

const PortalContext = createContext<PortalState>({ period: undefined, setPeriod: () => {}, runId: undefined, setRunId: () => {} });

/** Holds the month and run chosen in the top bar. Undefined means the latest. */
export function PortalProvider({ children }: { children: React.ReactNode }) {
  const [period, setPeriod] = useState<string>();
  const [runId, setRunId] = useState<string>();
  const value = useMemo(() => ({ period, setPeriod, runId, setRunId }), [period, runId]);
  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
}

export const usePortal = () => useContext(PortalContext);
