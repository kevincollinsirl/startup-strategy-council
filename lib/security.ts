import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Simple in-memory rate limiter (resets on server restart)
// For production, use Redis or similar
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const DEFAULT_RATE_LIMIT = 60; // requests per minute

/**
 * Rate limiting check
 * Returns true if request should be allowed, false if rate limited
 */
export function checkRateLimit(identifier: string, limit?: number): { allowed: boolean; remaining: number; resetIn: number } {
  const maxRequests = limit || parseInt(process.env.RATE_LIMIT_RPM || String(DEFAULT_RATE_LIMIT), 10);
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  let record = rateLimitMap.get(identifier);

  // Clean up old record or create new one
  if (!record || record.resetTime < now) {
    record = { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };
    rateLimitMap.set(identifier, record);
  }

  record.count++;

  const remaining = Math.max(0, maxRequests - record.count);
  const resetIn = Math.max(0, record.resetTime - now);

  return {
    allowed: record.count <= maxRequests,
    remaining,
    resetIn,
  };
}

/**
 * Get client identifier for rate limiting
 */
export async function getClientIdentifier(): Promise<string> {
  const headersList = await headers();
  // Use X-Forwarded-For if behind a proxy, otherwise use a default
  const forwarded = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');
  return forwarded?.split(',')[0]?.trim() || realIp || 'anonymous';
}

/**
 * Rate limit middleware response
 */
export function rateLimitResponse(resetIn: number): NextResponse {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(Math.ceil(resetIn / 1000)),
        'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000 + resetIn / 1000)),
      },
    }
  );
}

// CSRF token storage (in-memory, resets on server restart)
// For production, use signed cookies or database storage
const csrfTokens = new Map<string, { token: string; expires: number }>();
const CSRF_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

/**
 * Generate a CSRF token for a session
 */
export function generateCsrfToken(sessionId: string): string {
  const token = crypto.randomUUID();
  csrfTokens.set(sessionId, {
    token,
    expires: Date.now() + CSRF_TOKEN_EXPIRY_MS,
  });

  // Clean up expired tokens periodically
  if (csrfTokens.size > 1000) {
    const now = Date.now();
    for (const [key, value] of csrfTokens.entries()) {
      if (value.expires < now) {
        csrfTokens.delete(key);
      }
    }
  }

  return token;
}

/**
 * Validate a CSRF token
 */
export function validateCsrfToken(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId);
  if (!stored) return false;
  if (stored.expires < Date.now()) {
    csrfTokens.delete(sessionId);
    return false;
  }
  return stored.token === token;
}

/**
 * Check if authentication is required and valid
 * Returns null if auth is not required or is valid
 * Returns error response if auth is required but invalid
 */
export async function checkAuth(): Promise<NextResponse | null> {
  const authSecret = process.env.AUTH_SECRET;

  // If no AUTH_SECRET is set, authentication is disabled
  if (!authSecret) {
    return null;
  }

  const headersList = await headers();
  const authHeader = headersList.get('authorization');

  if (!authHeader) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  // Expect: Bearer <token>
  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || token !== authSecret) {
    return NextResponse.json(
      { error: 'Invalid authentication' },
      { status: 401 }
    );
  }

  return null;
}

/**
 * Validate request origin for CSRF protection
 * Checks that the origin/referer matches the host
 */
export async function validateOrigin(): Promise<boolean> {
  const headersList = await headers();
  const origin = headersList.get('origin');
  const referer = headersList.get('referer');
  const host = headersList.get('host');

  // Allow requests without origin (same-origin requests, curl, etc.)
  if (!origin && !referer) {
    return true;
  }

  // Check if origin matches host
  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (originUrl.host === host) {
        return true;
      }
    } catch {
      return false;
    }
  }

  // Check if referer matches host
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (refererUrl.host === host) {
        return true;
      }
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * CSRF validation response
 */
export function csrfErrorResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Invalid request origin' },
    { status: 403 }
  );
}

/**
 * Combined security check for API routes
 * Returns null if all checks pass, or an error response
 */
export async function securityCheck(options?: {
  rateLimit?: number;
  skipCsrf?: boolean;
  skipAuth?: boolean;
}): Promise<NextResponse | null> {
  // Check authentication
  if (!options?.skipAuth) {
    const authError = await checkAuth();
    if (authError) return authError;
  }

  // Check rate limit
  const clientId = await getClientIdentifier();
  const rateCheck = checkRateLimit(clientId, options?.rateLimit);
  if (!rateCheck.allowed) {
    return rateLimitResponse(rateCheck.resetIn);
  }

  // Check CSRF (origin validation)
  if (!options?.skipCsrf) {
    const validOrigin = await validateOrigin();
    if (!validOrigin) {
      return csrfErrorResponse();
    }
  }

  return null;
}
