'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, CalendarDays, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface UserData {
  name: string;
  email: string;
  role: string;
  joinDate?: string;
}

export default function DashboardWelcome() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('auth-token');
        const headers: HeadersInit = {};

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('/api/auth/me', {
          headers,
          credentials: 'include', 
        });

        if (!response.ok) {
          throw new Error('Error al obtener datos del usuario');
        }

        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error('Error:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-48" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <h2 className="text-xl font-semibold">No se pudo cargar la información del usuario</h2>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/auth/login')}>
              Volver a iniciar sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="items-center space-y-4">
          <h2 className="text-xl text-muted-foreground">Bienvenido</h2>
          <h1 className="text-4xl font-bold text-center">{user.name}</h1>
          <p className="text-muted-foreground">Tu panel de control personal</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-4 p-4 border rounded-lg">
              <User className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Rol</p>
                <p className="font-medium capitalize">{user.role.toLowerCase()}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 border rounded-lg">
              <Mail className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Correo</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            {user.joinDate && (
              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <CalendarDays className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Miembro desde</p>
                  <p className="font-medium">
                    {new Date(user.joinDate).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
