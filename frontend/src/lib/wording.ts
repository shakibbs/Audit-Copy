/** Words and phrases no client-visible text may contain (engineering spec §9). */
export const BANNED_WORDS = [
  'violation', 'violations', 'breach', 'breaches', 'illegal', 'compromised',
  'fake', 'fraud', 'fraudulent', 'genuine', 'compliant', 'non-compliant',
  'noncompliant', 'ensures compliance', 'protects you', 'guaranteed', 'guarantee',
] as const;

const patterns = BANNED_WORDS.map((word) => ({
  word,
  re: new RegExp(`(^|[^a-z])${word.replace(/[-\s]/g, '[-\\s]')}(?=$|[^a-z])`, 'i'),
}));

/** Returns every banned word found in `text`, in list order. */
export function findBannedWords(text: string): string[] {
  return patterns.filter((p) => p.re.test(text)).map((p) => p.word);
}

/** Throws if `text` contains banned wording. `context` names the source in the error. */
export function assertNoBannedWords(text: string, context = 'text'): void {
  const found = findBannedWords(text);
  if (found.length > 0) throw new Error(`Banned wording in ${context}: ${found.join(', ')}`);
}

/** Walks any JSON-like value and asserts every string in it is free of banned words. */
export function assertNoBannedWordsDeep(value: unknown, context = 'value'): void {
  if (typeof value === 'string') return assertNoBannedWords(value, context);
  if (Array.isArray(value)) return value.forEach((v, i) => assertNoBannedWordsDeep(v, `${context}[${i}]`));
  if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) assertNoBannedWordsDeep(v, `${context}.${k}`);
  }
}
