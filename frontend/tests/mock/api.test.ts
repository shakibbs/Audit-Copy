import { describe, expect, it } from 'vitest';
import type { Action, Domain, Metric, Rulebook, ScoreSummary, SearchHit, Session } from '@/api/types';
import { assertNoBannedWordsDeep } from '@/lib/wording';
import { mockApi } from '@/mock/api';

const get = <T,>(path: string, query: Record<string, string> = {}) => mockApi({ method: 'GET', path, query }).body as T;

const READS = ['/session', '/score', '/domains', '/actions', '/alerts', '/contacts', '/consent', '/consent-pages', '/revocation', '/vault', '/position', '/legal-holds',
  '/evidence/%2B14805550923', '/metrics', '/conduct', '/leads', '/vendors', '/sources', '/uploads', '/reports', '/rulebook', '/reg-changes', '/readiness', '/settings', '/users', '/access-log'];

describe('mock API', () => {
  it.each(READS)('GET %s answers and uses no banned wording', (path) => {
    const result = mockApi({ method: 'GET', path });
    expect(result.status).toBe(200);
    assertNoBannedWordsDeep(result.body, path);
  });

  it('holds 25 domains and 33 metrics', () => {
    expect(get<Domain[]>('/domains')).toHaveLength(25);
    expect(get<Metric[]>('/metrics')).toHaveLength(33);
  });

  it('averages only measured, non-excluded domains into the score', () => {
    const scored = get<Domain[]>('/domains').filter((d) => d.score !== null && !d.excluded);
    const mean = scored.reduce((sum, d) => sum + (d.score ?? 0), 0) / scored.length;
    const score = get<ScoreSummary>('/score');
    expect(score.score).toBeCloseTo(mean, 5);
    expect(score.domainsMeasured).toBe(scored.length);
  });

  it('returns an earlier month when a period is given', () => {
    const june = get<ScoreSummary>('/score', { period: '2026-06' });
    expect(june.score).toBe(68.4);
    expect(june.history).toHaveLength(1);
  });

  it('hides internal runs and rulebook impact from a client owner, and shows them to CiV staff', () => {
    expect(get<Session>('/session').runs).toHaveLength(1);
    expect(get<Rulebook>('/rulebook').impact).toHaveLength(0);
    mockApi({ method: 'POST', path: '/session/view-as', body: { role: 'admin' } });
    expect(get<Session>('/session').runs).toHaveLength(2);
    expect(get<Rulebook>('/rulebook').impact.length).toBeGreaterThan(0);
  });

  it('refuses data after sign-out and restores it after sign-in', () => {
    mockApi({ method: 'POST', path: '/session/sign-out' });
    expect(mockApi({ method: 'GET', path: '/score' }).status).toBe(401);
    expect(mockApi({ method: 'POST', path: '/session/sign-in', body: { email: 'a@b.example', password: 'x' } }).status).toBe(200);
    expect(mockApi({ method: 'GET', path: '/score' }).status).toBe(200);
  });

  it('updates an action and recomputes overdue', () => {
    const before = get<Action[]>('/actions').find((a) => a.id === 'a-3');
    expect(before?.overdue).toBe(false);
    mockApi({ method: 'PATCH', path: '/actions/a-3', body: { due: '2026-09-01', assignee: 'Priya Nair' } });
    const after = get<Action[]>('/actions').find((a) => a.id === 'a-3');
    expect(after).toMatchObject({ overdue: true, assignee: 'Priya Nair' });
  });

  it('finds domains, metrics, numbers, vendors and pages', () => {
    const kinds = (q: string) => get<SearchHit[]>('/search', { q }).map((h) => h.kind);
    expect(kinds('REV')).toContain('domain');
    expect(kinds('M08')).toContain('metric');
    expect(kinds('480555')).toContain('number');
    expect(kinds('Vendor E')).toContain('vendor');
    expect(kinds('rulebook')).toContain('page');
  });

  it('matches a known fingerprint and rejects an unknown one', () => {
    expect(get<{ found: boolean }>('/hash-check', { hash: `4f9c${'0'.repeat(56)}a71e` }).found).toBe(true);
    expect(get<{ found: boolean }>('/hash-check', { hash: 'abc' }).found).toBe(false);
  });
});
