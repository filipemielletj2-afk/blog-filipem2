import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const MASTER_GATEWAY_KEY = 'miellet-admin-secret-2026';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Intercept any /admin or /app access
  if (pathname.startsWith('/admin') || pathname.startsWith('/app')) {
    const keyParam = searchParams.get('key') || searchParams.get('secret');
    const gatewayCookie = request.cookies.get('filipem2_admin_gateway')?.value;
    const adminToken = request.cookies.get('filipem2_admin_token')?.value;

    const isKeyValid = keyParam === MASTER_GATEWAY_KEY;
    const isGatewayValid = gatewayCookie === MASTER_GATEWAY_KEY;
    const hasAdminToken = Boolean(adminToken);

    // If key provided in URL is valid, unlock gateway cookie for 30 days
    if (isKeyValid) {
      const targetUrl = pathname === '/admin/login' || pathname.startsWith('/admin')
        ? new URL(pathname, request.url)
        : new URL('/admin', request.url);

      const response = NextResponse.redirect(targetUrl);
      response.cookies.set('filipem2_admin_gateway', MASTER_GATEWAY_KEY, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      });
      return response;
    }

    // Allow /app route so the user can enter their secret master key via UI
    if (pathname.startsWith('/app')) {
      return NextResponse.next();
    }

    // STEALTH SHIELD:
    // If not authorized (no valid gateway cookie and no admin token):
    // RETURN 404 NOT FOUND! The admin panel is completely invisible to the public.
    if (!isGatewayValid && !hasAdminToken) {
      return NextResponse.rewrite(new URL('/not-found', request.url), { status: 404 });
    }

    // If gateway is unlocked, enforce standard authentication on protected admin routes
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      if (!adminToken) {
        const loginUrl = new URL('/admin/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/app/:path*'],
};
