import { DefaultSession, DefaultUser } from "next-auth";
// import { DefaultAdapterUser } from "@auth/core/adapters"; // Remover esta importação

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: number; // No objeto de sessão, queremos o ID como number
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser { // Para o tipo User que vem do adaptador, o ID é string
    id: string; // O ID aqui é string, para corresponder ao que o NextAuth espera
  }
} 