// app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Obtener token de cookies o headers
    const cookieStore = cookies();
    const tokenFromCookie = (await cookieStore).get('auth-token')?.value;
    const authHeader = (await headers()).get('authorization');
    const tokenFromHeader = authHeader?.split(' ')[1];
    const token = tokenFromCookie || tokenFromHeader;

    // Validar token
    if (!token) {
      console.error('[Auth/Me] Error 401: Token no encontrado');
      return NextResponse.json(
        { error: 'Acceso no autorizado. Token no encontrado' },
        { status: 401 }
      );
    }

    // Verificar token JWT
    const decoded = jwt.verify(token, process.env.AUTH_SECRET!) as {
      userId: string;
      email?: string;
      role: string;
    };

    // Opcional: Obtener datos adicionales del usuario desde la base de datos
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Preparar respuesta
    const responseData = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || decoded.role || 'USER', // Prioridad: DB > Token > Default
      },
      permissions: {
        canCreate: user.role !== 'USER',
        canEdit: user.role !== 'USER',
        canDelete: user.role === 'ADMIN',
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('[Auth/Me] Error:', error);

    // Manejo específico para errores de JWT
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Error al obtener información del usuario' },
      { status: 500 }
    );
  }
}