"use client";

import React, { useState } from "react";
import { CreditCard } from "lucide-react";

interface CreditCardFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function CreditCardForm({ onSubmit, onCancel }: CreditCardFormProps) {
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  const [errors, setErrors] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  // Função para formatar o número do cartão
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  // Função para formatar a data de expiração
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 3) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  // Função para validar o formulário
  const validateForm = () => {
    const newErrors = {
      cardNumber: "",
      cardName: "",
      expiryDate: "",
      cvv: "",
    };

    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, "").length !== 16) {
      newErrors.cardNumber = "Número do cartão inválido";
    }

    if (!formData.cardName) {
      newErrors.cardName = "Nome é obrigatório";
    }

    if (!formData.expiryDate || formData.expiryDate.length !== 5) {
      newErrors.expiryDate = "Data de expiração inválida";
    }

    if (!formData.cvv || formData.cvv.length !== 3) {
      newErrors.cvv = "CVV inválido";
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Número do Cartão
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData.cardNumber}
            onChange={(e) =>
              setFormData({ ...formData, cardNumber: formatCardNumber(e.target.value) })
            }
            maxLength={19}
            placeholder="0000 0000 0000 0000"
            className={`w-full px-4 py-2.5 border ${
              errors.cardNumber ? "border-red-500" : "border-gray-300"
            } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent`}
          />
          <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>
        {errors.cardNumber && (
          <p className="mt-1 text-sm text-red-500">{errors.cardNumber}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nome no Cartão
        </label>
        <input
          type="text"
          value={formData.cardName}
          onChange={(e) =>
            setFormData({ ...formData, cardName: e.target.value.toUpperCase() })
          }
          placeholder="NOME COMO ESTÁ NO CARTÃO"
          className={`w-full px-4 py-2.5 border ${
            errors.cardName ? "border-red-500" : "border-gray-300"
          } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent`}
        />
        {errors.cardName && (
          <p className="mt-1 text-sm text-red-500">{errors.cardName}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data de Expiração
          </label>
          <input
            type="text"
            value={formData.expiryDate}
            onChange={(e) =>
              setFormData({ ...formData, expiryDate: formatExpiryDate(e.target.value) })
            }
            maxLength={5}
            placeholder="MM/AA"
            className={`w-full px-4 py-2.5 border ${
              errors.expiryDate ? "border-red-500" : "border-gray-300"
            } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent`}
          />
          {errors.expiryDate && (
            <p className="mt-1 text-sm text-red-500">{errors.expiryDate}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CVV
          </label>
          <input
            type="text"
            value={formData.cvv}
            onChange={(e) =>
              setFormData({
                ...formData,
                cvv: e.target.value.replace(/\D/g, "").slice(0, 3),
              })
            }
            maxLength={3}
            placeholder="123"
            className={`w-full px-4 py-2.5 border ${
              errors.cvv ? "border-red-500" : "border-gray-300"
            } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent`}
          />
          {errors.cvv && (
            <p className="mt-1 text-sm text-red-500">{errors.cvv}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors font-medium"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
        >
          Adicionar Cartão
        </button>
      </div>
    </form>
  );
} 