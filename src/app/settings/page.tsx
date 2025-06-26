import AppLayout from "../components/AppLayout";
import React from "react";

export default function SettingsPage() {
  return (
    <AppLayout>
      <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 justify-between">
        <h1 className="text-2xl font-bold text-[#2d3748]">Configurações</h1>
      </header>
      <section className="flex-1 p-8">
        <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-[#2563eb] mb-4">Configurações do Sistema</h2>
          <p className="text-gray-600">Aqui você poderá ajustar as configurações da sua conta e do sistema.</p>
        </div>
      </section>
    </AppLayout>
  );
} 