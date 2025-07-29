'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Movement } from "@/types";

const formSchema = z.object({
  concept: z.string().min(3, "El concepto debe tener al menos 3 caracteres"),
  amount: z.number().min(0.01, "El monto debe ser mayor a 0"),
  date: z.date(),
  type: z.enum(["INCOME", "EXPENSE"]),
});

export default function FinancePage() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      concept: "",
      amount: 0,
      date: new Date(),
      type: "INCOME",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        
        // Obtener datos del usuario
        const userResponse = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!userResponse.ok) throw new Error('Error al obtener datos de usuario');
        
        const userData = await userResponse.json();
        setUserRole(userData.user.role);

        // Obtener movimientos
        const movementsResponse = await fetch("/api/movements", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!movementsResponse.ok) throw new Error("Error al obtener movimientos");

        const movementsData = await movementsResponse.json();
        setMovements(movementsData.movements || []);
      } catch (error) {
        console.error("Error:", error);
        if (error instanceof Error && error.message.includes('autenticación')) {
          router.push('/login'); // Redirigir a login si hay error de autenticación
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const token = localStorage.getItem("token");
      
      // Validación de seguridad en frontend
      if (userRole === 'USER') {
        throw new Error("No tienes permisos para realizar esta acción");
      }

      const response = await fetch("/api/movements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          concept: values.concept,
          amount: values.amount,
          date: values.date.toISOString(),
          type: values.type,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al crear movimiento");
      }

      setOpen(false);
      form.reset();

      // Recargar movimientos
      const res = await fetch("/api/movements", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!res.ok) throw new Error("Error al recargar movimientos");
      
      const data = await res.json();
      setMovements(data.movements || []);
    } catch (error) {
      console.error("Error:", error);
      alert(error instanceof Error ? error.message : "Error al crear movimiento");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Cargando...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión Financiera</h2>
          <p className="text-muted-foreground">
            Registro y control de ingresos y egresos
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button disabled={userRole === "USER"}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuevo Movimiento
              {userRole === "USER" && (
                <span className="ml-2 text-xs">(No autorizado)</span>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Movimiento</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Tipo</Label>
                <Select
                  onValueChange={(value) =>
                    form.setValue("type", value as "INCOME" | "EXPENSE")
                  }
                  defaultValue={form.watch("type")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INCOME">Ingreso</SelectItem>
                    <SelectItem value="EXPENSE">Egreso</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="concept">Concepto</Label>
                <Input
                  id="concept"
                  placeholder="Descripción del movimiento"
                  {...form.register("concept")}
                />
                {form.formState.errors.concept && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.concept.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="amount">Monto</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...form.register("amount", { valueAsNumber: true })}
                />
                {form.formState.errors.amount && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.amount.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="date">Fecha</Label>
                <Calendar
                  mode="single"
                  selected={form.watch("date")}
                  onSelect={(date) => date && form.setValue("date", date)}
                  className="rounded-md border"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={userRole === "USER"}
              >
                Guardar Movimiento
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Concepto</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.length > 0 ? (
              movements.map((movement) => (
                <TableRow key={movement.id || `movement-${Date.now()}`}>
                  <TableCell>{movement.concept || "Sin concepto"}</TableCell>
                  <TableCell
                    className={`text-right ${
                      movement.type === "INCOME"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {movement.type === "INCOME" ? "+" : "-"}$
                    {(movement.amount || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {new Date(movement.date || Date.now()).toLocaleDateString(
                      "es-ES",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      }
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        movement.type === "INCOME"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {movement.type === "INCOME" ? "Ingreso" : "Egreso"}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No hay movimientos registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}