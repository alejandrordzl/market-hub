import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { UserToken } from '@/utils/types';

export async function middleware(request: NextRequest) {
  console.log("=== MIDDLEWARE ===");
  // Solo aplicar a rutas de API v1
  if (!request.nextUrl.pathname.startsWith('/api/v1')) {
    return NextResponse.next();
  }

  // Skip login endpoint - no requiere autenticación
  if (request.nextUrl.pathname === '/api/v1/auth/login') {
    return NextResponse.next();
  }

  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized - Missing token' },
      { status: 401 }
    );
  }

  try {
    // Handle custom API key
    if (token === process.env.NEXT_PUBLIC_CUSTOM_API_KEY) {
      const response = NextResponse.next();
      response.headers.set('x-user-id', '2');
      response.headers.set('x-user-role', 'USER');
      response.headers.set('x-user-name', 'Custom API');
      response.headers.set('x-user-email', 'custom-api@abarroteslulu.com');
      return response;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserToken;
    
    // Agregar información del usuario a los headers para que los endpoints puedan acceder
    const response = NextResponse.next();
    response.headers.set('x-user-id', decoded.id.toString());
    response.headers.set('x-user-role', decoded.role || 'USER');
    response.headers.set('x-user-name', decoded.name || 'Unknown');
    response.headers.set('x-user-email', decoded.email || '');
    
    return response;
  } catch (error) {
    console.error('Middleware authentication error:', error);
    return NextResponse.json(
      { error: 'Unauthorized - Invalid token' },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: ['/api/v1/:path*']
}
