import prisma from '@/lib/prisma';
import { protect } from '@/utils/authMiddleware';
import { NextResponse, NextRequest } from 'next/server';
import { User, Payment } from '@prisma/client'; // Importe User e Payment do Prisma Client diretamente

// Obter um pagamento por ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userResult = await protect(req);

  if (userResult instanceof NextResponse) {
    return userResult; // Retorna a resposta de erro do middleware
  }

  const currentUser: User = userResult as User;

  try {
    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!payment) {
      return NextResponse.json({ message: 'Pagamento não encontrado' }, { status: 404 });
    }

    // Verifica se o pagamento pertence ao usuário autenticado
    if (payment.userId !== currentUser.id) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 });
    }

    return NextResponse.json(payment, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// Atualizar um pagamento por ID
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const userResult = await protect(req);

  if (userResult instanceof NextResponse) {
    return userResult; // Retorna a resposta de erro do middleware
  }

  const currentUser: User = userResult as User;

  const { amount, currency, status, paymentMethodType, description, transactionId } = await req.json();

  try {
    const updatedPayment = await prisma.payment.update({
      where: { id: parseInt(params.id) },
      data: {
        amount,
        currency,
        status,
        paymentMethodType,
        description,
        transactionId,
      },
    });

    if (!updatedPayment) {
      return NextResponse.json({ message: 'Pagamento não encontrado' }, { status: 404 });
    }

    // Verifica se o pagamento pertence ao usuário autenticado
    if (updatedPayment.userId !== currentUser.id) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 });
    }

    return NextResponse.json(updatedPayment, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// Deletar um pagamento por ID
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const userResult = await protect(req);

  if (userResult instanceof NextResponse) {
    return userResult; // Retorna a resposta de erro do middleware
  }

  const currentUser: User = userResult as User;

  try {
    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!payment) {
      return NextResponse.json({ message: 'Pagamento não encontrado' }, { status: 404 });
    }

    // Verifica se o pagamento pertence ao usuário autenticado
    if (payment.userId !== currentUser.id) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 403 });
    }

    await prisma.payment.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ message: 'Pagamento removido' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
} 