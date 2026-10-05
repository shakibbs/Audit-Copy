import { vi } from 'vitest';

/** Mutable navigation state read by the next/navigation mock. Tests set fields before rendering. */
export const navState: { pathname: string; params: Record<string, string>; push: ReturnType<typeof vi.fn> } = {
  pathname: '/',
  params: {},
  push: vi.fn(),
};

export function resetNav(): void {
  navState.pathname = '/';
  navState.params = {};
  navState.push = vi.fn();
}
