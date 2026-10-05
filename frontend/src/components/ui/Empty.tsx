/** Shown when a list has nothing in it. */
export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="px-6 py-10 text-center text-[13px] text-txt-2">{children}</div>;
}
