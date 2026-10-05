/** Page title block: group name, title, one-line purpose, and optional controls on the right. */
export function PageHead({ eyebrow, title, sub, children }: { eyebrow: string; title: string; sub: string; children?: React.ReactNode }) {
  return (
    <header className="page-head">
      <div className="max-w-3xl">
        <div className="ph-eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p className="ph-sub">{sub}</p>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  );
}
