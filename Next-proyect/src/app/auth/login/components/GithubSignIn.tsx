'use client';

import { useState } from 'react';
import { Github } from 'lucide-react';


export default function GithubLoginButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGithubLogin = async () => {
    setIsLoading(true);
    try {
      // Redirige directamente a la ruta de GitHub OAuth
      window.location.href = '/api/auth/github';
    } catch (err) {
      console.error('Error al iniciar con GitHub:', err);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleGithubLogin}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-2 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors disabled:opacity-70"
    >  <Github />
      {isLoading ? 'Procesando...' : 'Continuar con GitHub'}
    </button>
  );
}