import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const jwtSecret = process.env.JWT_SECRET;
const publicPaths = ['/', '/register', '/forgot-password', '/404','/chat'];
const allowedRoles = ['admin', 'hr', 'manager', 'employee'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip middleware for public pages and 404
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Allow static assets
  if (/\.(png|jpg|jpeg|svg|webp|gif|ico)$/.test(pathname)) {
    return NextResponse.next();
  }

  // Check if route matches allowed role prefixes
  const baseSegment = pathname.split('/')[1]?.toLowerCase();
  if (!allowedRoles.includes(baseSegment)) {
    return NextResponse.redirect(new URL('/404', req.url));
  }

  // Ensure JWT secret is configured
  if (!jwtSecret) {
    console.error('JWT_SECRET not set.');
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  try {
    const secretKey = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token, secretKey);
    const userRole = (payload as { user?: { role?: string } }).user?.role?.toLowerCase();

    if (userRole === baseSegment) {
      return NextResponse.next(); // Role is allowed
    } else {
      return NextResponse.redirect(new URL('/404', req.url));
    }
  } catch (err) {
    console.error('JWT verification error:', err);
    return NextResponse.redirect(new URL('/', req.url));
  }
}

export const config = {
  matcher: [
    '/((?!api|_next|static|favicon\\.ico|.*\\.(?:png|jpg|jpeg|svg|webp|gif|ico)).*)',
  ],
};
