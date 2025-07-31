import { notFound } from 'next/navigation';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { ParticipantProvider } from '@/components/participant-provider';

const jwtSecret = new TextEncoder().encode(process.env.SESSION_SECRET!);
const SESSION_COOKIE_NAME = 'session';

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie) {
    // should never happen
    console.warn('No session cookie found');
    notFound();
  }

  const { payload } = await jwtVerify(sessionCookie?.value, jwtSecret, { algorithms: ['HS256'] });
  // TODO: get game from db. we have sub and iss in payload
  // render the game
  return (
      <ParticipantProvider participant={participant} isManager={eventView.isManager}>
      </ParticipantProvider>
  );
}
