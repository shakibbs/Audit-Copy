/** Floating label shown while hovering a chart mark. The parent must be position: relative. */
export function ChartTip({ x, y, title, lines }: { x: number | string; y: number; title: string; lines: string[] }) {
  return (
    <div className="pointer-events-none absolute z-20 min-w-[120px] max-w-[240px] -translate-x-1/2 -translate-y-full rounded-lg border border-line bg-surface px-2.5 py-2 text-[11.5px] shadow-lg" style={{ left: x, top: y - 10 }}>
      <div className="font-semibold text-txt">{title}</div>
      {lines.map((line) => <div key={line} className="text-txt-2">{line}</div>)}
    </div>
  );
}
