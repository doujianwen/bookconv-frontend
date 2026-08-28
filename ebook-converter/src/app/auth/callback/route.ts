import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // Legacy auth callback stub. There is no active OAuth integration, so we
  // simply send the visitor back to the site root. We derive the origin from
  // the incoming request so the redirect works on any host (Vercel, localhost)
  // without depending on NEXT_PUBLIC_APP_URL being set.
  const origin = request.nextUrl.origin;
  return NextResponse.redirect(new URL('/', origin));
}
