"use client";

import React from "react";
import { CreditCard, Trash2, Edit } from "lucide-react";

interface CreditCardDetailsProps {
  cardData: {
    cardNumber: string;
    cardName: string;
    expiryDate: string;
    brand: string;
  };
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function CreditCardDetails({
  cardData,
  onEdit,
  onDelete,
  onClose,
}: CreditCardDetailsProps) {
  // Função para mascarar o número do cartão
  const maskCardNumber = (number: string) => {
    const lastFour = number.slice(-4);
    return `•••• •••• •••• ${lastFour}`;
  };

  // Função para obter a cor do cartão baseado na bandeira
  const getCardColor = (brand: string) => {
    // Para um visual minimalista, vamos usar um fundo branco com borda sutil
    return "bg-white border border-gray-200";
  };

  return (
    <div className="bg-white rounded-lg p-6 w-full max-w-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Detalhes do Cartão
      </h3>
      <div className="space-y-4">
        <div
          className={`${getCardColor(
            cardData.brand
          )} rounded-xl p-6 text-gray-900 shadow-md`}
        >
          <div className="flex justify-between items-start mb-8">
            <CreditCard size={32} className="text-blue-600" />
            <span className="text-sm font-semibold text-gray-700">{cardData.brand}</span>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm opacity-80">Número do Cartão</p>
              <p className="text-xl font-medium tracking-wider">
                {maskCardNumber(cardData.cardNumber)}
              </p>
            </div>
            <div className="flex justify-between">
              <div>
                <p className="text-sm opacity-80">Titular</p>
                <p className="font-medium">{cardData.cardName}</p>
              </div>
              <div>
                <p className="text-sm opacity-80">Expira em</p>
                <p className="font-medium">{cardData.expiryDate}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onDelete}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 size={20} />
            Excluir
          </button>
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <Edit size={20} />
            Editar
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8]"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
} 