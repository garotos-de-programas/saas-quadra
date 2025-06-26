import prisma from '@/lib/prisma';
import { protect } from '@/utils/authMiddleware';
import { NextResponse, NextRequest } from 'next/server';
import { User, Payment } from '@prisma/client'; // Importe User e Payment do Prisma Client

export async function GET(req: NextRequest) {
  const userResult = await protect(req);

  if (userResult instanceof NextResponse) {
    return userResult; // Retorna a resposta de erro do middleware
  }

  const currentUser: User = userResult as User;

  try {
    const payments = await prisma.payment.findMany({
      where: { userId: currentUser.id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(payments, { status: 200 });
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

  const { amount, currency, status, paymentMethodType, description, transactionId } = await req.json();

  if (!amount || !currency || !paymentMethodType) {
    return NextResponse.json({ message: 'Por favor, insira todos os campos obrigatórios (valor, moeda, tipo de método de pagamento)' }, { status: 400 });
  }

  try {
    const payment = await prisma.payment.create({
      data: {
        userId: currentUser.id,
        amount,
        currency,
        status: status || 'pending',
        paymentMethodType,
        description,
        transactionId,
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
} 