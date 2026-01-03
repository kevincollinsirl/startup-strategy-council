import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiter for Edge runtime
// Note: This resets when the edge function cold starts
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const DEFAULT_RATE_LIMIT = 100; // requests per minute for general API
const EVALUATE_RATE_LIMIT = 10; // requests per minute for expensive evaluate endpoint

function checkRateLimit(identifier: string, limit: number): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();

  let record = rateLimitMap.get(identifier);

  // Clean up old record or create new one
  if (!record || record.resetTime < now) {
    record = { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };
    rateLimitMap.set(identifier, record);
  }

  record.count++;

  const remaining = Math.max(0, limit - record.count);
  const resetIn = Math.max(0, record.resetTime - now);

  return {
    allowed: record.count <= limit,
    remaining,
    resetIn,
  };
}

function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0]?.trim() || realIp || 'anonymous';
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply to API routes
  if (!pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // GET requests are generally safe, only rate limit
  // POST/PUT/PATCH/DELETE need additional checks
  const isWriteMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method);

  // Determine rate limit based on endpoint
  const isEvaluateEndpoint = pathname === '/api/evaluate';
  const rateLimit = isEvaluateEndpoint ? EVALUATE_RATE_LIMIT : DEFAULT_RATE_LIMIT;

  // Check rate limit
  const clientId = getClientIdentifier(request);
  const rateLimitKey = isEvaluateEndpoint ? `evaluate:${clientId}` : `api:${clientId}`;
  const rateCheck = checkRateLimit(rateLimitKey, rateLimit);

  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(rateCheck.resetIn / 1000)),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000 + rateCheck.resetIn / 1000)),
        },
      }
    );
  }

  // CSRF protection for write methods
  if (isWriteMethod) {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const host = request.headers.get('host');

    // If origin or referer is present, validate it matches host
    if (origin) {
      try {
        const originUrl = new URL(origin);
        if (originUrl.host !== host) {
          return NextResponse.json(
            { error: 'Invalid request origin' },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: 'Invalid request origin' },
          { status: 403 }
        );
      }
    } else if (referer) {
      try {
        const refererUrl = new URL(referer);
        if (refererUrl.host !== host) {
          return NextResponse.json(
            { error: 'Invalid request origin' },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: 'Invalid request origin' },
          { status: 403 }
        );
      }
    }
    // Note: Requests without origin/referer are allowed (same-origin, curl, etc.)
  }

  // Optional authentication check
  const authSecret = process.env.AUTH_SECRET;
  if (authSecret) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || token !== authSecret) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      );
    }
  }

  // Add rate limit headers to successful response
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Remaining', String(rateCheck.remaining));
  response.headers.set('X-RateLimit-Limit', String(rateLimit));

  return response;
}

// Configure which routes the middleware applies to
export const config = {
  matcher: '/api/:path*',
};
