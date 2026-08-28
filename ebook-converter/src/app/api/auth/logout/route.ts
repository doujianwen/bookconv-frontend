// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth/session';

export async function POST() {
  const cookie = clearAuthCookie();
  const response = NextResponse.json({ success: true });
  response.cookies.set(cookie.name, cookie.value, {
    httpOnly: cookie.httpOnly,
    secure: cookie.secure,
    sameSite: cookie.sameSite,
    path: cookie.path,
    maxAge: cookie.maxAge,
  });
  return response;
}
