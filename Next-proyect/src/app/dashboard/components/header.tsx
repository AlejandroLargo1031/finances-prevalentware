"use client";

import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";

export function Header() {
  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <header className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <UserCircle className="h-6 w-6" />
        </Button>
      </div>
    </header>
  );
}
