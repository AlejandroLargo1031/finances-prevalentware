'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type FormData = z.infer<typeof formSchema>;

export default function EmailLoginForm() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem('auth-token', result.token);
        router.push('/dashboard');
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 mt-10">
      <div className="space-y-2 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          Ingresa tus credenciales para acceder a tu cuenta
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Correo electrónico</label>
          <Input
            type="email"
            placeholder="tu@email.com"
            disabled={isLoading}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Contraseña</label>
          <Input
            type="password"
            placeholder="••••••••"
            disabled={isLoading}
            {...register('password')}
          />
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </Button>
      </form>

      <div className="mt-4 text-center text-sm">
        <Link
          href="/auth/register"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          ¿No tienes cuenta? Regístrate
        </Link>
      </div>
    </div>
  );
}
