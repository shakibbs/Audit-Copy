import type { Period } from '@/api/types';

/** Short month labels, oldest first, for history charts: ["Jun", "Jul", "Aug", "Sep"]. */
export const monthLabels = (periods: Period[] | undefined): string[] => [...(periods ?? [])].reverse().map((p) => p.label.slice(0, 3));
