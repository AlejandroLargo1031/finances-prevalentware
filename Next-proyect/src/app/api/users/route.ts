import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return NextResponse.json(
      { error: "Error al obtener los usuarios" },
      { status: 500 }
    );
  }
}
