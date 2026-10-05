import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { mockApi } from '../src/mock/api';

// Routes every /api/* call in tests through the same mock the dev server uses.
export const server = setupServer(
  http.all('*/api/*', async ({ request }) => {
    const url = new URL(request.url);
    const body = request.method === 'GET' ? undefined : await request.json().catch(() => ({}));
    const result = mockApi({ method: request.method, path: url.pathname.replace(/^\/api/, ''), query: Object.fromEntries(url.searchParams), body });
    return HttpResponse.json(result.body as Record<string, unknown>, { status: result.status });
  }),
);
