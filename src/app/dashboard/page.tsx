"use client";

import React, { useState, useRef } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  LayoutGrid,
  CalendarCheck2,
  Users2,
  BarChart2,
  Settings2,
  SquareStack,
  DollarSign,
  Layers,
  UserCircle,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import Link from "next/link";
import AppLayout from "../components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const metrics = [
  {
    label: "Agendamentos do Dia",
    value: 12,
    icon: <CalendarCheck2 size={28} color="#2d3748" strokeWidth={2.2} />,
  },
  {
    label: "Faturamento",
    value: "R$ 1.500,00",
    icon: <DollarSign size={28} color="#2d3748" strokeWidth={2.2} />,
  },
  {
    label: "Quadras Cadastradas",
    value: 5,
    icon: <Layers size={28} color="#2d3748" strokeWidth={2.2} />,
  },
];

const bookings = [
  { time: "08:00 - 09:00", court: "Quadra 1", client: "Carlos Silva", status: "Confirmado" },
  { time: "09:00 - 10:00", court: "Quadra 2", client: "Ana Souza", status: "Pendente" },
  { time: "10:00 - 11:00", court: "Quadra 1", client: "Lucas Mendes", status: "Confirmado" },
  { time: "11:00 - 12:00", court: "Quadra 3", client: "Mariana Costa", status: "Cancelado" },
  { time: "12:00 - 13:00", court: "Quadra 2", client: "Pedro Almeida", status: "Confirmado" },
];

const courts = ["Quadra 1", "Quadra 2", "Quadra 3"];
const statuses = ["Todos", "Confirmado", "Pendente", "Cancelado"];

// Dados mock para gráfico de linha de faturamento
const revenueData = {
  labels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
  datasets: [
    {
      label: "Faturamento (R$)",
      data: [200, 400, 350, 600, 800, 900, 500],
      borderColor: "#2563eb",
      backgroundColor: "rgba(37,99,235,0.1)",
      tension: 0.4,
      fill: true,
      pointRadius: 5,
      pointBackgroundColor: "#2563eb",
    },
  ],
};
const revenueOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: false },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: "#64748b", font: { size: 14, family: 'Manrope, Noto Sans, sans-serif' } },
    },
    y: {
      beginAtZero: true,
      grid: { color: "#e5e7eb" },
      ticks: { color: "#64748b", font: { size: 14, family: 'Manrope, Noto Sans, sans-serif' } },
      suggestedMax: 1000,
      stepSize: 200,
    },
  },
};

function statusColor(status: string) {
  switch (status) {
    case "Confirmado":
      return "bg-green-100 text-green-700";
    case "Pendente":
      return "bg-yellow-100 text-yellow-700";
    case "Cancelado":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function DashboardPage() {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [filterCourt, setFilterCourt] = useState("Todos");
  const [filterDate, setFilterDate] = useState("");

  // Fecha o dropdown ao clicar fora
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileOpen]);

  // Filtros aplicados
  const filteredBookings = bookings.filter((b) => {
    const statusOk = filterStatus === "Todos" || b.status === filterStatus;
    const courtOk = filterCourt === "Todos" || b.court === filterCourt;
    // Data não está implementada nos dados mock, mas pode ser usada futuramente
    return statusOk && courtOk;
  });

  // Gráfico de barras: agendamentos por quadra
  const chartData = {
    labels: courts,
    datasets: [
      {
        label: "Agendamentos",
        data: courts.map((court) => bookings.filter((b) => b.court === court).length),
        backgroundColor: "#2563eb",
        borderRadius: 8,
        barThickness: 40,
      },
    ],
  };
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#64748b", font: { size: 14, family: 'Manrope, Noto Sans, sans-serif' } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#e5e7eb" },
        ticks: { color: "#64748b", font: { size: 14, family: 'Manrope, Noto Sans, sans-serif' } },
        suggestedMax: 5,
        stepSize: 1,
      },
    },
  };

  // Gráfico de pizza: status dos agendamentos
  const statusCounts = [
    bookings.filter((b) => b.status === "Confirmado").length,
    bookings.filter((b) => b.status === "Pendente").length,
    bookings.filter((b) => b.status === "Cancelado").length,
  ];
  const pieData = {
    labels: ["Confirmado", "Pendente", "Cancelado"],
    datasets: [
      {
        data: statusCounts,
        backgroundColor: ["#22c55e", "#eab308", "#ef4444"],
        borderWidth: 1,
      },
    ],
  };
  const pieOptions = {
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
        labels: { color: "#64748b", font: { size: 14, family: 'Manrope, Noto Sans, sans-serif' } },
      },
    },
  };

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#2d3748] mb-2">Dashboard</h1>
            <p className="text-[#64748b]">Visão geral do seu negócio de quadras</p>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {metrics.map((metric, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#64748b] text-sm font-medium">{metric.label}</p>
                    <p className="text-2xl font-bold text-[#2d3748] mt-1">{metric.value}</p>
                  </div>
                  <div className="p-3 bg-[#e8f0fe] rounded-lg">{metric.icon}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Gráfico de Barras */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-[#2d3748] mb-4">Agendamentos por Quadra</h3>
              <div className="h-64">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* Gráfico de Pizza */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-[#2d3748] mb-4">Status dos Agendamentos</h3>
              <div className="h-64">
                <Pie data={pieData} options={pieOptions} />
              </div>
            </div>
          </div>

          {/* Gráfico de Linha */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
            <h3 className="text-lg font-semibold text-[#2d3748] mb-4">Faturamento Semanal</h3>
            <div className="h-64">
              <Line data={revenueData} options={revenueOptions} />
            </div>
          </div>

          {/* Tabela de Agendamentos */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h3 className="text-lg font-semibold text-[#2d3748]">Agendamentos Recentes</h3>
                <div className="flex flex-wrap gap-2">
                  {/* Filtros */}
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filterCourt}
                    onChange={(e) => setFilterCourt(e.target.value)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="Todos">Todas as Quadras</option>
                    {courts.map((court) => (
                      <option key={court} value={court}>
                        {court}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">Horário</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">Quadra</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((booking, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2d3748]">{booking.time}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2d3748]">{booking.court}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2d3748]">{booking.client}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
} 