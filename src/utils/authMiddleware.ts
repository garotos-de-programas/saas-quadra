import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma'; // Importe o cliente Prisma
import { User } from '@prisma/client'; // Importe o tipo User do Prisma

export const protect = async (req: NextRequest): Promise<User | NextResponse> => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ 
        message: 'Não autorizado - Sessão inválida' 
      }, { status: 401 });
    }

    // Buscar o usuário completo do banco de dados
    const user = await prisma.user.findUnique({
      where: { id: Number(session.user.id) },
    });

    if (!user) {
      return NextResponse.json({ 
        message: 'Usuário não encontrado no banco de dados' 
      }, { status: 404 });
    }

    // Verificar se o usuário ainda está ativo (você pode adicionar campos como isActive no schema)
    // if (!user.isActive) {
    //   return NextResponse.json({ 
    //     message: 'Usuário inativo' 
    //   }, { status: 403 });
    // }

    return user;
  } catch (error) {
    console.error('Erro na verificação de autenticação:', error);
    return NextResponse.json({ 
      message: 'Erro interno do servidor' 
    }, { status: 500 });
  }
};

// Middleware para verificar se o usuário tem permissões específicas
export const requireRole = (allowedRoles: string[]) => {
  return async (req: NextRequest): Promise<User | NextResponse> => {
    const user = await protect(req);
    
    if (user instanceof NextResponse) {
      return user;
    }

    // Aqui você pode implementar verificação de roles
    // Por exemplo, se você tiver um campo role no seu schema:
    // if (!allowedRoles.includes(user.role)) {
    //   return NextResponse.json({ 
    //     message: 'Acesso negado - Permissão insuficiente' 
    //   }, { status: 403 });
    // }

    return user;
  };
}; 