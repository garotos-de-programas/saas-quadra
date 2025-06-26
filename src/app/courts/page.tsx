"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutGrid,
  CalendarCheck2,
  Users2,
  BarChart2,
  Settings2,
  SquareStack,
  UserCircle,
  Plus,
  Pencil,
  Trash2,
  X,
  Layers,
  DollarSign,
} from "lucide-react";
import AppLayout from "../components/AppLayout";

interface Court {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  pricePerHour: number;
  description: string;
  isActive: boolean;
}

function maskCep(value: string) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{3})\d+?$/, "$1");
}

function maskPhone(value: string) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1");
}

export default function CourtsPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [formData, setFormData] = useState<Court>({
    id: "",
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    pricePerHour: 0,
    description: "",
    isActive: true,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [detailCourt, setDetailCourt] = useState<Court | null>(null);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = "Nome é obrigatório.";
    if (!formData.address.trim()) newErrors.address = "Endereço é obrigatório.";
    if (!formData.city.trim()) newErrors.city = "Cidade é obrigatória.";
    if (!formData.state.trim()) newErrors.state = "Estado é obrigatório.";
    if (!/^\d{5}-\d{3}$/.test(formData.zipCode)) newErrors.zipCode = "CEP inválido.";
    if (!/^\(\d{2}\) \d{5}-\d{4}$/.test(formData.phone)) newErrors.phone = "Telefone inválido.";
    if (!formData.pricePerHour || formData.pricePerHour <= 0) newErrors.pricePerHour = "Preço deve ser maior que zero.";
    return newErrors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "zipCode") {
      setFormData((prev) => ({ ...prev, zipCode: maskCep(value) }));
    } else if (name === "phone") {
      setFormData((prev) => ({ ...prev, phone: maskPhone(value) }));
    } else if (name === "pricePerHour") {
      setFormData((prev) => ({ ...prev, pricePerHour: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    if (editingCourt) {
      setCourts((prev) =>
        prev.map((court) => (court.id === editingCourt.id ? { ...formData } : court))
      );
    } else {
      setCourts((prev) => [...prev, { ...formData, id: Date.now().toString() }]);
    }
    handleCloseModal();
  };

  const handleEdit = (court: Court) => {
    setEditingCourt(court);
    setFormData(court);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta quadra?")) {
      setCourts((prev) => prev.filter((court) => court.id !== id));
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCourt(null);
    setFormData({
      id: "",
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      pricePerHour: 0,
      description: "",
      isActive: true,
    });
  };

  // Fecha o modal ao pressionar ESC
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (isModalOpen) handleCloseModal();
        if (detailCourt) setDetailCourt(null);
      }
    }
    if (isModalOpen || detailCourt) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isModalOpen, detailCourt]);

  return (
    <AppLayout>
      <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 justify-between">
        <h1 className="text-2xl font-bold text-[#2d3748]">Quadras</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="group flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-md hover:from-blue-700 hover:to-blue-600 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
          aria-label="Criar nova quadra"
        >
          <span className="flex items-center justify-center">
            <Plus size={20} className="mr-1 group-hover:rotate-90 transition-transform duration-300" />
          </span>
          Nova Quadra
        </button>
      </header>
      {/* Courts List */}
      <section className="flex-1 p-8">
        <div className="bg-white rounded-xl shadow border border-gray-100 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Endereço</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Cidade</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Preço/Hora</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {courts.map((court) => (
                <tr key={court.id} className="cursor-pointer hover:bg-gray-50 transition" onClick={() => setDetailCourt(court)}>
                  <td className="px-6 py-4 whitespace-nowrap text-[#2d3748]">{court.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-[#2d3748]">{court.address}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-[#2d3748]">{court.city}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-[#2d3748]">
                    R$ {court.pricePerHour.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        court.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {court.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(court)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Editar"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(court.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay com blur e transição suave */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity animate-fade-in" aria-hidden="true" />
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg mx-4 animate-fade-in-up border border-gray-100 flex flex-col">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
              aria-label="Fechar modal"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-extrabold text-[#2563eb] mb-8 text-center tracking-tight">
              {editingCourt ? "Editar Quadra" : "Nova Quadra"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-7">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Nome da Quadra
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition text-gray-800 bg-gray-50"
                    placeholder="Ex: Quadra Society 1"
                    required
                  />
                  {errors.name && <span className="text-xs text-red-600 mt-1 block">{errors.name}</span>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Preço por Hora (R$)
                  </label>
                  <input
                    type="number"
                    name="pricePerHour"
                    value={formData.pricePerHour}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition text-gray-800 bg-gray-50"
                    min="0"
                    step="0.01"
                    placeholder="Ex: 120.00"
                    required
                  />
                  {errors.pricePerHour && <span className="text-xs text-red-600 mt-1 block">{errors.pricePerHour}</span>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Endereço
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition text-gray-800 bg-gray-50"
                    placeholder="Rua, número, complemento"
                    required
                  />
                  {errors.address && <span className="text-xs text-red-600 mt-1 block">{errors.address}</span>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition text-gray-800 bg-gray-50"
                    placeholder="Ex: São Paulo"
                    required
                  />
                  {errors.city && <span className="text-xs text-red-600 mt-1 block">{errors.city}</span>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Estado
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition text-gray-800 bg-gray-50"
                    placeholder="Ex: SP"
                    required
                  />
                  {errors.state && <span className="text-xs text-red-600 mt-1 block">{errors.state}</span>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    CEP
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition text-gray-800 bg-gray-50"
                    placeholder="Ex: 00000-000"
                    required
                  />
                  {errors.zipCode && <span className="text-xs text-red-600 mt-1 block">{errors.zipCode}</span>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition text-gray-800 bg-gray-50"
                    placeholder="(11) 99999-9999"
                    required
                  />
                  {errors.phone && <span className="text-xs text-red-600 mt-1 block">{errors.phone}</span>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition text-gray-800 bg-gray-50 resize-none"
                    placeholder="Informações adicionais sobre a quadra"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="peer sr-only"
                  id="isActive"
                />
                <label htmlFor="isActive" className="flex items-center gap-2 cursor-pointer select-none">
                  <span
                    className={
                      `w-10 h-6 flex items-center bg-gray-200 rounded-full p-1 duration-300 ease-in-out
                      ${formData.isActive ? 'bg-green-400' : 'bg-gray-300'}`
                    }
                  >
                    <span
                      className={
                        `bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out
                        ${formData.isActive ? 'translate-x-4' : ''}`
                      }
                    />
                  </span>
                  <span className={`text-sm font-semibold ${formData.isActive ? 'text-green-700' : 'text-gray-400'}`}> {formData.isActive ? 'Ativo' : 'Inativo'} </span>
                </label>
                <span className="text-xs text-gray-500 ml-2">Marque para disponibilizar a quadra para reservas.</span>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-100 transition text-base"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-7 py-2 rounded-lg bg-[#2563eb] text-white font-bold shadow hover:bg-[#1746a2] transition text-base"
                >
                  {editingCourt ? "Salvar Alterações" : "Criar Quadra"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalhes da Quadra */}
      {detailCourt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity animate-fade-in" aria-hidden="true" />
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4 animate-fade-in-up border border-gray-100 flex flex-col">
            <button
              onClick={() => setDetailCourt(null)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
              aria-label="Fechar detalhes"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-extrabold text-[#2563eb] mb-6 text-center tracking-tight">Detalhes da Quadra</h2>
            <div className="space-y-3 text-base text-gray-700">
              <div><span className="font-semibold">Nome:</span> {detailCourt.name}</div>
              <div><span className="font-semibold">Endereço:</span> {detailCourt.address}</div>
              <div><span className="font-semibold">Cidade:</span> {detailCourt.city}</div>
              <div><span className="font-semibold">Estado:</span> {detailCourt.state}</div>
              <div><span className="font-semibold">CEP:</span> {detailCourt.zipCode}</div>
              <div><span className="font-semibold">Telefone:</span> {detailCourt.phone}</div>
              <div><span className="font-semibold">Preço por Hora:</span> R$ {detailCourt.pricePerHour.toFixed(2)}</div>
              <div><span className="font-semibold">Status:</span> <span className={`px-3 py-1 rounded-full text-xs font-semibold ${detailCourt.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{detailCourt.isActive ? "Ativo" : "Inativo"}</span></div>
              {detailCourt.description && (
                <div><span className="font-semibold">Descrição:</span> {detailCourt.description}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
} 