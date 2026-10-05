import type { Severity } from '@/api/types';

const CLASS: Record<Severity, string> = { High: 'pill-red', Medium: 'pill-amber', Low: 'pill-gray' };

export function SeverityPill({ severity }: { severity: Severity }) {
  return <span className={`pill ${CLASS[severity]}`}>{severity}</span>;
}
