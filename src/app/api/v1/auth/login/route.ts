import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/utils/prisma';
import { UserToken } from '@/utils/types';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, password } = body;

    if (!id || !password) {
      return NextResponse.json(
        { error: 'User ID and password are required' },
        { status: 400 }
      );
    }

    // Find the user by ID
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!user || user.active !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Cannot find user ID' },
        { status: 401 }
      );
    }

    // Compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid user ID or password' },
        { status: 401 }
      );
    }

    const userToken: UserToken = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // Generate a JWT
    const token = jwt.sign(
      userToken,
      process.env.JWT_SECRET!,
      { expiresIn: '12h' }
    );

    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
