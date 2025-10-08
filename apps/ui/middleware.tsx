import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getSession } from './app/lib/session';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  if (null === (await getSession())) {
    return NextResponse.redirect(new URL('/api/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/home',
};
