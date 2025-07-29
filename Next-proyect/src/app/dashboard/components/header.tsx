"use client";

import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";

export function Header() {
  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b bg-white shadow-sm">
      <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>

      <Button variant="ghost" onClick={handleLogout} className="flex items-center gap-2">
        <UserCircle className="h-5 w-5 text-gray-700" />
        <span className="hidden sm:inline">Cerrar sesión</span>
      </Button>
    </header>
  );
}
