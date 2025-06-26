"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    setTouched({ ...touched, [e.target.name]: true });
    validateField(e.target.name as keyof typeof form, form[e.target.name as keyof typeof form]);
  }

  function validateField(field: keyof typeof form, value: string) {
    let error = "";
    if (field === "name") {
      if (!value.trim()) error = "Nome é obrigatório.";
    }
    if (field === "email") {
      if (!value.trim()) error = "Email é obrigatório.";
      else if (!validateEmail(value)) error = "Email inválido.";
    }
    if (field === "password") {
      if (!value) error = "Senha é obrigatória.";
      else if (value.length < 8) error = "Senha deve ter pelo menos 8 caracteres.";
    }
    if (field === "confirmPassword") {
      if (!value) error = "Confirmação de senha é obrigatória.";
      else if (value !== form.password) error = "As senhas não coincidem.";
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
    return error;
  }

  function validateAll() {
    const newErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    };
    newErrors.name = validateField("name", form.name);
    newErrors.email = validateField("email", form.email);
    newErrors.password = validateField("password", form.password);
    newErrors.confirmPassword = validateField("confirmPassword", form.confirmPassword);
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    
    if (validateAll()) {
      setSubmitting(true);
      try {
        await axios.post("/api/auth/register", {
          name: form.name,
          email: form.email,
          password: form.password,
        });
        
        // Redirecionar para a página de login após o cadastro bem-sucedido
        router.push("/login?registered=true");
      } catch (err: any) {
        console.error("Erro ao cadastrar:", err);
        setError(err.response?.data?.message || "Erro ao realizar cadastro. Tente novamente.");
      } finally {
        setSubmitting(false);
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#e5e7eb] p-8">
        <h2 className="text-[#121416] tracking-light text-[28px] font-bold leading-tight text-center pb-3 pt-2">Crie sua conta</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form className="space-y-4 mt-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="block text-[#121416] text-base font-medium leading-normal pb-2">Nome</label>
            <input
              name="name"
              placeholder="Digite seu nome"
              className={`form-input w-full rounded-xl text-[#121416] border bg-white h-14 placeholder:text-[#6a7281] p-[15px] text-base font-normal focus:border-[#6d91ce] focus:ring-2 focus:ring-[#6d91ce]/20 transition ${errors.name && touched.name ? 'border-red-400' : 'border-[#dde0e3]'}`}
              type="text"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="name"
            />
            {errors.name && touched.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>
          <div>
            <label className="block text-[#121416] text-base font-medium leading-normal pb-2">Email</label>
            <input
              name="email"
              placeholder="Digite seu email"
              className={`form-input w-full rounded-xl text-[#121416] border bg-white h-14 placeholder:text-[#6a7281] p-[15px] text-base font-normal focus:border-[#6d91ce] focus:ring-2 focus:ring-[#6d91ce]/20 transition ${errors.email && touched.email ? 'border-red-400' : 'border-[#dde0e3]'}`}
              type="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="email"
            />
            {errors.email && touched.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <label className="block text-[#121416] text-base font-medium leading-normal pb-2">Senha</label>
            <div className="relative">
              <input
                name="password"
                placeholder="Digite sua senha"
                className={`form-input w-full rounded-xl text-[#121416] border bg-white h-14 placeholder:text-[#6a7281] p-[15px] text-base font-normal focus:border-[#6d91ce] focus:ring-2 focus:ring-[#6d91ce]/20 transition ${errors.password && touched.password ? 'border-red-400' : 'border-[#dde0e3]'} pr-12`}
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && touched.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>
          <div>
            <label className="block text-[#121416] text-base font-medium leading-normal pb-2">Confirme a senha</label>
            <div className="relative">
              <input
                name="confirmPassword"
                placeholder="Confirme sua senha"
                className={`form-input w-full rounded-xl text-[#121416] border bg-white h-14 placeholder:text-[#6a7281] p-[15px] text-base font-normal focus:border-[#6d91ce] focus:ring-2 focus:ring-[#6d91ce]/20 transition ${errors.confirmPassword && touched.confirmPassword ? 'border-red-400' : 'border-[#dde0e3]'} pr-12`}
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && touched.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>
          <button
            className="w-full h-12 rounded-full bg-[#6d91ce] text-white text-base font-bold tracking-wide shadow hover:bg-[#5073b8] transition-colors mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Cadastrando...' : 'Criar conta'}
          </button>
        </form>
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-[#e5e7eb]" />
          <span className="mx-4 text-[#6a7281] text-sm">Ou cadastre-se com</span>
          <div className="flex-grow h-px bg-[#e5e7eb]" />
        </div>
        <button
          className="w-full flex items-center justify-center gap-2 h-12 rounded-full bg-[#f1f2f4] text-[#121416] text-base font-bold border border-[#e5e7eb] hover:bg-[#e5e7eb] transition-colors mb-2"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
            <path d="M224,128a96,96,0,1,1-21.95-61.09,8,8,0,1,1-12.33,10.18A80,80,0,1,0,207.6,136H128a8,8,0,0,1,0-16h88A8,8,0,0,1,224,128Z"></path>
          </svg>
          Cadastre-se com Google
        </button>
        <div className="text-center mt-4">
          <a href="/login" className="text-[#6a7281] text-sm underline hover:text-[#6d91ce] transition-colors">Já tem uma conta? Faça login</a>
        </div>
      </div>
    </div>
  );
} 