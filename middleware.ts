import { nanoid } from 'nanoid';
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';

const jwtSecret = new TextEncoder().encode(process.env.SESSION_SECRET!);
const SESSION_COOKIE_NAME = 'session';

async function mintSessionToken(playerId: string, gameId: string) {
  const newSessionToken = await new SignJWT()
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setSubject(playerId)
    .setIssuer(gameId)
    .setExpirationTime('2h')
    .sign(jwtSecret);

  return newSessionToken;
}

export default async function (request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/game/')) {
    // todo: logout mechanism?
    const response = NextResponse.next();
    const sessionToken = request.cookies.get(SESSION_COOKIE_NAME);
    const gameId = request.nextUrl.pathname.split('/')[2];

    if (sessionToken) {
      try {
        await jwtVerify(sessionToken.value, jwtSecret, { algorithms: ['HS256'] });

        return response;
      } catch {
        // passthrough
      }
    }

    const newSessionToken = await mintSessionToken(nanoid(21), gameId);

    response.cookies.set(SESSION_COOKIE_NAME, newSessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return response;
  }

  return request;
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/app`, `/_next`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|_next|.*\\..*).*)',
};
