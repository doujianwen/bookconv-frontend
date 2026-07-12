import { NextResponse } from 'next/server';

export async function GET() {
  // Placeholder for Supabase OAuth callback
  // Actual implementation requires @supabase/ssr which uses cookies
  // This is a server-side route, so we redirect to the client-side handler
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
}
