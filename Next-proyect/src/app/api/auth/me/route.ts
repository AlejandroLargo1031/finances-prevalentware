import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { AuthAdapter } from '@/lib/auth-adapter';

export async function GET() {
  try {
    const cookieStore = cookies();
    const authHeader = (await headers()).get('authorization');

    const tokenFromCookie = (await cookieStore).get('auth-token')?.value;
    const tokenFromHeader = authHeader?.split(' ')[1];
    const jwtToken = tokenFromCookie || tokenFromHeader;

    if (jwtToken) {
      try {
        const decoded = jwt.verify(jwtToken, process.env.AUTH_SECRET!) as {
          userId: string;
          email?: string;
          role: string;
        };

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

        if (user) {
          return NextResponse.json({
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role || decoded.role || 'USER',
            },
            permissions: {
              canCreate: user.role !== 'USER',
              canEdit: user.role !== 'USER',
              canDelete: user.role === 'ADMIN',
            },
          });
        }
      } catch (jwtError) {
        if (jwtError instanceof jwt.JsonWebTokenError) {
          return NextResponse.json({ error: 'Token JWT inválido' }, { status: 401 });
        }
      }
    }

    const sessionToken = (await cookieStore).get('session-token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const session = await AuthAdapter.getSessionByToken(sessionToken);
    const sessionUser = session?.user;

    if (!session || !sessionUser) {
      return NextResponse.json({ error: 'Sesión no válida' }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: sessionUser.id,
        email: sessionUser.email,
        name: sessionUser.name,
        role: sessionUser.role,
      },
      permissions: {
        canCreate: sessionUser.role !== 'USER',
        canEdit: sessionUser.role !== 'USER',
        canDelete: sessionUser.role === 'ADMIN',
      },
    });
  } catch (error) {
    console.error('Error en /api/auth/me:', error);
    return NextResponse.json({ error: 'Error en servidor' }, { status: 500 });
  }
}
