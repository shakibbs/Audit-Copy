export interface BarRow { key: string; label: React.ReactNode; value: number | null; display: string; color?: string; onClick?: () => void; hint?: string }

/** Ranked horizontal bars with the value written at the end of each row. */
export function BarList({ rows, max, labelWidth = 150 }: { rows: BarRow[]; max?: number; labelWidth?: number }) {
  const top = max ?? Math.max(1, ...rows.map((r) => r.value ?? 0));
  return (
    <div className="flex flex-col gap-2.5">
      {rows.map((row) => {
        const inner = (
          <>
            <span className="truncate text-[12.5px] text-txt" style={{ flex: `0 0 ${labelWidth}px` }}>{row.label}</span>
            <span className="h-2.5 flex-1 overflow-hidden rounded-[4px] bg-surface-3">
              {row.value !== null && <span className="block h-full rounded-r-[4px]" style={{ width: `${Math.max(1.5, (row.value / top) * 100)}%`, background: row.color ?? 'var(--series-1)' }} />}
            </span>
            <span className="mono w-[78px] flex-none text-right text-[12px] font-semibold text-txt">{row.display}</span>
          </>
        );
        return row.onClick
          ? <button key={row.key} type="button" onClick={row.onClick} title={row.hint} className="-mx-2 flex items-center gap-3 rounded-lg border-0 bg-transparent px-2 py-1 text-left hover:bg-surface-3">{inner}</button>
          : <div key={row.key} title={row.hint} className="flex items-center gap-3 py-1">{inner}</div>;
      })}
    </div>
  );
}
