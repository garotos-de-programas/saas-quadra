import prisma from '@/lib/prisma';
import { protect } from '@/utils/authMiddleware';
import { NextResponse, NextRequest } from 'next/server';
import { User, Receipt } from '@prisma/client'; // Importe User e Receipt do Prisma Client

// Obter um recebimento por ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userResult = await protect(req);

  if (userResult instanceof NextResponse) {
    return userResult; // Retorna a resposta de erro do middleware
  }

  const currentUser: User = userResult as User;

  try {
    const receipt = await prisma.receipt.findUnique({
      where: { id: parseInt(params.id) },
      include: { client: true },
    });

    if (!receipt) {
      return NextResponse.json({ message: 'Recebimento não encontrado' }, { status: 404 });
    }

    // Verifica se o recebimento pertence ao usuário autenticado
    if (receipt.userId !== currentUser.id) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 });
    }

    return NextResponse.json(receipt, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// Atualizar um recebimento por ID
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const userResult = await protect(req);

  if (userResult instanceof NextResponse) {
    return userResult; // Retorna a resposta de erro do middleware
  }

  const currentUser: User = userResult as User;

  const { client, amount, currency, receivedDate, status, description, paymentMethod } = await req.json();

  try {
    const receipt = await prisma.receipt.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!receipt) {
      return NextResponse.json({ message: 'Recebimento não encontrado' }, { status: 404 });
    }

    // Verifica se o recebimento pertence ao usuário autenticado
    if (receipt.userId !== currentUser.id) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 });
    }

    const updatedReceipt = await prisma.receipt.update({
      where: { id: parseInt(params.id) },
      data: {
        clientId: client, // O ID do cliente agora é um número
        amount,
        currency,
        receivedDate,
        status,
        description,
        paymentMethod,
      },
    });

    return NextResponse.json(updatedReceipt, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// Deletar um recebimento por ID
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const userResult = await protect(req);

  if (userResult instanceof NextResponse) {
    return userResult; // Retorna a resposta de erro do middleware
  }

  const currentUser: User = userResult as User;

  try {
    const receipt = await prisma.receipt.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!receipt) {
      return NextResponse.json({ message: 'Recebimento não encontrado' }, { status: 404 });
    }

    // Verifica se o recebimento pertence ao usuário autenticado
    if (receipt.userId !== currentUser.id) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 });
    }

    await prisma.receipt.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ message: 'Recebimento removido' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
} 