"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "../components/AppLayout";
import CreditCardForm from "../components/CreditCardForm";
import PixForm from "../components/PixForm";
import BankTransferForm from "../components/BankTransferForm";
import PixQRCode from "../components/PixQRCode";
import CreditCardDetails from "../components/CreditCardDetails";
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  CreditCardIcon,
  Wallet,
  Banknote,
  AlertCircle,
  X,
  Pencil,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import axios from "axios";

// Interfaces para os dados (atualizadas para corresponder ao backend IPayment)
interface PaymentMethod {
  _id: string;
  type: "credit_card" | "pix" | "bank_transfer";
  name: string;
  status: "pending" | "completed" | "failed" | "active" | "inactive"; // Status adicionados do backend
  user: string; // ID do usuário associado
  amount: number;
  currency: string;
  description?: string;
  transactionId?: string; // ID da transação do Stripe ou outro gateway
  createdAt: string;
  updatedAt: string;
  // Propriedades específicas de cartão de crédito
  lastFour?: string;
  expiryDate?: string;
  brand?: string;
  cardName?: string;
  cardNumber?: string;
  // Propriedades específicas de PIX
  key?: string;
  pixType?: string;
  // Propriedades específicas de transferência bancária
  bank?: string;
  agency?: string;
  account?: string;
  accountType?: string;
  beneficiaryName?: string;
  cpfCnpj?: string;
}

interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  paymentMethod: string;
  client: string;
}

