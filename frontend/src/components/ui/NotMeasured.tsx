import Link from 'next/link';

/** "Not measured" is a state of its own: says what is missing and where to supply it. */
export function NotMeasured({ reason }: { reason: string }) {
  return (
    <div className="rounded-[10px] border border-dashed border-line bg-surface-3 p-3 text-[12.5px] text-txt-2">
      <span className="pill pill-gray mr-2">Not measured</span>
      {reason} <Link href="/sources" className="font-semibold">Supply it in Source Registry</Link>
    </div>
  );
}
