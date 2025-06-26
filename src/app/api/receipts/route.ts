import prisma from '@/lib/prisma';
import { protect } from '@/utils/authMiddleware';
import { NextResponse, NextRequest } from 'next/server';
import { User, Receipt } from '@prisma/client'; // Importe User e Receipt do Prisma Client

export async function GET(req: NextRequest) {
  const userResult = await protect(req);

  if (userResult instanceof NextResponse) {
    return userResult; // Retorna a resposta de erro do middleware
  }

  const currentUser: User = userResult as User;

  try {
    // Buscar apenas os recebimentos do usuário autenticado
    const receipts = await prisma.receipt.findMany({
      where: { userId: currentUser.id },
      include: { client: true }, // Inclui os dados do cliente relacionado
      orderBy: { receivedDate: 'desc' },
    });
    return NextResponse.json(receipts, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const userResult = await protect(req);

  if (userResult instanceof NextResponse) {
    return userResult; // Retorna a resposta de erro do middleware
  }

  const currentUser: User = userResult as User;

  const { client, amount, currency, receivedDate, status, description, paymentMethod } = await req.json();

  if (!client || !amount || !currency || !receivedDate) {
    return NextResponse.json({ message: 'Por favor, insira todos os campos obrigatórios (cliente, valor, moeda, data de recebimento)' }, { status: 400 });
  }

  try {
    const receipt = await prisma.receipt.create({
      data: {
        userId: currentUser.id,
        clientId: client, // O ID do cliente agora é um número
        amount,
        currency,
        receivedDate,
        status: status || 'pending',
        description,
        paymentMethod,
      },
    });

    return NextResponse.json(receipt, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
} 