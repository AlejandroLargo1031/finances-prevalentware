// src/app/api/users/[id]/route.ts

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> } 
)  {
  try {
    const { id } = await params;
    const body = await request.json();

    const { name, email, role } = body;

    const existingUser = await prisma.user.findUnique({ where: { id } });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: name ?? undefined,
        email: email ?? undefined,
        role: role ?? undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json(
      { error: "Error al actualizar el usuario" },
      { status: 500 }
    );
  }
}
