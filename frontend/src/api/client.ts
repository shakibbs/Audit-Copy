// Thin fetch wrapper. Every screen talks to the backend through these two functions.
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// Relative in the browser; absolute under the test runner, where there is no page origin to resolve against.
const BASE = typeof window !== 'undefined' && window.location.origin.startsWith('http') ? '' : 'http://localhost';

async function parse<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(response.status, (body as { detail?: string }).detail ?? 'The request could not be completed.');
  return body as T;
}

export function apiGet<T>(path: string, query: Record<string, string | undefined> = {}): Promise<T> {
  const params = new URLSearchParams(Object.entries(query).filter((e): e is [string, string] => Boolean(e[1])));
  const qs = params.toString();
  return fetch(`${BASE}/api${path}${qs ? `?${qs}` : ''}`).then((r) => parse<T>(r));
}

export function apiSend<T>(method: 'POST' | 'PATCH' | 'DELETE', path: string, body: unknown = {}): Promise<T> {
  return fetch(`${BASE}/api${path}`, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then((r) => parse<T>(r));
}
