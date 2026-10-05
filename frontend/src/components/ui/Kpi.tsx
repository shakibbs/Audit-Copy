import { Info } from './Info';

/** Stat tile: one number with its label and a one-line reading. Clickable when `onClick` is given. */
export function Kpi({ tag, value, unit, foot, info, onClick, children }: {
  tag: string; value: string; unit?: string; foot?: string; info?: string; onClick?: () => void; children?: React.ReactNode;
}) {
  const body = (
    <>
      <span className="kpi-tag flex items-center gap-1.5">{tag}{info && <Info text={info} />}</span>
      <span className="kpi-val">{value}{unit && <small> {unit}</small>}</span>
      {foot && <span className="kpi-foot">{foot}</span>}
      {children}
    </>
  );
  // A tile with a tooltip stays a div: a button cannot contain the tooltip's own button.
  return onClick && !info
    ? <button type="button" className="card kpi" onClick={onClick}>{body}</button>
    : <div className="card kpi">{body}</div>;
}
