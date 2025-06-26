"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, loginWithGoogle, loading, error, clearError } = useAuth();

  useEffect(() => {
    // Limpar erros ao montar o componente
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      // Mostrar mensagem de sucesso temporariamente
      setTimeout(() => {
        clearError();
      }, 5000);
    }
  }, [searchParams, clearError]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    // Validação melhorada
    if (!email || !password) {
      return;
    }

    if (!validateEmail(email)) {
      return;
    }

    await login(email, password);
  };

  const handleGoogleLogin = async () => {
    try {
      clearError();
      await loginWithGoogle();
    } catch (err) {
      console.error("Erro no login com Google:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#e5e7eb] p-8">
        <h2 className="text-[#121416] tracking-light text-[28px] font-bold leading-tight text-center pb-3 pt-2">Bem-vindo de volta</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}
        
        {searchParams.get("registered") === "true" && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm text-center">Cadastro realizado com sucesso! Faça login para continuar.</p>
          </div>
        )}
        
        <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-[#121416] text-base font-medium leading-normal pb-2">Email</label>
            <input
              placeholder="Digite seu email"
              className="form-input w-full rounded-xl text-[#121416] border border-[#dde0e3] bg-white h-14 placeholder:text-[#6a7281] p-[15px] text-base font-normal focus:border-[#6d91ce] focus:ring-2 focus:ring-[#6d91ce]/20 transition"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-[#121416] text-base font-medium leading-normal pb-2">Senha</label>
            <div className="relative">
              <input
                placeholder="Digite sua senha"
                className="form-input w-full rounded-xl text-[#121416] border border-[#dde0e3] bg-white h-14 placeholder:text-[#6a7281] p-[15px] text-base font-normal focus:border-[#6d91ce] focus:ring-2 focus:ring-[#6d91ce]/20 transition pr-12"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button
            className="w-full h-12 rounded-full bg-[#6d91ce] text-white text-base font-bold tracking-wide shadow hover:bg-[#5073b8] transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-[#e5e7eb]" />
          <span className="mx-4 text-[#6a7281] text-sm">Ou continue com</span>
          <div className="flex-grow h-px bg-[#e5e7eb]" />
        </div>
        
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 h-12 rounded-full bg-[#f1f2f4] text-[#121416] text-base font-bold border border-[#e5e7eb] hover:bg-[#e5e7eb] transition-colors mb-2"
          type="button"
          disabled={loading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
            <path d="M224,128a96,96,0,1,1-21.95-61.09,8,8,0,1,1-12.33,10.18A80,80,0,1,0,207.6,136H128a8,8,0,0,1,0-16h88A8,8,0,0,1,224,128Z"></path>
          </svg>
          Continuar com Google
        </button>
        
        <div className="text-center mt-4">
          <a href="#" className="text-[#6a7281] text-sm underline hover:text-[#6d91ce] transition-colors">Esqueceu sua senha?</a>
        </div>
        
        <div className="text-center mt-4">
          <span className="text-[#6a7281] text-sm">Não tem uma conta? </span>
          <a href="/register" className="text-[#6d91ce] text-sm underline hover:text-[#5073b8] transition-colors">Cadastre-se</a>
        </div>
      </div>
    </div>
  );
} 