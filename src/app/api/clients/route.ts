import prisma from '@/lib/prisma';
import { protect } from '@/utils/authMiddleware';
import { NextResponse, NextRequest } from 'next/server';
import { User } from '@prisma/client';

export async function GET(req: NextRequest) {
  const userResult = await protect(req);

  if (userResult instanceof NextResponse) {
    return userResult; // Retorna a resposta de erro do middleware
  }

  const currentUser: User = userResult as User;

  try {
    const clients = await prisma.client.findMany({
      where: { userId: currentUser.id }, // Assume que o cliente tem um userId
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(clients, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao buscar clientes:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const userResult = await protect(req);

  if (userResult instanceof NextResponse) {
    return userResult; // Retorna a resposta de erro do middleware
  }

  const currentUser: User = userResult as User;

  const { name, email, phone, address, isActive } = await req.json();

  if (!name) {
    return NextResponse.json({ message: 'Por favor, adicione o nome do cliente' }, { status: 400 });
  }

  try {
    const client = await prisma.client.create({
      data: {
        userId: currentUser.id, // Associa o cliente ao usuário autenticado
        name,
        email,
        phone,
        address,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar cliente:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
} 