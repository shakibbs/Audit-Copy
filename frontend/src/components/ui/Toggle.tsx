/** On/off switch. */
export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (next: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
      className="relative h-[22px] w-[40px] flex-none rounded-full border border-line transition-colors" style={{ background: checked ? 'var(--brand)' : 'var(--surface-3)' }}>
      <span className="absolute top-[2px] h-4 w-4 rounded-full bg-white shadow transition-all" style={{ left: checked ? 20 : 2 }} />
    </button>
  );
}
