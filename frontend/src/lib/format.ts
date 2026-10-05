import type { Grade, Tier } from '@/api/types';

export const NOT_MEASURED = 'Not measured';

export const formatScore = (value: number | null): string => (value === null ? NOT_MEASURED : value.toFixed(1));
export const formatPercent = (value: number | null): string => (value === null ? NOT_MEASURED : `${value.toFixed(1)}%`);
export const formatCount = (n: number): string => n.toLocaleString('en-US');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "30 Sep 2026" (UTC). */
export function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "29 Sep · 14:02" (UTC). */
export function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} · ${hh}:${mm}`;
}

export const truncateHash = (sha256: string | null): string => (sha256 ? `${sha256.slice(0, 4)}…${sha256.slice(-4)}` : '—');

/** Grade bands apply to the unrounded score. */
export function gradeOf(score: number): Grade {
  return score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';
}

/** CSS class for a grade tint; "b-n" for not measured or client-list domains. */
export function bandClass(score: number | null, excluded = false): string {
  return excluded || score === null ? 'b-n' : `b-${gradeOf(score).toLowerCase()}`;
}

export const GRADE_COLOR: Record<Grade, string> = {
  A: 'var(--ok)', B: 'var(--brand)', C: 'var(--warn)', D: 'var(--serious)', F: 'var(--bad)',
};

export const TIER_LABEL: Record<Tier, string> = {
  1: 'Tier 1 · captured by CiV',
  2: 'Tier 2 · independent third party',
  3: 'Tier 3 · your systems by API',
  4: 'Tier 4 · uploaded by you',
};

export const formatTiers = (tiers: Tier[]): string => (tiers.length === 0 ? '—' : `Tier ${tiers.join(' + ')}`);
