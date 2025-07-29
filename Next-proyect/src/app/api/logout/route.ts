import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthAdapter } from "@/lib/auth-adapter";

export async function POST() {
  try {
    const cookieStore = cookies();
    const sessionToken = (await cookieStore).get("session-token")?.value;
    const response = NextResponse.json({ message: "Sesión cerrada correctamente" });

    // 1. Eliminar cookies del cliente
    response.cookies.set("session-token", "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    });
    
    response.cookies.set("user-role", "", {
      expires: new Date(0),
      path: "/",
    });

    if (sessionToken) {
      await AuthAdapter.deleteSession(sessionToken);
    }

    return response;

  } catch (error) {
    console.error("Error durante el logout:", error);
    return NextResponse.json(
      { message: "Error al cerrar sesión" },
      { status: 500 }
    );
  }
}