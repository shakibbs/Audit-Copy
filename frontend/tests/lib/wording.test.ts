import { describe, expect, it } from 'vitest';
import { assertNoBannedWords, assertNoBannedWordsDeep, findBannedWords } from '@/lib/wording';

describe('wording guard', () => {
  it('passes the approved phrasings', () => {
    expect(findBannedWords('CiV found 14 contacts after opt-out')).toEqual([]);
    expect(findBannedWords('No consent proof supplied')).toEqual([]);
    expect(findBannedWords('Few risk signals')).toEqual([]);
    expect(findBannedWords('S3 Object Lock in compliance mode')).toEqual([]);
  });

  it('finds banned words regardless of case and plural', () => {
    expect(findBannedWords('14 Violations found')).toEqual(['violations']);
    expect(findBannedWords('This call was illegal.')).toEqual(['illegal']);
    expect(findBannedWords('CiV ensures compliance')).toEqual(['ensures compliance']);
    expect(findBannedWords('a fake lead')).toEqual(['fake']);
  });

  it('assertNoBannedWords throws with context', () => {
    expect(() => assertNoBannedWords('non-compliant vendor', 'M07')).toThrow(/M07.*non-compliant/);
    expect(() => assertNoBannedWords('sources conflict', 'M07')).not.toThrow();
  });

  it('walks nested values and names the path', () => {
    expect(() => assertNoBannedWordsDeep({ a: [{ b: 'fraud signal' }] }, 'fx')).toThrow(/fx\.a\[0\]\.b.*fraud/);
    expect(() => assertNoBannedWordsDeep({ a: [{ b: 'risk signal' }], n: 3 }, 'fx')).not.toThrow();
  });
});
