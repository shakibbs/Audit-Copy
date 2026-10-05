import { bandClass, gradeOf } from '@/lib/format';

/** Letter grade for a score; a dash when the score is not measured or the domain is outside the score. */
export function GradeBadge({ score, excluded = false }: { score: number | null; excluded?: boolean }) {
  const letter = score === null || excluded ? '–' : gradeOf(score);
  return <span className={`grade-badge ${bandClass(score, excluded)}`} aria-label={letter === '–' ? 'No grade' : `Grade ${letter}`}>{letter}</span>;
}
