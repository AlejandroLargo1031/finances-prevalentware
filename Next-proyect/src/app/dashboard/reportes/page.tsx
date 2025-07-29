'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner'; // o tu librería de toasts preferida

const COLORS = {
  INCOME: '#4CAF50',  // Verde para ingresos
  EXPENSE: '#F44336', // Rojo para egresos
};

type Movement = {
  id: string;
  concept: string;
  amount: number;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  userId?: string;
  userName?: string;
  userEmail?: string;
};

export default function ReportesPage() {
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [movements, setMovements] = useState<Movement[]>([]);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch("/api/reports", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al obtener reportes");
      }

      const data = await res.json();
      setMovements(data.movements || []);
      setBalance(data.balance || 0);
      setIncome(data.income || 0);
      setExpense(data.expense || 0);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      setDownloading(true);
      const token = localStorage.getItem("token");

      const res = await fetch("/api/export", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Error al generar CSV");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte-financiero-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      a.remove();

      toast.success("Reporte descargado exitosamente");
    } catch (error) {
      console.error("Error al descargar:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al generar el reporte"
      );
    } finally {
      setDownloading(false);
    }
  };

  // Procesar datos para gráficos
  const processChartData = () => {
    const dailyData = movements.reduce(
      (
        acc: Record<string, { date: string; INCOME: number; EXPENSE: number }>,
        movement
      ) => {
        const date = new Date(movement.date).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = { date, INCOME: 0, EXPENSE: 0 };
        }
        acc[date][movement.type] += movement.amount;
        return acc;
      },
      {}
    );

    return {
      daily: Object.values(dailyData),
      types: [
        { name: "Ingresos", value: income, type: "INCOME" },
        { name: "Egresos", value: expense, type: "EXPENSE" },
      ],
    };
  };

  const chartData = processChartData();

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="h-[400px]">
                <Skeleton className="h-full w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Reportes Financieros</h1>
          <p className="text-muted-foreground">
            Visualización y análisis de movimientos
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchReportData}
            disabled={loading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
          <Button onClick={handleDownloadCSV} disabled={downloading}>
            <Download className="mr-2 h-4 w-4" />
            {downloading ? "Generando..." : "Exportar"}
          </Button>
        </div>
      </div>

      {/* Resumen Financiero */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Saldo Actual"
          value={balance}
          isPositive={balance >= 0}
        />
        <MetricCard title="Total Ingresos" value={income} isPositive={true} />
        <MetricCard title="Total Egresos" value={expense} isPositive={false} />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Movimientos por Día">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData.daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip
                formatter={(value) => [`$${value}`, "Monto"]}
                labelFormatter={(date) => `Fecha: ${date}`}
              />
              <Legend />
              <Bar
                dataKey="INCOME"
                name="Ingresos"
                fill={COLORS.INCOME}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="EXPENSE"
                name="Egresos"
                fill={COLORS.EXPENSE}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Distribución por Tipo">
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData.types}
                cx="50%"
                cy="50%"
                outerRadius={120}
                innerRadius={60}
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) =>
                  `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`
                }
                labelLine={false}
              >
                {chartData.types.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.type as keyof typeof COLORS]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`$${value}`, "Monto"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

// Componente auxiliar para tarjetas de métricas
function MetricCard({ title, value, isPositive }: { title: string; value: number; isPositive: boolean }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${
          isPositive ? 'text-green-500' : 'text-red-500'
        }`}>
          ${value.toFixed(2)}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente auxiliar para tarjetas de gráficos
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}