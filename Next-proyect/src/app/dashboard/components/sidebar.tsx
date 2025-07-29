import Link from "next/link";
import { Home, Users, BarChart3, HandCoins, Monitor } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="w-64 bg-gray-100 h-screen p-4 border-r flex flex-col justify-between">
      <div>
        <div className="text-2xl font-bold mb-8">Panel</div>
        <nav className="space-y-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-gray-700 hover:text-black"
          >
            <Home className="w-5 h-5" /> Inicio
          </Link>
          <Link
            href="/dashboard/finanzas"
            className="flex items-center gap-2 text-gray-700 hover:text-black"
          >
            <HandCoins className="w-5 h-5" /> Ingresos y Gastos
          </Link>
          <Link
            href="/dashboard/usuarios"
            className="flex items-center gap-2 text-gray-700 hover:text-black"
          >
            <Users className="w-5 h-5" /> Usuarios
          </Link>
          <Link
            href="/dashboard/reportes"
            className="flex items-center gap-2 text-gray-700 hover:text-black"
          >
            <BarChart3 className="w-5 h-5" /> Reportes
          </Link>
        </nav>
      </div>

      <div className="text-center mt-8">
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <Monitor className="w-4 h-4" />
          <span className="text-sm font-medium">by Alejandro Largo</span>
          <Monitor className="w-4 h-4" />
        </div>
        <p className="text-xs text-gray-500 mt-1">Fullstack Developer</p>
      </div>
    </aside>
  );
}
