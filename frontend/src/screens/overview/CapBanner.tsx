import type { ScoreSummary } from '@/api/types';
import { Icon } from '@/components/ui/Icon';

/** Shown while the hard cap holds the grade down: says what share triggered it and what the limit is. */
export function CapBanner({ score }: { score: ScoreSummary }) {
  if (!score.cap) return null;
  return (
    <div className="hardstop mb-5" role="status">
      <Icon name="alert" size={22} />
      <div>
        <div className="font-display text-[14.5px] font-bold">Grade held at {score.grade} by the hard cap</div>
        <div className="text-[12.5px] opacity-90">{score.cap.share.toFixed(1)}% of contacts that need proof have none on record. While that share is above {score.cap.limit}%, the grade cannot rise above {score.grade}{score.rawGrade !== score.grade ? `; the score alone would be grade ${score.rawGrade}` : ''}.</div>
      </div>
    </div>
  );
}
