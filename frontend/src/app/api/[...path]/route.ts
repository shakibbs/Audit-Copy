// Development stand-in: serves /api/* from the mock until the Django API replaces it.
import { NextResponse, type NextRequest } from 'next/server';
import { mockApi } from '@/mock/api';

type Ctx = { params: Promise<{ path: string[] }> };

async function handle(request: NextRequest, { params }: Ctx): Promise<NextResponse> {
  const { path } = await params;
  const query = Object.fromEntries(request.nextUrl.searchParams);
  const body = request.method === 'GET' ? undefined : await request.json().catch(() => ({}));
  const result = mockApi({ method: request.method, path: `/${path.join('/')}`, query, body });
  return NextResponse.json(result.body, { status: result.status });
}

export const dynamic = 'force-dynamic';
export { handle as GET, handle as POST, handle as PATCH, handle as DELETE };
