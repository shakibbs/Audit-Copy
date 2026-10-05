'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type DrawerKind = 'domain' | 'metric' | 'contact' | 'action' | 'vendor';
export interface DrawerTarget { kind: DrawerKind; id: string }

interface DrawerState { target: DrawerTarget | null; open: (kind: DrawerKind, id: string) => void; close: () => void }

const DrawerContext = createContext<DrawerState>({ target: null, open: () => {}, close: () => {} });

/** One slide-out panel at a time; any component can open it. */
export function DrawerProvider({ children }: { children: React.ReactNode }) {
  const [target, setTarget] = useState<DrawerTarget | null>(null);
  const open = useCallback((kind: DrawerKind, id: string) => setTarget({ kind, id }), []);
  const close = useCallback(() => setTarget(null), []);
  const value = useMemo(() => ({ target, open, close }), [target, open, close]);
  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>;
}

export const useDrawer = () => useContext(DrawerContext);
