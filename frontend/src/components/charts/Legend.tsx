export interface LegendItem { label: string; color: string; value?: string }

/** Names each series beside a colour swatch, so identity never rests on colour alone. */
export function Legend({ items, column = false }: { items: LegendItem[]; column?: boolean }) {
  return (
    <ul className={`m-0 flex list-none gap-x-4 gap-y-1.5 p-0 text-[12px] text-txt-2 ${column ? 'flex-col' : 'flex-wrap'}`}>
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 flex-none rounded-[3px]" style={{ background: item.color }} />
          <span>{item.label}</span>
          {item.value && <span className="mono ml-auto pl-3 font-semibold text-txt">{item.value}</span>}
        </li>
      ))}
    </ul>
  );
}
