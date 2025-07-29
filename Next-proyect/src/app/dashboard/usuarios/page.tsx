'use client'

import { useEffect, useState } from 'react';
import { User } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';


export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState('');

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('/api/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw ('Error al obtener usuarios');

      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditName(user.name);
    setEditPhone(user.phone ?? '');
    setEditRole(user.role);
  };

  const handleSave = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem('token');
      console.log('💾 Guardando cambios con token:', token);

      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editName, phone: editPhone, role: editRole }),
      });

      if (!res.ok) {
        throw new Error('Error al actualizar usuario');
      }

      await fetchUsers();
      setSelectedUser(null);
    } catch (err) {
      console.error('Error al guardar:', err);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Usuarios</h2>
      <p className="text-muted-foreground">
        Gestión de usuarios registrados en la plataforma.
      </p>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefono</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Registrado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === "ADMIN" ? "default" : "secondary"
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(user)}
                          >
                            Editar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Usuario</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="name">Nombre</Label>
                              <Input
                                id="name"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="phone">Teléfono</Label>
                              <Input
                                id="phone"
                                value={editPhone}
                                onChange={(e) => setEditPhone(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="role">Rol</Label>
                              <Select
                                value={editRole}
                                onValueChange={setEditRole}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona un rol" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                                  <SelectItem value="USER">USER</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DialogFooter className="mt-4">
                            <Button onClick={handleSave}>Guardar</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
