import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {  
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const token = jwt.sign(
        { 
          userId: user.id,
          role: user.role
        },
        process.env.AUTH_SECRET!,
        { expiresIn: '7d' }
      );
  
      //Crear respuesta y configurar cookies
      const response = NextResponse.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        },
        token 
      });
  
      // Establecer cookie de autenticación
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 
      });
  
      response.cookies.set('role', user.role, {
        path: '/',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7
      });
  
      return response;
  
    } catch (error) {
      console.error('Error en login:', error);
      return NextResponse.json(
        { error: 'Error interno del servidor' },
        { status: 500 }
      );
    }
  }