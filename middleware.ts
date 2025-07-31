// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const jwtSecret = new TextEncoder().encode(process.env.SESSION_SECRET!);
const SESSION_COOKIE_NAME = 'session';

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/game/')) {
    const sessionToken = request.cookies.get(SESSION_COOKIE_NAME);

    if (sessionToken) {
      try {
        // Just verify the token exists and is valid. The page will handle the rest.
        await jwtVerify(sessionToken.value, jwtSecret, { algorithms: ['HS256'] });
      } catch {
        // If token is invalid, remove it and redirect to the same page.
        // This cleans up bad cookies.
        const response = NextResponse.redirect(request.url);
        response.cookies.delete(SESSION_COOKIE_NAME);
        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
