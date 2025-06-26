import React from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LogoutButton({
  children = "Sair",
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const { logout, loading } = useAuth();

  return (
    <button
      onClick={logout}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition font-medium ${className}`}
      disabled={loading}
      type="button"
    >
      <LogOut size={18} />
      {loading ? "Saindo..." : children}
    </button>
  );
} 