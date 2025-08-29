import { NextRequest, NextResponse } from 'next/server';
import { auth } from './app/api/auth/[...nextauth]/route';

export async function middleware(req: NextRequest) {
    const session = await auth(req, NextResponse.next());

    if (!session?.user && req.nextUrl.pathname.startsWith('/staff/dashboard')) {
        return NextResponse.redirect(new URL('/staff', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/staff/dashboard/:path*'],
}; 
