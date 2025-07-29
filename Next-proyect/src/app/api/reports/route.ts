import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = cookies();
    const tokenFromCookie = (await cookieStore).get("auth-token")?.value;
    const authHeader = (await headers()).get("authorization");
    const tokenFromHeader = authHeader?.split(" ")[1];
    const token = tokenFromCookie || tokenFromHeader;

    if (!token) {
      console.error("[Reports] Error 401: Token no encontrado");
      return NextResponse.json(
        { error: "Acceso no autorizado. Token no encontrado" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.AUTH_SECRET!) as {
      userId: string;
      role: string;
    };
    const userId = decoded.userId;
    const isAdmin = decoded.role === "ADMIN";

    const whereClause = isAdmin ? {} : { userId };

    const movements = await prisma.movement.findMany({
      where: whereClause,
      orderBy: { date: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    const income = movements
      .filter((m) => m.type === "INCOME")
      .reduce((sum, m) => sum + m.amount, 0);

    const expense = movements
      .filter((m) => m.type === "EXPENSE")
      .reduce((sum, m) => sum + m.amount, 0);

    const balance = income - expense;

    const responseData = {
      movements: movements.map((mov) => ({
        id: mov.id,
        date: mov.date,
        concept: mov.concept,
        amount: mov.amount,
        type: mov.type,
        userId: mov.userId,
        userName: mov.user?.name || "",
        userEmail: mov.user?.email || "",
      })),
      balance,
      income,
      expense,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("[Reports] Error:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: "Token inválido o expirado" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Error al generar el reporte" },
      { status: 500 }
    );
  }
}