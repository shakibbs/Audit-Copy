import '@testing-library/jest-dom/vitest';
import React from 'react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { resetMock } from './src/mock/api';
import { server } from './tests/msw';
import { navState, resetNav } from './tests/nav';

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string | { pathname: string }; children: React.ReactNode }) =>
    React.createElement('a', { href: typeof href === 'string' ? href : href.pathname, ...rest }, children),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => navState.pathname,
  useParams: () => navState.params,
  useRouter: () => ({ push: navState.push }),
}));

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  resetMock();
  resetNav();
});
afterAll(() => server.close());
