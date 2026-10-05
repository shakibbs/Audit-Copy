/** Small "i" that explains a term on hover or keyboard focus. */
export function Info({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex normal-case tracking-normal">
      <button type="button" aria-label={`Explanation: ${text}`} className="grid h-[15px] w-[15px] place-items-center rounded-full border border-line bg-surface-3 text-[9.5px] font-bold leading-none text-txt-2">i</button>
      <span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-60 -translate-x-1/2 rounded-lg border border-line bg-surface p-2.5 text-[11.5px] font-medium leading-relaxed text-txt shadow-lg group-focus-within:block group-hover:block">{text}</span>
    </span>
  );
}
