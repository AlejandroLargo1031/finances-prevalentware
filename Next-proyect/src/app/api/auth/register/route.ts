import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'El correo ya está registrado' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN', 
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      { 
        message: 'Usuario registrado exitosamente', 
        user: { 
          id: newUser.id, 
          email: newUser.email,
          role: newUser.role 
        } 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}