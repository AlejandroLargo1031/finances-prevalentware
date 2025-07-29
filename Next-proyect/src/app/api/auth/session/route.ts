import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const authHeader = (await headers()).get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { error: 'Token no enviado' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.AUTH_SECRET!);
    const userId =
      typeof decoded === "object" && decoded !== null && "userId" in decoded
        ? (decoded as { userId: string }).userId
        : null;

    if (!userId) {
      return NextResponse.json(
        { error: 'Token inválido: userId no encontrado' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json(
      { error: 'Token inválido' },
      { status: 401 }
    );
  }
}