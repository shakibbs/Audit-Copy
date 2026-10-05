/** Shown to operations users while the engagement is counsel-directed. */
export function Locked() {
  return (
    <div className="card card-pad mx-auto mt-10 max-w-xl text-center">
      <h1 className="text-[20px]">This engagement is counsel-directed</h1>
      <p className="mt-3 text-[13px] text-txt-2">Findings and alerts are delivered to legal users only. Ask your legal contact for the items assigned to you.</p>
    </div>
  );
}