export default function PaymentsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]); // Manter por enquanto, sem API de transações
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para modais
  const [showAddMethodModal, setShowAddMethodModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showTransactionDetailsModal, setShowTransactionDetailsModal] =
    useState(false);
  const [showPixQRCodeModal, setShowPixQRCodeModal] = useState(false);

  // Dados selecionados para modais
  const [selectedMethodType, setSelectedMethodType] = useState<
    "credit_card" | "pix" | "bank_transfer" | ""
  >("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(null);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [pixQRCodeData, setPixQRCodeData] = useState<any>(null); // Dados para o QR Code PIX

  // Estados para filtros e busca
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("all"); // 'all', 'today', 'week', 'month'
  const [showFilters, setShowFilters] = useState(false);

  // Proteção de rota e carregamento de dados
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }

    if (user && !authLoading) {
      fetchPayments();
    }
  }, [user, authLoading, router]);

  // Função para buscar pagamentos da API
  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/api/payments");
      setPaymentMethods(res.data);
    } catch (err: any) {
      console.error("Erro ao buscar pagamentos:", err);
      setError("Falha ao carregar pagamentos. Tente novamente.");
      // Se for erro de autenticação, redirecionar para o login
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // FUNÇÕES DE UTILIDADE
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "failed":
        return "bg-red-100 text-red-700";
      case "active": // Para PaymentMethod status
        return "bg-green-100 text-green-700";
      case "inactive": // Para PaymentMethod status
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Concluído";
      case "pending":
        return "Pendente";
      case "failed":
        return "Falhou";
      case "active":
        return "Ativo";
      case "inactive":
        return "Inativo";
      default:
        return status;
    }
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case "credit_card":
        return CreditCard;
      case "pix":
        return Wallet;
      case "bank_transfer":
        return Banknote;
      default:
        return CreditCard;
    }
  };

  // FUNÇÕES DE MANIPULAÇÃO DE MODAIS E DADOS
  const handleOpenAddMethodModal = () => {
    setSelectedMethodType(""); // Limpa o tipo selecionado ao abrir
    setShowAddMethodModal(true);
  };

  const handleCloseAllModals = () => {
    setShowAddMethodModal(false);
    setShowDetailsModal(false);
    setShowTransactionDetailsModal(false);
    setShowPixQRCodeModal(false);
    setSelectedPaymentMethod(null);
    setSelectedTransaction(null);
    setPixQRCodeData(null);
    setSelectedMethodType("");
  };

  const handleAddPaymentMethod = async (data: any) => {
    setError(null);
    try {
      const res = await axios.post("/api/payments", {
        ...data,
        user: user?._id, // Enviar o ID do usuário logado
        currency: "BRL", // Exemplo, pode ser dinâmico
        status: "active", // Exemplo, pode ser dinâmico
      });
      setPaymentMethods((prev) => [...prev, res.data]);
      handleCloseAllModals();
    } catch (err: any) {
      console.error("Erro ao adicionar método de pagamento:", err.response?.data?.message || err.message);
      setError("Falha ao adicionar método de pagamento. Verifique os dados.");
    }
  };

  const handleEditPaymentMethod = async (method: PaymentMethod) => {
    setError(null);
    try {
      const res = await axios.put(`/api/payments/${method._id}`, method);
      setPaymentMethods((prev) =>
        prev.map((pm) => (pm._id === method._id ? res.data : pm))
      );
      handleCloseAllModals();
    } catch (err: any) {
      console.error("Erro ao editar método de pagamento:", err.response?.data?.message || err.message);
      setError("Falha ao editar método de pagamento. Tente novamente.");
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este método de pagamento?")) {
      setError(null);
      try {
        await axios.delete(`/api/payments/${id}`);
        setPaymentMethods((prev) => prev.filter((pm) => pm._id !== id));
        handleCloseAllModals();
      } catch (err: any) {
        console.error("Erro ao excluir método de pagamento:", err.response?.data?.message || err.message);
        setError("Falha ao excluir método de pagamento. Tente novamente.");
      }
    }
  };

  const handleOpenPaymentMethodDetails = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    setShowDetailsModal(true);
  };

  const handleOpenTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetailsModal(true);
  };

  // Filtros e Busca (mantidos, mas a lógica de filtragem precisaria ser ajustada para dados da API)
  const filteredMethods = paymentMethods.filter((method) =>
    method.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Efeito para fechar modais com a tecla ESC
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        handleCloseAllModals();
      }
    }

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  // Renderização condicional para carregamento e autenticação
  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-700">Carregando autenticação...</div>;
  }

  if (!user) {
    // O redirecionamento já acontece no useEffect
    return null;
  }

  return (
    <AppLayout>
      <div className="p-6 sm:p-10 space-y-6 flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Gerenciamento de Pagamentos</h1>
          <div className="flex items-center space-x-3">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Buscar pagamentos..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600"
            >
              <Filter size={20} />
            </button>
            <button
              onClick={handleOpenAddMethodModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2 font-medium shadow-md"
            >
              <Plus size={20} />
              <span>Novo Método</span>
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-down">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-200 appearance-none bg-white pr-10"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="completed">Concluído</option>
                <option value="pending">Pendente</option>
                <option value="failed">Falhou</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-200 appearance-none bg-white pr-10"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              >
                <option value="all">Todo o Período</option>
                <option value="today">Hoje</option>
                <option value="week">Última Semana</option>
                <option value="month">Último Mês</option>
              </select>
            </div>
            <div className="flex items-end justify-end">
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-md"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative" role="alert">
            <strong className="font-bold">Erro:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {loading && <div className="text-center text-gray-500">Carregando pagamentos...</div>}

        {!loading && !error && filteredMethods.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            <p className="text-lg mb-2">Nenhum método de pagamento encontrado.</p>
            <p>Clique em "Novo Método" para adicionar um.</p>
          </div>
        )}

        {!loading && !error && filteredMethods.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMethods.map((method) => (
              <div
                key={method._id}
                className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col justify-between cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => handleOpenPaymentMethodDetails(method)}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-gray-800">{method.name}</span>
                    {React.createElement(getPaymentMethodIcon(method.type), { size: 24, className: "text-gray-500" })}
                  </div>
                  <p className="text-gray-600 text-sm mb-1">
                    {method.type === "credit_card" && `Final ${method.lastFour}`}
                    {method.type === "pix" && `Chave: ${method.key?.substring(0, 15)}...`}
                    {method.type === "bank_transfer" && `Banco: ${method.bank}`}
                  </p>
                  <p className="text-gray-600 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(method.status || 'active')}`}>{getStatusText(method.status || 'active')}</span>
                  </p>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditPaymentMethod(method);
                    }}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                    aria-label="Editar método de pagamento"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePaymentMethod(method._id);
                    }}
                    className="p-2 rounded-full hover:bg-red-100 text-red-600 transition-colors"
                    aria-label="Excluir método de pagamento"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Histórico de Transações</h2>

        {/* Tabela de Transações (mantida, sem API de transações ainda) */}
        {transactions.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            <p className="text-lg mb-2">Nenhuma transação encontrada.</p>
            <p>As transações serão exibidas aqui após o registro.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleOpenTransactionDetails(transaction)}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatDate(transaction.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{transaction.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{transaction.client}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 flex items-center gap-2">
                      {React.createElement(getPaymentMethodIcon(transaction.paymentMethod), { size: 18, className: "text-gray-500" })}
                      {transaction.paymentMethod === "credit_card" && "Cartão de Crédito"}
                      {transaction.paymentMethod === "pix" && "PIX"}
                      {transaction.paymentMethod === "bank_transfer" && "Transferência Bancária"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{formatCurrency(transaction.amount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                        {getStatusText(transaction.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a href="#" className="text-blue-600 hover:text-blue-900">Ver Detalhes</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MODAL: Adicionar/Editar Método de Pagamento (Genérico) */}
        {showAddMethodModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/10 transition-opacity animate-fade-in"
              aria-hidden="true"
              onClick={handleCloseAllModals}
            />
            <div className="relative bg-white rounded-3xl shadow-2xl p-12 w-full max-w-lg mx-4 animate-fade-in-up border border-gray-100 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div className="w-6 h-6"></div> {/* Placeholder para alinhar o título ao centro */}
                <h2 className="text-2xl font-bold text-gray-900 text-center flex-grow">
                  Adicionar Novo Método de Pagamento
                </h2>
                <button
                  onClick={handleCloseAllModals}
                  className="p-2 hover:bg-gray-100 rounded-full transition focus:outline-none focus:ring-2 focus:ring-blue-300"
                  aria-label="Fechar modal"
                >
                  <X size={24} className="text-gray-600" />
                </button>
              </div>

              {!selectedMethodType ? (
                <div className="space-y-5">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Pagamento
                    </label>
                    <select
                      value={selectedMethodType}
                      onChange={(e) =>
                        setSelectedMethodType(
                          e.target.value as "credit_card" | "pix" | "bank_transfer"
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-200 appearance-none bg-white pr-10"
                    >
                      <option value="">Selecione o tipo</option>
                      <option value="credit_card">Cartão de Crédito</option>
                      <option value="pix">PIX</option>
                      <option value="bank_transfer">Transferência Bancária</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <ChevronDown size={20} className="text-gray-400" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={handleCloseAllModals}
                      className="px-6 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto pr-2 -mr-2"> {/* Adicionado scroll */}
                  {selectedMethodType === "credit_card" && (
                    <CreditCardForm
                      onSubmit={handleAddPaymentMethod}
                      onCancel={() => setSelectedMethodType("")}
                    />
                  )}
                  {selectedMethodType === "pix" && (
                    <PixForm
                      onSubmit={handleAddPaymentMethod}
                      onCancel={() => setSelectedMethodType("")}
                    />
                  )}
                  {selectedMethodType === "bank_transfer" && (
                    <BankTransferForm
                      onSubmit={handleAddPaymentMethod}
                      onCancel={() => setSelectedMethodType("")}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL: Detalhes do Método de Pagamento (Genérico) */}
        {showDetailsModal && selectedPaymentMethod && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/10 transition-opacity animate-fade-in"
              aria-hidden="true"
              onClick={handleCloseAllModals}
            />
            <div className="relative bg-white rounded-3xl shadow-2xl p-12 w-full max-w-lg mx-4 animate-fade-in-up border border-gray-100 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div className="w-6 h-6"></div> {/* Placeholder para alinhar o título ao centro */}
                <h2 className="text-2xl font-bold text-gray-900 text-center flex-grow">
                  Detalhes do {selectedPaymentMethod.name}
                </h2>
                <button
                  onClick={handleCloseAllModals}
                  className="p-2 hover:bg-gray-100 rounded-full transition focus:outline-none focus:ring-2 focus:ring-blue-300"
                  aria-label="Fechar modal"
                >
                  <X size={24} className="text-gray-600" />
                </button>
              </div>

              <div className="space-y-6 text-gray-700 flex-1 overflow-y-auto pr-2 -mr-2">
                {selectedPaymentMethod.type === "credit_card" && (
                  <CreditCardDetails
                    cardData={selectedPaymentMethod as any}
                    onEdit={() => handleEditPaymentMethod(selectedPaymentMethod)}
                    onDelete={() => handleDeletePaymentMethod(selectedPaymentMethod._id)}
                    onClose={handleCloseAllModals}
                  />
                )}
                {selectedPaymentMethod.type === "pix" && (
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Informações PIX</h3>
                    <div className="space-y-3 text-gray-700">
                      <p><span className="font-semibold">Chave PIX:</span> <span className="font-medium text-blue-600 break-words">{selectedPaymentMethod.key}</span></p>
                      <p><span className="font-semibold">Tipo de Chave:</span> {selectedPaymentMethod.pixType}</p>
                      <p><span className="font-semibold">Status:</span> <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedPaymentMethod.status || 'active')}`}>{getStatusText(selectedPaymentMethod.status || 'active')}</span></p>
                      {selectedPaymentMethod.amount && <p><span className="font-semibold">Valor Exemplo:</span> {formatCurrency(selectedPaymentMethod.amount)}</p>}
                    </div>
                    <div className="mt-8 flex justify-end gap-3">
                      <button
                        onClick={() => handleEditPaymentMethod(selectedPaymentMethod)}
                        className="px-6 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors font-medium border border-gray-200"
                      >
                        <Pencil size={18} className="inline-block mr-2" /> Editar
                      </button>
                      <button
                        onClick={() => handleDeletePaymentMethod(selectedPaymentMethod._id)}
                        className="px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium"
                      >
                        <Trash2 size={18} className="inline-block mr-2" /> Excluir
                      </button>
                    </div>
                  </div>
                )}
                {selectedPaymentMethod.type === "bank_transfer" && (
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Informações de Transferência Bancária</h3>
                    <div className="space-y-3 text-gray-700">
                      <p><span className="font-semibold">Banco:</span> {selectedPaymentMethod.bank}</p>
                      <p><span className="font-semibold">Agência:</span> {selectedPaymentMethod.agency}</p>
                      <p><span className="font-semibold">Conta:</span> {selectedPaymentMethod.account}</p>
                      <p><span className="font-semibold">Tipo de Conta:</span> {selectedPaymentMethod.accountType}</p>
                      <p><span className="font-semibold">Beneficiário:</span> {selectedPaymentMethod.beneficiaryName}</p>
                      <p><span className="font-semibold">CPF/CNPJ:</span> {selectedPaymentMethod.cpfCnpj}</p>
                      <p><span className="font-semibold">Status:</span> <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedPaymentMethod.status || 'active')}`}>{getStatusText(selectedPaymentMethod.status || 'active')}</span></p>
                    </div>
                    <div className="mt-8 flex justify-end gap-3">
                      <button
                        onClick={() => handleEditPaymentMethod(selectedPaymentMethod)}
                        className="px-6 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors font-medium border border-gray-200"
                      >
                        <Pencil size={18} className="inline-block mr-2" /> Editar
                      </button>
                      <button
                        onClick={() => handleDeletePaymentMethod(selectedPaymentMethod._id)}
                        className="px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium"
                      >
                        <Trash2 size={18} className="inline-block mr-2" /> Excluir
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Detalhes da Transação */}
        {showTransactionDetailsModal && selectedTransaction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/10 transition-opacity animate-fade-in"
              aria-hidden="true"
              onClick={handleCloseAllModals}
            />
            <div className="relative bg-white rounded-3xl shadow-2xl p-12 w-full max-w-lg mx-4 animate-fade-in-up border border-gray-100 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div className="w-6 h-6"></div> {/* Placeholder para alinhar o título ao centro */}
                <h2 className="text-2xl font-bold text-gray-900 text-center flex-grow">
                  Detalhes da Transação
                </h2>
                <button
                  onClick={handleCloseAllModals}
                  className="p-2 hover:bg-gray-100 rounded-full transition focus:outline-none focus:ring-2 focus:ring-blue-300"
                  aria-label="Fechar modal"
                >
                  <X size={24} className="text-gray-600" />
                </button>
              </div>
              <div className="space-y-4 text-gray-700 flex-1 overflow-y-auto pr-2 -mr-2">
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Informações da Transação</h3>
                  <div className="space-y-3 text-gray-700">
                    <p><span className="font-semibold">Data:</span> {formatDate(selectedTransaction.date)}</p>
                    <p><span className="font-semibold">Descrição:</span> {selectedTransaction.description}</p>
                    <p><span className="font-semibold">Cliente:</span> {selectedTransaction.client}</p>
                    <p><span className="font-semibold">Valor:</span> {formatCurrency(selectedTransaction.amount)}</p>
                    <p><span className="font-semibold">Status:</span> <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedTransaction.status)}`}>{getStatusText(selectedTransaction.status)}</span></p>
                    <p><span className="font-semibold">Método de Pagamento:</span>
                      <div className="flex items-center gap-2 mt-1">
                        {React.createElement(getPaymentMethodIcon(selectedTransaction.paymentMethod), { size: 18, className: "text-gray-500" })}
                        <span className="text-gray-800">
                          {selectedTransaction.paymentMethod === "credit_card" && "Cartão de Crédito"}
                          {selectedTransaction.paymentMethod === "pix" && "PIX"}
                          {selectedTransaction.paymentMethod === "bank_transfer" && "Transferência Bancária"}
                        </span>
                      </div>
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleCloseAllModals}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: QR Code PIX (Apenas para geração e visualização, não para detalhes de métodos salvos) */}
        {showPixQRCodeModal && pixQRCodeData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/10 transition-opacity animate-fade-in"
              aria-hidden="true"
              onClick={handleCloseAllModals}
            />
            <div className="relative bg-white rounded-3xl shadow-2xl p-12 w-full max-w-lg mx-4 animate-fade-in-up border border-gray-100 flex flex-col items-center">
              <div className="flex justify-between items-center mb-6">
                <div className="w-6 h-6"></div> {/* Placeholder para alinhar o título ao centro */}
                <h2 className="text-2xl font-bold text-gray-900 text-center flex-grow">
                  QR Code PIX Gerado
                </h2>
                <button
                  onClick={handleCloseAllModals}
                  className="p-2 hover:bg-gray-100 rounded-full transition focus:outline-none focus:ring-2 focus:ring-blue-300"
                  aria-label="Fechar modal"
                >
                  <X size={24} className="text-gray-600" />
                </button>
              </div>
              <div className="mb-6">
                <PixQRCode
                  pixKey={pixQRCodeData.pixKey}
                  pixType={pixQRCodeData.pixType}
                  amount={pixQRCodeData.amount}
                />
              </div>
              <p className="text-gray-700 text-center mb-6">Escaneie o QR Code com seu aplicativo bancário para realizar o pagamento.</p>
              <button
                onClick={handleCloseAllModals}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
} 