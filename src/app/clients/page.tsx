"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, X, Users2 } from "lucide-react";
import AppLayout from "../components/AppLayout";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";

// Interfaces para os dados (atualizadas para corresponder ao backend IClient)
interface Client {
  id: number; // Usar id numérico do MySQL/Prisma
  name: string;
  email?: string; // Opcional no backend
  phone?: string; // Opcional no backend
  address?: string; // Opcional no backend
  isActive: boolean;
  createdAt: string; // Para exibição no frontend
  updatedAt: string; // Para exibição no frontend
}

// Removidas as funções de mascaramento e validação de CEP/Telefone/Email se não forem mais necessárias para a UI.
// Mantendo as mais básicas para exemplo, mas ajuste conforme sua necessidade.

function validateEmail(email: string) {
  return email ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) : true; // Email opcional
}

export default function ClientsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [detailClient, setDetailClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<Omit<Client, "id" | "createdAt" | "updatedAt">>({
    name: "",
    email: "",
    phone: "",
    address: "",
    isActive: true,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Proteção de rota e carregamento de dados
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchClients();
    }
  }, [status, router]);

  // Função para buscar clientes da API
  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/api/clients");
      setClients(res.data);
    } catch (err: any) {
      console.error("Erro ao buscar clientes:", err);
      setError("Falha ao carregar clientes. Tente novamente.");
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = "Nome é obrigatório.";
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = "Email inválido.";
    }
    // Validações removidas para city, state, zipCode
    return newErrors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      if (editingClient) {
        const res = await axios.put(`/api/clients/${editingClient.id}`, formData);
        setClients((prev) =>
          prev.map((client) => (client.id === editingClient.id ? res.data : client))
        );
      } else {
        const res = await axios.post("/api/clients", formData);
        setClients((prev) => [...prev, res.data]);
      }
      handleCloseModal();
      fetchClients(); // Re-fetch para garantir os dados mais recentes e consistência
    } catch (err: any) {
      console.error("Erro ao salvar cliente:", err.response?.data?.message || err.message);
      setError("Falha ao salvar cliente. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
      isActive: client.isActive,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este cliente?")) {
      setError(null);
      setLoading(true);
      try {
        await axios.delete(`/api/clients/${id}`);
        setClients((prev) => prev.filter((client) => client.id !== id));
        handleCloseModal();
      } catch (err: any) {
        console.error("Erro ao excluir cliente:", err.response?.data?.message || err.message);
        setError("Falha ao excluir cliente. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      isActive: true,
    });
    setErrors({});
  };

  // Fecha os modais ao pressionar ESC
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (isModalOpen) handleCloseModal();
        if (detailClient) setDetailClient(null);
      }
    }
    if (isModalOpen || detailClient) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isModalOpen, detailClient]);

  // Renderização condicional para carregamento de autenticação
  if (status === "loading") {
    return <AppLayout><div className="min-h-screen flex items-center justify-center text-gray-700">Carregando autenticação...</div></AppLayout>;
  }

  if (status === "unauthenticated") {
    // O redirecionamento já acontece no useEffect
    return null;
  }

  return (
    <AppLayout>
      <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 justify-between">
        <h1 className="text-2xl font-bold text-[#2d3748]">Clientes</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="group flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-md hover:from-blue-700 hover:to-blue-600 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
          aria-label="Adicionar novo cliente"
        >
          <span className="flex items-center justify-center">
            <Plus size={20} className="mr-1 group-hover:rotate-90 transition-transform duration-300" />
          </span>
          Novo Cliente
        </button>
      </header>

      <section className="flex-1 p-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-4" role="alert">
            <strong className="font-bold">Erro:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {loading && <div className="text-center text-gray-500 py-10">Carregando clientes...</div>}

        {!loading && !error && clients.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            <p className="text-lg mb-2">Nenhum cliente encontrado.</p>
            <p>Clique em "Novo Cliente" para adicionar um.</p>
          </div>
        )}

        {!loading && !error && clients.length > 0 && (
          <div className="bg-white rounded-xl shadow border border-gray-100 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Telefone</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Endereço</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {clients.map((client) => (
                  <tr key={client.id} className="cursor-pointer hover:bg-gray-50 transition" onClick={() => setDetailClient(client)}>
                    <td className="px-6 py-4 whitespace-nowrap text-[#2d3748]">{client.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#2d3748]">{client.email || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#2d3748]">{client.phone || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#2d3748]">{client.address || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          client.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {client.isActive ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-start gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(client);
                          }}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          aria-label="Editar cliente"
                          title="Editar cliente"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(client.id);
                          }}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          aria-label="Excluir cliente"
                          title="Excluir cliente"
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
        )}
      </section>

      {/* Modal de Adicionar/Editar Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/10 transition-opacity animate-fade-in"
            aria-hidden="true"
            onClick={handleCloseModal}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg mx-4 animate-fade-in-up border border-gray-100">
            <button
              onClick={handleCloseModal}
              className="absolute top-5 right-5 p-2 hover:bg-gray-100 rounded-full transition focus:outline-none focus:ring-2 focus:ring-blue-300"
              aria-label="Fechar modal"
            >
              <X size={24} className="text-gray-600" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              {editingClient ? "Editar Cliente" : "Adicionar Novo Cliente"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 border ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 border ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent`}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 border ${
                    errors.address ? "border-red-500" : "border-gray-300"
                  } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent`}
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-500">{errors.address}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">Cliente Ativo</label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                  disabled={loading}
                >
                  {editingClient ? "Salvar Alterações" : "Adicionar Cliente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalhes do Cliente */}
      {detailClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/10 transition-opacity animate-fade-in"
            aria-hidden="true"
            onClick={() => setDetailClient(null)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg mx-4 animate-fade-in-up border border-gray-100">
            <button
              onClick={() => setDetailClient(null)}
              className="absolute top-5 right-5 p-2 hover:bg-gray-100 rounded-full transition focus:outline-none focus:ring-2 focus:ring-blue-300"
              aria-label="Fechar modal"
            >
              <X size={24} className="text-gray-600" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Detalhes do Cliente
            </h2>
            <div className="space-y-4 text-gray-700">
              <p><span className="font-semibold">Nome:</span> {detailClient.name}</p>
              <p><span className="font-semibold">Email:</span> {detailClient.email || 'N/A'}</p>
              <p><span className="font-semibold">Telefone:</span> {detailClient.phone || 'N/A'}</p>
              <p><span className="font-semibold">Endereço:</span> {detailClient.address || 'N/A'}</p>
              <p><span className="font-semibold">Status:</span> <span className={`px-3 py-1 rounded-full text-xs font-semibold ${detailClient.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{detailClient.isActive ? "Ativo" : "Inativo"}</span></p>
              <p><span className="font-semibold">Cadastrado em:</span> {new Date(detailClient.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => handleEdit(detailClient)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors font-medium border border-gray-200"
              >
                <Pencil size={18} className="inline-block mr-2" /> Editar
              </button>
              <button
                onClick={() => handleDelete(detailClient.id)}
                className="px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium"
              >
                <Trash2 size={18} className="inline-block mr-2" /> Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
} 