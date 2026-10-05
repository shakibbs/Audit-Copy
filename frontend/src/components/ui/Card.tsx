/** Titled surface. `flush` drops the body padding so tables and lists reach the edges. */
export function Card({ title, sub, right, flush = false, className = '', children }: {
  title?: string; sub?: string; right?: React.ReactNode; flush?: boolean; className?: string; children: React.ReactNode;
}) {
  return (
    <section className={`card ${className}`}>
      {title && (
        <div className="card-h">
          <div>
            <h3>{title}</h3>
            {sub && <div className="card-sub mt-0.5">{sub}</div>}
          </div>
          {right}
        </div>
      )}
      <div className={flush ? '' : title ? 'px-[22px] pb-[22px]' : 'card-pad'}>{children}</div>
    </section>
  );
}
