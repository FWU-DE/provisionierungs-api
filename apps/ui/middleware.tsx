import { NextRequest, NextResponse } from 'next/server';

import { getSession, verifySession } from './app/lib/session';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  console.log('Middleware executed');
  if (null === (await getSession())) {
    return NextResponse.redirect(new URL('/api/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/home',
};
