import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthAdapter } from "@/lib/auth-adapter";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const cookieStore = cookies();

    if (!code) throw new Error("Código de autorización faltante");

    // Verificar estado (CSRF protection)
    const savedState = (await cookieStore).get('github_oauth_state')?.value;
    if (!state || !savedState || state !== savedState) {
      throw new Error("Invalid state parameter");
    }

    // Obtener token de acceso
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { 
        Accept: "application/json", 
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`GitHub token error: ${errorText}`);
    }

    const { access_token } = await tokenResponse.json();
    
    // Obtener información del usuario
    const userResponse = await fetch("https://api.github.com/user", {
      headers: { 
        Authorization: `Bearer ${access_token}`,
        Accept: "application/json",
      },
    });

    if (!userResponse.ok) throw new Error("Failed to fetch user info");

    const githubUser = await userResponse.json();
    const githubId = String(githubUser.id);
    
    // Crear o actualizar usuario
    const user = await AuthAdapter.createOrUpdateGithubUser(
      githubId,
      githubUser.email || `${githubId}+github@users.noreply.github.com`,
      githubUser.name || githubUser.login
    );

    if (!user) throw new Error("Failed to create/update user");

    // Crear sesión
    const session = await AuthAdapter.createSession(
      user.id,
      req.headers.get('x-forwarded-for') || undefined,
      req.headers.get('user-agent') || undefined
    );

    // Configurar respuesta
    const response = NextResponse.redirect(new URL("/dashboard", req.url));
    
    // Establecer cookies
    response.cookies.set("session-token", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 604800 
    });

    response.cookies.set("user-role", user.role, {
      path: "/",
      sameSite: "lax",
      maxAge: 604800
    });

    // Limpiar cookie de estado
    response.cookies.delete("github_oauth_state");

    return response;

  } catch (error) {
    console.error("GitHub callback error:", error);
    
    const errorUrl = new URL("/auth/error", req.url);
    if (error instanceof Error) {
      errorUrl.searchParams.set("message", error.message);
    }
    
    return NextResponse.redirect(errorUrl);
  }
}