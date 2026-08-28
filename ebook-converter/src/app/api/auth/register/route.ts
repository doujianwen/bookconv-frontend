// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth/storage';
import { createSession, setAuthCookie } from '@/lib/auth/session';
import z from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = registerSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { email, password } = validated.data;

    // Rate limit: simple check — allow max 3 registrations per minute per IP
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const cacheKey = `rate:register:${ip}`;
    const existing = (await request.cookies.get(cacheKey));
    // In-memory rate limit for simplicity (use Redis in production)
    const now = Date.now();
    const windowMs = 60_000; // 1 minute

    let reqs = 0;
    const lastReq = request.cookies.get('_reg_ts');
    if (lastReq && parseInt(lastReq.value) > now - windowMs) {
      reqs++;
    } else {
      reqs = 1;
      request.cookies.set('_reg_ts', String(now));
    }

    if (reqs > 3) {
      return NextResponse.json({ error: 'Too many registration attempts' }, { status: 429 });
    }

    const result = await registerUser(email, password);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    const token = await createSession(email);
    const cookie = setAuthCookie(token);

    const response = NextResponse.json({ success: true }, { status: 201 });
    response.cookies.set(cookie.name, cookie.value, {
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
      sameSite: cookie.sameSite,
      path: cookie.path,
      maxAge: cookie.maxAge,
    });

    return response;
  } catch (error: any) {
    console.error('[auth/register] Error:', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
