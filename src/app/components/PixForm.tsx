"use client";

import React, { useState } from "react";
import { Wallet, Copy, Check } from "lucide-react";

interface PixFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function PixForm({ onSubmit, onCancel }: PixFormProps) {
  const [formData, setFormData] = useState({
    pixType: "email",
    pixKey: "",
  });

  const [errors, setErrors] = useState({
    pixType: "",
    pixKey: "",
  });

  const [copied, setCopied] = useState(false);

  // Função para validar o formulário
  const validateForm = () => {
    const newErrors = {
      pixType: "",
      pixKey: "",
    };

    if (!formData.pixType) {
      newErrors.pixType = "Tipo de chave PIX é obrigatório";
    }

    if (!formData.pixKey) {
      newErrors.pixKey = "Chave PIX é obrigatória";
    } else {
      switch (formData.pixType) {
        case "email":
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.pixKey)) {
            newErrors.pixKey = "E-mail inválido";
          }
          break;
        case "cpf":
          if (!/^\d{11}$/.test(formData.pixKey.replace(/\D/g, ""))) {
            newErrors.pixKey = "CPF inválido";
          }
          break;
        case "phone":
          if (!/^\d{11}$/.test(formData.pixKey.replace(/\D/g, ""))) {
            newErrors.pixKey = "Telefone inválido";
          }
          break;
        case "random":
          if (formData.pixKey.length !== 32) {
            newErrors.pixKey = "Chave aleatória inválida";
          }
          break;
      }
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  // Função para lidar com o envio do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Função para copiar a chave PIX
  const handleCopyKey = () => {
    navigator.clipboard.writeText(formData.pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Função para formatar a chave PIX baseado no tipo
  const formatPixKey = (value: string, type: string) => {
    switch (type) {
      case "cpf":
        return value.replace(/\D/g, "").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
      case "phone":
        return value.replace(/\D/g, "").replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
      default:
        return value;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de Chave PIX
        </label>
        <select
          value={formData.pixType}
          onChange={(e) => {
            setFormData({ ...formData, pixType: e.target.value, pixKey: "" });
          }}
          className={`w-full px-3 py-2 border ${
            errors.pixType ? "border-red-500" : "border-gray-300"
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent`}
        >
          <option value="email">E-mail</option>
          <option value="cpf">CPF</option>
          <option value="phone">Telefone</option>
          <option value="random">Chave Aleatória</option>
        </select>
        {errors.pixType && (
          <p className="mt-1 text-sm text-red-500">{errors.pixType}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Chave PIX
        </label>
        <div className="relative">
          <input
            type={formData.pixType === "email" ? "email" : "text"}
            value={formData.pixKey}
            onChange={(e) =>
              setFormData({
                ...formData,
                pixKey: formatPixKey(e.target.value, formData.pixType),
              })
            }
            placeholder={
              formData.pixType === "email"
                ? "seu@email.com"
                : formData.pixType === "cpf"
                ? "000.000.000-00"
                : formData.pixType === "phone"
                ? "(00) 00000-0000"
                : "Chave aleatória"
            }
            className={`w-full px-3 py-2 border ${
              errors.pixKey ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent`}
          />
          <button
            type="button"
            onClick={handleCopyKey}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-[#2563eb]"
          >
            {copied ? <Check size={20} /> : <Copy size={20} />}
          </button>
        </div>
        {errors.pixKey && (
          <p className="mt-1 text-sm text-red-500">{errors.pixKey}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8]"
        >
          Adicionar Chave PIX
        </button>
      </div>
    </form>
  );
} 