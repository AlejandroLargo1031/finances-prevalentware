import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {  jwtVerify } from 'jose'; // Usamos jose lugar de jsonwebtoken

// Configura esto en tus variables de entorno
const JWT_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET!);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/login',  
    '/auth/register'
  ],
};

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;

  // Rutas públicas
  const publicRoutes = ['/auth/login', '/auth/register'];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Rutas protegidas
  const protectedRoutes = ['/dashboard', '/dashboard/usuarios', '/dashboard/reportes'];
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtected) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    try {
      // Verificar el token con jose (compatible con Edge)
      const { payload } = await jwtVerify(token, JWT_SECRET);
      
      if (!payload.role) {
        throw new Error('Token inválido: sin rol definido');
      }

      // Control de acceso por roles
      const adminRoutes = ['/dashboard/usuarios', '/dashboard/reportes'];
      const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

      if (isAdminRoute && payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

    } catch (error) {
      console.error('Error de autenticación:', error);
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      response.cookies.delete('auth-token');
      return response;
    }
  }

  return NextResponse.next();
}