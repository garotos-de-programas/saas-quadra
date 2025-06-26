"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LogoutButton from "@/components/LogoutButton";
import {
  LayoutGrid,
  CalendarCheck2,
  Users2,
  BarChart2,
  Settings2,
  SquareStack,
  UserCircle,
  User,
  Settings,
  LayoutDashboard,
  CreditCard,
  LogOut,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Quadras",
    icon: CalendarCheck2,
    href: "/courts",
  },
  {
    title: "Clientes",
    icon: Users2,
    href: "/clients",
  },
  {
    title: "Pagamentos",
    icon: CreditCard,
    href: "/payments",
  },
  {
    title: "Relatórios",
    icon: BarChart2,
    href: "/reports",
  },
  {
    title: "Configurações",
    icon: Settings2,
    href: "/settings",
  },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { user } = useAuth();

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

  return (
    <div className="min-h-screen flex bg-[#f7f8fa]">
      {/* Sidebar clara */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col py-8 px-4 min-h-screen">
        <div className="flex items-center gap-2 mb-10">
          <SquareStack size={28} color="#2563eb" strokeWidth={2.2} />
          <span className="text-2xl font-bold tracking-tight text-[#2d3748]">QuadraFácil</span>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          {menuItems.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${pathname === item.href ? "bg-[#e8f0fe] text-[#2563eb] font-medium" : "hover:bg-[#f1f2f4] text-[#2d3748]"}`}
            >
              <item.icon size={20} color={pathname === item.href ? "#2563eb" : "#2d3748"} strokeWidth={2.2} />
              {item.title}
            </Link>
          ))}
        </nav>
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 justify-between">
          <div /> {/* Espaço para título da página, se necessário */}
          <div className="flex items-center gap-4">
            {/* Ícone de Configurações */}
            <Link href="/settings" className="p-2 rounded-full hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-blue-300" title="Configurações">
              <Settings size={22} color="#64748b" strokeWidth={2} />
            </Link>

            {/* Dropdown do Perfil */}
            <div className="relative" ref={profileRef}>
              <button
                className="w-9 h-9 rounded-full bg-[#e8f0fe] flex items-center justify-center font-bold text-lg text-[#2563eb] border border-gray-200 hover:shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-300"
                onClick={() => setProfileOpen((v) => !v)}
                aria-label="Abrir menu do perfil"
                type="button"
              >
                <User size={20} color="#2563eb" strokeWidth={2} />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50 animate-fade-in origin-top-right transform scale-95 opacity-0 transition-all duration-100 ease-out-back transform-gpu
                  data-[state=open]:scale-100 data-[state=open]:opacity-100">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <Link href="/settings" className="block px-4 py-2 text-[#2563eb] hover:bg-[#e8f0fe] rounded transition">
                    Configurações
                  </Link>
                  <div className="px-2 pt-2">
                    <LogoutButton className="w-full justify-center bg-red-50 hover:bg-red-100 text-red-600 font-semibold" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 flex flex-col min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
} 