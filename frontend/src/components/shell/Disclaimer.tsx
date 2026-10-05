import { DISCLOSURE } from '@/api/types';

/** Standing line at the foot of every page. */
export function Disclaimer() {
  return <footer className="mt-10 border-t border-line pt-4 text-[11.5px] leading-relaxed text-txt-3">{DISCLOSURE} Comply iV is not a law firm.</footer>;
}
