import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = cookies();
    const tokenFromCookie = (await cookieStore).get('auth-token')?.value;
    const authHeader = (await headers()).get('authorization');
    const tokenFromHeader = authHeader?.split(' ')[1];
    const token = tokenFromCookie || tokenFromHeader;

    if (!token) {
      return NextResponse.json(
        { error: 'Acceso no autorizado. Token no encontrado' },
        { status: 401 }
      );
    }

    try {
      jwt.verify(token, process.env.AUTH_SECRET!);
    } catch  {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 401 }
      );
    }

    const movements = await prisma.movement.findMany({
      select: {
        id: true,
        concept: true,
        amount: true,
        date: true,
        type: true,
        createdAt: true,
        user: { 
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    return NextResponse.json({ movements });

  } catch (error) {
    console.error('Error en GET /api/movements:', error);

    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Error al obtener movimientos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get('auth-token')?.value;

    console.log('Token de cookie:', token ? '***' + token.slice(-4) : 'NO TOKEN');

    if (!token) {
      return NextResponse.json(
        { error: 'Acceso no autorizado. Inicia sesión primero' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.AUTH_SECRET!) as { userId: string };
    const userId = decoded.userId;

    const body = await request.json();
    if (!body.concept || !body.amount || !body.type) {
      return NextResponse.json(
        { error: 'Concepto, monto y tipo son requeridos' },
        { status: 400 }
      );
    }

    const newMovement = await prisma.movement.create({
      data: {
        concept: body.concept,
        amount: parseFloat(body.amount),
        type: body.type,
        date: body.date ? new Date(body.date) : new Date(),
        userId: userId 
      },
      select: {
        id: true,
        concept: true,
        amount: true,
        date: true,
        type: true,
        createdAt: true
      }
    });

    return NextResponse.json(
      { success: true, movement: newMovement },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error en POST /api/movements:', error);

    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Token inválido o expirado. Vuelve a iniciar sesión' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear movimiento' },
      { status: 500 }
    );
  }
}