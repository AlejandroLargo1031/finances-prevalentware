import { createAuthClient } from 'better-auth/client';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_BASE_URL ,
});

export const signIn = async () => {
  try {
    const data = await authClient.signIn.social({
      provider: 'github',
    });
    // Redirige o guarda token, según cómo lo tengas configurado
    console.log('Login exitoso:', data);
  } catch (err) {
    console.error('Error al iniciar sesión:', err);
  }
};
