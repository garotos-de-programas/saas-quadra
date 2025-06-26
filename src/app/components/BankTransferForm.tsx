"use client";

import React, { useState } from "react";
import { Banknote } from "lucide-react";

interface BankTransferFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function BankTransferForm({ onSubmit, onCancel }: BankTransferFormProps) {
  const [formData, setFormData] = useState({
    bank: "",
    agency: "",
    account: "",
    accountType: "checking",
    accountHolder: "",
    document: "",
  });

  const [errors, setErrors] = useState({
    bank: "",
    agency: "",
    account: "",
    accountType: "",
    accountHolder: "",
    document: "",
  });

  // Função para formatar o número da agência
  const formatAgency = (value: string) => {
    return value.replace(/\D/g, "").slice(0, 4);
  };

  // Função para formatar o número da conta
  const formatAccount = (value: string) => {
    const v = value.replace(/\D/g, "");
    if (v.length > 1) {
      return `${v.slice(0, -1)}-${v.slice(-1)}`;
    }
    return v;
  };

  // Função para formatar o CPF/CNPJ
  const formatDocument = (value: string) => {
    const v = value.replace(/\D/g, "");
    if (v.length <= 11) {
      return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else {
      return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    }
  };

  // Função para validar o formulário
  const validateForm = () => {
    const newErrors = {
      bank: "",
      agency: "",
      account: "",
      accountType: "",
      accountHolder: "",
      document: "",
    };

    if (!formData.bank) {
      newErrors.bank = "Banco é obrigatório";
    }

    if (!formData.agency || formData.agency.length < 4) {
      newErrors.agency = "Agência inválida";
    }

    if (!formData.account || formData.account.length < 5) {
      newErrors.account = "Conta inválida";
    }

    if (!formData.accountType) {
      newErrors.accountType = "Tipo de conta é obrigatório";
    }

    if (!formData.accountHolder) {
      newErrors.accountHolder = "Titular é obrigatório";
    }

    if (!formData.document) {
      newErrors.document = "CPF/CNPJ é obrigatório";
    } else {
      const doc = formData.document.replace(/\D/g, "");
      if (doc.length !== 11 && doc.length !== 14) {
        newErrors.document = "CPF/CNPJ inválido";
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Banco
        </label>
        <select
          value={formData.bank}
          onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
          className={`w-full px-3 py-2 border ${
            errors.bank ? "border-red-500" : "border-gray-300"
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent`}
        >
          <option value="">Selecione o banco</option>
          <option value="001">Banco do Brasil</option>
          <option value="104">Caixa Econômica Federal</option>
          <option value="033">Santander</option>
          <option value="341">Itaú</option>
          <option value="237">Bradesco</option>
          <option value="756">Sicoob</option>
          <option value="748">Sicredi</option>
        </select>
        {errors.bank && (
          <p className="mt-1 text-sm text-red-500">{errors.bank}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Agência
          </label>
          <input
            type="text"
            value={formData.agency}
            onChange={(e) =>
              setFormData({ ...formData, agency: formatAgency(e.target.value) })
            }
            maxLength={4}
            placeholder="0000"
            className={`w-full px-3 py-2 border ${
              errors.agency ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent`}
          />
          {errors.agency && (
            <p className="mt-1 text-sm text-red-500">{errors.agency}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Conta
          </label>
          <input
            type="text"
            value={formData.account}
            onChange={(e) =>
              setFormData({ ...formData, account: formatAccount(e.target.value) })
            }
            maxLength={7}
            placeholder="00000-0"
            className={`w-full px-3 py-2 border ${
              errors.account ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent`}
          />
          {errors.account && (
            <p className="mt-1 text-sm text-red-500">{errors.account}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de Conta
        </label>
        <select
          value={formData.accountType}
          onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
          className={`w-full px-3 py-2 border ${
            errors.accountType ? "border-red-500" : "border-gray-300"
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent`}
        >
          <option value="checking">Conta Corrente</option>
          <option value="savings">Conta Poupança</option>
        </select>
        {errors.accountType && (
          <p className="mt-1 text-sm text-red-500">{errors.accountType}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Titular da Conta
        </label>
        <input
          type="text"
          value={formData.accountHolder}
          onChange={(e) =>
            setFormData({ ...formData, accountHolder: e.target.value.toUpperCase() })
          }
          placeholder="NOME DO TITULAR"
          className={`w-full px-3 py-2 border ${
            errors.accountHolder ? "border-red-500" : "border-gray-300"
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent`}
        />
        {errors.accountHolder && (
          <p className="mt-1 text-sm text-red-500">{errors.accountHolder}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          CPF/CNPJ do Titular
        </label>
        <input
          type="text"
          value={formData.document}
          onChange={(e) =>
            setFormData({ ...formData, document: formatDocument(e.target.value) })
          }
          placeholder="000.000.000-00 ou 00.000.000/0000-00"
          className={`w-full px-3 py-2 border ${
            errors.document ? "border-red-500" : "border-gray-300"
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent`}
        />
        {errors.document && (
          <p className="mt-1 text-sm text-red-500">{errors.document}</p>
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
          Adicionar Conta
        </button>
      </div>
    </form>
  );
} 