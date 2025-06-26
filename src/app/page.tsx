"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Se estiver autenticado, redireciona para o dashboard
        router.push("/dashboard");
      } else {
        // Se não estiver autenticado, redireciona para o login
        router.push("/login");
      }
    }
  }, [user, loading, router]);

  // Mostra loading enquanto verifica a autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa]">
        <LoadingSpinner size="lg" text="Carregando..." />
      </div>
    );
  }

  // Este conteúdo não será exibido, pois o redirecionamento acontece no useEffect
  return null;
}
