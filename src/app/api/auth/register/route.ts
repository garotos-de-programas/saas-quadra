import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import generateToken from '@/utils/generateToken';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ message: 'Por favor, insira todos os campos' }, { status: 400 });
  }

  try {
    const userExists = await prisma.user.findUnique({ where: { email } });

    if (userExists) {
      return NextResponse.json({ message: 'Usuário já existe' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    if (user) {
      return NextResponse.json(
        {
          id: user.id,
          name: user.name,
          email: user.email,
          token: generateToken(user.id),
        },
        { status: 201 }
      );
    } else {
      return NextResponse.json({ message: 'Dados do usuário inválidos' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
} 