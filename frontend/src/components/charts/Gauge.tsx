import type { Grade } from '@/api/types';
import { GRADE_COLOR } from '@/lib/format';

const R = 92;
const CX = 120;
const CY = 130;

// Point on the half-circle for a 0–100 value: 0 at the left end, 100 at the right.
function at(value: number, radius = R): [number, number] {
  const theta = Math.PI * (1 - value / 100);
  return [CX + radius * Math.cos(theta), CY - radius * Math.sin(theta)];
}

/** Half-circle score dial with the grade boundaries marked. */
export function Gauge({ score, grade }: { score: number; grade: Grade }) {
  const [x, y] = at(Math.max(0.5, Math.min(100, score)));
  return (
    <div className="relative mx-auto w-[240px]">
      <svg viewBox="0 0 240 150" width="240" height="150" role="img" aria-label={`Audit score ${score.toFixed(1)} out of 100, grade ${grade}`}>
        <path d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`} fill="none" stroke="var(--series-muted)" strokeWidth="14" strokeLinecap="round" />
        <path d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${x} ${y}`} fill="none" stroke={GRADE_COLOR[grade]} strokeWidth="14" strokeLinecap="round" />
        {[60, 70, 80, 90].map((mark) => {
          const [x1, y1] = at(mark, R + 11);
          const [x2, y2] = at(mark, R + 16);
          const [tx, ty] = at(mark, R + 25);
          return (
            <g key={mark}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--txt-3)" strokeWidth="1.5" />
              <text x={tx} y={ty + 3} textAnchor="middle" fontSize="9" fill="var(--txt-3)">{mark}</text>
            </g>
          );
        })}
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <div className="font-display text-[44px] font-extrabold leading-none text-txt">{score.toFixed(1)}</div>
        <div className="tiny mt-1">out of 100</div>
      </div>
    </div>
  );
}
