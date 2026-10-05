import { Card } from '@/components/ui/Card';

const CHECKS = [
  ['Proof exists', 'There is a consent record for this number: a certificate, a signed form or a recorded keypress.', 'NO_PROOF'],
  ['Proof can be opened', 'The certificate still opens at the provider, or CiV holds a stored copy.', 'CONFLICTING'],
  ['Proof matches the contact', 'The number, the seller named and the consent wording match the contact made.', 'NO_PROOF'],
  ['Sources agree', 'The certificate, the page capture and the lead record tell the same story.', 'CONFLICTING'],
  ['No gaps in the record', 'Nothing is uncertain: timing, retention and reassignment are all settled.', 'WEAK'],
];

/** The five checks every contact runs through, in order. */
export function FiveChecks() {
  return (
    <Card title="The five checks" sub="Run in order; the first that does not pass sets the status">
      <ol className="m-0 flex list-none flex-col gap-2 p-0">
        {CHECKS.map(([name, text, result], i) => (
          <li key={name} className="flex gap-3 rounded-[10px] bg-surface-3 p-3">
            <span className="rank">{i + 1}</span>
            <span className="flex-1 text-[12.5px]"><span className="block font-semibold">{name}</span><span className="text-txt-2">{text}</span></span>
            <span className="tiny whitespace-nowrap">if not: <span className="mono font-semibold text-txt-2">{result}</span></span>
          </li>
        ))}
      </ol>
    </Card>
  );
}
