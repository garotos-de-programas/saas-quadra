import prisma from '@/lib/prisma';
import { protect } from '@/utils/authMiddleware';
import { NextResponse, NextRequest } from 'next/server';
import { User } from '@prisma/client';

// Obter um cliente por ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userResult = await protect(req);

  if (userResult instanceof NextResponse) {
    return userResult; // Retorna a resposta de erro do middleware
  }

  const currentUser: User = userResult as User;

  try {
    const client = await prisma.client.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!client) {
      return NextResponse.json({ message: 'Cliente não encontrado' }, { status: 404 });
    }

    // Verifica se o cliente pertence ao usuário autenticado
    if (client.userId !== currentUser.id) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 });
    }

    return NextResponse.json(client, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao buscar cliente:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// Atualizar um cliente por ID
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const userResult = await protect(req);

  if (userResult instanceof NextResponse) {
    return userResult; // Retorna a resposta de erro do middleware
  }

  const currentUser: User = userResult as User;

  const { name, email, phone, address, isActive } = await req.json();

  try {
    const client = await prisma.client.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!client) {
      return NextResponse.json({ message: 'Cliente não encontrado' }, { status: 404 });
    }

    // Verifica se o cliente pertence ao usuário autenticado
    if (client.userId !== currentUser.id) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 });
    }

    const updatedClient = await prisma.client.update({
      where: { id: parseInt(params.id) },
      data: {
        name,
        email,
        phone,
        address,
        isActive,
      },
    });

    return NextResponse.json(updatedClient, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao atualizar cliente:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// Deletar um cliente por ID
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const userResult = await protect(req);

  if (userResult instanceof NextResponse) {
    return userResult; // Retorna a resposta de erro do middleware
  }

  const currentUser: User = userResult as User;

  try {
    const client = await prisma.client.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!client) {
      return NextResponse.json({ message: 'Cliente não encontrado' }, { status: 404 });
    }

    // Verifica se o cliente pertence ao usuário autenticado
    if (client.userId !== currentUser.id) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 });
    }

    await prisma.client.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ message: 'Cliente removido' }, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao deletar cliente:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
} 