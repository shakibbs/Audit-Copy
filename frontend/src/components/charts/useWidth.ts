'use client';

import { useEffect, useRef, useState } from 'react';

/** Measures an element's width so SVG charts can draw at real pixel size. */
export function useWidth<T extends HTMLElement>(fallback = 560): [React.RefObject<T | null>, number] {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(fallback);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(240, Math.floor(entry.contentRect.width))));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, width];
}
