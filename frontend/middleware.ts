import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const jwtSecret = process.env.JWT_SECRET;

export async function middleware(req: NextRequest) {
  if (!jwtSecret) {
    console.error('JWT_SECRET environment variable is not set.');
    return NextResponse.json({ error: 'Server configuration error: JWT secret missing.' }, { status: 500 });
  }

  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/', req.url)); // Redirect to login page
  }

  try {
    const secretKey = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token, secretKey);

    const userRole = payload.user?.role;
    if (!userRole) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    const normalizedRole = userRole;
    const pathname = req.nextUrl.pathname;

    const roleRoutes = ['/admin', '/Hr', '/Manager', '/Employee'];
    const allowedPrefix = `/${normalizedRole}`;

    const isAccessingOtherRolePath = roleRoutes.some(
      (route) => pathname.startsWith(route) && !pathname.startsWith(allowedPrefix)
    );

    if (isAccessingOtherRolePath) {
      return NextResponse.redirect(new URL('/404', req.url));
    }

    return NextResponse.next(); // Allow the request
  } catch (err) {
    console.error('Token verification failed:', err);
    return NextResponse.redirect(new URL('/', req.url));
  }
}

export const config = {
  matcher: ['/(admin|Hr|Manager|Employee)(.*)'],
};
