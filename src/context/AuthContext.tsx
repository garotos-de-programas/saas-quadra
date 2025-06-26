'use client';

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";

interface User {
  id: number;
  name: string;
  email: string;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Rotas que não precisam de autenticação
const publicRoutes = ['/login', '/register'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") {
      setLoading(true);
      return;
    }

    if (status === "authenticated" && session?.user) {
      const userData = {
        id: session.user.id,
        name: session.user.name || "",
        email: session.user.email || "",
        image: session.user.image || "",
      };
      
      setUser(userData);
      setLoading(false);

      // Redireciona para o dashboard se estiver em uma rota pública e autenticado
      if (publicRoutes.includes(pathname)) {
        router.push("/dashboard");
      }
    } else if (status === "unauthenticated") {
      setUser(null);
      setLoading(false);
      
      // Redireciona para login se estiver em uma rota protegida e não autenticado
      // Não redireciona da rota raiz, pois ela faz o redirecionamento manualmente
      if (!publicRoutes.includes(pathname) && pathname !== '/') {
        router.push("/login");
      }
    }
  }, [session, status, pathname, router]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return false;
      }

      if (result?.ok) {
        router.push("/dashboard");
        return true;
      }

      setLoading(false);
      return false;
    } catch (err: any) {
      console.error("Erro no login:", err);
      setError(err.message || "Erro ao fazer login");
      setLoading(false);
      return false;
    }
  };

  const loginWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (err: any) {
      console.error("Erro no login com Google:", err);
      setError("Erro ao fazer login com Google");
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      setLoading(true);
      await signOut({ callbackUrl: "/login" });
      setUser(null);
    } catch (err: any) {
      console.error("Erro no logout:", err);
      setError("Erro ao fazer logout");
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      loginWithGoogle, 
      logout, 
      error, 
      clearError 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
} 