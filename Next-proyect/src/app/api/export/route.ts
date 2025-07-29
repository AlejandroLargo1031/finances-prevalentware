import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = cookies();
    const headersList = headers();
    
    const tokenFromCookie = (await cookieStore).get('auth-token')?.value;
    const authHeader = (await headersList).get('authorization');
    const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const token = tokenFromCookie || tokenFromHeader;

    if (!token) {
      console.error('[Export] Error 401: Token no encontrado');
      return new NextResponse(
        JSON.stringify({ error: 'Acceso no autorizado. Token no encontrado' }),
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.AUTH_SECRET!) as { 
      userId: string;
      role: string;
    };
    const isAdmin = decoded.role === 'ADMIN';

    console.log(`Usuario autenticado ${decoded.userId} (${isAdmin ? 'ADMIN' : 'USER'})`);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { name: true, email: true, role: true }
    });

    if (!user) {
      console.error('[Export] Usuario no encontrado');
      return new NextResponse(
        JSON.stringify({ error: 'Usuario no encontrado' }),
        { status: 404 }
      );
    }

    const whereClause = isAdmin ? {} : { userId: decoded.userId };
    const movements = await prisma.movement.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
    });

    const income = movements
      .filter(m => m.type === 'INCOME')
      .reduce((sum, m) => sum + m.amount, 0);
      
    const expense = movements
      .filter(m => m.type === 'EXPENSE')
      .reduce((sum, m) => sum + m.amount, 0);
      
    const balance = income - expense;

    console.log(`[Export] Métricas calculadas - Ingresos: $${income}, Egresos: $${expense}, Balance: $${balance}`);

    const csvContent = [
      ['REPORTE FINANCIERO'],
      [`Generado el: ${new Date().toLocaleDateString()}`],
      [],
      ['INFORMACIÓN DEL USUARIO'],
      ['Nombre', 'Email', 'Rol'],
      [user.name, user.email, user.role],
      [],
      
      // Resumen financiero
      ['RESUMEN FINANCIERO'],
      ['Concepto', 'Monto'],
      ['Ingresos totales', `$${income.toFixed(2)}`],
      ['Egresos totales', `$${expense.toFixed(2)}`],
      ['Balance', `$${balance.toFixed(2)}`],
      [],
      
      ['DETALLE DE MOVIMIENTOS'],
      ['Fecha', 'Concepto', 'Monto', 'Tipo'],
      ...movements.map(mov => [
        new Date(mov.date).toLocaleDateString(),
        mov.concept,
        mov.amount.toFixed(2),
        mov.type
      ])
    ].map(row => row.join(',')).join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename=reporte-${user.name}-${new Date().toISOString().split('T')[0]}.csv`,
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('[Export] Error:', error);

    if (error instanceof jwt.JsonWebTokenError) {
      return new NextResponse(
        JSON.stringify({ error: 'Token inválido o expirado' }),
        { status: 401 }
      );
    }

    return new NextResponse(
      JSON.stringify({ error: 'Error al generar el reporte' }),
      { status: 500 }
    );
  }
}